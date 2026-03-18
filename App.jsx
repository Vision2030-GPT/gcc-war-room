import { useState, useEffect, useRef, useCallback } from "react";
import {
  Shield, AlertTriangle, Plane, Ship, MapPin, ChevronDown, ChevronRight,
  Menu, X, Search, RefreshCw, Send, Activity, Zap, Globe,
  CheckCircle, XCircle, BarChart3, Crosshair, Wifi, Building,
  DollarSign, FileText, Navigation, Loader2, ChevronUp,
  ExternalLink, MessageSquare, Newspaper, Home, BookOpen, Bot, Radar,
  Droplets, Fuel, Heart, Phone,
  Check
} from "lucide-react";

// ─── API CONFIG ──────────────────────────────────────────────────────────────
const API_URL = "/api/chat";
const apiHeaders = () => ({ "Content-Type": "application/json" });

const REPORT_DATE = "March 18, 2026";
const CONFLICT_DAY = 18;

// ─── CENTRALIZED CONFLICT DATA (update ONE place for daily changes) ──────────
const CONFLICT_DATA = {
  day: CONFLICT_DAY,
  date: REPORT_DATE,
  startDate: "February 28, 2026",
  status: "Active conflict, no ceasefire, no negotiations",
  missiles: { ballistic: 298, cruise: 15, drones: 1606, total: 1919 },
  casualties: { killed: 8, injured: 145, debrisInjuries: 131, touristCasualties: 0 },
  interceptionRate: "90-94%",
  hormuz: { traffic: "-94%", status: "Effectively closed" },
  oil: { current: "$104+", preWar: "$67" },
  dfm: "-30%",
  hotels: "-60%+",
  emirates: { capacity: "~60%", destinations: "~110" },
  sovereignWealth: "$1.3T+",
  aedPeg: "3.6725",
  advisories: {
    us: "Level 3 — Reconsider Travel",
    uk: "Against all but essential travel",
    australia: "DO NOT TRAVEL (highest level)",
    canada: "Avoid All Travel",
  },
  whatChangedToday: [
    "Day 18: Israel launches wide-scale strikes on Tehran",
    "UAE briefly closes airspace for new attack wave",
    "Total projectiles at UAE now 1,919 (up from 1,797)",
    "UAE casualties updated: 8 killed, 145 injured",
    "No ceasefire talks. No diplomatic channels open.",
  ],
};


// ─── LANGUAGE SYSTEM ────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇦🇪" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "ur", label: "اردو", flag: "🇵🇰" },
  { code: "tl", label: "Filipino", flag: "🇵🇭" },
  { code: "bn", label: "বাংলা", flag: "🇧🇩" },
  { code: "ml", label: "മലയാളം", flag: "🇮🇳" },
  { code: "fa", label: "فارسی", flag: "🇮🇷" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

const T = {
  en: { dashboard: "Dashboard", analysis: "Full Analysis", ai: "AI Analyst", intel: "Live Intel", emergency: "Emergency", tweets: "Live Tweets", shouldigo: "Should I Go?", riskLevel: "Risk Level", leaveNow: "LEAVE IMMEDIATELY", day: "Day", noceasefire: "No Ceasefire", signals: "Key Signals", verdict: "Verdict", conflictDay: "Conflict Day", since: "Since Feb 28", projectiles: "Projectiles at UAE", intercept: "Intercept Rate", depleting: "Depleting daily", hormuz: "Hormuz Traffic", nearZero: "Near zero transits", casualties: "UAE Casualties", killed: "Killed", injured: "Injured", oil: "Oil Price", ceasefire: "Ceasefire", noTalks: "No talks · No channel", safeReturn: "Safe Return", earliest: "Earliest Q3 2026", signalSummary: "Signal Summary", extracted: "extracted", critical: "Critical", warning: "Warning", stable: "Stable", info: "Info", riskByDomain: "Risk by Domain", departure: "IMMEDIATE DEPARTURE RECOMMENDED", departureDesc: "Both reports: active war zone. Leave now while commercial flights remain.", selectLocation: "Select your location for localized risk assessment", country: "Country", city: "City", localRisk: "Local Risk Assessment", distToStrike: "Distance to nearest confirmed strike", distToTarget: "Distance to nearest declared target", localAdvisory: "Advisory", shelterNote: "Shelter guidance", evacuationRoute: "Primary evacuation route", allGCC: "All GCC (Overview)" },
  ar: { dashboard: "لوحة القيادة", analysis: "التحليل الكامل", ai: "محلل الذكاء", intel: "معلومات مباشرة", emergency: "طوارئ", tweets: "تغريدات مباشرة", shouldigo: "هل أذهب؟", riskLevel: "مستوى الخطر", leaveNow: "غادر فوراً", day: "يوم", noceasefire: "لا وقف لإطلاق النار", signals: "إشارات رئيسية", verdict: "الحكم", conflictDay: "يوم النزاع", since: "منذ ٢٨ فبراير", projectiles: "مقذوفات على الإمارات", intercept: "معدل الاعتراض", depleting: "يتناقص يومياً", hormuz: "حركة هرمز", nearZero: "قرب الصفر", casualties: "ضحايا الإمارات", killed: "قتلى", injured: "جرحى", oil: "سعر النفط", ceasefire: "وقف إطلاق النار", noTalks: "لا محادثات", safeReturn: "العودة الآمنة", earliest: "أقرب وقت Q3 2026", signalSummary: "ملخص الإشارات", extracted: "مستخرجة", critical: "حرج", warning: "تحذير", stable: "مستقر", info: "معلومات", riskByDomain: "المخاطر حسب المجال", departure: "يوصى بالمغادرة الفورية", departureDesc: "كلا التقريرين: منطقة حرب نشطة. غادر الآن.", selectLocation: "اختر موقعك لتقييم المخاطر المحلية", country: "الدولة", city: "المدينة", localRisk: "تقييم المخاطر المحلية", distToStrike: "المسافة إلى أقرب ضربة مؤكدة", distToTarget: "المسافة إلى أقرب هدف معلن", localAdvisory: "التحذير", shelterNote: "إرشادات الملجأ", evacuationRoute: "مسار الإخلاء الرئيسي", allGCC: "جميع دول الخليج" },
  hi: { dashboard: "डैशबोर्ड", analysis: "पूर्ण विश्लेषण", ai: "AI विश्लेषक", intel: "लाइव इंटेल", emergency: "आपातकाल", shouldigo: "क्या मैं जाऊं?", riskLevel: "जोखिम स्तर", leaveNow: "तुरंत निकलें", day: "दिन", noceasefire: "कोई युद्धविराम नहीं", signals: "प्रमुख संकेत", verdict: "निर्णय", conflictDay: "संघर्ष का दिन", since: "28 फ़रवरी से", projectiles: "UAE पर प्रक्षेपास्त्र", intercept: "अवरोधन दर", depleting: "दैनिक कमी", hormuz: "होर्मुज़ यातायात", nearZero: "लगभग शून्य", casualties: "UAE हताहत", killed: "मृत", injured: "घायल", oil: "तेल की कीमत", ceasefire: "युद्धविराम", noTalks: "कोई वार्ता नहीं", safeReturn: "सुरक्षित वापसी", earliest: "जल्द से जल्द Q3 2026", signalSummary: "संकेत सारांश", extracted: "निकाले गए", critical: "गंभीर", warning: "चेतावनी", stable: "स्थिर", info: "जानकारी", riskByDomain: "क्षेत्र अनुसार जोखिम", departure: "तत्काल प्रस्थान की सिफारिश", departureDesc: "दोनों रिपोर्ट: सक्रिय युद्ध क्षेत्र। अभी निकलें।", selectLocation: "स्थानीय जोखिम के लिए अपना स्थान चुनें", country: "देश", city: "शहर", localRisk: "स्थानीय जोखिम", distToStrike: "निकटतम हमले की दूरी", distToTarget: "निकटतम लक्ष्य की दूरी", localAdvisory: "सलाह", shelterNote: "आश्रय मार्गदर्शन", evacuationRoute: "निकासी मार्ग", allGCC: "सभी GCC (अवलोकन)" },
  ur: { dashboard: "ڈیش بورڈ", analysis: "مکمل تجزیہ", ai: "AI تجزیہ کار", intel: "لائیو انٹیل", emergency: "ایمرجنسی", shouldigo: "کیا مجھے جانا چاہیے؟", riskLevel: "خطرے کی سطح", leaveNow: "فوری طور پر نکلیں", day: "دن", noceasefire: "جنگ بندی نہیں", signals: "اہم اشارے", verdict: "فیصلہ", conflictDay: "تنازعے کا دن", since: "28 فروری سے", projectiles: "UAE پر میزائل", intercept: "روک کی شرح", depleting: "روزانہ کمی", hormuz: "ہرمز ٹریفک", nearZero: "تقریباً صفر", casualties: "UAE ہلاکتیں", killed: "ہلاک", injured: "زخمی", oil: "تیل کی قیمت", ceasefire: "جنگ بندی", noTalks: "کوئی مذاکرات نہیں", safeReturn: "محفوظ واپسی", earliest: "جلد از جلد Q3 2026", signalSummary: "اشارے کا خلاصہ", extracted: "نکالے گئے", critical: "سنگین", warning: "انتباہ", stable: "مستحکم", info: "معلومات", riskByDomain: "شعبے کے مطابق خطرہ", departure: "فوری روانگی کی سفارش", departureDesc: "دونوں رپورٹیں: فعال جنگی علاقہ۔ ابھی نکلیں۔", selectLocation: "مقامی خطرے کے لیے اپنا مقام منتخب کریں", country: "ملک", city: "شہر", localRisk: "مقامی خطرے کا جائزہ", distToStrike: "قریب ترین حملے کا فاصلہ", distToTarget: "قریب ترین ہدف کا فاصلہ", localAdvisory: "مشورہ", shelterNote: "پناہ گاہ ہدایات", evacuationRoute: "انخلاء کا راستہ", allGCC: "تمام خلیجی ممالک" },
  tl: { dashboard: "Dashboard", analysis: "Buong Pagsusuri", ai: "AI Analyst", intel: "Live Intel", emergency: "Emergency", tweets: "Live Tweets", shouldigo: "Dapat Ba Akong Pumunta?", riskLevel: "Antas ng Panganib", leaveNow: "UMALIS AGAD", day: "Araw", noceasefire: "Walang ceasefire", signals: "Mga Senyales", verdict: "Hatol", conflictDay: "Araw ng labanan", since: "Mula Feb 28", projectiles: "Mga Projectile sa UAE", intercept: "Intercept Rate", depleting: "Bumababa araw-araw", hormuz: "Hormuz Traffic", nearZero: "Halos zero", casualties: "UAE Casualties", killed: "Namatay", injured: "Nasugatan", oil: "Presyo ng Langis", ceasefire: "Ceasefire", noTalks: "Walang usapan", safeReturn: "Ligtas na Balik", earliest: "Pinakamaagang Q3 2026", signalSummary: "Buod ng Senyales", extracted: "nakuha", critical: "Kritikal", warning: "Babala", stable: "Stable", info: "Info", riskByDomain: "Panganib ayon sa Larangan", departure: "INIREREKOMENDANG UMALIS AGAD", departureDesc: "Parehong ulat: aktibong war zone. Umalis na.", selectLocation: "Pumili ng lokasyon", country: "Bansa", city: "Lungsod", localRisk: "Lokal na Panganib", allGCC: "Lahat ng GCC" },
  bn: { dashboard: "ড্যাশবোর্ড", analysis: "সম্পূর্ণ বিশ্লেষণ", ai: "AI বিশ্লেষক", intel: "লাইভ ইন্টেল", emergency: "জরুরি", shouldigo: "আমি কি যাব?", riskLevel: "ঝুঁকির মাত্রা", leaveNow: "এখনই চলে যান", day: "দিন", noceasefire: "যুদ্ধবিরতি নেই", signals: "মূল সংকেত", verdict: "রায়", departure: "অবিলম্বে প্রস্থানের সুপারিশ", departureDesc: "উভয় রিপোর্ট: সক্রিয় যুদ্ধক্ষেত্র। এখনই চলে যান।", selectLocation: "স্থানীয় ঝুঁকির জন্য আপনার অবস্থান নির্বাচন করুন", country: "দেশ", city: "শহর", allGCC: "সমস্ত GCC", conflictDay: "সংঘাতের দিন", since: "ফেব্রুয়ারি ২৮ থেকে", critical: "গুরুতর", warning: "সতর্কতা", stable: "স্থিতিশীল", info: "তথ্য" },
  ml: { dashboard: "ഡാഷ്ബോർഡ്", analysis: "പൂർണ വിശകലനം", ai: "AI അനലിസ്റ്റ്", intel: "ലൈവ് ഇന്റൽ", emergency: "അടിയന്തരം", shouldigo: "Should I Go?", riskLevel: "അപകട നില", leaveNow: "ഉടൻ പുറപ്പെടുക", day: "ദിവസം", noceasefire: "വെടിനിർത്തൽ ഇല്ല", signals: "പ്രധാന സിഗ്നലുകൾ", verdict: "വിധി", departure: "ഉടനടി പുറപ്പെടൽ ശുപാർശ", departureDesc: "രണ്ട് റിപ്പോർട്ടുകളും: സജീവ യുദ്ധമേഖല. ഇപ്പോൾ പുറപ്പെടുക.", country: "രാജ്യം", city: "നഗരം", allGCC: "മുഴുവൻ GCC", conflictDay: "സംഘർഷ ദിനം", critical: "ഗുരുതരം", warning: "മുന്നറിയിപ്പ്" },
  fa: { dashboard: "داشبورد", analysis: "تحلیل کامل", ai: "تحلیلگر هوش مصنوعی", intel: "اطلاعات زنده", emergency: "اضطراری", shouldigo: "آیا بروم؟", riskLevel: "سطح خطر", leaveNow: "فوراً خارج شوید", day: "روز", noceasefire: "بدون آتش‌بس", signals: "سیگنال‌های کلیدی", verdict: "حکم", departure: "توصیه به خروج فوری", departureDesc: "هر دو گزارش: منطقه جنگی فعال. همین الان خارج شوید.", country: "کشور", city: "شهر", allGCC: "همه شورای همکاری خلیج", conflictDay: "روز درگیری", critical: "بحرانی", warning: "هشدار" },
  fr: { dashboard: "Tableau de bord", analysis: "Analyse complète", ai: "Analyste IA", intel: "Renseignements", emergency: "Urgence", shouldigo: "Dois-je y aller ?", riskLevel: "Niveau de risque", leaveNow: "PARTEZ IMMÉDIATEMENT", day: "Jour", noceasefire: "Pas de cessez-le-feu", signals: "Signaux clés", verdict: "Verdict", departure: "DÉPART IMMÉDIAT RECOMMANDÉ", departureDesc: "Les deux rapports : zone de guerre active. Partez maintenant.", country: "Pays", city: "Ville", allGCC: "Tout le CCG", conflictDay: "Jour du conflit", critical: "Critique", warning: "Alerte", stable: "Stable", info: "Info" },
  zh: { dashboard: "仪表板", analysis: "完整分析", ai: "AI分析师", intel: "实时情报", emergency: "紧急", shouldigo: "我该去吗？", riskLevel: "风险等级", leaveNow: "立即撤离", day: "天", noceasefire: "无停火", signals: "关键信号", verdict: "判定", departure: "建议立即撤离", departureDesc: "两份报告一致：活跃战区。立即撤离。", country: "国家", city: "城市", allGCC: "所有海湾国家", conflictDay: "冲突天数", critical: "严重", warning: "警告", stable: "稳定", info: "信息" },
};

const t = (key, lang) => (T[lang] && T[lang][key]) || T.en[key] || key;

// ─── GCC COUNTRY / CITY DATA ────────────────────────────────────────────────

const GCC_DATA = {
  UAE: {
    name: "United Arab Emirates", flag: "🇦🇪", riskScore: 5, civilDefense: "NCEMA", defenseDesc: "National Emergency Crisis & Disasters Management Authority", emergency: "999", defensePerf: "90%+ interception rate, world-class THAAD/Patriot systems", pop: "11M", riskLabel: "EXTREME",
    advisory: "Level 5 — Immediate Civilian Danger. All Western governments say leave now.",
    cities: {
      "Dubai": { risk: 5, nearestStrike: "Palm Jumeirah / DIFC (multiple confirmed strikes)", nearestTarget: "Jebel Ali Port (~15–25 km, declared 'legitimate target')", shelter: "Interior corridors, stairwells, ground floor away from glass. No purpose-built bomb shelters.", evacRoute: "DXB Airport (struck 3×, intermittent) or drive to Muscat, Oman (~4.5h)", signal: "critical", notes: "Multiple strikes confirmed across Dubai: Palm Jumeirah, DIFC (2×), DXB Airport (3×), Burj Al Arab (debris), Jebel Ali (fire). Shelter-in-place alerts multiple times daily. Schools on remote learning." },
      "Abu Dhabi City": { risk: 5, nearestStrike: "Abu Dhabi Zayed Airport (1 killed, 7 wounded)", nearestTarget: "Al Dhafra Air Base (~32 km, repeatedly targeted)", shelter: "Follow NCEMA alerts. Interior rooms.", evacRoute: "Abu Dhabi Airport (intermittent) or drive to Al Ain/Oman", signal: "critical", notes: "Al Dhafra hosts 3,500–5,000 US personnel. AN/TPY-2 radar destroyed. Primary military target zone." },
      "Sharjah": { risk: 5, nearestStrike: "Sharjah residential areas & mall (3 killed, 58 injured)", nearestTarget: "Within confirmed strike zone", shelter: "NCEMA guidance. Interior corridors.", evacRoute: "DXB Airport or Sharjah Airport (limited)", signal: "critical", notes: "Confirmed civilian casualties. Residential areas directly struck." },
      "Fujairah": { risk: 5, nearestStrike: "Fujairah Oil Terminal (struck 4 times)", nearestTarget: "Oil terminal is active target", shelter: "Limited infrastructure. Evacuate if possible.", evacRoute: "Drive to Muscat (~2h) or Salalah", signal: "critical", notes: "Oil loading repeatedly suspended. Strategic oil storage facility under active bombardment." },
      "Al Ain": { risk: 4, nearestStrike: "Abu Dhabi (~120 km)", nearestTarget: "Al Dhafra (~150 km)", shelter: "NCEMA guidance. More distance from primary targets.", evacRoute: "Drive to Muscat via Hatta border (~2h)", signal: "warning", notes: "Furthest major UAE city from coast. Lower direct threat but within overall conflict zone." },
      "Ras Al Khaimah": { risk: 4, nearestStrike: "Sharjah (~50 km)", nearestTarget: "Military targets in wider UAE", shelter: "NCEMA guidance.", evacRoute: "Drive to Muscat via Oman border", signal: "warning", notes: "Northern emirate, less targeted but within Iranian missile range." },
    }
  },
  "Saudi Arabia": {
    name: "Saudi Arabia", flag: "🇸🇦", riskScore: 4, civilDefense: "Saudi Civil Defense", defenseDesc: "General Directorate of Civil Defense", emergency: "998", defensePerf: "Patriot systems active, vast territorial depth", pop: "36M", riskLabel: "HIGH",
    advisory: "Level 4 — Direct GCC Threat. Riyadh and eastern province struck. Ras Tanura ablaze.",
    cities: {
      "Riyadh": { risk: 4, nearestStrike: "Riyadh struck by Iranian missiles", nearestTarget: "Government and military sites", shelter: "Follow civil defense alerts.", evacRoute: "King Khalid Int'l Airport or drive to Jeddah/Yanbu", signal: "warning", notes: "Capital struck but has vast territorial depth. Less concentrated target zone than UAE." },
      "Jeddah": { risk: 3, nearestStrike: "Not directly struck yet", nearestTarget: "Yanbu oil port (~300 km north)", shelter: "Standard civil defense.", evacRoute: "King Abdulaziz Airport — Red Sea route", signal: "warning", notes: "Western coast, away from Gulf. But Yanbu rerouting makes Red Sea corridor Houthi-vulnerable." },
      "Dammam / Eastern Province": { risk: 4, nearestStrike: "Eastern province struck", nearestTarget: "Ras Tanura refinery (ablaze)", shelter: "Civil defense alerts.", evacRoute: "King Fahd Airport or drive to Riyadh/Bahrain", signal: "critical", notes: "Closest Saudi region to Iran. Oil infrastructure under direct threat." },
      "NEOM / Tabuk": { risk: 2, nearestStrike: "No confirmed strikes in NW", nearestTarget: "Far from primary targets", shelter: "Standard precautions.", evacRoute: "Regional airport or Jordan border", signal: "positive", notes: "Northwestern Saudi Arabia. Distance from Gulf provides buffer but Houthi range is a factor." },
    }
  },
  Bahrain: {
    name: "Bahrain", flag: "🇧🇭", riskScore: 5, civilDefense: "Bahrain Civil Defense", defenseDesc: "Ministry of Interior Civil Defense", emergency: "999", defensePerf: "US 5th Fleet provides defense umbrella, minimal strategic depth", pop: "1.5M", riskLabel: "EXTREME",
    advisory: "Level 5 — Major strikes on Bapco refinery and naval HQ. Negligible strategic depth.",
    cities: {
      "Manama": { risk: 5, nearestStrike: "Bapco refinery, naval HQ struck", nearestTarget: "US 5th Fleet HQ", shelter: "Smallest GCC state — limited options.", evacRoute: "Bahrain Airport or King Fahd Causeway to Saudi", signal: "critical", notes: "Negligible strategic depth. Entire country within blast radius of major strikes. US 5th Fleet HQ makes it priority target." },
    }
  },
  Qatar: {
    name: "Qatar", flag: "🇶🇦", riskScore: 4, civilDefense: "Qatar Civil Defense", defenseDesc: "Ministry of Interior", emergency: "999", defensePerf: "Al Udeid US base provides defense umbrella", pop: "3M", riskLabel: "HIGH",
    advisory: "Level 4 — 47 drones, 118 BMs intercepted. Al Udeid (largest US base) targeted. LNG halted.",
    cities: {
      "Doha": { risk: 4, nearestStrike: "Multiple interceptions over Qatar", nearestTarget: "Al Udeid Air Base (largest US base in region)", shelter: "Follow civil defense alerts.", evacRoute: "Hamad International Airport", signal: "warning", notes: "Al Udeid hosts largest US base. LNG force majeure declared March 4. Low strategic depth." },
    }
  },
  Kuwait: {
    name: "Kuwait", flag: "🇰🇼", riskScore: 4, civilDefense: "Kuwait Civil Defense", defenseDesc: "Kuwait Fire Service Directorate", emergency: "112", defensePerf: "Camp Arifjan US Army Central provides defense coordination", pop: "4.5M", riskLabel: "HIGH",
    advisory: "Level 4 — Airport struck. Camp Arifjan (US Army Central HQ) targeted.",
    cities: {
      "Kuwait City": { risk: 4, nearestStrike: "Kuwait Airport struck", nearestTarget: "Camp Arifjan (US Army Central)", shelter: "Civil defense guidance.", evacRoute: "Kuwait Airport (intermittent) or drive to Saudi/Iraq", signal: "warning", notes: "Moderate strategic depth. US Army Central HQ at Camp Arifjan is major target." },
    }
  },
  Oman: {
    name: "Oman", flag: "🇴🇲", riskScore: 3, civilDefense: "Oman NCSI", defenseDesc: "National Committee for Civil Defense", emergency: "9999", defensePerf: "Historically neutral, limited air defense", pop: "5M", riskLabel: "ELEVATED",
    advisory: "Level 3 — Historically neutral but struck for first time ever. 5 injured, 2 killed.",
    cities: {
      "Muscat": { risk: 3, nearestStrike: "Oman struck (first time ever) — 5 injured, 2 killed", nearestTarget: "Limited military targets", shelter: "Standard precautions.", evacRoute: "Muscat International Airport (operational)", signal: "warning", notes: "Key evacuation hub for UAE residents. Airport operational. ~4.5h drive from Dubai. Historically neutral but now in conflict." },
      "Salalah": { risk: 2, nearestStrike: "Far from confirmed strikes", nearestTarget: "Minimal military infrastructure", shelter: "Standard precautions.", evacRoute: "Salalah Airport (operational)", signal: "positive", notes: "Southern Oman, ~10h from Dubai. Greatest distance from Gulf conflict zone. Viable evacuation destination." },
    }
  },
  // ─── WIDER MIDDLE EAST ─────────────────────────────────────────
  Jordan: {
    name: "Jordan", flag: "🇯🇴", riskScore: 3, civilDefense: "Jordan Civil Defense", defenseDesc: "General Directorate of Civil Defense", emergency: "911", defensePerf: "Jordanian air force intercepting over Amman, US coordination", pop: "11M", riskLabel: "ELEVATED",
    advisory: "Level 3 — Airspace violations, missile interceptions over Amman. 28 injuries reported. US embassy staff evacuated.",
    cities: {
      "Amman": { risk: 3, nearestStrike: "Missile interceptions over Amman airspace", nearestTarget: "US military facilities in Jordan", shelter: "Follow civil defense alerts.", evacRoute: "Queen Alia International Airport (operational)", signal: "warning", notes: "Jordanian defenses intercepted missiles over Amman. 28 injuries, no deaths. US-Jordanian embassy evacuated. Jordan has geographic buffer but within Iranian missile range." },
      "Aqaba": { risk: 2, nearestStrike: "No confirmed strikes", nearestTarget: "Limited military presence", shelter: "Standard precautions.", evacRoute: "Aqaba Airport, land border to Israel/Egypt", signal: "positive", notes: "Southern Jordan, Red Sea coast. Distance from primary conflict zone. Tourism hub but Houthi Red Sea threat exists." },
    }
  },
  Iraq: {
    name: "Iraq", flag: "🇮🇶", riskScore: 4, civilDefense: "Iraq Civil Defense", defenseDesc: "Civil Defense Directorate", emergency: "115", defensePerf: "Complex multi-faction environment, US bases provide limited umbrella", pop: "44M", riskLabel: "HIGH",
    advisory: "Level 4 — 29 killed. Erbil Airport struck. PMF HQ targeted. Baghdad Green Zone explosions.",
    cities: {
      "Baghdad": { risk: 4, nearestStrike: "Green Zone explosions, PMF HQ struck", nearestTarget: "US Embassy compound, military sites", shelter: "Reinforced structures. Follow security advisories.", evacRoute: "Baghdad Airport (limited operations)", signal: "critical", notes: "Multiple explosions near Green Zone. Pro-Iran PMF forces targeted by US strikes. Complex multi-faction security environment." },
      "Erbil": { risk: 4, nearestStrike: "Erbil Airport directly struck", nearestTarget: "US/coalition military base at Erbil airport", shelter: "Civil defense guidance.", evacRoute: "Erbil Airport (intermittent) or land to Turkey", signal: "critical", notes: "Airport guard killed. French warrant officer killed. Kurdish region caught between US-Iran crossfire." },
      "Basra": { risk: 3, nearestStrike: "Oil infrastructure at risk", nearestTarget: "Basra oil terminals, Shatt al-Arab waterway", shelter: "Follow local guidance.", evacRoute: "Basra Airport or drive to Kuwait", signal: "warning", notes: "Southern Iraq, close to Iran border. Major oil export hub at risk from Hormuz-adjacent disruption." },
    }
  },
  Lebanon: {
    name: "Lebanon", flag: "🇱🇧", riskScore: 5, civilDefense: "Lebanese Civil Defense", defenseDesc: "Directorate General of Civil Defense", emergency: "125", defensePerf: "Minimal air defense, active ground invasion by Israel", pop: "5.5M", riskLabel: "CRITICAL",
    advisory: "Level 5 — Active Israeli ground invasion. 850+ killed, 1M+ displaced. Hezbollah front open since March 2.",
    cities: {
      "Beirut": { risk: 5, nearestStrike: "Dahiyeh suburbs under sustained Israeli bombardment", nearestTarget: "Hezbollah HQ, southern suburbs, port area", shelter: "Seek reinforced structures. Avoid southern suburbs entirely.", evacRoute: "Rafic Hariri Airport (intermittent) or land to Syria/Turkey", signal: "critical", notes: "Israel conducting largest ground invasion since 2006. Beirut southern suburbs devastated. 20% of population displaced. Active urban warfare zone." },
      "Tripoli": { risk: 3, nearestStrike: "Northern Lebanon less targeted", nearestTarget: "Limited military infrastructure", shelter: "Standard precautions.", evacRoute: "Land route to Syria or sea evacuation", signal: "warning", notes: "Northern Lebanon provides relative buffer from southern front. Humanitarian aid corridor." },
    }
  },
  Syria: {
    name: "Syria", flag: "🇸🇾", riskScore: 4, civilDefense: "Syrian Civil Defense", defenseDesc: "Ministry of Interior", emergency: "113", defensePerf: "Russian air defense provides partial coverage", pop: "22M", riskLabel: "HIGH",
    advisory: "Level 4 — Caught between multiple fronts. Israeli strikes on Iranian assets. US bases targeted.",
    cities: {
      "Damascus": { risk: 4, nearestStrike: "Israeli strikes on Iranian military assets near Damascus", nearestTarget: "Iranian/Hezbollah facilities, military airports", shelter: "Reinforced structures.", evacRoute: "Damascus Airport (very limited) or land to Lebanon/Jordan", signal: "critical", notes: "Israeli strikes targeting Iranian assets in Syria intensified. Complex multi-faction environment — Russian, Iranian, Turkish, US, Israeli forces all present." },
    }
  },
  Israel: {
    name: "Israel", flag: "🇮🇱", riskScore: 5, civilDefense: "Home Front Command", defenseDesc: "IDF Home Front Command (Pikud HaOref)", emergency: "104", defensePerf: "Iron Dome, Arrow, David's Sling — multi-layered but interceptor depletion concern", pop: "10M", riskLabel: "CRITICAL",
    advisory: "Level 5 — Direct Iranian missile exchange. 15 killed, 3,530+ injured. Simultaneous Lebanon ground invasion.",
    cities: {
      "Tel Aviv": { risk: 5, nearestStrike: "Multiple Iranian ballistic missile impacts in central Israel", nearestTarget: "Primary Iranian target zone — 38.5% of all attack waves", shelter: "Bomb shelters mandatory. Iron Dome active.", evacRoute: "Ben Gurion Airport (intermittent operations)", signal: "critical", notes: "Main target of Iranian missile barrages. Beit Shemesh strike killed 9. Iron Dome and Arrow systems active but interceptor depletion concern." },
      "Haifa": { risk: 5, nearestStrike: "Hezbollah rockets from Lebanon + Iranian missiles", nearestTarget: "Northern Israel under dual threat", shelter: "Bomb shelters. Follow Home Front Command.", evacRoute: "Limited — northern routes to Tel Aviv", signal: "critical", notes: "Dual threat from Iran (east) and Hezbollah (north). Rocket barrages on upper Galilee and Nahariya ongoing." },
    }
  },
  Egypt: {
    name: "Egypt", flag: "🇪🇬", riskScore: 2, civilDefense: "Egyptian Civil Protection", defenseDesc: "National Authority for Civil Protection", emergency: "122", defensePerf: "Not under direct attack, functioning normally", pop: "110M", riskLabel: "MODERATE",
    advisory: "Level 2 — Not directly targeted. Suez Canal disruption risk from Houthi escalation. Regional economic spillover.",
    cities: {
      "Cairo": { risk: 2, nearestStrike: "No confirmed strikes on Egypt", nearestTarget: "Suez Canal (Houthi disruption risk)", shelter: "Standard precautions.", evacRoute: "Cairo International Airport (fully operational)", signal: "positive", notes: "Egypt not a party to conflict. Main risk is economic spillover and Suez Canal disruption if Houthis escalate. Functioning as refugee/evacuation hub." },
    }
  },
  Yemen: {
    name: "Yemen", flag: "🇾🇪", riskScore: 4, civilDefense: "Yemen Civil Defense", defenseDesc: "Limited infrastructure", emergency: "199", defensePerf: "Minimal — Houthi-controlled areas have no formal air defense", pop: "34M", riskLabel: "HIGH",
    advisory: "Level 4 — Houthi forces on standby. Full entry into war assessed 65-75% within 4-8 weeks. Israeli strikes killed senior leaders in 2025.",
    cities: {
      "Sanaa": { risk: 4, nearestStrike: "Israeli strikes in Aug-Sep 2025 killed Houthi PM", nearestTarget: "Houthi military infrastructure", shelter: "Limited infrastructure.", evacRoute: "Sanaa Airport (very limited) or land routes", signal: "critical", notes: "Houthi-controlled. Not yet fully entered 2026 war but assessed as almost certain within weeks. Israeli strikes killed senior leaders in 2025. Dual chokepoint crisis risk." },
    }
  },
};

const RESIDENT_TYPES = {
  tourist: {
    label: "Tourist / Short-Stay",
    icon: "✈️",
    riskAdjust: 0,
    getMsg: (cd) => `Complete your trip and depart on your scheduled flight or earlier. Don't extend your stay. Flights are subject to sudden cancellation — book backup options. Travel insurance likely void under current advisories. Follow ${cd.civilDefense} guidance.`,
    tier2: (cd) => `Depart immediately by any available means. Do not wait for your scheduled flight. Contact your embassy and follow ${cd.civilDefense} alerts.`,
    tier3: (cd) => "Follow government evacuation orders. Use any available transport.",
    shortAdvice: "Depart as planned — don't extend",
  },
  business: {
    label: "Business Visitor",
    icon: "💼",
    riskAdjust: -1,
    getMsg: (cd) => `Conclude your business promptly. Keep flights flexible and book backups. Avoid scheduling new trips until situation stabilises. Follow ${cd.civilDefense} alerts and your embassy's guidance.`,
    tier2: (cd) => `Wrap up within 48 hours and depart. Situation has materially worsened. Follow ${cd.civilDefense} shelter alerts.`,
    tier3: (cd) => "Follow government evacuation orders immediately.",
    shortAdvice: "Conclude business — keep flights flexible",
  },
  expat_single: {
    label: "Expat Resident (Single)",
    icon: "🏠",
    riskAdjust: -2,
    getMsg: (cd) => `Continue your routine with awareness. Follow ${cd.civilDefense} alerts and shelter drills — they work. Have a go-bag ready as common sense, not panic. ${cd.defensePerf ? "Defense performance: " + cd.defensePerf + "." : ""} This is your home.`,
    tier2: (cd) => `Situation worsening — activate contingency plan. Follow ${cd.civilDefense} guidance closely. Consider temporary relocation if you have options abroad.`,
    tier3: (cd) => `Follow official evacuation guidance from ${cd.civilDefense}. Use prepared exit routes.`,
    shortAdvice: "Stay prepared — follow local alerts",
  },
  expat_family: {
    label: "Expat Resident (Family)",
    icon: "👨‍👩‍👧",
    riskAdjust: -2,
    getMsg: (cd) => `Your family is safe. Follow ${cd.civilDefense} shelter drills with your children. ${cd.defensePerf ? "The country's defense: " + cd.defensePerf + "." : ""} Have a family contingency plan as common sense. Emergency: ${cd.emergency}.`,
    tier2: (cd) => `Situation has materially worsened. Families with young children should consider temporary relocation. Follow ${cd.civilDefense} guidance. Emergency: ${cd.emergency}.`,
    tier3: (cd) => `Evacuate with your family. Follow ${cd.civilDefense} guidance. Emergency: ${cd.emergency}.`,
    shortAdvice: "Family safe — follow shelter drills, have a plan",
  },
  national: {
    label: "National / Citizen",
    icon: "🏛️",
    riskAdjust: -3,
    getMsg: (cd) => `Your country's defense systems are active. ${cd.defensePerf ? cd.defensePerf + "." : ""} Follow ${cd.civilDefense} guidance and support your community. Stay informed through official channels. Emergency: ${cd.emergency}.`,
    tier2: (cd) => `Situation is serious. Follow all ${cd.civilDefense} guidance. Support community preparedness. Consider relocating vulnerable family members temporarily.`,
    tier3: (cd) => "Follow government evacuation orders if issued. Your safety is the priority.",
    shortAdvice: "Your nation is strong — follow civil defense",
  },
  diplomatic: {
    label: "Diplomatic / Government",
    icon: "🏛️",
    riskAdjust: 0,
    getMsg: (cd) => `Follow your mission's official guidance. Coordinate with your government's crisis management team and local ${cd.civilDefense} authority.`,
    tier2: (cd) => "Follow mission guidance. Most embassies have activated evacuation protocols.",
    tier3: (cd) => "Follow your government's emergency extraction plan.",
    shortAdvice: "Follow your mission's official guidance",
  },
};

// ─── RISK HELPERS ───────────────────────────────────────────────────────────
const getTier = (adjustedRisk) => {
  if (adjustedRisk >= 5) return 3; // EVACUATE level
  if (adjustedRisk >= 4) return 2; // CONSIDER RELOCATING
  return 1; // PREPARED - stay with awareness
};

// Get contextual alert banner config
const getAlertConfig = (adjustedRisk, resType, countryData) => {
  const rt = RESIDENT_TYPES[resType];
  const cd = countryData || { civilDefense: "Civil Defense", emergency: "911", defensePerf: "", defenseDesc: "" };
  if (adjustedRisk >= 5) return {
    bg: "bg-gradient-to-r from-rose-500 to-orange-400",
    title: resType === "tourist" ? "DEPART ON SCHEDULE OR EARLIER" : resType === "diplomatic" ? "FOLLOW MISSION GUIDANCE" : "ELEVATED SITUATION — HAVE EXIT PLAN READY",
    msg: rt.tier2(cd),
    icon: "⚠️",
  };
  if (adjustedRisk >= 4) return {
    bg: "bg-gradient-to-r from-amber-400 to-yellow-300",
    title: "STAY PREPARED — MONITOR SITUATION",
    msg: rt.getMsg(cd),
    icon: "⚡",
    dark: true,
  };
  if (adjustedRisk >= 3) return {
    bg: "bg-gradient-to-r from-blue-400 to-sky-300",
    title: "STAY AWARE — SITUATION ONGOING",
    msg: rt.getMsg(cd),
    icon: "ℹ️",
  };
  if (adjustedRisk >= 2) return {
    bg: "bg-gradient-to-r from-cyan-400 to-teal-300",
    title: "MODERATE AWARENESS",
    msg: rt.getMsg(cd),
    icon: "✓",
    dark: true,
  };
  return {
    bg: "bg-gradient-to-r from-emerald-400 to-green-300",
    title: "NORMAL PRECAUTIONS",
    msg: `Standard safety awareness. Stay informed through ${cd.civilDefense} and official channels.`,
    icon: "✓",
    dark: true,
  };
};

// Circle shape SVG per risk level
const RiskGaugeSVG = ({ risk, color, label, size = 140 }) => {
  const c = size / 2;
  const r = c * 0.75;
  const circ = 2 * Math.PI * r;

  // Different shapes based on risk level
  if (risk >= 5) {
    // Pulsing warning — sharp octagon outline
    return (
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full heartbeat">
        <circle cx={c} cy={c} r={r} fill="none" stroke="#F3F4F6" strokeWidth="6" />
        <circle cx={c} cy={c} r={r + 4} fill="none" stroke={color} strokeWidth="1" opacity="0.15">
          <animate attributeName="r" values={`${r + 2};${r + 10};${r + 2}`} dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.25;0;0.25" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${circ * 0.95} ${circ * 0.05}`}
          strokeLinecap="round" transform={`rotate(-90 ${c} ${c})`} />
        <text x={c} y={c - 4} textAnchor="middle" fill={color} fontSize="32" fontWeight="900">{risk}</text>
        <text x={c} y={c + 14} textAnchor="middle" fill={color} fontSize="9" fontWeight="700">{label}</text>
        <text x={c} y={c + 26} textAnchor="middle" fill="#9CA3AF" fontSize="7">of 5</text>
      </svg>
    );
  }
  if (risk >= 4) {
    // Triangle warning shape inside circle
    return (
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" style={{ animation: "heartbeat 2.5s ease-in-out infinite" }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="#F3F4F6" strokeWidth="6" />
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${circ * (risk / 5) * 0.95} ${circ * (1 - (risk / 5) * 0.95)}`}
          strokeLinecap="round" transform={`rotate(-90 ${c} ${c})`} />
        <polygon points={`${c},${c - 22} ${c + 20},${c + 14} ${c - 20},${c + 14}`}
          fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
        <text x={c} y={c - 2} textAnchor="middle" fill={color} fontSize="30" fontWeight="900">{risk}</text>
        <text x={c} y={c + 16} textAnchor="middle" fill={color} fontSize="9" fontWeight="700">{label}</text>
        <text x={c} y={c + 28} textAnchor="middle" fill="#9CA3AF" fontSize="7">of 5</text>
      </svg>
    );
  }
  if (risk >= 3) {
    // Diamond shape — elevated but manageable
    return (
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
        <circle cx={c} cy={c} r={r} fill="none" stroke="#F3F4F6" strokeWidth="6" />
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${circ * (risk / 5) * 0.95} ${circ * (1 - (risk / 5) * 0.95)}`}
          strokeLinecap="round" transform={`rotate(-90 ${c} ${c})`} />
        <rect x={c - 14} y={c - 14} width="28" height="28" rx="3"
          fill="none" stroke={color} strokeWidth="1.5" opacity="0.2"
          transform={`rotate(45 ${c} ${c})`} />
        <text x={c} y={c - 2} textAnchor="middle" fill={color} fontSize="30" fontWeight="900">{risk}</text>
        <text x={c} y={c + 16} textAnchor="middle" fill={color} fontSize="9" fontWeight="700">{label}</text>
        <text x={c} y={c + 28} textAnchor="middle" fill="#9CA3AF" fontSize="7">of 5</text>
      </svg>
    );
  }
  if (risk >= 2) {
    // Shield shape — moderate, protected
    return (
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
        <circle cx={c} cy={c} r={r} fill="none" stroke="#F3F4F6" strokeWidth="6" />
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${circ * (risk / 5) * 0.95} ${circ * (1 - (risk / 5) * 0.95)}`}
          strokeLinecap="round" transform={`rotate(-90 ${c} ${c})`} />
        <path d={`M${c},${c - 18} L${c + 16},${c - 8} L${c + 16},${c + 6} Q${c + 16},${c + 18} ${c},${c + 22} Q${c - 16},${c + 18} ${c - 16},${c + 6} L${c - 16},${c - 8} Z`}
          fill="none" stroke={color} strokeWidth="1.5" opacity="0.2" />
        <text x={c} y={c - 2} textAnchor="middle" fill={color} fontSize="30" fontWeight="900">{risk}</text>
        <text x={c} y={c + 16} textAnchor="middle" fill={color} fontSize="9" fontWeight="700">{label}</text>
        <text x={c} y={c + 28} textAnchor="middle" fill="#9CA3AF" fontSize="7">of 5</text>
      </svg>
    );
  }
  // Level 1 — calm circle with checkmark
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
      <circle cx={c} cy={c} r={r} fill="none" stroke="#F3F4F6" strokeWidth="6" />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${circ * 0.19} ${circ * 0.81}`}
        strokeLinecap="round" transform={`rotate(-90 ${c} ${c})`} />
      <text x={c} y={c - 2} textAnchor="middle" fill={color} fontSize="30" fontWeight="900">{risk}</text>
      <text x={c} y={c + 16} textAnchor="middle" fill={color} fontSize="9" fontWeight="700">{label}</text>
      <text x={c} y={c + 28} textAnchor="middle" fill="#9CA3AF" fontSize="7">of 5</text>
    </svg>
  );
};

const RISK_SIGNALS = [
  { id: 1, category: "Physical Security", level: "critical", text: "Active daily missile & drone attacks on UAE territory, strikes within 5–10 km of JBR", action: "Depart immediately — do not wait for conditions to worsen" },
  { id: 2, category: "Aviation", level: "critical", text: "DXB airport struck 3 times; flights at 60% capacity with unscheduled closures", action: "Book earliest available flight on multiple carriers with full refund" },
  { id: 3, category: "Aviation", level: "critical", text: "All major Western carriers suspended UAE service (BA, Lufthansa, KLM, Air France, etc.)", action: "Route through Istanbul, Athens, or Rome hubs" },
  { id: 4, category: "Strait of Hormuz", level: "critical", text: "Strait of Hormuz effectively closed — tanker traffic collapsed 94%", action: "Expect supply chain disruptions to food, fuel, medical supplies" },
  { id: 5, category: "Air Defense", level: "critical", text: "Interceptor depletion crisis — THAAD/Patriot stocks rationed, $12M per intercept vs $1K drones", action: "Defensive shield degrading daily — window closing" },
  { id: 6, category: "Escalation", level: "critical", text: "No ceasefire, no negotiations, no exit strategy — Iran FM: 'We never asked for a ceasefire'", action: "Do not wait for diplomatic resolution — none is imminent" },
  { id: 7, category: "Physical Security", level: "critical", text: "Iran explicitly named Jebel Ali Port (~25 km from JBR) as 'legitimate target' on March 14", action: "JBR within blast effect radius of Jebel Ali strike" },
  { id: 8, category: "Physical Security", level: "critical", text: "Palm Jumeirah struck March 1 — only 3 km from JBR", action: "JBR is within confirmed strike zone" },
  { id: 9, category: "Government Advisories", level: "critical", text: "US Embassy closed, evacuation flights operating; Australia: 'DO NOT TRAVEL — leave now'", action: "Register with embassy; use government evacuation if commercial flights fail" },
  { id: 10, category: "Government Advisories", level: "critical", text: "UK planning contingency evacuation of 50,000 Britons", action: "Follow FCDO guidance — avoid all but essential travel" },
  { id: 11, category: "Supply Chain", level: "critical", text: "Jebel Ali Port at reduced throughput — 36% of Dubai GDP; major shipping lines halted bookings", action: "Stockpile 90+ days of medications; keep cash reserves" },
  { id: 12, category: "Economic Impact", level: "critical", text: "Travel insurance invalidated under current advisories", action: "No coverage for medical emergencies or evacuation" },
  { id: 13, category: "Houthi Wildcard", level: "warning", text: "Houthi full entry 65–75% probable within 4–8 weeks — dual chokepoint crisis", action: "Monitor Houthi rhetoric and Red Sea shipping disruptions closely" },
  { id: 14, category: "Air Defense", level: "warning", text: "Iran shifted to heavier 1,000+ kg warheads and coordinated drone swarms to saturate defenses", action: "Debris risk increasing even from successful interceptions" },
  { id: 15, category: "Escalation", level: "warning", text: "US ground troops 15–25% probability if no ceasefire by May", action: "Would transform conflict to generational commitment" },
  { id: 16, category: "Cyber Threats", level: "warning", text: "Electronic Operations Room coordinating Iranian hacktivist attacks on UAE infrastructure", action: "Expect potential banking, telecom, cloud service disruptions" },
  { id: 17, category: "Cyber Threats", level: "warning", text: "IRGC named Google, Oracle, IBM, Amazon as targets in UAE", action: "Back up critical data; have offline access to essential docs" },
  { id: 18, category: "Escalation", level: "warning", text: "UAE has only 45 days strategic water reserves — desalination plants potential target", action: "Humanitarian crisis risk if water infrastructure targeted" },
  { id: 19, category: "Economic Impact", level: "warning", text: "DFM real estate index fell ~30% in two weeks; Goldman Sachs considering relocation", action: "Property values under severe pressure; business exodus accelerating" },
  { id: 20, category: "Houthi Wildcard", level: "warning", text: "Saudi rerouting oil through Yanbu/Red Sea — ideal Houthi targets", action: "Dual chokepoint would create unprecedented maritime crisis" },
  { id: 21, category: "Economic Impact", level: "warning", text: "Oil surged from $67 to $104+/barrel (55%); war risk insurance up 12-fold", action: "Global economic cascade affecting all Gulf operations" },
  { id: 22, category: "Physical Security", level: "warning", text: "131 of 141 UAE injuries from interception debris — risk in all populated areas", action: "Even 'successful' defense creates casualty risk overhead" },
  { id: 23, category: "Escalation", level: "warning", text: "Russian Geran-2 drone variants with jam-resistant navigation found in debris", action: "Russia–Iran tech transfer deepening — drone threat evolving" },
  { id: 24, category: "Air Defense", level: "positive", text: "UAE air defense achieving 90–95% interception rate — world-class performance", action: "System working but unsustainable long-term" },
  { id: 25, category: "Physical Security", level: "positive", text: "UAE casualties remarkably low (6 killed) given 1,800+ projectiles", action: "Defense effective for now — but degrading" },
  { id: 26, category: "Houthi Wildcard", level: "positive", text: "Houthis have not yet entered conflict kinetically as of March 16", action: "Window before dual-front threat — use it to depart" },
  { id: 27, category: "Aviation", level: "positive", text: "Emirates operating reduced schedule to ~110 destinations", action: "Commercial departure still possible — act now" },
  { id: 28, category: "Government Advisories", level: "positive", text: "Oman border open; Muscat ~4.5 hours drive — backup departure option", action: "Land route available if airspace closes" },
  { id: 29, category: "Escalation", level: "neutral", text: "Ceasefire probability: 25–30% by June, 40–50% by September", action: "Plan for 3–4 month minimum relocation" },
  { id: 30, category: "Economic Impact", level: "neutral", text: "IEA released 400M barrels from strategic reserves — largest in history", action: "Temporary oil price stabilization attempt" },
  { id: 31, category: "Escalation", level: "neutral", text: "Trump stated operations continue 'at least three more weeks'", action: "No end date — minimum 3 more weeks of active combat" },
];

const CATEGORIES = [
  { key: "Physical Security", icon: Shield },
  { key: "Aviation", icon: Plane },
  { key: "Supply Chain", icon: Ship },
  { key: "Strait of Hormuz", icon: Navigation },
  { key: "Air Defense", icon: Crosshair },
  { key: "Escalation", icon: Activity },
  { key: "Houthi Wildcard", icon: Zap },
  { key: "Cyber Threats", icon: Wifi },
  { key: "Economic Impact", icon: DollarSign },
  { key: "Government Advisories", icon: Globe },
];

const STRIKE_TIMELINE = [
  { date: "Feb 28", event: "Operation Epic Fury launched — Khamenei killed. Iran begins True Promise IV.", level: "critical" },
  { date: "Mar 1", event: "Palm Jumeirah Fairmont struck (~3km JBR). Jebel Ali fire from debris.", level: "critical" },
  { date: "Mar 2", event: "Iran declares Hormuz closed. Hezbollah resumes strikes on Israel.", level: "critical" },
  { date: "Mar 3", event: "US Embassy orders departure. Fujairah terminal struck (1st).", level: "critical" },
  { date: "Mar 4", event: "US evacuation flights begin. Qatar declares LNG force majeure.", level: "critical" },
  { date: "Mar 7", event: "DXB airport struck by drone (1st). Flights suspended for hours.", level: "critical" },
  { date: "Mar 8", event: "Mojtaba Khamenei appointed new Supreme Leader.", level: "warning" },
  { date: "Mar 9", event: "Fujairah struck (2nd). ADNOC Ruwais 922K bpd refinery shut down.", level: "critical" },
  { date: "Mar 11", event: "Iraq suspends all oil terminal operations.", level: "warning" },
  { date: "Mar 12", event: "NCEMA civil defence alert. UAE: 6 killed, 141 injured.", level: "critical" },
  { date: "Mar 13", event: "268 BMs, 15 CMs, 1,514 drones confirmed at UAE. Sharjah mall struck.", level: "critical" },
  { date: "Mar 14", event: "Iran names Jebel Ali 'legitimate target'. Fujairah struck (3rd).", level: "critical" },
  { date: "Mar 15", event: "Iran FM: 'We never asked for a ceasefire.' UK advisory updated.", level: "warning" },
  { date: "Mar 16", event: "DXB fuel tank fire (3rd airport hit). Fujairah (4th). Australia: DO NOT TRAVEL.", level: "critical" },
  { date: "Mar 17", event: "TODAY: UAE briefly closes airspace for new attack wave. Day 18 — Israel launches 'wide-scale strikes' on Tehran. War continues.", level: "critical" },
];

const THREAT_MAP_TARGETS = [
  { name: "JBR", x: 50, y: 52, type: "home" },
  { name: "Palm Jumeirah\nFairmont Strike", x: 55, y: 49, type: "strike", dist: "~3 km" },
  { name: "Burj Al Arab\n(debris)", x: 53, y: 59, type: "damage", dist: "~8 km" },
  { name: "DXB Airport\n(struck 3×)", x: 73, y: 41, type: "strike", dist: "~30 km" },
  { name: "DIFC\n(2 strikes)", x: 63, y: 47, type: "strike", dist: "~12 km" },
  { name: "Jebel Ali Port\n('legit. target')", x: 31, y: 63, type: "threat", dist: "~25 km" },
  { name: "Al Minhad\nAir Base", x: 76, y: 61, type: "military", dist: "~40 km" },
  { name: "Sharjah\n(3 killed)", x: 79, y: 35, type: "strike", dist: "~25 km" },
  { name: "AWS DC", x: 67, y: 56, type: "damage", dist: "~20 km" },
  { name: "US Consulate\n(fire)", x: 59, y: 43, type: "strike", dist: "~15 km" },
];

const SUPPLY_STATUS = [
  { name: "Water Reserves", icon: Droplets, value: 45, unit: "days", status: "warning", detail: "45-day strategic reserves. Desalination plants at risk." },
  { name: "Fuel Supply", icon: Fuel, value: 30, unit: "% capacity", status: "critical", detail: "Hormuz closed. Ruwais refinery shut. Jebel Ali reduced." },
  { name: "Medical Access", icon: Heart, value: 60, unit: "% normal", status: "warning", detail: "Facilities under strain. Supply chains disrupted." },
  { name: "Food Supply", icon: Building, value: 50, unit: "% normal", status: "warning", detail: "Major shipping halted. Jebel Ali reduced throughput." },
  { name: "Telecom", icon: Wifi, value: 75, unit: "% stable", status: "warning", detail: "AWS DC struck. Cyber attacks ongoing." },
  { name: "Banking", icon: DollarSign, value: 65, unit: "% normal", status: "warning", detail: "Cyber threats active. ATMs may become unreliable." },
];

const ESCAPE_ROUTES = [
  { type: "air", name: "Emirates to Europe", detail: "Reduced, ~110 destinations at 60%. Subject to sudden cancellation.", status: "limited", time: "4–8h to Europe" },
  { type: "air", name: "US Evacuation Flights", detail: "From Abu Dhabi & Dubai since March 4. US citizens priority.", status: "active", time: "Scheduled" },
  { type: "air", name: "Via Istanbul / Athens / Rome", detail: "Hubs receiving diverted Gulf traffic. Multiple carriers.", status: "available", time: "6–12h total" },
  { type: "land", name: "Dubai → Muscat, Oman", detail: "Border open but congested. Less-targeted departure.", status: "open", time: "~4.5h drive" },
  { type: "land", name: "Dubai → Salalah, Oman", detail: "Greater distance from conflict zone.", status: "open", time: "~10h drive" },
  { type: "land", name: "Saudi Arabia routes", detail: "Saudi-Bahrain/Jordan. Areas also under threat.", status: "risky", time: "Variable" },
];

const GO_BAG_CHECKLIST = [
  { id: "passports", text: "Passports & visa documents", priority: "critical" },
  { id: "cash", text: "Cash (USD/EUR — ATMs may fail)", priority: "critical" },
  { id: "meds", text: "Medications for 90+ days", priority: "critical" },
  { id: "insurance", text: "Insurance papers & copies", priority: "critical" },
  { id: "digital", text: "Digital copies of all docs in cloud", priority: "critical" },
  { id: "phone", text: "Phone charger & power bank", priority: "high" },
  { id: "ncema", text: "NCEMA app downloaded", priority: "critical" },
  { id: "fr24", text: "FlightRadar24 downloaded", priority: "high" },
  { id: "embassy", text: "Embassy emergency numbers saved", priority: "critical" },
  { id: "step", text: "Registered with embassy (STEP/crisis)", priority: "critical" },
  { id: "exit", text: "UAE exit procedures clear (no bans)", priority: "critical" },
  { id: "tickets", text: "Refundable tickets on multiple carriers", priority: "critical" },
  { id: "oman", text: "Oman backup route planned", priority: "high" },
  { id: "water", text: "48hr emergency water supply", priority: "high" },
  { id: "child", text: "Child essentials (formula, diapers, comfort items)", priority: "critical" },
];

const FORECAST = [
  { scenario: "Continued Iranian attacks on UAE", prob: "85–90%", time: "Through Q2", level: "critical" },
  { scenario: "Hormuz remains disrupted", prob: "80–85%", time: "Through Q2", level: "critical" },
  { scenario: "Houthi full entry / Red Sea", prob: "65–75%", time: "4–8 weeks", level: "warning" },
  { scenario: "Further civilian casualties in Dubai", prob: "60–70%", time: "Ongoing", level: "critical" },
  { scenario: "Ceasefire achieved", prob: "25–30% Jun", time: "40–50% Sep", level: "positive" },
  { scenario: "US ground troops to Iran", prob: "15–25%", time: "If no ceasefire May", level: "warning" },
  { scenario: "Iranian regime collapse", prob: "20–30%", time: "2026–2027", level: "neutral" },
];

const RETURN_CRITERIA = [
  { text: "Verified ceasefire in effect for 30+ days", met: false },
  { text: "Strait of Hormuz reopened to commercial traffic", met: false },
  { text: "Embassy advisories downgraded to Level 2 or below", met: false },
  { text: "Commercial airlines operating normal schedules", met: false },
  { text: "Travel insurance coverage reinstated for UAE", met: false },
];

const EMERGENCY_CONTACTS = [
  { name: "UAE Police", number: "999", type: "emergency" },
  { name: "UAE Fire", number: "997", type: "emergency" },
  { name: "UAE Ambulance", number: "998", type: "emergency" },
  { name: "US Embassy", number: "+1-202-501-4444", type: "embassy" },
  { name: "UK FCDO Crisis", number: "+44-20-7008-5000", type: "embassy" },
  { name: "NCEMA Hotline", number: "NCEMA App", type: "alert" },
];

const ACCORDION_SECTIONS = [
  { id: "origins", title: "How the War Began — Operation Epic Fury", worstLevel: "critical",
    content: `On February 28, 2026, the United States and Israel launched coordinated strikes against Iran under Operation Epic Fury, killing Supreme Leader Ali Khamenei, Defense Minister Aziz Nasirzadeh, chief of staff Abdolrahim Mousavi, and dozens of senior officials. Strikes hit 26 of 31 provinces. Over 15,000 targets in two weeks.

Roots: Iran-Israel exchanged strikes Apr 2024 (True Promise I), Oct 2024 (True Promise II). June 2025: "Twelve-Day War" (Midnight Hammer) hit Iran's nuclear sites. Iran terminated JCPOA Oct 2025. Talks via Oman progressed — Iran FM declared deal "within reach" Feb 25. Three days later, surprise attack pre-empted talks.

Iran responded with "Operation True Promise IV" — BMs, CMs, drone swarms at Israel, US bases, and all six GCC states simultaneously.` },
  { id: "current", title: "Current War Situation — Multi-Front Conflict", worstLevel: "critical",
    content: `Five active fronts, Day 17:

🔴 Iran–Israel: Mutual strikes. Tel Aviv/Haifa hit. 2,000+ killed. 7,600 Israeli strikes in Iran.
🔴 Lebanon: Hezbollah resumed Mar 2. 850+ killed, 800,000 displaced.
🔴 GCC States: All six struck. UAE heaviest: 285+ BMs, 1,567+ drones, 15 CMs. ~48% of Iranian munitions.
🔴 Strait of Hormuz: Closed Mar 2. Traffic -94%. 16 vessels struck.
🟡 Houthis: Not yet kinetic. Full entry "almost certain" 4–8 weeks.

No ceasefire channel. Iran FM: "We never asked for a ceasefire." Mojtaba Khamenei (new leader) vows continued attacks. US largest Middle East buildup since 2003.

Casualties: 13 US killed, ~140 wounded. 1,400+ Iranian civilians killed in Tehran. Oil: $67→$104+. IEA released 400M barrels.` },
  { id: "uae-strikes", title: "Iran's Direct Attacks on UAE — Strike Log", worstLevel: "critical",
    content: `By Mar 13: 268 BMs, 15 CMs, 1,514 drones at UAE. 90%+ intercepted.

🔴 DXB Airport — Drones Mar 7 & 16; fuel tank fire; 3rd incident
🔴 Palm Jumeirah Fairmont — Shahed drone Mar 1; 4 injuries (~3km JBR)
🟡 Burj Al Arab — Debris damage
🔴 DIFC — Two strikes; Goldman/Citi/StanChart WFH
🔴 Jebel Ali Port — Fire Mar 1; "legitimate target" Mar 14
🔴 Al Dhafra — AN/TPY-2 radar destroyed; MQ-9/U-2 damaged
🟡 Al Minhad — Attacked; UK/France defensive sorties
🔴 Abu Dhabi Airport — 1 killed, 7 wounded
🔴 ADNOC Ruwais — 922K bpd shutdown
🔴 Fujairah — 4 strikes (Mar 3, 9, 14, 16)
🟡 AWS Data Center — First cloud DC hit in conflict
🔴 US Consulate — Fire
🔴 Sharjah — 3 killed, 58 injured

Total UAE: 6 killed, 141 injured.` },
  { id: "jbr", title: "JBR-Specific Threat Assessment", worstLevel: "critical",
    content: `🔴 Jebel Ali — 15–25 km SW. "Legitimate target." 2021 explosion shockwave reached JBR. Desalination mega-plant, power station, oil storage adjacent.
🔴 Palm Jumeirah — ~3 km. Confirmed strike.
🟡 Burj Al Arab — ~8 km. Debris confirmed.
🟡 Al Minhad — ~40 km SE. Coalition base, struck.

RISKS: (1) Interception debris — 131 of 141 injuries. (2) Drones evading defense — 14 struck Day 1. (3) Blast from nearby infrastructure strikes.

HIGH-RISE GLASS: 40 towers, glass curtain walls. Flying glass = primary urban injury mechanism. Upper floors amplified blast. No terrain buffer.

No bomb shelters. NCEMA: interior corridors, stairwells, ground floor. Alerts multiple times daily. Distance learning since Mar 1. Filming during alerts = imprisonment.` },
  { id: "air-defense", title: "UAE Air Defense & Depletion Crisis", worstLevel: "warning",
    content: `System: THAAD, Patriot PAC-3/MSE, Cheongung-II, Barak-8, Pantsir-S1, SkyKnight.
🟢 90–95% interception. ~100% BMs, 93% drones initially.

🔴 DEPLETION: THAAD $12M/intercept, global production ~650/yr. Iran drones ~$1K. Stimson Center: "burned through significant chunk." US moving THAAD from South Korea. Israel "critically low." US "stonewalling" Gulf replenishment. UAE rationing.

🔴 IRAN ADAPTING: 1,000+ kg warheads, coordinated swarms + BM salvos, 190–392 daily strikes, Russian Geran-2 with jam-resistant nav.` },
  { id: "hormuz", title: "Strait of Hormuz & Energy Crisis", worstLevel: "critical",
    content: `Closed Mar 2. IRGC: any vessel "set ablaze."

🔴 Traffic: 153/day → near zero (-94%). 400 tankers stranded. 16 attacks, 24+ killed.
🔴 Oil: $67→$104+ (+55%). Gulf cut 10M+ bpd.
🔴 Qatar: LNG force majeure. Iraq: all terminals suspended.
🔴 Insurance: 12× increase. P&I clubs withdrew. US $20B reinsurance vs $352B need.
🟡 Saudi rerouting via Yanbu — Houthi-vulnerable at Bab el-Mandeb.

For residents: supply chains disrupted, fuel shortages. Jebel Ali (36% GDP) reduced.` },
  { id: "advisories", title: "Government Advisories & Airlines", worstLevel: "critical",
    content: `🔴 US (Level 3): Embassy CLOSED. Evacuation flights since Mar 4.
🔴 UK: 50,000 Briton evacuation planned. "Interior stairwell, few external walls."
🔴 Australia (DO NOT TRAVEL): "Leave now. Don't wait."
🔴 Canada: "Leave while commercial options available."

Suspended: BA, Lufthansa, KLM, Air France, Air Canada, Singapore, Air India.
🟡 Emirates: ~110 destinations at 60%. Subject to sudden cancellation.
🔴 DXB shut 3 times in 16 days.

MARAD: CRITICAL — "attack almost inevitable." MARSEC Level 3.` },
  { id: "houthis", title: "Houthi Risk — Dual Chokepoint", worstLevel: "warning",
    content: `Currently holding fire. Restraint from Israeli strikes killing leaders; Saudi détente.
🟡 65–75% full entry within 4–8 weeks.
🔴 WORST CASE: Hormuz + Bab el-Mandeb closed simultaneously. Saudi Yanbu tankers = ideal targets. Atlantic Council: "most consequential" escalation.
Movements: reinforcements toward Saudi border, Hodeidah coastal positions, Marib front.
If joined: UAE faces fire from TWO directions — potentially overwhelming single-axis defense.` },
  { id: "historical", title: "Historical Comparison — Unprecedented", worstLevel: "critical",
    content: `Abqaiq 2019: 25 projectiles, 0 casualties, 2-week recovery. vs 2026: 1,800+ over 17 days.
Soleimani 2020: De-escalated in 5 days. Flight 752 killed 176. vs 2026: 17 days, no de-escalation.
Houthi 2022: Handful, 3 killed. vs 2026: Orders of magnitude larger.
Tanker War 1980s: 451 attacks over 7 YEARS, 2% disruption. vs 2026: 90% in 2 weeks.
Gulf War 1991: 88 Scuds in 6 weeks. vs 2026: 500+ BMs, 2,000+ drones in 17 days.

No precedent. No off-ramps. No back-channels. Khamenei's death removed all restraint.` },
  { id: "cyber", title: "Cyber & Hybrid Warfare", worstLevel: "warning",
    content: `🟡 "Electronic Operations Room" (Feb 28) coordinating attacks.
Actors: Handala Hack (MOIS), MuddyWater, APT42. 150+ incidents first days.
🟡 IRGC named Google, Oracle, IBM, Amazon as UAE targets.
Risk: Banking, telecom, cloud disruptions.
Info environment degraded: Arma 3 footage shared as real. Use InVID/WeVerify. 3+ sources. UAE: sharing rumours prosecutable.` },
  { id: "economic", title: "Economic Impact on Dubai", worstLevel: "critical",
    content: `🔴 DFM: -30% in 2 weeks. Hotels: -60%+. JBR beaches "empty."
🔴 Goldman Sachs considering relocation. Half of hires withdrew.
🔴 Travel insurance invalidated. Five-star hotels: 20–40% "Flash Sales."
Oil: $67→$104+. Insurance: 12×. Jebel Ali (36% GDP) reduced.
Normalcy unlikely before Q1 2027. Pessimistic: hub status existentially challenged.` },
  { id: "forecast", title: "3–6 Month Forecast & Scenarios", worstLevel: "warning",
    content: `BASE (40–45%): 2–4 month air campaign, declining. Houthis enter. Oil >$100 Q2. Normalcy unlikely before Q1 2027.
OPTIMISTIC (25–30%): Ceasefire 4–6 weeks. Even then: Hormuz weeks, airlines months. Return: late Q3 2026.
PESSIMISTIC (15–20%): Ground troops, full Houthi, systematic targeting of infrastructure, regime collapse = years of instability.` },
  { id: "monitoring", title: "Monitoring Tools & Sources", worstLevel: "neutral",
    content: `EMERGENCY: NCEMA app, 999/997/998, US +1-202-501-4444, step.state.gov
FLIGHTS: ADS-B Exchange, FlightRadar24, RadarBox
MARITIME: MarineTraffic, hormuztracker.com, hormuzstraitmonitor.com
CONFLICT: LiveUAMap, NASA FIRMS
ANALYSIS: Washington Institute, CSIS, Atlantic Council, Carnegie, Crisis Group, ACLED, Critical Threats` },
  { id: "departure", title: "Departure Logistics & Return Criteria", worstLevel: "critical",
    content: `AIR: Emirates (limited) | US evacuation flights | Connect via Istanbul/Athens/Rome | Book refundable on MULTIPLE carriers
LAND: Oman open (Muscat ~4.5h, Salalah ~10h) | Saudi routes also under threat

PREPARE: Passports, cash, 90-day meds, digital docs, FlightRadar24 + NCEMA + embassy numbers

RETURN (ALL must be met):
❌ Ceasefire 30+ days ❌ Hormuz open ❌ Advisory ≤ Level 2 ❌ Airlines normal ❌ Insurance reinstated
Earliest: Late Q3 2026 (Aug–Sep). Plan 3–4 month minimum.` },
];

const buildMainSystemPrompt = (country, city, resType, lang) => {
  const cd = GCC_DATA[country] || GCC_DATA["UAE"];
  const cy = cd?.cities?.[city];
  const rt = RESIDENT_TYPES[resType] || RESIDENT_TYPES.expat_family;
  return `You are an expert geopolitical and security analyst for the GCC War Room. You provide calibrated, data-driven analysis personalized to the user's profile.

CURRENT SITUATION (Day ${CONFLICT_DATA.day}, ${CONFLICT_DATA.date}):
- Total projectiles at UAE: ${CONFLICT_DATA.missiles.total} (${CONFLICT_DATA.missiles.ballistic} BMs, ${CONFLICT_DATA.missiles.cruise} CMs, ${CONFLICT_DATA.missiles.drones} drones)
- UAE casualties: ${CONFLICT_DATA.casualties.killed} killed, ${CONFLICT_DATA.casualties.injured} injured (${CONFLICT_DATA.casualties.debrisInjuries} from debris)
- Tourist casualties: ${CONFLICT_DATA.casualties.touristCasualties}
- Interception rate: ${CONFLICT_DATA.interceptionRate}
- Hormuz: ${CONFLICT_DATA.hormuz.traffic} traffic (${CONFLICT_DATA.hormuz.status})
- Oil: ${CONFLICT_DATA.oil.current}/barrel (pre-war: ${CONFLICT_DATA.oil.preWar})
- DFM Real Estate: ${CONFLICT_DATA.dfm}. Hotels: ${CONFLICT_DATA.hotels}
- Emirates: ${CONFLICT_DATA.emirates.capacity} capacity, ${CONFLICT_DATA.emirates.destinations} destinations
- Sovereign Wealth: ${CONFLICT_DATA.sovereignWealth}. AED/USD: ${CONFLICT_DATA.aedPeg}
- Status: ${CONFLICT_DATA.status}

USER PROFILE:
- Location: ${city || country} (${cd.name})
- Risk Level: ${cy?.risk || cd.riskScore}/5${cy ? ` — ${cy.nearestStrike}` : ""}
- Resident Type: ${rt.icon} ${rt.label}
- Civil Defense: ${cd.civilDefense} (${cd.emergency})

RESPONSE RULES:
1. Start with **RISK VERDICT: [🔴 CRITICAL / 🟡 ELEVATED / 🟢 MANAGEABLE]**
2. Use ## headers, 🔴🟡🟢⚪ indicators, **bold** for key data
3. End with ## ⚡ Recommended Action (1-3 specific steps)
4. Personalize for ${rt.label} — ${rt.shortAdvice}
5. Reference ${cd.civilDefense} and ${cd.emergency} when relevant
6. NEVER say "completely safe" or "no risk." Every death matters.
7. Always mention government advisories when relevant.

KEY DATA: Day ${CONFLICT_DATA.day}. ${CONFLICT_DATA.missiles.total} projectiles, ${CONFLICT_DATA.interceptionRate} intercepted. ${CONFLICT_DATA.casualties.killed} killed. Hormuz closed. No ceasefire. DXB struck 3x. All Western carriers suspended. Emirates at ${CONFLICT_DATA.emirates.capacity}. Houthi entry 65-75% in 4-8 weeks.`;
};

const STARTER_QUESTIONS = [
  "What is the current risk level for JBR?",
  "Should I leave now or wait?",
  "What are the biggest red flags?",
  "How long should I stay away?",
  "What's the worst-case scenario?",
  "Is the airport safe to fly from?",
  "What are the departure options?",
  "When would it be safe to return?",
];

// ─── UTILITIES ──────────────────────────────────────────────────────────────

const lc = (level) => ({
  critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", badge: "bg-red-100 text-red-700 border border-red-200", barBg: "bg-red-500" },
  warning: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700 border border-amber-200", barBg: "bg-amber-500" },
  positive: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700 border border-emerald-200", barBg: "bg-emerald-500" },
  neutral: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", dot: "bg-gray-400", badge: "bg-gray-100 text-gray-600 border border-gray-200", barBg: "bg-gray-400" },
}[level] || { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", dot: "bg-gray-400", badge: "bg-gray-100 text-gray-600 border border-gray-200", barBg: "bg-gray-400" });

const ll = (l) => ({ critical: "CRITICAL", warning: "WARNING", positive: "STABLE", neutral: "INFO" }[l] || "INFO");
const le = (l) => ({ critical: "🔴", warning: "🟡", positive: "🟢", neutral: "⚪" }[l] || "⚪");
const countByLevel = (s) => ({ critical: s.filter(x => x.level === "critical").length, warning: s.filter(x => x.level === "warning").length, positive: s.filter(x => x.level === "positive").length, neutral: s.filter(x => x.level === "neutral").length });

// ─── SHARED COMPONENTS ──────────────────────────────────────────────────────

const Badge = ({ level, children, className = "" }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium ${lc(level).badge} ${className}`} style={{ fontFamily: "'Google Sans Text', sans-serif" }}>{children}</span>
);

const Card = ({ children, className = "", ...p }) => (
  <div className={`bg-white rounded-xl ${className}`} style={{ border: '1px solid var(--gw-border)', transition: 'box-shadow 0.2s' }} {...p}>{children}</div>
);

const StatBox = ({ label, value, sub, level = "neutral" }) => (
  <Card className="p-4">
    <p className="gw-overline" style={{ marginBottom: '4px' }}>{label}</p>
    <p className={`text-2xl font-bold ${lc(level).text} mt-1 gw-display`}>{value}</p>
    {sub && <p className="text-[11px] mt-1" style={{ color: 'var(--gw-text-tertiary)' }}>{sub}</p>}
  </Card>
);

// ─── THREAT MAP (LIGHT) ─────────────────────────────────────────────────────

const ThreatMap = () => (
  <Card className="p-5">
    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">Threat Proximity — JBR Sector</p>
    <div className="relative bg-gray-50 rounded-xl border border-gray-100 overflow-hidden" style={{ paddingBottom: "60%" }}>
      <svg viewBox="0 0 100 80" className="absolute inset-0 w-full h-full">
        <circle cx="50" cy="52" r="5" fill="none" stroke="rgba(239,68,68,0.12)" strokeWidth="0.3" strokeDasharray="1,1" />
        <circle cx="50" cy="52" r="15" fill="none" stroke="rgba(239,68,68,0.09)" strokeWidth="0.3" strokeDasharray="1,1" />
        <circle cx="50" cy="52" r="28" fill="none" stroke="rgba(239,68,68,0.06)" strokeWidth="0.3" strokeDasharray="1,1" />
        <text x="55.5" y="48" fill="rgba(220,38,38,0.3)" fontSize="2.2" fontFamily="system-ui">5km</text>
        <text x="65.5" y="43" fill="rgba(220,38,38,0.25)" fontSize="2.2" fontFamily="system-ui">15km</text>
        <text x="78" y="37" fill="rgba(220,38,38,0.2)" fontSize="2.2" fontFamily="system-ui">30km</text>
        <path d="M 20 55 Q 35 48, 50 49 Q 58 50, 65 45 Q 72 40, 82 38" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="0.5" />
        {THREAT_MAP_TARGETS.map((t, i) => (
          <g key={i}>
            {t.type === "home" ? (<>
              <circle cx={t.x} cy={t.y} r="2.5" fill="rgba(37,99,235,0.15)" stroke="#2563EB" strokeWidth="0.4">
                <animate attributeName="r" values="2.5;3.8;2.5" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx={t.x} cy={t.y} r="1" fill="#2563EB" />
              <text x={t.x} y={t.y - 4} textAnchor="middle" fill="#1D4ED8" fontSize="2.8" fontWeight="bold" fontFamily="system-ui">JBR ★</text>
            </>) : t.type === "strike" ? (<>
              <circle cx={t.x} cy={t.y} r="1.8" fill="rgba(239,68,68,0.15)" stroke="#DC2626" strokeWidth="0.3">
                <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <text x={t.x} y={t.y - 3} textAnchor="middle" fill="#DC2626" fontSize="1.8" fontFamily="system-ui">{t.name.split("\n")[0]}</text>
              {t.dist && <text x={t.x} y={t.y + 3.5} textAnchor="middle" fill="rgba(220,38,38,0.4)" fontSize="1.5" fontFamily="system-ui">{t.dist}</text>}
            </>) : t.type === "threat" ? (<>
              <polygon points={`${t.x},${t.y-2.2} ${t.x+2},${t.y+1.5} ${t.x-2},${t.y+1.5}`} fill="rgba(239,68,68,0.2)" stroke="#DC2626" strokeWidth="0.3">
                <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
              </polygon>
              <text x={t.x} y={t.y - 4} textAnchor="middle" fill="#DC2626" fontSize="1.8" fontWeight="bold" fontFamily="system-ui">{t.name.split("\n")[0]}</text>
              {t.dist && <text x={t.x} y={t.y + 5} textAnchor="middle" fill="rgba(220,38,38,0.4)" fontSize="1.5" fontFamily="system-ui">{t.dist}</text>}
            </>) : t.type === "military" ? (<>
              <rect x={t.x-1.5} y={t.y-1.5} width="3" height="3" fill="rgba(217,119,6,0.15)" stroke="#D97706" strokeWidth="0.3" />
              <text x={t.x} y={t.y - 3} textAnchor="middle" fill="#B45309" fontSize="1.8" fontFamily="system-ui">{t.name.split("\n")[0]}</text>
              {t.dist && <text x={t.x} y={t.y + 4.5} textAnchor="middle" fill="rgba(180,83,9,0.4)" fontSize="1.5" fontFamily="system-ui">{t.dist}</text>}
            </>) : (<>
              <circle cx={t.x} cy={t.y} r="1.5" fill="rgba(217,119,6,0.15)" stroke="#D97706" strokeWidth="0.3" />
              <text x={t.x} y={t.y - 3} textAnchor="middle" fill="#B45309" fontSize="1.8" fontFamily="system-ui">{t.name.split("\n")[0]}</text>
              {t.dist && <text x={t.x} y={t.y + 4} textAnchor="middle" fill="rgba(180,83,9,0.4)" fontSize="1.5" fontFamily="system-ui">{t.dist}</text>}
            </>)}
          </g>
        ))}
        <circle cx="5" cy="72" r="1" fill="#2563EB" /><text x="7" y="73" fill="#6B7280" fontSize="2" fontFamily="system-ui">Your Location</text>
        <circle cx="5" cy="75.5" r="1" fill="#DC2626" /><text x="7" y="76.5" fill="#6B7280" fontSize="2" fontFamily="system-ui">Confirmed Strike</text>
        <polygon points="5,78.3 6.2,80.2 3.8,80.2" fill="#DC2626" /><text x="7" y="80" fill="#6B7280" fontSize="2" fontFamily="system-ui">Declared Target</text>
      </svg>
    </div>
  </Card>
);

// ─── INTERCEPTOR GAUGE ──────────────────────────────────────────────────────

const InterceptorGauge = () => {
  const [day, setDay] = useState(17);
  const eff = Math.max(40, 95 - (day - 1) * 1.2);
  const color = eff > 80 ? "#10B981" : eff > 60 ? "#F59E0B" : "#EF4444";
  const circ = 2 * Math.PI * 45;
  return (
    <Card className="p-5">
      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">Air Defense Effectiveness (Est.)</p>
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#F3F4F6" strokeWidth="7" />
            <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="7"
              strokeDasharray={`${circ * eff / 100} ${circ * (1 - eff / 100)}`}
              strokeLinecap="round" style={{ transition: "all 0.5s" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold" style={{ color }}>{eff.toFixed(0)}%</span>
            <span className="text-[9px] text-gray-400 font-medium">intercept</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Drag to simulate depletion over time</p>
            <input type="range" min="1" max="90" value={day} onChange={e => setDay(+e.target.value)}
              className="w-full h-1.5 rounded bg-gray-200 cursor-pointer appearance-none" style={{ accentColor: color }} />
            <div className="flex justify-between text-[9px] text-gray-400 mt-1"><span>Day 1</span><span className="font-bold text-gray-700">Day {day}</span><span>Day 90</span></div>
          </div>
          <div className="text-[11px] text-gray-600 space-y-0.5">
            <p>THAAD: <span className="font-bold text-amber-700">$12M</span>/intercept</p>
            <p>Iran drone: <span className="font-bold text-red-600">~$1K</span>/unit</p>
            <p>Global THAAD/yr: <span className="font-bold text-amber-700">~650</span></p>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 mt-3">⚠ Simplified projection model for illustration only. Not official data. Actual performance depends on Iranian attack tempo, US resupply, and UAE operational decisions. UAE Ministry of Defence reports 90%+ interception rate.</p>
    </Card>
  );
};


// ─── WHAT CHANGED TODAY ─────────────────────────────────────────────────────

const WhatChangedToday = () => {
  const [expanded, setExpanded] = useState(true);
  if (!CONFLICT_DATA.whatChangedToday?.length) return null;
  return (
    <Card className="overflow-hidden mb-4" style={{ borderColor: "var(--gw-blue)", background: "var(--gw-blue-surface)" }}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 hover:bg-blue-50/50 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <span className="text-sm font-medium" style={{ color: "var(--gw-blue-text)", fontFamily: "'Google Sans', sans-serif" }}>What Changed Today — Day {CONFLICT_DATA.day}</span>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{CONFLICT_DATA.whatChangedToday.length} updates</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-blue-400" /> : <ChevronDown className="w-4 h-4 text-blue-400" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-1.5">
          {CONFLICT_DATA.whatChangedToday.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-blue-900">
              <span className="text-blue-500 font-bold mt-0.5">•</span>
              <span>{item}</span>
            </div>
          ))}
          <p className="text-[10px] text-blue-400 mt-2 pt-2 border-t border-blue-100">Updated: {CONFLICT_DATA.date} · Source: NCEMA, ACLED, verified media reports</p>
        </div>
      )}
    </Card>
  );
};

// ─── LIVE NEWS TICKER ───────────────────────────────────────────────────────

const NewsTicker = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filter, setFilter] = useState("all"); // "all", "conflict", "uae"
  const [expanded, setExpanded] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      if (data.success && data.items) {
        setNews(data.items);
        setLastUpdated(data.lastUpdated);
      }
    } catch (e) {
      console.error("News fetch error:", e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchNews(); }, []);
  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filtered = news.filter(item => {
    if (filter === "conflict") return item.isConflictRelated;
    if (filter === "uae") return item.category === "uae";
    return true;
  });

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <Newspaper className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-800">Live News Feed</span>
            {news.length > 0 && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{filtered.length}</span>}
            {expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && <span className="text-[10px] text-gray-400">Updated {timeAgo(lastUpdated)}</span>}
          <button onClick={fetchNews} disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Updating..." : "Refresh"}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* Filters */}
          <div className="flex gap-1.5 px-4 py-2 bg-gray-50 border-b border-gray-100">
            {[
              { key: "all", label: "All News" },
              { key: "conflict", label: "🔴 Conflict Related" },
              { key: "uae", label: "🇦🇪 UAE" },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                  filter === f.key ? "bg-blue-600 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                }`}>{f.label}</button>
            ))}
          </div>

          {/* News items */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading && news.length === 0 && (
              <div className="p-6 text-center">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-400">Fetching latest news from Gulf sources...</p>
              </div>
            )}
            {!loading && news.length === 0 && (
              <div className="p-6 text-center">
                <Newspaper className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-medium">No news items loaded</p>
                <button onClick={fetchNews} className="mt-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">Try Loading News</button>
              </div>
            )}
            {filtered.map((item, i) => (
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 border-b border-gray-50 hover:bg-blue-50/30 transition-colors group">
                <div className="flex-shrink-0 mt-1">
                  {item.isConflictRelated
                    ? <span className="w-2 h-2 rounded-full bg-red-500 block" />
                    : <span className="w-2 h-2 rounded-full bg-gray-300 block" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-700 transition-colors leading-snug">{item.title}</p>
                  {item.description && <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{item.description.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').slice(0, 200)}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-bold text-blue-600">{item.source}</span>
                    <span className="text-[9px] text-gray-400">{timeAgo(item.pubDate)}</span>
                    {item.isConflictRelated && <span className="text-[9px] bg-red-50 text-red-600 px-1 py-0.5 rounded font-bold">CONFLICT</span>}
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 text-gray-300 flex-shrink-0 mt-1 group-hover:text-blue-500" />
              </a>
            ))}
          </div>

          {/* Source attribution */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-[9px] text-gray-400 text-center">
              Sources: Khaleej Times · Gulf News · The National · Al Jazeera · Reuters — Auto-refreshes every 5 minutes
            </p>
          </div>
        </>
      )}
    </Card>
  );
};

// ─── DASHBOARD TAB ──────────────────────────────────────────────────────────

const DashboardTab = ({ country, city, lang: dashLang, resStatus: dashRes }) => {
  const counts = countByLevel(RISK_SIGNALS);
  const cData = GCC_DATA[country] || GCC_DATA["UAE"];
  const cyData = cData?.cities?.[city];
  const baseRisk = cyData?.risk || cData?.riskScore || 5;
  const resType = RESIDENT_TYPES[dashRes] || RESIDENT_TYPES.expat_family;
  const cRisk = Math.max(1, Math.min(5, baseRisk + (resType.riskAdjust || 0)));
  const rCol = cRisk >= 5 ? "#DC2626" : cRisk >= 4 ? "#D97706" : cRisk >= 3 ? "#2563EB" : cRisk >= 2 ? "#0891B2" : "#059669";
  const rLbl = cRisk >= 5 ? "CRITICAL" : cRisk >= 4 ? "HIGH" : cRisk >= 3 ? "ELEVATED" : cRisk >= 2 ? "MODERATE" : "LOW";
  const alertCfg = getAlertConfig(cRisk, dashRes, cData);
  const [showRegional, setShowRegional] = useState(false);

  return (
    <div className="space-y-5">
      {/* ─── HERO: RISK GAUGE + ALERT + LOCAL ASSESSMENT ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk Gauge + Alert Banner together */}
        <div className="lg:col-span-1 space-y-3">
          <Card className="p-6 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36">
              <RiskGaugeSVG risk={cRisk} color={rCol} label={rLbl} size={140} />
            </div>
            <p className="text-sm font-bold text-gray-800 mt-2">{cData.flag} {city || country}</p>
            <p className="text-[10px] text-gray-500">{resType.icon} {resType.label}</p>
            <p className="text-[10px] text-gray-400">Day {CONFLICT_DAY} · {REPORT_DATE}</p>
            {baseRisk !== cRisk && <p className="text-[9px] text-gray-400 mt-1">Base threat: {baseRisk} → Your risk: {cRisk}</p>}
          </Card>

          {/* Alert Banner — directly under gauge */}
          <div className={`rounded-xl p-4 flex items-start gap-3 shadow-sm ${alertCfg.bg}`}>
            <span className="text-xl flex-shrink-0">{alertCfg.icon}</span>
            <div>
              <p className={`font-bold text-sm ${alertCfg.dark ? "text-gray-900" : "text-white"}`}>{alertCfg.title}</p>
              <p className={`text-xs mt-1 leading-relaxed ${alertCfg.dark ? "text-gray-800/80" : "text-white/85"}`}>{alertCfg.msg}</p>
            </div>
          </div>
        </div>

        {/* Local Assessment */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Local Risk Assessment</p>
            <Badge level={cyData?.signal || "critical"}>{rLbl}</Badge>
          </div>
          {cyData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-red-50/60 border border-red-100">
                <p className="text-[10px] text-gray-500 mb-0.5">Nearest confirmed strike</p>
                <p className="text-sm font-bold text-gray-800">{cyData.nearestStrike}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                <p className="text-[10px] text-gray-500 mb-0.5">Nearest declared target</p>
                <p className="text-sm font-bold text-gray-800">{cyData.nearestTarget}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <p className="text-[10px] text-gray-500 mb-0.5">Primary evacuation route</p>
                <p className="text-sm font-bold text-gray-800">{cyData.evacRoute}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] text-gray-500 mb-0.5">Shelter guidance</p>
                <p className="text-sm font-bold text-gray-800">{cyData.shelter || `Follow ${cData.civilDefense || "civil defense"} alerts`}</p>
              </div>
              {cyData.notes && <p className="text-xs text-gray-500 sm:col-span-2 bg-gray-50 rounded-lg p-2.5 border border-gray-100">{cyData.notes}</p>}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Select a city from the header to see localized risk data.</p>
          )}
        </Card>
      </div>

      {/* WHAT CHANGED TODAY */}
      <WhatChangedToday />

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="Conflict Day" value={CONFLICT_DAY} sub="Since Feb 28" level="warning" />
        <StatBox label="Projectiles at UAE" value={CONFLICT_DATA.missiles.total.toLocaleString() + "+"} sub={`${CONFLICT_DATA.missiles.ballistic} BMs · ${CONFLICT_DATA.missiles.drones} drones`} level="warning" />
        <StatBox label="Intercept Rate" value={CONFLICT_DATA.interceptionRate} sub="Performing well" level="positive" />
        <StatBox label="Hormuz Traffic" value={CONFLICT_DATA.hormuz.traffic} sub="Near zero transits" level="warning" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="UAE Casualties" value={`${CONFLICT_DATA.casualties.killed} / ${CONFLICT_DATA.casualties.injured}`} sub="Killed / Injured in 11M" level="warning" />
        <StatBox label="Oil Price" value={CONFLICT_DATA.oil.current} sub={`From ${CONFLICT_DATA.oil.preWar} (↑55%)`} level="neutral" />
        <StatBox label="Ceasefire" value="None" sub="No talks · No channel" level="warning" />
        <StatBox label="Safe Return" value="Aug–Sep" sub="Earliest Q3 2026" level="neutral" />
      </div>


      {/* SIGNAL BAR */}
      <Card className="p-4">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2.5">Signal Summary — {RISK_SIGNALS.length} extracted</p>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-sm font-semibold text-gray-700">{counts.critical} Critical</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span className="text-sm font-semibold text-gray-700">{counts.warning} Warning</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-sm font-semibold text-gray-700">{counts.positive} Stable</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-400" /><span className="text-sm font-semibold text-gray-700">{counts.neutral} Info</span></div>
        </div>
      </Card>


      {/* THREAT MAP + INTERCEPTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ThreatMap />
        <InterceptorGauge />
      </div>


      {/* TIMELINE */}
      <Card className="p-5">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">Strike Timeline — Day 1 to {CONFLICT_DAY}</p>
        <div className="space-y-0 relative">
          <div className="absolute left-[4px] top-2 bottom-2 w-px bg-gray-200" />
          {STRIKE_TIMELINE.map((e, i) => (
            <div key={i} className="flex items-start gap-3 py-1.5 relative">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 z-10 ${lc(e.level).dot} ${i === STRIKE_TIMELINE.length - 1 ? "ring-2 ring-red-200" : ""}`} />
              <div>
                <span className="text-[10px] font-bold text-gray-400">{e.date}</span>
                <p className={`text-xs ${i === STRIKE_TIMELINE.length - 1 ? "text-red-600 font-bold" : "text-gray-600"}`}>{e.event}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>


      {/* CATEGORIES */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">Risk by Domain</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {CATEGORIES.map(cat => {
            const sigs = RISK_SIGNALS.filter(s => s.category === cat.key);
            const cc = countByLevel(sigs);
            const worst = cc.critical > 0 ? "critical" : cc.warning > 0 ? "warning" : cc.positive > 0 ? "positive" : "neutral";
            const Icon = cat.icon;
            return (
              <Card key={cat.key} className={`p-3 ${lc(worst).bg} border ${lc(worst).border}`}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon className={`w-3.5 h-3.5 ${lc(worst).text}`} />
                  <span className="text-xs font-semibold text-gray-700 truncate">{cat.key}</span>
                </div>
                <div className="flex gap-2 text-[11px]">
                  {cc.critical > 0 && <span className="text-red-600 font-semibold">🔴{cc.critical}</span>}
                  {cc.warning > 0 && <span className="text-amber-600 font-semibold">🟡{cc.warning}</span>}
                  {cc.positive > 0 && <span className="text-emerald-600 font-semibold">🟢{cc.positive}</span>}
                </div>
              </Card>
            );
          })}
        </div>
      </div>


      {/* ESCAPE ROUTES */}
      <Card className="p-5">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">Escape Routes — Departure Options</p>
        <div className="space-y-2">
          {ESCAPE_ROUTES.map((r, i) => {
            const sc = r.status === "active" ? "text-emerald-600 bg-emerald-50" : r.status === "limited" ? "text-amber-600 bg-amber-50" : r.status === "open" ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50";
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white transition-colors">
                {r.type === "air" ? <Plane className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" /> : <Navigation className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{r.name}</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${sc}`}>{r.status}</span>
                  </div>
                  <p className="text-xs text-gray-500">{r.detail}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{r.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>


      {/* SUPPLY CHAIN */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Supply Chain & Infrastructure</p>
          <span className="text-[9px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Estimates based on open-source reports</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SUPPLY_STATUS.map((s, i) => {
            const Icon = s.icon; const c = lc(s.status);
            return (
              <div key={i} className={`p-3 rounded-xl border ${c.border} ${c.bg}`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon className={`w-3.5 h-3.5 ${c.text}`} />
                  <span className="text-xs font-semibold text-gray-700">{s.name}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                  <div className={`h-1.5 rounded-full ${c.barBg}`} style={{ width: `${s.value}%`, transition: "width 0.5s" }} />
                </div>
                <p className={`text-xs font-bold ${c.text}`}>{s.value}{s.unit}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{s.detail}</p>
              </div>
            );
          })}
        </div>
      </Card>


      {/* FORECAST */}
      <Card className="p-5">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">3–6 Month Probability Forecast</p>
        <div className="space-y-2">
          {FORECAST.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <Badge level={f.level} className="w-24 justify-center">{f.prob}</Badge>
              <span className="text-sm text-gray-700 flex-1">{f.scenario}</span>
              <span className="text-xs text-gray-400 hidden sm:inline">{f.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── LIVE NEWS FEED ───────────────────────────────────────── */}
      <NewsTicker />


      {/* ─── GCC REGIONAL RISK TABLE ──────────────────────────────── */}
      <Card className="overflow-hidden">
        <button onClick={() => setShowRegional(!showRegional)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-800">GCC & Middle East Risk Overview</span>
            <span className="text-[10px] text-gray-400">{Object.keys(GCC_DATA).length} countries · {Object.values(GCC_DATA).reduce((a, c) => a + Object.keys(c.cities).length, 0)} cities</span>
          </div>
          {showRegional ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {showRegional && (
          <div className="border-t border-gray-100">
            {/* Scrollable horizontal on mobile */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-4 py-2.5">Location</th>
                    <th className="text-center text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-3 py-2.5">Risk</th>
                    <th className="text-left text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-3 py-2.5">Nearest Strike</th>
                    <th className="text-left text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-3 py-2.5">Key Threat</th>
                    <th className="text-center text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-3 py-2.5">Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(GCC_DATA).map(([countryKey, cty]) =>
                    Object.entries(cty.cities).map(([cityName, cd], idx) => {
                      const isCurrentCity = countryKey === country && cityName === city;
                      const rc = cd.risk >= 5 ? "text-red-600" : cd.risk >= 4 ? "text-amber-600" : cd.risk >= 3 ? "text-blue-600" : "text-emerald-600";
                      const rb = cd.risk >= 5 ? "bg-red-50" : cd.risk >= 4 ? "bg-amber-50" : cd.risk >= 3 ? "bg-blue-50" : "bg-emerald-50";
                      return (
                        <tr key={`${countryKey}-${cityName}`}
                          className={`border-t border-gray-50 hover:bg-gray-50 transition-colors ${isCurrentCity ? "bg-blue-50/50 ring-1 ring-inset ring-blue-200" : ""}`}>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{cty.flag}</span>
                              <div>
                                <p className={`text-xs font-semibold ${isCurrentCity ? "text-blue-700" : "text-gray-800"}`}>
                                  {cityName} {isCurrentCity && <span className="text-[9px] text-blue-500 ml-1">← YOU</span>}
                                </p>
                                {idx === 0 && <p className="text-[10px] text-gray-400">{cty.name}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-black ${rb} ${rc}`}>
                              {cd.risk}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="text-xs text-gray-700 max-w-[180px] truncate">{cd.nearestStrike}</p>
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="text-xs text-gray-700 max-w-[180px] truncate">{cd.nearestTarget}</p>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <Badge level={cd.signal}>{cd.risk >= 5 ? "LEAVE" : cd.risk >= 4 ? "PREPARE" : cd.risk >= 3 ? "MONITOR" : "STAY"}</Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {/* Country-level summaries */}
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Country Advisory Summary</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(GCC_DATA).map(([k, v]) => {
                  const rc = v.riskScore >= 5 ? "border-red-200 bg-red-50/50" : v.riskScore >= 4 ? "border-amber-200 bg-amber-50/50" : "border-blue-200 bg-blue-50/50";
                  return (
                    <div key={k} className={`p-2.5 rounded-lg border ${rc}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{v.flag}</span>
                        <span className="text-xs font-bold text-gray-800">{v.name}</span>
                        <span className={`text-[10px] font-bold ml-auto ${v.riskScore >= 5 ? "text-red-600" : v.riskScore >= 4 ? "text-amber-600" : "text-blue-600"}`}>L{v.riskScore}</span>
                      </div>
                      <p className="text-[10px] text-gray-600">{v.advisory}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Card>

    </div>
  );
};

// ─── FULL ANALYSIS ──────────────────────────────────────────────────────────

const FullAnalysisTab = () => {
  const [open, setOpen] = useState({});
  const [filterLevel, setFilterLevel] = useState("all");
  const [searchText, setSearchText] = useState("");
  const toggle = (id) => setOpen(p => ({ ...p, [id]: !p[id] }));
  const filtered = ACCORDION_SECTIONS.filter(s => {
    if (filterLevel !== "all" && s.worstLevel !== filterLevel) return false;
    if (searchText && !s.title.toLowerCase().includes(searchText.toLowerCase()) && !s.content.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search analysis..." value={searchText} onChange={e => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["all", "critical", "warning", "positive", "neutral"].map(l => (
            <button key={l} onClick={() => setFilterLevel(l)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                filterLevel === l ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}>{l === "all" ? "All" : le(l) + " " + ll(l)}</button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {filtered.map((s, idx) => {
          const isOpen = open[s.id]; const c = lc(s.worstLevel);
          return (
            <Card key={s.id} className={`overflow-hidden transition-all duration-300 ${isOpen ? "border-" + (s.worstLevel === "critical" ? "red" : s.worstLevel === "warning" ? "amber" : "gray") + "-300" : ""}`}>
              <button onClick={() => toggle(s.id)}
                className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors ${isOpen ? c.bg : ""}`}>
                <span className="text-xs font-medium text-gray-400 w-5">{idx + 1}.</span>
                {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                <span className="text-sm font-semibold text-gray-800 flex-1">{s.title}</span>
                <Badge level={s.worstLevel}>{ll(s.worstLevel)}</Badge>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line pl-9 pt-3">{s.content}</div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ─── AI ANALYST ─────────────────────────────────────────────────────────────

// ─── RICH MESSAGE RENDERER ──────────────────────────────────────────────────

const FormattedMessage = ({ text }) => {
  // Parse markdown-like AI responses into styled React elements
  const renderLine = (line, idx) => {
    // Main header (## )
    if (line.startsWith("## ")) {
      const headerText = line.slice(3);
      // Special styling for action/recommendation headers
      if (headerText.includes("⚡") || headerText.includes("Action") || headerText.includes("Recommend")) {
        return (
          <div key={idx} className="mt-4 mb-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <p className="text-sm font-bold text-blue-800">{renderInlineFormatting(headerText)}</p>
          </div>
        );
      }
      if (headerText.includes("📅") || headerText.includes("Date") || headerText.includes("Timeline")) {
        return (
          <div key={idx} className="mt-4 mb-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <p className="text-sm font-bold text-gray-700">{renderInlineFormatting(headerText)}</p>
          </div>
        );
      }
      return <p key={idx} className="text-sm font-bold text-gray-800 mt-4 mb-1.5 border-b border-gray-100 pb-1">{renderInlineFormatting(headerText)}</p>;
    }

    // Risk verdict line
    if (line.includes("RISK VERDICT")) {
      const isCritical = line.includes("🔴") || line.includes("CRITICAL");
      const isWarning = line.includes("🟡") || line.includes("ELEVATED");
      const isPositive = line.includes("🟢") || line.includes("MANAGEABLE");
      const bg = isCritical ? "bg-red-50 border-red-200" : isWarning ? "bg-amber-50 border-amber-200" : isPositive ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200";
      const textColor = isCritical ? "text-red-700" : isWarning ? "text-amber-700" : isPositive ? "text-emerald-700" : "text-gray-700";
      return (
        <div key={idx} className={`rounded-lg border px-3 py-2.5 mb-3 ${bg}`}>
          <p className={`text-sm font-bold ${textColor}`}>{renderInlineFormatting(line.replace(/\*\*/g, ""))}</p>
        </div>
      );
    }

    // Numbered list items (1. 2. 3.)
    if (/^\d+\.\s/.test(line.trim())) {
      const num = line.trim().match(/^(\d+)\./)[1];
      const rest = line.trim().replace(/^\d+\.\s*/, "");
      // Detect if it's inside an action box (has risk indicator or bold)
      const hasIndicator = rest.startsWith("🔴") || rest.startsWith("🟡") || rest.startsWith("🟢") || rest.startsWith("⚪");
      return (
        <div key={idx} className="flex items-start gap-2.5 py-1 pl-1">
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{num}</span>
          <p className="text-sm text-gray-700 flex-1">{renderInlineFormatting(rest)}</p>
        </div>
      );
    }

    // Bullet points with risk indicators
    if (line.trim().startsWith("- 🔴") || line.trim().startsWith("- 🟡") || line.trim().startsWith("- 🟢") || line.trim().startsWith("- ⚪")) {
      const content = line.trim().slice(2);
      const emoji = content.slice(0, 2);
      const rest = content.slice(2).trim();
      const bg = emoji === "🔴" ? "bg-red-50 border-red-100" : emoji === "🟡" ? "bg-amber-50 border-amber-100" : emoji === "🟢" ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-100";
      return (
        <div key={idx} className={`flex items-start gap-2 py-1.5 px-2.5 rounded-lg border ${bg} my-0.5`}>
          <span className="text-sm flex-shrink-0">{emoji}</span>
          <p className="text-sm text-gray-700 flex-1">{renderInlineFormatting(rest)}</p>
        </div>
      );
    }

    // Regular bullets
    if (line.trim().startsWith("- ")) {
      const content = line.trim().slice(2);
      return (
        <div key={idx} className="flex items-start gap-2 py-0.5 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2" />
          <p className="text-sm text-gray-700">{renderInlineFormatting(content)}</p>
        </div>
      );
    }

    // Standalone risk indicator lines (🔴 Something, 🟡 Something)
    if (line.trim().match(/^[🔴🟡🟢⚪]\s/)) {
      const emoji = line.trim().slice(0, 2);
      const rest = line.trim().slice(2);
      const bg = emoji === "🔴" ? "bg-red-50 border-red-100" : emoji === "🟡" ? "bg-amber-50 border-amber-100" : emoji === "🟢" ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-100";
      return (
        <div key={idx} className={`flex items-start gap-2 py-1.5 px-2.5 rounded-lg border ${bg} my-0.5`}>
          <span className="text-sm flex-shrink-0">{emoji}</span>
          <p className="text-sm text-gray-700 flex-1">{renderInlineFormatting(rest)}</p>
        </div>
      );
    }

    // Horizontal divider
    if (line.trim() === "---") return <div key={idx} className="border-t border-gray-200 my-3" />;

    // Empty lines = spacing
    if (line.trim() === "") return <div key={idx} className="h-1.5" />;

    // Regular paragraph
    return <p key={idx} className="text-sm text-gray-700 py-0.5 leading-relaxed">{renderInlineFormatting(line)}</p>;
  };

  // Handle **bold**, *italic*, numbers, and inline formatting
  const renderInlineFormatting = (text) => {
    if (!text) return null;
    // Split by **bold** and *italic* markers
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const inner = part.slice(2, -2);
        if (inner.includes("CRITICAL") || inner.includes("EXTREME") || inner.includes("LEAVE") || inner.includes("IMMEDIATELY") || inner.includes("NOT MET")) {
          return <span key={i} className="font-bold text-red-700">{inner}</span>;
        }
        if (inner.includes("WARNING") || inner.includes("ELEVATED") || inner.includes("MONITOR")) {
          return <span key={i} className="font-bold text-amber-700">{inner}</span>;
        }
        if (inner.includes("STABLE") || inner.includes("POSITIVE") || inner.includes("SAFE")) {
          return <span key={i} className="font-bold text-emerald-700">{inner}</span>;
        }
        if (/\d/.test(inner) || inner.includes("%") || inner.includes("$") || inner.includes("km")) {
          return <span key={i} className="font-bold text-blue-700">{inner}</span>;
        }
        return <span key={i} className="font-bold text-gray-900">{inner}</span>;
      }
      if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
        return <span key={i} className="italic text-gray-500">{part.slice(1, -1)}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const lines = text.split("\n");
  return <div className="space-y-0">{lines.map((line, i) => renderLine(line, i))}</div>;
};

// ─── OFFLINE FALLBACK ANSWERS ────────────────────────────────────────────────
// Pre-built formatted answers using report data so the analyst works even without API

const FALLBACK_ANSWERS = {
  "What is the current risk level for JBR?": `**RISK VERDICT: 🔴 CRITICAL — Level 5 / EXTREME / Immediate Civilian Danger**

## Threat Assessment for JBR

🔴 JBR sits at the nexus of multiple confirmed strike zones — this is the highest possible risk level.

## Proximity to Confirmed Strikes

🔴 **Palm Jumeirah Fairmont** — struck by Shahed drone March 1 — only **~3 km** from JBR. This is the closest documented strike.
🔴 **Jebel Ali Port** — **~15–25 km** SW of JBR. Iran named it a **"legitimate target"** on March 14 and urged civilian evacuation. The 2021 container explosion shockwave reached JBR.
🟡 **Burj Al Arab** — **~8 km** south — sustained debris damage from interceptions.
🟡 **Al Minhad Air Base** — **~40 km** SE — struck by Iranian missiles.

## Active Dangers for JBR Residents

🔴 **Interception debris** — **131 of 141** UAE injuries are from falling debris, not direct strikes. Interceptions happen over populated areas including JBR.
🔴 **High-rise glass vulnerability** — JBR's 40 towers have extensive glass curtain walls. Flying glass is the **primary urban injury mechanism** in blast scenarios. No bomb shelters exist.
🔴 **Shelter-in-place alerts** issued multiple times daily. Children in distance learning since March 1. Filming during alerts = criminal offense.

## ⚡ Recommended Action
1. **Leave JBR immediately** — book the earliest available flight to Europe
2. Have an **Oman land route planned** as backup (Muscat ~4.5 hours)
3. Until departure: stay on **ground floor away from glass** during NCEMA alerts`,

  "Should I leave now or wait?": `**RISK VERDICT: 🔴 CRITICAL — Leave now. Do not wait.**

## Why Waiting Is Dangerous

🔴 **The departure window is closing.** DXB airport has been struck **3 times** in 16 days. Each strike suspends flights for **7+ hours**. UAE airspace has shut down entirely **3 times**.
🔴 **All Western carriers have suspended service** — BA, Lufthansa, KLM, Air France, Air Canada, Singapore Airlines, Air India.
🔴 **Emirates at 60% capacity** with sudden cancellations on each attack wave.
🔴 **No ceasefire in sight** — Iran FM on March 15: "We never asked for a ceasefire." Trump: operations continue at least **3 more weeks**.

## What Gets Worse Each Day You Wait

🔴 **Air defense depletion** — THAAD interceptors cost **$12M each**, global production only **~650/year**. UAE is rationing. The defensive shield weakens every day.
🟡 **Houthi entry 65–75% probable** within 4–8 weeks — would create overwhelming two-front threat.
🟡 **Iran shifting to heavier 1,000+ kg warheads** and coordinated swarms to saturate defenses.

## Every Government Says Leave Now

🔴 **Australia**: "DO NOT TRAVEL — Don't wait until it's too late"
🔴 **Canada**: "Leave while commercial options still available"
🔴 **US**: Embassy closed, evacuation flights operating since March 4
🔴 **UK**: Planning contingency evacuation of 50,000 Britons

## ⚡ Recommended Action
1. Book the **earliest available flight today** — Emirates, Etihad, or flydubai to any European hub
2. Book **refundable tickets on multiple carriers** — don't rely on one booking
3. If flights unavailable: **drive to Muscat, Oman (~4.5 hours)** and fly from there`,

  "What are the biggest red flags?": `**RISK VERDICT: 🔴 CRITICAL — Multiple simultaneous red flags unprecedented in Gulf history**

## Top Red Flags (Ranked by Severity)

🔴 **Iran named Jebel Ali "legitimate target" (March 14)** — signals shift from military to civilian infrastructure targeting. Jebel Ali is 25 km from JBR with desalination, power, and oil storage.

🔴 **Interceptor depletion crisis** — UAE has "burned through a significant chunk of stockpile that took years to build." THAAD: **$12M/interceptor** vs Iran drones at **$1K each**. US "stonewalling" replenishment. Shield is degrading daily.

🔴 **No ceasefire mechanism exists** — no negotiations, no back-channel, no off-ramps. Iran FM: "We never asked for a ceasefire." This breaks the pattern of every previous Gulf crisis.

🔴 **DXB airport struck 3 times** — today (March 16) a fuel tank caught fire. Departure window is unreliable and could close without warning.

🔴 **Houthi entry 65–75% probable** — would create dual chokepoint (Hormuz + Bab el-Mandeb) and two-front attack overwhelming single-axis air defense.

🟡 **Water reserves only 45 days** — desalination plants are potential targets. Would create humanitarian crisis.

🟡 **Russian Geran-2 drone variants** with jam-resistant navigation found in debris — evolving threat.

🟡 **Cyber operations escalating** — IRGC targeting Google, Oracle, IBM, Amazon infrastructure in UAE. Banking/telecom disruptions expected.

## ⚡ Recommended Action
1. Treat every red flag as confirmation: **depart immediately**
2. Do not wait for one specific trigger — the accumulation of signals is the trigger
3. Prepare for **3–4 month absence minimum** — earliest return late Q3 2026`,

  "How long should I stay away?": `**RISK VERDICT: 🟡 ELEVATED — Plan for minimum 3–4 months away**

## Return Timeline Analysis

## 📅 Key Dates
- **Now → May 2026**: Active combat phase. **85–90%** probability of continued attacks.
- **May → June 2026**: Possible intensity decline if Iran stockpiles degrade. Ceasefire probability only **25–30%** by June.
- **June → Sep 2026**: Political pressure builds (US midterms Nov 2026). Ceasefire **40–50%** by September.
- **Late Q3 2026 (Aug–Sep)**: **Earliest plausible return window** under optimistic scenario.
- **Q1 2027**: Return to pre-war normalcy unlikely before this date even in best case.

## Return Criteria — ALL Must Be Met

🔴 Verified ceasefire for **30+ days** — currently **NOT MET**
🔴 Strait of Hormuz reopened — currently **NOT MET**
🔴 Embassy advisories at Level 2 or below — currently **NOT MET**
🔴 Airlines operating normal schedules — currently **NOT MET**
🔴 Travel insurance reinstated — currently **NOT MET**

## Three Scenarios

🟢 **Optimistic (25–30%)**: Ceasefire in 4–6 weeks. Even then, Hormuz takes weeks to reopen, airlines months to normalize. Return: **late Q3 2026**.
🟡 **Base case (40–45%)**: 2–4 month air campaign with declining intensity. Return: **Q4 2026 at earliest**.
🔴 **Pessimistic (15–20%)**: Ground troops, full Houthi entry, infrastructure targeting, regime collapse. Return: **2027 or beyond**.

## ⚡ Recommended Action
1. Plan for **3–4 month relocation to Spain** — aligns with minimum reasonable horizon
2. Monitor conditions using NCEMA app, FlightRadar24, and embassy alerts
3. Do not return until **ALL five return criteria** are confirmed met`,

  "What's the worst-case scenario?": `**RISK VERDICT: 🔴 CRITICAL — Pessimistic scenario has 15–20% probability**

## Worst-Case Scenario (15–20% Probability)

🔴 **US ground troops deployed to Iran** — **15–25%** probability if no ceasefire by May. Transforms conflict from air campaign to generational commitment.
🔴 **Full Houthi entry** — **65–75%** within 4–8 weeks. Creates simultaneous closure of **Strait of Hormuz AND Bab el-Mandeb**. UAE faces fire from TWO directions (Iran east, Yemen south).
🔴 **Systematic targeting of Gulf infrastructure** — desalination plants (**45-day water reserves only**), power stations, more airports. Humanitarian crisis.
🔴 **Iranian regime collapse** — **20–30%** in 2026–2027. Creates years of regional instability with proxy groups acting independently.

## What This Means for JBR

🔴 Air defense **completely overwhelmed** by two-front attack
🔴 Jebel Ali complex struck — shockwave, power outage, water supply disrupted
🔴 Airport **closed indefinitely** — land evacuation only option
🔴 Dubai's global hub status faces **existential challenge**
🔴 Property values collapse; pre-war normalcy **years away**

## Historical Context

⚪ This war has **no precedent**: 1,800+ projectiles in 17 days vs Gulf War's 88 Scuds in 6 weeks. Hormuz 90% closed in 2 weeks vs Tanker War's 2% over 7 years. Killing Khamenei removed all off-ramps that contained previous crises.

## ⚡ Recommended Action
1. **Leave before the worst case materializes** — you cannot evacuate during it
2. Ensure **land route to Oman is prepared** as airport backup
3. Have **90+ days of cash, medications, documents** ready regardless`,

  "Is the airport safe to fly from?": `**RISK VERDICT: 🔴 CRITICAL — DXB is operational but has been struck 3 times**

## Dubai International Airport Status

🔴 **Struck by drones on March 7 and March 16 (today)** — fuel tank fire. This is the **3rd drone incident** since the war began.
🔴 Flights suspended for **7+ hours** after today's strike.
🔴 UAE airspace has been **closed entirely 3 times** in 16 days due to attacks.
🟡 Emirates operating at **~60% capacity** to approximately **110 destinations**. Subject to sudden cancellation with each attack.

## Airline Status

🔴 **SUSPENDED**: British Airways, Lufthansa, KLM, Air France, Air Canada, Singapore Airlines, Air India — all through late March or beyond.
🟡 **OPERATING (limited)**: Emirates, Etihad, flydubai — reduced schedules, unreliable.
🟢 **Alternative**: US government evacuation flights from Abu Dhabi & Dubai since March 4.

## The Critical Risk

⚪ The accidental shootdown of **Ukraine Airlines Flight 752** during the 2020 Soleimani crisis killed **176 people** — a reminder that civilian air traffic in active conflict zones carries catastrophic risk. The 2026 conflict is orders of magnitude more intense.

🔴 MARAD classifies Persian Gulf threat as **CRITICAL — "an attack is almost inevitable."**

## ⚡ Recommended Action
1. **Fly anyway — the risk of staying is greater than the risk of flying out.** Every government agrees.
2. Book **earliest available departure** — expect delays and cancellations. Have backup bookings.
3. If DXB closes: **drive to Muscat, Oman (~4.5h)** or use **Abu Dhabi** as alternative departure`,

  "What are the departure options?": `**RISK VERDICT: 🟡 ELEVATED — Options exist but are unreliable and narrowing**

## Air Options (Primary)

🟡 **Emirates** — Reduced to ~110 destinations at 60% capacity. Book to **Madrid, Barcelona, Malaga** or any European hub. Subject to sudden cancellation.
🟡 **Etihad / flydubai** — Limited operations. Supplement with Emirates bookings.
🟢 **Via connecting hubs** — Istanbul, Athens, Rome are receiving diverted Gulf traffic. Multiple carriers.
🟢 **US government evacuation flights** — Operating from Abu Dhabi & Dubai since March 4. US citizens priority.

## Land Options (Backup)

🟢 **Dubai → Muscat, Oman**: **~4.5 hours drive**. Border open but congested. Fly from Muscat (less targeted).
🟢 **Dubai → Salalah, Oman**: **~10 hours drive**. Greater distance from conflict zone.
🟡 **Saudi Arabia routes**: Saudi-Bahrain and Saudi-Jordan available but cross areas also under threat.

## Booking Strategy

- Book **fully refundable tickets on MULTIPLE carriers** — don't rely on one
- Book **multiple dates** — expect cancellations
- Have **land route to Oman pre-planned** with full tank of fuel
- Consider **Abu Dhabi airport** as alternative to DXB

## ⚡ Recommended Action
1. Book **3 different flights** on different carriers/dates — first available to any European destination
2. Pack **go-bag now**: passports, cash, 90-day medications, digital doc copies
3. Register at **step.state.gov** (US) or equivalent for your nationality`,

  "When would it be safe to return?": `**RISK VERDICT: 🟡 ELEVATED — Earliest return late Q3 2026 under best-case scenario**

## Five Return Criteria (ALL Must Be Met)

🔴 **1. Verified ceasefire for 30+ days** — Currently: NO ceasefire, no negotiations, no channel. Status: NOT MET
🔴 **2. Strait of Hormuz reopened** — Currently: 94% traffic collapse, IRGC threatening to "set ablaze" any vessel. Status: NOT MET
🔴 **3. Embassy advisories at Level 2 or below** — Currently: US Level 3, Australia "DO NOT TRAVEL," UK "against all but essential." Status: NOT MET
🔴 **4. Commercial airlines normal schedules** — Currently: all Western carriers suspended, Emirates at 60%. Status: NOT MET
🔴 **5. Travel insurance reinstated** — Currently: UK/US insurers will not cover UAE. Status: NOT MET

## Projected Timeline

## 📅 Key Dates
- **March–May 2026**: Active combat. 85–90% probability attacks continue.
- **June 2026**: Ceasefire probability only 25–30%.
- **September 2026**: Ceasefire probability rises to 40–50% (US midterm pressure).
- **Aug–Sep 2026**: Earliest plausible return if optimistic scenario plays out.
- **Q1 2027**: Pre-war normalcy unlikely before this date.

⚪ Even after a ceasefire, **physical safety and economic recovery operate on different timescales**. Collapsed tourism, port disruption, property pressure, and business relocation persist for quarters or years.

## ⚡ Recommended Action
1. Plan for **3–4 month minimum** — do NOT set a return date yet
2. Monitor the **five criteria above** using NCEMA, embassy alerts, FlightRadar24
3. Do not return based on "things seem quieter" — wait for **ALL five criteria confirmed**`,
};

// Match user question to best fallback answer
const findFallbackAnswer = (question) => {
  const q = question.toLowerCase();
  const keys = Object.keys(FALLBACK_ANSWERS);

  // Direct match
  for (const key of keys) {
    if (q === key.toLowerCase()) return FALLBACK_ANSWERS[key];
  }

  // Keyword matching
  if (q.includes("risk level") || q.includes("how dangerous") || q.includes("safe is jbr") || q.includes("threat level")) return FALLBACK_ANSWERS["What is the current risk level for JBR?"];
  if (q.includes("leave now") || q.includes("should i leave") || q.includes("should we leave") || q.includes("stay or") || q.includes("or wait") || q.includes("should i go")) return FALLBACK_ANSWERS["Should I leave now or wait?"];
  if (q.includes("red flag") || q.includes("biggest risk") || q.includes("most dangerous") || q.includes("warning sign") || q.includes("biggest threat")) return FALLBACK_ANSWERS["What are the biggest red flags?"];
  if (q.includes("how long") || q.includes("stay away") || q.includes("duration") || q.includes("months")) return FALLBACK_ANSWERS["How long should I stay away?"];
  if (q.includes("worst case") || q.includes("worst-case") || q.includes("worst scenario") || q.includes("pessimistic")) return FALLBACK_ANSWERS["What's the worst-case scenario?"];
  if (q.includes("airport") || q.includes("fly") || q.includes("flight") || q.includes("dxb") || q.includes("safe to fly")) return FALLBACK_ANSWERS["Is the airport safe to fly from?"];
  if (q.includes("departure") || q.includes("escape") || q.includes("options") || q.includes("how to leave") || q.includes("route") || q.includes("get out")) return FALLBACK_ANSWERS["What are the departure options?"];
  if (q.includes("return") || q.includes("come back") || q.includes("go back") || q.includes("when safe") || q.includes("when can")) return FALLBACK_ANSWERS["When would it be safe to return?"];

  // Generic fallback
  return `**RISK VERDICT: 🔴 CRITICAL — Level 5 / EXTREME**

I can answer questions about the GCC war risk analysis based on the two research reports dated March 16, 2026.

## Topics I Can Help With

- 🔴 Current risk level for JBR and Dubai
- 🔴 Whether to leave now and departure options
- 🟡 Biggest red flags and warning signs
- 🟡 How long to stay away / when to return
- 🔴 Airport safety and flight availability
- 🟡 Worst-case and best-case scenarios
- ⚪ Air defense status, Hormuz closure, Houthi risk, cyber threats, economic impact

## ⚡ Recommended Action
1. Try asking one of the suggested questions below
2. The core recommendation from both reports: **leave Dubai immediately** and relocate to Spain for 3–4 months`;
};

// ─── AI ANALYST TAB ─────────────────────────────────────────────────────────

const AIAnalystTab = ({ country, city, resStatus: aiRes }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("auto"); // "auto" tries API first, "offline" uses fallback only
  const chatEndRef = useRef(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    if (!text.trim()) return;
    const um = { role: "user", content: text.trim() };
    const upd = [...messages, um];
    setMessages(upd); setInput(""); setLoading(true);

    // If offline mode, use fallback immediately
    if (mode === "offline") {
      const answer = findFallbackAnswer(text.trim());
      setMessages(p => [...p, { role: "assistant", content: answer }]);
      setLoading(false);
      return;
    }

    // Try API first, fallback if it fails
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildMainSystemPrompt(country || "UAE", city || "Dubai", aiRes || "expat_family"),
          messages: upd.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const ai = data.content?.map(b => b.text || "").filter(Boolean).join("\n");

      if (ai && ai.length > 10) {
        setMessages(p => [...p, { role: "assistant", content: ai }]);
      } else {
        throw new Error("Empty response");
      }
    } catch (err) {
      // API failed — use offline fallback with a note
      const fallback = findFallbackAnswer(text.trim());
      const answer = `${fallback}\n\n---\n⚪ *Answered from embedded report data (API unavailable: ${err.message}). Responses are based on the same two research reports.*`;
      setMessages(p => [...p, { role: "assistant", content: answer }]);
      // Auto-switch to offline to avoid repeated failures
      setMode("offline");
    }
    setLoading(false);
  };
  return (
    <div className="flex flex-col h-[calc(100vh-180px)] min-h-[500px]">
      {/* Mode toggle */}
      <div className="flex items-center justify-between pb-3 mb-1 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700">AI Security Analyst</span>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setMode("auto")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors ${mode === "auto" ? "bg-white text-gray-700 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
            Live AI
          </button>
          <button onClick={() => setMode("offline")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors ${mode === "offline" ? "bg-white text-gray-700 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
            Offline
          </button>
        </div>
      </div>

      {mode === "offline" && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg mb-2 text-xs text-amber-700">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Offline mode — answering from embedded report data. Switch to Live AI when API is available.</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-7 h-7 text-blue-500" />
            </div>
            <p className="text-gray-800 font-semibold text-base mb-1">Ask About the Risk Analysis</p>
            <p className="text-gray-400 text-sm mb-1">Responses include risk indicators, key data, and action items</p>
            <p className="text-gray-300 text-xs mb-6">{mode === "offline" ? "📴 Offline mode — answers from report data" : "🟢 Will try Live AI, falls back to offline if unavailable"}</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-xl mx-auto">
              {STARTER_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => send(q)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm hover:shadow">{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="max-w-[90%] sm:max-w-[80%]">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Analyst</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3.5 shadow-sm">
                  <FormattedMessage text={m.content} />
                </div>
              </div>
            )}
            {m.role === "user" && (
              <div className="max-w-[85%] sm:max-w-[70%] bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 text-sm">{m.content}</div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Analyzing...</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-4 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-sm text-gray-400">Assessing risk data...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      {messages.length > 0 && messages.length < 6 && (
        <div className="flex gap-2 pb-2 overflow-x-auto">{STARTER_QUESTIONS.filter(q => !messages.some(m => m.role === "user" && m.content === q)).slice(0, 4).map((q, i) => (
          <button key={i} onClick={() => send(q)} className="flex-shrink-0 px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-500 hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap transition-colors">{q}</button>
        ))}</div>
      )}
      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !loading && send(input)}
          placeholder="Ask about the risk analysis..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading} />
        <button onClick={() => send(input)} disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── LIVE INTEL ─────────────────────────────────────────────────────────────

const LiveIntelTab = () => {
  const [items, setItems] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState(null);

  // Helper: extract ALL text from API response (handles text, tool_result, etc.)
  const extractText = (data) => {
    if (!data?.content) return "";
    return data.content
      .map(block => {
        if (block.type === "text") return block.text || "";
        if (block.type === "web_search_tool_result" && block.content) {
          return block.content.map(c => c.text || c.title || "").join("\n");
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  };

  const fetchIntel = async () => {
    setLoading(true); setError(null); setItems([]); setAssessment(null);

    try {
      // STEP 1: Web search to gather raw intelligence
      setLoadingStep("Searching latest sources...");
      const searchRes = await fetch(API_URL, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{
            role: "user",
            content: "Search for the very latest news and developments on these topics: Iran UAE war attacks March 2026, Dubai airport status, Strait of Hormuz shipping closure, Houthi Red Sea attacks, UAE travel advisory updates, and Gulf oil prices. Summarize what you find with source names and dates."
          }],
        }),
      });

      if (!searchRes.ok) {
        const errData = await searchRes.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API error ${searchRes.status}`);
      }

      const searchData = await searchRes.json();
      const rawIntel = extractText(searchData);

      if (!rawIntel || rawIntel.length < 20) {
        throw new Error("No search results returned. Try again shortly.");
      }

      // STEP 2: Format raw intel into structured JSON (no web search needed)
      setLoadingStep("Analyzing intelligence...");
      const formatRes = await fetch(API_URL, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a geopolitical intelligence analyst. Below is raw intelligence gathered from web search. Format it into the JSON structure below. Classify each news item's signal: "critical" (escalation/danger), "warning" (concern), "positive" (de-escalation), or "neutral" (informational).

RAW INTELLIGENCE:
${rawIntel.slice(0, 3500)}

Respond with ONLY this JSON (no markdown, no backticks, no explanation):
{"assessment":{"direction":"escalation","summary":"1-2 sentence overall assessment","departure_change":"Whether departure recommendation changes"},"items":[{"headline":"short headline","source":"source name","date":"date","summary":"2-line summary","signal":"critical","impact":"one-line impact assessment"}]}`
          }],
        }),
      });

      if (!formatRes.ok) {
        // If formatting fails, show raw results as fallback
        setItems([{ headline: "Raw Intelligence Retrieved", source: "Web Search", date: "Today", summary: rawIntel.slice(0, 400), signal: "neutral", impact: "See full text above for details." }]);
        setLoading(false);
        return;
      }

      const formatData = await formatRes.json();
      const formattedText = extractText(formatData);
      const cleanJson = formattedText.replace(/```json|```/g, "").trim();

      try {
        const parsed = JSON.parse(cleanJson);
        setItems(parsed.items || []);
        setAssessment(parsed.assessment || null);
      } catch (parseErr) {
        // JSON parsing failed — show raw intel as fallback cards
        const lines = rawIntel.split("\n").filter(l => l.trim().length > 20);
        setItems(lines.slice(0, 6).map((line, i) => ({
          headline: line.slice(0, 80) + (line.length > 80 ? "..." : ""),
          source: "Web Search",
          date: "March 2026",
          summary: line.slice(0, 200),
          signal: "neutral",
          impact: "Raw search result — see full text for context"
        })));
      }
    } catch (err) {
      setError(err.message || "Failed to fetch intelligence. Please try again.");
    }
    setLoading(false);
    setLoadingStep("");
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Live Intelligence Feed</p>
        <button onClick={fetchIntel} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Scanning..." : "Refresh Intel"}
        </button>
      </div>
      {error && <Card className="p-4 bg-red-50 border-red-200 text-red-700 text-sm"><p className="font-semibold mb-1">Connection Issue</p><p>{error}</p><p className="text-xs text-red-500 mt-2">The Live Intel feature calls the Anthropic API with web search. This may take a moment. Try pressing Refresh Intel again.</p></Card>}
      {assessment && (
        <Card className={`p-4 ${assessment.direction === "escalation" ? "bg-red-50 border-red-200" : assessment.direction === "de-escalation" ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg">{assessment.direction === "escalation" ? "⬇️" : assessment.direction === "de-escalation" ? "⬆️" : "➡️"}</span>
            <span className="font-bold text-sm text-gray-800">Signal: {assessment.direction === "escalation" ? "Further Escalation" : assessment.direction === "de-escalation" ? "De-escalation Detected" : "Unchanged"}</span>
          </div>
          <p className="text-sm text-gray-600">{assessment.summary}</p>
          <p className="text-xs text-gray-500 mt-1">{assessment.departure_change}</p>
        </Card>
      )}
      {loading && items.length === 0 && (
        <div className="space-y-3">
          {loadingStep && (
            <Card className="p-4 bg-blue-50 border-blue-200 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
              <p className="text-sm text-blue-700 font-medium">{loadingStep}</p>
            </Card>
          )}
          {[1,2,3].map(i => <Card key={i} className="p-4 animate-pulse"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-100 rounded w-full" /></Card>)}
        </div>
      )}
      {items.map((item, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge level={item.signal}>{ll(item.signal)}</Badge>
            <span className="text-xs text-gray-400">{item.source} · {item.date}</span>
          </div>
          <p className="text-sm font-semibold text-gray-800 mb-1">{item.headline}</p>
          <p className="text-xs text-gray-500">{item.summary}</p>
          <p className="text-xs text-blue-600 font-semibold mt-1.5">Impact: {item.impact}</p>
        </Card>
      ))}
      {!loading && items.length === 0 && !error && <div className="text-center py-16"><Radar className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm font-medium">Press "Refresh Intel" to fetch latest sources</p><p className="text-gray-400 text-xs mt-1">Uses AI web search — may take 10–20 seconds</p></div>}

      {/* ─── OSINT SOURCES PANEL ─────────────────────────────────── */}
      <OsintSourcesPanel />
    </div>
  );
};

// ─── OSINT SOURCES DATA ─────────────────────────────────────────────────────

const OSINT_SOURCES = [
  {
    category: "UAE / GCC Government & Military",
    icon: Shield,
    color: "blue",
    accounts: [
      { handle: "NCEmergencyUAE", name: "NCEMA UAE", desc: "National Emergency Crisis & Disasters Management — shelter alerts, all-clear signals", verified: true, priority: true },
      { handle: "UAEGov", name: "UAE Government", desc: "Official UAE federal government account", verified: true },
      { handle: "MoFAICUAE", name: "UAE Ministry of Foreign Affairs", desc: "Diplomatic statements, travel coordination", verified: true },
      { handle: "HHShkMohd", name: "Sheikh Mohammed bin Rashid", desc: "UAE Vice President / Dubai Ruler — key policy announcements", verified: true, priority: true },
      { handle: "MBZNews", name: "MBZ News", desc: "President Sheikh Mohamed bin Zayed coverage", verified: true },
      { handle: "DXBMediaOffice", name: "Dubai Media Office", desc: "Official Dubai government communications and emergency updates", verified: true },
      { handle: "DubaiPoliceHQ", name: "Dubai Police", desc: "Emergency alerts, civil order, security updates", verified: true },
      { handle: "DXB", name: "Dubai Airports", desc: "Airport operational status — closures, resumptions, delays", verified: true, priority: true },
      { handle: "SPA_eng", name: "Saudi Press Agency", desc: "Saudi official news — GCC coordination, Hormuz alternatives", verified: true },
      { handle: "OmanNewsAgency", name: "Oman News Agency", desc: "Key for evacuation route intel — Oman border status", verified: true },
      { handle: "QNAEnglish", name: "Qatar News Agency", desc: "QNA — LNG force majeure updates, GCC coordination", verified: true },
    ]
  },
  {
    category: "US / UK / Western Government & Military",
    icon: Globe,
    color: "indigo",
    accounts: [
      { handle: "CENTCOM", name: "U.S. Central Command", desc: "Primary US military ops in Middle East — Operation Epic Fury updates", verified: true, priority: true },
      { handle: "CENTCOMArabic", name: "CENTCOM Arabic", desc: "Arabic-language CENTCOM operational updates", verified: true },
      { handle: "DeptofDefense", name: "U.S. Dept of Defense", desc: "Pentagon press briefings, military policy", verified: true, priority: true },
      { handle: "SecDef", name: "Secretary of Defense", desc: "Direct policy and operational announcements", verified: true },
      { handle: "USAembassyUAE", name: "US Embassy UAE", desc: "Evacuation flights, citizen services, shelter guidance", verified: true, priority: true },
      { handle: "StateDept", name: "US State Department", desc: "Travel advisories, diplomatic developments", verified: true },
      { handle: "USNavy", name: "US Navy", desc: "Naval operations, carrier strike group movements in Gulf", verified: true },
      { handle: "USAFCENT", name: "US Air Forces Central", desc: "Air operations over Gulf theater — sortie reports", verified: true },
      { handle: "UKinUAE", name: "UK in UAE", desc: "British Embassy — FCDO advisories, British citizen evacuation", verified: true, priority: true },
      { handle: "FCDOtravelGovUK", name: "FCDO Travel Advice", desc: "UK Foreign Office travel advice and crisis response", verified: true },
      { handle: "AusEmbUAE", name: "Australian Embassy UAE", desc: "DO NOT TRAVEL advisory updates — embassy status", verified: true },
      { handle: "TravelGoC", name: "Canada Travel Advisory", desc: "Canadian travel advisories and citizen services", verified: true },
      { handle: "NATO", name: "NATO", desc: "Alliance posture, coalition coordination", verified: true },
      { handle: "IDF", name: "Israel Defense Forces", desc: "Iran strike campaign updates, battle damage assessments", verified: true },
    ]
  },
  {
    category: "OSINT Analysts & Conflict Trackers",
    icon: Radar,
    color: "amber",
    accounts: [
      { handle: "sentdefender", name: "OSINTdefender", desc: "Major OSINT aggregator — real-time missile alerts, verified strike imagery", verified: false, priority: true },
      { handle: "Osint613", name: "Open Source Intel", desc: "Middle East focused — strike verification, battle damage imagery", verified: false, priority: true },
      { handle: "AuroraIntel", name: "Aurora Intel", desc: "Global events in real-time — Middle East focus, flight & ship tracking", verified: false, priority: true },
      { handle: "Osinttechnical", name: "OSINT Technical", desc: "Technical weapons analysis, intercept footage verification", verified: false },
      { handle: "IntelCrab", name: "IntelCrab", desc: "Real-time conflict tracking, breaking military developments", verified: false, priority: true },
      { handle: "Liveuamap", name: "Liveuamap", desc: "Interactive conflict map — tracks all strikes and military movements", verified: false },
      { handle: "GeoConfirmed", name: "GeoConfirmed", desc: "Geolocates & verifies strike footage — crowdsourced fact-checking", verified: false },
      { handle: "flightradar24", name: "Flightradar24", desc: "Live flight tracking — airspace closures, diversions, military activity", verified: true, priority: true },
      { handle: "MarineTraffic", name: "MarineTraffic", desc: "Vessel tracking — Hormuz transits, tanker stranding, naval ops", verified: true },
      { handle: "CovertShores", name: "H I Sutton", desc: "Naval OSINT specialist — submarine tracking, maritime warfare", verified: false },
      { handle: "CriticalThreats", name: "Critical Threats (AEI)", desc: "Daily Iran situation reports — most detailed campaign analysis", verified: false },
      { handle: "TheWarZone_", name: "The War Zone", desc: "In-depth military analysis, weapons systems, operational detail", verified: false },
      { handle: "NASAFIRMSInfo", name: "NASA FIRMS", desc: "Satellite thermal detection — verifies strikes via fire data", verified: true },
    ]
  },
  {
    category: "Key Journalists & Analysts",
    icon: Newspaper,
    color: "emerald",
    accounts: [
      { handle: "BarakRavid", name: "Barak Ravid", desc: "Axios — breaking Israeli diplomatic & military scoops", verified: true, priority: true },
      { handle: "FarnazFassihi", name: "Farnaz Fassihi", desc: "NYT Iran correspondent — Tehran sources, diplomatic back-channels", verified: true },
      { handle: "joyce_karam", name: "Joyce Karam", desc: "The National — Gulf security, US-Arab relations, Dubai coverage", verified: true },
      { handle: "AJEnglish", name: "Al Jazeera English", desc: "Fastest breaking English-language Middle East news", verified: true, priority: true },
      { handle: "AJArabic", name: "Al Jazeera Arabic", desc: "Arabic-language breaking news — Gulf conflict live updates", verified: true },
      { handle: "PressTV", name: "Press TV (Iran State Media)", desc: "Iranian state broadcaster — first source for Iran's official statements, threat declarations, military claims", verified: true, priority: true },
      { handle: "khaleejtimes", name: "Khaleej Times", desc: "Dubai-based daily — ground-level UAE reporting, airport status, local emergency updates", verified: true, priority: true },
      { handle: "Charles_Lister", name: "Charles Lister", desc: "MEI Senior Fellow — Iran proxies, Syria, escalation analysis", verified: true },
      { handle: "AliVaez", name: "Ali Vaez", desc: "Crisis Group Iran Director — ceasefire prospects, diplomacy tracking", verified: true },
      { handle: "WashInstitute", name: "Washington Institute", desc: "Gulf military analysis, Iran IRGC, air defense assessments — Michael Knights' team", verified: true, priority: true },
      { handle: "AlMonitor", name: "Al-Monitor", desc: "Middle East policy news — diplomatic sources, analysis", verified: true },
      { handle: "MiddleEastEye", name: "Middle East Eye", desc: "Independent Middle East journalism — strong GCC coverage", verified: true },
      { handle: "AFP", name: "AFP News Agency", desc: "Wire service — breaking news with Gulf bureau", verified: true },
      { handle: "Reuters", name: "Reuters", desc: "Global wire service — verified breaking news, Gulf/energy desk", verified: true, priority: true },
    ]
  },
];



// ─── OSINT SOURCES PANEL COMPONENT ─────────────────────────────────────────

const OsintSourcesPanel = () => {
  const [expandedCat, setExpandedCat] = useState(null);
  const [embedAccount, setEmbedAccount] = useState(null);

  const catColors = { blue: "bg-blue-50 border-blue-200 text-blue-700", indigo: "bg-indigo-50 border-indigo-200 text-indigo-700", amber: "bg-amber-50 border-amber-200 text-amber-700", emerald: "bg-emerald-50 border-emerald-200 text-emerald-700" };
  const catDots = { blue: "bg-blue-500", indigo: "bg-indigo-500", amber: "bg-amber-500", emerald: "bg-emerald-500" };
  const catBadge = { blue: "bg-blue-100 text-blue-700", indigo: "bg-indigo-100 text-indigo-700", amber: "bg-amber-100 text-amber-700", emerald: "bg-emerald-100 text-emerald-700" };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">OSINT Sources — X / Twitter</p>
          <p className="text-xs text-gray-400 mt-0.5">First-source accounts where news breaks. Tap any account to open on X.</p>
        </div>
      </div>

      {/* Embedded X Feed Preview */}
      {embedAccount && (
        <Card className="mb-4 overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">𝕏</span>
              </div>
              <span className="text-sm font-semibold text-gray-700">@{embedAccount}</span>
            </div>
            <button onClick={() => setEmbedAccount(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="relative bg-white" style={{ height: "400px" }}>
            <iframe
              src={`https://syndication.twitter.com/srv/timeline-profile/screen-name/${embedAccount}?dnt=true&frame=false&hideBorder=true&hideFooter=true&hideHeader=true&hideScrollBar=false&transparent=true`}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups"
              title={`X feed: @${embedAccount}`}
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-white via-white/90 to-transparent">
              <a href={`https://x.com/${embedAccount}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors">
                <ExternalLink className="w-3 h-3" /> Open full profile on X
              </a>
            </div>
          </div>
        </Card>
      )}

      {/* Priority Accounts Strip */}
      <Card className="p-4 mb-4">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2.5">⚡ Priority Feeds — Follow These First</p>
        <div className="flex flex-wrap gap-2">
          {OSINT_SOURCES.flatMap(cat => cat.accounts.filter(a => a.priority)).map((a, i) => (
            <button key={i} onClick={() => setEmbedAccount(a.handle)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors group">
              <span className="text-[11px] font-bold text-gray-800 group-hover:text-blue-700">@{a.handle}</span>
              <ExternalLink className="w-2.5 h-2.5 text-gray-400 group-hover:text-blue-500" />
            </button>
          ))}
        </div>
      </Card>

      {/* Category Accordions */}
      <div className="space-y-2">
        {OSINT_SOURCES.map((cat, ci) => {
          const isOpen = expandedCat === ci;
          const Icon = cat.icon;
          return (
            <Card key={ci} className="overflow-hidden">
              <button onClick={() => setExpandedCat(isOpen ? null : ci)}
                className={`w-full flex items-center gap-3 p-3.5 text-left hover:bg-gray-50 transition-colors ${isOpen ? "bg-gray-50" : ""}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${catBadge[cat.color]}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-gray-800">{cat.category}</span>
                  <span className="text-[10px] text-gray-400 ml-2">{cat.accounts.length} accounts</span>
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
              </button>
              {isOpen && (
                <div className="px-3.5 pb-3 border-t border-gray-100 pt-2 space-y-1.5">
                  {cat.accounts.map((a, ai) => (
                    <div key={ai} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 group transition-colors">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${catDots[cat.color]} ${a.priority ? "ring-2 ring-offset-1 ring-" + cat.color + "-300" : ""}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setEmbedAccount(a.handle)} className="text-xs font-bold text-gray-800 hover:text-blue-600 transition-colors">
                            @{a.handle}
                          </button>
                          {a.verified && <CheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                          {a.priority && <span className="text-[8px] px-1 py-0.5 rounded bg-red-100 text-red-600 font-bold">PRIORITY</span>}
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium">{a.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{a.desc}</p>
                      </div>
                      <a href={`https://x.com/${a.handle}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-500 hover:bg-black hover:text-white text-[10px] font-bold flex-shrink-0 transition-colors opacity-70 group-hover:opacity-100">
                        <ExternalLink className="w-2.5 h-2.5" /> Open
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Non-Twitter OSINT Tools */}
      <Card className="p-4 mt-4">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2.5">🛰️ Non-Twitter OSINT Tools</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { name: "LiveUAMap", url: "https://liveuamap.com", desc: "Interactive conflict map" },
            { name: "ADS-B Exchange", url: "https://globe.adsbexchange.com", desc: "Military flight tracker" },
            { name: "FlightRadar24", url: "https://www.flightradar24.com", desc: "Commercial flight status" },
            { name: "MarineTraffic", url: "https://www.marinetraffic.com", desc: "Vessel tracking / Hormuz" },
            { name: "HormuzTracker", url: "https://hormuztracker.com", desc: "Strait transit monitoring" },
            { name: "NASA FIRMS", url: "https://firms.modaps.eosdis.nasa.gov/map", desc: "Satellite fire detection" },
            { name: "GeoConfirmed", url: "https://geoconfirmed.org", desc: "Strike geolocation verification" },
            { name: "ACLED Data", url: "https://acleddata.com", desc: "Conflict event database" },
            { name: "InVID/WeVerify", url: "https://www.invid-project.eu", desc: "Video verification plugin" },
          ].map((t, i) => (
            <a key={i} href={t.url} target="_blank" rel="noopener noreferrer"
              className="flex flex-col p-2.5 rounded-lg bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors group">
              <span className="text-xs font-semibold text-gray-800 group-hover:text-blue-700">{t.name}</span>
              <span className="text-[10px] text-gray-400">{t.desc}</span>
            </a>
          ))}
        </div>
      </Card>

      {/* Verification Warning */}
      <div className="flex items-start gap-2.5 mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-700">Verification Protocol</p>
          <p className="text-[10px] text-amber-600 leading-relaxed">Cross-reference minimum 3 independent sources before acting on any report. Video game footage (Arma 3) and old footage regularly shared as real. Use InVID/WeVerify plugins. In the UAE, sharing "rumours or unknown sources" on social media is prosecutable.</p>
        </div>
      </div>
    </div>
  );
};

// ─── EMERGENCY TAB ──────────────────────────────────────────────────────────

// ─── LIVE TWEETS TAB ──────────────────────────────────────────────────────

const TWEET_FEEDS = [
  { category: "🚨 Emergency & Government", accounts: [
    { handle: "NCEmergencyUAE", name: "NCEMA UAE", desc: "Shelter alerts, all-clear signals" },
    { handle: "HHShkMohd", name: "HH Sheikh Mohammed", desc: "UAE Vice President & PM" },
    { handle: "MBZNews", name: "MBZ News", desc: "UAE President's office" },
    { handle: "DXBMediaOffice", name: "Dubai Media Office", desc: "Official Dubai updates" },
    { handle: "ADMediaOffice", name: "Abu Dhabi Media Office", desc: "Official Abu Dhabi updates" },
    { handle: "UAEGov", name: "UAE Government", desc: "Federal government updates" },
    { handle: "MoFAICUAE", name: "UAE Foreign Ministry", desc: "Diplomatic updates" },
    { handle: "DubaiPoliceHQ", name: "Dubai Police", desc: "Security & safety" },
  ]},
  { category: "🎖️ Military & Defense", accounts: [
    { handle: "ABORNECOMMAND", name: "UAE Armed Forces", desc: "Military operations" },
    { handle: "CENTCOM", name: "U.S. CENTCOM", desc: "US military operations — Epic Fury updates" },
    { handle: "DeptofDefense", name: "U.S. Pentagon", desc: "Defense Department updates" },
    { handle: "SecDef", name: "Secretary of Defense", desc: "Pete Hegseth updates" },
    { handle: "IDF", name: "Israel Defense Forces", desc: "Israeli military operations" },
    { handle: "USNavy", name: "U.S. Navy", desc: "Naval operations, carrier groups" },
    { handle: "NATO", name: "NATO", desc: "Alliance response" },
  ]},
  { category: "🔍 OSINT & Analysts", accounts: [
    { handle: "sentdefender", name: "OSINTdefender", desc: "Real-time missile alerts, verified strikes" },
    { handle: "Osint613", name: "OSINT 613", desc: "Middle East conflict OSINT" },
    { handle: "AuroraIntel", name: "Aurora Intel", desc: "Flight tracking, military aviation" },
    { handle: "IntelCrab", name: "IntelCrab", desc: "Conflict mapping" },
    { handle: "Osinttechnical", name: "OSINT Technical", desc: "Weapons analysis, intercept verification" },
    { handle: "Liveuamap", name: "Liveuamap", desc: "Interactive conflict map" },
    { handle: "GeoConfirmed", name: "GeoConfirmed", desc: "Geolocated strike verification" },
    { handle: "CriticalThreats", name: "Critical Threats", desc: "Daily Iran situation updates" },
    { handle: "TheWarZone_", name: "The War Zone", desc: "Military analysis" },
  ]},
  { category: "📰 Journalists & Media", accounts: [
    { handle: "khaleejtimes", name: "Khaleej Times", desc: "UAE's leading English daily" },
    { handle: "AJEnglish", name: "Al Jazeera English", desc: "Middle East news" },
    { handle: "Reuters", name: "Reuters", desc: "Global wire service" },
    { handle: "BarakRavid", name: "Barak Ravid", desc: "Axios — Israeli diplomatic source" },
    { handle: "FarnazFassihi", name: "Farnaz Fassihi", desc: "NYT Iran correspondent" },
    { handle: "joyce_karam", name: "Joyce Karam", desc: "The National — Washington" },
    { handle: "Charles_Lister", name: "Charles Lister", desc: "MEI Syria/Levant analyst" },
    { handle: "AliVaez", name: "Ali Vaez", desc: "ICG Iran Project Director" },
    { handle: "WashInstitute", name: "Washington Institute", desc: "Gulf air defense analysis" },
    { handle: "flightradar24", name: "Flightradar24", desc: "Real-time flight tracking" },
    { handle: "MarineTraffic", name: "MarineTraffic", desc: "Vessel tracking — Hormuz" },
  ]},
];

const LiveTweetsTab = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const iframeRef = useRef(null);

  const allPriority = ["NCEmergencyUAE", "CENTCOM", "sentdefender", "khaleejtimes", "DXBMediaOffice", "IDF", "AJEnglish", "flightradar24"];

  return (
    <div className="space-y-4">
      {/* Priority Quick Access */}
      <Card className="p-4">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">⚡ Priority Feeds — Tap to view live</p>
        <div className="flex flex-wrap gap-2">
          {allPriority.map(handle => {
            const acc = TWEET_FEEDS.flatMap(c => c.accounts).find(a => a.handle === handle);
            return (
              <button key={handle} onClick={() => setSelectedAccount(handle)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedAccount === handle
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-blue-50"
                }`}>
                <span>@{handle}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Embedded Timeline */}
      {selectedAccount && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-xs font-bold">𝕏</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">@{selectedAccount}</p>
                <p className="text-[10px] text-gray-500">{TWEET_FEEDS.flatMap(c => c.accounts).find(a => a.handle === selectedAccount)?.desc}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={`https://x.com/${selectedAccount}`} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors flex items-center gap-1">
                Open on 𝕏 <ExternalLink className="w-3 h-3" />
              </a>
              <button onClick={() => setSelectedAccount(null)}
                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="h-[500px] bg-white">
            <iframe
              ref={iframeRef}
              src={`https://syndication.twitter.com/srv/timeline-profile/screen-name/${selectedAccount}?dnt=true&embedId=twitter-widget-0&frame=false&hideBorder=true&hideFooter=true&hideHeader=true&hideScrollBar=false&lang=en&origin=https://gcc-war-room.vercel.app&showHeader=false&showReplies=false&transparent=true&theme=light`}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups"
              title={`@${selectedAccount} timeline`}
            />
          </div>
        </Card>
      )}

      {!selectedAccount && (
        <Card className="p-6 text-center">
          <Radar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-semibold">Tap any account above to view their live feed</p>
          <p className="text-xs text-gray-400 mt-1">Or browse by category below</p>
        </Card>
      )}

      {/* Category Browser */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {TWEET_FEEDS.map((cat, i) => (
          <button key={i} onClick={() => setSelectedCategory(i)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === i ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-blue-50"
            }`}>{cat.category}</button>
        ))}
      </div>

      <Card className="divide-y divide-gray-50">
        {TWEET_FEEDS[selectedCategory]?.accounts.map((acc, i) => (
          <button key={i} onClick={() => setSelectedAccount(acc.handle)}
            className={`w-full flex items-center gap-3 p-3 text-left hover:bg-blue-50/40 transition-colors ${
              selectedAccount === acc.handle ? "bg-blue-50" : ""
            }`}>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-gray-500 text-sm font-bold">𝕏</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{acc.name}</p>
              <p className="text-[10px] text-blue-600 font-medium">@{acc.handle}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{acc.desc}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-300 flex-shrink-0" />
          </button>
        ))}
      </Card>
    </div>
  );
};

// ─── EMERGENCY TAB ──────────────────────────────────────────────────────────

const EmergencyTab = () => {
  const [checked, setChecked] = useState(() => { try { return JSON.parse(localStorage.getItem("gobag") || "{}"); } catch { return {}; } });
  const toggleCheck = (id) => setChecked(p => { const next = { ...p, [id]: !p[id] }; try { localStorage.setItem("gobag", JSON.stringify(next)); } catch {} return next; });
  const total = GO_BAG_CHECKLIST.length;
  const done = Object.values(checked).filter(Boolean).length;
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">Emergency Contacts</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {EMERGENCY_CONTACTS.map((c, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${c.type === "emergency" ? "bg-red-50 border-red-200" : c.type === "embassy" ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200"}`}>
              <Phone className={`w-4 h-4 ${c.type === "emergency" ? "text-red-500" : c.type === "embassy" ? "text-blue-500" : "text-amber-500"}`} />
              <div>
                <p className="text-[10px] text-gray-500 font-medium">{c.name}</p>
                <p className="text-sm font-bold text-gray-800">{c.number}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 bg-amber-50 border-amber-200">
        <p className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold mb-3">When NCEMA Alert Sounds</p>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex gap-3"><span className="text-amber-600 font-bold w-5">1.</span><span>Move to interior corridor, stairwell, or ground floor</span></div>
          <div className="flex gap-3"><span className="text-amber-600 font-bold w-5">2.</span><span>Stay away from windows and glass walls</span></div>
          <div className="flex gap-3"><span className="text-amber-600 font-bold w-5">3.</span><span>Do NOT go outside — do NOT film (criminal offense)</span></div>
          <div className="flex gap-3"><span className="text-amber-600 font-bold w-5">4.</span><span>Wait for NCEMA all-clear notification</span></div>
          <div className="flex gap-3"><span className="text-amber-600 font-bold w-5">5.</span><span>Keep child calm — headphones to reduce noise stress</span></div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">90-Day Go-Bag Checklist</p>
          <span className={`text-sm font-bold ${done === total ? "text-emerald-600" : "text-blue-600"}`}>{done}/{total}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className={`h-2 rounded-full transition-all duration-500 ${done === total ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <div className="space-y-1.5">
          {GO_BAG_CHECKLIST.map(item => (
            <button key={item.id} onClick={() => toggleCheck(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors border ${
                checked[item.id] ? "bg-emerald-50 border-emerald-200" : "bg-white border-gray-100 hover:bg-gray-50"
              }`}>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                checked[item.id] ? "bg-emerald-500 border-emerald-500" : "border-gray-300"
              }`}>{checked[item.id] && <Check className="w-3 h-3 text-white" />}</div>
              <span className={`text-sm ${checked[item.id] ? "text-emerald-700 line-through" : "text-gray-700"}`}>{item.text}</span>
              {item.priority === "critical" && !checked[item.id] && <span className="text-[10px] text-red-500 font-bold ml-auto">CRITICAL</span>}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">Return Criteria — All Must Be Met</p>
        <div className="space-y-2.5">
          {RETURN_CRITERIA.map((r, i) => (
            <div key={i} className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-sm text-gray-700 flex-1">{r.text}</span>
              <span className="text-xs text-red-500 font-bold">NOT MET</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">Earliest plausible return: Late Q3 2026 (August–September)</p>
      </Card>
    </div>
  );
};

// ============================================================================
// SHOULD I GO? — Tab 7 for GCC War Room v3.0
// Crisis Perception Intelligence Platform — Full Override Protocol
// The Override Protocol shifts the ENTIRE tab posture across 5 levels
// Demo mode lets you preview all 5 levels for government presentations
// ============================================================================

const SIG_STYLES = `
@keyframes sigFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes sigPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(232,113,10,0.3); } 50% { box-shadow: 0 0 0 8px rgba(232,113,10,0); } }
@keyframes sigPulseGreen { 0%,100% { box-shadow: 0 0 0 0 rgba(52,168,83,0.3); } 50% { box-shadow: 0 0 0 8px rgba(52,168,83,0); } }
@keyframes sigPulseRed { 0%,100% { box-shadow: 0 0 0 0 rgba(234,67,53,0.4); } 50% { box-shadow: 0 0 0 10px rgba(234,67,53,0); } }
.sig-fade { animation: sigFadeIn 0.4s ease-out both; }
.sig-fade-1 { animation-delay: 0.05s; } .sig-fade-2 { animation-delay: 0.1s; } .sig-fade-3 { animation-delay: 0.15s; } .sig-fade-4 { animation-delay: 0.2s; }
.sig-pulse { animation: sigPulse 2s ease-in-out infinite; }
.sig-card { background: var(--gw-bg); border-radius: var(--gw-radius-md); border: 1px solid var(--gw-border); padding: 20px; margin-bottom: 16px; transition: box-shadow 0.2s; }
.sig-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
.sig-stat { text-align: center; padding: 20px 16px; background: var(--gw-bg); border-radius: var(--gw-radius-md); border: 1px solid var(--gw-border); transition: transform 0.2s; }
.sig-stat:hover { transform: translateY(-2px); box-shadow: var(--gw-shadow-1); }
.sig-pill { padding: 8px 20px; border-radius: var(--gw-radius-full); font-family: 'Google Sans Text', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; white-space: nowrap; }
.sig-intent { border-radius: 16px; border: 2px solid #E8EAED; padding: 28px 16px; cursor: pointer; text-align: center; transition: all 0.25s; min-height: 130px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
.sig-intent:hover { border-color: #1A73E8; background: #F0F6FF; transform: translateY(-4px); box-shadow: 0 12px 32px rgba(26,115,232,0.15); }
.sig-intent.active { border-color: #1A73E8; background: #EBF2FF; }
.sig-input { padding: 10px 14px; border-radius: var(--gw-radius-sm); border: 1px solid var(--gw-border-strong); font-family: 'Google Sans Text', sans-serif; font-size: 14px; background: #fff; outline: none; transition: border-color 0.2s; }
.sig-input:focus { border-color: var(--gw-blue); box-shadow: 0 0 0 2px var(--gw-blue-surface); }
.sig-btn { background: var(--gw-blue); color: #fff; border: none; border-radius: var(--gw-radius-full); font-family: 'Google Sans', sans-serif; padding: 10px 24px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.sig-btn:hover { background: var(--gw-blue-hover); }
.sig-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.sig-chat-user { background: var(--gw-blue); font-family: 'Google Sans Text', sans-serif; color: #fff; border-radius: 18px 18px 4px 18px; padding: 12px 18px; max-width: 80%; margin-left: auto; font-size: 14px; line-height: 1.5; }
.sig-chat-ai { background: var(--gw-surface); color: var(--gw-text-primary); border-radius: 18px 18px 18px 4px; font-family: 'Google Sans Text', sans-serif; padding: 14px 18px; max-width: 85%; font-size: 14px; line-height: 1.65; white-space: pre-wrap; border: 1px solid #E8EAED; }
.sig-advisor-card { border-radius: 12px; border: 2px solid #E8EAED; padding: 20px; cursor: pointer; transition: all 0.25s; }
.sig-advisor-card:hover { border-color: #1A73E8; box-shadow: 0 4px 16px rgba(26,115,232,0.1); }
.sig-advisor-card.selected { border-color: #1A73E8; background: #F0F6FF; }
.sig-demo-strip { background: var(--gw-surface); border: 1px solid var(--gw-border); border-radius: var(--gw-radius-md); padding: 16px 20px; margin-bottom: 20px; }
.sig-section-title { font-family: "Google Sans", sans-serif; font-size: 16px; font-weight: 500; color: var(--gw-text-primary); margin: 28px 0 16px; display: flex; align-items: center; gap: 10px; }
.sig-section-title:first-child { margin-top: 0; }
@media (max-width: 640px) { .sig-grid-4 { grid-template-columns: repeat(2, 1fr) !important; } .sig-grid-2 { grid-template-columns: 1fr !important; } }
`;

const ShouldIGoTab = ({
  conflictDay = CONFLICT_DAY,
  casualties = CONFLICT_DATA.casualties,
  missileData = CONFLICT_DATA.missiles,
  interceptionRate = CONFLICT_DATA.interceptionRate,
  straitStatus = CONFLICT_DATA.hormuz.traffic,
  oilPrice = CONFLICT_DATA.oil.current,
  selectedLanguage = "EN",
  userCountry = "UAE",
  resStatus = "expat_family",
  confidenceLevel = 4,
}) => {
  const [demoLevel, setDemoLevel] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const [userIntent, setUserIntent] = useState(null);
  const [originCountry, setOriginCountry] = useState("");
  const [targetCountry, setTargetCountry] = useState(userCountry || "UAE");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [investmentScenario, setInvestmentScenario] = useState("base");
  const [showMethodology, setShowMethodology] = useState(false);
  const [advisorStep, setAdvisorStep] = useState(0);
  const [advisorAnswers, setAdvisorAnswers] = useState({});
  const chatEndRef = useRef(null);

  const L = demoLevel || confidenceLevel;
  const LEVELS = {
    1: { name: "STRONG OPPORTUNITY", color: "#34A853", bgGrad: "linear-gradient(135deg, #E6F4EA, #F0FFF4)", icon: "🟢", pulse: "sig-pulse", desc: "Ceasefire 30+ days · Hormuz open · Airlines normal", bannerMsg: "Conditions have stabilized. Recovery opportunities for visitors, investors, and businesses.", aiPosture: "OPPORTUNITY mode. Encourage visits. Highlight recovery." },
    2: { name: "EMERGING OPPORTUNITY", color: "#34A853", bgGrad: "linear-gradient(135deg, #E6F4EA, #FAFFF5)", icon: "🟡", pulse: "sig-pulse", desc: "Ceasefire <30 days · Partial normalization", bannerMsg: "Ceasefire in effect. Early normalization signals positive. Proceed with awareness.", aiPosture: "Cautious optimism. Encourage flexible travelers. Investment analysis active." },
    3: { name: "INFORMED CAUTION", color: "#FBBC04", bgGrad: "linear-gradient(135deg, #FEF7E0, #FFFDF5)", icon: "🟠", pulse: "sig-pulse", desc: "Contained conflict · No civilian strikes 14+ days", bannerMsg: "Conflict continues but de-escalated. Risk and opportunity in equal measure.", aiPosture: "Balanced. Equal weight risk/opportunity. Solo travelers OK, not families." },
    4: { name: "ELEVATED RISK", color: "#E8710A", bgGrad: "linear-gradient(135deg, #FFF3E0, #FFF8F0)", icon: "🟠", pulse: "sig-pulse", desc: "Active strikes · Airports disrupted · Advisories L3-4", bannerMsg: "Active military strikes on civilian infrastructure. Risk-forward analysis.", aiPosture: "RISK-FORWARD. No tourist encouragement. Investment = long-term only." },
    5: { name: "ACTIVE DANGER", color: "#EA4335", bgGrad: "linear-gradient(135deg, #FDECEA, #FFF5F5)", icon: "🔴", pulse: "sig-pulse", desc: "Mass casualties · Infrastructure collapse · Evacuate", bannerMsg: "CRITICAL. Evacuate by any available means.", aiPosture: "WARNING. Against ALL civilian presence. Pure safety." },
  };
  const CL = LEVELS[L];
  const isOpportunity = L <= 2;
  const isRiskForward = L >= 4;

  const govAdvisories = {
    "United States": { level: "Level 3 — Reconsider Travel", color: "#E8710A", icon: "🇺🇸", detail: "Embassy closed. Evacuation flights since Mar 4." },
    "United Kingdom": { level: "Against all but essential travel", color: "#EA4335", icon: "🇬🇧", detail: "Contingency evacuation of 50,000 Britons planned." },
    "Australia": { level: "DO NOT TRAVEL (highest)", color: "#EA4335", icon: "🇦🇺", detail: "\"Leave the UAE. Don't wait.\"" },
    "Canada": { level: "Avoid All Travel", color: "#EA4335", icon: "🇨🇦", detail: "\"Leave while commercial options available.\"" },
    "India": { level: "Advisory in effect", color: "#E8710A", icon: "🇮🇳", detail: "~3.5M nationals in UAE. Air India suspended." },
    "Pakistan": { level: "Advisory in effect", color: "#E8710A", icon: "🇵🇰", detail: "~1.7M nationals in UAE." },
    "Philippines": { level: "Alert Level 3", color: "#E8710A", icon: "🇵🇭", detail: "~700K OFWs. OWWA assistance active." },
    "Germany": { level: "Travel warning", color: "#EA4335", icon: "🇩🇪", detail: "Lufthansa suspended." },
    "France": { level: "Advises against travel", color: "#EA4335", icon: "🇫🇷", detail: "Air France suspended." },
    "Bangladesh": { level: "Advisory in effect", color: "#E8710A", icon: "🇧🇩", detail: "~1M+ nationals." },
    "China": { level: "Safety reminder", color: "#FBBC04", icon: "🇨🇳", detail: "Embassy advising caution." },
    "South Korea": { level: "Advisory elevated", color: "#E8710A", icon: "🇰🇷", detail: "Cheongung-II deployed." },
    "Japan": { level: "Level 3 — Avoid", color: "#EA4335", icon: "🇯🇵", detail: "Embassy reduced staff." },
  };
  const originCountries = Object.keys(govAdvisories);
  const countries = ["UAE","Saudi Arabia","Qatar","Bahrain","Kuwait","Oman","Jordan","Iraq","Lebanon","Syria","Israel","Egypt","Yemen"];
  const myAdvisory = govAdvisories[originCountry];

  const resCtx = { tourist: { l: "Tourist", i: "✈️" }, business: { l: "Business", i: "💼" }, expat_single: { l: "Expat (Single)", i: "🏠" }, expat_family: { l: "Expat (Family)", i: "👨‍👩‍👧" }, national: { l: "National", i: "🏛️" }, diplomatic: { l: "Diplomatic", i: "🏛️" } };
  const myRes = resCtx[resStatus] || resCtx.expat_family;

  const comparisonData = {
    "United States": { traffic: { home: 2160, label: "Car accident deaths" }, guns: { home: 2340, label: "Gun deaths" }, medical: { home: 12330, label: "Medical error deaths" } },
    "United Kingdom": { traffic: { home: 90, label: "Car accident deaths" }, violent: { home: 180, label: "Violent crime deaths" } },
    "India": { traffic: { home: 7470, label: "Car accident deaths" }, pollution: { home: 63000, label: "Air pollution deaths" } },
    "Pakistan": { traffic: { home: 720, label: "Car accident deaths" } },
    "Philippines": { traffic: { home: 540, label: "Car accident deaths" } },
    "Australia": { traffic: { home: 72, label: "Car accident deaths" } },
    "Germany": { traffic: { home: 144, label: "Car accident deaths" } },
    "France": { traffic: { home: 162, label: "Car accident deaths" } },
    "Canada": { traffic: { home: 144, label: "Car accident deaths" } },
    "China": { traffic: { home: 12600, label: "Car accident deaths" } },
  };
  const investScenarios = {
    optimistic: { probability: "25–30%", timeline: "Ceasefire 6 weeks", property: "Stabilizes Q3 2026, pre-war by Q2 2027", return3yr: "40–80%", color: "#34A853" },
    base: { probability: "40–45%", timeline: "Campaign 2–4 months", property: "Declines 10–15% more, bottoms H2 2026", return3yr: "20–50%", color: "#FBBC04" },
    pessimistic: { probability: "15–20%", timeline: "Expanded, ground ops", property: "Declines 40–50%, recovery 2028+", return3yr: "-10% to +20%", color: "#EA4335" },
  };
  const scenario = investScenarios[investmentScenario];

  // ── ADVISOR ──
  const advisorSteps = [
    { q: "What describes you best?", opts: [{ label: "Thinking of visiting", value: "visit", icon: "✈️" },{ label: "Already here — should I stay?", value: "stay", icon: "🏠" },{ label: "I left — when do I return?", value: "return", icon: "🔄" },{ label: "Job offer here", value: "relocate", icon: "💼" }] },
    { q: "Who are you with?", opts: [{ label: "Just me", value: "solo", icon: "👤" },{ label: "With partner", value: "partner", icon: "👫" },{ label: "Family with children", value: "family", icon: "👨‍👩‍👧" },{ label: "Elderly dependents", value: "elderly", icon: "👴" }] },
    { q: "Your flexibility?", opts: [{ label: "Completely flexible", value: "flexible", icon: "🔄" },{ label: "Some flexibility", value: "some", icon: "⚖️" },{ label: "Locked in", value: "locked", icon: "🔒" }] },
  ];
  const getAdvisorResult = () => {
    const { situation, companions } = advisorAnswers;
    const isFamily = companions === "family" || companions === "elderly";
    if (L >= 5) return { verdict: "EVACUATE IMMEDIATELY", color: "#EA4335", icon: "🚨", detail: "Platform advises against ALL civilian presence.", actions: ["Leave by any transport NOW","Drive to Oman if airport closed","Register with embassy"] };
    if (situation === "visit" && isFamily && L >= 4) return { verdict: "DO NOT TRAVEL WITH CHILDREN", color: "#EA4335", icon: "🚫", detail: "At Level 4, this platform does not recommend family travel. Every major government has issued high-level advisories.", actions: ["Postpone — airlines offering fee-free rebooking","Monitor for Level 3 or below","Keep bookings as tentative holds"] };
    if (situation === "visit" && L >= 4) return { verdict: "NOT RECOMMENDED — POSTPONE", color: "#E8710A", icon: "⏳", detail: `${missileData.total} projectiles, ${interceptionRate} intercepted, ${casualties.killed} killed. DXB struck 3 times. All Western govts advise against travel.`, actions: ["Delay 2–4 weeks and monitor","Book refundable only","Register with embassy","Oman backup route planned"] };
    if (situation === "stay") return { verdict: isRiskForward ? "HAVE EXIT PLAN READY" : "STAY WITH AWARENESS", color: isRiskForward ? "#FBBC04" : "#34A853", icon: "✓", detail: `${interceptionRate} interception. ${casualties.killed} killed in ${conflictDay} days across 11M population. Both staying and leaving are defensible.`, actions: ["Follow NCEMA alerts","Go-bag: passport, cash, meds","Know Oman route (4.5h to Muscat)","Watch: airport closure 48h+, interception <80%"] };
    if (situation === "return") return { verdict: isRiskForward ? "NOT YET — 0/5 CRITERIA MET" : "CONDITIONS IMPROVING", color: isRiskForward ? "#EA4335" : "#FBBC04", icon: "⏳", detail: "Return criteria: Ceasefire 30d+, Hormuz open, Advisories ≤L2, Airlines normal, Insurance reinstated.", actions: ["Earliest: Late Q3 2026","Monitor NCEMA, embassy, FlightRadar24","Don't return on 'seems quieter'","Plan 3-4 month absence"] };
    if (situation === "relocate") return { verdict: isFamily && isRiskForward ? "DEFER START DATE" : "PROCEED WITH AWARENESS", color: isRiskForward ? "#E8710A" : "#FBBC04", icon: isFamily ? "⏳" : "✓", detail: isFamily ? "Negotiate deferred start post-ceasefire." : `For solo professionals: high-risk but not irrational. ${interceptionRate} interception.`, actions: isFamily ? ["Negotiate 3-6 month delay","Verify employer security","Monitor for Level 3"] : ["Negotiate accommodation away from targets","Keep return ticket ready","Start remote if possible"] };
    if (isOpportunity && situation === "visit") return { verdict: "WELCOME", color: "#34A853", icon: "✅", detail: "The Gulf is recovering. Hotels at recovery pricing. Airlines resuming.", actions: ["Book with confidence","Hotels at historic value","Check latest advisory"] };
    return { verdict: "SEEK GUIDANCE", color: "#666", icon: "ℹ️", detail: "Consult your embassy.", actions: ["Contact embassy"] };
  };

  // ── AI CHAT ──
  const buildSP = () => `You are the Gulf Confidence Analyst. Level ${L} (${CL.name}). Day ${conflictDay}. ${missileData.total} projectiles, ${interceptionRate} intercepted. ${casualties.killed} killed. Hormuz ${straitStatus}. Oil ${oilPrice}. User: ${myRes.l}${originCountry ? ` from ${originCountry}` : ""}. Intent: ${userIntent}. ${CL.aiPosture} PRISM: Perception→Reality→Context→Scenarios→Decision. NEVER: "completely safe". Under 400 words.`;
  const sendChat = async (text) => {
    if (!text?.trim() || chatLoading) return;
    const msg = text.trim(); setChatInput("");
    const upd = [...chatMessages, { role: "user", content: msg }];
    setChatMessages(upd); setChatLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2048, system: buildSP(), messages: upd.map(m => ({ role: m.role, content: m.content })) }) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setChatMessages(p => [...p, { role: "assistant", content: data.content?.map(b => b.text||"").join("\n") || "Unable to respond." }]);
    } catch { setChatMessages(p => [...p, { role: "assistant", content: `Day ${conflictDay}. ${missileData.total} projectiles, ${interceptionRate} intercepted. ${casualties.killed} killed. ${CL.bannerMsg}\n\n⚠️ Offline mode` }]); }
    setChatLoading(false);
  };
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const selComp = comparisonData[originCountry] || comparisonData["United States"];
  const compEntries = Object.entries(selComp);
  const maxComp = Math.max(...compEntries.map(([,v]) => v.home));

  // ═══════ REUSABLE SECTION RENDERERS ═══════
  const renderStats = (subset) => {
    const allStats = [
      { v: missileData.total.toLocaleString(), l: "Total Projectiles", s: `${missileData.ballistic} BM · ${missileData.drones} Drones`, c: "#E8710A" },
      { v: interceptionRate, l: "Interception Rate", s: "THAAD + Patriot + Coalition", c: "#34A853" },
      { v: String(casualties.killed), l: "UAE Killed", s: `${casualties.injured} injured`, c: "#EA4335" },
      { v: "0", l: "Tourist Casualties", s: "Zero tourists hurt", c: "#34A853" },
      { v: straitStatus, l: "Hormuz Traffic", s: "Near zero transits", c: "#EA4335" },
      { v: oilPrice, l: "Oil Price", s: `Pre-war: ${CONFLICT_DATA.oil.preWar}`, c: "#E8710A" },
      { v: CONFLICT_DATA.dfm, l: "DFM Real Estate", s: "Down from peak", c: "#EA4335" },
      { v: CONFLICT_DATA.hotels, l: "Hotel Bookings", s: "Collapsed", c: "#EA4335" },
    ];
    const items = subset ? allStats.filter((_,i) => subset.includes(i)) : allStats;
    return (<div className="sig-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "20px" }}>
      {items.map((s,i) => (<div key={i} className={`sig-stat sig-fade sig-fade-${(i%4)+1}`}><div style={{ fontSize: "28px", fontWeight: 700, color: s.c, fontFamily: "'Google Sans Display', sans-serif" }}>{s.v}</div><div className="gw-overline" style={{ marginTop: "4px" }}>{s.l}</div><div style={{ fontSize: "10px", color: "var(--gw-text-tertiary)", marginTop: "2px" }}>{s.s}</div></div>))}
    </div>);
  };

  const renderDefense = () => (
    <div className="sig-card sig-fade"><div style={{ fontFamily: "'Google Sans', sans-serif", fontWeight: 500, fontSize: "15px", color: "var(--gw-text-primary)", marginBottom: "14px" }}>🛡️ Air Defense Performance</div><div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}><span style={{ fontSize: "13px", fontWeight: 600 }}>Interception Rate</span><span style={{ fontSize: "14px", fontWeight: 800, color: "#34A853" }}>{interceptionRate}</span></div><div style={{ height: "14px", background: "#F1F3F4", borderRadius: "7px", overflow: "hidden", marginBottom: "12px" }}><div style={{ width: "92%", height: "100%", background: "linear-gradient(90deg, #34A853, #2E7D32)", borderRadius: "7px" }} /></div><div style={{ fontSize: "12px", color: L >= 4 ? "#BF360C" : "#555", fontWeight: 600 }}>{L >= 4 ? "⚠️ Track record, not guarantee. Interceptor depletion growing." : "✅ Defense systems performed exceptionally."}</div></div>
  );

  const renderAdvisories = () => (
    <div className="sig-card sig-fade"><div style={{ fontFamily: "'Google Sans', sans-serif", fontWeight: 500, fontSize: "15px", color: "var(--gw-text-primary)", marginBottom: "14px" }}>🚨 Government Advisories</div>{L >= 4 && <div style={{ fontSize: "12px", color: "#BF360C", marginBottom: "10px", fontWeight: 700 }}>These should factor heavily into your decision.</div>}{Object.entries(govAdvisories).slice(0, L >= 4 ? 5 : 3).map(([country, a], i) => (<div key={i} style={{ padding: "10px 14px", borderRadius: "10px", borderLeft: `4px solid ${a.color}`, marginBottom: "8px", background: "#FAFBFC" }}><div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span>{a.icon}</span><span style={{ fontWeight: 700, fontSize: "13px" }}>{country}</span></div><div style={{ fontSize: "13px", color: a.color, fontWeight: 700, margin: "3px 0" }}>{a.level}</div></div>))}</div>
  );

  const renderAdvisor = () => (
    <div className="sig-fade">
      {advisorStep < advisorSteps.length ? (<div>
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>{advisorSteps.map((_,i) => <div key={i} style={{ flex: 1, height: "4px", borderRadius: "2px", background: i <= advisorStep ? "#1A73E8" : "#E8EAED" }} />)}</div>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#1B365D", marginBottom: "14px" }}>{advisorSteps[advisorStep].q}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
          {advisorSteps[advisorStep].opts.map(opt => (<div key={opt.value} className="sig-advisor-card" onClick={() => { setAdvisorAnswers(p => ({...p, [["situation","companions","flexibility"][advisorStep]]: opt.value})); setTimeout(() => setAdvisorStep(s => s + 1), 250); }}><div style={{ fontSize: "24px", marginBottom: "6px" }}>{opt.icon}</div><div style={{ fontSize: "13px", fontWeight: 600 }}>{opt.label}</div></div>))}
        </div>
        {advisorStep > 0 && <button onClick={() => setAdvisorStep(s => s - 1)} style={{ marginTop: "12px", background: "none", border: "none", color: "#1A73E8", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>← Back</button>}
      </div>) : (<div>
        {(() => { const r = getAdvisorResult(); return (<div className="sig-card" style={{ borderColor: r.color, borderWidth: "2px" }}><div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}><span style={{ fontSize: "28px" }}>{r.icon}</span><div><div style={{ fontSize: "10px", fontWeight: 700, color: "#888", letterSpacing: "0.5px" }}>LEVEL {L} ASSESSMENT</div><div style={{ fontSize: "16px", fontWeight: 700, color: r.color, fontFamily: "'Google Sans Display', sans-serif" }}>{r.verdict}</div></div></div><div style={{ fontSize: "14px", lineHeight: "1.7", color: "#444", padding: "14px", background: "#F8F9FA", borderRadius: "10px", marginBottom: "16px" }}>{r.detail}</div>{r.actions.map((a,i) => (<div key={i} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: i < r.actions.length-1 ? "1px solid #F1F3F4" : "none", fontSize: "13px" }}><span style={{ fontWeight: 800, color: "#1A73E8" }}>{i+1}.</span><span>{a}</span></div>))}</div>); })()}
        <button onClick={() => { setAdvisorStep(0); setAdvisorAnswers({}); }} style={{ marginTop: "12px", background: "none", border: "2px solid #1A73E8", color: "#1A73E8", borderRadius: "10px", padding: "8px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>↺ Start Over</button>
      </div>)}
    </div>
  );

  const renderPerception = () => (<div className="sig-fade">
    <div className="sig-card" style={{ background: "#FFF8E1", borderColor: "#FFD54F" }}><strong>📋 Methodology:</strong> Comparisons calibrate magnitude (availability heuristic). They don't argue war is safe. Every death is a tragedy.</div>
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}><span style={{ fontSize: "14px", fontWeight: 700 }}>Compare with:</span><select className="sig-input" value={originCountry || "United States"} onChange={e => setOriginCountry(e.target.value)}>{Object.keys(comparisonData).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
    <div className="sig-card">{compEntries.map(([key, data]) => (<div key={key} style={{ marginBottom: "16px" }}><div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>{data.label}</div>{[{ l: (originCountry||"US").substring(0,6), v: data.home, p: Math.max((data.home/maxComp)*100,5), c: "#78909C" },{ l: "UAE", v: casualties.killed, p: Math.max((casualties.killed/maxComp)*100,1.5), c: "#E8710A" }].map((b,i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}><div style={{ width: "50px", fontSize: "11px", color: "#999", textAlign: "right", fontWeight: 600 }}>{b.l}</div><div style={{ flex: 1, height: "20px", background: "#F5F5F5", borderRadius: "6px", overflow: "hidden" }}><div style={{ width: `${b.p}%`, height: "100%", background: b.c, borderRadius: "6px", minWidth: "4px" }} /></div><span style={{ fontSize: "13px", fontWeight: 800, width: "65px", color: b.c }}>{typeof b.v === "number" ? b.v.toLocaleString() : b.v}</span></div>))}</div>))}</div>
    <div className="sig-card" style={{ background: "#FFF3E0", borderColor: "#FFB74D" }}><strong style={{ color: "#BF360C" }}>⚠️ Limits:</strong><span style={{ color: "#BF360C" }}> Voluntary vs involuntary risk. Defense may degrade. One input, not permission.</span></div>
  </div>);

  const renderInvestment = () => (<div className="sig-fade">
    <div className="sig-card" style={{ background: isOpportunity ? "#E6F4EA" : "#FFF8E1", borderColor: isOpportunity ? "#A8DAB5" : "#FFD54F" }}>{isOpportunity ? <><strong>📈 Recovery Phase</strong> — Historical crisis-bottom entries produce 40–300%+ returns.</> : <><strong>⚠️</strong> Educational analysis. Past performance ≠ future results.</>}</div>
    <div className="sig-card" style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}><thead><tr style={{ borderBottom: "2px solid #1B365D" }}>{["Year","Event","Decline","Recovery"].map(h => <th key={h} style={{ padding: "8px", textAlign: "left", fontWeight: 800, fontSize: "11px", color: "#1B365D" }}>{h}</th>)}</tr></thead><tbody>{[["2008–09","Financial Crisis","50–60%","300%+ by 2014"],["2014–15","Oil Crash","15–20%","2 years"],["2020","COVID","15–25%","ATH by 2024"],["2022","Houthi","5–10%","Months"],["2026","Current","~30%","TBD"]].map((r,i) => (<tr key={i} style={{ borderBottom: "1px solid #F1F3F4", background: i === 4 ? "#FFF3E0" : "transparent" }}>{r.map((c,j) => <td key={j} style={{ padding: "8px", fontWeight: j===0 ? 700 : 400, color: j===2 ? "#EA4335" : j===3 ? "#34A853" : "#333" }}>{c}</td>)}</tr>))}</tbody></table></div>
    <div className="sig-card"><div style={{ fontFamily: "'Google Sans', sans-serif", fontWeight: 500, fontSize: "15px", color: "var(--gw-text-primary)", marginBottom: "12px" }}>🎯 Scenario Modeler</div><div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>{Object.entries(investScenarios).map(([k,s]) => (<button key={k} className="sig-pill" onClick={() => setInvestmentScenario(k)} style={{ background: investmentScenario===k ? s.color : "#F1F3F4", color: investmentScenario===k ? "#fff" : "#444" }}>{k.charAt(0).toUpperCase()+k.slice(1)} ({s.probability})</button>))}</div><div style={{ padding: "16px", background: "#FAFBFC", borderRadius: "10px", border: `2px solid ${scenario.color}` }}><div className="sig-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}><div><div style={{ fontSize: "10px", color: "#999", fontWeight: 600 }}>TIMELINE</div><div style={{ fontSize: "13px", fontWeight: 600, marginTop: "4px" }}>{scenario.timeline}</div></div><div><div style={{ fontSize: "10px", color: "#999", fontWeight: 600 }}>PROPERTY</div><div style={{ fontSize: "13px", fontWeight: 600, marginTop: "4px" }}>{scenario.property}</div></div><div><div style={{ fontSize: "10px", color: "#999", fontWeight: 600 }}>3-YEAR RETURN</div><div style={{ fontSize: "24px", fontWeight: 800, color: scenario.color }}>{scenario.return3yr}</div></div><div><div style={{ fontSize: "10px", color: "#999", fontWeight: 600 }}>PROBABILITY</div><div style={{ fontSize: "24px", fontWeight: 800, color: "#1B365D" }}>{scenario.probability}</div></div></div></div></div>
  </div>);

  const renderTimeline = () => (<div className="sig-card sig-fade"><div style={{ fontFamily: "'Google Sans', sans-serif", fontWeight: 500, fontSize: "15px", color: "var(--gw-text-primary)", marginBottom: "14px" }}>📅 Conflict Timeline</div><div style={{ paddingLeft: "24px", position: "relative" }}>{STRIKE_TIMELINE.map((e,i,a) => (<div key={i} style={{ marginBottom: "12px", position: "relative" }}><div style={{ position: "absolute", left: "-24px", top: "3px", width: "10px", height: "10px", borderRadius: "50%", background: i === a.length-1 ? "#EA4335" : "#1A73E8" }} />{i < a.length-1 && <div style={{ position: "absolute", left: "-20px", top: "15px", width: "2px", height: "100%", background: "#E8EAED" }} />}<span style={{ fontSize: "11px", fontWeight: 800, color: "#1B365D" }}>{e.date}</span><span style={{ fontSize: "12px", color: i === a.length-1 ? "#EA4335" : "#444", fontWeight: i === a.length-1 ? 700 : 400, marginLeft: "8px" }}>{e.event}</span></div>))}</div></div>);

  const renderEscapeRoutes = () => (<div className="sig-card sig-fade"><div style={{ fontFamily: "'Google Sans', sans-serif", fontWeight: 500, fontSize: "15px", color: "var(--gw-text-primary)", marginBottom: "14px" }}>🛣️ Escape Routes</div>{ESCAPE_ROUTES.map((r,i) => { const sc = r.status === "active" || r.status === "open" ? "color:#059669;background:#ECFDF5" : r.status === "limited" ? "color:#D97706;background:#FFFBEB" : "color:#DC2626;background:#FEF2F2"; return (<div key={i} style={{ display: "flex", gap: "10px", padding: "10px 0", borderBottom: i < ESCAPE_ROUTES.length-1 ? "1px solid #F1F3F4" : "none", fontSize: "13px" }}><span>{r.type === "air" ? "✈️" : "🚗"}</span><div style={{ flex: 1 }}><strong>{r.name}</strong> <span style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "6px", fontWeight: 700, ...Object.fromEntries(sc.split(";").map(s => s.split(":").map(x => x.trim()))) }}>{r.status}</span><div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{r.detail}</div></div></div>); })}</div>);

  const renderSupply = () => (<div className="sig-card sig-fade"><div style={{ fontFamily: "'Google Sans', sans-serif", fontWeight: 500, fontSize: "15px", color: "var(--gw-text-primary)", marginBottom: "14px" }}>📦 Supply Chain</div><div className="sig-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>{SUPPLY_STATUS.map((s,i) => (<div key={i} style={{ padding: "10px", borderRadius: "10px", border: "1px solid #E8EAED", background: "#FAFBFC" }}><div style={{ fontSize: "12px", fontWeight: 700, color: "#333", marginBottom: "6px" }}>{s.name}</div><div style={{ height: "6px", background: "#F1F3F4", borderRadius: "3px", marginBottom: "4px" }}><div style={{ width: `${s.value}%`, height: "100%", borderRadius: "3px", background: s.status === "critical" ? "#EA4335" : s.status === "warning" ? "#F59E0B" : "#34A853" }} /></div><div style={{ fontSize: "11px", color: "#888" }}>{s.value}{s.unit}</div></div>))}</div></div>);

  const renderForecast = () => (<div className="sig-card sig-fade"><div style={{ fontFamily: "'Google Sans', sans-serif", fontWeight: 500, fontSize: "15px", color: "var(--gw-text-primary)", marginBottom: "14px" }}>📈 3-6 Month Forecast</div>{FORECAST.map((f,i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", fontSize: "13px" }}><span style={{ padding: "2px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, background: f.level === "critical" ? "#FDECEA" : f.level === "warning" ? "#FEF7E0" : f.level === "positive" ? "#E6F4EA" : "#F1F3F4", color: f.level === "critical" ? "#EA4335" : f.level === "warning" ? "#D97706" : f.level === "positive" ? "#34A853" : "#888", minWidth: "70px", textAlign: "center" }}>{f.prob}</span><span style={{ flex: 1, color: "#444" }}>{f.scenario}</span></div>))}</div>);

  const renderAI = () => (<div className="sig-fade">
    {chatMessages.length === 0 && (<div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>{["Is it safe right now?","What's the real risk?","When will this end?","Should I leave?"].map((q,i) => (<button key={i} className="sig-pill" onClick={() => sendChat(q)} style={{ background: "#F1F3F4", color: "#444", fontSize: "12px", padding: "8px 14px" }}>{q}</button>))}</div>)}
    <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #E8EAED", overflow: "hidden" }}>
      <div style={{ maxHeight: "350px", overflowY: "auto", padding: "16px" }}>
        {chatMessages.length === 0 && <div style={{ textAlign: "center", padding: "30px", color: "#AAA" }}><div style={{ fontSize: "32px", marginBottom: "8px" }}>💬</div><div style={{ fontSize: "14px", fontWeight: 600 }}>Ask the AI Analyst anything</div></div>}
        {chatMessages.map((m,i) => (<div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: "12px" }}><div className={m.role === "user" ? "sig-chat-user" : "sig-chat-ai"}>{m.content}</div></div>))}
        {chatLoading && <div style={{ display: "flex" }}><div className="sig-chat-ai" style={{ color: "#AAA" }}>● ● ● Analyzing...</div></div>}
        <div ref={chatEndRef} />
      </div>
      <div style={{ display: "flex", gap: "8px", padding: "12px 16px", borderTop: "1px solid #E8EAED", background: "#FAFBFC" }}>
        <input className="sig-input" style={{ flex: 1 }} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat(chatInput)} placeholder="Ask anything..." />
        <button className="sig-btn" onClick={() => sendChat(chatInput)} disabled={chatLoading}>Send</button>
      </div>
    </div>
  </div>);

  const renderFooter = () => (<div style={{ background: "#F8F9FA", borderRadius: "14px", padding: "20px", marginTop: "24px", fontSize: "12px", color: "#666", lineHeight: "1.6" }}><div style={{ fontWeight: 500, fontSize: "14px", color: "var(--gw-text-primary)", marginBottom: "10px", fontFamily: "'Google Sans', sans-serif" }}>🔒 Trust & Transparency · Level {L}</div><div style={{ fontSize: "11px", color: "#AAA", marginTop: "10px", padding: "10px", background: "#fff", borderRadius: "8px" }}><strong>Disclaimer:</strong> Informational analysis. Not safety guarantees or financial advice. Always consult official advisories. gcc-war-room.vercel.app</div></div>);

  // ═══════ MAIN RENDER ═══════
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", color: "#1a1a1a" }}>
      <style>{SIG_STYLES}</style>

      {/* DEMO STRIP */}
      <div className="sig-demo-strip">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div><div className="gw-overline">OVERRIDE PROTOCOL</div><div style={{ fontSize: "13px", fontWeight: 500, color: "var(--gw-text-primary)", fontFamily: "'Google Sans', sans-serif" }}>{showDemo ? "Demo Mode" : `Level ${L} — ${CL.name}`}</div></div>
          <button onClick={() => { setShowDemo(!showDemo); if (showDemo) setDemoLevel(null); }} style={{ background: showDemo ? "var(--gw-red)" : "var(--gw-surface-variant)", color: showDemo ? "#fff" : "var(--gw-text-secondary)", border: "1px solid var(--gw-border-strong)", borderRadius: "8px", padding: "6px 14px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>{showDemo ? "✕ Exit" : "🎛️ Demo"}</button>
        </div>
        {showDemo && <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>{Object.entries(LEVELS).map(([lv, d]) => (<button key={lv} onClick={() => { setDemoLevel(Number(lv)); setChatMessages([]); setAdvisorStep(0); setAdvisorAnswers({}); }} style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, cursor: "pointer", border: demoLevel===Number(lv) ? "2px solid #fff" : "2px solid transparent", background: d.color, color: "#fff", opacity: demoLevel===Number(lv) ? 1 : 0.6, flex: "1", textAlign: "center" }}>{d.icon} L{lv}</button>))}</div>}
      </div>

      {/* CONFIDENCE BANNER */}
      <div className={`sig-fade ${CL.pulse}`} style={{ background: CL.bgGrad, border: `2px solid ${CL.color}`, borderRadius: "14px", padding: "18px 22px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><span style={{ fontSize: "24px" }}>{CL.icon}</span><div><div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}><span style={{ background: CL.color, color: "#fff", fontWeight: 500, fontSize: "10px", padding: "4px 12px", borderRadius: "var(--gw-radius-full)", letterSpacing: "0.5px", fontFamily: "'Google Sans', sans-serif" }}>LEVEL {L}</span><span style={{ fontWeight: 500, fontSize: "14px", color: CL.color, fontFamily: "'Google Sans', sans-serif" }}>{CL.name}</span></div><div style={{ fontSize: "13px", color: "#555", maxWidth: "500px" }}>{CL.bannerMsg}</div></div></div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: "12px", fontWeight: 600, color: "#555" }}>Day {conflictDay}</div><div style={{ fontSize: "11px", color: "#888" }}>{myRes.i} {myRes.l}</div></div>
      </div>

      {/* ORIGIN ADVISORY */}
      {myAdvisory && L >= 3 && (<div className="sig-fade sig-fade-1" style={{ background: "#fff", borderRadius: "12px", border: `2px solid ${myAdvisory.color}`, padding: "14px 18px", marginBottom: "20px", display: "flex", gap: "12px" }}><span style={{ fontSize: "24px" }}>{myAdvisory.icon}</span><div><div style={{ fontSize: "10px", fontWeight: 700, color: "#888", letterSpacing: "0.5px" }}>YOUR GOVERNMENT</div><div style={{ fontSize: "14px", fontWeight: 700, color: myAdvisory.color }}>{myAdvisory.level}</div><div style={{ fontSize: "12px", color: "#555", marginTop: "2px" }}>{myAdvisory.detail}</div></div></div>)}

      {/* ═══ INTENT SELECTOR (THE LANDING) ═══ */}
      {!userIntent && (<div className="sig-fade">
        <div style={{ textAlign: "center", marginBottom: "8px" }}><div style={{ fontFamily: "'Google Sans Display', sans-serif", fontSize: "24px", fontWeight: 700, color: "var(--gw-text-primary)" }}>What brings you here?</div><div style={{ fontSize: "14px", color: "var(--gw-text-secondary)", marginTop: "6px", fontFamily: "'Google Sans Text', sans-serif" }}>Personalized analysis for your situation</div></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", margin: "24px 0" }}>
          {[{ id: "visit", icon: "✈️", title: "Visit", desc: "Should I travel?", bg: "#E8F5E9", iconBg: "#C8E6C9", hoverBorder: "#188038" },
            { id: "invest", icon: "📈", title: "Invest", desc: "Is the dip opportunity?", bg: "#E3F2FD", iconBg: "#BBDEFB", hoverBorder: "#1A73E8" },
            { id: "move", icon: "🏠", title: "Stay / Move", desc: "Stay, leave, relocate?", bg: "#FEF7E0", iconBg: "#FFE0B2", hoverBorder: "#E37400" },
            { id: "understand", icon: "🔍", title: "Understand", desc: "The full picture", bg: "#F1F3F4", iconBg: "#E8EAED", hoverBorder: "#5F6368" }].map(i => (
            <div key={i.id} onClick={() => setUserIntent(i.id)} style={{ background: i.bg, borderRadius: "16px", border: "2px solid transparent", padding: "28px 16px", cursor: "pointer", textAlign: "center", transition: "all 0.25s", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = i.hoverBorder; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "var(--gw-radius-md)", background: i.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", marginBottom: "4px" }}>{i.icon}</div>
              <div style={{ fontFamily: "'Google Sans', sans-serif", fontWeight: 500, fontSize: "15px", color: "var(--gw-text-primary)" }}>{i.title}</div>
              <div style={{ fontSize: "12px", color: "var(--gw-text-tertiary)" }}>{i.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#555" }}>I'm from:</label>
          <select className="sig-input" style={{ maxWidth: "220px" }} value={originCountry} onChange={e => setOriginCountry(e.target.value)}><option value="">Select nationality...</option>{originCountries.map(c => <option key={c} value={c}>{c}</option>)}</select>
        </div>
      </div>)}

      {/* ═══ PERSONALIZED PAGES (after intent selected) ═══ */}
      {userIntent && (<div>
        {/* Back + intent label */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <button onClick={() => { setUserIntent(null); setAdvisorStep(0); setAdvisorAnswers({}); setChatMessages([]); }} style={{ background: "var(--gw-surface-variant)", border: "none", borderRadius: "var(--gw-radius-full)", padding: "8px 16px", fontSize: "13px", fontWeight: 500, cursor: "pointer", color: "var(--gw-text-secondary)", fontFamily: "'Google Sans', sans-serif", transition: "background 0.15s" }}>← Back</button>
          <div style={{ flex: 1 }}>
            <div className="gw-overline">PERSONALIZED FOR: {myRes.i} {myRes.l.toUpperCase()}{originCountry ? ` · ${originCountry.toUpperCase()}` : ""}</div>
            <div style={{ fontSize: "18px", fontWeight: 500, color: "var(--gw-text-primary)", fontFamily: "'Google Sans Display', sans-serif" }}>{userIntent === "visit" ? "✈️ Should I Visit?" : userIntent === "invest" ? "📈 Investment Analysis" : userIntent === "move" ? "🏠 Should I Stay / Move?" : "🔍 Full Risk Picture"}</div>
          </div>
          {!originCountry && <select className="sig-input" style={{ maxWidth: "200px" }} value={originCountry} onChange={e => setOriginCountry(e.target.value)}><option value="">Select nationality...</option>{originCountries.map(c => <option key={c} value={c}>{c}</option>)}</select>}
        </div>

        {/* ═══ VISIT PAGE ═══ */}
        {userIntent === "visit" && (<div className="space-y-4">
          <div className="sig-section-title">🧭 Your Assessment</div>
          {renderAdvisor()}
          <div className="sig-section-title">🚨 Advisories</div>
          {renderAdvisories()}
          <div className="sig-section-title">📊 Key Numbers</div>
          {renderStats([0,1,2,3])}
          {renderDefense()}
          <div className="sig-section-title">🧠 Risk in Context</div>
          {renderPerception()}
          <div className="sig-section-title">💬 Ask the AI Analyst</div>
          {renderAI()}
          {renderFooter()}
        </div>)}

        {/* ═══ INVEST PAGE ═══ */}
        {userIntent === "invest" && (<div className="space-y-4">
          <div className="sig-section-title">📈 Crisis Opportunity Analysis</div>
          {renderInvestment()}
          <div className="sig-section-title">🛢️ Economic Snapshot</div>
          {renderStats([4,5,6,7])}
          <div className="sig-card sig-fade"><div className="sig-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>{[["AED/USD Peg",CONFLICT_DATA.aedPeg,"#34A853","Stable"],["Sovereign Wealth",CONFLICT_DATA.sovereignWealth,"#34A853","Backing"],["Emirates",CONFLICT_DATA.emirates.capacity,"#E8710A","Capacity"],["Status",CONFLICT_DATA.status.split(",")[0],"#EA4335","Ongoing"]].map(([l,v,c,s],i) => (<div key={i} style={{ padding: "12px", background: "#FAFBFC", borderRadius: "8px" }}><div style={{ fontSize: "10px", color: "#999", fontWeight: 600 }}>{l}</div><div style={{ fontSize: "18px", fontWeight: 800, color: c, marginTop: "2px" }}>{v}</div><div style={{ fontSize: "10px", color: "#888" }}>{s}</div></div>))}</div></div>
          <div className="sig-section-title">📈 Forecast</div>
          {renderForecast()}
          <div className="sig-section-title">💬 Ask the AI Analyst</div>
          {renderAI()}
          {renderFooter()}
        </div>)}

        {/* ═══ MOVE/STAY PAGE ═══ */}
        {userIntent === "move" && (<div className="space-y-4">
          <div className="sig-section-title">🧭 Your Assessment</div>
          {renderAdvisor()}
          <div className="sig-section-title">📊 Situation Data</div>
          {renderStats([0,1,2,3])}
          {renderDefense()}
          <div className="sig-section-title">🗺️ Threat Proximity</div>
          <ThreatMap />
          <InterceptorGauge />
          <div className="sig-section-title">🛣️ Departure Options</div>
          {renderEscapeRoutes()}
          <div className="sig-section-title">📦 Infrastructure</div>
          {renderSupply()}
          <div className="sig-section-title">📅 What Happened</div>
          {renderTimeline()}
          <div className="sig-section-title">💬 Ask the AI Analyst</div>
          {renderAI()}
          {renderFooter()}
        </div>)}

        {/* ═══ UNDERSTAND PAGE ═══ */}
        {userIntent === "understand" && (<div className="space-y-4">
          <WhatChangedToday />
          <div className="sig-section-title">📊 Full Situation Data</div>
          {renderStats()}
          <div className="sig-section-title">🛡️ Defense</div>
          {renderDefense()}
          <div className="sig-section-title">🗺️ Threat Map</div>
          <ThreatMap />
          <InterceptorGauge />
          <div className="sig-section-title">📅 Timeline</div>
          {renderTimeline()}
          <div className="sig-section-title">🛣️ Routes & Infrastructure</div>
          {renderEscapeRoutes()}
          {renderSupply()}
          <div className="sig-section-title">📈 Forecast</div>
          {renderForecast()}
          <div className="sig-section-title">🚨 Advisories</div>
          {renderAdvisories()}
          <div className="sig-section-title">🧠 Risk in Context</div>
          {renderPerception()}
          <div className="sig-section-title">💬 Ask the AI Analyst</div>
          {renderAI()}
          {renderFooter()}
        </div>)}
      </div>)}
    </div>
  );
};


// ─── MAIN APP ───────────────────────────────────────────────────────────────

const TAB_KEYS = [
  { key: "shouldigo", emoji: "🎯", shortLabel: "Should I Go?" },
  { key: "dashboard", emoji: "📊", shortLabel: "Data" },
  { key: "analysis", emoji: "📋", shortLabel: "Analysis" },
  { key: "ai", emoji: "🤖", shortLabel: "AI" },
  { key: "intel", emoji: "📡", shortLabel: "Intel" },
  { key: "emergency", emoji: "🚨", shortLabel: "SOS" },
];

export default function App() {
  const [tab, setTab] = useState("shouldigo");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [lang, setLang] = useState("en");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [selCountry, setSelCountry] = useState("UAE");
  const [selCity, setSelCity] = useState("Dubai");
  const [resStatus, setResStatus] = useState("expat_family");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);

  // URL state persistence
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("c")) setSelCountry(params.get("c"));
    if (params.get("city")) setSelCity(params.get("city"));
    if (params.get("r")) setResStatus(params.get("r"));
    if (params.get("tab")) setTab(params.get("tab"));
    if (params.get("dark") === "1") setDarkMode(true);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selCountry !== "UAE") params.set("c", selCountry);
    if (selCity !== "Dubai") params.set("city", selCity);
    if (resStatus !== "expat_family") params.set("r", resStatus);
    if (tab !== "shouldigo") params.set("tab", tab);
    if (darkMode) params.set("dark", "1");
    const qs = params.toString();
    window.history.replaceState({}, "", qs ? `?${qs}` : window.location.pathname);
  }, [selCountry, selCity, resStatus, tab, darkMode]);

  const shareUrl = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: "GCC War Room", text: `Day ${CONFLICT_DATA.day} — ${selCity}, ${selCountry} — Risk Analysis`, url });
    } else {
      navigator.clipboard?.writeText(url);
      alert("Link copied to clipboard!");
    }
  };


  const countryData = GCC_DATA[selCountry];
  const cityData = countryData?.cities?.[selCity];
  const baseRisk = cityData?.risk || countryData?.riskScore || 5;
  const resTypeData = RESIDENT_TYPES[resStatus];
  const cityRisk = Math.max(1, Math.min(5, baseRisk + (resTypeData?.riskAdjust || 0)));
  const riskColor = cityRisk >= 5 ? "#DC2626" : cityRisk >= 4 ? "#D97706" : cityRisk >= 3 ? "#2563EB" : cityRisk >= 2 ? "#0891B2" : "#059669";
  const riskLabel = cityRisk >= 5 ? "CRITICAL" : cityRisk >= 4 ? "HIGH" : cityRisk >= 3 ? "ELEVATED" : cityRisk >= 2 ? "MODERATE" : "LOW";
  const alertConfig = getAlertConfig(cityRisk, resStatus, countryData);
  const isRTL = ["ar", "ur", "fa"].includes(lang);

  const keySignals = [
    "DXB fuel tank fire from drone — 3rd airport hit (TODAY)",
    "Iran declared Jebel Ali 'legitimate target' — 25 km from JBR",
    "Interceptor depletion accelerating — defense shield degrading",
  ];

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-[#F8F9FA]"}`} style={{ fontFamily: "'Google Sans Text', 'Google Sans', -apple-system, BlinkMacSystemFont, sans-serif" }} dir={isRTL ? "rtl" : "ltr"}>
      {/* All styles inline — index.css only has @tailwind directives */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Display:wght@400;500;700&family=Google+Sans+Text:wght@400;500;700&display=swap');

        :root {
          --gw-bg: #FFFFFF;
          --gw-surface: #F8F9FA;
          --gw-surface-variant: #F1F3F4;
          --gw-border: #E8EAED;
          --gw-border-strong: #DADCE0;
          --gw-text-primary: #202124;
          --gw-text-secondary: #5F6368;
          --gw-text-tertiary: #80868B;
          --gw-text-disabled: #BDC1C6;
          --gw-blue: #1A73E8;
          --gw-blue-hover: #1557B0;
          --gw-blue-surface: #E8F0FE;
          --gw-blue-text: #174EA6;
          --gw-red: #D93025;
          --gw-red-surface: #FCE8E6;
          --gw-red-text: #A50E0E;
          --gw-orange: #E37400;
          --gw-orange-surface: #FEF7E0;
          --gw-orange-text: #A06207;
          --gw-green: #188038;
          --gw-green-surface: #E6F4EA;
          --gw-green-text: #0D652D;
          --gw-shadow-1: 0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
          --gw-shadow-2: 0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15);
          --gw-shadow-3: 0 4px 8px rgba(60,64,67,0.3), 0 8px 16px 6px rgba(60,64,67,0.15);
          --gw-radius-sm: 8px;
          --gw-radius-md: 12px;
          --gw-radius-lg: 16px;
          --gw-radius-xl: 24px;
          --gw-radius-full: 100px;
        }

        body { margin:0; font-family:'Google Sans Text','Google Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; -webkit-font-smoothing:antialiased; background:var(--gw-surface); color:var(--gw-text-primary); }
        *{scrollbar-width:thin;scrollbar-color:var(--gw-border-strong) transparent; box-sizing:border-box;}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:var(--gw-border-strong);border-radius:3px}
        input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:var(--gw-blue);cursor:pointer;border:2px solid white;box-shadow:var(--gw-shadow-1)}
        @keyframes heartbeat{0%{transform:scale(1)}14%{transform:scale(1.12)}28%{transform:scale(1)}42%{transform:scale(1.08)}56%{transform:scale(1)}100%{transform:scale(1)}}
        .heartbeat{animation:heartbeat 1.5s ease-in-out infinite;transform-origin:center}
        @keyframes soft-pulse{0%,100%{box-shadow:0 0 0 0 rgba(26,115,232,0.35)}50%{box-shadow:0 0 0 6px rgba(26,115,232,0)}}
        .soft-pulse{animation:soft-pulse 2.5s ease-in-out infinite}
        @keyframes gw-fade-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .gw-fade{animation:gw-fade-in 0.35s ease-out both}
        .gw-fade-1{animation-delay:0.04s}.gw-fade-2{animation-delay:0.08s}.gw-fade-3{animation-delay:0.12s}.gw-fade-4{animation-delay:0.16s}.gw-fade-5{animation-delay:0.2s}
        .gw-card{background:var(--gw-bg);border-radius:var(--gw-radius-md);border:1px solid var(--gw-border);transition:box-shadow 0.2s}
        .gw-card:hover{box-shadow:var(--gw-shadow-1)}
        .gw-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--gw-radius-sm);border:1px solid var(--gw-border-strong);background:var(--gw-bg);font-size:13px;font-weight:500;color:var(--gw-text-primary);cursor:pointer;transition:all 0.15s;font-family:'Google Sans Text',sans-serif}
        .gw-chip:hover{border-color:var(--gw-blue);background:var(--gw-blue-surface)}
        .gw-chip.active{border-color:var(--gw-blue);background:var(--gw-blue-surface);color:var(--gw-blue-text)}
        .gw-section-title{font-family:'Google Sans',sans-serif;font-size:16px;font-weight:500;color:var(--gw-text-primary);margin:24px 0 12px;display:flex;align-items:center;gap:8px}
        .gw-overline{font-size:10px;font-weight:500;letter-spacing:0.8px;text-transform:uppercase;color:var(--gw-text-tertiary)}
        .gw-display{font-family:'Google Sans Display',sans-serif}
        select.gw-select{font-family:'Google Sans Text',sans-serif;padding:10px 36px 10px 14px;border-radius:var(--gw-radius-sm);border:1px solid var(--gw-border-strong);background:var(--gw-bg);font-size:13px;font-weight:500;color:var(--gw-text-primary);cursor:pointer;transition:all 0.15s;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2380868B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center}
        select.gw-select:hover{border-color:var(--gw-blue)}
        select.gw-select:focus{outline:none;border-color:var(--gw-blue);box-shadow:0 0 0 2px var(--gw-blue-surface)}
      `}</style>

      {/* HEADER — Google Workspace Style */}
      <header className="bg-white border-b sticky top-0 z-40" style={{ borderColor: 'var(--gw-border)' }}>
        <div className="flex items-center gap-3 px-4 py-2.5">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-full hover:bg-[#F1F3F4] transition-colors">
            <Menu className="w-5 h-5" style={{ color: 'var(--gw-text-secondary)' }} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--gw-blue)', fontFamily: "'Google Sans Display', sans-serif" }}>W</div>
            <div>
              <span className="hidden sm:inline text-[15px] font-medium" style={{ color: 'var(--gw-text-primary)', fontFamily: "'Google Sans', sans-serif" }}>GCC War Room</span>
              <span className="sm:hidden text-[15px] font-medium" style={{ color: 'var(--gw-text-primary)', fontFamily: "'Google Sans', sans-serif" }}>GCC War Room</span>
              <span className="hidden sm:inline text-[11px] ml-2" style={{ color: 'var(--gw-text-tertiary)' }}>Day {CONFLICT_DAY} · {CONFLICT_DATA.date}</span>
            </div>
          </div>

          {/* Desktop Tabs — Google Workspace style */}
          <div className="hidden md:flex items-center gap-1 ml-4">
            {TAB_KEYS.map(tk => (
                <button key={tk.key} onClick={() => setTab(tk.key)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-medium transition-all relative"
                  style={{
                    fontFamily: "'Google Sans', sans-serif",
                    background: tab === tk.key ? 'var(--gw-blue-surface)' : 'transparent',
                    color: tab === tk.key ? 'var(--gw-blue-text)' : 'var(--gw-text-secondary)',
                  }}>
                  <span className="text-sm">{tk.emoji}</span>{tk.shortLabel}
                </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Language */}
            <div className="relative">
              <button onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-full text-[13px] font-medium transition-colors hover:bg-[#F1F3F4]"
                style={{ color: 'var(--gw-text-secondary)' }}>
                <span>{LANGUAGES.find(l => l.code === lang)?.flag}</span>
                <ChevronDown className="w-3 h-3" style={{ color: 'var(--gw-text-disabled)' }} />
              </button>
              {showLangMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white z-50 py-1 max-h-80 overflow-y-auto" style={{ borderRadius: 'var(--gw-radius-md)', border: '1px solid var(--gw-border)', boxShadow: 'var(--gw-shadow-2)' }}>
                    {LANGUAGES.map(l => (
                      <button key={l.code} onClick={() => { setLang(l.code); setShowLangMenu(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-[13px] transition-colors"
                        style={{ fontFamily: "'Google Sans Text', sans-serif", background: lang === l.code ? 'var(--gw-blue-surface)' : 'transparent', color: lang === l.code ? 'var(--gw-blue-text)' : 'var(--gw-text-primary)', fontWeight: lang === l.code ? 500 : 400 }}>
                        <span className="text-base">{l.flag}</span>
                        <span>{l.label}</span>
                        {lang === l.code && <Check className="w-3.5 h-3.5 ml-auto" style={{ color: 'var(--gw-blue)' }} />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button onClick={shareUrl} className="p-2 rounded-full hover:bg-[#F1F3F4] transition-colors" title="Share">
              <ExternalLink className="w-4 h-4" style={{ color: 'var(--gw-text-secondary)' }} />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-[#F1F3F4] transition-colors" title="Toggle theme">
              <span className="text-base">{darkMode ? "☀️" : "🌙"}</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-full" style={{ background: 'var(--gw-surface-variant)' }}>
              <span className="w-2 h-2 rounded-full heartbeat" style={{ background: riskColor }} />
              <span className="text-[11px] font-medium" style={{ color: riskColor }}>L{cityRisk}</span>
            </div>
          </div>
        </div>

        {/* Level Strip — thin informational bar */}
        <div className="flex items-center gap-3 px-4 py-2" style={{ background: cityRisk >= 4 ? 'var(--gw-orange-surface)' : cityRisk >= 3 ? 'var(--gw-blue-surface)' : 'var(--gw-green-surface)', borderTop: '1px solid var(--gw-border)' }}>
          <span className="text-[10px] font-bold px-3 py-1 rounded-full text-white" style={{ background: riskColor, letterSpacing: '0.5px' }}>LEVEL {cityRisk}</span>
          <span className="text-[12px] font-medium flex-1" style={{ color: 'var(--gw-text-secondary)' }}>{riskLabel} — {alertConfig.title}</span>
          <span className="text-[11px] hidden sm:inline" style={{ color: 'var(--gw-text-tertiary)' }}>{new Date(now).toLocaleTimeString()}</span>
        </div>

        {/* Selector Strip — Google Chips */}
        <div className="flex items-center gap-2 px-4 py-2.5 flex-wrap" style={{ background: 'var(--gw-surface)', borderTop: '1px solid var(--gw-border)' }}>
          <select value={selCountry} onChange={e => { setSelCountry(e.target.value); const cities = Object.keys(GCC_DATA[e.target.value]?.cities || {}); setSelCity(cities[0] || ""); }}
            className="gw-select">
            {Object.entries(GCC_DATA).map(([k, v]) => (
              <option key={k} value={k}>{v.flag} {v.name}</option>
            ))}
          </select>
          <select value={selCity} onChange={e => setSelCity(e.target.value)}
            className="gw-select">
            {Object.keys(countryData?.cities || {}).map(c => (
              <option key={c} value={c}>📍 {c}</option>
            ))}
          </select>
          <select value={resStatus} onChange={e => setResStatus(e.target.value)}
            className="gw-select" style={{ borderColor: 'var(--gw-blue)', background: 'var(--gw-blue-surface)' }}>
            {Object.entries(RESIDENT_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
        </div>

        {/* Mobile Tabs — Google Workspace bottom-nav style */}
        <div className="md:hidden flex overflow-x-auto" style={{ borderTop: '1px solid var(--gw-border)' }}>
          {TAB_KEYS.map(tk => (
              <button key={tk.key} onClick={() => setTab(tk.key)}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 min-w-0 transition-colors relative"
                style={{ color: tab === tk.key ? 'var(--gw-blue)' : 'var(--gw-text-tertiary)' }}>
                <span className="text-lg leading-none">{tk.emoji}</span>
                <span style={{ fontSize: "9px", fontWeight: 500, fontFamily: "'Google Sans Text', sans-serif" }}>{tk.shortLabel}</span>
                {tab === tk.key && <span className="absolute bottom-0 left-[20%] right-[20%] h-[3px] rounded-t" style={{ background: 'var(--gw-blue)' }} />}
              </button>
          ))}
        </div>
      </header>

      <div className="flex">
        {/* SIDEBAR */}
        <aside className={`fixed lg:sticky top-[160px] left-0 z-30 h-[calc(100vh-160px)] w-72 bg-white border-r overflow-y-auto transition-transform duration-300 shadow-lg lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}>
          <div className="p-5 space-y-5">
            {/* Heartbeat Gauge */}
            <div className="flex justify-center">
              <div className="relative w-36 h-36">
                <RiskGaugeSVG risk={cityRisk} color={riskColor} label={riskLabel} size={140} />
              </div>
            </div>

            {/* Location + Resident Info */}
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-700">{countryData?.flag} {selCity || selCountry}</p>
              <p className="text-[10px] text-gray-500">{resTypeData?.icon} {resTypeData?.label}</p>
              <p className="text-[10px] text-gray-400">{REPORT_DATE} · Day {CONFLICT_DAY}</p>
            </div>

            {/* Location-Specific Risk Card */}
            {cityData && (
              <div className={`rounded-xl p-3.5 border ${cityData.signal === "critical" ? "bg-orange-50 border-orange-200" : cityData.signal === "warning" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}`}>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">{t("localRisk", lang)}</p>
                <div className="space-y-1.5 text-[11px]">
                  <div><span className="text-gray-500">{t("distToStrike", lang)}:</span><br/><span className="font-semibold text-gray-800">{cityData.nearestStrike}</span></div>
                  <div><span className="text-gray-500">{t("distToTarget", lang)}:</span><br/><span className="font-semibold text-gray-800">{cityData.nearestTarget}</span></div>
                  <div><span className="text-gray-500">{t("evacuationRoute", lang)}:</span><br/><span className="font-semibold text-gray-800">{cityData.evacRoute}</span></div>
                </div>
                {cityData.notes && <p className="text-[10px] text-gray-500 mt-2 pt-2 border-t border-gray-200/50">{cityData.notes}</p>}
              </div>
            )}

            {/* Key Signals — softer colors */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">{t("signals", lang)}</p>
              {keySignals.map((s, i) => (
                <div key={i} className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-2.5 mb-1.5 leading-relaxed">📌 {s}</div>
              ))}
            </div>

            {/* Sections */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Sections</p>
              <div className="space-y-0.5">
                {ACCORDION_SECTIONS.map((s, i) => (
                  <button key={s.id} onClick={() => setTab("analysis")}
                    className="w-full text-left text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-50 px-2 py-1.5 rounded-lg truncate flex items-center gap-1.5 transition-colors">
                    <span>{le(s.worstLevel)}</span><span className="truncate">{i + 1}. {s.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Verdict — contextual per resident type and country */}
            <div className={`rounded-xl p-4 border ${cityRisk >= 4 ? "bg-orange-50 border-orange-200" : cityRisk >= 3 ? "bg-blue-50 border-blue-200" : "bg-emerald-50 border-emerald-200"}`}>
              <p className={`text-xs font-bold mb-1 ${cityRisk >= 4 ? "text-orange-800" : cityRisk >= 3 ? "text-blue-800" : "text-emerald-800"}`}>{alertConfig.icon} {alertConfig.title}</p>
              <p className={`text-[10px] ${cityRisk >= 4 ? "text-orange-700" : cityRisk >= 3 ? "text-blue-700" : "text-emerald-700"}`}>{resTypeData?.shortAdvice}</p>
              {countryData?.civilDefense && (
                <p className="text-[9px] text-gray-500 mt-2 pt-2 border-t border-gray-200">
                  📞 Emergency: <strong>{countryData.emergency}</strong> · Follow <strong>{countryData.civilDefense}</strong>
                </p>
              )}
            </div>

            {/* Return Criteria */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Return Criteria</p>
              {RETURN_CRITERIA.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs mb-1.5">
                  <XCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">{r.text}</span>
                </div>
              ))}
              <p className="text-[10px] text-gray-400 mt-2">{t("earliest", lang)}</p>
            </div>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-5xl">
          {tab === "dashboard" && <DashboardTab country={selCountry} city={selCity} lang={lang} resStatus={resStatus} />}
          {tab === "analysis" && <FullAnalysisTab />}
          {tab === "ai" && <AIAnalystTab country={selCountry} city={selCity} resStatus={resStatus} />}
          {tab === "intel" && (<div className="space-y-6"><LiveIntelTab /><div className="border-t-2 border-gray-200 pt-6"><div className="flex items-center gap-2 mb-4"><span className="text-lg">𝕏</span><span className="text-sm font-bold text-gray-800">Live Feeds from X</span></div><LiveTweetsTab /></div></div>)}
          {tab === "shouldigo" && <ShouldIGoTab conflictDay={CONFLICT_DAY} casualties={{ killed: 8, injured: 145, debrisInjuries: 131 }} missileData={{ ballistic: 298, cruise: 15, drones: 1606, total: 1919 }} interceptionRate="90–94%" straitStatus="-94% traffic" oilPrice="$104+" selectedLanguage={lang} userCountry={selCountry} resStatus={resStatus} confidenceLevel={4} />}
          {tab === "emergency" && <EmergencyTab />}
        </main>
      </div>
    </div>
  );
}
