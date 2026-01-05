(function () {
  if (window.top !== window.self) {
    document.body.innerHTML = "";
    alert("⛔ لا يمكنك تحميل هذه الصفحة بهذه الطريقة.");
    throw new Error("Blocked iframe");
  }

  // كشف أدوات scraping الشائعة
  const suspicious = [
    "HeadlessChrome", "puppeteer", "phantom", "slimer", "node.js"
  ];

  const ua = navigator.userAgent.toLowerCase();
  for (let s of suspicious) {
    if (ua.includes(s.toLowerCase())) {
      document.body.innerHTML = "";
      alert("⛔ استخدام أدوات غير مصرح بها.");
      throw new Error("Blocked bot");
    }
  }
  const apiKey = document.currentScript.getAttribute("api-key");
  const containers = document.querySelectorAll("JokaMatch");

function checkJokaMatchStructure() {
  const jokaContainers = document.querySelectorAll("JokaMatch");

  if (!jokaContainers.length) {
    // الحالة الأولى: الوسم JokaMatch غير موجود بالكامل
    displayStructureError(
      "⚠️ لم يتم تفعيل الإضافة بالشكل الصحيح. الرجاء التأكد من تركيب الكود كما هو دون تعديل.",
      "missing-joka"
    );
    throw new Error("Missing <JokaMatch> element");
  }

  let foundInvalid = false;
  jokaContainers.forEach(container => {
    const hasValidDiv = container.querySelector("div[day]");
    if (!hasValidDiv) {
      foundInvalid = true;
    }
  });

  if (foundInvalid) {
    // الحالة الثانية: تم حذف div[day] من داخل JokaMatch
    displayStructureError(
      "⚠️ حدث خلل في تفعيل الإضافة. تأكد من عدم حذف أو تعديل أي جزء من كود الإضافة.",
      "broken-structure"
    );
    throw new Error("Invalid <JokaMatch> structure");
  }
}

function displayStructureError(message, errorCode) {
  const encodedMessage = encodeURIComponent(`مرحبًا، أواجه مشكلة في تركيب إضافة جوكا. رمز التحقق: ${errorCode}`);
  const whatsappLink = `https://wa.me/201030588214?text=${encodedMessage}`;

  document.body.innerHTML = `
    <div style="font-family:'Cairo',sans-serif;text-align:center;padding:50px;color:#fff;background:#1b1d2a;min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;">
      <h2 style="color:#FF3131">🚫 مشكلة في تفعيل الإضافة</h2>
      <p style="font-size:16px;margin:10px 0 20px;">${message}</p>
      <a href="${whatsappLink}" target="_blank" style="background:#25D366;padding:10px 20px;border-radius:8px;color:#fff;text-decoration:none;font-weight:bold;">
        💬 تواصل مع الدعم عبر واتساب
      </a>
    </div>
  `;
}


// 🎯 جلب Blog ID من JSON feed فقط
async function getBlogIdFromJsonFeed(blogUrl) {
  try {
    const res = await fetch(`${blogUrl}/feeds/posts/default/?max-results=0&alt=json`);
    const json = await res.json();
    const fullId = json.feed.id.$t;
    const blogId = fullId.match(/blog-(\d+)/)?.[1];
    return blogId;
  } catch (e) {
    console.error("⚠️ فشل في جلب Blog ID من JSON", e);
    return null;
  }
}

// 🗝️ المفاتيح المفعّلة
const allowedKeys = {
  "ABC123XYZ": "2325258222068455523", // مثال
  "ABC123XYZ": "7129556492432595965", // مثال
};

// ✅ تحقق الصلاحية
async function checkAuthorization(apiKey) {
  const currentBlogId = await getBlogIdFromJsonFeed(location.origin);
  if (!currentBlogId) {
    displayAccessError("⚠️ تعذر جلب معرف المدونة من JSON. تأكد من صحة الرابط أو إعدادات المدونة.");
    return false;
  }

  const matchingKey = Object.entries(allowedKeys).find(([key, id]) => id === currentBlogId);

  if (!matchingKey) {
    displayAccessError(`🚫 هذه المدونة (${currentBlogId}) غير مفعلة لاستخدام الإضافة.`, false, currentBlogId);
    return false;
  }

  if (matchingKey[0] !== apiKey) {
    displayAccessError(`🚫 مفتاح الدخول غير صحيح لهذه المدونة (${currentBlogId}).`, true, currentBlogId);
    return false;
  }

  return true;
}

// ❌ عرض رسالة منع الوصول
function displayAccessError(msg, isKeyError = false, blogId = "") {
  const encodedBlogId = encodeURIComponent(blogId || "غير معروف");
  const whatsappMsg = isKeyError
    ? `مرحبًا، أواجه مشكلة في مفتاح الدخول الخاص بإضافة جوكا للمباريات.%0Aمدونة: ${encodedBlogId}`
    : `مرحبًا، أواجه مشكلة في تفعيل إضافة جوكا للمباريات على مدونتي.%0Aمدونة: ${encodedBlogId}`;

  document.body.innerHTML = `
    <div style="font-family:'Cairo',sans-serif;text-align:center;padding:50px;color:#fff;background:#1b1d2a;min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;">
      <h2 style="color:#FF3131">⛔ صلاحية مرفوضة</h2>
      <p style="font-size:16px;margin:10px 0 20px;">${msg}</p>
      <a href="https://wa.me/201030588214?text=${whatsappMsg}" target="_blank" style="background:#25D366;padding:10px 20px;border-radius:8px;color:#fff;text-decoration:none;font-weight:bold;">
        💬 تواصل مع الدعم عبر واتساب
      </a>
    </div>
  `;
  throw new Error("⛔ تم إيقاف تنفيذ السكربت بسبب صلاحية غير صحيحة");
}

// 🚀 شغل التحقق قبل أي تنفيذ
(async () => {
  const authorized = await checkAuthorization(apiKey);
  if (!authorized) return;
// ثم استخدمه هكذا
  checkJokaMatchStructure();

// ⚙️ توليد توقيع SHA-256
async function generateSignature(str) {
  const buffer = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// 🔐 تحميل المباريات من البروكسي المؤمَّن
async function fetchMatches(day) {
  const SECRET = "NinJ0kaKey";
  const ts = Math.floor(Date.now() / 1000);
  const sig = await generateSignature(`${ts}:${SECRET}`);

  const proxyUrl = `https://joka.ninjoka.workers.dev/?ts=${ts}&sig=${sig}&date=${encodeURIComponent(day)}`;

  const res = await fetch(proxyUrl, {
    headers: {
      "X-From-Joka": "YES"
    }
  });

  const rawText = await res.text();
  const parsed = JSON.parse(rawText.replace(/^NinJoka\((.*)\)$/, "$1"));

  if (parsed.error) throw new Error(parsed.message);

  return parsed.matches;
}


const style = document.createElement("style");
  style.innerHTML = `
    /* === Joka Match Global Styles (Modified for JokaSport) === */
    JokaMatch {
      display: block;
      text-align: center;
      font-family: 'Tajawal', sans-serif; /* تم تغيير الخط ليناسب القالب */
      margin-top: 10px;
    }
    .joka-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 0;
    }
    /* استخدام لون القالب الأساسي */
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--primary, #d32f2f); 
      border-top: 4px solid transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 10px;
    }
    .joka-loader-text {
      color: var(--text-light, #333);
      font-size: 14px;
      font-weight: bold;
    }
    /* دعم الوضع الليلي عبر متغيرات القالب */
    [data-theme="dark"] .joka-loader-text { color: var(--text-dark, #e0e0e0); }
    
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .joka-no-matches {
      padding: 40px 0;
      text-align: center;
      color: var(--text-light);
      font-size: 14px;
      opacity: 0.8;
    }
    [data-theme="dark"] .joka-no-matches { color: var(--text-dark); }

    /* === تصميم الكارت === */
    .inline-match-item {
      display: flex;
      align-items: center;
      min-height: 60px;
      border-radius: 10px;
      background: var(--card-light, #fff); /* خلفية من القالب */
      margin-bottom: 10px;
      justify-content: center;
      padding: 15px;
      position: relative;
      flex-wrap: wrap;
      color: var(--text-light, #333);
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      border: 1px solid rgba(0,0,0,0.05);
      transition: transform 0.2s;
    }
    
    [data-theme="dark"] .inline-match-item {
        background: var(--card-dark, #1e1e1e);
        color: var(--text-dark, #e0e0e0);
        border-color: #333;
    }

    .inline-match-item:hover { transform: translateY(-2px); }

    .inline-match-item .first-team,
    .inline-match-item .second-team {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-size: 14px;
      font-weight: bold;
    }

    .inline-match-item .img { width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; }
    .inline-match-item .img img { max-width: 100%; max-height: 100%; }

    /* === منطقة النتيجة === */
    .inline-match-item .result-wrap {
      min-width: 80px;
      height: 30px;
      border-radius: 20px;
      background: #eee;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 900;
      color: #333;
      margin: 0 15px;
    }
    [data-theme="dark"] .inline-match-item .result-wrap { background: #333; color: #fff; }

    /* المباريات المباشرة */
    .inline-match-item.match-live .result-wrap {
      background: var(--primary, #d32f2f);
      color: white;
      animation: pulse 2s infinite;
    }

    .inline-match-item .live {
      position: absolute;
      font-size: 10px;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--success, #4caf50);
      color: white;
      border-radius: 4px;
      padding: 2px 8px;
      font-weight: bold;
    }

    .match-section-title {
      font-weight: 900;
      margin: 20px 0 10px;
      color: var(--primary, #d32f2f);
      font-size: 16px;
      border-bottom: 2px solid #eee;
      padding-bottom: 5px;
    }
    [data-theme="dark"] .match-section-title { border-color: #333; }

    /* === Responsive === */
    @media (max-width: 500px) {
        .inline-match-item { padding: 10px; }
        .inline-match-item .first-team, .inline-match-item .second-team { font-size: 12px; gap: 5px; }
        .inline-match-item .img { width: 25px; height: 25px; }
    }
  `;
  document.head.appendChild(style);
  
function parseTimeWithZone(isoTime, timeZoneOffsetStr) {
const matchDate = new Date(isoTime);
const matchOffset = parseInt(timeZoneOffsetStr || "+0") * 60;
const localOffset = -new Date().getTimezoneOffset(); // local is negative, so we reverse it
const diffMinutes = localOffset - matchOffset;
matchDate.setMinutes(matchDate.getMinutes() + diffMinutes);
return matchDate;
}
  const formatStatus = (match) => {
const now = new Date();
const start = parseTimeWithZone(match["Time-Start"], match["Time-Zone"]);
const timeNow = match["Time-Now"];
const status = match["Match-Status"];

if (status.includes("جارية") || status.includes("شوط")) {
const minute = (timeNow > 0 && timeNow <= 130) ? timeNow : 0;
return { type: "live", minute, label: status };
} else if (status.includes("انتهت")||status.includes("الترجيح")) {
return { type: "ended" };
} else {
return {
type: "upcoming",
time: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};
}
};

const buildMatchCard = (match, link = "#") => {
  const status = formatStatus(match);
  const rightGoals = match["Team-Right"]["Goal"];
  const leftGoals = match["Team-Left"]["Goal"];
  const rightClass = rightGoals > leftGoals ? "winner" : rightGoals < leftGoals ? "loser" : "";
  const leftClass = leftGoals > rightGoals ? "winner" : leftGoals < rightGoals ? "loser" : "";
  const matchId = match["ID"] || Math.random().toString(36).substring(2, 9);

  // ✅ كارت المباريات الجارية فقط بتصميم خاص
if (status.type === "live") {
const matchId = match["ID"] || Math.random().toString(36).substring(2, 9);
const rawMinute = match["Time-Now"] || 0;
const percent = Math.min(100, Math.round((rawMinute / 90) * 100));

const isRest =
status.label.includes("شوط") &&
!status.label.includes("الأول") &&
!status.label.includes("الثاني") &&
!status.label.includes("بدل");

const isFirstHalf = status.label.includes("الأول");
const isSecondHalf = status.label.includes("الثاني");

let baseMinute = rawMinute;
let extraTime = 0;
let showExtra = false;

if ((isFirstHalf && rawMinute >= 45) || (isSecondHalf && rawMinute >= 90)) {
baseMinute = isFirstHalf ? 45 : 90;
extraTime = rawMinute - baseMinute;
showExtra = true;
}
const timerDisplay = `${baseMinute}:00`; // الثواني ستُضاف في setInterval
const extraDisplay = showExtra
? `<span class="extra-time">+<i class="extra-count">${extraTime}:00</i></span>`
: "";
let matchLabelt = "مباشر";
let matchLabelb= match["Match-Status"];
  if (isRest) {
matchLabelt = "استراحة";
matchLabelb = "نهاية الشوط"
} else if (showExtra) {
matchLabelt = "الوقت الإضافي";
matchLabelb = `${extraDisplay}`;
}
return `
<div class="inline-match-item match-live active-match" onclick="window.open('${link}', '_blank')">
<div class="match-team-item">
<div class="team---item">
<div class="img"><img title="${match["Team-Right"]["Name"]}" src="${match["Team-Right"]["Logo"]}"></div>
<b>${match["Team-Right"]["Name"]}</b>
</div>
</div>
<div class="first-team-result team-result ${rightClass}">${rightGoals}</div>
  <div class="active-match-progress">
    <span class="result-status-text">${matchLabelt}</span>
    <div class="match-inner-progress-wrap" id="progress-wrap-${matchId}" data-base="${baseMinute}" data-show-extra="${showExtra}" data-extra-time="${extraTime}" data-is-rest="${isRest}" data-seconds="0"  >
      <span class="result-status-text live-match-status">${matchLabelb}</span>
      <div class="percent" id="percent-${matchId}" style="--num:${percent}">
        <svg>
          <circle cx="25" cy="25" r="25"></circle>
          <circle cx="25" cy="25" r="25"></circle>
        </svg>
        <div class="number" id="match-time-${matchId}">${timerDisplay}</div>
      </div>
    </div>
  </div>

  <div class="second-team-result team-result ${leftClass}">${leftGoals}</div>
  <div class="match-team-item">
    <div class="team---item">
      <div class="img"><img title="${match["Team-Left"]["Name"]}" src="${match["Team-Left"]["Logo"]}"></div>
      <b>${match["Team-Left"]["Name"]}</b>
    </div>
  </div>
</div>
`;
}


  // ✅ باقي الكروت (upcoming - ended) بنفس التصميم القديم
  let midContent = "";

if (match["Match-Status"].includes("تأجلت")) {
  midContent = `
    <div class="result-wrap">
      <span class="result-status-text">مؤجلة</span>
      <b class="match-date">
      <span></span>
      <i>${status.time}</i>
      <span></span>
      </b>
    </div>
  `;
} else if (status.type === "upcoming") {
  midContent = `<div class="result-wrap"><b>${status.time}</b></div>`;
} else if (status.type === "ended") {
  midContent = `
    <div class="result-wrap">
      <span class="result-status-text">انتهت المباراة</span>
      <b class="match-date">
        <span class="first-team-result ${rightClass}">${rightGoals}</span>
        <i>-</i>
        <span class="second-team-result ${leftClass}">${leftGoals}</span>
      </b>
    </div>
  `;
}


  return `
    <div class="inline-match-item match-${status.type}" onclick="window.open('${link}', '_blank')">
      <div class="first-team">
        <div class="img"><img src="${match["Team-Right"]["Logo"]}" alt=""></div>
        <b>${match["Team-Right"]["Name"]}</b>
      </div>
      ${midContent}
      <div class="second-team">
        <b>${match["Team-Left"]["Name"]}</b>
        <div class="img"><img src="${match["Team-Left"]["Logo"]}" alt=""></div>
      </div>
    </div>
  `;
};

  containers.forEach(container => {
    const divs = container.querySelectorAll("div[day]");
    divs.forEach(async div => {
    
      const day = div.getAttribute("day") || "today";
      const flt = div.getAttribute("flt") || "1";
      const theme = div.getAttribute("theme") || "dark";

      div.style.setProperty('--bg', theme === "dark" ? '#151825' : '#f3f3f3');
div.style.setProperty('--progress-bg', theme === "dark" ? '#191D2D' : '#eee');
div.style.setProperty('--progress-track', theme === "dark" ? '#333' : '#ccc');
div.style.setProperty('--progress-color', theme === "dark" ? '#39DBBF' : '#007acc');
      div.style.setProperty('--result-bg', theme === "dark" ? '#191D2D' : '#ddd');
      div.style.setProperty('--text', theme === "dark" ? '#BFC3D4' : '#222');
let linksMap = {};
const linksEncoded = div.getAttribute("data-links");
try {
  const decoded = atob(linksEncoded || "");
  linksMap = JSON.parse(decoded);
} catch (e) {
  console.warn("❌ Failed to parse match links map.");
}

let globalMatchIndex = 0;
      try {
        div.innerHTML = `
  <div class="joka-loader">
    <div class="spinner"></div>
    <p class="joka-loader-text">جارٍ تحميل المباريات...</p>
  </div>
`;

        const matches = await fetchMatches(day);
        if (!matches.length) {
  div.innerHTML = `
    <div class="joka-no-matches">
      <img src="https://cdn-icons-png.flaticon.com/512/7486/7486530.png" width="80" style="opacity: 0.5;" />
      <p>لا توجد مباريات في هذا اليوم.</p>
    </div>
  `;
  return;
}
const filteredMatches = matches.filter(match => {
  const matchId = match["Match-id"];
  const link = linksMap[matchId];
  return link !== "--hide--"; // تجاهل المباراة إذا كانت مخفية
});

if (!filteredMatches.length) {
  div.innerHTML = `
    <div class="joka-no-matches">
      <img src="https://cdn-icons-png.flaticon.com/512/7486/7486530.png" width="80" style="opacity: 0.5;" />
      <p>لا توجد مباريات متاحة للعرض.</p>
    </div>
  `;
  return;
}
       if (flt === "1") {
          const grouped = {};
          matches.forEach(match => {
            const cup = match["Cup-Name"] || "بطولات أخرى";
            if (!grouped[cup]) grouped[cup] = [];
            grouped[cup].push(match);
          });
         const html = Object.entries(grouped).map(([cup, list]) => {
  const visibleMatches = list.filter(match => {
    const matchId = match["Match-id"];
    const link = linksMap?.[matchId] ?? "#";
    return link !== "--hide--";
  });

  if (!visibleMatches.length) return ""; // نتجاهل البطولة لو مفيهاش مباريات ظاهرين

  const now = new Date();
  const live = [], soon = [], future = [], ended = [];

  visibleMatches.forEach(match => {
    const start = new Date(match["Time-Start"]);
    const diffMin = Math.floor((start - now) / 60000);
    const status = match["Match-Status"];
    if (status.includes("جارية") || status.includes("شوط")) live.push(match);
    else if (status.includes("انتهت")) ended.push(match);
    else if (diffMin <= 60 && diffMin > 0) soon.push(match);
    else future.push(match);
  });

  const sorted = [...live, ...soon, ...future, ...ended];

  // الترتيب الداخلي
  soon.sort((a, b) => new Date(a["Time-Start"]) - new Date(b["Time-Start"]));
  future.sort((a, b) => new Date(a["Time-Start"]) - new Date(b["Time-Start"]));
  live.sort((a, b) => (b["Time-Now"] || 0) - (a["Time-Now"] || 0));
  ended.sort((a, b) => new Date(b["Time-End"] || b["Time-Start"]) - new Date(a["Time-End"] || a["Time-Start"]));

  const section = sorted.map(match => {
    const matchId = match["Match-id"];
    const link = linksMap?.[matchId] ?? "#";
    if (link === "--hide--") return "";
    return buildMatchCard(match, link);
  }).join("");

  return `<div class="match-section-title">${cup}</div>${section}`;
}).join("");


          div.innerHTML = html;
          return;
        }

const live = [], upcoming = [], ended = [];

matches.forEach(match => {
  const matchId = match["Match-id"];
  const link = linksMap?.[matchId] ?? "#";
  if (link === "--hide--") return; // تجاهل المباراة المخفية

  const status = match["Match-Status"];
  if (status.includes("جارية") || status.includes("شوط")) live.push({ match, link });
  else if (status.includes("انتهت") || status.includes("إنتهت")) ended.push({ match, link });
  else upcoming.push({ match, link });
});

// ترتيب
upcoming.sort((a, b) => new Date(a.match["Time-Start"]) - new Date(b.match["Time-Start"]));
live.sort((a, b) => (b.match["Time-Now"] || 0) - (a.match["Time-Now"] || 0));
ended.sort((a, b) => new Date(b.match["Time-End"] || b.match["Time-Start"]) - new Date(a.match["Time-End"] || a.match["Time-Start"]));

// دالة ترجع جزء HTML لكل قسم
const renderSection = (title, list) => {
  if (!list.length) return "";
  const items = list.map(({ match, link }) => buildMatchCard(match, link)).join("");
  return `<div class="match-section-title">${title}</div>${items}`;
};

const allVisibleMatchesCount = live.length + upcoming.length + ended.length;

if (allVisibleMatchesCount === 0) {
  div.innerHTML = `
    <div class="joka-no-matches">
      <img src="https://cdn-icons-png.flaticon.com/512/7486/7486530.png" width="80" style="opacity: 0.5;" />
      <p>لا توجد مباريات متاحة للعرض.</p>
    </div>
  `;
} else {
  div.innerHTML = "";
  div.style.opacity = 0;

  setTimeout(() => {
    div.innerHTML = `
      ${renderSection("جارية الآن", live)}
      ${renderSection("المباريات القادمة", upcoming)}
      ${renderSection("مباريات انتهت", ended)}
    `;
    div.style.transition = "opacity 0.5s ease";
    div.style.opacity = 1;
  }, 200);
}

      } catch (e) {
        div.innerHTML = `
  <div class="joka-error">
    <img src="https://cdn-icons-png.flaticon.com/512/610/610395.png" width="70" style="margin-bottom: 10px;" />
    <h3>تعذر تحميل المباريات</h3>
    <p style="font-size:13px;opacity:0.8;">يرجى التحقق من الاتصال بالإنترنت أو المحاولة لاحقًا.</p>
    <button onclick="location.reload()" style="margin-top:10px;background:#39dbbf;color:white;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;">🔄 إعادة المحاولة</button>
  </div>`
;

        console.error(e);
      }
    });
  });
})();
})();

const r = 25;
const circumference = 2 * Math.PI * r;

setInterval(() => {
  document.querySelectorAll(".match-inner-progress-wrap").forEach(wrapper => {
    const timeEl = wrapper.querySelector(".number");
    const percentEl = wrapper.querySelector(".percent");
    const extraEl = wrapper.querySelector(".extra-count");

    // خصائص البيانات
    let base = parseInt(wrapper.dataset.base || "0");        // الدقيقة الثابتة (مثلاً 45)
    let extra = parseInt(wrapper.dataset.extraTime || "0");   // عدد دقائق الوقت الإضافي
    let seconds = parseInt(wrapper.dataset.seconds || "0");   // عداد الثواني
    const showExtra = wrapper.dataset.showExtra === "true";   // هل احنا في وقت إضافي
    const isRest = wrapper.dataset.isRest === "true";         // هل احنا في استراحة

    // ⏸️ لو استراحة، نوقف العد تمامًا
    if (isRest) return;

    // 🕒 تحديث الثواني
    seconds++;
    if (seconds >= 60) {
      seconds = 0;

      if (showExtra) {
        extra++;
        wrapper.dataset.extraTime = extra;
      } else {
        base++;
        wrapper.dataset.base = base;
      }
    }

    // 📝 تحديث الـ dataset
    wrapper.dataset.seconds = seconds;

    const secStr = String(seconds).padStart(2, '0');

    // 🧮 عرض الوقت
    if (showExtra) {
      // الثواني الإضافية
      if (extraEl) extraEl.textContent = `${extra}:${secStr}`;
      if (timeEl) timeEl.textContent = `${base}:00`;
    } else {
      if (timeEl) timeEl.textContent = `${base}:${secStr}`;
    }

    // ⭕ حساب النسبة المئوية لتقدم المباراة
    let currentMinute = base + (showExtra ? extra : 0);
    let maxTime = 90;

    if (base === 45 && showExtra) maxTime = 60;
    else if (base === 90 && showExtra) maxTime = 120;
    else if (base === 105 && showExtra) maxTime = 110;
    else if (base === 120 && showExtra) maxTime = 130;
    else if (base === 45) maxTime = 45;
    else if (base === 90) maxTime = 90;
    else if (base === 105) maxTime = 105;
    else if (base === 120) maxTime = 120;

    const percent = Math.min(100, (currentMinute * 0.9));

    // 🟢 تحديث الدائرة
    percentEl.style.setProperty('--circumference', `${circumference}`);
    percentEl.style.setProperty('--percent', percent);
    percentEl.style.setProperty('--num', percent);
  });
}, 1000);
