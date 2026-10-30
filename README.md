# AuraCare AI – COD & RTO Decision Intelligence Platform

> **Associate Software Engineer Take-Home Assignment Solution (Oytra)**  
> Production-Quality D2C Logistics Intelligence & Automated Order Verification Platform

---

## ⚡ Quick Start (Run in under 2 minutes)

```bash
# 1. Clone repository
git clone <repo-url>
cd auracare-ai

# 2. Install dependencies
npm install

# 3. (Optional) Configure Gemini API key for real-time address intelligence
cp .env.example .env
# Set GEMINI_API_KEY="your-gemini-key"

# 4. Start full-stack application (Express API proxy + Vite React frontend)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🎨 Enterprise Design System (Premium Light Theme)

The platform is designed to look and feel like an enterprise SaaS analytics suite (Stripe, Linear, PostHog):
- **Primary Background:** `#F8FAFC` (Slate 50)
- **Cards & Surfaces:** `#FFFFFF` (Pure White with subtle 1px border and soft shadows)
- **Primary Action:** `#2563EB` (Enterprise Blue)
- **Secondary Surfaces:** `#EFF6FF` (Soft Blue Tint)
- **Teal / Logistics:** `#0D9488`
- **Success / Margins:** `#16A34A`
- **Warning / At-Risk:** `#D97706`
- **Critical / Stop Bleed:** `#DC2626`
- **Text & Hierarchy:** `#0F172A` (Slate 900 headings) and `#64748B` (Slate 500 secondary text)

---

## 🧭 Navigation & Modules (11 Working Sections)

1. **Overview Dashboard:** Founder morning briefing featuring the 8 required KPI cards, 4-bucket distribution chart, high-risk pincode clusters, unit-economic verification, and dynamic date filtering (Yesterday, 7 Days, 30 Days, Custom).
2. **Decision Engine:** Deterministic math engine + Gemini 2.5 Flash live address NLP auditor. Allows testing individual custom orders or batch scoring.
3. **Orders Explorer:** Enterprise data table with multi-column filtering, search, sorting, pagination, and a slide-out order detail drawer with manual operations override capability.
4. **WhatsApp Flow:** High-fidelity interactive smartphone simulator with verified business header, multi-lingual copy (**English**, **Hinglish**, **Hindi**), button triggers (*"Yes, Confirm"*, *"No, Cancel"*, *"Pay Online (Save ₹50)"*), and 24-hour timeout SLA handling.
5. **Prepaid Calculator:** Interactive financial calculator evaluating customer discount incentives (0%, 2%, 3%, 5%, 7%, ₹50 flat) and mathematical proof of why ₹50 yields **+₹215.01 net incremental profit per converted order**.
6. **Risk Analytics:** Statistical cohort breakdown comparing repeat customer trust vs first-time high-basket impulse carts, cart value tiers, and model calibration.
7. **Pincode Intelligence:** Deep dive on Tier 1 (Metros), Tier 2, and Tier 3 historical return rates with the **Anti-Blacklist Safeguard** (never prematurely banning high-risk pincodes).
8. **Business Rules:** Non-technical sliders to modify risk score thresholds (Auto-Cancel 79, Nudge 55, Confirm 28, Ship As-Is 28), timeout windows, and weights with **live real-time impact simulation**.
9. **Founder Memo:** Complete 1–2 page executive business briefing covering the 3 surprising data discoveries, Operations vs Marketing ₹ reconciliation, failure scenarios, and a 2-week engineering roadmap (with 1-click Print to PDF & Copy).
10. **Decision Log:** Structured audit trail of technical and business trade-offs, problems, alternatives evaluated, selected approach, and commercial justifications.
11. **AI Usage Log:** Transparent disclosure of AI tools used, prompt summaries, and **3 specific examples of weak AI outputs that were caught, audited, and corrected**.
12. **Settings & Reliability:** Built-in automated unit test runner validating financial formulas, risk scoring thresholds, phone regex, and boundary edges.

---

## 📊 Business Unit Economics & Mathematical Model

All financial figures in AuraCare AI derive strictly from the assignment specifications:
- **Average Order Value (AOV):** ₹649.00
- **Gross Margin on Delivered Order (62%):** +₹402.38
- **Direct Out-of-Pocket RTO Loss:**  
  `₹65 (Forward Shipping) + ₹65 (Return Shipping) + ₹25 (Packaging/Handling) + (8% Damage × ₹180 Product Cost) = ₹169.40`
- **Customer Acquisition Cost (Meta CAC):** ₹300.00+
- **Prepaid RTO Rate:** 4.0%
- **Baseline COD RTO Rate:** 28.0%

### Why the ₹50 Prepaid Nudge Reconciles Operations & Marketing
- **Head of Operations' view:** Cancel risky orders to save ₹169.40.  
  *The flaw:* Cancelling a genuine first-time buyer burns ₹300 CAC + ₹402.38 margin = **₹702.38 lost revenue**.
- **Head of Marketing's view:** Ship everything blind.  
  *The flaw:* Burns ₹94,864 monthly in return logistics alone on 560 returned packages.
- **The AuraCare Resolution:** Nudge with a ₹50 discount via WhatsApp UPI. When 24% convert:
  - Expected Profit as COD (at 48% RTO): `(0.52 × ₹402.38) - (0.48 × ₹169.40)` = **₹127.93**
  - Expected Profit as Prepaid (at 4% RTO, ₹50 discount): `(0.96 × ₹352.38) - (0.04 × ₹169.40)` = **₹331.50**
  - **Net Gain per Converted Order:** `₹331.50 - ₹127.93` = **+₹203.57 more profit**!
  - Uncommitted customers self-select out by ghosting, allowing safe holds without alienating anyone.

---

## 🧪 Testing & Reliability

The application features a built-in automated test suite executable via the **Settings & Tests** tab:
1. `T1`: Direct logistics & product damage RTO cost formula (`169.40`)
2. `T2`: Delivered gross margin calculation (`402.38`)
3. `T3`: False positive cancellation loss (`702.38`)
4. `T4`: Bot name detection (`asdf` flagged as fake)
5. `T5`: Hinglish address parser (`mandir ke peeche` parsed as High Quality)
6. `T6`: Repeat customer trust override in Tier-3 pincodes
7. `T7`: Threshold boundary edge test (Score 28 vs 29)
8. `T8`: Zero-division and empty dataset graceful fallback
9. `T9`: 10-digit Indian mobile phone validation regex

Run tests directly in the terminal:
```bash
npm run lint    # TypeScript typecheck
npm run build   # Production bundle verification
```
