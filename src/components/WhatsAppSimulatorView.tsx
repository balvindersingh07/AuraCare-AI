import React, { useState } from 'react';
import { Order, BASE_UNIT_ECONOMICS } from '../types';
import { 
  MessageSquare, 
  Send, 
  Check, 
  CheckCheck, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  CreditCard, 
  RotateCcw,
  Languages,
  DollarSign,
  HelpCircle,
  PhoneCall
} from 'lucide-react';

interface WhatsAppSimulatorViewProps {
  initialOrder?: Order | null;
}

type FlowType = 'confirm' | 'nudge';
type LanguageType = 'english' | 'hinglish' | 'hindi';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user' | 'system';
  text: string;
  timestamp: string;
}

export const WhatsAppSimulatorView: React.FC<WhatsAppSimulatorViewProps> = ({ initialOrder }) => {
  const [selectedFlow, setSelectedFlow] = useState<FlowType>('confirm');
  const [language, setLanguage] = useState<LanguageType>('hinglish');
  const [inputText, setInputText] = useState('');
  const [orderStatus, setOrderStatus] = useState<'pending' | 'confirmed' | 'cancelled' | 'prepaid' | 'timed_out'>('pending');

  const demoOrder = initialOrder || {
    order_id: 'ORD-1042',
    order_date: new Date().toISOString(),
    customer_name: 'Pooja Verma',
    phone: '9876543210',
    address: 'Gali no 4, Peepal ped ke paas, Shiv Mandir ke peeche',
    city: 'Patna',
    state: 'Bihar',
    pincode: '800001',
    order_value: 649,
    items_count: 2,
    customer_type: 'first_time',
    prior_rto_count: 0,
    prior_delivered_count: 0,
    payment_method: 'COD',
    delivery_status: 'Delivered',
  };

  // Pre-configured message templates
  const getInitialBotMessage = (flow: FlowType, lang: LanguageType): string => {
    if (flow === 'confirm') {
      if (lang === 'hinglish') {
        return `Namaste ${demoOrder.customer_name} ji! 🙏\n\nAuraCare Haircare se aapka Cash on Delivery order *#${demoOrder.order_id}* (Total: ₹${demoOrder.order_value}) receive ho gaya hai.\n\n📍 Delivery Address:\n"${demoOrder.address}, ${demoOrder.city} - ${demoOrder.pincode}"\n\nKya ye address sahi hai aur delivery ke samay cash ready rahega? Kripya niche diye buttons se confirm karein taaki hum dispatch kar sakein:`;
      } else if (lang === 'hindi') {
        return `नमस्ते ${demoOrder.customer_name} जी! 🙏\n\nऑराकेयर से आपका कैश ऑन डिलीवरी ऑर्डर *#${demoOrder.order_id}* (कुल: ₹${demoOrder.order_value}) प्राप्त हुआ है।\n\n📍 डिलीवरी पता:\n"${demoOrder.address}, ${demoOrder.city} - ${demoOrder.pincode}"\n\nकृपया नीचे दिए गए बटन से पुष्टि करें ताकि हम आज ही डिस्पैच कर सकें:`;
      }
      return `Hi ${demoOrder.customer_name}! 👋\n\nThank you for choosing AuraCare Haircare. We received your COD order *#${demoOrder.order_id}* for ₹${demoOrder.order_value}.\n\n📍 Shipping Address:\n"${demoOrder.address}, ${demoOrder.city} - ${demoOrder.pincode}"\n\nPlease confirm your delivery below so our warehouse can pack and ship it right away:`;
    } else {
      // Nudge to prepaid flow
      if (lang === 'hinglish') {
        return `Namaste ${demoOrder.customer_name} ji! 🌿\n\nAapke order *#${demoOrder.order_id}* par ek exclusive offer hai! 🎁\n\nAgar aap abhi UPI / Online pay karte hain, toh aapko milta hai:\n🔥 *FLAT ₹50 OFF* (Pay only ₹${demoOrder.order_value - 50})\n✨ *Priority Express Shipping*\n🎁 *Free Scalp Massager Gift*\n\nNiche click karke 1-click UPI se pay karein:`;
      } else if (lang === 'hindi') {
        return `नमस्ते ${demoOrder.customer_name} जी! 🌿\n\nआपके ऑर्डर *#${demoOrder.order_id}* पर विशेष ऑफर है! 🎁\n\nऑनलाइन/UPI भुगतान पर पाएं:\n🔥 *फ्लैट ₹50 की छूट* (मात्र ₹${demoOrder.order_value - 50} का भुगतान)\n✨ *प्राथमिकता एक्सप्रेस डिलीवरी*\n\nसुरक्षित UPI से भुगतान के लिए नीचे क्लिक करें:`;
      }
      return `Hello ${demoOrder.customer_name}! 🌿\n\nExclusive prepaid perk for your AuraCare order *#${demoOrder.order_id}*!\n\nSwitch to online payment now to unlock:\n🔥 *FLAT ₹50 INSTANT DISCOUNT* (Pay only ₹${demoOrder.order_value - 50})\n✨ *Express Warehouse Dispatch*\n🎁 *Free Anti-Frizz Mini Serum*\n\nTap below to complete safe 1-click UPI payment:`;
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: getInitialBotMessage('confirm', 'hinglish'),
      timestamp: '10:02 AM',
    }
  ]);

  const resetChat = (flow: FlowType, lang: LanguageType) => {
    setSelectedFlow(flow);
    setLanguage(lang);
    setOrderStatus('pending');
    setMessages([
      {
        id: '1',
        sender: 'bot',
        text: getInitialBotMessage(flow, lang),
        timestamp: '10:02 AM',
      }
    ]);
  };

  const handleUserReply = (replyText: string, actionType?: 'confirm' | 'cancel' | 'prepaid' | 'address') => {
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: replyText,
      timestamp: '10:03 AM',
    };

    let botResponseText = '';
    let newStatus: typeof orderStatus = 'pending';

    if (actionType === 'confirm' || /yes|ha|haan|sahi|confirm|bhejo/i.test(replyText)) {
      newStatus = 'confirmed';
      botResponseText = language === 'hinglish'
        ? `Shukriya ${demoOrder.customer_name} ji! 🎉 Aapka order confirm ho gaya hai aur aaj shaam warehouse se dispatch ho jayega. Courier tracking link jald hi SMS/WhatsApp par aayega.`
        : language === 'hindi'
        ? `धन्यवाद! 🎉 आपका ऑर्डर कन्फर्म हो गया है और आज ही डिस्पैच किया जा रहा है। ट्रैकिंग लिंक शीघ्र भेजा जाएगा।`
        : `Thank you! 🎉 Your order #${demoOrder.order_id} is verified and queued for immediate dispatch. Tracking details will follow shortly.`;
    } else if (actionType === 'cancel' || /no|nahi|cancel|mat bhejo/i.test(replyText)) {
      newStatus = 'cancelled';
      botResponseText = language === 'hinglish'
        ? `Koi baat nahi! Order #${demoOrder.order_id} cancel kar diya gaya hai. Koi charges nahi lagenge. Agar aapko future mein koi madad chahiye toh humein batayein!`
        : language === 'hindi'
        ? `आपका ऑर्डर #${demoOrder.order_id} रद्द कर दिया गया है। भविष्य में सहायता के लिए हम सदैव उपलब्ध हैं।`
        : `No problem at all! Order #${demoOrder.order_id} has been cancelled per your request. No cancellation fees apply.`;
    } else if (actionType === 'prepaid' || /pay|upi|online|discount/i.test(replyText)) {
      newStatus = 'prepaid';
      botResponseText = language === 'hinglish'
        ? `🎊 Badhaai ho! ₹${demoOrder.order_value - 50} ka UPI payment safaltapoorvak receive ho gaya hai. Aapka order ab PREPAID status par switch kar diya gaya hai. Free Scalp Massager pack kar diya gaya hai!`
        : language === 'hindi'
        ? `🎊 बधाई! ₹${demoOrder.order_value - 50} का UPI भुगतान प्राप्त हो गया है। आपका ऑर्डर अब प्रीपेड के रूप में भेजा जाएगा।`
        : `🎊 Payment Confirmed! Received ₹${demoOrder.order_value - 50} via UPI. Your order #${demoOrder.order_id} is now Prepaid with priority express fulfillment.`;
    } else if (actionType === 'address' || /address|landmark|gali|makan/i.test(replyText)) {
      botResponseText = language === 'hinglish'
        ? `Kripya apna updated address ya specific landmark yahan type karein taaki delivery agent bina kisi dikkat ke pahunch sake:`
        : `Please reply with your updated landmark or house number so our courier partner can navigate easily:`;
    } else {
      // Intelligent fallback for random customer chatter
      botResponseText = language === 'hinglish'
        ? `Samajh gaya! Humare products 100% genuine aur dermatologically tested hain. Delivery 2 se 4 dino mein ho jayegi. Kripya confirm karein ki hum ise dispatch karein ya cancel?`
        : `Got it! Delivery usually takes 2-4 business days. Please let us know if we should proceed with shipping or cancel this order?`;
    }

    setOrderStatus(newStatus);
    setMessages(prev => [
      ...prev,
      userMsg,
      {
        id: String(Date.now() + 1),
        sender: 'bot',
        text: botResponseText,
        timestamp: '10:04 AM',
      }
    ]);
    setInputText('');
  };

  const handleSimulateTimeout = () => {
    setOrderStatus('timed_out');
    setMessages(prev => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'system',
        text: '⏱️ [System SLA Trigger: 24 Hours Elapsed with No Reply]\nAutomated Action: Order placed ON HOLD in Shopify. Packing suspended to prevent ₹169.40 courier freight loss. Follow-up SMS sent with self-service confirmation link.',
        timestamp: 'T+24 Hours',
      }
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              Part 8: Automated WhatsApp Confirmation Flow
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Interactive WhatsApp Simulator & SLA Policy
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Live mock of outbound confirmation triggers, prepaid discount conversion, multi-lingual vernacular templates, quick action buttons, and 24-hour timeout handling.
            </p>
          </div>

          {/* Flow Mode Switcher */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => resetChat('confirm', language)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedFlow === 'confirm'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Flow A: COD Confirmation
            </button>
            <button
              onClick={() => resetChat('nudge', language)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedFlow === 'nudge'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Flow B: Prepaid Conversion (₹50 Off)
            </button>
          </div>
        </div>

        {/* Timing and Language bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Language:</span>
            {(['hinglish', 'english', 'hindi'] as LanguageType[]).map((lang) => (
              <button
                key={lang}
                onClick={() => resetChat(selectedFlow, lang)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  language === lang
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Trigger Timing: <strong>T+2 min post-checkout</strong>
            </span>
            <button
              onClick={() => resetChat(selectedFlow, language)}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-900"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Chat
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Phone Simulator on left, Matrix and Math on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Smartphone Simulator Container (5 cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-800 relative">
            {/* Phone Speaker Notch */}
            <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
            </div>

            {/* WhatsApp App Frame */}
            <div className="bg-[#0b141a] rounded-[2rem] overflow-hidden flex flex-col h-[550px] border border-slate-800">
              {/* WhatsApp Green Header */}
              <div className="bg-[#1f2c34] px-4 py-2.5 flex items-center justify-between text-white border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                    AC
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-xs text-white">AuraCare</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-[10px] text-emerald-400">Official Business</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono">
                  {orderStatus === 'confirmed' ? (
                    <span className="text-emerald-400 font-bold">● Confirmed</span>
                  ) : orderStatus === 'prepaid' ? (
                    <span className="text-blue-400 font-bold">● Paid Online</span>
                  ) : orderStatus === 'cancelled' ? (
                    <span className="text-red-400 font-bold">● Cancelled</span>
                  ) : orderStatus === 'timed_out' ? (
                    <span className="text-amber-400 font-bold">● Held (Timeout)</span>
                  ) : (
                    <span className="text-slate-400">Awaiting Reply</span>
                  )}
                </div>
              </div>

              {/* Chat Message Stream */}
              <div 
                className="flex-1 p-3 overflow-y-auto space-y-3 text-xs"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.25) 0%, transparent 100%)`
                }}
              >
                <div className="text-center my-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#182229] text-[9px] text-slate-400">
                    Messages are end-to-end encrypted
                  </span>
                </div>

                {messages.map((msg) => {
                  if (msg.sender === 'system') {
                    return (
                      <div key={msg.id} className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-[11px] leading-relaxed">
                        {msg.text}
                      </div>
                    );
                  }

                  const isBot = msg.sender === 'bot';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-line text-[11.5px] leading-relaxed shadow-sm ${
                          isBot
                            ? 'bg-[#202c33] text-[#e9edef] rounded-tl-none border border-slate-700/40'
                            : 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                        }`}
                      >
                        {msg.text}
                        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                          <span>{msg.timestamp}</span>
                          {!isBot && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons Pad */}
              <div className="p-2.5 bg-[#182229] border-t border-slate-800 space-y-2">
                <div className="text-[10px] text-slate-400 font-semibold px-1">Customer Interactive Responses:</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {selectedFlow === 'confirm' ? (
                    <>
                      <button
                        onClick={() => handleUserReply('Yes, confirm my order please', 'confirm')}
                        disabled={orderStatus !== 'pending'}
                        className="px-2 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 disabled:opacity-40"
                      >
                        ✅ "Yes, Confirm"
                      </button>
                      <button
                        onClick={() => handleUserReply('No, please cancel this order', 'cancel')}
                        disabled={orderStatus !== 'pending'}
                        className="px-2 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 text-[10px] font-bold border border-red-500/40 disabled:opacity-40"
                      >
                        ❌ "No, Cancel"
                      </button>
                      <button
                        onClick={() => handleUserReply('Address mein landmark add karna hai', 'address')}
                        disabled={orderStatus !== 'pending'}
                        className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700 disabled:opacity-40"
                      >
                        📍 Update Address
                      </button>
                      <button
                        onClick={handleSimulateTimeout}
                        disabled={orderStatus !== 'pending'}
                        className="px-2 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 text-[10px] border border-amber-500/40 disabled:opacity-40"
                      >
                        ⏱️ Simulate 24h Timeout
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleUserReply('I want to pay online via UPI with ₹50 discount', 'prepaid')}
                        disabled={orderStatus !== 'pending'}
                        className="col-span-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> 💳 Pay ₹599 Online (Save ₹50)
                      </button>
                      <button
                        onClick={() => handleUserReply('No keep it COD only', 'confirm')}
                        disabled={orderStatus !== 'pending'}
                        className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700 disabled:opacity-40"
                      >
                        Keep as COD
                      </button>
                      <button
                        onClick={handleSimulateTimeout}
                        disabled={orderStatus !== 'pending'}
                        className="px-2 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 text-[10px] border border-amber-500/40 disabled:opacity-40"
                      >
                        ⏱️ 24h No Response
                      </button>
                    </>
                  )}
                </div>

                {/* Custom text input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inputText.trim()) handleUserReply(inputText);
                  }}
                  className="flex items-center gap-1.5 mt-1"
                >
                  <input
                    type="text"
                    placeholder="Type custom customer reply..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-[#2a3942] text-white text-xs px-3 py-1.5 rounded-full placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: SLA Policy & Decision Matrix (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Response Handling & 24h SLA Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              WhatsApp Response & 24-Hour SLA Execution Matrix
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Deterministic operational workflows triggered by customer interaction events:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <th className="py-2.5 px-3 font-semibold">Customer Response</th>
                    <th className="py-2.5 px-3 font-semibold">Immediate Bot Action</th>
                    <th className="py-2.5 px-3 font-semibold">Shopify / WMS Tag</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Rupee Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">Replies "YES"</td>
                    <td className="py-2.5 px-3">Sends packing ETA & courier tracking link</td>
                    <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold">READY_TO_PACK</span></td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">+₹402.38 Margin</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-red-600">Replies "NO"</td>
                    <td className="py-2.5 px-3">Polite cancellation receipt + feedback prompt</td>
                    <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-mono font-bold">CANCELLED_BY_BUYER</span></td>
                    <td className="py-2.5 px-3 text-right font-bold text-teal-700">+₹169.40 Saved</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-blue-700">Accepts Prepaid Nudge</td>
                    <td className="py-2.5 px-3">Instant UPI payment link + free gift confirmation</td>
                    <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold">PAID_EXPRESS</span></td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-700">+₹352.38 Margin</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-amber-600">Random / Conversational</td>
                    <td className="py-2.5 px-3">LLM classifies intent or asks 1 clarifying question</td>
                    <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-mono font-bold">AGENT_REVIEW</span></td>
                    <td className="py-2.5 px-3 text-right text-slate-600">Friction avoided</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-500">No Reply in 24 Hours</td>
                    <td className="py-2.5 px-3">Reminder at T+12h; auto-hold at T+24h</td>
                    <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold">UNREACHABLE_HELD</span></td>
                    <td className="py-2.5 px-3 text-right font-bold text-teal-700">+₹169.40 Saved</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card: Why WhatsApp Confirmation Works */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3 text-xs text-slate-600 leading-relaxed">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-blue-600" />
              Why WhatsApp Confirmation Outperforms Phone Calls
            </h4>
            <p>
              In Indian D2C e-commerce, manual tele-calling teams have a <strong>32% call connection rate</strong> (customers ignore unknown numbers). WhatsApp Business API achieves an <strong>88%+ open rate</strong> and allows customers to confirm with 1 tap at their convenience.
            </p>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
              <strong>Data Evidence:</strong> When an uncommitted impulse buyer receives the WhatsApp confirmation, <strong>78% of genuine buyers reply YES within 3 hours</strong>, while uncommitted buyers simply cancel or ignore, allowing the brand to halt shipment before incurring ₹130 forward/return courier charges!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
