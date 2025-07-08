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

  const allowedKeys = {
    "ABC123XYZ": "2325258222068455523"
  };

  let currentBlogId = null;
  try {
    if (window._WidgetManager && typeof _WidgetManager._GetAllData === "function") {
      currentBlogId = _WidgetManager._GetAllData().blog.blogId;
    }
  } catch (e) {}
  if (!currentBlogId) {
    const meta = document.querySelector('meta[name="joka-blog-id"]');
    currentBlogId = meta?.getAttribute("content") || null;
  }
  if (!currentBlogId || allowedKeys[apiKey] !== currentBlogId) {
    console.error("\uD83D\uDEAB Unauthorized Access");
    return;
  }
// ثم استخدمه هكذا
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
} else if (status.includes("انتهت")) {
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

if ((isFirstHalf && rawMinute > 45) || (isSecondHalf && rawMinute > 90)) {
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
    <div class="match-inner-progress-wrap" id="progress-wrap-${matchId}" data-base="${baseMinute}" data-extra="${extraTime}" data-show-extra="${showExtra}">
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
      const flt = div.getAttribute("flt") || "2";
      const theme = div.getAttribute("theme") || "dark";

      div.style.setProperty('--bg', theme === "dark" ? '#151825' : '#f3f3f3');
div.style.setProperty('--progress-bg', theme === "dark" ? '#191D2D' : '#eee');
div.style.setProperty('--progress-track', theme === "dark" ? '#333' : '#ccc');
div.style.setProperty('--progress-color', theme === "dark" ? '#39DBBF' : '#007acc');
      div.style.setProperty('--result-bg', theme === "dark" ? '#191D2D' : '#ddd');
      div.style.setProperty('--text', theme === "dark" ? '#BFC3D4' : '#222');
const linksAttr = div.getAttribute("link") || "";
const linksArray = linksAttr.split(",").map(l => l.trim());
let globalMatchIndex = 0;
      try {
        const matches = await fetchMatches(day);
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
            const section = sorted.map((match, index) => {
const link = linksArray[globalMatchIndex] || "#";
              globalMatchIndex++;
  return buildMatchCard(match, link);
}).join("");

            return `<div class="match-section-title">${cup}</div>${section}`;
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

        const renderSection = (title, list) => {
          if (!list.length) return "";
const items = list.map((match, index) => {
const link = linksArray[globalMatchIndex] || "#";
globalMatchIndex++;
  return buildMatchCard(match, link);
}).join("");
          return `<div class="match-section-title">${title}</div>${items}`;
        };

        div.innerHTML = `
          ${renderSection("جارية الآن", live)}
          ${renderSection("المباريات القادمة", upcoming)}
          ${renderSection("مباريات انتهت", ended)}
        `;
      } catch (e) {
        div.innerHTML = "<p style='color:red'>⚠️ حدث خطأ أثناء تحميل البيانات</p>";
        console.error(e);
      }
    });
  });
})();
const r = 35;
const circumference = 2 * Math.PI * r;

setInterval(() => {
  document.querySelectorAll(".match-inner-progress-wrap").forEach(wrapper => {
    const timeEl = wrapper.querySelector(".number");
    const percentEl = wrapper.querySelector(".percent");
    const base = parseInt(wrapper.dataset.base || "0");
    const extra = parseInt(wrapper.dataset.extra || "0");
    const showExtra = wrapper.dataset.showExtra === "true";

    let count = base;
    let seconds = parseInt(wrapper.dataset.seconds || "0");

    seconds = (seconds + 1) % 60;
    if (seconds === 0) count++;

    wrapper.dataset.seconds = seconds;

    const secStr = String(seconds).padStart(2, '0');

    const percent = Math.min(100, (count / 90) * 100);

    // تحديث المتغيرات الخاصة بـ CSS
    percentEl.style.setProperty('--circumference', `${circumference}`);
    percentEl.style.setProperty('--percent', percent);
    percentEl.style.setProperty('--num', percent);

    // عرض الوقت
    if (timeEl) timeEl.textContent = `${count}:${secStr}`;

    // الوقت الإضافي
    const extraEl = wrapper.querySelector(".extra-count");
    if (extraEl && showExtra) {
      const liveExtra = count - base;
      extraEl.textContent = `${liveExtra}:${secStr}`;
    }
  });
}, 1000);

