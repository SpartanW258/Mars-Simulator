
"use strict";

// Mars Üssü Planlayıcısı
// Tüm kaynak katsayıları konsept planlama varsayımlarıdır.

const ASSUMPTIONS = {
  waterLitersPerPersonPerDay: 5,
  foodKgPerPersonPerDay: 1.8,
  energyKwhPerPersonPerDay: 10
};

const crewInput = document.querySelector("#crew-size");
const missionInput = document.querySelector("#mission-days");
const calculateButton = document.querySelector("#calculate-button");
const results = document.querySelector("#results");
const moduleForm = document.querySelector("#module-form");
const moduleSummary = document.querySelector("#module-summary");

function readPositiveInteger(input, label, maximum) {
  const value = Number(input.value);

  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > maximum
  ) {
    throw new Error(
      `${label}, 1 ile ${maximum} arasında bir tam sayı olmalıdır.`
    );
  }

  return value;
}

function formatNumber(value, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits
  }).format(value);
}

function calculateResources(crew, days) {
  return {
    water: crew * days * ASSUMPTIONS.waterLitersPerPersonPerDay,
    food: crew * days * ASSUMPTIONS.foodKgPerPersonPerDay,
    energy: crew * days * ASSUMPTIONS.energyKwhPerPersonPerDay
  };
}

function showMessage(container, message) {
  container.replaceChildren();
  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  container.appendChild(paragraph);
}

if (calculateButton && crewInput && missionInput && results) {
  calculateButton.addEventListener("click", () => {
    try {
      const crew = readPositiveInteger(
        crewInput,
        "Mürettebat sayısı",
        12
      );

      const days = readPositiveInteger(
        missionInput,
        "Görev süresi",
        3650
      );

      const resources = calculateResources(crew, days);

      results.replaceChildren();

      const heading = document.createElement("h3");
      heading.textContent = "Tahmini kaynak ihtiyacı";
      results.appendChild(heading);

      const list = document.createElement("ul");

      const items = [
        `Su: ${formatNumber(resources.water)} litre`,
        `Yiyecek: ${formatNumber(resources.food)} kg`,
        `Enerji: ${formatNumber(resources.energy)} kWh`
      ];

      for (const item of items) {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      }

      results.appendChild(list);

      const note = document.createElement("p");
      note.textContent =
        "Sonuçlar basitleştirilmiş konsept tahminleridir. " +
        "Geri dönüşüm, kayıplar, yedekler ve gerçek sistem verimleri hesaba katılmamıştır.";
      results.appendChild(note);
    } catch (error) {
      showMessage(results, error.message);
    }
  });
}

if (moduleForm && moduleSummary) {
  moduleForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedModules = Array.from(
      moduleForm.querySelectorAll('input[name="module"]:checked')
    ).map((input) => input.value);

    if (selectedModules.length === 0) {
      showMessage(
        moduleSummary,
        "Lütfen üs için en az bir modül seç."
      );
      return;
    }

    moduleSummary.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = "Seçilen modüller";
    moduleSummary.appendChild(heading);

    const list = document.createElement("ul");

    for (const name of selectedModules) {
      const item = document.createElement("li");
      item.textContent = name;
      list.appendChild(item);
    }

    moduleSummary.appendChild(list);
  });
}



const layoutModule = document.querySelector("#layout-module");
const layoutGrid = document.querySelector("#base-grid");
const clearLayoutButton = document.querySelector("#clear-layout");
const layoutStatus = document.querySelector("#layout-status");

if (layoutModule && layoutGrid && clearLayoutButton && layoutStatus) {
  const placements = new Map();

  function updateLayoutStatus(message) {
    layoutStatus.textContent = message;
  }

  layoutGrid.addEventListener("click", (event) => {
    const cell = event.target.closest(".grid-cell");

    if (!cell) return;

    const cellId = cell.dataset.cell;

    if (placements.has(cellId)) {
      updateLayoutStatus(
        "Bu hücre dolu. Başka bir boş hücre seç veya yerleşimi temizle."
      );
      return;
    }

    const moduleName = layoutModule.value;
    placements.set(cellId, moduleName);

    cell.textContent = moduleName;
    cell.classList.add("occupied");
    cell.setAttribute(
      "aria-label",
      `Hücre ${Number(cellId) + 1}: ${moduleName}`
    );

    updateLayoutStatus(
      `${moduleName} modülü yerleşime eklendi. ` +
      `Dolu hücre sayısı: ${placements.size}/9.`
    );
  });

  clearLayoutButton.addEventListener("click", () => {
    placements.clear();

    layoutGrid.querySelectorAll(".grid-cell").forEach((cell) => {
      cell.textContent = "+";
      cell.classList.remove("occupied");
      cell.setAttribute(
        "aria-label",
        `Hücre ${Number(cell.dataset.cell) + 1}, boş`
      );
    });

    updateLayoutStatus("Yerleşim temizlendi.");
  });
}
