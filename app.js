// ===== Data: the diet plans the customer can choose from =====
// macros are percentages of total daily calories (carbs/protein/fat).
const PLANS = [
  {
    id: "balanced",
    name: "Balanced",
    calories: 2000,
    macros: { carbs: 40, protein: 30, fat: 30 },
    description:
      "A well-rounded approach with no food group off-limits. Plenty of vegetables, " +
      "whole grains, lean protein and healthy fats. Great for general health and the " +
      "easiest plan to stick with long-term.",
    workoutSummary:
      "Consistency beats intensity here. A mix of light cardio and full-body strength " +
      "keeps you active without burning out — perfect if you're just getting started.",
    workouts: ["30 min brisk walk", "Full-body strength (3x/week)", "Light stretching"],
  },
  {
    id: "lowcarb",
    name: "Low-Carb",
    calories: 1700,
    macros: { carbs: 20, protein: 40, fat: 40 },
    description:
      "Cuts back on bread, pasta and sugar in favour of protein and healthy fats. " +
      "Popular for steady weight loss and stable, all-day energy without sugar crashes.",
    workoutSummary:
      "Shorter, harder sessions. HIIT and weight training preserve muscle while your " +
      "body learns to tap into fat for fuel.",
    workouts: ["HIIT 20 min (3x/week)", "Weight training (4x/week)", "Core circuit"],
  },
  {
    id: "highprotein",
    name: "High-Protein",
    calories: 2200,
    macros: { carbs: 35, protein: 40, fat: 25 },
    description:
      "Built around lean meats, eggs, legumes and dairy to support muscle growth and " +
      "recovery. Best paired with regular resistance training.",
    workoutSummary:
      "Heavy resistance training is the star. A push / pull / legs split lets each muscle " +
      "group recover while you keep lifting through the week.",
    workouts: ["Heavy lifting (4x/week)", "Push/Pull/Legs split", "Post-workout protein"],
  },
  {
    id: "vegan",
    name: "Plant-Based",
    calories: 1900,
    macros: { carbs: 50, protein: 25, fat: 25 },
    description:
      "Entirely from plants — vegetables, fruit, grains, legumes and nuts. High in fibre, " +
      "naturally lower in saturated fat, and kind to the planet.",
    workoutSummary:
      "Balanced, joint-friendly movement. Yoga and cycling build endurance and flexibility " +
      "that pair well with a carb-forward diet.",
    workouts: ["Yoga (3x/week)", "Cycling 40 min", "Bodyweight circuit"],
  },
  {
    id: "mediterranean",
    name: "Mediterranean",
    calories: 2100,
    macros: { carbs: 45, protein: 20, fat: 35 },
    description:
      "Inspired by southern Europe: olive oil, fish, whole grains, vegetables and the odd " +
      "glass of red wine. One of the most heart-healthy diets ever studied.",
    workoutSummary:
      "Active living over punishing workouts — walking, swimming and mobility work you can " +
      "happily keep up for the rest of your life.",
    workouts: ["Outdoor walk 45 min", "Swimming (2x/week)", "Mobility & stretching"],
  },
];

// ===== State, loaded from the browser's localStorage so it persists =====
let state = {
  planId: localStorage.getItem("planId") || null,
  foods: JSON.parse(localStorage.getItem("foods") || "[]"),
};

// Holds the photo + matched name from the most recent "Estimate" lookup,
// so it can be attached to the food when the user clicks "Add".
let lastLookup = { img: "", matchedName: "" };

function save() {
  localStorage.setItem("planId", state.planId || "");
  localStorage.setItem("foods", JSON.stringify(state.foods));
}

function currentPlan() {
  return PLANS.find((p) => p.id === state.planId) || null;
}

function goal() {
  const p = currentPlan();
  return p ? p.calories : 2000;
}

// Turn macro percentages into a readable line + grams-per-day for a plan.
function macroText(plan) {
  const m = plan.macros;
  return `${m.carbs}% carbs · ${m.protein}% protein · ${m.fat}% fat`;
}
function macroGrams(plan) {
  const cal = plan.calories;
  const carbs = Math.round((cal * plan.macros.carbs) / 100 / 4); // 4 kcal per gram
  const protein = Math.round((cal * plan.macros.protein) / 100 / 4); // 4 kcal per gram
  const fat = Math.round((cal * plan.macros.fat) / 100 / 9); // 9 kcal per gram
  return `≈ ${carbs}g carbs · ${protein}g protein · ${fat}g fat per day`;
}

// ===== Tab switching =====
function switchTab(name) {
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
  document.querySelector(`.tab-btn[data-tab="${name}"]`).classList.add("active");
  document.getElementById(name).classList.add("active");
}
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

// ===== Render the diet plan cards =====
function renderPlans() {
  const grid = document.getElementById("plan-cards");
  grid.innerHTML = "";
  PLANS.forEach((plan) => {
    const selected = plan.id === state.planId;
    const card = document.createElement("div");
    card.className = "card" + (selected ? " selected" : "");
    card.innerHTML = `
      <h3>${plan.name}</h3>
      <div class="cal">${plan.calories} kcal/day</div>
      <div class="macros">${macroText(plan)}</div>
      <div class="grams">${macroGrams(plan)}</div>
      <p class="plan-desc">${plan.description}</p>
      <button>${selected ? "✓ Selected" : "Choose plan"}</button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      state.planId = plan.id;
      save();
      renderAll();
      // Per request: jump straight to the calorie tracker after choosing a plan.
      switchTab("tracker");
    });
    grid.appendChild(card);
  });
}

// ===== Render the calorie tracker =====
function renderTracker() {
  const consumed = state.foods.reduce((sum, f) => sum + f.cal, 0);
  const max = goal();
  const remaining = max - consumed;
  const pct = Math.min((consumed / max) * 100, 100);

  document.getElementById("consumed").textContent = consumed;
  document.getElementById("goal").textContent = max;
  document.getElementById("progress-fill").style.width = pct + "%";
  document.getElementById("progress-fill").style.background =
    consumed > max ? "#ff6b6b" : "var(--accent)";
  document.getElementById("remaining").textContent =
    remaining >= 0 ? `${remaining} kcal remaining` : `${-remaining} kcal over your goal`;

  const list = document.getElementById("food-list");
  list.innerHTML = "";
  if (state.foods.length === 0) {
    list.innerHTML = `<li style="justify-content:center;color:var(--muted)">No foods logged yet — add your first meal above 🍽️</li>`;
  }
  state.foods.forEach((food, i) => {
    const li = document.createElement("li");
    const thumb = food.img
      ? `<img class="thumb" src="${food.img}" alt="" onerror="this.remove()" />`
      : "";
    li.innerHTML = `
      <span class="food-info">${thumb}<span>${food.name}</span></span>
      <span>${food.cal} kcal <button class="del" title="Remove">✕</button></span>`;
    li.querySelector(".del").addEventListener("click", () => {
      state.foods.splice(i, 1);
      save();
      renderTracker();
    });
    list.appendChild(li);
  });
}

// ===== Render workout suggestions + explanation for the chosen plan =====
function renderWorkouts() {
  const wrap = document.getElementById("workout-list");
  const plan = currentPlan();
  if (!plan) {
    wrap.innerHTML = `<p class="subtitle">Choose a diet plan first to see matching workouts.</p>`;
    return;
  }
  const cards = plan.workouts
    .map((w) => `<div class="card"><h3>💪</h3><p>${w}</p></div>`)
    .join("");
  wrap.innerHTML = `
    <div class="workout-intro">
      <h3>${plan.name} — training approach</h3>
      <p>${plan.workoutSummary}</p>
    </div>
    <div class="card-grid">${cards}</div>`;
}

function renderFooter() {
  const plan = currentPlan();
  document.getElementById("current-plan").textContent = plan ? plan.name : "None yet";
}

function renderAll() {
  renderPlans();
  renderTracker();
  renderWorkouts();
  renderFooter();
}

// ===== Food lookup against Open Food Facts (free, no API key) =====
// Returns { kcal, img, name } for the best match, or null if nothing usable.
async function lookupFood(name) {
  const url =
    "https://world.openfoodfacts.org/cgi/search.pl?search_terms=" +
    encodeURIComponent(name) +
    "&search_simple=1&action=process&json=1&page_size=15" +
    "&fields=product_name,nutriments,image_front_url,image_url";

  const res = await fetch(url);
  if (!res.ok) throw new Error("network");
  const data = await res.json();
  const products = data.products || [];

  // Pick the first product that has a calorie value we can use.
  const match = products.find(
    (p) => p.nutriments && p.nutriments["energy-kcal_100g"]
  );
  if (!match) return null;

  return {
    kcal: Math.round(match.nutriments["energy-kcal_100g"]),
    img: match.image_front_url || match.image_url || "",
    name: match.product_name || name,
  };
}

// "Estimate" button: fill the calorie field + show a real photo. Fully optional.
document.getElementById("estimate-btn").addEventListener("click", async () => {
  const name = document.getElementById("food-name").value.trim();
  const preview = document.getElementById("food-preview");
  lastLookup = { img: "", matchedName: "" };
  if (!name) {
    preview.innerHTML = `<span class="hint">Type a food name first, then estimate.</span>`;
    return;
  }
  preview.innerHTML = `<span class="hint">Looking up "${name}"…</span>`;
  try {
    const result = await lookupFood(name);
    if (!result) {
      preview.innerHTML = `<span class="hint">No match found — just type the calories in yourself.</span>`;
      return;
    }
    // Pre-fill calories (user can still edit it before adding).
    document.getElementById("food-cal").value = result.kcal;
    lastLookup = { img: result.img, matchedName: result.name };
    const photo = result.img
      ? `<img class="preview-img" src="${result.img}" alt="${result.name}" onerror="this.remove()" />`
      : "";
    preview.innerHTML = `
      ${photo}
      <div>
        <strong>${result.name}</strong><br />
        <span class="hint">≈ ${result.kcal} kcal per 100g — edit if your portion differs.</span>
      </div>`;
  } catch (e) {
    preview.innerHTML = `<span class="hint">Couldn't reach the food database. Enter calories manually.</span>`;
  }
});

// ===== Add-food form =====
document.getElementById("food-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("food-name").value.trim();
  const cal = parseInt(document.getElementById("food-cal").value, 10);
  if (!name || !Number.isFinite(cal) || cal <= 0) return;

  // If the estimate we just did was for this same food, keep its photo.
  const img =
    lastLookup.matchedName && name.length ? lastLookup.img : "";
  const food = { name, cal, img };
  state.foods.push(food);
  save();
  renderTracker();

  // If we don't already have a photo, fetch one in the background so the
  // food still shows a real picture even when calories were typed manually.
  if (!img) {
    lookupFood(name)
      .then((r) => {
        if (r && r.img) {
          food.img = r.img;
          save();
          renderTracker();
        }
      })
      .catch(() => {});
  }

  // Reset the form for the next entry.
  e.target.reset();
  document.getElementById("food-preview").innerHTML = "";
  lastLookup = { img: "", matchedName: "" };
  document.getElementById("food-name").focus();
});

// ===== Reset the day's food log =====
document.getElementById("reset-day").addEventListener("click", () => {
  state.foods = [];
  save();
  renderTracker();
});

// Initial render
renderAll();
