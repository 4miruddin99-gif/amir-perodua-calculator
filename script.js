const STORAGE_KEY = "amirPeroduaCarsCleanV2";

const defaultCars = [
  {
    id:"bezza",
    name:"BEZZA",
    priceMin:36197,
    priceMax:52047,
    rebate:0,
    image:"images/bezza.jpg",
    variants:[
      {name:"1.0 G MT",price:36197},
      {name:"1.0 G AT",price:38000},
      {name:"1.3 X AT",price:44000},
      {name:"1.3 AV AT",price:52047}
    ]
  },
  {
    id:"axia",
    name:"AXIA",
    priceMin:23276,
    priceMax:51054,
    rebate:0,
    image:"images/axia.jpg",
    variants:[
      {name:"1.0 E MT",price:23276},
      {name:"1.0 G AT",price:38000},
      {name:"1.0 X AT",price:44000},
      {name:"1.0 SE AT",price:51054}
    ]
  },
  {
    id:"myvi",
    name:"MYVI",
    priceMin:48474,
    priceMax:62302,
    rebate:0,
    image:"images/myvi.jpg",
    variants:[
      {name:"1.3 G CVT",price:48474},
      {name:"1.3 X CVT",price:51900},
      {name:"1.5 X CVT",price:55900},
      {name:"1.5 H CVT",price:59900},
      {name:"1.5 AV CVT",price:62302}
    ]
  },
  {
    id:"alza",
    name:"ALZA",
    priceMin:64993,
    priceMax:78358,
    rebate:0,
    image:"images/alza.jpg",
    variants:[
      {name:"1.5 X",price:64993},
      {name:"1.5 H",price:70993},
      {name:"1.5 AV",price:78358}
    ]
  },
  {
    id:"ativa",
    name:"ATIVA",
    priceMin:61919,
    priceMax:76127,
    rebate:0,
    image:"images/ativa.jpg",
    variants:[
      {name:"1.0 X Metallic",price:61919},
      {name:"1.0 H Metallic",price:69859},
      {name:"1.0 H S/Metallic",price:70387},
      {name:"1.0 AV Metallic",price:75299},
      {name:"1.0 AV S/Metallic",price:75827},
      {name:"1.0 AV 2T S/Metallic",price:76127}
    ]
  },
  {
    id:"aruz",
    name:"ARUZ",
    priceMin:75762,
    priceMax:80902,
    rebate:0,
    image:"images/aruz.jpg",
    variants:[
      {name:"1.5 X",price:75762},
      {name:"1.5 AV",price:80902}
    ]
  },
  {
    id:"traz",
    name:"TRAZ",
    priceMin:79056,
    priceMax:85124,
    rebate:0,
    image:"images/traz.jpg",
    variants:[
      {name:"1.5 X",price:79056},
      {name:"1.5 H",price:82000},
      {name:"1.5 AV",price:85124}
    ]
  }
];

let cars = loadCars();
let selectedYears = 9;
let salary = 0;

const annualRate = 0.0325;

function loadCars(){
  try{
    const saved = localStorage.getItem(STORAGE_KEY);

    if(saved){
      const parsed = JSON.parse(saved);

      if(Array.isArray(parsed) && parsed.length > 0){
        return parsed;
      }
    }
  }catch(e){
    console.log("Load error:",e);
  }

  return JSON.parse(JSON.stringify(defaultCars));
}

function saveCars(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(cars));
}

function money(value){
  return "RM " + Number(value || 0).toLocaleString("en-MY",{
    minimumFractionDigits:0,
    maximumFractionDigits:0
  });
}

function getMonthly(price,years){
  const totalInterest = price * annualRate * years;
  const totalPayment = price + totalInterest;

  return totalPayment / (years * 12);
}

function getLimit(){
  return salary > 0 ? salary / 3 : 0;
}

function getNetPrice(car,variant){
  return Math.max(0,variant.price - Number(car.rebate || 0));
}

function calculateEligibility(car,variant){
  if(!salary) return false;

  const price = getNetPrice(car,variant);
  const monthly = getMonthly(price,selectedYears);

  return monthly <= getLimit();
}

function formatRange(min,max){
  return money(min) + " – " + money(max);
}

function updateLimit(){
  const el = document.getElementById("limitValue");

  if(!el) return;

  if(salary > 0){
    el.textContent = money(getLimit());
  }else{
    el.textContent = "RM 0";
  }
}

function updateStatus(){
  let passModels = 0;
  let failModels = 0;

  cars.forEach(car=>{
    const eligible = car.variants.filter(v =>
      calculateEligibility(car,v)
    );

    if(eligible.length > 0){
      passModels++;
    }else{
      failModels++;
    }
  });

  const el = document.getElementById("statusText");

  if(el){
    el.innerHTML =
      `<span class="pass-text">${passModels} model LULUS</span>
       •
       <span class="fail-text">${failModels} model GAGAL</span>`;
  }
}

function renderModels(){
  const grid = document.getElementById("modelGrid");

  if(!grid) return;

  grid.innerHTML = "";

  cars.forEach(car=>{

    const eligible = car.variants.filter(v =>
      calculateEligibility(car,v)
    );

    const isPass = eligible.length > 0;

    const lowestMonthly = Math.min(
      ...car.variants.map(v =>
        getMonthly(getNetPrice(car,v),selectedYears)
      )
    );

    const card = document.createElement("div");

    card.className =
      "car-card " + (isPass ? "pass" : "");

    card.onclick = () => openDetail(car.id);

    const imageHTML = car.image
      ? `<img src="${car.image}"
          alt="${car.name}"
          onerror="this.style.display='none';this.parentElement.innerHTML='<div class=&quot;car-emoji&quot;>🚗</div>';">`
      : `<div class="car-emoji">🚗</div>`;

    card.innerHTML = `
      <div class="car-image">
        ${imageHTML}
      </div>

      <div class="car-info">

        <div class="car-name">
          ${car.name}
        </div>

        <div class="car-price">
          ${formatRange(car.priceMin,car.priceMax)}
        </div>

        <div class="car-rebate">
          Rebat: ${money(car.rebate || 0)}
        </div>

        <div class="car-month">
          ${money(lowestMonthly)}
          <small>/bulan • ${selectedYears} tahun</small>
        </div>

        <div class="result-badge ${
          isPass ? "badge-pass" : "badge-fail"
        }">

          ${
            isPass
              ? `✓ LULUS • ${eligible.length} varian`
              : `✕ GAGAL`
          }

        </div>

      </div>
    `;

    grid.appendChild(card);
  });

  updateStatus();
  updateLimit();
}

function setYears(years){
  selectedYears = years;

  document.querySelectorAll(".year-btn").forEach(btn=>{
    btn.classList.toggle(
      "active",
      Number(btn.dataset.year) === years
    );
  });

  renderModels();
}

function handleSalaryInput(value){
  const cleaned = String(value).replace(/[^\d]/g,"");

  salary = Number(cleaned || 0);

  const input = document.getElementById("salaryInput");

  if(input && input.value !== cleaned){
    input.value = cleaned;
  }

  updateLimit();
  renderModels();
}

function clearSalary(){
  salary = 0;

  const input = document.getElementById("salaryInput");

  if(input){
    input.value = "";
  }

  renderModels();
}

function openDetail(id){
  const car = cars.find(c => c.id === id);

  if(!car) return;

  const modal = document.getElementById("detailModal");
  const title = document.getElementById("detailTitle");
  const subtitle = document.getElementById("detailSubtitle");
  const content = document.getElementById("variantList");

  if(!modal || !content) return;

  if(title){
    title.textContent = car.name;
  }

  if(subtitle){
    subtitle.textContent =
      `${formatRange(car.priceMin,car.priceMax)} • Rebat ${money(car.rebate || 0)}`;
  }

  content.innerHTML = "";

  car.variants.forEach(variant=>{

    const netPrice = getNetPrice(car,variant);
    const monthly = getMonthly(netPrice,selectedYears);
    const pass = calculateEligibility(car,variant);

    const row = document.createElement("div");

    row.className =
      "variant-row " +
      (pass ? "" : "fail-variant");

    row.innerHTML = `
      <div>
        <div class="variant-name">
          ${variant.name}
        </div>

        <div class="variant-price">
          Harga selepas rebate:
          ${money(netPrice)}
        </div>

        <div class="${
          pass
          ? "variant-status-pass"
          : "variant-status-fail"
        }">
          ${pass ? "✓ LULUS" : "✕ GAGAL"}
        </div>
      </div>

      <div class="variant-month">
        ${money(monthly)}
        <small>/bulan</small>
      </div>
    `;

    content.appendChild(row);
  });

  modal.style.display = "block";
}

function closeModal(id){
  const modal = document.getElementById(id);

  if(modal){
    modal.style.display = "none";
  }
}

function openCalculator(){
  const modal = document.getElementById("calculatorModal");

  if(modal){
    modal.style.display = "block";
  }

  const priceInput =
    document.getElementById("calcPrice");

  if(priceInput && cars.length){
    priceInput.value = cars[0].variants[0].price;
  }

  calculateLoan();
}

function calculateLoan(){

  const priceInput =
    document.getElementById("calcPrice");

  const yearsInput =
    document.getElementById("calcYears");

  const dpInput =
    document.getElementById("calcDp");

  const result =
    document.getElementById("calcResult");

  const detail =
    document.getElementById("calcDetail");

  if(!priceInput || !result) return;

  const price =
    Number(priceInput.value || 0);

  const years =
    Number(yearsInput?.value || selectedYears);

  const dpPercent =
    Number(dpInput?.value || 10);

  const downPayment =
    price * dpPercent / 100;

  const loan =
    Math.max(0,price - downPayment);

  const totalInterest =
    loan * annualRate * years;

  const totalPayment =
    loan + totalInterest;

  const monthly =
    totalPayment / (years * 12);

  result.textContent = money(monthly);

  if(detail){
    detail.innerHTML =
      `Harga: ${money(price)}<br>
       DP ${dpPercent}%: ${money(downPayment)}<br>
       Jumlah pinjaman: ${money(loan)}<br>
       Kadar anggaran: ${(annualRate * 100).toFixed(2)}% setahun`;
  }
}

function openInfo(){
  const modal =
    document.getElementById("infoModal");

  if(modal){
    modal.style.display = "block";
  }
}

function openSettings(){
  const modal =
    document.getElementById("settingsModal");

  if(!modal) return;

  renderSettings();

  modal.style.display = "block";
}

function renderSettings(){

  const container =
    document.getElementById("settingsContent");

  if(!container) return;

  container.innerHTML = "";

  cars.forEach(car=>{

    const card =
      document.createElement("div");

    card.className = "setting-card";

    card.innerHTML = `
      <h3>${car.name}</h3>

      <label>Nama Model</label>
      <input
        type="text"
        value="${car.name}"
        data-name="${car.id}"
      >

      <div class="setting-row">

        <div>
          <label>Harga Minimum</label>
          <input
            type="number"
            value="${car.priceMin}"
            data-min="${car.id}"
          >
        </div>

        <div>
          <label>Harga Maximum</label>
          <input
            type="number"
            value="${car.priceMax}"
            data-max="${car.id}"
          >
        </div>

      </div>

      <label>Rebat</label>
      <input
        type="number"
        value="${car.rebate || 0}"
        data-rebate="${car.id}"
      >

      <div class="image-preview">
        ${
          car.image
          ? `<img src="${car.image}" alt="${car.name}"
              onerror="this.outerHTML='<div class=&quot;preview-emoji&quot;>🚗</div>';">`
          : `<div class="preview-emoji">🚗</div>`
        }
      </div>

      <span class="small-note">
        ${car.variants.length} varian
      </span>

      <button
        class="save-btn"
        onclick="saveCarSettings('${car.id}')">
        SIMPAN ${car.name}
      </button>
    `;

    container.appendChild(card);
  });
}

function saveCarSettings(id){

  const car =
    cars.find(c => c.id === id);

  if(!car) return;

  const nameInput =
    document.querySelector(`[data-name="${id}"]`);

  const minInput =
    document.querySelector(`[data-min="${id}"]`);

  const maxInput =
    document.querySelector(`[data-max="${id}"]`);

  const rebateInput =
    document.querySelector(`[data-rebate="${id}"]`);

  if(nameInput){
    car.name =
      nameInput.value.trim() || car.name;
  }

  if(minInput){
    car.priceMin =
      Number(minInput.value || car.priceMin);
  }

  if(maxInput){
    car.priceMax =
      Number(maxInput.value || car.priceMax);
  }

  if(rebateInput){
    car.rebate =
      Math.max(0,Number(rebateInput.value || 0));
  }

  saveCars();

  renderSettings();
  renderModels();

  alert("Maklumat " + car.name + " berjaya disimpan.");
}

function resetCars(){

  if(!confirm(
    "Reset semua harga, rebate dan tetapan kepada asal?"
  )){
    return;
  }

  cars =
    JSON.parse(JSON.stringify(defaultCars));

  saveCars();

  renderSettings();
  renderModels();
}

function setNav(active){

  document.querySelectorAll(".nav-btn")
    .forEach(btn=>{
      btn.classList.remove("active");
    });

  const target =
    document.querySelector(
      `[data-nav="${active}"]`
    );

  if(target){
    target.classList.add("active");
  }
}

function closeAllModals(){
  document.querySelectorAll(".modal")
    .forEach(modal=>{
      modal.style.display = "none";
    });
}

document.addEventListener("DOMContentLoaded",()=>{

  const salaryInput =
    document.getElementById("salaryInput");

  if(salaryInput){

    salaryInput.addEventListener(
      "input",
      e => handleSalaryInput(e.target.value)
    );

  }

  document.querySelectorAll(".year-btn")
    .forEach(btn=>{

      btn.addEventListener("click",()=>{
        setYears(Number(btn.dataset.year));
      });

    });

  document.querySelectorAll(".modal")
    .forEach(modal=>{

      modal.addEventListener("click",e=>{
        if(e.target === modal){
          modal.style.display = "none";
        }
      });

    });

  renderModels();
  updateLimit();
});

window.setYears = setYears;
window.clearSalary = clearSalary;
window.openDetail = openDetail;
window.closeModal = closeModal;
window.openCalculator = openCalculator;
window.calculateLoan = calculateLoan;
window.openInfo = openInfo;
window.openSettings = openSettings;
window.saveCarSettings = saveCarSettings;
window.resetCars = resetCars;
window.setNav = setNav;
window.closeAllModals = closeAllModals;