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
australia: "Reconsider travel plans",
canada: "Avoid All Travel",
},
whatChangedToday: [
"Day 18: Israel launches wide-scale strikes on Tehran",
"UAE briefly closes airspace for new attack wave",
"Total projectiles at UAE now 1,919 (up from 1,797)",
"UAE casualties updated: 8 killed, 145 injured",
"No ceasefire talks. No diplomatic channels open.",
,]
;}
// ─── LANGUAGE SYSTEM ────────────────────────────────────────────────────────
const LANGUAGES = [
{ code: "en", label: "English", flag: " " },
{ code: "ar", label: "اﻟﻌﺮﺑﯿﺔ", flag: " { code: "hi", label: "िहन्दी", flag: " " },
" },
{ code: "ur", label: "اردو", flag: " { code: "tl", label: "Filipino", flag: " { code: "bn", label: "বাংলা", flag: " " },
" },
" },
{ code: "ml", label: "മലയാളം", flag: " " },
{ code: "fa", label: "ﻓﺎرﺳﯽ", flag: " { code: "fr", label: "Français", flag: " { code: "zh", label: "中⽂", flag: " " },
" },
" },
;]
const T = {
en: { dashboard: "Dashboard", analysis: "Full Analysis", ai: "AI Analyst", intel: "Live Int
ﺷﺮة" :intel ,"ﻣﺤﻠﻞ اﻟﺬﻛﺎء" :ai ,"اﻟﺘﺤﻠﯿﻞ اﻟﻜﺎﻣﻞ" :analysis ,"ﻟﻮﺣﺔ اﻟﻘﯿﺎدة" :ar: { dashboard
hi: { dashboard: "डैशबोडर्", analysis: "पूणर् िवश्लेषण", ai: "AI िवश्लेषक", intel: "लाइव इं टेल", emergenc
ﻻﺋﯿﻮ اﻧﭩﯿﻞ" :intel ,"ﺗﺠﺰﯾہ ﮐﺎر ai: "AI ,"ﻣﮑﻤﻞ ﺗﺠﺰﯾہ" :analysis ,"ڈﯾﺶ ﺑﻮرڈ" :ur: { dashboard
tl: { dashboard: "Dashboard", analysis: "Buong Pagsusuri", ai: "AI Analyst", intel: "Live I
bn: { dashboard: "ডাশেবাড ", analysis: "সূণ িবেষণ", ai: "AI িবেষক", intel: "লাইভ ইেল", emerg
ml: { dashboard: "ഡാഷ്േബാർഡ്", analysis: "പൂർണ വിശകലനം", ai: "AI അനലി6്", intel: "ൈലവ് ഇ
زﻧﺪه" :intel ,"ﺗﺤﻠﯿﻠﮕﺮ ھﻮش ﻣﺼﻨﻮﻋﯽ" :ai ,"ﺗﺤﻠﯿﻞ ﮐﺎﻣﻞ" :analysis ,"داﺷﺒﻮرد" :fa: { dashboard
fr: { dashboard: "Tableau de bord", analysis: "Analyse complète", ai: "Analyste IA", intel:
zh: { dashboard: "仪表板", analysis: "完整分析", ai: "AI分析师", intel: "实时情报", emergency: "
;}
const t = (key, lang) => (T[lang] && T[lang][key]) || T.en[key] || key;
// ─── GCC COUNTRY / CITY DATA ────────────────────────────────────────────────
const GCC_DATA = {
UAE: {
name: "United Arab Emirates", flag: " ", riskScore: 5, civilDefense: "NCEMA", defenseDes
advisory: "Level 5 — Follow all official guidance. Check government advisory channels for
cities: {
"Dubai": { risk: 5, nearestStrike: "Palm Jumeirah / DIFC (multiple confirmed strikes)",
"Abu Dhabi City": { risk: 5, nearestStrike: "Abu Dhabi Zayed Airport (1 killed, 7 wound
"Sharjah": { risk: 5, nearestStrike: "Sharjah residential areas & mall (3 killed, 58 in
"Fujairah": { risk: 5, nearestStrike: "Fujairah Oil Terminal (struck 4 times)", nearest
"Al Ain": { risk: 4, nearestStrike: "Abu Dhabi (~120 km)", nearestTarget: "Al Dhafra (~
"Ras Al Khaimah": { risk: 4, nearestStrike: "Sharjah (~50 km)", nearestTarget: "Militar
}
},
"Saudi Arabia": {
name: "Saudi Arabia", flag: " ", riskScore: 4, civilDefense: "Saudi Civil Defense", defe
advisory: "Level 4 — Direct GCC Threat. Riyadh and eastern province struck. Ras Tanura ab
cities: {
"Riyadh": { risk: 4, nearestStrike: "Riyadh struck by Iranian missiles", nearestTarget:
"Jeddah": { risk: 3, nearestStrike: "Not directly struck yet", nearestTarget: "Yanbu oi
"Dammam / Eastern Province": { risk: 4, nearestStrike: "Eastern province struck", neare
"NEOM / Tabuk": { risk: 2, nearestStrike: "No confirmed strikes in NW", nearestTarget:
}
},
Bahrain: {
name: "Bahrain", flag: " ", riskScore: 5, civilDefense: "Bahrain Civil Defense", defense
advisory: "Level 5 — Major strikes on Bapco refinery and naval HQ. Negligible strategic d
cities: {
"Manama": { risk: 5, nearestStrike: "Bapco refinery, naval HQ struck", nearestTarget: "
}
},
Qatar: {
name: "Qatar", flag: " ", riskScore: 4, civilDefense: "Qatar Civil Defense", defenseDesc
advisory: "Level 4 — 47 drones, 118 BMs intercepted. Al Udeid (largest US base) targeted.
cities: {
"Doha": { risk: 4, nearestStrike: "Multiple interceptions over Qatar", nearestTarget: "
}
},
Kuwait: {
name: "Kuwait", flag: " ", riskScore: 4, civilDefense: "Kuwait Civil Defense", defenseDe
advisory: "Level 4 — Airport struck. Camp Arifjan (US Army Central HQ) targeted.",
cities: {
"Kuwait City": { risk: 4, nearestStrike: "Kuwait Airport struck", nearestTarget: "Camp
}
},
Oman: {
name: "Oman", flag: " ", riskScore: 3, civilDefense: "Oman NCSI", defenseDesc: "National
advisory: "Level 3 — Historically neutral but struck for first time ever. 5 injured, 2 ki
cities: {
"Muscat": { risk: 3, nearestStrike: "Oman struck (first time ever) — 5 injured, 2 kille
"Salalah": { risk: 2, nearestStrike: "Far from confirmed strikes", nearestTarget: "Mini
}
},
// ─── WIDER MIDDLE EAST ─────────────────────────────────────────
Jordan: {
name: "Jordan", flag: " ", riskScore: 3, civilDefense: "Jordan Civil Defense", defenseDe
advisory: "Level 3 — Airspace violations, missile interceptions over Amman. 28 injuries r
cities: {
"Amman": { risk: 3, nearestStrike: "Missile interceptions over Amman airspace", nearest
"Aqaba": { risk: 2, nearestStrike: "No confirmed strikes", nearestTarget: "Limited mili
}
},
Iraq: {
name: "Iraq", flag: " ", riskScore: 4, civilDefense: "Iraq Civil Defense", defenseDesc:
advisory: "Level 4 — 29 killed. Erbil Airport struck. PMF HQ targeted. Baghdad Green Zone
cities: {
"Baghdad": { risk: 4, nearestStrike: "Green Zone explosions, PMF HQ struck", nearestTar
"Erbil": { risk: 4, nearestStrike: "Erbil Airport directly struck", nearestTarget: "US/
"Basra": { risk: 3, nearestStrike: "Oil infrastructure at risk", nearestTarget: "Basra
}
defens
},
Lebanon: {
name: "Lebanon", flag: " ", riskScore: 5, civilDefense: "Lebanese Civil Defense", advisory: "Level 5 — Active Israeli ground invasion. 850+ killed, 1M+ displaced. Hezbolla
cities: {
"Beirut": { risk: 5, nearestStrike: "Dahiyeh suburbs under sustained Israeli bombardmen
"Tripoli": { risk: 3, nearestStrike: "Northern Lebanon less targeted", nearestTarget: "
}
},
Syria: {
name: "Syria", flag: " ", riskScore: 4, civilDefense: "Syrian Civil Defense", defenseDes
advisory: "Level 4 — Caught between multiple fronts. Israeli strikes on Iranian assets. U
cities: {
"Damascus": { risk: 4, nearestStrike: "Israeli strikes on Iranian military assets near
}
},
Israel: {
name: "Israel", flag: " ", riskScore: 5, civilDefense: "Home Front Command", defenseDesc
advisory: "Level 5 — Direct Iranian missile exchange. 15 killed, 3,530+ injured. Simultan
cities: {
"Tel Aviv": { risk: 5, nearestStrike: "Multiple Iranian ballistic missile impacts in ce
"Haifa": { risk: 5, nearestStrike: "Hezbollah rockets from Lebanon + Iranian missiles",
}
},
Egypt: {
name: "Egypt", flag: " ", riskScore: 2, civilDefense: "Egyptian Civil Protection", defen
advisory: "Level 2 — Not directly targeted. Suez Canal disruption risk from Houthi cities: {
escala
"Cairo": { risk: 2, nearestStrike: "No confirmed strikes on Egypt", nearestTarget: "Sue
}
},
Yemen: {
name: "Yemen", flag: " ", riskScore: 4, civilDefense: "Yemen Civil Defense", defenseDesc
advisory: "Level 4 — Houthi forces on standby. Full entry into war assessed 65-75% within
cities: {
"Sanaa": { risk: 4, nearestStrike: "Israeli strikes in Aug-Sep 2025 killed Houthi PM",
}
},
};
const RESIDENT_TYPES = {
tourist: {
label: "Tourist / Short-Stay",
icon: " ",
riskAdjust: 0,
getMsg: (cd) => `Complete your trip and depart on your scheduled flight or earlier. Don't
tier2: (cd) => `Depart immediately by any available means. Do not wait for your scheduled
tier3: (cd) => "Follow government evacuation orders. Use any available transport.",
shortAdvice: "Depart as planned — don't extend",
},
business: {
label: "Business Visitor",
icon: " ",
riskAdjust: -1,
getMsg: (cd) => `Conclude your business promptly. Keep flights flexible and book backups.
tier2: (cd) => `Wrap up within 48 hours and depart. Situation has materially worsened. Fo
tier3: (cd) => "Follow government evacuation orders immediately.",
shortAdvice: "Conclude business — keep flights flexible",
},
expat_single: {
label: "Expat Resident (Single)",
icon: " ",
riskAdjust: -2,
getMsg: (cd) => `Continue your routine with awareness. Follow ${cd.civilDefense} alerts a
tier2: (cd) => `Situation worsening — activate contingency plan. Follow ${cd.civilDefense
tier3: (cd) => `Follow official evacuation guidance from ${cd.civilDefense}. Use prepared
shortAdvice: "Stay prepared — follow local alerts",
},
expat_family: {
label: "Expat Resident (Family)",
icon: " ",
riskAdjust: -2,
getMsg: (cd) => `Your family is safe. Follow ${cd.civilDefense} shelter drills with your
tier2: (cd) => `Situation has materially worsened. Families with young children should co
tier3: (cd) => `Evacuate with your family. Follow ${cd.civilDefense} guidance. Emergency:
shortAdvice: "Family safe — follow shelter drills, have a plan",
},
national: {
label: "National / Citizen",
icon: " ",
riskAdjust: -3,
getMsg: (cd) => `Your country's defense systems are active. ${cd.defensePerf ? cd.defense
tier2: (cd) => `Situation is serious. Follow all ${cd.civilDefense} guidance. Support com
tier3: (cd) => "Follow government evacuation orders if issued. Your safety is the priorit
shortAdvice: "Your nation is strong — follow civil defense",
},
diplomatic: {
label: "Diplomatic / Government",
icon: " ",
riskAdjust: 0,
getMsg: (cd) => `Follow your mission's official guidance. Coordinate with your government
tier2: (cd) => "Follow mission guidance. Most embassies have activated evacuation protoco
tier3: (cd) => "Follow your government's emergency extraction plan.",
shortAdvice: "Follow your mission's official guidance",
},
};
// ─── RISK HELPERS ───────────────────────────────────────────────────────────
const getTier = (adjustedRisk) => {
if (adjustedRisk >= 5) return 3; // Maximum alert level
if (adjustedRisk >= 4) return 2; // CONSIDER RELOCATING
return 1; // PREPARED - stay with awareness
};
// Get contextual alert banner config
const getAlertConfig = (adjustedRisk, resType, countryData) => {
const rt = RESIDENT_TYPES[resType];
const cd = countryData || { civilDefense: "Civil Defense", emergency: "911", defensePerf: "
if (adjustedRisk >= 5) return {
bg: "bg-gradient-to-r from-rose-500 to-orange-400",
title: resType === "tourist" ? "DEPART ON SCHEDULE OR EARLIER" : resType === "diplomatic"
msg: rt.tier2(cd),
icon: " ",
};
if (adjustedRisk >= 4) return {
bg: "bg-gradient-to-r from-amber-400 to-yellow-300",
title: "STAY PREPARED — MONITOR SITUATION",
msg: rt.getMsg(cd),
icon: " ",
dark: true,
};
if (adjustedRisk >= 3) return {
bg: "bg-gradient-to-r from-blue-400 to-sky-300",
title: "STAY AWARE — SITUATION ONGOING",
msg: rt.getMsg(cd),
icon: " ",
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
msg: `Standard safety awareness. Stay informed through ${cd.civilDefense} and official ch
icon: "✓",
dark: true,
};
};
// Circle shape SVG per risk level
const RiskGaugeSVG = ({ risk, color, label, size = 140 }) => {
const c = size / 2;
const r = c * 0.75;
const circ = 2 * Math.PI * r;
repeat
// Different shapes based on risk level
if (risk >= 5) {
// Pulsing warning — sharp octagon outline
return (
<svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full heartbeat">
<circle cx={c} cy={c} r={r} fill="none" stroke="#F3F4F6" strokeWidth="6" />
<circle cx={c} cy={c} r={r + 4} fill="none" stroke={color} strokeWidth="1" opacity="0
<animate attributeName="r" values={`${r + 2};${r + 10};${r + 2}`} dur="1.5s" <animate attributeName="opacity" values="0.25;0;0.25" dur="1.5s" repeatCount="indef
</circle>
<circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth="6"
strokeDasharray={`${circ * 0.95} ${circ * 0.05}`}
strokeLinecap="round" transform={`rotate(-90 ${c} ${c})`} />
<text x={c} y={c - 4} textAnchor="middle" fill={color} fontSize="32" fontWeight="900"
<text x={c} y={c + 14} textAnchor="middle" fill={color} fontSize="9" fontWeight="700"
<text x={c} y={c + 26} textAnchor="middle" fill="#9CA3AF" fontSize="7">of 5</text>
</svg>
);
}
if (risk >= 4) {
// Triangle warning shape inside circle
return (
<svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" style={{ animation: "hea
<circle cx={c} cy={c} r={r} fill="none" stroke="#F3F4F6" strokeWidth="6" />
<circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth="6"
strokeDasharray={`${circ * (risk / 5) * 0.95} ${circ * (1 - (risk / 5) * 0.95)}`}
strokeLinecap="round" transform={`rotate(-90 ${c} ${c})`} />
<polygon points={`${c},${c - 22} ${c + 20},${c + 14} ${c - 20},${c + 14}`}
fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
<text x={c} y={c - 2} textAnchor="middle" fill={color} fontSize="30" fontWeight="900"
<text x={c} y={c + 16} textAnchor="middle" fill={color} fontSize="9" fontWeight="700"
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
<text x={c} y={c - 2} textAnchor="middle" fill={color} fontSize="30" fontWeight="900"
<text x={c} y={c + 16} textAnchor="middle" fill={color} fontSize="9" fontWeight="700"
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
<path d={`M${c},${c - 18} L${c + 16},${c - 8} L${c + 16},${c + 6} Q${c + 16},${c + 18
fill="none" stroke={color} strokeWidth="1.5" opacity="0.2" />
<text x={c} y={c - 2} textAnchor="middle" fill={color} fontSize="30" fontWeight="900"
<text x={c} y={c + 16} textAnchor="middle" fill={color} fontSize="9" fontWeight="700"
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
<text x={c} y={c - 2} textAnchor="middle" fill={color} fontSize="30" fontWeight="900">{
<text x={c} y={c + 16} textAnchor="middle" fill={color} fontSize="9" fontWeight="700">{
<text x={c} y={c + 28} textAnchor="middle" fill="#9CA3AF" fontSize="7">of 5</text>
</svg>
);
};
const RISK_SIGNALS = [
{ id: 1, category: "Physical Security", level: "critical", text: "Active daily missile & dr
{ id: 2, category: "Aviation", level: "critical", text: "DXB airport struck 3 times; flight
{ id: 3, category: "Aviation", level: "critical", text: "All major Western carriers suspend
{ id: 4, category: "Strait of Hormuz", level: "critical", text: "Strait of Hormuz effective
{ id: 5, category: "Air Defense", level: "critical", text: "Interceptor depletion crisis —
{ id: 6, category: "Escalation", level: "critical", text: "No ceasefire, no negotiations, n
{ id: 7, category: "Physical Security", level: "critical", text: "Iran explicitly named Jeb
{ id: 8, category: "Physical Security", level: "critical", text: "Palm Jumeirah struck Marc
{ id: 9, category: "Government Advisories", level: "critical", text: "US Embassy reduced op
{ id: 10, category: "Government Advisories", level: "critical", text: "UK planning continge
{ id: 11, category: "Supply Chain", level: "critical", text: "Jebel Ali Port at reduced thr
{ id: 12, category: "Economic Impact", level: "critical", text: "Travel insurance invalidat
{ id: 13, category: "Houthi Wildcard", level: "warning", text: "Houthi full entry 65–75% pr
{ id: 14, category: "Air Defense", level: "warning", text: "Iran shifted to heavier 1,000+
{ id: 15, category: "Escalation", level: "warning", text: "US ground troops 15–25% probabil
{ id: 16, category: "Cyber Threats", level: "warning", text: "Electronic Operations Room co
{ id: 17, category: "Cyber Threats", level: "warning", text: "IRGC named Google, Oracle, IB
{ id: 18, category: "Escalation", level: "warning", text: "UAE has only 45 days strategic w
{ id: 19, category: "Economic Impact", level: "warning", text: "DFM real estate index fell
{ id: 20, category: "Houthi Wildcard", level: "warning", text: "Saudi rerouting oil through
{ id: 21, category: "Economic Impact", level: "warning", text: "Oil surged from $67 to $104
{ id: 22, category: "Physical Security", level: "warning", text: "131 of 141 UAE injuries f
{ id: 23, category: "Escalation", level: "warning", text: "Russian Geran-2 drone variants w
{ id: 24, category: "Air Defense", level: "positive", text: "UAE air defense achieving 90–9
{ id: 25, category: "Physical Security", level: "positive", text: "UAE casualties remarkabl
{ id: 26, category: "Houthi Wildcard", level: "positive", text: "Houthis have not yet enter
{ id: 27, category: "Aviation", level: "positive", text: "Emirates operating reduced schedu
{ id: 28, category: "Government Advisories", level: "positive", text: "Oman border open; Mu
{ id: 29, category: "Escalation", level: "neutral", text: "Ceasefire probability: 25–30% by
{ id: 30, category: "Economic Impact", level: "neutral", text: "IEA released 400M barrels f
{ id: 31, category: "Escalation", level: "neutral", text: "Trump stated operations continue
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
{ date: "Feb 28", event: "Operation Epic Fury launched — Khamenei killed. Iran begins True
{ date: "Mar 1", event: "Palm Jumeirah Fairmont struck (~3km JBR). Jebel Ali fire from debr
{ date: "Mar 2", event: "Iran declares Hormuz closed. Hezbollah resumes strikes on Israel."
{ date: "Mar 3", event: "US Embassy orders departure. Fujairah terminal struck (1st).", lev
{ date: "Mar 4", event: "US evacuation flights begin. Qatar declares LNG force majeure.", l
{ date: "Mar 7", event: "DXB airport struck by drone (1st). Flights suspended for hours.",
{ date: "Mar 8", event: "Mojtaba Khamenei appointed new Supreme Leader.", level: "warning"
{ date: "Mar 9", event: "Fujairah struck (2nd). ADNOC Ruwais 922K bpd refinery shut down.",
{ date: "Mar 11", event: "Iraq suspends all oil terminal operations.", level: "warning" },
{ date: "Mar 12", event: "NCEMA civil defence alert. UAE: 6 killed, 141 injured.", level: "
{ date: "Mar 13", event: "268 BMs, 15 CMs, 1,514 drones confirmed at UAE. Sharjah mall stru
{ date: "Mar 14", event: "Iran names Jebel Ali 'legitimate target'. Fujairah struck (3rd)."
{ date: "Mar 15", event: "Iran FM: 'We never asked for a ceasefire.' UK advisory updated.",
{ date: "Mar 16", event: "DXB fuel tank fire (3rd airport hit). Fujairah (4th). Australia r
{ date: "Mar 17", event: "TODAY: UAE briefly closes airspace for new attack wave. Day 18 —
];
const THREAT_MAP_TARGETS = [
{ name: "JBR", x: 50, y: 52, type: "home" },
{ name: "Palm Jumeirah\nFairmont Strike", x: 55, y: 49, type: "strike", dist: "~3 km" },
{ name: "Burj Al Arab\n(debris)", x: 53, y: 59, type: "damage", dist: "~8 km" },
{ name: "DXB Airport\n(struck 3×)", x: 73, y: 41, type: "strike", dist: "~30 km" },
{ name: "DIFC\n(2 strikes)", x: 63, y: 47, type: "strike", dist: "~12 km" },
{ name: "Jebel Ali Port\n('legit. target')", x: 31, y: 63, type: "threat", dist: "~25 km" }
{ name: "Al Minhad\nAir Base", x: 76, y: 61, type: "military", dist: "~40 km" },
{ name: "Sharjah\n(3 killed)", x: 79, y: 35, type: "strike", dist: "~25 km" },
{ name: "AWS DC", x: 67, y: 56, type: "damage", dist: "~20 km" },
{ name: "US Consulate\n(fire)", x: 59, y: 43, type: "strike", dist: "~15 km" },
];
const SUPPLY_STATUS = [
{ name: "Water Reserves", icon: Droplets, value: 45, unit: "days", status: "warning", detai
{ name: "Fuel Supply", icon: Fuel, value: 30, unit: "% capacity", status: "critical", detai
{ name: "Medical Access", icon: Heart, value: 60, unit: "% normal", status: "warning", deta
{ name: "Food Supply", icon: Building, value: 50, unit: "% normal", status: "warning", deta
{ name: "Telecom", icon: Wifi, value: 75, unit: "% stable", status: "warning", detail: "AWS
{ name: "Banking", icon: DollarSign, value: 65, unit: "% normal", status: "warning", detail
];
const ESCAPE_ROUTES = [
{ type: "air", name: "Emirates to Europe", detail: "Reduced, ~110 destinations at 60%. Subj
{ type: "air", name: "US Evacuation Flights", detail: "From Abu Dhabi & Dubai since March 4
{ type: "air", name: "Via Istanbul / Athens / Rome", detail: "Hubs receiving diverted Gulf
{ type: "land", name: "Dubai → Muscat, Oman", detail: "Border open but congested. Less-targ
{ type: "land", name: "Dubai → Salalah, Oman", detail: "Greater distance from conflict zone
{ type: "land", name: "Saudi Arabia routes", detail: "Saudi-Bahrain/Jordan. Areas also unde
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
{ id: "child", text: "Child essentials (formula, diapers, comfort items)", priority: "criti
];
const FORECAST = [
{ scenario: "Continued Iranian attacks on UAE", prob: "85–90%", time: "Through Q2", level:
{ scenario: "Hormuz remains disrupted", prob: "80–85%", time: "Through Q2", level: "critica
{ scenario: "Houthi full entry / Red Sea", prob: "65–75%", time: "4–8 weeks", level: "warni
{ scenario: "Further civilian casualties in Dubai", prob: "60–70%", time: "Ongoing", level:
{ scenario: "Ceasefire achieved", prob: "25–30% Jun", time: "40–50% Sep", level: "positive"
{ scenario: "US ground troops to Iran", prob: "15–25%", time: "If no ceasefire May", level:
{ scenario: "Iranian regime collapse", prob: "20–30%", time: "2026–2027", level: "neutral"
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
content: `On February 28, 2026, the United States and Israel launched coordinated strikes
Roots: Iran-Israel exchanged strikes Apr 2024 (True Promise I), Oct 2024 (True Promise II). J
bases,
Iran responded with "Operation True Promise IV" — BMs, CMs, drone swarms at Israel, US { id: "current", title: "Current War Situation — Multi-Front Conflict", worstLevel: "critic
content: `Five active fronts, Day 17:
Iran–Israel: Mutual strikes. Tel Aviv/Haifa hit. 2,000+ killed. 7,600 Israeli strikes in I
Lebanon: Hezbollah resumed Mar 2. 850+ killed, 800,000 displaced.
GCC States: All six struck. UAE heaviest: 285+ BMs, 1,567+ drones, 15 CMs. ~48% of Iranian
Strait of Hormuz: Closed Mar 2. Traffic -94%. 16 vessels struck.
Houthis: Not yet kinetic. Full entry "almost certain" 4–8 weeks.
No ceasefire channel. Iran FM: "We never asked for a ceasefire." Mojtaba Khamenei (new leader
Casualties: 13 US killed, ~140 wounded. 1,400+ Iranian civilians killed in Tehran. Oil: $67→$
{ id: "uae-strikes", title: "Iran's Direct Attacks on UAE — Strike Log", worstLevel: content: `By Mar 13: 268 BMs, 15 CMs, 1,514 drones at UAE. 90%+ intercepted.
"criti
DXB Airport — Drones Mar 7 & 16; fuel tank fire; 3rd incident
Palm Jumeirah Fairmont — Shahed drone Mar 1; 4 injuries (~3km JBR)
Burj Al Arab — Debris damage
DIFC — Two strikes; Goldman/Citi/StanChart WFH
Jebel Ali Port — Fire Mar 1; "legitimate target" Mar 14
Al Dhafra — AN/TPY-2 radar destroyed; MQ-9/U-2 damaged
Al Minhad — Attacked; UK/France defensive sorties
Abu Dhabi Airport — 1 killed, 7 wounded
ADNOC Ruwais — 922K bpd shutdown
Fujairah — 4 strikes (Mar 3, 9, 14, 16)
AWS Data Center — First cloud DC hit in conflict
US Consulate — Fire
Sharjah — 3 killed, 58 injured
Total UAE: 6 killed, 141 injured.` },
{ id: "jbr", title: "JBR-Specific Threat Assessment", worstLevel: "critical",
content: ` Jebel Ali — 15–25 km SW. "Legitimate target." 2021 explosion shockwave reach
Palm Jumeirah — ~3 km. Confirmed strike.
Burj Al Arab — ~8 km. Debris confirmed.
Al Minhad — ~40 km SE. Coalition base, struck.
RISKS: (1) Interception debris — 131 of 141 injuries. (2) Drones evading defense — 14 struck
HIGH-RISE GLASS: 40 towers, glass curtain walls. Flying glass = primary urban injury mechanis
times
No bomb shelters. NCEMA: interior corridors, stairwells, ground floor. Alerts multiple { id: "air-defense", title: "UAE Air Defense & Depletion Crisis", worstLevel: "warning",
content: `System: THAAD, Patriot PAC-3/MSE, Cheongung-II, Barak-8, Pantsir-S1, SkyKnight.
90–95% interception. ~100% BMs, 93% drones initially.
DEPLETION: THAAD $12M/intercept, global production ~650/yr. Iran drones ~$1K. Stimson Cent
IRAN ADAPTING: 1,000+ kg warheads, coordinated swarms + BM salvos, 190–392 daily strikes,
{ id: "hormuz", title: "Strait of Hormuz & Energy Crisis", worstLevel: "critical",
content: `Closed Mar 2. IRGC: any vessel "set ablaze."
Traffic: 153/day → near zero (-94%). 400 tankers stranded. 16 attacks, 24+ killed.
Oil: $67→$104+ (+55%). Gulf cut 10M+ bpd.
Qatar: LNG force majeure. Iraq: all terminals suspended.
Insurance: 12× increase. P&I clubs withdrew. US $20B reinsurance vs $352B need.
Saudi rerouting via Yanbu — Houthi-vulnerable at Bab el-Mandeb.
For residents: supply chains disrupted, fuel shortages. Jebel Ali (36% GDP) reduced.` },
{ id: "advisories", title: "Government Advisories & Airlines", worstLevel: "critical",
content: ` US (Level 3): Embassy CLOSED. Evacuation flights since Mar 4.
UK: 50,000 Briton evacuation planned. "Interior stairwell, few external walls."
Australia: Highest advisory level. Advises reconsidering travel.
Canada: Advises against all travel to the region.
Suspended: BA, Lufthansa, KLM, Air France, Air Canada, Singapore, Air India.
Emirates: ~110 destinations at 60%. Subject to sudden cancellation.
DXB shut 3 times in 16 days.
MARAD: CRITICAL — "attack almost inevitable." MARSEC Level 3.` },
{ id: "houthis", title: "Houthi Risk — Dual Chokepoint", worstLevel: "warning",
content: `Currently holding fire. Restraint from Israeli strikes killing leaders; Saudi d
65–75% full entry within 4–8 weeks.
WORST CASE: Hormuz + Bab el-Mandeb closed simultaneously. Saudi Yanbu tankers = ideal targ
Movements: reinforcements toward Saudi border, Hodeidah coastal positions, Marib front.
If joined: UAE faces fire from TWO directions — potentially overwhelming single-axis defense.
{ id: "historical", title: "Historical Comparison — Unprecedented", worstLevel: "critical",
content: `Abqaiq 2019: 25 projectiles, 0 casualties, 2-week recovery. vs 2026: 1,800+ ove
Soleimani 2020: De-escalated in 5 days. Flight 752 killed 176. vs 2026: 17 days, no de-escala
Houthi 2022: Handful, 3 killed. vs 2026: Orders of magnitude larger.
Tanker War 1980s: 451 attacks over 7 YEARS, 2% disruption. vs 2026: 90% in 2 weeks.
Gulf War 1991: 88 Scuds in 6 weeks. vs 2026: 500+ BMs, 2,000+ drones in 17 days.
},
No precedent. No off-ramps. No back-channels. Khamenei's death removed all restraint.` { id: "cyber", title: "Cyber & Hybrid Warfare", worstLevel: "warning",
content: ` "Electronic Operations Room" (Feb 28) coordinating attacks.
Actors: Handala Hack (MOIS), MuddyWater, APT42. 150+ incidents first days.
IRGC named Google, Oracle, IBM, Amazon as UAE targets.
Risk: Banking, telecom, cloud disruptions.
Info environment degraded: Arma 3 footage shared as real. Use InVID/WeVerify. 3+ sources. UAE
{ id: "economic", title: "Economic Impact on Dubai", worstLevel: "critical",
content: ` DFM: -30% in 2 weeks. Hotels: -60%+. JBR beaches "empty."
Goldman Sachs considering relocation. Half of hires withdrew.
Travel insurance invalidated. Five-star hotels: 20–40% "Flash Sales."
Oil: $67→$104+. Insurance: 12×. Jebel Ali (36% GDP) reduced.
Normalcy unlikely before Q1 2027. Pessimistic: hub status existentially challenged.` },
{ id: "forecast", title: "3–6 Month Forecast & Scenarios", worstLevel: "warning",
content: `BASE (40–45%): 2–4 month air campaign, declining. Houthis enter. Oil >$100 Q2.
OPTIMISTIC (25–30%): Ceasefire 4–6 weeks. Even then: Hormuz weeks, airlines months. Return: l
PESSIMISTIC (15–20%): Ground troops, full Houthi, systematic targeting of infrastructure, reg
{ id: "monitoring", title: "Monitoring Tools & Sources", worstLevel: "neutral",
content: `EMERGENCY: NCEMA app, 999/997/998, US +1-202-501-4444, step.state.gov
FLIGHTS: ADS-B Exchange, FlightRadar24, RadarBox
MARITIME: MarineTraffic, hormuztracker.com, hormuzstraitmonitor.com
CONFLICT: LiveUAMap, NASA FIRMS
ANALYSIS: Washington Institute, CSIS, Atlantic Council, Carnegie, Crisis Group, ACLED, Critic
{ id: "departure", title: "Departure Logistics & Return Criteria", worstLevel: "critical",
content: `AIR: Emirates (limited) | US evacuation flights | Connect via Istanbul/Athens/R
LAND: Oman open (Muscat ~4.5h, Salalah ~10h) | Saudi routes also under threat
PREPARE: Passports, cash, 90-day meds, digital docs, FlightRadar24 + NCEMA + embassy numbers
RETURN (ALL must be met):
Ceasefire 30+ days Hormuz open Advisory ≤ Level 2 Airlines normal Insurance r
Earliest: Late Q3 2026 (Aug–Sep). Plan 3–4 month minimum.` },
];
const buildMainSystemPrompt = (country, city, resType, lang) => {
const cd = GCC_DATA[country] || GCC_DATA["UAE"];
const cy = cd?.cities?.[city];
const rt = RESIDENT_TYPES[resType] || RESIDENT_TYPES.expat_family;
return `You are an expert geopolitical and security analyst for the GCC War Room. You provi
CURRENT SITUATION (Day ${CONFLICT_DATA.day}, ${CONFLICT_DATA.date}):
- Total projectiles at UAE: ${CONFLICT_DATA.missiles.total} (${CONFLICT_DATA.missiles.ballist
- UAE casualties: ${CONFLICT_DATA.casualties.killed} killed, ${CONFLICT_DATA.casualties.injur
- Tourist casualties: ${CONFLICT_DATA.casualties.touristCasualties}
- Interception rate: ${CONFLICT_DATA.interceptionRate}
- Hormuz: ${CONFLICT_DATA.hormuz.traffic} traffic (${CONFLICT_DATA.hormuz.status})
- Oil: ${CONFLICT_DATA.oil.current}/barrel (pre-war: ${CONFLICT_DATA.oil.preWar})
- DFM Real Estate: ${CONFLICT_DATA.dfm}. Hotels: ${CONFLICT_DATA.hotels}
- Emirates: ${CONFLICT_DATA.emirates.capacity} capacity, ${CONFLICT_DATA.emirates.destination
- Sovereign Wealth: ${CONFLICT_DATA.sovereignWealth}. AED/USD: ${CONFLICT_DATA.aedPeg}
- Status: ${CONFLICT_DATA.status}
USER PROFILE:
- Location: ${city || country} (${cd.name})
- Risk Level: ${cy?.risk || cd.riskScore}/5${cy ? ` — ${cy.nearestStrike}` : ""}
- Resident Type: ${rt.icon} ${rt.label}
- Civil Defense: ${cd.civilDefense} (${cd.emergency})
RESPONSE RULES:
1. Start with **RISK VERDICT: [ CRITICAL / ELEVATED / MANAGEABLE]**
2. Use ## headers, indicators, **bold** for key data
3. End with ## Recommended Action (1-3 specific steps)
4. Personalize for ${rt.label} — ${rt.shortAdvice}
5. Reference ${cd.civilDefense} and ${cd.emergency} when relevant
6. NEVER say "completely safe" or "no risk." Every death matters.
7. Always mention government advisories when relevant.
KEY DATA: Day ${CONFLICT_DATA.day}. ${CONFLICT_DATA.missiles.total} projectiles, ${CONFLICT_D
};
const STARTER_QUESTIONS = [
"What is the current risk level for JBR?",
"What should I do right now?",
"What are the biggest red flags?",
"How long should I stay away?",
"What's the worst-case scenario?",
"Is the airport safe to fly from?",
"What are the departure options?",
"When would it be safe to return?",
];
// ─── UTILITIES ──────────────────────────────────────────────────────────────
const lc = (level) => ({
critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-5
warning: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-
positive: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", do
neutral: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", dot: "bg-gra
}[level] || { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", dot: "bg-gr
const ll = (l) => ({ critical: "CRITICAL", warning: "WARNING", positive: "STABLE", neutral: "
const le = (l) => ({ critical: " ", warning: " ", positive: " ", neutral: " " }[l] || "
const countByLevel = (s) => ({ critical: s.filter(x => x.level === "critical").length, warnin
// ─── SHARED COMPONENTS ──────────────────────────────────────────────────────
const Badge = ({ level, children, className = "" }) => (
<span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium $
);
const Card = ({ children, className = "", ...p }) => (
<div className={`rounded-2xl ${className}`} style={{ background: '#EBEBEB', border: 'none',
);
const StatBox = ({ label, value, sub, level = "neutral" }) => (
<Card className="p-5">
<p className="t-label">{label}</p>
<p className={`${lc(level).text} mt-1`} style={{ fontFamily: "'Google Sans Display', sans
{sub && <p style={{ fontSize: "12px", color: "#8E8E93", marginTop: "4px" }}>{sub}</p>}
</Card>
);
// ─── THREAT MAP (LIGHT) ─────────────────────────────────────────────────────
const ThreatMap = () => (
<Card className="p-5">
<p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">Thre
<div className="relative bg-gray-50 rounded-xl border border-gray-100 overflow-hidden" st
<svg viewBox="0 0 100 80" className="absolute inset-0 w-full h-full">
<circle cx="50" cy="52" r="5" fill="none" stroke="rgba(239,68,68,0.12)" strokeWidth="
<circle cx="50" cy="52" r="15" fill="none" stroke="rgba(239,68,68,0.09)" strokeWidth=
<circle cx="50" cy="52" r="28" fill="none" stroke="rgba(239,68,68,0.06)" strokeWidth=
<text x="55.5" y="48" fill="rgba(220,38,38,0.3)" fontSize="2.2" fontFamily="system-ui
<text x="65.5" y="43" fill="rgba(220,38,38,0.25)" fontSize="2.2" fontFamily="system-u
<text x="78" y="37" fill="rgba(220,38,38,0.2)" fontSize="2.2" fontFamily="system-ui">
<path d="M 20 55 Q 35 48, 50 49 Q 58 50, 65 45 Q 72 40, 82 38" fill="none" stroke="rg
{THREAT_MAP_TARGETS.map((t, i) => (
<g key={i}>
{t.type === "home" ? (<>
<circle cx={t.x} cy={t.y} r="2.5" fill="rgba(37,99,235,0.15)" stroke="#2563EB"
<animate attributeName="r" values="2.5;3.8;2.5" dur="2s" repeatCount="indefin
</circle>
<circle cx={t.x} cy={t.y} r="1" fill="#2563EB" />
<text x={t.x} y={t.y - 4} textAnchor="middle" fill="#1D4ED8" fontSize="2.8" fon
</>) : t.type === "strike" ? (<>
<circle cx={t.x} cy={t.y} r="1.8" fill="rgba(239,68,68,0.15)" stroke="#DC2626"
<animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="ind
</circle>
<text x={t.x} y={t.y - 3} textAnchor="middle" fill="#DC2626" fontSize="1.8" fon
{t.dist && <text x={t.x} y={t.y + 3.5} textAnchor="middle" fill="rgba(220,38,38
</>) : t.type === "threat" ? (<>
<polygon points={`${t.x},${t.y-2.2} ${t.x+2},${t.y+1.5} ${t.x-2},${t.y+1.5}`} f
<animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indef
</polygon>
<text x={t.x} y={t.y - 4} textAnchor="middle" fill="#DC2626" fontSize="1.8" fon
{t.dist && <text x={t.x} y={t.y + 5} textAnchor="middle" fill="rgba(220,38,38,0
</>) : t.type === "military" ? (<>
<rect x={t.x-1.5} y={t.y-1.5} width="3" height="3" fill="rgba(217,119,6,0.15)"
<text x={t.x} y={t.y - 3} textAnchor="middle" fill="#B45309" fontSize="1.8" fon
{t.dist && <text x={t.x} y={t.y + 4.5} textAnchor="middle" fill="rgba(180,83,9,
</>) : (<>
<circle cx={t.x} cy={t.y} r="1.5" fill="rgba(217,119,6,0.15)" stroke="#D97706"
<text x={t.x} y={t.y - 3} textAnchor="middle" fill="#B45309" fontSize="1.8" fon
{t.dist && <text x={t.x} y={t.y + 4} textAnchor="middle" fill="rgba(180,83,9,0.
</>)}
</g>
))}
</svg>
</div>
<circle cx="5" cy="72" r="1" fill="#2563EB" /><text x="7" y="73" fill="#6B7280" fontS
<circle cx="5" cy="75.5" r="1" fill="#DC2626" /><text x="7" y="76.5" fill="#6B7280" f
<polygon points="5,78.3 6.2,80.2 3.8,80.2" fill="#DC2626" /><text x="7" y="80" fill="
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
<p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">Ai
<div className="flex items-center gap-5">
<div className="relative w-24 h-24 flex-shrink-0">
<svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
<circle cx="50" cy="50" r="45" fill="none" stroke="#F3F4F6" strokeWidth="7" />
<circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="7"
strokeDasharray={`${circ * eff / 100} ${circ * (1 - eff / 100)}`}
strokeLinecap="round" style={{ transition: "all 0.5s" }} />
</svg>
<div className="absolute inset-0 flex flex-col items-center justify-center">
<span className="text-xl font-extrabold" style={{ color }}>{eff.toFixed(0)}%</spa
<span className="text-[9px] text-gray-400 font-medium">intercept</span>
</div>
</div>
<div className="flex-1 space-y-3">
<div>
<p className="text-[10px] text-gray-500 mb-1">Drag to simulate depletion over tim
<input type="range" min="1" max="90" value={day} onChange={e => setDay(+e.target.
className="w-full h-1.5 rounded bg-gray-200 cursor-pointer appearance-none" sty
<div className="flex justify-between text-[9px] text-gray-400 mt-1"><span>Day 1</
</div>
<div className="text-[11px] text-gray-600 space-y-0.5">
<p>THAAD: <span className="font-bold text-amber-700">$12M</span>/intercept</p>
<p>Iran drone: <span className="font-bold text-red-600">~$1K</span>/unit</p>
<p>Global THAAD/yr: <span className="font-bold text-amber-700">~650</span></p>
</div>
</div>
</div>
<p className="text-[10px] text-gray-400 mt-3">⚠ Simplified projection model for illustr
</Card>
);
};
// ─── WHAT CHANGED TODAY ─────────────────────────────────────────────────────
const WhatChangedToday = () => {
const [expanded, setExpanded] = useState(true);
if (!CONFLICT_DATA.whatChangedToday?.length) return null;
return (
<Card className="overflow-hidden mb-4" style={{ borderColor: "var(--gw-blue)", background
<button onClick={() => setExpanded(!expanded)} className="w-full flex items-center just
<div className="flex items-center gap-2">
<span className="text-base"> </span>
<span className="text-sm font-medium" style={{ color: "var(--gw-blue-text)", fontFa
<span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full fon
</div>
{expanded ? <ChevronUp className="w-4 h-4 text-blue-400" /> : <ChevronDown className=
</button>
{expanded && (
<div className="px-4 pb-4 space-y-1.5">
{CONFLICT_DATA.whatChangedToday.map((item, i) => (
<div key={i} className="flex items-start gap-2.5 text-sm text-blue-900">
<span className="text-blue-500 font-bold mt-0.5">•</span>
<span>{item}</span>
</div>
))}
<p className="text-[10px] text-blue-400 mt-2 pt-2 border-t border-blue-100">Updated
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
px-1.5
return (
<Card className="overflow-hidden">
<div className="flex items-center justify-between p-4 border-b border-gray-100">
<div className="flex items-center gap-2">
<button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 h
<Newspaper className="w-4 h-4 text-blue-600" />
<span className="text-sm font-semibold text-gray-800">Live News Feed</span>
{news.length > 0 && <span className="text-[10px] bg-blue-100 text-blue-700 {expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown cl
</button>
</div>
<div className="flex items-center gap-2">
{lastUpdated && <span className="text-[10px] text-gray-400">Updated {timeAgo(lastUp
<button onClick={fetchNews} disabled={loading}
className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-6
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
{ key: "conflict", label: " Conflict Related" },
{ key: "uae", label: " UAE" },
].map(f => (
<button key={f.key} onClick={() => setFilter(f.key)}
className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-color
filter === f.key ? "bg-blue-600 text-white" : "bg-white text-gray-500 borde
}`}>{f.label}</button>
))}
</div>
{/* News items */}
<div className="max-h-[400px] overflow-y-auto">
{loading && news.length === 0 && (
<div className="p-6 text-center">
<Loader2 className="w-5 h-5 text-blue-500 animate-spin mx-auto mb-2" />
<p className="text-xs text-gray-400">Fetching latest news from Gulf sources..
</div>
)}
{!loading && news.length === 0 && (
<div className="p-6 text-center">
<Newspaper className="w-8 h-8 text-gray-300 mx-auto mb-2" />
<p className="text-xs text-gray-500 font-medium">No news items loaded</p>
<button onClick={fetchNews} className="mt-2 px-3 py-1.5 rounded-lg bg-blue-60
</div>
)}
{filtered.map((item, i) => (
<a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
className="flex items-start gap-3 p-3 border-b border-gray-50 hover:bg-blue-5
<div className="flex-shrink-0 mt-1">
{item.isConflictRelated
? <span className="w-2 h-2 rounded-full bg-red-500 block" />
: <span className="w-2 h-2 rounded-full bg-gray-300 block" />
}
</div>
<div className="flex-1 min-w-0">
<p className="text-xs font-semibold text-gray-800 group-hover:text-blue-700
{item.description && <p className="text-[10px] text-gray-500 mt-0.5 line-cl
<div className="flex items-center gap-2 mt-1">
<span className="text-[9px] font-bold text-blue-600">{item.source}</span>
<span className="text-[9px] text-gray-400">{timeAgo(item.pubDate)}</span>
{item.isConflictRelated && <span className="text-[9px] bg-red-50 text-red
</div>
</div>
<ExternalLink className="w-3 h-3 text-gray-300 flex-shrink-0 mt-1 group-hover
</a>
))}
</div>
{/* Source attribution */}
<div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
<p className="text-[9px] text-gray-400 text-center">
Sources: Khaleej Times · Gulf News · The National · Al Jazeera · Reuters </p>
</div>
— Auto
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
const rCol = cRisk >= 5 ? "#DC2626" : cRisk >= 4 ? "#D97706" : cRisk >= 3 ? "#2563EB" : cRi
const rLbl = cRisk >= 5 ? "CRITICAL" : cRisk >= 4 ? "HIGH" : cRisk >= 3 ? "ELEVATED" : cRis
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
<p className="text-sm font-bold text-gray-800 mt-2">{cData.flag} {city || country
<p className="text-[10px] text-gray-500">{resType.icon} {resType.label}</p>
<p className="text-[10px] text-gray-400">Day {CONFLICT_DAY} · {REPORT_DATE}</p>
{baseRisk !== cRisk && <p className="text-[9px] text-gray-400 mt-1">Base threat:
</Card>
{/* Alert Banner — directly under gauge */}
<div className={`rounded-xl p-4 flex items-start gap-3 shadow-sm ${alertCfg.bg}`}>
<span className="text-xl flex-shrink-0">{alertCfg.icon}</span>
<div>
<p className={`font-bold text-sm ${alertCfg.dark ? "text-gray-900" : "text-whit
<p className={`text-xs mt-1 leading-relaxed ${alertCfg.dark ? "text-gray-800/80
</div>
</div>
</div>
{/* Local Assessment */}
<Card className="p-5 lg:col-span-2">
<div className="flex items-center justify-between mb-3">
<p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">L
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
<p className="text-sm font-bold text-gray-800">{cyData.shelter || `Follow ${c
</div>
{cyData.notes && <p className="text-xs text-gray-500 sm:col-span-2 bg-gray-50 r
</div>
) : (
<p className="text-sm text-gray-500">Select a city from the header to see localiz
)}
</Card>
</div>
{/* WHAT CHANGED TODAY */}
<WhatChangedToday />
{/* STATS */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
<StatBox label="Conflict Day" value={CONFLICT_DAY} sub="Since Feb 28" level="warning"
<StatBox label="Projectiles at UAE" value={CONFLICT_DATA.missiles.total.toLocaleStrin
<StatBox label="Intercept Rate" value={CONFLICT_DATA.interceptionRate} sub="Performin
<StatBox label="Hormuz Traffic" value={CONFLICT_DATA.hormuz.traffic} sub="Near zero t
</div>
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
<StatBox label="UAE Casualties" value={`${CONFLICT_DATA.casualties.killed} / ${CONFLI
<StatBox label="Oil Price" value={CONFLICT_DATA.oil.current} sub={`From ${CONFLICT_DA
<StatBox label="Ceasefire" value="None" sub="No talks · No channel" level="warning" /
<StatBox label="Safe Return" value="Aug–Sep" sub="Earliest Q3 2026" level="neutral" /
</div>
{/* SIGNAL BAR */}
<Card className="p-4">
<p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2.5
<div className="flex items-center gap-4 flex-wrap">
<div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-ful
<div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-ful
<div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-ful
<div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-ful
</div>
</Card>
{/* THREAT MAP + INTERCEPTOR */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
<ThreatMap />
<InterceptorGauge />
</div>
mb-3">
{/* TIMELINE */}
<Card className="p-5">
<p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold <div className="space-y-0 relative">
<div className="absolute left-[4px] top-2 bottom-2 w-px bg-gray-200" />
{STRIKE_TIMELINE.map((e, i) => (
<div key={i} className="flex items-start gap-3 py-1.5 relative">
<div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 z-10 ${lc(e.level)
<div>
<span className="text-[10px] font-bold text-gray-400">{e.date}</span>
<p className={`text-xs ${i === STRIKE_TIMELINE.length - 1 ? "text-red-600 fon
</div>
</div>
))}
</div>
</Card>
mb-3">
{/* CATEGORIES */}
<div>
<p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
{CATEGORIES.map(cat => {
const sigs = RISK_SIGNALS.filter(s => s.category === cat.key);
const cc = countByLevel(sigs);
const worst = cc.critical > 0 ? "critical" : cc.warning > 0 ? "warning" : cc.posi
const Icon = cat.icon;
return (
<Card key={cat.key} className={`p-3 ${lc(worst).bg} border ${lc(worst).border}`
<div className="flex items-center gap-1.5 mb-1.5">
<Icon className={`w-3.5 h-3.5 ${lc(worst).text}`} />
<span className="text-xs font-semibold text-gray-700 truncate">{cat.key}</s
</div>
<div className="flex gap-2 text-[11px]">
{cc.critical > 0 && <span className="text-red-600 font-semibold"> {cc.crit
{cc.warning > 0 && <span className="text-amber-600 font-semibold"> {cc.war
{cc.positive > 0 && <span className="text-emerald-600 font-semibold"> {cc.
</div>
</Card>
);
})}
</div>
</div>
mb-3">
{/* ESCAPE ROUTES */}
<Card className="p-5">
<p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold <div className="space-y-2">
{ESCAPE_ROUTES.map((r, i) => {
const sc = r.status === "active" ? "text-emerald-600 bg-emerald-50" : r.status ==
return (
<div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-gra
{r.type === "air" ? <Plane className="w-4 h-4 text-blue-500 flex-shrink-0 mt-
<div className="flex-1 min-w-0">
<div className="flex items-center gap-2">
<span className="text-sm font-semibold text-gray-800">{r.name}</span>
<span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded $
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
<p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Sup
<span className="text-[9px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Estimate
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
<div className={`h-1.5 rounded-full ${c.barBg}`} style={{ width: `${s.value
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
<p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold <div className="space-y-2">
{FORECAST.map((f, i) => (
<div key={i} className="flex items-center gap-3">
<Badge level={f.level} className="w-24 justify-center">{f.prob}</Badge>
<span className="text-sm text-gray-700 flex-1">{f.scenario}</span>
<span className="text-xs text-gray-400 hidden sm:inline">{f.time}</span>
</div>
mb-3">
))}
</div>
</Card>
{/* ─── LIVE NEWS FEED ───────────────────────────────────────── */}
<NewsTicker />
{/* ─── GCC REGIONAL RISK TABLE ──────────────────────────────── */}
<Card className="overflow-hidden">
<button onClick={() => setShowRegional(!showRegional)}
className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition
<div className="flex items-center gap-2">
<Globe className="w-4 h-4 text-blue-600" />
<span className="text-sm font-semibold text-gray-800">GCC & Middle East Risk Over
<span className="text-[10px] text-gray-400">{Object.keys(GCC_DATA).length} </div>
{showRegional ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown clas
</button>
countr
{showRegional && (
<div className="border-t border-gray-100">
{/* Scrollable horizontal on mobile */}
<div className="overflow-x-auto">
<table className="w-full min-w-[640px]">
<thead>
<tr className="bg-gray-50">
<th className="text-left text-[10px] uppercase tracking-wider text-gray-5
<th className="text-center text-[10px] uppercase tracking-wider text-gray
<th className="text-left text-[10px] uppercase tracking-wider text-gray-5
<th className="text-left text-[10px] uppercase tracking-wider text-gray-5
<th className="text-center text-[10px] uppercase tracking-wider text-gray
</tr>
</thead>
<tbody>
{Object.entries(GCC_DATA).map(([countryKey, cty]) =>
Object.entries(cty.cities).map(([cityName, cd], idx) => {
const isCurrentCity = countryKey === country && cityName === city;
const rc = cd.risk >= 5 ? "text-red-600" : cd.risk >= 4 ? "text-amber-6
const rb = cd.risk >= 5 ? "bg-red-50" : cd.risk >= 4 ? "bg-amber-50" :
return (
<tr key={`${countryKey}-${cityName}`}
className={`border-t border-gray-50 hover:bg-gray-50 transition-col
<td className="px-4 py-2.5">
<div className="flex items-center gap-2">
<span className="text-sm">{cty.flag}</span>
<div>
</p>
{idx === 0 && <p className="text-[10px] text-gray-400">{cty.n
</div>
</div>
</td>
<td className="px-3 py-2.5 text-center">
<span className={`inline-flex items-center justify-center w-8 h-8
{cd.risk}
</span>
</td>
<td className="px-3 py-2.5">
<p className="text-xs text-gray-700 max-w-[180px] truncate">{cd.n
</td>
<td className="px-3 py-2.5">
<p className="text-xs text-gray-700 max-w-[180px] truncate">{cd.n
</td>
<td className="px-3 py-2.5 text-center">
<Badge level={cd.signal}>{cd.risk >= 5 ? "ALERT" : cd.risk <p className={`text-xs font-semibold ${isCurrentCity ? "text-
{cityName} {isCurrentCity && <span className="text-[9px] te
>= 4 ?
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
<p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
{Object.entries(GCC_DATA).map(([k, v]) => {
const rc = v.riskScore >= 5 ? "border-red-200 bg-red-50/50" : v.riskScore >
return (
<div key={k} className={`p-2.5 rounded-lg border ${rc}`}>
<div className="flex items-center gap-2 mb-1">
<span className="text-base">{v.flag}</span>
<span className="text-xs font-bold text-gray-800">{v.name}</span>
<span className={`text-[10px] font-bold ml-auto ${v.riskScore >= 5 ?
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
if (searchText && !s.title.toLowerCase().includes(searchText.toLowerCase()) && !s.content
return true;
});
return (
<div className="space-y-4">
<div className="flex flex-col sm:flex-row gap-3">
<div className="relative flex-1">
<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
<input type="text" placeholder="Search analysis..." value={searchText} onChange={e
className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-
</div>
<div className="flex gap-1.5 flex-wrap">
{["all", "critical", "warning", "positive", "neutral"].map(l => (
<button key={l} onClick={() => setFilterLevel(l)}
className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors
filterLevel === l ? "bg-gray-800 text-white border-gray-800" : "bg-white text
}`}>{l === "all" ? "All" : le(l) + " " + ll(l)}</button>
))}
</div>
</div>
<div className="space-y-2">
{filtered.map((s, idx) => {
const isOpen = open[s.id]; const c = lc(s.worstLevel);
return (
<Card key={s.id} className={`overflow-hidden transition-all duration-300 ${isOpen
<button onClick={() => toggle(s.id)}
className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 tra
<span className="text-xs font-medium text-gray-400 w-5">{idx + 1}.</span>
{isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight c
<span className="text-sm font-semibold text-gray-800 flex-1">{s.title}</span>
<Badge level={s.worstLevel}>{ll(s.worstLevel)}</Badge>
</button>
{isOpen && (
<div className="px-4 pb-4 border-t border-gray-100">
<div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line p
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
if (headerText.includes(" ") || headerText.includes("Action") || headerText.includes("
return (
<div key={idx} className="mt-4 mb-2 bg-blue-50 border border-blue-200 rounded-lg px
<p className="text-sm font-bold text-blue-800">{renderInlineFormatting(headerText
</div>
);
}
if (headerText.includes(" ") || headerText.includes("Date") || headerText.includes("Ti
return (
<div key={idx} className="mt-4 mb-2 bg-gray-50 border border-gray-200 rounded-lg px
<p className="text-sm font-bold text-gray-700">{renderInlineFormatting(headerText
</div>
);
}
return <p key={idx} className="text-sm font-bold text-gray-800 mt-4 mb-1.5 border-b bor
}
// Risk verdict line
if (line.includes("RISK VERDICT")) {
const isCritical = line.includes(" ") || line.includes("CRITICAL");
const isWarning = line.includes(" ") || line.includes("ELEVATED");
const isPositive = line.includes(" ") || line.includes("MANAGEABLE");
const bg = isCritical ? "bg-red-50 border-red-200" : isWarning ? "bg-amber-50 border-am
const textColor = isCritical ? "text-red-700" : isWarning ? "text-amber-700" : isPositi
return (
<div key={idx} className={`rounded-lg border px-3 py-2.5 mb-3 ${bg}`}>
<p className={`text-sm font-bold ${textColor}`}>{renderInlineFormatting(line.replac
</div>
);
}
// Numbered list items (1. 2. 3.)
if (/^\d+\.\s/.test(line.trim())) {
const num = line.trim().match(/^(\d+)\./)[1];
const rest = line.trim().replace(/^\d+\.\s*/, "");
// Detect if it's inside an action box (has risk indicator or bold)
const hasIndicator = rest.startsWith(" ") || rest.startsWith(" ") || rest.startsWith
return (
<div key={idx} className="flex items-start gap-2.5 py-1 pl-1">
<span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bo
<p className="text-sm text-gray-700 flex-1">{renderInlineFormatting(rest)}</p>
</div>
);
}
// Bullet points with risk indicators
if (line.trim().startsWith("- ") || line.trim().startsWith("- ") || line.trim().start
const content = line.trim().slice(2);
const emoji = content.slice(0, 2);
const rest = content.slice(2).trim();
const bg = emoji === " " ? "bg-red-50 border-red-100" : emoji === " " ? "bg-amber-50
return (
<div key={idx} className={`flex items-start gap-2 py-1.5 px-2.5 rounded-lg border ${b
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
// Standalone risk indicator lines ( Something, Something)
if (line.trim().match(/^[ ]\s/)) {
const emoji = line.trim().slice(0, 2);
const rest = line.trim().slice(2);
const bg = emoji === " " ? "bg-red-50 border-red-100" : emoji === " " ? "bg-amber-50
return (
<div key={idx} className={`flex items-start gap-2 py-1.5 px-2.5 rounded-lg border ${b
<span className="text-sm flex-shrink-0">{emoji}</span>
<p className="text-sm text-gray-700 flex-1">{renderInlineFormatting(rest)}</p>
</div>
);
}
// Horizontal divider
if (line.trim() === "---") return <div key={idx} className="border-t border-gray-200 my-3
// Empty lines = spacing
if (line.trim() === "") return <div key={idx} className="h-1.5" />;
// Regular paragraph
return <p key={idx} className="text-sm text-gray-700 py-0.5 leading-relaxed">{renderInlin
};
// Handle **bold**, *italic*, numbers, and inline formatting
const renderInlineFormatting = (text) => {
if (!text) return null;
// Split by **bold** and *italic* markers
const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
return parts.map((part, i) => {
if (part.startsWith("**") && part.endsWith("**")) {
const inner = part.slice(2, -2);
if (inner.includes("CRITICAL") || inner.includes("EXTREME") || inner.includes("ALERT"
return <span key={i} className="font-bold text-red-700">{inner}</span>;
}
if (inner.includes("WARNING") || inner.includes("ELEVATED") || inner.includes("MONITO
return <span key={i} className="font-bold text-amber-700">{inner}</span>;
}
if (inner.includes("STABLE") || inner.includes("POSITIVE") || inner.includes("SAFE"))
return <span key={i} className="font-bold text-emerald-700">{inner}</span>;
}
if (/\d/.test(inner) || inner.includes("%") || inner.includes("$") || inner.includes(
return <span key={i} className="font-bold text-blue-700">{inner}</span>;
}
return <span key={i} className="font-bold text-gray-900">{inner}</span>;
}
if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
return <span key={i} className="italic text-gray-500">{part.slice(1, -1)}</span>;
}
});
return <span key={i}>{part}</span>;
};
const lines = text.split("\n");
return <div className="space-y-0">{lines.map((line, i) => renderLine(line, i))}</div>;
};
// ─── OFFLINE FALLBACK ANSWERS ────────────────────────────────────────────────
// Pre-built formatted answers using report data so the analyst works even without API
const FALLBACK_ANSWERS = {
"What is the current risk level for JBR?": `**RISK VERDICT: CRITICAL — Level 5 / EXTREME
## Threat Assessment for JBR
JBR sits at the nexus of multiple confirmed strike zones — this is the highest possible ri
## Proximity to Confirmed Strikes
**Palm Jumeirah Fairmont** — struck by Shahed drone March 1 — only **~3 km** from JBR. Thi
**Jebel Ali Port** — **~15–25 km** SW of JBR. Iran named it a **"legitimate target"** on M
**Burj Al Arab** — **~8 km** south — sustained debris damage from interceptions.
**Al Minhad Air Base** — **~40 km** SE — struck by Iranian missiles.
## Active Dangers for JBR Residents
**Interception debris** — **131 of 141** UAE injuries are from falling debris, not direct
**High-rise glass vulnerability** — JBR's 40 towers have extensive glass curtain walls. Fl
**Shelter-in-place alerts** issued multiple times daily. Children in distance learning sin
## Recommended Action
1. **Leave JBR immediately** — book the earliest available flight to Europe
2. Have an **Oman land route planned** as backup (Muscat ~4.5 hours)
3. Until departure: stay on **ground floor away from glass** during NCEMA alerts`,
"What should I do right now?": `**RISK VERDICT: HEIGHTENED AWARENESS — Stay informed, ta
## Why Waiting Is Dangerous
**The departure window is closing.** DXB airport has been struck **3 times** in 16 days. E
**All Western carriers have suspended service** — BA, Lufthansa, KLM, Air France, Air Cana
**Emirates at 60% capacity** with sudden cancellations on each attack wave.
**No ceasefire in sight** — Iran FM on March 15: "We never asked for a ceasefire." Trump:
## What Gets Worse Each Day You Wait
**Air defense depletion** — THAAD interceptors cost **$12M each**, global production only
**Houthi entry 65–75% probable** within 4–8 weeks — would create overwhelming two-front th
**Iran shifting to heavier 1,000+ kg warheads** and coordinated swarms to saturate defense
## Every Government Says Leave Now
**Australia**: Highest advisory level — register with embassy
**Canada**: Advises against all travel — monitor updates
**US**: Embassy closed, evacuation flights operating since March 4
**UK**: Planning contingency evacuation of 50,000 Britons
## Recommended Action
1. Book the **earliest available flight today** — Emirates, Etihad, or flydubai to any 2. Book **refundable tickets on multiple carriers** — don't rely on one booking
3. If flights unavailable: **drive to Muscat, Oman (~4.5 hours)** and fly from there`,
Europe
"What are the biggest red flags?": `**RISK VERDICT: CRITICAL — Multiple simultaneous red
## Top Red Flags (Ranked by Severity)
**Iran named Jebel Ali "legitimate target" (March 14)** — signals shift from military to c
**Interceptor depletion crisis** — UAE has "burned through a significant chunk of stockpil
**No ceasefire mechanism exists** — no negotiations, no back-channel, no off-ramps. Iran F
**DXB airport struck 3 times** — today (March 16) a fuel tank caught fire. Departure windo
**Houthi entry 65–75% probable** — would create dual chokepoint (Hormuz + Bab el-Mandeb) a
**Water reserves only 45 days** — desalination plants are potential targets. Would create
**Russian Geran-2 drone variants** with jam-resistant navigation found in debris — evolvin
**Cyber operations escalating** — IRGC targeting Google, Oracle, IBM, Amazon infrastructur
## Recommended Action
1. Treat every red flag as confirmation: **depart immediately**
2. Do not wait for one specific trigger — the accumulation of signals is the trigger
3. Prepare for **3–4 month absence minimum** — earliest return late Q3 2026`,
"How long should I stay away?": `**RISK VERDICT: ELEVATED — Plan for minimum 3–4 months
## Return Timeline Analysis
## Key Dates
- **Now → May 2026**: Active combat phase. **85–90%** probability of continued attacks.
- **May → June 2026**: Possible intensity decline if Iran stockpiles degrade. Ceasefire proba
- **June → Sep 2026**: Political pressure builds (US midterms Nov 2026). Ceasefire **40–50%**
- **Late Q3 2026 (Aug–Sep)**: **Earliest plausible return window** under optimistic scenario.
- **Q1 2027**: Return to pre-war normalcy unlikely before this date even in best case.
## Return Criteria — ALL Must Be Met
Verified ceasefire for **30+ days** — currently **NOT MET**
Strait of Hormuz reopened — currently **NOT MET**
Embassy advisories at Level 2 or below — currently **NOT MET**
Airlines operating normal schedules — currently **NOT MET**
Travel insurance reinstated — currently **NOT MET**
## Three Scenarios
**Optimistic (25–30%)**: Ceasefire in 4–6 weeks. Even then, Hormuz takes weeks to reopen,
**Base case (40–45%)**: 2–4 month air campaign with declining intensity. Return: **Q4 2026
**Pessimistic (15–20%)**: Ground troops, full Houthi entry, infrastructure targeting, regi
## Recommended Action
1. Plan for **3–4 month relocation to Spain** — aligns with minimum reasonable horizon
2. Monitor conditions using NCEMA app, FlightRadar24, and embassy alerts
3. Do not return until **ALL five return criteria** are confirmed met`,
"What's the worst-case scenario?": `**RISK VERDICT: CRITICAL — Pessimistic scenario has
## Worst-Case Scenario (15–20% Probability)
**US ground troops deployed to Iran** — **15–25%** probability if no ceasefire by May. Tra
**Full Houthi entry** — **65–75%** within 4–8 weeks. Creates simultaneous closure of **Str
**Systematic targeting of Gulf infrastructure** — desalination plants (**45-day water rese
**Iranian regime collapse** — **20–30%** in 2026–2027. Creates years of regional instabili
## What This Means for JBR
Air defense **completely overwhelmed** by two-front attack
Jebel Ali complex struck — shockwave, power outage, water supply disrupted
Airport **closed indefinitely** — land evacuation only option
Dubai's global hub status faces **existential challenge**
Property values collapse; pre-war normalcy **years away**
## Historical Context
This war has **no precedent**: 1,800+ projectiles in 17 days vs Gulf War's 88 Scuds in 6 w
## Recommended Action
1. **Leave before the worst case materializes** — you cannot evacuate during it
2. Ensure **land route to Oman is prepared** as airport backup
3. Have **90+ days of cash, medications, documents** ready regardless`,
"Is the airport safe to fly from?": `**RISK VERDICT: CRITICAL — DXB is operational but h
## Dubai International Airport Status
**Struck by drones on March 7 and March 16 (today)** — fuel tank fire. This is the **3rd d
Flights suspended for **7+ hours** after today's strike.
UAE airspace has been **closed entirely 3 times** in 16 days due to attacks.
Emirates operating at **~60% capacity** to approximately **110 destinations**. Subject to
## Airline Status
**SUSPENDED**: British Airways, Lufthansa, KLM, Air France, Air Canada, Singapore Airlines
**OPERATING (limited)**: Emirates, Etihad, flydubai — reduced schedules, unreliable.
**Alternative**: US government evacuation flights from Abu Dhabi & Dubai since March 4.
## The Critical Risk
The accidental shootdown of **Ukraine Airlines Flight 752** during the 2020 Soleimani cris
MARAD classifies Persian Gulf threat as **CRITICAL — "an attack is almost inevitable."**
## Recommended Action
1. **Fly anyway — the risk of staying is greater than the risk of flying out.** Every governm
2. Book **earliest available departure** — expect delays and cancellations. Have backup booki
3. If DXB closes: **drive to Muscat, Oman (~4.5h)** or use **Abu Dhabi** as alternative depar
"What are the departure options?": `**RISK VERDICT: ELEVATED — Options exist but are unr
## Air Options (Primary)
**Emirates** — Reduced to ~110 destinations at 60% capacity. Book to **Madrid, Barcelona,
**Etihad / flydubai** — Limited operations. Supplement with Emirates bookings.
**Via connecting hubs** — Istanbul, Athens, Rome are receiving diverted Gulf traffic. Mult
**US government evacuation flights** — Operating from Abu Dhabi & Dubai since March 4. US
## Land Options (Backup)
**Dubai → Muscat, Oman**: **~4.5 hours drive**. Border open but congested. Fly from Muscat
**Dubai → Salalah, Oman**: **~10 hours drive**. Greater distance from conflict zone.
**Saudi Arabia routes**: Saudi-Bahrain and Saudi-Jordan available but cross areas also und
## Booking Strategy
- Book **fully refundable tickets on MULTIPLE carriers** — don't rely on one
- Book **multiple dates** — expect cancellations
- Have **land route to Oman pre-planned** with full tank of fuel
- Consider **Abu Dhabi airport** as alternative to DXB
## Recommended Action
1. Book **3 different flights** on different carriers/dates — first available to any European
2. Pack **go-bag now**: passports, cash, 90-day medications, digital doc copies
3. Register at **step.state.gov** (US) or equivalent for your nationality`,
"When would it be safe to return?": `**RISK VERDICT: ELEVATED — Earliest return late Q3
## Five Return Criteria (ALL Must Be Met)
**1. Verified ceasefire for 30+ days** — Currently: NO ceasefire, no negotiations, no chan
**2. Strait of Hormuz reopened** — Currently: 94% traffic collapse, IRGC threatening to "s
**3. Embassy advisories at Level 2 or below** — Currently: Multiple governments at elevate
**4. Commercial airlines normal schedules** — Currently: all Western carriers suspended, E
**5. Travel insurance reinstated** — Currently: UK/US insurers will not cover UAE. Status:
## Projected Timeline
## Key Dates
- **March–May 2026**: Active combat. 85–90% probability attacks continue.
- **June 2026**: Ceasefire probability only 25–30%.
- **September 2026**: Ceasefire probability rises to 40–50% (US midterm pressure).
- **Aug–Sep 2026**: Earliest plausible return if optimistic scenario plays out.
- **Q1 2027**: Pre-war normalcy unlikely before this date.
Even after a ceasefire, **physical safety and economic recovery operate on different times
## Recommended Action
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
if (q.includes("risk level") || q.includes("how dangerous") || q.includes("safe is jbr") ||
if (q.includes("what should i do") || q.includes("should i leave") || q.includes("should we
if (q.includes("red flag") || q.includes("biggest risk") || q.includes("most dangerous") ||
if (q.includes("how long") || q.includes("stay away") || q.includes("duration") || q.includ
if (q.includes("worst case") || q.includes("worst-case") || q.includes("worst scenario") ||
if (q.includes("airport") || q.includes("fly") || q.includes("flight") || q.includes("dxb")
if (q.includes("departure") || q.includes("escape") || q.includes("options") || q.includes(
if (q.includes("return") || q.includes("come back") || q.includes("go back") || q.includes(
// Generic fallback
return `**RISK VERDICT: CRITICAL — Level 5 / EXTREME**
I can answer questions about the GCC war risk analysis based on the two research reports date
## Topics I Can Help With
- Current risk level for JBR and Dubai
- Current situation and recommended precautions
- Biggest red flags and warning signs
- How long to stay away / when to return
- Airport safety and flight availability
- Worst-case and best-case scenarios
- Air defense status, Hormuz closure, Houthi risk, cyber threats, economic impact
## Recommended Action
1. Try asking one of the suggested questions below
2. The core recommendation from both reports: **leave Dubai immediately** and relocate };
to Spa
// ─── AI ANALYST TAB ─────────────────────────────────────────────────────────
const AIAnalystTab = ({ country, city, resStatus: aiRes }) => {
const [messages, setMessages] = useState([]);
const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);
const [mode, setMode] = useState("auto"); // "auto" tries API first, "offline" uses fallbac
const chatEndRef = useRef(null);
useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]
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
system: buildMainSystemPrompt(country || "UAE", city || "Dubai", aiRes || "expat_fa
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
const answer = `${fallback}\n\n---\n *Answered from embedded report data (API unavail
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
className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors ${
Live AI
</button>
<button onClick={() => setMode("offline")}
className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors ${
Offline
</button>
</div>
</div>
{mode === "offline" && (
<div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100
<AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
<span>Offline mode — answering from embedded report data. Switch to Live AI when AP
</div>
)}
<div className="flex-1 overflow-y-auto space-y-3 pb-4">
{messages.length === 0 && (
<div className="text-center py-10">
<div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex item
<Bot className="w-7 h-7 text-blue-500" />
</div>
<p className="text-gray-800 font-semibold text-base mb-1">Ask About the Risk Anal
<p className="text-gray-400 text-sm mb-1">Responses include risk indicators, key
<p className="text-gray-300 text-xs mb-6">{mode === "offline" ? " Offline mode
<div className="flex flex-wrap gap-2 justify-center max-w-xl mx-auto">
{STARTER_QUESTIONS.map((q, i) => (
<button key={i} onClick={() => send(q)}
className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs t
))}
</div>
</div>
)}
{messages.map((m, i) => (
<div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"
{m.role === "assistant" && (
<div className="max-w-[90%] sm:max-w-[80%]">
<div className="flex items-center gap-2 mb-1.5">
<div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-ce
<Shield className="w-3.5 h-3.5 text-blue-600" />
</div>
<span className="text-[10px] font-semibold text-gray-400 uppercase tracking
</div>
<div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-
<FormattedMessage text={m.content} />
</div>
</div>
)}
{m.role === "user" && (
<div className="max-w-[85%] sm:max-w-[70%] bg-blue-600 text-white rounded-2xl r
)}
</div>
))}
{loading && (
<div className="flex justify-start">
<div className="max-w-[80%]">
<div className="flex items-center gap-2 mb-1.5">
<div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-cent
<Shield className="w-3.5 h-3.5 text-blue-600" />
</div>
<span className="text-[10px] font-semibold text-gray-400 uppercase tracking-w
</div>
<div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4
<Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
<span className="text-sm text-gray-400">Assessing risk data...</span>
</div>
</div>
</div>
)}
<div ref={chatEndRef} />
</div>
{messages.length > 0 && messages.length < 6 && (
<div className="flex gap-2 pb-2 overflow-x-auto">{STARTER_QUESTIONS.filter(q => !mess
<button key={i} onClick={() => send(q)} className="flex-shrink-0 px-3 py-1.5 rounde
))}</div>
)}
<div className="flex gap-2 pt-3 border-t border-gray-200">
<input type="text" value={input} onChange={e => setInput(e.target.value)}
onKeyDown={e => e.key === "Enter" && !loading && send(input)}
placeholder="Ask about the risk analysis..."
className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white te
disabled={loading} />
<button onClick={() => send(input)} disabled={loading || !input.trim()}
className="px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled
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
content: "Search for the very latest news and developments on these topics: Iran
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
content: `You are a geopolitical intelligence analyst. Below is raw intelligence
RAW INTELLIGENCE:
${rawIntel.slice(0, 3500)}
Respond with ONLY this JSON (no markdown, no backticks, no explanation):
{"assessment":{"direction":"escalation","summary":"1-2 sentence overall assessment","departur
}],
}),
});
if (!formatRes.ok) {
// If formatting fails, show raw results as fallback
setItems([{ headline: "Raw Intelligence Retrieved", source: "Web Search", date: "Toda
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
<p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Live
<button onClick={fetchIntel} disabled={loading}
className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text
<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
{loading ? "Scanning..." : "Refresh Intel"}
</button>
</div>
{error && <Card className="p-4 bg-red-50 border-red-200 text-red-700 text-sm"><p {assessment && (
<Card className={`p-4 ${assessment.direction === "escalation" ? "bg-red-50 border-red
<div className="flex items-center gap-2 mb-1.5">
<span className="text-lg">{assessment.direction === "escalation" ? " " : assessm
<span className="font-bold text-sm text-gray-800">Signal: {assessment.direction =
</div>
<p className="text-sm text-gray-600">{assessment.summary}</p>
<p className="text-xs text-gray-500 mt-1">{assessment.departure_change}</p>
</Card>
classN
)}
{loading && items.length === 0 && (
<div className="space-y-3">
{loadingStep && (
<Card className="p-4 bg-blue-50 border-blue-200 flex items-center gap-3">
<Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
<p className="text-sm text-blue-700 font-medium">{loadingStep}</p>
</Card>
)}
</div>
{[1,2,3].map(i => <Card key={i} className="p-4 animate-pulse"><div className="h-4 b
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
{!loading && items.length === 0 && !error && <div className="text-center py-16"><Radar
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
{ handle: "NCEmergencyUAE", name: "NCEMA UAE", desc: "National Emergency Crisis & Disas
{ handle: "UAEGov", name: "UAE Government", desc: "Official UAE federal government acco
{ handle: "MoFAICUAE", name: "UAE Ministry of Foreign Affairs", desc: "Diplomatic state
{ handle: "HHShkMohd", name: "Sheikh Mohammed bin Rashid", desc: "UAE Vice President /
{ handle: "MBZNews", name: "MBZ News", desc: "President Sheikh Mohamed bin Zayed covera
{ handle: "DXBMediaOffice", name: "Dubai Media Office", desc: "Official Dubai governmen
{ handle: "DubaiPoliceHQ", name: "Dubai Police", desc: "Emergency alerts, civil order,
{ handle: "DXB", name: "Dubai Airports", desc: "Airport operational status — closures,
{ handle: "SPA_eng", name: "Saudi Press Agency", desc: "Saudi official news — GCC coord
{ handle: "OmanNewsAgency", name: "Oman News Agency", desc: "Key for evacuation route i
{ handle: "QNAEnglish", name: "Qatar News Agency", desc: "QNA — LNG force majeure updat
]
},
{
category: "US / UK / Western Government & Military",
icon: Globe,
color: "indigo",
accounts: [
{ handle: "CENTCOM", name: "U.S. Central Command", desc: "Primary US military ops in Mi
{ handle: "CENTCOMArabic", name: "CENTCOM Arabic", desc: "Arabic-language CENTCOM opera
{ handle: "DeptofDefense", name: "U.S. Dept of Defense", desc: "Pentagon press briefing
{ handle: "SecDef", name: "Secretary of Defense", desc: "Direct policy and operational
{ handle: "USAembassyUAE", name: "US Embassy UAE", desc: "Evacuation flights, citizen s
{ handle: "StateDept", name: "US State Department", desc: "Travel advisories, diplomati
{ handle: "USNavy", name: "US Navy", desc: "Naval operations, carrier strike group move
{ handle: "USAFCENT", name: "US Air Forces Central", desc: "Air operations over Gulf th
{ handle: "UKinUAE", name: "UK in UAE", desc: "British Embassy — FCDO advisories, Briti
{ handle: "FCDOtravelGovUK", name: "FCDO Travel Advice", desc: "UK Foreign Office trave
{ handle: "AusEmbUAE", name: "Australian Embassy UAE", desc: "Travel advisory updates —
{ handle: "TravelGoC", name: "Canada Travel Advisory", desc: "Canadian travel advisorie
{ handle: "NATO", name: "NATO", desc: "Alliance posture, coalition coordination", verif
},
{
},
{
},
];
{ handle: "IDF", name: "Israel Defense Forces", desc: "Iran strike campaign updates, ba
]
category: "OSINT Analysts & Conflict Trackers",
icon: Radar,
color: "amber",
accounts: [
{ handle: "sentdefender", name: "OSINTdefender", desc: "Major OSINT aggregator — real-t
{ handle: "Osint613", name: "Open Source Intel", desc: "Middle East focused — strike ve
{ handle: "AuroraIntel", name: "Aurora Intel", desc: "Global events in real-time — Midd
{ handle: "Osinttechnical", name: "OSINT Technical", desc: "Technical weapons analysis,
{ handle: "IntelCrab", name: "IntelCrab", desc: "Real-time conflict tracking, breaking
{ handle: "Liveuamap", name: "Liveuamap", desc: "Interactive conflict map — tracks all
{ handle: "GeoConfirmed", name: "GeoConfirmed", desc: "Geolocates & verifies strike foo
{ handle: "flightradar24", name: "Flightradar24", desc: "Live flight tracking — airspac
{ handle: "MarineTraffic", name: "MarineTraffic", desc: "Vessel tracking — Hormuz trans
{ handle: "CovertShores", name: "H I Sutton", desc: "Naval OSINT specialist — submarine
{ handle: "CriticalThreats", name: "Critical Threats (AEI)", desc: "Daily Iran situatio
{ handle: "TheWarZone_", name: "The War Zone", desc: "In-depth military analysis, weapo
{ handle: "NASAFIRMSInfo", name: "NASA FIRMS", desc: "Satellite thermal detection — ver
]
category: "Key Journalists & Analysts",
icon: Newspaper,
color: "emerald",
accounts: [
{ handle: "BarakRavid", name: "Barak Ravid", desc: "Axios — breaking Israeli diplomatic
{ handle: "FarnazFassihi", name: "Farnaz Fassihi", desc: "NYT Iran correspondent — Tehr
{ handle: "joyce_karam", name: "Joyce Karam", desc: "The National — Gulf security, US-A
{ handle: "AJEnglish", name: "Al Jazeera English", desc: "Fastest breaking English-lang
{ handle: "AJArabic", name: "Al Jazeera Arabic", desc: "Arabic-language breaking news —
{ handle: "PressTV", name: "Press TV (Iran State Media)", desc: "Iranian state broadcas
{ handle: "khaleejtimes", name: "Khaleej Times", desc: "Dubai-based daily — ground-leve
{ handle: "Charles_Lister", name: "Charles Lister", desc: "MEI Senior Fellow — Iran pro
{ handle: "AliVaez", name: "Ali Vaez", desc: "Crisis Group Iran Director — ceasefire pr
{ handle: "WashInstitute", name: "Washington Institute", desc: "Gulf military analysis,
{ handle: "AlMonitor", name: "Al-Monitor", desc: "Middle East policy news — diplomatic
{ handle: "MiddleEastEye", name: "Middle East Eye", desc: "Independent Middle East jour
{ handle: "AFP", name: "AFP News Agency", desc: "Wire service — breaking news with Gulf
{ handle: "Reuters", name: "Reuters", desc: "Global wire service — verified breaking ne
]
// ─── OSINT SOURCES PANEL COMPONENT ─────────────────────────────────────────
const OsintSourcesPanel = () => {
const [expandedCat, setExpandedCat] = useState(null);
const [embedAccount, setEmbedAccount] = useState(null);
const catColors = { blue: "bg-blue-50 border-blue-200 text-blue-700", indigo: "bg-indigo-50
const catDots = { blue: "bg-blue-500", indigo: "bg-indigo-500", amber: "bg-amber-500", emer
const catBadge = { blue: "bg-blue-100 text-blue-700", indigo: "bg-indigo-100 text-indigo-70
return (
<div className="mt-6 pt-6 border-t border-gray-200">
<div className="flex items-center justify-between mb-4">
<div>
</div>
</div>
<p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">OSI
<p className="text-xs text-gray-400 mt-0.5">First-source accounts where news breaks
{/* Embedded X Feed Preview */}
{embedAccount && (
<Card className="mb-4 overflow-hidden">
<div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gr
<div className="flex items-center gap-2">
<div className="w-5 h-5 rounded-full bg-black flex items-center justify-center"
<span className="text-white text-[9px] font-bold">𝕏</span>
</div>
<span className="text-sm font-semibold text-gray-700">@{embedAccount}</span>
</div>
<button onClick={() => setEmbedAccount(null)} className="text-gray-400 hover:text
<X className="w-4 h-4" />
</button>
</div>
<div className="relative bg-white" style={{ height: "400px" }}>
<iframe
src={`https://syndication.twitter.com/srv/timeline-profile/screen-name/${embedA
className="w-full h-full border-0"
sandbox="allow-scripts allow-same-origin allow-popups"
title={`X feed: @${embedAccount}`}
/>
<div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-white
<a href={`https://x.com/${embedAccount}`} target="_blank" rel="noopener norefer
className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-black
<ExternalLink className="w-3 h-3" /> Open full profile on X
</a>
</div>
</div>
</Card>
)}
mb-2.5
{/* Priority Accounts Strip */}
<Card className="p-4 mb-4">
<p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold <div className="flex flex-wrap gap-2">
{OSINT_SOURCES.flatMap(cat => cat.accounts.filter(a => a.priority)).map((a, i) => (
<button key={i} onClick={() => setEmbedAccount(a.handle)}
className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border
<span className="text-[11px] font-bold text-gray-800 group-hover:text-blue-700"
<ExternalLink className="w-2.5 h-2.5 text-gray-400 group-hover:text-blue-500" /
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
className={`w-full flex items-center gap-3 p-3.5 text-left hover:bg-gray-50 t
<div className={`w-7 h-7 rounded-lg flex items-center justify-center ${catBad
<Icon className="w-3.5 h-3.5" />
</div>
<div className="flex-1 min-w-0">
<span className="text-sm font-semibold text-gray-800">{cat.category}</span>
<span className="text-[10px] text-gray-400 ml-2">{cat.accounts.length} acco
</div>
{isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight c
</button>
{isOpen && (
<div className="px-3.5 pb-3 border-t border-gray-100 pt-2 space-y-1.5">
{cat.accounts.map((a, ai) => (
<div key={ai} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg
<div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${catDots[ca
<div className="flex-1 min-w-0">
<div className="flex items-center gap-1.5">
<button onClick={() => setEmbedAccount(a.handle)} className="text-x
@{a.handle}
</button>
{a.verified && <CheckCircle className="w-3 h-3 text-blue-500 flex-s
{a.priority && <span className="text-[8px] px-1 py-0.5 rounded bg-r
</div>
<p className="text-[10px] text-gray-500 font-medium">{a.name}</p>
<p className="text-[10px] text-gray-400 mt-0.5">{a.desc}</p>
</div>
<a href={`https://x.com/${a.handle}`} target="_blank" rel="noopener nor
className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 t
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
<p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
{[
mb-2.5
{ name: "LiveUAMap", url: "https://liveuamap.com", desc: "Interactive conflict ma
{ name: "ADS-B Exchange", url: "https://globe.adsbexchange.com", desc: "Military
{ name: "FlightRadar24", url: "https://www.flightradar24.com", desc: "Commercial
{ name: "MarineTraffic", url: "https://www.marinetraffic.com", desc: "Vessel trac
{ name: "HormuzTracker", url: "https://hormuztracker.com", desc: "Strait transit
{ name: "NASA FIRMS", url: "https://firms.modaps.eosdis.nasa.gov/map", desc: "Sat
{ name: "GeoConfirmed", url: "https://geoconfirmed.org", desc: "Strike geolocatio
{ name: "ACLED Data", url: "https://acleddata.com", desc: "Conflict event databas
{ name: "InVID/WeVerify", url: "https://www.invid-project.eu", desc: "Video verif
].map((t, i) => (
<a key={i} href={t.url} target="_blank" rel="noopener noreferrer"
className="flex flex-col p-2.5 rounded-lg bg-gray-50 border border-gray-200 hov
<span className="text-xs font-semibold text-gray-800 group-hover:text-blue-700"
<span className="text-[10px] text-gray-400">{t.desc}</span>
</a>
))}
</div>
</Card>
{/* Verification Warning */}
<div className="flex items-start gap-2.5 mt-4 p-3 bg-amber-50 border border-amber-100 r
<AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
<div>
<p className="text-xs font-semibold text-amber-700">Verification Protocol</p>
<p className="text-[10px] text-amber-600 leading-relaxed">Cross-reference minimum 3
</div>
</div>
</div>
);
};
// ─── EMERGENCY TAB ──────────────────────────────────────────────────────────
// ─── LIVE TWEETS TAB ──────────────────────────────────────────────────────
},
const TWEET_FEEDS = [
{ category: " Emergency & Government", accounts: [
{ handle: "NCEmergencyUAE", name: "NCEMA UAE", desc: "Shelter alerts, all-clear signals"
{ handle: "HHShkMohd", name: "HH Sheikh Mohammed", desc: "UAE Vice President & PM" { handle: "MBZNews", name: "MBZ News", desc: "UAE President's office" },
{ handle: "DXBMediaOffice", name: "Dubai Media Office", desc: "Official Dubai updates" },
{ handle: "ADMediaOffice", name: "Abu Dhabi Media Office", desc: "Official Abu Dhabi upda
{ handle: "UAEGov", name: "UAE Government", desc: "Federal government updates" },
{ handle: "MoFAICUAE", name: "UAE Foreign Ministry", desc: "Diplomatic updates" },
{ handle: "DubaiPoliceHQ", name: "Dubai Police", desc: "Security & safety" },
]},
{ category: " Military & Defense", accounts: [
{ handle: "ABORNECOMMAND", name: "UAE Armed Forces", desc: "Military operations" },
{ handle: "CENTCOM", name: "U.S. CENTCOM", desc: "US military operations — Epic Fury upda
{ handle: "DeptofDefense", name: "U.S. Pentagon", desc: "Defense Department updates" },
{ handle: "SecDef", name: "Secretary of Defense", desc: "Pete Hegseth updates" },
{ handle: "IDF", name: "Israel Defense Forces", desc: "Israeli military operations" },
{ handle: "USNavy", name: "U.S. Navy", desc: "Naval operations, carrier groups" },
{ handle: "NATO", name: "NATO", desc: "Alliance response" },
]},
{ category: " OSINT & Analysts", accounts: [
{ handle: "sentdefender", name: "OSINTdefender", desc: "Real-time missile alerts, verifie
{ handle: "Osint613", name: "OSINT 613", desc: "Middle East conflict OSINT" },
{ handle: "AuroraIntel", name: "Aurora Intel", desc: "Flight tracking, military aviation"
{ handle: "IntelCrab", name: "IntelCrab", desc: "Conflict mapping" },
{ handle: "Osinttechnical", name: "OSINT Technical", desc: "Weapons analysis, intercept v
{ handle: "Liveuamap", name: "Liveuamap", desc: "Interactive conflict map" },
{ handle: "GeoConfirmed", name: "GeoConfirmed", desc: "Geolocated strike verification" },
{ handle: "CriticalThreats", name: "Critical Threats", desc: "Daily Iran situation update
{ handle: "TheWarZone_", name: "The War Zone", desc: "Military analysis" },
]},
{ category: " Journalists & Media", accounts: [
{ handle: "khaleejtimes", name: "Khaleej Times", desc: "UAE's leading English daily" },
{ handle: "AJEnglish", name: "Al Jazeera English", desc: "Middle East news" },
{ handle: "Reuters", name: "Reuters", desc: "Global wire service" },
{ handle: "BarakRavid", name: "Barak Ravid", desc: "Axios — Israeli diplomatic source" },
{ handle: "FarnazFassihi", name: "Farnaz Fassihi", desc: "NYT Iran correspondent" },
{ handle: "joyce_karam", name: "Joyce Karam", desc: "The National — Washington" },
{ handle: "Charles_Lister", name: "Charles Lister", desc: "MEI Syria/Levant analyst" },
{ handle: "AliVaez", name: "Ali Vaez", desc: "ICG Iran Project Director" },
{ handle: "WashInstitute", name: "Washington Institute", desc: "Gulf air defense analysis
{ handle: "flightradar24", name: "Flightradar24", desc: "Real-time flight tracking" },
{ handle: "MarineTraffic", name: "MarineTraffic", desc: "Vessel tracking — Hormuz" },
]},
];
const LiveTweetsTab = () => {
const [selectedAccount, setSelectedAccount] = useState(null);
const [selectedCategory, setSelectedCategory] = useState(0);
const iframeRef = useRef(null);
const allPriority = ["NCEmergencyUAE", "CENTCOM", "sentdefender", "khaleejtimes", "DXBMedia
mb-3">
return (
<div className="space-y-4">
{/* Priority Quick Access */}
<Card className="p-4">
<p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold <div className="flex flex-wrap gap-2">
{allPriority.map(handle => {
const acc = TWEET_FEEDS.flatMap(c => c.accounts).find(a => a.handle === handle);
return (
<button key={handle} onClick={() => setSelectedAccount(handle)}
className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semib
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
<div className="flex items-center justify-between p-3 border-b border-gray-100 bg-g
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-cent
<span className="text-blue-600 text-xs font-bold">𝕏</span>
</div>
<div>
<p className="text-sm font-bold text-gray-800">@{selectedAccount}</p>
<p className="text-[10px] text-gray-500">{TWEET_FEEDS.flatMap(c => c.accounts
</div>
</div>
<div className="flex gap-2">
<a href={`https://x.com/${selectedAccount}`} target="_blank" rel="noopener nore
className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-semibold h
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
src={`https://syndication.twitter.com/srv/timeline-profile/screen-name/${select
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
<p className="text-sm text-gray-600 font-semibold">Tap any account above to view th
<p className="text-xs text-gray-400 mt-1">Or browse by category below</p>
</Card>
)}
{/* Category Browser */}
<div className="flex gap-1.5 overflow-x-auto pb-1">
{TWEET_FEEDS.map((cat, i) => (
<button key={i} onClick={() => setSelectedCategory(i)}
className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transiti
selectedCategory === i ? "bg-blue-600 text-white" : "bg-white text-gray-600 bor
}`}>{cat.category}</button>
))}
</div>
<Card className="divide-y divide-gray-50">
{TWEET_FEEDS[selectedCategory]?.accounts.map((acc, i) => (
<button key={i} onClick={() => setSelectedAccount(acc.handle)}
className={`w-full flex items-center gap-3 p-3 text-left hover:bg-blue-50/40 tran
selectedAccount === acc.handle ? "bg-blue-50" : ""
}`}>
<div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-cent
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
mb-3">
const EmergencyTab = () => {
const [checked, setChecked] = useState(() => { try { return JSON.parse(localStorage.getItem
const toggleCheck = (id) => setChecked(p => { const next = { ...p, [id]: !p[id] }; try { lo
const total = GO_BAG_CHECKLIST.length;
const done = Object.values(checked).filter(Boolean).length;
return (
<div className="space-y-5">
<Card className="p-5">
<p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
{EMERGENCY_CONTACTS.map((c, i) => (
<div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${c.type =
<Phone className={`w-4 h-4 ${c.type === "emergency" ? "text-red-500" : c.type =
<div>
<p className="text-[10px] text-gray-500 font-medium">{c.name}</p>
<p className="text-sm font-bold text-gray-800">{c.number}</p>
</div>
</div>
))}
</div>
</Card>
<Card className="p-5 bg-amber-50 border-amber-200">
<p className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold mb-3"
<div className="space-y-2 text-sm text-gray-700">
<div className="flex gap-3"><span className="text-amber-600 font-bold w-5">1.</span
<div className="flex gap-3"><span className="text-amber-600 font-bold w-5">2.</span
<div className="flex gap-3"><span className="text-amber-600 font-bold w-5">3.</span
<div className="flex gap-3"><span className="text-amber-600 font-bold w-5">4.</span
<div className="flex gap-3"><span className="text-amber-600 font-bold w-5">5.</span
</div>
</Card>
<Card className="p-5">
<div className="flex items-center justify-between mb-3">
<p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">90-
<span className={`text-sm font-bold ${done === total ? "text-emerald-600" : "text-b
</div>
<div className="w-full bg-gray-200 rounded-full h-2 mb-4">
<div className={`h-2 rounded-full transition-all duration-500 ${done === total ? "b
</div>
<div className="space-y-1.5">
{GO_BAG_CHECKLIST.map(item => (
<button key={item.id} onClick={() => toggleCheck(item.id)}
className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-
checked[item.id] ? "bg-emerald-50 border-emerald-200" : "bg-white border-gray
}`}>
<div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrin
checked[item.id] ? "bg-emerald-500 border-emerald-500" : "border-gray-300"
}`}>{checked[item.id] && <Check className="w-3 h-3 text-white" />}</div>
<span className={`text-sm ${checked[item.id] ? "text-emerald-700 line-through"
{item.priority === "critical" && !checked[item.id] && <span className="text-[10
</button>
))}
</div>
</Card>
<Card className="p-5">
<p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold <div className="space-y-2.5">
{RETURN_CRITERIA.map((r, i) => (
<div key={i} className="flex items-center gap-3">
<XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
<span className="text-sm text-gray-700 flex-1">{r.text}</span>
<span className="text-xs text-red-500 font-bold">NOT MET</span>
</div>
mb-3">
))}
</div>
</Card>
</div>
<p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">Earliest plau
);
};
// ============================================================================
// SHOULD I GO? — Tab 7 for GCC War Room v3.0
// Crisis Perception Intelligence Platform — Full Override Protocol
// The Override Protocol shifts the ENTIRE tab posture across 5 levels
// Demo mode lets you preview all 5 levels for government presentations
// ============================================================================
const SIG_STYLES = `
@keyframes sigFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; tra
@keyframes sigPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(232,113,10,0.3); } 50% { box-shadow:
@keyframes sigPulseGreen { 0%,100% { box-shadow: 0 0 0 0 rgba(52,168,83,0.3); } 50% { box-sha
@keyframes sigPulseRed { 0%,100% { box-shadow: 0 0 0 0 rgba(234,67,53,0.4); } 50% { box-shado
.sig-fade { animation: sigFadeIn 0.4s ease-out both; }
.sig-fade-1 { animation-delay: 0.05s; } .sig-fade-2 { animation-delay: 0.1s; } .sig-fade-3 {
.sig-pulse { animation: sigPulse 2s ease-in-out infinite; }
.sig-card { background: #EBEBEB; border-radius: 16px; border: none; padding: 20px; margin-bot
.sig-card:hover { transform: translateY(-1px); }
.sig-stat { text-align: center; padding: 20px 16px; background: #EBEBEB; border-radius: 16px;
.sig-stat:hover { transform: translateY(-2px); }
.sig-pill { padding: 8px 20px; border-radius: var(--gw-radius-full); font-family: 'Google San
.sig-intent { border-radius: 16px; border: 2px solid #E8EAED; padding: 28px 16px; cursor: poi
.sig-intent:hover { border-color: #1A73E8; background: #F0F6FF; transform: translateY(-4px);
.sig-intent.active { border-color: #1A73E8; background: #EBF2FF; }
.sig-input { padding: 10px 14px; border-radius: var(--gw-radius-sm); border: 1px solid var(--
.sig-input:focus { border-color: var(--gw-blue); box-shadow: 0 0 0 2px var(--gw-blue-surface)
.sig-btn { background: var(--gw-blue); color: #fff; border: none; border-radius: var(--gw-rad
.sig-btn:hover { background: var(--gw-blue-hover); }
.sig-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.sig-chat-user { background: var(--gw-blue); font-family: 'Google Sans Text', sans-serif; col
.sig-chat-ai { background: var(--gw-surface); color: var(--gw-text-primary); border-radius: 1
.sig-advisor-card { border-radius: 12px; border: 2px solid #E8EAED; padding: 20px; cursor: po
.sig-advisor-card:hover { border-color: #1A73E8; box-shadow: 0 4px 16px rgba(26,115,232,0.1);
.sig-advisor-card.selected { border-color: #1A73E8; background: #F0F6FF; }
.sig-section-title { font-family: "Google Sans", sans-serif; font-size: 16px; font-weight: 50
.sig-section-title:first-child { margin-top: 0; }
@media (max-width: 640px) { .sig-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
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
const [aiPanelOpen, setAiPanelOpen] = useState(false);
const [aiInsight, setAiInsight] = useState("");
const [aiInsightDone, setAiInsightDone] = useState(false);
const [aiShowChat, setAiShowChat] = useState(false);
const L = confidenceLevel;
const LEVELS = {
1: { name: "OPEN FOR BUSINESS", color: "#34A853", bgGrad: "linear-gradient(135deg, #E6F4E
2: { name: "RECOVERY PHASE", color: "#34A853", bgGrad: "linear-gradient(135deg, #E6F4EA,
3: { name: "MONITORING", color: "#FBBC04", bgGrad: "linear-gradient(135deg, #FEF7E0, #FFF
4: { name: "HEIGHTENED AWARENESS", color: "#E8710A", bgGrad: "linear-gradient(135deg, #FF
5: { name: "MAXIMUM ALERT", color: "#EA4335", bgGrad: "linear-gradient(135deg, #FDECEA, #
};
const CL = LEVELS[L];
const isOpportunity = L <= 2;
const isRiskForward = L >= 4;
const govAdvisories = {
"United States": { level: "Level 3 — Reconsider Travel", color: "#E8710A", icon: " ", de
"United Kingdom": { level: "Against all but essential travel", color: "#EA4335", icon: "
"Australia": { level: "Highest advisory level", color: "#EA4335", icon: " ", detail: "Ad
"Canada": { level: "Advises against travel", color: "#EA4335", icon: " ", detail: "Embas
"India": { level: "Advisory in effect", color: "#E8710A", icon: " ", detail: "~3.5M nati
"Pakistan": { level: "Advisory in effect", color: "#E8710A", icon: " ", detail: "~1.7M n
"Philippines": { level: "Alert Level 3", color: "#E8710A", icon: " ", detail: "~700K OFW
"Germany": { level: "Travel warning", color: "#EA4335", icon: " ", detail: "Lufthansa su
"France": { level: "Advises against travel", color: "#EA4335", icon: " ", detail: "Air F
"Bangladesh": { level: "Advisory in effect", color: "#E8710A", icon: " ", detail: "~1M+
"China": { level: "Safety reminder", color: "#FBBC04", icon: " ", detail: "Embassy advis
"South Korea": { level: "Advisory elevated", color: "#E8710A", icon: " ", detail: "Cheon
"Japan": { level: "Level 3 — Avoid", color: "#EA4335", icon: " ", detail: "Embassy reduc
};
const originCountries = Object.keys(govAdvisories);
const countries = ["UAE","Saudi Arabia","Qatar","Bahrain","Kuwait","Oman","Jordan","Iraq","
const myAdvisory = govAdvisories[originCountry];
const resCtx = { tourist: { l: "Tourist", i: " const myRes = resCtx[resStatus] || resCtx.expat_family;
" }, business: { l: "Business", i: " " },
const comparisonData = {
"United States": { traffic: { home: 2160, label: "Car accident deaths" }, guns: { home: 2
"United Kingdom": { traffic: { home: 90, label: "Car accident deaths" }, violent: { home:
"India": { traffic: { home: 7470, label: "Car accident deaths" }, pollution: { home: 6300
"Pakistan": { traffic: { home: 720, label: "Car accident deaths" } },
"Philippines": { traffic: { home: 540, label: "Car accident deaths" } },
"Australia": { traffic: { home: 72, label: "Car accident deaths" } },
"Germany": { traffic: { home: 144, label: "Car accident deaths" } },
"France": { traffic: { home: 162, label: "Car accident deaths" } },
"Canada": { traffic: { home: 144, label: "Car accident deaths" } },
"China": { traffic: { home: 12600, label: "Car accident deaths" } },
};
const investScenarios = {
optimistic: { probability: "25–30%", timeline: "Ceasefire 6 weeks", property: "Stabilizes
base: { probability: "40–45%", timeline: "Campaign 2–4 months", property: "Declines 10–15
pessimistic: { probability: "15–20%", timeline: "Expanded, ground ops", property: "Declin
};
const scenario = investScenarios[investmentScenario];
// ── ADVISOR ──
const advisorSteps = [
{ q: "What describes you best?", opts: [{ label: "Thinking of visiting", value: "visit",
{ q: "Who are you with?", opts: [{ label: "Just me", value: "solo", icon: " " },{ { q: "Your flexibility?", opts: [{ label: "Completely flexible", value: "flexible", icon:
label:
];
const getAdvisorResult = () => {
const { situation, companions } = advisorAnswers;
const isFamily = companions === "family" || companions === "elderly";
// L5: Maximum alert
if (L >= 5) return { verdict: "FOLLOW OFFICIAL GUIDANCE", color: "#E37400", icon: " // Visit + family + L4
if (situation === "visit" && isFamily && L >= 4) return { verdict: "CONSIDER FLEXIBLE DAT
// Visit + L4 (singles/couples)
if (situation === "visit" && L >= 4) return { verdict: "GREAT DEALS — TAKE PRECAUTIONS",
// Already here
if (situation === "stay") return { verdict: "YOU'RE IN GOOD HANDS", color: "#34A853", ico
// Left and wants to return
if (situation === "return") return { verdict: isRiskForward ? "MONITORING — GREAT DEALS A
", d
// Relocate
if (situation === "relocate") return { verdict: isFamily && isRiskForward ? "PLAN WITH FL
// Opportunity levels
if (isOpportunity && situation === "visit") return { verdict: "WELCOME TO THE GULF", colo
return { verdict: "STAY INFORMED", color: "#1A73E8", icon: " ", detail: "Check official
};
// ── AI CHAT ──
const buildSP = () => `You are the Gulf Confidence Analyst — an expert who helps people mak
CURRENT DATA: Day ${conflictDay}. ${missileData.total} projectiles, ${interceptionRate} inter
User: ${myRes.l}${originCountry ? ` from ${originCountry}` : ""}. Intent: ${userIntent}. Leve
govern
CRITICAL TONE RULES:
- ${CL.aiPosture}
- NEVER suggest anyone leave the country, evacuate, or not return
- NEVER use words: "evacuate", "flee", "leave now", "don't come", "don't return", "unsafe"
- For tourists already here: airports have intermittent service, check flight status, enjoy d
- For tourists wanting to come: incredible deals available, take standard precautions, flexib
- For families with kids: suggest flexible timing, highlight safety infrastructure, never dis
- For residents: life continues, defense is strong, community is resilient
- For investors: historic entry points, long-term fundamentals strong, UAE sovereign wealth b
- Highlight: ${interceptionRate} interception (world-class), 0 tourist casualties, UAE - Always mention positive: great deals, resilient economy, strong defense, community spirit
- Format responses with emoji headers, bold key data, and clear sections
- Keep under 400 words, be warm and informative`;
const sendChat = async (text) => {
if (!text?.trim() || chatLoading) return;
const msg = text.trim(); setChatInput("");
const upd = [...chatMessages, { role: "user", content: msg }];
setChatMessages(upd); setChatLoading(true);
try {
const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "appl
if (!res.ok) throw new Error();
const data = await res.json();
setChatMessages(p => [...p, { role: "assistant", content: data.content?.map(b => b.text
} catch { setChatMessages(p => [...p, { role: "assistant", content: `Day ${conflictDay}.
setChatLoading(false);
};
useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessa
// AI Insight typing effect
const insightText = `Defense systems performing at ${interceptionRate} interception — world
useEffect(() => {
if (!userIntent) return;
setAiInsight(""); setAiInsightDone(false); setAiShowChat(false);
let i = 0;
const t = setInterval(() => { if (i < insightText.length) { setAiInsight(insightText.slic
return () => clearInterval(t);
}, [userIntent]);
const selComp = comparisonData[originCountry] || comparisonData["United States"];
const compEntries = Object.entries(selComp);
const maxComp = Math.max(...compEntries.map(([,v]) => v.home));
c: "#3
// ═══════ REUSABLE SECTION RENDERERS ═══════
const renderStats = (subset) => {
const allStats = [
{ v: missileData.total.toLocaleString(), l: "Total Projectiles", s: `${missileData.ball
{ v: interceptionRate, l: "Interception Rate", s: "THAAD + Patriot + Coalition", { v: String(casualties.killed), l: "UAE Killed", s: `${casualties.injured} injured`, c:
{ v: "0", l: "Tourist Casualties", s: "Zero tourists hurt", c: "#34A853" },
{ v: straitStatus, l: "Hormuz Traffic", s: "Near zero transits", c: "#EA4335" },
{ v: oilPrice, l: "Oil Price", s: `Pre-war: ${CONFLICT_DATA.oil.preWar}`, c: "#E8710A"
{ v: CONFLICT_DATA.dfm, l: "DFM Real Estate", s: "Down from peak", c: "#EA4335" },
{ v: CONFLICT_DATA.hotels, l: "Hotel Bookings", s: "Collapsed", c: "#EA4335" },
];
const items = subset ? allStats.filter((_,i) => subset.includes(i)) : allStats;
return (<div className="sig-grid-4" style={{ display: "grid", gridTemplateColumns: {items.map((s,i) => (<div key={i} className={`sig-stat sig-fade sig-fade-${(i%4)+1}`}><
</div>);
"repea
};
const renderDefense = () => (
<div className="sig-card sig-fade"><div style={{ fontFamily: "'Google Sans', sans-serif",
);
const renderAdvisories = () => (
<div className="sig-card sig-fade"><div style={{ fontFamily: "'Google Sans', sans-serif",
);
const renderAdvisor = () => (
<div className="sig-fade">
{advisorStep < advisorSteps.length ? (<div>
<div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>{advisorSteps.map(
<div style={{ fontSize: "16px", fontWeight: 700, color: "#1B365D", marginBottom: "14p
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1
{advisorSteps[advisorStep].opts.map(opt => (<div key={opt.value} className="sig-adv
</div>
{advisorStep > 0 && <button onClick={() => setAdvisorStep(s => s - 1)} style={{ margi
</div>) : (<div>
{(() => { const r = getAdvisorResult(); return (<div style={{ background: "#EBEBEB",
<button onClick={() => { setAdvisorStep(0); setAdvisorAnswers({}); }} style={{ margin
</div>)}
</div>
);
const renderPerception = () => (<div className="sig-fade">
<div className="sig-card" style={{ background: "#FFF8E1", borderColor: "#FFD54F" }}><stro
<div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}
<div className="sig-card">{compEntries.map(([key, data]) => (<div key={key} style={{ marg
<div className="sig-card" style={{ background: "#FFF3E0", borderColor: "#FFB74D" }}><stro
</div>);
const renderInvestment = () => (<div className="sig-fade">
<div className="sig-card" style={{ background: isOpportunity ? "#E6F4EA" : "#FFF8E1", bor
<div className="sig-card" style={{ overflowX: "auto" }}><table style={{ width: "100%", bo
<div className="sig-card"><div style={{ fontFamily: "'Google Sans', sans-serif", fontWeig
</div>);
const renderTimeline = () => (<div className="sig-card sig-fade"><div style={{ fontFamily:
const renderEscapeRoutes = () => (<div className="sig-card sig-fade"><div style={{ fontFami
const renderSupply = () => (<div style={{ background: "#EBEBEB", borderRadius: "16px", padd
const renderForecast = () => (<div className="sig-card sig-fade"><div style={{ fontFamily:
const renderAI = () => (<div className="sig-fade">
{chatMessages.length === 0 && (<div style={{ display: "flex", flexWrap: "wrap", gap: "8px
<div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #E8EAED", over
<div style={{ maxHeight: "350px", overflowY: "auto", padding: "16px" }}>
{chatMessages.length === 0 && <div style={{ textAlign: "center", padding: "30px", col
{chatMessages.map((m,i) => (<div key={i} style={{ display: "flex", justifyContent: m.
{chatLoading && <div style={{ display: "flex" }}><div className="sig-chat-ai" style={
<div ref={chatEndRef} />
</div>
<div style={{ display: "flex", gap: "8px", padding: "12px 16px", borderTop: "1px <input className="sig-input" style={{ flex: 1 }} value={chatInput} onChange={e <button className="sig-btn" onClick={() => sendChat(chatInput)} disabled={chatLoading
</div>
</div>
</div>);
solid
=> set
const renderAIInsight = () => (
<div style={{ marginBottom: "16px" }}>
<div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1px s
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
<div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ f
<span style={{ fontSize: "11px", color: "#8E8E93" }}>Just now</span>
</div>
<div style={{ fontSize: "14px", lineHeight: 1.7, color: "#3C3C43" }}><span className=
{aiInsightDone && !aiShowChat && (
<div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap" }}>
{["Tell me more", "Hotel deals?", "Flight status?", "Investment outlook?"].map(q
<button key={q} onClick={() => { setAiShowChat(true); sendChat(q); }} style={{
))}
</div>
)}
{aiShowChat && (<div style={{ marginTop: "14px", borderTop: "1px solid #E8E8E8", padd
<div style={{ maxHeight: "250px", overflowY: "auto", marginBottom: "12px" }}>
{chatMessages.map((m, idx) => (<div key={idx} style={{ display: "flex", justifyCo
{chatLoading && <div><div className="sig-chat-ai" style={{ color: "#8E8E93" }}>●
<div ref={chatEndRef} />
</div>
<div style={{ display: "flex", gap: "8px" }}>
<input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={
<button onClick={() => sendChat(chatInput)} disabled={chatLoading} style={{ paddi
</div>
</div>)}
</div>
</div>
);
const renderFooter = () => (<div style={{ background: "#F8F9FA", borderRadius: "14px", padd
// ═══════ MAIN RENDER ═══════
return (
<div style={{ fontFamily: "'Google Sans Text', 'Google Sans', -apple-system, sans-serif",
<style>{SIG_STYLES}</style>
{/* ═══ INTENT SELECTOR (THE LANDING) ═══ */}
{!userIntent && (<div className="sig-fade">
<div style={{ textAlign: "center", marginBottom: "20px" }}>
<div style={{ fontFamily: "'Google Sans Display', sans-serif", fontSize: "24px", fo
<div style={{ fontSize: "14px", color: "var(--gw-text-secondary)", marginTop: "6px"
</div>
{/* Country Selector — single pill */}
<div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
<div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4
<span> </span>
<span style={{ fontSize: "13px", fontWeight: 500, color: "var(--gw-blue-text)", f
<select value={targetCountry} onChange={e => setTargetCountry(e.target.value)}
style={{ fontSize: "14px", fontWeight: 600, color: "var(--gw-blue-text)", fontF
{countries.map(c => <option key={c} value={c}>{c}</option>)}
</select>
</div>
</div>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1
{[{ id: "visit", icon: " ", title: "Visit", desc: "Should I travel?", bg: "#E8F5E9
{ id: "invest", icon: " { id: "move", icon: " ", title: "Invest", desc: "Is the dip opportunity?", bg:
", title: "Stay / Move", desc: "Stay, leave, relocate?", b
{ id: "understand", icon: " ", title: "Understand", desc: "The full picture", bg
<div key={i.id} onClick={() => setUserIntent(i.id)} style={{ background: i.bg, bo
onMouseEnter={e => { e.currentTarget.style.borderColor = i.hoverBorder; e.curre
onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.curre
<div style={{ width: "56px", height: "56px", borderRadius: "var(--gw-radius-md)
<div style={{ fontFamily: "'Google Sans', sans-serif", fontWeight: 500, fontSiz
<div style={{ fontSize: "12px", color: "var(--gw-text-tertiary)" }}>{i.desc}</d
</div>
))}
</div>
</div>)}
{/* ═══ PERSONALIZED PAGES (after intent selected) ═══ */}
{userIntent && (<div>
{/* Back + intent label */}
<div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px
<button onClick={() => { setUserIntent(null); setAdvisorStep(0); setAdvisorAnswers(
<div style={{ flex: 1 }}>
<div className="gw-overline">PERSONALIZED FOR: {myRes.i} {myRes.l.toUpperCase()}{
<div style={{ fontSize: "18px", fontWeight: 500, color: "var(--gw-text-primary)",
</div>
{!originCountry && <select className="sig-input" style={{ maxWidth: "200px" }} valu
</div>
{/* ═══ VISIT PAGE ═══ */}
{userIntent === "visit" && (<div className="space-y-4">
<div className="sig-section-title"> Your Assessment</div>
{renderAdvisor()}
{/* T212 Hero Card — dynamic per country */}
{(() => {
const cd = GCC_DATA[targetCountry] || GCC_DATA["UAE"];
const heroGrad = userIntent === "invest" ? "linear-gradient(135deg, #0D9488, return (
<div className="sig-fade" style={{ background: heroGrad, borderRadius: "20px", pa
<div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 1
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "fl
{userIntent === "invest" ? (<><div><div style={{ fontSize: "11px", fontWeight
#14B8A
</div>
<div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
{userIntent === "invest" ? (<><div style={{ background: "rgba(255,255,255,0.1
</div>
</div>
);
})()}
<div className="sig-fade sig-fade-1" style={{ background: "#EBEBEB", borderRadius: "1
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px
<div className="t-bar"><div className="t-bar-fill" style={{ width: "92%", backgroun
<div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}
</div>
<div className="sig-section-title"> More Data</div>
{renderStats([4,5,6,7])}
<div className="sig-section-title"> Risk in Context</div>
{renderPerception()}
<div className="sig-section-title"> Government Advisories</div>
{renderAdvisories()}
{renderAIInsight()}
{renderFooter()}
</div>)}
#14B8A
{/* ═══ INVEST PAGE ═══ */}
{userIntent === "invest" && (<div className="space-y-4">
{/* T212 Hero Card — dynamic per country */}
{(() => {
const cd = GCC_DATA[targetCountry] || GCC_DATA["UAE"];
const heroGrad = userIntent === "invest" ? "linear-gradient(135deg, #0D9488, return (
<div className="sig-fade" style={{ background: heroGrad, borderRadius: "20px", pa
<div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 1
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "fl
{userIntent === "invest" ? (<><div><div style={{ fontSize: "11px", fontWeight
</div>
<div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
{userIntent === "invest" ? (<><div style={{ background: "rgba(255,255,255,0.1
</div>
</div>
);
})()}
<div className="sig-fade sig-fade-1" style={{ background: "#EBEBEB", borderRadius: "1
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px
<div className="t-bar"><div className="t-bar-fill" style={{ width: "92%", backgroun
<div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}
</div>
<div className="sig-section-title"> Crisis Opportunity Analysis</div>
{renderInvestment()}
<div className="sig-section-title"> Economic Snapshot</div>
{renderStats([4,7])}
<div className="sig-card sig-fade"><div className="sig-grid-2" style={{ display: "g
<div className="sig-section-title"> Forecast</div>
{renderForecast()}
{renderAIInsight()}
{renderFooter()}
</div>)}
#14B8A
{/* ═══ MOVE/STAY PAGE ═══ */}
{userIntent === "move" && (<div className="space-y-4">
<div className="sig-section-title"> Your Assessment</div>
{renderAdvisor()}
{/* T212 Hero Card — dynamic per country */}
{(() => {
const cd = GCC_DATA[targetCountry] || GCC_DATA["UAE"];
const heroGrad = userIntent === "invest" ? "linear-gradient(135deg, #0D9488, return (
<div className="sig-fade" style={{ background: heroGrad, borderRadius: "20px", pa
<div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 1
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "fl
{userIntent === "invest" ? (<><div><div style={{ fontSize: "11px", fontWeight
</div>
<div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
{userIntent === "invest" ? (<><div style={{ background: "rgba(255,255,255,0.1
</div>
</div>
);
})()}
<div className="sig-fade sig-fade-1" style={{ background: "#EBEBEB", borderRadius: "1
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px
<div className="t-bar"><div className="t-bar-fill" style={{ width: "92%", backgroun
<div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}
</div>
<div className="sig-section-title"> More Data</div>
{renderStats([4,5,6,7])}
<div className="sig-section-title"> Threat Proximity</div>
<ThreatMap />
<InterceptorGauge />
<div className="sig-section-title"> Departure Options</div>
{renderEscapeRoutes()}
<div className="sig-section-title"> Infrastructure</div>
{renderSupply()}
<div className="sig-section-title"> What Happened</div>
{renderTimeline()}
{renderAIInsight()}
{renderFooter()}
</div>)}
#14B8A
{/* ═══ UNDERSTAND PAGE ═══ */}
{userIntent === "understand" && (<div className="space-y-4">
<WhatChangedToday />
{/* T212 Hero Card — dynamic per country */}
{(() => {
const cd = GCC_DATA[targetCountry] || GCC_DATA["UAE"];
const heroGrad = userIntent === "invest" ? "linear-gradient(135deg, #0D9488, return (
<div className="sig-fade" style={{ background: heroGrad, borderRadius: "20px", pa
<div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 1
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "fl
{userIntent === "invest" ? (<><div><div style={{ fontSize: "11px", fontWeight
</div>
<div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
{userIntent === "invest" ? (<><div style={{ background: "rgba(255,255,255,0.1
</div>
</div>
);
})()}
<div className="sig-fade sig-fade-1" style={{ background: "#EBEBEB", borderRadius: "1
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px
<div className="t-bar"><div className="t-bar-fill" style={{ width: "92%", backgroun
<div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}
</div>
<div className="sig-section-title"> Full Situation Data</div>
{renderStats([4,5,6,7])}
<div className="sig-section-title"> Threat Map</div>
<ThreatMap />
<InterceptorGauge />
<div className="sig-section-title"> Timeline</div>
{renderTimeline()}
<div className="sig-section-title"> Routes & Infrastructure</div>
{renderEscapeRoutes()}
{renderSupply()}
<div className="sig-section-title"> Forecast</div>
{renderForecast()}
<div className="sig-section-title"> Risk in Context</div>
{renderPerception()}
<div className="sig-section-title"> Government Advisories</div>
{renderAdvisories()}
{renderAIInsight()}
{renderFooter()}
</div>)}
</div>)}
{/* FLOATING AI CHAT */}
{!aiPanelOpen && (
<button onClick={() => setAiPanelOpen(true)} style={{ position: "fixed", bottom: "24p
onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
<span style={{ fontSize: "18px" }}> </span> Ask AI
</button>
)}
{aiPanelOpen && (
<div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, maxHeight:
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between
<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={
<button onClick={() => setAiPanelOpen(false)} style={{ padding: "8px 14px", borde
</div>
{chatMessages.length === 0 && (<div style={{ display: "flex", flexWrap: "wrap", gap
<div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", minHeight: "120px"
{chatMessages.length === 0 && <div style={{ textAlign: "center", padding: "30px",
{chatMessages.map((m, mi) => (<div key={mi} style={{ display: "flex", justifyCont
{chatLoading && <div><div className="sig-chat-ai" style={{ color: "#8E8E93" }}>●
<div ref={chatEndRef} />
</div>
<div style={{ display: "flex", gap: "8px", padding: "12px 20px", borderTop: "1px so
<input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={
<button onClick={() => sendChat(chatInput)} disabled={chatLoading} style={{ paddi
</div>
</div>
)}
</div>
);
};
// ─── MAIN APP ───────────────────────────────────────────────────────────────
const TAB_KEYS = [
{ key: "shouldigo", emoji: " ", shortLabel: "Should I Go?" },
{ key: "dashboard", emoji: " { key: "analysis", emoji: " { key: "ai", emoji: " { key: "intel", emoji: " { key: "emergency", emoji: " ", shortLabel: "Data" },
", shortLabel: "Analysis" },
", shortLabel: "AI" },
", shortLabel: "Intel" },
", shortLabel: "SOS" },
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
const [demoLevel, setDemoLevel] = useState(null);
useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clear
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
navigator.share({ title: "GCC War Room", text: `Day ${CONFLICT_DATA.day} — ${selCity},
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
const riskColor = cityRisk >= 5 ? "#DC2626" : cityRisk >= 4 ? "#D97706" : cityRisk >= 3 ? "
const riskLabel = cityRisk >= 5 ? "CRITICAL" : cityRisk >= 4 ? "HIGH" : cityRisk >= 3 ? "EL
const alertConfig = getAlertConfig(cityRisk, resStatus, countryData);
const isRTL = ["ar", "ur", "fa"].includes(lang);
const keySignals = [
"DXB fuel tank fire from drone — 3rd airport hit (TODAY)",
"Iran declared Jebel Ali 'legitimate target' — 25 km from JBR",
"Interceptor depletion accelerating — defense shield degrading",
];
return (
<div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-[#F8F9FA]"}`
{/* All styles inline — index.css only has @tailwind directives */}
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&fa
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
body { margin:0; font-family:'Google Sans Text','Google Sans',-apple-system,BlinkMacS
*{scrollbar-width:thin;scrollbar-color:var(--gw-border-strong) transparent; box-sizin
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--gw-border-strong);border-radius:3px}
input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:1
@keyframes heartbeat{0%{transform:scale(1)}14%{transform:scale(1.12)}28%{transform:sc
.heartbeat{animation:heartbeat 1.5s ease-in-out infinite;transform-origin:center}
@keyframes soft-pulse{0%,100%{box-shadow:0 0 0 0 rgba(26,115,232,0.35)}50%{box-shadow
.soft-pulse{animation:soft-pulse 2.5s ease-in-out infinite}
@keyframes gw-fade-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform
@keyframes gw-slide-up{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes t-pulse{0%,100%{opacity:1}50%{opacity:0.4}}
.t-typing::after{content:'▋';animation:t-pulse 0.8s infinite;color:var(--gw-blue)}
.t-label{font-size:11px;font-weight:500;letter-spacing:0.8px;text-transform:uppercase
.t-bar{height:8px;border-radius:4px;overflow:hidden;display:flex}
.t-bar-fill{height:100%;transition:width 0.6s ease-out}
.gw-fade{animation:gw-fade-in 0.35s ease-out both}
.gw-fade-1{animation-delay:0.04s}.gw-fade-2{animation-delay:0.08s}.gw-fade-3{animatio
.gw-card{background:#EBEBEB;border-radius:16px;border:none;transition:transform 0.15s
.gw-card:hover{transform:translateY(-1px)}
.gw-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radiu
.gw-chip:hover{border-color:var(--gw-blue);background:var(--gw-blue-surface)}
.gw-chip.active{border-color:var(--gw-blue);background:var(--gw-blue-surface);color:v
.gw-section-title{font-family:'Google Sans',sans-serif;font-size:16px;font-weight:500
.gw-overline{font-size:10px;font-weight:500;letter-spacing:0.8px;text-transform:upper
.gw-display{font-family:'Google Sans Display',sans-serif}
select.gw-select{font-family:'Google Sans Text',sans-serif;padding:10px 36px 10px 14p
select.gw-select:hover{border-color:var(--gw-blue)}
select.gw-select:focus{outline:none;border-color:var(--gw-blue);box-shadow:0 0 `}</style>
0 2px
{/* HEADER — Google Workspace Style */}
<header className="bg-white border-b sticky top-0 z-40" style={{ borderColor: 'var(--gw
<div className="flex items-center gap-3 px-4 py-2.5">
<button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 round
<Menu className="w-5 h-5" style={{ color: 'var(--gw-text-secondary)' }} />
</button>
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg flex items-center justify-center text-white fo
<div>
<span className="hidden sm:inline text-[15px] font-medium" style={{ color: 'var
<span className="sm:hidden text-[15px] font-medium" style={{ color: 'var(--gw-t
<span className="hidden sm:inline text-[11px] ml-2" style={{ color: 'var(--gw-t
</div>
</div>
<div className="ml-auto flex items-center gap-1.5">
{/* Language */}
<div className="relative">
<button onClick={() => setShowLangMenu(!showLangMenu)}
className="flex items-center gap-1.5 px-2.5 py-2 rounded-full text-[13px] fon
style={{ color: 'var(--gw-text-secondary)' }}>
<span>{LANGUAGES.find(l => l.code === lang)?.flag}</span>
<ChevronDown className="w-3 h-3" style={{ color: 'var(--gw-text-disabled)' }}
</button>
{showLangMenu && (
<>
<div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)}
<div className="absolute right-0 top-full mt-1 w-48 bg-white z-50 py-1 max-
{LANGUAGES.map(l => (
<button key={l.code} onClick={() => { setLang(l.code); setShowLangMenu(
className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left tex
style={{ fontFamily: "'Google Sans Text', sans-serif", background: la
<span className="text-base">{l.flag}</span>
<span>{l.label}</span>
{lang === l.code && <Check className="w-3.5 h-3.5 ml-auto" style={{ c
</button>
))}
</div>
</>
)}
</div>
<button onClick={shareUrl} className="p-2 rounded-full hover:bg-[#F1F3F4] transit
<ExternalLink className="w-4 h-4" style={{ color: 'var(--gw-text-secondary)' }}
</button>
hover:
<button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full <span className="text-base">{darkMode ? " " : " "}</span>
</button>
<div className="hidden sm:flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-full
<span className="w-2 h-2 rounded-full heartbeat" style={{ background: riskColor
<span className="text-[11px] font-medium" style={{ color: riskColor }}>L{cityRi
</div>
</div>
</div>
</header>
? 'var
{/* SIDEBAR — Navigation Drawer */}
<aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-white overflow-y-auto trans
sidebarOpen ? "translate-x-0" : "-translate-x-full"
}`} style={{ borderRight: '1px solid var(--gw-border)', boxShadow: sidebarOpen <div className="p-4">
{/* Close + Logo */}
<div className="flex items-center gap-3 mb-6">
<button onClick={() => setSidebarOpen(false)} className="p-2 rounded-full hover
<X className="w-5 h-5" style={{ color: 'var(--gw-text-secondary)' }} />
</button>
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-lg flex items-center justify-center text-whit
<span style={{ fontFamily: "'Google Sans', sans-serif", fontSize: "15px", fon
</div>
</div>
{/* Navigation Items */}
<div style={{ marginBottom: '24px' }}>
<p className="gw-overline" style={{ padding: '0 12px', marginBottom: '8px' }}>N
{TAB_KEYS.map(tk => (
<button key={tk.key} onClick={() => { setTab(tk.key); setSidebarOpen(false);
className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-[14
style={{
fontFamily: "'Google Sans', sans-serif", fontWeight: 500,
background: tab === tk.key ? 'var(--gw-blue-surface)' : 'transparent',
color: tab === tk.key ? 'var(--gw-blue-text)' : 'var(--gw-text-secondary)
}}>
<span className="text-lg">{tk.emoji}</span>{tk.shortLabel}
</button>
))}
</div>
{/* Demo Mode */}
<div style={{ marginBottom: '24px' }}>
<p className="gw-overline" style={{ padding: '0 12px', marginBottom: '8px' }}>D
<div style={{ padding: '12px', background: 'var(--gw-surface)', borderRadius: '
<p style={{ fontSize: '12px', color: 'var(--gw-text-tertiary)', marginBottom:
<div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
{[
{ lv: null, label: "Live", color: "#5F6368", bg: "#F1F3F4" },
{ lv: 1, label: "L1", color: "#fff", bg: "#188038" },
{ lv: 2, label: "L2", color: "#fff", bg: "#34A853" },
{ lv: 3, label: "L3", color: "#fff", bg: "#FBBC04" },
{ lv: 4, label: "L4", color: "#fff", bg: "#E37400" },
{ lv: 5, label: "L5", color: "#fff", bg: "#D93025" },
].map(d => (
<button key={d.label} onClick={() => { setDemoLevel(d.lv); setSidebarOpen
style={{ padding: '6px 14px', borderRadius: 'var(--gw-radius-full)', fo
{d.label}
</button>
))}
</div>
</div>
</div>
{/* Emergency Contacts */}
{countryData?.civilDefense && (
<div style={{ padding: '12px', background: 'var(--gw-red-surface)', borderRadiu
<p className="gw-overline" style={{ marginBottom: '6px', color: 'var(--gw-red
<p style={{ fontSize: '13px', fontWeight: 500 }}> {countryData.emergency}</
<p style={{ fontSize: '12px', color: 'var(--gw-text-secondary)', marginTop: '
</div>
)}
</div>
</aside>
{sidebarOpen && <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSid
<main className="flex-1 min-w-0 p-4 sm:p-6 max-w-4xl mx-auto">
{tab === "dashboard" && <DashboardTab country={selCountry} city={selCity} lang={lan
{tab === "analysis" && <FullAnalysisTab />}
{tab === "ai" && <AIAnalystTab country={selCountry} city={selCity} resStatus={resSt
{tab === "intel" && (<div className="space-y-6"><LiveIntelTab /><div className="bor
{tab === "shouldigo" && <ShouldIGoTab conflictDay={CONFLICT_DAY} casualties={{ kill
{tab === "emergency" && <EmergencyTab />}
</main>
</div>
);
}