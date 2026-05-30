// ===== Data: the diet plans the customer can choose from =====
const PLANS = [
  {
    id: "balanced",
    name: "Balanced",
    calories: 2000,
    macros: "40% carbs · 30% protein · 30% fat",
    workouts: ["30 min brisk walk", "Full-body strength (3x/week)", "Light stretching"],
  },
  {
    id: "lowcarb",
    name: "Low-Carb",
    calories: 1700,
    macros: "20% carbs · 40% protein · 40% fat",
    workouts: ["HIIT 20 min (3x/week)", "Weight training (4x/week)", "Core circuit"],
  },
  {
    id: "highprotein",
    name: "High-Protein",
    calories: 2200,
    macros: "35% carbs · 40% protein · 25% fat",
    workouts: ["Heavy lifting (4x/week)", "Push/Pull/Legs split", "Post-workout protein"],
  },
  {
    id: "vegan",
    name: "Plant-Based",
    calories: 1900,
    macros: "50% carbs · 25% protein · 25% fat",
    workouts: ["Yoga (3x/week)", "Cycling 40 min", "Bodyweight circuit"],
  },
];

// ===== State, loaded from the browser's localStorage so it persists =====
let state = {
  planId: localStorage.getItem("planId") || null,
  foods: JSON.parse(localStorage.getItem("foods") || "[]"),
};

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

// ===== Tab switching =====
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
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
      <div class="macros">${plan.macros}</div>
      <button>${selected ? "✓ Selected" : "Choose plan"}</button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      state.planId = plan.id;
      save();
      renderAll();
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
  state.foods.forEach((food, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${food.name}</span><span>${food.cal} kcal <button class="del" title="Remove">✕</button></span>`;
    li.querySelector(".del").addEventListener("click", () => {
      state.foods.splice(i, 1);
      save();
      renderTracker();
    });
    list.appendChild(li);
  });
}

// ===== Render workout suggestions for the chosen plan =====
function renderWorkouts() {
  const grid = document.getElementById("workout-list");
  const plan = currentPlan();
  if (!plan) {
    grid.innerHTML = `<p class="subtitle">Choose a diet plan first to see matching workouts.</p>`;
    return;
  }
  grid.innerHTML = "";
  plan.workouts.forEach((w) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3>💪</h3><p>${w}</p>`;
    grid.appendChild(card);
  });
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

// ===== Add-food form =====
document.getElementById("food-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("food-name").value.trim();
  const cal = parseInt(document.getElementById("food-cal").value, 10);
  if (!name || !Number.isFinite(cal) || cal <= 0) return;
  state.foods.push({ name, cal });
  save();
  renderTracker();
  e.target.reset();
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
