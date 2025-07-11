function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}
    
function toggleDatePicker() {
  const picker = document.getElementById("real-date-picker");
  picker.showPicker(); // ✅ يدعم معظم المتصفحات الحديثة
}

    let currentDate = new Date();

    function renderMatches(matches) {
  const list = document.getElementById("match-list");
  list.innerHTML = "";
  document.getElementById("matches-area").classList.remove("hidden");

  matches.forEach(match => {
    const matchId = match["Match-id"];
    const cup = match["Cup-Name"] || "بطولة غير معروفة";
    const right = match["Team-Right"];
    const left = match["Team-Left"];

    const wrapper = document.createElement("div");
    wrapper.className = "match-wrapper";
    wrapper.dataset.id = matchId;

    wrapper.innerHTML = `
      <div class="match-checkbox">
        <input type="checkbox" id="chk-${matchId}" onchange="toggleInput('${matchId}')">
      </div>
      <div class="inline-match-item">
        <div class="cup-title">🏆 ${cup}</div>
        <div class="team-block"><img src="${right.Logo}"><span>${right.Name}</span></div>
        <div class="match-x">X</div>
        <div class="team-block"><span>${left.Name}</span><img src="${left.Logo}"></div>
        <div class="input-link hidden" id="card-${matchId}">
          <input type="text" style="width:97%" id="link-${matchId}" placeholder="رابط المباراة">
        </div>
      </div>
    `;
    list.appendChild(wrapper);
  });
  updateCounter();
}
async function generateSignature(str) {
  const buffer = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}

let isFetching = false;

async function fetchMatches(day) {
  if (isFetching) return;
  isFetching = true;
const loading = document.getElementById("loading-overlay");
  loading.style.display = "flex"; 
  const SECRET = "NinJ0kaKey";
  const ts = Math.floor(Date.now() / 1000);
  const sig = await generateSignature(`${ts}:${SECRET}`);
  const proxyUrl = `https://joka.ninjoka.workers.dev/?ts=${ts}&sig=${sig}&date=${encodeURIComponent(day)}`;

  try {
    const res = await fetch(proxyUrl, {
      headers: { "X-From-Joka": "YES" }
    });
    const rawText = await res.text();

    if (!rawText.startsWith("NinJoka(")) {
      showToast("⛔ الرد غير مصرح به أو التوقيع مكرر\n\n" + rawText);
      throw new Error("⛔ الرد غير متوقع");
    }

    const json = JSON.parse(rawText.replace(/^NinJoka\((.*)\)$/, "$1"));
    if (!json.matches || !Array.isArray(json.matches)) throw new Error("❌ لا توجد مباريات");

    matches = json.matches;
    renderMatches(matches);
  } catch (e) {
    showToast("⚠️ حدث خطأ أثناء جلب المباريات");
    console.error(e);
  } finally {
    isFetching = false;
    loading.style.display = "none";
  }
  }
async function login() {
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const pass = document.getElementById("loginPassword").value.trim();
  const btn = document.querySelector(".login-btn");

  if (!email || !pass) return showToast("📛 أدخل البريد وكلمة المرور");

  btn.disabled = true;
  btn.textContent = "⏳ جاري التحقق...";

  try {
    const res = await fetch("https://eng3body0.github.io/DigitEgypt/users.js");
    const encoded = await res.text();
    const decoded = atob(encoded);
    const users = JSON.parse(decoded);

    const user = users.find(u => u.email === email && u.password === pass);
    if (!user) {
      showToast("❌ بيانات الدخول غير صحيحة");
    } else {
      document.getElementById("login-area").classList.add("hidden");
      document.getElementById("generator-area").classList.remove("hidden");
      document.getElementById("apiKeyInput").value = user.apiKey;
      fetchMatches("today");
    }
  } catch (e) {
    console.error(e);
    showToast("⚠️ حدث خطأ أثناء التحقق");
  } finally {
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = "🔐 تسجيل الدخول";
    }, 3000);
  }
}
// استعادة حالة الزر بعد 3 ثوانٍ 
function resetAll() {
  matches.forEach(match => {
    const id = match["Match-id"];
    document.getElementById(`chk-${id}`).checked = false;
    toggleInput(id);
  });
  document.getElementById("finalCode").value = "";
}
function generateCode() {
  const map = {};
  document.querySelectorAll(".match-wrapper").forEach(wrapper => {
    const id = wrapper.dataset.id;
    const chk = document.getElementById(`chk-${id}`);
    const input = document.getElementById(`link-${id}`);
    map[id] = chk.checked ? (input.value.trim() || "#") : "--hide--";
  });

  const json = JSON.stringify(map);
  const encoded = btoa(json);
  const apiKey = document.getElementById("apiKeyInput").value.trim();
  const flt = document.getElementById("flt").value;
  const theme = document.getElementById("theme").value;

  const final = [
    "<JokaMatch>",
    `<div day="today" theme="${theme}" flt="${flt}" data-links="${encoded}" style="display:block;text-align:center;"></div>`,
    "</JokaMatch>",
    `<script src="https://eng3body0.github.io/DigitEgypt/tm.js" api-key="${apiKey}"><\/script>`
  ].join("\n");

  document.getElementById("finalCode").value = final;
}
    function toggleInput(id) {
  const inputBox = document.getElementById(`card-${id}`);
  const chk = document.getElementById(`chk-${id}`);
  inputBox.classList.toggle("hidden", !chk.checked);
    updateCounter();
}
updateDateDisplay();
function updateCounter() {
  const total = matches.length;
  const selected = document.querySelectorAll("input[type='checkbox']:checked").length;
  document.getElementById("counter").textContent = `✅ تم تحديد ${selected} من أصل ${total}`;
}
    function updateDateDisplay() {
  const options = { day: "numeric", month: "long", year: "numeric" };
  document.getElementById("displayed-date").textContent = currentDate.toLocaleDateString("ar-EG", options);
  document.getElementById("displayed-date").dataset.date = currentDate.toISOString().split("T")[0];
  document.getElementById("real-date-picker").value = currentDate.toISOString().split("T")[0];
}
function copyCode() {
  const txt = document.getElementById("finalCode").value;
  navigator.clipboard.writeText(txt).then(() => {
    showToast("تم نسخ الكود ✅");
  });
  
function loadMatchesByDate() {
  const formatted = currentDate.toISOString().split("T")[0];
  fetchMatches(formatted);
}

function handleDateChangeByPicker() {
  const picker = document.getElementById("real-date-picker");
  const val = picker.value;
  if (val) {
    currentDate = new Date(val);
    updateDateDisplay();
    loadMatchesByDate();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("prev-date").addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    loadMatchesByDate();
  });

  document.getElementById("next-date").addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    loadMatchesByDate();
  });

  document.getElementById("real-date-picker").addEventListener("change", handleDateChangeByPicker);

  updateDateDisplay();
});
}
