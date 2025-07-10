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
    /* === Joka Match Global Styles === */

JokaMatch {
  display: block;
  text-align: center;
  font-family: 'Cairo', sans-serif;
}
.joka-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #39dbbf;
  border-top: 4px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 10px;
}
.joka-loader-text {
  color: var(--text, #bfc3d4);
  font-size: 14px;
  font-weight: bold;
  animation: fadeIn 1s ease-in-out infinite alternate;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes fadeIn {
  from { opacity: 0.4; }
  to { opacity: 1; }
}
.joka-no-matches {
  padding: 40px 0;
  text-align: center;
  color: var(--text, #bfc3d4);
  font-size: 14px;
  opacity: 0.8;
}
.joka-error {
  text-align: center;
  padding: 50px 20px;
  color: var(--text, #bfc3d4);
}

/* === Inline Match Item === */
.inline-match-item {
  display: flex;
  align-items: center;
  min-height: 60px;
  border-radius: 10px;
  background: var(--bg, #151825);
  margin-bottom: 5px;
  justify-content: center;
  padding: 18px;
  position: relative;
  flex-wrap: wrap;
  color: var(--text, #BFC3D4);
}

.inline-match-item .first-team,
.inline-match-item .second-team {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 12px;
  font-weight: bold;
}

.inline-match-item .img {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inline-match-item .img img {
  max-width: 100%;
  max-height: 100%;
}

.inline-match-item .result-wrap {
  width: 62px;
  height: 20px;
  border-radius: 50px;
  background: var(--result-bg, #191D2D);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: var(--text, #BFC3D4);
  margin: 0 15px;
  padding-top: 4px;
  position: relative;
}

.inline-match-item .result-wrap b {
  margin-bottom: 2px;
}

.inline-match-item.match-live .result-wrap {
  background: conic-gradient(#FF3131 calc(var(--percent, 0%) * 1%), #555 0);
  color: white;
}

.inline-match-item.match-upcoming .result-wrap {
  background: var(--result-bg, #191D2D);
}

.inline-match-item.match-ended .result-wrap {
  background: var(--result-bg, #191D2D);
}

.inline-match-item .live {
  position: absolute;
  font-size: 10px;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: #FF3131;
  color: white;
  border-radius: 50px;
  padding: 2px 6px;
  font-weight: bold;
}

.match-section-title {
  font-weight: bold;
  margin: 10px 0 5px;
  color: var(--text, #BFC3D4);
  font-size: 16px;
}
/* === المباريات المنتهية === */
.result-status-text {
  position: absolute;
  right: 50%;
  transform: translateX(50%);
  top: -20px;
  font-size: 10px;
  font-weight: normal;
  color: #BFC3D4;
  white-space: nowrap;
}

.inline-match-item.match-with-result .result-wrap {
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.inline-match-item .result-wrap {
  width: 62px;
  height: 20px;
  border-radius: 50px;
  background: #191D2D;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: #BFC3D4 !important;
  margin: 0 15px;
  padding-top: 4px;
  position: relative;
}

.inline-match-item .result-wrap b {
  font-weight: bold;
  display: flex;
  margin-bottom: 2px;
}

/* === المباريات الجارية (دائرة احترافية) === */
.active-match-progress {
  margin: 0 20px;
  position: relative;
}

.match-inner-progress-wrap {
  position: relative;
  width: 50px;
  height: 50px;
}

.match-inner-progress-wrap .percent {
  width: 50px;
  height: 50px;
}

.match-inner-progress-wrap svg {
  transform: rotate(270deg);
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 100%;
  background: #191D2D;
}

.match-inner-progress-wrap svg circle {
  stroke-linecap: butt;
  stroke-dasharray: var(--circumference);
  stroke-dashoffset: calc(var(--circumference) - (var(--percent, 0) / 100) * var(--circumference));
  width: 100%;
  height: 100%;
  fill: none;
  stroke-width: 5;
  stroke: #333;
  r: 20;
  cx: 25;
  cy: 25;
}

.match-inner-progress-wrap svg circle:last-child {
  stroke: #39DBBF;
  stroke-dasharray: 157;
  stroke-dashoffset: calc(157 - (var(--num, 0) / 100) * 157);
  transition: stroke-dashoffset 0.5s ease;
}

.match-inner-progress-wrap .number {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #39DBBF;
  font-size: 12px;
  font-weight: bold;
  direction: ltr;
}

.result-status-text.live-match-status {
  top: auto;
  bottom: -18px;
  font-weight: bold;
}

.extra-time i {
  font-style: normal;
  margin-right: 4px;
  color: #BFC3D4;
}

.inline-match-item.active-match .match-team-item.second-team {
  justify-content: flex-start;
}
.inline-match-item.match-live .team---item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.inline-match-item.match-live .match-team-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
}


/* === Cup Title === */
.cup-title {
  width: 100%;
  font-size: 13px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 6px;
  color: var(--text, #BFC3D4);
}

/* === Utility === */
.goal-number {
  font-size: 14px;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
  color: var(--text, #BFC3D4);
}

.match-result-center {
  text-align: center;
}

.ended-label {
  font-size: 11px;
  color: var(--text, #BFC3D4);
  margin-bottom: 2px;
}

.result-score {
  font-size: 16px;
  font-weight: bold;
  color: var(--text, #BFC3D4);
}
.first-team-result.winner,
.second-team-result.winner {
color: #39DBBF;
}
.first-team-result.loser,
.second-team-result.loser {
color: #FF3131;
}
/* === Responsiveness === */
@media (max-width: 500px) {
.inline-match-item {
flex-direction: row !important; /* نمنع العمودي */
flex-wrap: nowrap;
padding: 12px;
}

.inline-match-item .first-team,
.inline-match-item .second-team {
font-size: 10px;
gap: 6px;
}

.inline-match-item .img {
width: 20px;
height: 20px;
}

.inline-match-item .live {
font-size: 9px;
padding: 2px 4px;
top: -12px;
}

.match-section-title {
font-size: 14px;
}
}
.match-inner-progress-wrap svg {
  background: var(--progress-bg);
}
.match-inner-progress-wrap svg circle {
  stroke: var(--progress-track);
}
.match-inner-progress-wrap svg circle:last-child {
  stroke: var(--progress-color);
}
.match-inner-progress-wrap .number {
  color: var(--progress-color);
}
.inline-match-item.match-live.active-match {
  justify-content: center;
  gap: 6px;
}

.inline-match-item.match-live .match-team-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  padding: 0 6px;
  gap: 4px;
  }
.inline-match-item.match-live .team---item b {
  font-size: 11px;
  text-align: center;
  line-height: 1.2;
}

.inline-match-item.match-live .team-result {
  font-size: 13px;
  font-weight: bold;
  margin-top: 4px;
  margin-bottom: -2px;
}

.active-match-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 10px; /* تعطي مساحة بين الدائرة والنتيجة */
}
.status-text-top,
.status-text-bottom {
  font-size: 10px;
  font-weight: bold;
  text-align: center;
  color: var(--text, #BFC3D4);
  margin: 2px 0;
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

       if (flt === "1") {
          const grouped = {};
          matches.forEach(match => {
            const cup = match["Cup-Name"] || "بطولات أخرى";
            if (!grouped[cup]) grouped[cup] = [];
            grouped[cup].push(match);
          });
          const html = Object.entries(grouped).map(([cup, list]) => {
            let matchIndex = 0; // نعد المباريات

            const now = new Date();
            const live = [], soon = [], future = [], ended = [];

            list.forEach(match => {
              const start = new Date(match["Time-Start"]);
              const diffMin = Math.floor((start - now) / 60000);
              const status = match["Match-Status"];
              if (status.includes("جارية") || status.includes("شوط")) live.push(match);
              else if (status.includes("انتهت")) ended.push(match);
              else if (diffMin <= 60 && diffMin > 0) soon.push(match);
              else future.push(match);
            });

            const sorted = [...live, ...soon, ...future, ...ended];
            soon.sort((a, b) => new Date(a["Time-Start"]) - new Date(b["Time-Start"]));
            future.sort((a, b) => new Date(a["Time-Start"]) - new Date(b["Time-Start"]));
            live.sort((a, b) => (b["Time-Now"] || 0) - (a["Time-Now"] || 0));
            ended.sort((a, b) => new Date(b["Time-End"] || b["Time-Start"]) - new Date(a["Time-End"] || a["Time-Start"]));
const section = sorted.map((match, index) => {
  const link = linksMap?.[match["ID"]]; // أو Match-id حسب حالتك
  if (link === "--hide--" || link === undefined) return "";
  return buildMatchCard(match, link || "#");
}).join("");

// 💡 لو القسم فاضي بعد التصفية، منظهرش اسم البطولة
if (!section.trim()) return "";
return <div class="match-section-title">${cup}</div>${section};


            return <div class="match-section-title">${cup}</div>${section};
          }).join("");

          div.innerHTML = html;
          return;
        }

        const live = [], upcoming = [], ended = [];
        matches.forEach(match => {
          const status = match["Match-Status"];
          if (status.includes("جارية") || status.includes("شوط")) live.push(match);
          else if (status.includes("انتهت") || status.includes("إنتهت")) ended.push(match);
          else upcoming.push(match);
        });
        // ترتيب حسب الوقت داخل كل حالة
upcoming.sort((a, b) => new Date(a["Time-Start"]) - new Date(b["Time-Start"]));
live.sort((a, b) => (b["Time-Now"] || 0) - (a["Time-Now"] || 0));
ended.sort((a, b) => new Date(b["Time-End"] || b["Time-Start"]) - new Date(a["Time-End"] || a["Time-Start"]));


        const renderSection = (title, list) => {
          if (!list.length) return "";
const items = list.map((match, index) => {
const matchId = match["Match-id"]; const link = linksMap[matchId] || "#"; if (link === "--hide--") return ""; // لتجاهل المباراة
globalMatchIndex++;
  return buildMatchCard(match, link);
}).join("");
          return <div class="match-section-title">${title}</div>${items};
        };
        div.innerHTML = "";
div.style.opacity = 0;
setTimeout(() => {
        div.innerHTML = 
          ${renderSection("جارية الآن", live)}
          ${renderSection("المباريات القادمة", upcoming)}
          ${renderSection("مباريات انتهت", ended)}
        ;
  div.style.transition = "opacity 0.5s ease";
  div.style.opacity = 1;
}, 200);
      } catch (e) {
        div.innerHTML = 
  <div class="joka-error">
    <img src="https://cdn-icons-png.flaticon.com/512/610/610395.png" width="70" style="margin-bottom: 10px;" />
    <h3>تعذر تحميل المباريات</h3>
    <p style="font-size:13px;opacity:0.8;">يرجى التحقق من الاتصال بالإنترنت أو المحاولة لاحقًا.</p>
    <button onclick="location.reload()" style="margin-top:10px;background:#39dbbf;color:white;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;">🔄 إعادة المحاولة</button>
  </div>
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
