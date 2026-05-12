const SECTIONS = [
  { code: "FWC", name: "FIFA World Cup", flag: "🏆", start: 0,  end: 19 },
  { code: "MEX", name: "Mexic",             flag: "🇲🇽", start: 1, end: 20 },
  { code: "RSA", name: "Africa de Sud",     flag: "🇿🇦", start: 1, end: 20 },
  { code: "KOR", name: "Coreea de Sud",     flag: "🇰🇷", start: 1, end: 20 },
  { code: "CZE", name: "Cehia",             flag: "🇨🇿", start: 1, end: 20 },
  { code: "CAN", name: "Canada",            flag: "🇨🇦", start: 1, end: 20 },
  { code: "BIH", name: "Bosnia",            flag: "🇧🇦", start: 1, end: 20 },
  { code: "QAT", name: "Qatar",             flag: "🇶🇦", start: 1, end: 20 },
  { code: "SUI", name: "Elveția",           flag: "🇨🇭", start: 1, end: 20 },
  { code: "BRA", name: "Brazilia",          flag: "🇧🇷", start: 1, end: 20 },
  { code: "MAR", name: "Maroc",             flag: "🇲🇦", start: 1, end: 20 },
  { code: "HAI", name: "Haiti",             flag: "🇭🇹", start: 1, end: 20 },
  { code: "SCO", name: "Scoția",            flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", start: 1, end: 20 },
  { code: "USA", name: "USA",               flag: "🇺🇸", start: 1, end: 20 },
  { code: "PAR", name: "Paraguay",          flag: "🇵🇾", start: 1, end: 20 },
  { code: "AUS", name: "Australia",         flag: "🇦🇺", start: 1, end: 20 },
  { code: "TUR", name: "Turcia",            flag: "🇹🇷", start: 1, end: 20 },
  { code: "GER", name: "Germania",          flag: "🇩🇪", start: 1, end: 20 },
  { code: "CUW", name: "Curaçao",           flag: "🇨🇼", start: 1, end: 20 },
  { code: "CIV", name: "Coasta de Fildeș", flag: "🇨🇮", start: 1, end: 20 },
  { code: "ECU", name: "Ecuador",           flag: "🇪🇨", start: 1, end: 20 },
  { code: "NED", name: "Olanda",            flag: "🇳🇱", start: 1, end: 20 },
  { code: "JPN", name: "Japonia",           flag: "🇯🇵", start: 1, end: 20 },
  { code: "SWE", name: "Suedia",            flag: "🇸🇪", start: 1, end: 20 },
  { code: "TUN", name: "Tunisia",           flag: "🇹🇳", start: 1, end: 20 },
  { code: "BEL", name: "Belgia",            flag: "🇧🇪", start: 1, end: 20 },
  { code: "EGY", name: "Egipt",             flag: "🇪🇬", start: 1, end: 20 },
  { code: "IRN", name: "Iran",              flag: "🇮🇷", start: 1, end: 20 },
  { code: "NZL", name: "Noua Zeelandă",     flag: "🇳🇿", start: 1, end: 20 },
  { code: "ESP", name: "Spania",            flag: "🇪🇸", start: 1, end: 20 },
  { code: "CPV", name: "Capul Verde",       flag: "🇨🇻", start: 1, end: 20 },
  { code: "KSA", name: "Arabia Saudită",    flag: "🇸🇦", start: 1, end: 20 },
  { code: "URU", name: "Uruguay",           flag: "🇺🇾", start: 1, end: 20 },
  { code: "FRA", name: "Franța",            flag: "🇫🇷", start: 1, end: 20 },
  { code: "SEN", name: "Senegal",           flag: "🇸🇳", start: 1, end: 20 },
  { code: "IRQ", name: "Irak",              flag: "🇮🇶", start: 1, end: 20 },
  { code: "NOR", name: "Norvegia",          flag: "🇳🇴", start: 1, end: 20 },
  { code: "ARG", name: "Argentina",         flag: "🇦🇷", start: 1, end: 20 },
  { code: "ALG", name: "Algeria",           flag: "🇩🇿", start: 1, end: 20 },
  { code: "AUT", name: "Austria",           flag: "🇦🇹", start: 1, end: 20 },
  { code: "JOR", name: "Iordania",          flag: "🇯🇴", start: 1, end: 20 },
  { code: "POR", name: "Portugalia",        flag: "🇵🇹", start: 1, end: 20 },
  { code: "COD", name: "RD Congo",          flag: "🇨🇩", start: 1, end: 20 },
  { code: "UZB", name: "Uzbekistan",        flag: "🇺🇿", start: 1, end: 20 },
  { code: "COL", name: "Columbia",          flag: "🇨🇴", start: 1, end: 20 },
  { code: "ENG", name: "Anglia",            flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", start: 1, end: 20 },
  { code: "CRO", name: "Croația",           flag: "🇭🇷", start: 1, end: 20 },
  { code: "GHA", name: "Ghana",             flag: "🇬🇭", start: 1, end: 20 },
  { code: "PAN", name: "Panama",            flag: "🇵🇦", start: 1, end: 20 },
  { code: "CC",  name: "Coca-Cola",         flag: "🥤", start: 1, end: 14 },
];

const STORAGE_KEY = "panini-wc26-data";

function allStickerCodes() {
  const out = [];
  for (const s of SECTIONS) {
    for (let i = s.start; i <= s.end; i++) out.push(s.code + i);
  }
  return out;
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, updated: null, stickers: {} };
    const d = JSON.parse(raw);
    if (!d.stickers || typeof d.stickers !== "object") throw new Error("bad shape");
    return d;
  } catch {
    return { version: 1, updated: null, stickers: {} };
  }
}

function saveData(data) {
  data.updated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getState(data, code) {
  return data.stickers[code] || "missing";
}

function cycleState(data, code) {
  const cur = getState(data, code);
  const next = cur === "missing" ? "have" : cur === "have" ? "dup" : "missing";
  if (next === "missing") delete data.stickers[code];
  else data.stickers[code] = next;
  saveData(data);
  return next;
}
