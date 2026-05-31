export type Lang = "th" | "en";

const STORAGE_KEY = "appLanguage";

const translations = {
  th: {
    pageTitle: "Han - แชร์บิลง่าย ๆ",
    noIdMessage: "กรุณาตั้งค่าพร้อมเพย์ของคุณก่อน",
    total: "รวม:",
    people: "คน",
    perPerson: "ต่อคน",
    promptpayLabel: "พร้อมเพย์:",
    edit: "แก้ไข",
    close: "ปิด",
    qrError: "เกิดข้อผิดพลาดในการสร้าง QR code",
    amountLabel: "จำนวนเงิน (฿)",
    peopleLabel: "หารกันกี่คน ?",
    setupHeading: "ตั้งค่าพร้อมเพย์",
    promptpayId: "พร้อมเพย์",
    idPlaceholder: "เบอร์โทรศัพท์ หรือ เลขบัตรประชาชน",
    clearInput: "ล้างข้อมูล",
    idHint: "กรอกเบอร์โทรศัพท์หรือเลขบัตรประชาชนโดยไม่ต้องเว้นวรรคหรือใส่ขีด",
    labelOptional: "ป้ายกำกับ (ไม่บังคับ)",
    labelPlaceholder: "เช่น ส่วนตัว, ธุรกิจ",
    labelAria: "ป้ายกำกับ",
    clearLabel: "ล้างป้ายกำกับ",
    addId: "เพิ่มพร้อมเพย์",
    savedIds: "พร้อมเพย์ที่บันทึกไว้:",
    selected: "เลือกแล้ว",
    select: "เลือก",
    delete: "ลบ",
    idExists: "พร้อมเพย์นี้มีอยู่แล้ว",
  },
  en: {
    pageTitle: "Han - Split Bills Easily",
    noIdMessage: "Please set your PromptPay ID first",
    total: "Total:",
    people: "people",
    perPerson: "each",
    promptpayLabel: "PromptPay ID:",
    edit: "edit",
    close: "close",
    qrError: "Error rendering QR code",
    amountLabel: "Amount (฿)",
    peopleLabel: "How many people?",
    setupHeading: "Set up PromptPay",
    promptpayId: "PromptPay ID",
    idPlaceholder: "Phone number or National ID",
    clearInput: "Clear input",
    idHint: "Enter your phone number or national ID without spaces or dashes",
    labelOptional: "Label (optional)",
    labelPlaceholder: "e.g. Personal, Business",
    labelAria: "Label",
    clearLabel: "Clear label",
    addId: "Add PromptPay ID",
    savedIds: "Saved PromptPay IDs:",
    selected: "Selected",
    select: "Select",
    delete: "Delete",
    idExists: "This PromptPay ID already exists",
  },
} as const;

export type TransKey = keyof (typeof translations)["th"];

export function getLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "en" || stored === "th" ? stored : "th";
}

export function setLang(lang: Lang) {
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  document.title = t("pageTitle", lang);
  window.dispatchEvent(new CustomEvent("lang-change", { detail: { lang } }));
}

export function t(key: TransKey, lang: Lang = getLang()): string {
  return translations[lang][key];
}

export function onLangChange(cb: (lang: Lang) => void) {
  window.addEventListener("lang-change", ((e: CustomEvent) => {
    cb(e.detail.lang);
  }) as EventListener);
}
