"use strict";

const ASSUMPTIONS = {
  waterLitersPerPersonPerDay: 5,
  foodKgPerPersonPerDay: 1.8,
  energyKwhPerPersonPerDay: 10
};

const translations = {
  tr: {
    program:"MARS KEŞİF PROGRAMI", title:"Mars Üssü Planlayıcısı",
    subtitle:"Dört kişilik ekibin yaşam alanını ve kaynaklarını planla.",
    missionSummary:"Görev Özeti", missionDescription:"Görev: Mars yüzeyinde sürdürülebilir bir üs tasarlamak.",
    crewDescription:"Ekip büyüklüğü: Bu değeri aşağıdaki alandan değiştirebilirsin.",
    statusLabel:"Durum:", statusValue:"Ön planlama", crewHeading:"Mürettebat ve Görev Süresi",
    crewLabel:"Mürettebat sayısı (1–12)", daysLabel:"Görev süresi (gün, 1–3650)",
    calculate:"Kaynakları Hesapla", calculateHint:"Kaynak tahminini görmek için hesaplama düğmesine bas.",
    modulesHeading:"Üs Modülleri", modulesDescription:"Üssünde bulunmasını istediğin bölümleri seç.",
    plannedModules:"Planlanan modüller", habitat:"Yaşam alanı", lab:"Bilim laboratuvarı",
    greenhouse:"Seracılık alanı", energy:"Enerji merkezi", water:"Su arıtma bölümü",
    storage:"Depolama alanı", planModules:"Modülleri Planla", modulesHint:"Seçtiğin modüller burada listelenecek.",
    resourcesHeading:"Kaynak Planlaması", resourcesDescription:"Bu sürüm su, yiyecek ve enerji için basitleştirilmiş tahminler yapar.",
    assumptionsNote:"Kullanılan kişi başı günlük katsayılar konsept amaçlıdır; gerçek bir Mars görevinin gereksinimleri olarak değerlendirilmemelidir.",
    layoutHeading:"Üs Yerleşim Planı", layoutDescription:"Aşağıdan bir modül seç ve ızgarada uygun bir hücreye yerleştir. Bu görünüm kavramsal bir yerleşim taslağıdır.",
    chooseModule:"Yerleştirilecek modül", clearLayout:"Yerleşimi Temizle", layoutHint:"Henüz hiçbir modül yerleştirilmedi.",
    footerTitle:"Mars Üssü Planlayıcısı — Eğitim ve konsept tasarım projesi.",
    footerNote:"Sonuçlar gerçek görev verileri veya doğrulanmış mühendislik hesapları değildir.",
    invalidCrew:"Mürettebat sayısı 1 ile 12 arasında bir tam sayı olmalıdır.",
    invalidDays:"Görev süresi 1 ile 3650 arasında bir tam sayı olmalıdır.",
    resultHeading:"Tahmini kaynak ihtiyacı", waterResult:"Su", foodResult:"Yiyecek", energyResult:"Enerji",
    liters:"litre", kg:"kg", kwh:"kWh",
    resultNote:"Sonuçlar basitleştirilmiş konsept tahminleridir. Geri dönüşüm, kayıplar, yedekler ve gerçek sistem verimleri hesaba katılmamıştır.",
    selectModuleError:"Lütfen üs için en az bir modül seç.", selectedModules:"Seçilen modüller",
    occupied:"Bu hücre dolu. Başka bir boş hücre seç veya yerleşimi temizle.",
    placed:"modülü yerleşime eklendi.", occupiedCount:"Dolu hücre sayısı",
    cleared:"Yerleşim temizlendi.", emptyCell:"boş", cell:"Hücre"
  },
  en: {
    program:"MARS EXPLORATION PROGRAM", title:"Mars Base Planner",
    subtitle:"Plan the living space and resources for a four-person crew.",
    missionSummary:"Mission Summary", missionDescription:"Mission: Design a sustainable base on the surface of Mars.",
    crewDescription:"Crew size: You can change this value below.",
    statusLabel:"Status:", statusValue:"Preliminary planning", crewHeading:"Crew and Mission Duration",
    crewLabel:"Crew size (1–12)", daysLabel:"Mission duration (days, 1–3650)",
    calculate:"Calculate Resources", calculateHint:"Press the calculate button to estimate resources.",
    modulesHeading:"Base Modules", modulesDescription:"Select the facilities you want at your base.",
    plannedModules:"Planned modules", habitat:"Habitat", lab:"Science laboratory",
    greenhouse:"Greenhouse", energy:"Power center", water:"Water treatment unit",
    storage:"Storage area", planModules:"Plan Modules", modulesHint:"Your selected modules will be listed here.",
    resourcesHeading:"Resource Planning", resourcesDescription:"This version provides simplified estimates for water, food, and energy.",
    assumptionsNote:"Daily per-person rates are conceptual assumptions and should not be treated as requirements for a real Mars mission.",
    layoutHeading:"Base Layout", layoutDescription:"Choose a module below and place it in an available grid cell. This is a conceptual layout.",
    chooseModule:"Module to place", clearLayout:"Clear Layout", layoutHint:"No modules have been placed yet.",
    footerTitle:"Mars Base Planner — An educational concept-design project.",
    footerNote:"Results are not real mission data or validated engineering calculations.",
    invalidCrew:"Crew size must be a whole number between 1 and 12.",
    invalidDays:"Mission duration must be a whole number between 1 and 3650.",
    resultHeading:"Estimated resource requirements", waterResult:"Water", foodResult:"Food", energyResult:"Energy",
    liters:"liters", kg:"kg", kwh:"kWh",
    resultNote:"These are simplified conceptual estimates. Recycling, losses, reserves, and actual system efficiencies are not included.",
    selectModuleError:"Please select at least one base module.", selectedModules:"Selected modules",
    occupied:"This cell is occupied. Choose another empty cell or clear the layout.",
    placed:"module added to the layout.", occupiedCount:"Occupied cells",
    cleared:"Layout cleared.", emptyCell:"empty", cell:"Cell"
  }
};

const moduleKeys = ["habitat","lab","greenhouse","energy","water","storage"];
let hasCalculated = false;
let hasSubmittedModules = false;
let layoutStatusKey = "layoutHint";
let layoutStatusModule = null;
let currentLanguage = localStorage.getItem("marsPlannerLanguage") || "tr";
if (!translations[currentLanguage]) currentLanguage = "tr";

const crewInput = document.querySelector("#crew-size");
const missionInput = document.querySelector("#mission-days");
const calculateButton = document.querySelector("#calculate-button");
const results = document.querySelector("#results");
const moduleForm = document.querySelector("#module-form");
const moduleSummary = document.querySelector("#module-summary");
const layoutModule = document.querySelector("#layout-module");
const layoutGrid = document.querySelector("#base-grid");
const clearLayoutButton = document.querySelector("#clear-layout");
const layoutStatus = document.querySelector("#layout-status");

function t(key) { return translations[currentLanguage][key] || translations.tr[key] || key; }
function moduleName(key) { return t(key); }
function formatNumber(value) {
  return new Intl.NumberFormat(currentLanguage === "tr" ? "tr-TR" : "en-US", {maximumFractionDigits:1}).format(value);
}
function showMessage(container, message) {
  container.replaceChildren();
  const p = document.createElement("p");
  p.textContent = message;
  container.appendChild(p);
}
function readInteger(input, min, max, errorKey) {
  const value = Number(input.value);
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(t(errorKey));
  return value;
}
function calculateResources(crew, days) {
  return {
    water: crew * days * ASSUMPTIONS.waterLitersPerPersonPerDay,
    food: crew * days * ASSUMPTIONS.foodKgPerPersonPerDay,
    energy: crew * days * ASSUMPTIONS.energyKwhPerPersonPerDay
  };
}
function renderResults() {
  if (!results) return;
  hasCalculated = true;
  try {
    const crew = readInteger(crewInput,1,12,"invalidCrew");
    const days = readInteger(missionInput,1,3650,"invalidDays");
    const r = calculateResources(crew,days);
    results.replaceChildren();
    const h = document.createElement("h3"); h.textContent = t("resultHeading"); results.appendChild(h);
    const ul = document.createElement("ul");
    [ `${t("waterResult")}: ${formatNumber(r.water)} ${t("liters")}`,
      `${t("foodResult")}: ${formatNumber(r.food)} ${t("kg")}`,
      `${t("energyResult")}: ${formatNumber(r.energy)} ${t("kwh")}` ].forEach(text => {
      const li = document.createElement("li"); li.textContent = text; ul.appendChild(li);
    });
    results.appendChild(ul);
    const note = document.createElement("p"); note.textContent = t("resultNote"); results.appendChild(note);
  } catch (e) { showMessage(results,e.message); }
}
function renderModuleSummary() {
  if (!moduleSummary || !moduleForm) return;
  hasSubmittedModules = true;
  const selected = Array.from(moduleForm.querySelectorAll('input[name="module"]:checked')).map(i=>i.value);
  if (!selected.length) { showMessage(moduleSummary,t("selectModuleError")); return; }
  moduleSummary.replaceChildren();
  const h=document.createElement("h3"); h.textContent=t("selectedModules"); moduleSummary.appendChild(h);
  const ul=document.createElement("ul");
  selected.forEach(key=>{const li=document.createElement("li");li.textContent=moduleName(key);ul.appendChild(li);});
  moduleSummary.appendChild(ul);
}
function updateLayoutText() {
  if (!layoutGrid) return;
  const placements = updateLayoutText.placements;
  layoutGrid.querySelectorAll(".grid-cell").forEach(cell=>{
    const id=cell.dataset.cell;
    const key=placements.get(id);
    cell.textContent=key ? moduleName(key) : "+";
    cell.classList.toggle("occupied", Boolean(key));
    cell.setAttribute("aria-label",`${t("cell")} ${Number(id)+1}, ${key ? moduleName(key) : t("emptyCell")}`);
  });
}
updateLayoutText.placements = new Map();
function renderLayoutStatus() {
  if (!layoutStatus) return;
  if (layoutStatusKey === "placed" && layoutStatusModule) {
    layoutStatus.textContent = `${moduleName(layoutStatusModule)} ${t("placed")} ${t("occupiedCount")}: ${updateLayoutText.placements.size}/9.`;
  } else if (layoutStatusKey === "occupied") {
    layoutStatus.textContent = t("occupied");
  } else {
    layoutStatus.textContent = t(layoutStatusKey);
  }
}
function applyLanguage(lang) {
  if (!translations[lang]) lang = "tr";
  currentLanguage = lang;
  localStorage.setItem("marsPlannerLanguage",lang);
  document.documentElement.lang=lang;
  document.title=t("title");
  const description=document.querySelector('meta[name="description"]');
  if (description) description.content = lang === "tr" ? "Mars kolonisi için üs ve kaynak planlama uygulaması." : "A base and resource planning app for a Mars colony.";
  const languageGroup=document.querySelector(".language-switch");
  if (languageGroup) languageGroup.setAttribute("aria-label", lang === "tr" ? "Dil seçimi" : "Language selection");
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key=el.dataset.i18n;
    if (translations[lang][key]) el.textContent=translations[lang][key];
  });
  document.querySelectorAll("[data-language]").forEach(btn=>{
    const active=btn.dataset.language===lang;
    btn.classList.toggle("active",active);
    btn.setAttribute("aria-pressed",String(active));
  });
  if (hasCalculated) renderResults();
  if (hasSubmittedModules) renderModuleSummary();
  updateLayoutText();
  renderLayoutStatus();
}
document.querySelectorAll("[data-language]").forEach(btn=>btn.addEventListener("click",()=>applyLanguage(btn.dataset.language)));
if (calculateButton) calculateButton.addEventListener("click",renderResults);
if (moduleForm) moduleForm.addEventListener("submit",e=>{e.preventDefault();renderModuleSummary();});
if (layoutGrid) layoutGrid.addEventListener("click",e=>{
  const cell=e.target.closest(".grid-cell"); if(!cell) return;
  const placements=updateLayoutText.placements, id=cell.dataset.cell;
  if(placements.has(id)){layoutStatusKey="occupied"; layoutStatusModule=null; renderLayoutStatus(); return;}
  const key=layoutModule.value; placements.set(id,key);
  layoutStatusKey="placed"; layoutStatusModule=key;
  updateLayoutText();
  renderLayoutStatus();
});
if (clearLayoutButton) clearLayoutButton.addEventListener("click",()=>{
  updateLayoutText.placements.clear(); updateLayoutText();
  layoutStatusKey="cleared"; layoutStatusModule=null;
  renderLayoutStatus();
});
applyLanguage(currentLanguage);
