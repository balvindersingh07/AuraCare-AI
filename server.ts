import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

// Deterministic fallback evaluation logic
function generateFallbackEvaluation(
  name: string,
  address: string,
  pincode: string,
  city: string,
  orderValue: number
) {
  const cleanName = (name || '').toLowerCase().trim();
  const cleanAddr = (address || '').toLowerCase().trim();

  // 1. Name check for test / bot / placeholder patterns
  const isFakeName = 
    /asdf|test|demo|xyz|ghjkl|user|qwerty|sample|none|null|fake|dummy/i.test(cleanName) ||
    cleanName.length < 3 ||
    /^([a-zA-Z])\1{2,}$/.test(cleanName);

  // 2. Hinglish markers
  const hinglishMarkers = [
    'ke paas', 'ke pass', 'ke samne', 'ke peeche', 'ke piche', 
    'wali gali', 'makan no', 'dukan', 'mandir', 'basti', 'chhat', 'chouraha'
  ];
  const isHinglish = hinglishMarkers.some(m => cleanAddr.includes(m));

  // 3. Landmark & House check
  const hasHouse = /(flat|house|makan|plot|h\.?no|door|room|apt|apartment|sector|phase|ward|lane|gali|block|building)/i.test(cleanAddr);
  const hasLandmark = /(near|opp|opposite|behind|beside|front|paas|pass|samne|peeche|temple|mandir|school|hospital|station|market|bank|park)/i.test(cleanAddr);

  let addressQuality: 'high' | 'medium' | 'low' | 'suspicious' = 'high';
  if (cleanAddr.length < 12 || /(asdf|qwerty|test|xyz|123 fake|12345)/i.test(cleanAddr)) {
    addressQuality = 'suspicious';
  } else if (!hasHouse && !hasLandmark && cleanAddr.length < 32) {
    addressQuality = 'low';
  } else if (!hasHouse || !hasLandmark) {
    addressQuality = 'medium';
  } else {
    addressQuality = 'high';
  }

  let recommendedAction: 'Ship as-is' | 'Ship after confirmation' | 'Nudge to prepaid' | 'Hold / cancel' = 'Ship as-is';
  let plainEnglishReason = '';

  if (isFakeName || addressQuality === 'suspicious') {
    recommendedAction = 'Hold / cancel';
    plainEnglishReason = isFakeName
      ? `Flagged for hold: Suspicious bot/test customer name ("${name}"). Immediate hold avoids courier loss.`
      : `Flagged for hold: Incoherent or placeholder delivery address with near-zero courier deliverability.`;
  } else if (addressQuality === 'low' || orderValue >= 999) {
    recommendedAction = 'Nudge to prepaid';
    plainEnglishReason = addressQuality === 'low'
      ? `Elevated risk: Vague delivery address lacking flat/house number and recognizable landmark. Nudge to prepaid.`
      : `Elevated risk: High basket value (₹${orderValue}) on COD. Nudge to prepaid with discount to confirm purchase intent.`;
  } else if (addressQuality === 'medium' || isHinglish) {
    recommendedAction = 'Ship after confirmation';
    plainEnglishReason = isHinglish
      ? `Colloquial Hinglish landmark detected ('${hinglishMarkers.filter(m => cleanAddr.includes(m)).join(', ')}'). Requires quick 1-click WhatsApp verification.`
      : `Missing specific house or landmark detail. Automated WhatsApp confirmation required before warehouse packing.`;
  } else {
    recommendedAction = 'Ship as-is';
    plainEnglishReason = `Well-structured address with clear unit number, street, and landmark. Auto-cleared for immediate dispatch.`;
  }

  return {
    isFakeName,
    addressQuality,
    isHinglish,
    landmarkIdentified: hasLandmark || isHinglish,
    confidenceScore: isFakeName || addressQuality === 'suspicious' ? 95 : (isHinglish ? 88 : 92),
    plainEnglishReason,
    recommendedAction,
  };
}

// LLM Analysis Endpoint
app.post('/api/analyze-order-gemini', async (req, res) => {
  const body = req.body || {};
  const order = body.order || {};
  const name = body.name || order.customerName || order.customer_name || '';
  const address = body.address || order.address || '';
  const pincode = body.pincode || order.pincode || '';
  const city = body.city || order.city || '';
  const orderValue = Number(body.orderValue || order.orderValue || order.order_value) || 649;
  const numValue = orderValue;

  // Retrieve backend API key
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey || geminiApiKey.trim() === '' || geminiApiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      success: true,
      source: 'fallback',
      evaluation: generateFallbackEvaluation(name, address, pincode, city, numValue),
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const prompt = `You are an expert logistics and RTO (Return to Origin) risk auditor for an Indian D2C haircare brand.
Analyze this Cash on Delivery (COD) order:
- Customer Name: "${name}"
- Shipping Address: "${address}"
- City & Pincode: ${city} (${pincode})
- Order Value: ₹${numValue}

Evaluate strictly where LLMs excel:
1. Is the customer name legitimate or a fake/bot/placeholder name (like 'asdf', 'test', keyboard mash)?
2. Address deliverability: Does it have an identifiable flat/house number and street/landmark?
3. Detect if it contains Hinglish colloquial directions (e.g., 'mandir ke peeche', 'dukan ke pass') and whether a courier boy can navigate it.
4. Provide a brief 1-sentence plain-English verdict for warehouse operations.

Respond in strict JSON with format:
{
  "isFakeName": boolean,
  "addressQuality": "high" | "medium" | "low" | "suspicious",
  "isHinglish": boolean,
  "landmarkIdentified": boolean,
  "confidenceScore": number,
  "plainEnglishReason": "string explanation",
  "recommendedAction": "Ship as-is" | "Ship after confirmation" | "Nudge to prepaid" | "Hold / cancel"
}`;

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    // 6-second timeout race to prevent network hangs
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Gemini API timeout')), 6000)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);
    const text = response.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = generateFallbackEvaluation(name, address, pincode, city, numValue);
    }

    return res.json({
      success: true,
      source: 'gemini',
      evaluation: parsed,
    });
  } catch (error: any) {
    console.error('Gemini API call failed, falling back to deterministic evaluation. Error:', error?.message);
    
    return res.json({
      success: true,
      source: 'fallback',
      evaluation: generateFallbackEvaluation(name, address, pincode, city, numValue),
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = parseInt(process.env.PORT || '3000', 10);

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`AuraCare RTO Engine server running on http://0.0.0.0:${port}`);
  });
}

startServer();
