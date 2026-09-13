/* ============================================================
   AMARA ESTATES — shared behaviour
   ============================================================ */

/* ---------- property dataset (demo inventory across Africa) ---------- */
const PROPERTIES = [
  {name:"The Kloof House", city:"Camps Bay, Cape Town", country:"South Africa", type:"Villa", price:1850000, currency:"USD", beds:5, tag:"Ocean-facing"},
  {name:"Marrakech Riad Amara", city:"Medina, Marrakech", country:"Morocco", type:"Riad", price:620000, currency:"USD", beds:4, tag:"Restored 1920s"},
  {name:"Lekki Lagoon Penthouse", city:"Lekki, Lagos", country:"Nigeria", type:"Penthouse", price:940000, currency:"USD", beds:3, tag:"Skyline views"},
  {name:"Karen Acacia Estate", city:"Karen, Nairobi", country:"Kenya", type:"Estate", price:1250000, currency:"USD", beds:6, tag:"2-acre grounds"},
  {name:"Zanzibar Stone Villa", city:"Stone Town, Zanzibar", country:"Tanzania", type:"Beach House", price:780000, currency:"USD", beds:4, tag:"Private beach"},
  {name:"Cantonments Townhouse", city:"Cantonments, Accra", country:"Ghana", type:"Townhouse", price:410000, currency:"USD", beds:3, tag:"Gated compound"},
  {name:"Sandton Sky Residence", city:"Sandton, Johannesburg", country:"South Africa", type:"Penthouse", price:990000, currency:"USD", beds:3, tag:"Rooftop pool"},
  {name:"Nile Corniche Apartment", city:"Zamalek, Cairo", country:"Egypt", type:"Apartment", price:365000, currency:"USD", beds:2, tag:"River views"},
  {name:"Kigali Hills Villa", city:"Nyarutarama, Kigali", country:"Rwanda", type:"Villa", price:560000, currency:"USD", beds:4, tag:"New build"},
  {name:"Diani Coast Bungalow", city:"Diani Beach", country:"Kenya", type:"Beach House", price:495000, currency:"USD", beds:3, tag:"Steps to sand"},
  {name:"Constantia Wine Estate", city:"Constantia, Cape Town", country:"South Africa", type:"Estate", price:2650000, currency:"USD", beds:7, tag:"Working vineyard"},
  {name:"Victoria Island Loft", city:"Victoria Island, Lagos", country:"Nigeria", type:"Apartment", price:340000, currency:"USD", beds:2, tag:"Design-led"},
  {name:"Essaouira Ocean Riad", city:"Essaouira", country:"Morocco", type:"Riad", price:295000, currency:"USD", beds:3, tag:"Rooftop terrace"},
  {name:"Entebbe Lakeside Villa", city:"Entebbe, Kampala", country:"Uganda", type:"Villa", price:430000, currency:"USD", beds:4, tag:"Lake Victoria frontage"},
];

function fmtPrice(n){
  return "$" + n.toLocaleString("en-US");
}

/* ============================================================
   Bespoke "Panavision" scene illustrations — flat SVG silhouettes
   standing in for photography, colour-graded to the site palette.
   Injected wherever a [data-scene] element is found.
   ============================================================ */
const SCENES = {
  skyline: `
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
      <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F2B705"/><stop offset=".55" stop-color="#E85D2C"/><stop offset="1" stop-color="#C6236F"/>
      </linearGradient></defs>
      <rect width="400" height="300" fill="url(#g1)"/>
      <circle cx="300" cy="90" r="58" fill="#F6EFE3" opacity=".85"/>
      <g fill="#241608" opacity=".92">
        <rect x="10" y="150" width="34" height="150"/>
        <rect x="50" y="110" width="26" height="190"/>
        <rect x="82" y="170" width="30" height="130"/>
        <rect x="118" y="90" width="22" height="210"/>
        <rect x="146" y="140" width="40" height="160"/>
        <rect x="192" y="60" width="24" height="240"/>
        <rect x="222" y="120" width="30" height="180"/>
        <rect x="258" y="180" width="26" height="120"/>
        <rect x="290" y="200" width="110" height="100"/>
      </g>
    </svg>`,
  riad: `
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
      <defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#9E1958"/><stop offset=".5" stop-color="#E85D2C"/><stop offset="1" stop-color="#F2B705"/>
      </linearGradient></defs>
      <rect width="400" height="300" fill="url(#g2)"/>
      <path d="M0 300 V190 Q200 90 400 190 V300 Z" fill="#241608" opacity=".9"/>
      <path d="M150 300 V210 Q200 165 250 210 V300 Z" fill="#F6EFE3" opacity=".18"/>
    </svg>`,
  coast: `
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
      <defs><linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F2B705"/><stop offset=".5" stop-color="#F3742E"/><stop offset="1" stop-color="#0B4F4A"/>
      </linearGradient></defs>
      <rect width="400" height="300" fill="url(#g3)"/>
      <circle cx="320" cy="70" r="40" fill="#F6EFE3" opacity=".8"/>
      <path d="M0 210 Q100 180 200 210 T400 210 V300 H0 Z" fill="#062E2B"/>
      <g stroke="#241608" stroke-width="6" opacity=".85" fill="none">
        <path d="M60 300 V180 Q40 150 70 120"/>
        <path d="M60 180 Q90 165 110 175"/>
        <path d="M60 150 Q30 140 15 155"/>
      </g>
    </svg>`,
  savanna: `
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
      <defs><linearGradient id="g4" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F2B705"/><stop offset=".6" stop-color="#E85D2C"/><stop offset="1" stop-color="#241608"/>
      </linearGradient></defs>
      <rect width="400" height="300" fill="url(#g4)"/>
      <circle cx="90" cy="80" r="46" fill="#F6EFE3" opacity=".75"/>
      <path d="M0 230 Q120 190 220 225 T400 220 V300 H0 Z" fill="#062E2B" opacity=".92"/>
      <g stroke="#241608" stroke-width="5" fill="none" opacity=".8">
        <path d="M300 230 V150"/>
        <path d="M300 175 Q260 165 250 140"/>
        <path d="M300 165 Q340 155 350 130"/>
        <path d="M300 150 Q270 140 262 120"/>
      </g>
    </svg>`,
  vineyard: `
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
      <defs><linearGradient id="g5" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#C6236F"/><stop offset=".6" stop-color="#E85D2C"/><stop offset="1" stop-color="#12655F"/>
      </linearGradient></defs>
      <rect width="400" height="300" fill="url(#g5)"/>
      <g stroke="#241608" stroke-width="4" opacity=".55">
        <path d="M0 230 L400 190"/><path d="M0 250 L400 212"/><path d="M0 270 L400 234"/><path d="M0 290 L400 256"/>
      </g>
      <path d="M40 300 L360 240 V300 Z" fill="#062E2B" opacity=".5"/>
    </svg>`,
  desert: `
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
      <defs><linearGradient id="g6" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F2B705"/><stop offset=".55" stop-color="#E85D2C"/><stop offset="1" stop-color="#9E1958"/>
      </linearGradient></defs>
      <rect width="400" height="300" fill="url(#g6)"/>
      <path d="M0 260 Q100 210 220 250 T400 240 V300 H0 Z" fill="#241608" opacity=".85"/>
      <path d="M0 280 Q150 240 280 275 T400 270 V300 H0 Z" fill="#062E2B" opacity=".7"/>
    </svg>`,
  river: `
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
      <defs><linearGradient id="g7" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F2B705"/><stop offset=".5" stop-color="#12655F"/><stop offset="1" stop-color="#062E2B"/>
      </linearGradient></defs>
      <rect width="400" height="300" fill="url(#g7)"/>
      <g fill="#241608" opacity=".9">
        <rect x="30" y="140" width="20" height="160"/><rect x="60" y="110" width="24" height="190"/>
        <rect x="96" y="160" width="18" height="140"/><rect x="330" y="120" width="22" height="180"/>
        <rect x="360" y="150" width="18" height="150"/>
      </g>
      <path d="M0 220 Q200 195 400 225 V300 H0 Z" fill="#F2B705" opacity=".2"/>
    </svg>`,
  lake: `
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
      <defs><linearGradient id="g8" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F3742E"/><stop offset=".5" stop-color="#C6236F"/><stop offset="1" stop-color="#062E2B"/>
      </linearGradient></defs>
      <rect width="400" height="300" fill="url(#g8)"/>
      <circle cx="200" cy="90" r="44" fill="#F6EFE3" opacity=".8"/>
      <path d="M0 240 Q200 210 400 240 V300 H0 Z" fill="#062E2B"/>
      <path d="M0 240 Q200 218 400 240" stroke="#F2B705" stroke-width="3" fill="none" opacity=".5"/>
    </svg>`,
};

function renderScenes(){
  document.querySelectorAll("[data-scene]").forEach(el=>{
    const key = el.getAttribute("data-scene");
    if(SCENES[key]) el.innerHTML = SCENES[key];
  });
}

/* ---------- mobile nav ---------- */
function initNav(){
  const toggle = document.querySelector(".nav-toggle");
  const sheet = document.querySelector(".mobile-sheet");
  if(toggle && sheet){
    toggle.addEventListener("click", ()=> sheet.classList.toggle("open"));
    sheet.querySelectorAll("a").forEach(a=>a.addEventListener("click", ()=>sheet.classList.remove("open")));
  }
}

/* ---------- reveal on scroll ---------- */
function initReveal(){
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
  }, {threshold:.15});
  els.forEach(el=>io.observe(el));
}

/* ============================================================
   MAY — the AI property concierge
   A lightweight, rule-based matcher that reads free text or
   quick-select answers (budget / type / region) and returns
   the closest listings from the Amara inventory across Africa.
   ============================================================ */
const MayAssistant = (function(){
  let state = { step:0, budget:null, type:null, region:null };

  function el(id){ return document.getElementById(id); }

  function open(){
    el("mayPanel").classList.add("open");
    el("mayLauncher").style.display = "none";
  }
  function close(){
    el("mayPanel").classList.remove("open");
    el("mayLauncher").style.display = "flex";
  }

  function pushMsg(html, who){
    const body = el("mayBody");
    const div = document.createElement("div");
    div.className = "msg " + (who || "bot");
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  function pushQuick(options, handler){
    const body = el("mayBody");
    const wrap = document.createElement("div");
    wrap.className = "may-quick";
    options.forEach(opt=>{
      const b = document.createElement("button");
      b.textContent = opt;
      b.addEventListener("click", ()=>{
        wrap.remove();
        pushMsg(opt, "user");
        handler(opt);
      });
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  function greet(){
    if(el("mayBody").dataset.greeted) return;
    el("mayBody").dataset.greeted = "1";
    pushMsg("Hello — I'm <b>May</b>, your Amara property concierge. I can search live across our African portfolio. What's your budget in USD?");
    pushQuick(["Under $400k","$400k – $800k","$800k – $1.5M","$1.5M+"], onBudget);
  }

  function onBudget(choice){
    const map = {
      "Under $400k":[0,400000],
      "$400k – $800k":[400000,800000],
      "$800k – $1.5M":[800000,1500000],
      "$1.5M+":[1500000,999999999]
    };
    state.budget = map[choice];
    pushMsg("Got it. What kind of property are you picturing?");
    pushQuick(["Villa","Penthouse / Apartment","Beach House","Estate"], onType);
  }

  function onType(choice){
    const map = {
      "Villa":["Villa"],
      "Penthouse / Apartment":["Penthouse","Apartment"],
      "Beach House":["Beach House"],
      "Estate":["Estate","Riad","Townhouse"]
    };
    state.type = map[choice];
    pushMsg("Any part of Africa you're drawn to, or should I search the whole continent?");
    pushQuick(["Anywhere in Africa","East Africa","West Africa","North Africa","Southern Africa"], onRegion);
  }

  const REGIONS = {
    "East Africa":["Kenya","Tanzania","Rwanda","Uganda"],
    "West Africa":["Nigeria","Ghana"],
    "North Africa":["Morocco","Egypt"],
    "Southern Africa":["South Africa"],
  };

  function onRegion(choice){
    state.region = choice === "Anywhere in Africa" ? null : REGIONS[choice];
    runSearch();
  }

  function runSearch(){
    const [lo,hi] = state.budget || [0,999999999];
    let matches = PROPERTIES.filter(p=>{
      const inBudget = p.price >= lo && p.price <= hi;
      const inType = !state.type || state.type.includes(p.type);
      const inRegion = !state.region || state.region.includes(p.country);
      return inBudget && inType && inRegion;
    });

    // widen search if nothing found, prioritising budget match
    if(matches.length === 0){
      matches = PROPERTIES.filter(p=> !state.region || state.region.includes(p.country))
        .sort((a,b)=> Math.abs(a.price-lo) - Math.abs(b.price-lo))
        .slice(0,3);
      pushMsg("I couldn't find an exact match, so here's the closest inventory I have on those terms:");
    } else {
      matches = matches.slice(0,3);
      pushMsg(`Here's what's showing well right now — <b>${matches.length} match${matches.length>1?"es":""}</b> for that brief:`);
    }

    matches.forEach(p=>{
      const card = document.createElement("div");
      card.className = "may-result";
      card.innerHTML = `
        <div class="price">${fmtPrice(p.price)}</div>
        <h4>${p.name}</h4>
        <p class="loc">${p.city}, ${p.country} — ${p.type} · ${p.beds} bed · ${p.tag}</p>
      `;
      el("mayBody").appendChild(card);
    });
    el("mayBody").scrollTop = el("mayBody").scrollHeight;

    pushMsg("Want to refine this, or shall I have an Amara advisor call you about one of these?");
    pushQuick(["Search again","Request a callback","Done for now"], (choice)=>{
      if(choice === "Search again"){ state = {step:0,budget:null,type:null,region:null}; pushMsg("Sure — starting over. What's your budget in USD?"); pushQuick(["Under $400k","$400k – $800k","$800k – $1.5M","$1.5M+"], onBudget); }
      else if(choice === "Request a callback"){ pushMsg("Lovely — leave a phone number or email below and an advisor will reach out within one business day."); }
      else { pushMsg("Wonderful — I'll be right here whenever you're ready to pick this up again."); }
    });
  }

  function freeTextSearch(text){
    pushMsg(text, "user");
    const lower = text.toLowerCase();

    // try to extract a rough budget
    let lo = 0, hi = 999999999;
    const num = lower.match(/([\d,.]+)\s*(k|m|million|thousand)?/);
    if(/under|below|less than/.test(lower) && num){
      hi = parseLooseNumber(num);
    } else if(num && /\d/.test(num[1])){
      lo = parseLooseNumber(num) * 0.7;
      hi = parseLooseNumber(num) * 1.3;
    }

    const typeHit = PROPERTIES.map(p=>p.type).find(t=> lower.includes(t.toLowerCase()));
    const countryHit = PROPERTIES.map(p=>p.country).find(c=> lower.includes(c.toLowerCase()));
    const cityHit = PROPERTIES.map(p=>p.city.split(",")[0]).find(c=> lower.includes(c.toLowerCase()));

    let matches = PROPERTIES.filter(p=>{
      const inBudget = p.price >= lo && p.price <= hi;
      const inType = !typeHit || p.type === typeHit;
      const inCountry = !countryHit || p.country === countryHit;
      const inCity = !cityHit || p.city.toLowerCase().includes(cityHit.toLowerCase());
      return inBudget && inType && inCountry && inCity;
    });

    if(matches.length === 0){
      matches = [...PROPERTIES].sort((a,b)=> Math.abs(a.price-((lo+hi)/2)) - Math.abs(b.price-((lo+hi)/2))).slice(0,3);
      pushMsg("Nothing matched that exactly, so here's the nearest inventory across the continent:");
    } else {
      matches = matches.slice(0,3);
      pushMsg(`Found ${matches.length} that fit — here's a first look:`);
    }
    matches.forEach(p=>{
      const card = document.createElement("div");
      card.className = "may-result";
      card.innerHTML = `
        <div class="price">${fmtPrice(p.price)}</div>
        <h4>${p.name}</h4>
        <p class="loc">${p.city}, ${p.country} — ${p.type} · ${p.beds} bed · ${p.tag}</p>
      `;
      el("mayBody").appendChild(card);
    });
    el("mayBody").scrollTop = el("mayBody").scrollHeight;
    pushMsg("Tell me more about what you're after, or use the quick options any time by typing \"restart\".");
  }

  function parseLooseNumber(match){
    let n = parseFloat(match[1].replace(/,/g,""));
    if(/k|thousand/i.test(match[2]||"")) n *= 1000;
    if(/m|million/i.test(match[2]||"")) n *= 1000000;
    return n || 0;
  }

  function init(){
    const launcher = el("mayLauncher");
    const panel = el("mayPanel");
    if(!launcher || !panel) return;
    launcher.addEventListener("click", ()=>{ open(); greet(); });
    el("mayClose").addEventListener("click", close);

    const form = el("mayForm");
    const input = el("mayInput");
    form.addEventListener("submit", (e)=>{
      e.preventDefault();
      const text = input.value.trim();
      if(!text) return;
      input.value = "";
      if(/restart|start over/i.test(text)){
        pushMsg(text, "user");
        state = {step:0,budget:null,type:null,region:null};
        pushMsg("Starting fresh — what's your budget in USD?");
        pushQuick(["Under $400k","$400k – $800k","$800k – $1.5M","$1.5M+"], onBudget);
      } else {
        freeTextSearch(text);
      }
    });
  }

  return { init, open, greet };
})();

/* ============================================================
   Mortgage / financing calculator
   ============================================================ */
function initCalculator(){
  const price = document.getElementById("calcPrice");
  const deposit = document.getElementById("calcDeposit");
  const rate = document.getElementById("calcRate");
  const term = document.getElementById("calcTerm");
  if(!price) return;

  const priceVal = document.getElementById("calcPriceVal");
  const depositVal = document.getElementById("calcDepositVal");
  const rateVal = document.getElementById("calcRateVal");
  const termVal = document.getElementById("calcTermVal");

  const monthlyOut = document.getElementById("calcMonthly");
  const loanOut = document.getElementById("calcLoanAmount");
  const depositOut = document.getElementById("calcDepositAmount");
  const totalOut = document.getElementById("calcTotalPaid");
  const interestOut = document.getElementById("calcTotalInterest");

  function compute(){
    const p = Number(price.value);
    const depositPct = Number(deposit.value);
    const r = Number(rate.value) / 100 / 12;
    const n = Number(term.value) * 12;

    const depositAmt = p * (depositPct/100);
    const loan = p - depositAmt;
    let monthly = 0;
    if(r === 0){ monthly = loan / n; }
    else { monthly = loan * (r * Math.pow(1+r, n)) / (Math.pow(1+r, n) - 1); }
    const totalPaid = monthly * n;
    const totalInterest = totalPaid - loan;

    priceVal.textContent = fmtPrice(p);
    depositVal.textContent = depositPct + "%";
    rateVal.textContent = rate.value + "%";
    termVal.textContent = term.value + " yrs";

    monthlyOut.textContent = fmtPrice(Math.round(monthly));
    loanOut.textContent = fmtPrice(Math.round(loan));
    depositOut.textContent = fmtPrice(Math.round(depositAmt));
    totalOut.textContent = fmtPrice(Math.round(totalPaid));
    interestOut.textContent = fmtPrice(Math.round(totalInterest));
  }

  [price,deposit,rate,term].forEach(inp=> inp.addEventListener("input", compute));
  compute();
}

document.addEventListener("DOMContentLoaded", ()=>{
  renderScenes();
  initNav();
  initReveal();
  MayAssistant.init();
  initCalculator();
});
