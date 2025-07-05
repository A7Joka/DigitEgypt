(function () {
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

  const baseURL = "https://script.google.com/macros/s/AKfycby0xGjUv5LAreOP0LMejmekERzMq1QxBrRUbg4tf2QvODOs1GHUYmE_c21Zxdu7Fu6T/exec";

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

.inline-match-item .result-wrap {
margin: 0 10px;
font-size: 11px;
width: 50px;
height: 18px;
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

const buildMatchCard = (match) => {
const status = formatStatus(match);
const className =
status.type === "live"
? "match-live"
: status.type === "upcoming"
? "match-upcoming"
: "match-ended";

let midContent = "";

if (status.type === "live") {
const percent = Math.max(0, Math.min(100, Math.round((status.minute / 90) * 100)));
midContent = `
<div class="result-wrap live" style="--percent:${percent}"> <b>${match["Team-Right"]["Goal"]} - ${match["Team-Left"]["Goal"]}</b> </div> `;
} else if (status.type === "upcoming") {
midContent = <div class="result-wrap"><b>${status.time}</b></div>;
} else if (status.type === "ended") {
const rightGoals = match["Team-Right"]["Goal"];
const leftGoals = match["Team-Left"]["Goal"];
const rightClass = rightGoals > leftGoals ? "winner" : rightGoals < leftGoals ? "loser" : "";
const leftClass = leftGoals > rightGoals ? "winner" : leftGoals < rightGoals ? "loser" : "";

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

<div class="inline-match-item ${className}"> <div class="first-team"> <div class="img"><img src="${match["Team-Right"]["Logo"]}" alt=""></div> <b>${match["Team-Right"]["Name"]}</b> </div> ${midContent} <div class="second-team"> <b>${match["Team-Left"]["Name"]}</b> <div class="img"><img src="${match["Team-Left"]["Logo"]}" alt=""></div> </div> </div> `;
};
  containers.forEach(container => {
    const divs = container.querySelectorAll("div[day]");
    divs.forEach(async div => {
      const day = div.getAttribute("day") || "today";
      const flt = div.getAttribute("flt") || "2";
      const theme = div.getAttribute("theme") || "dark";

      div.style.setProperty('--bg', theme === "dark" ? '#151825' : '#f3f3f3');
      div.style.setProperty('--result-bg', theme === "dark" ? '#191D2D' : '#ddd');
      div.style.setProperty('--text', theme === "dark" ? '#BFC3D4' : '#222');

      try {
        const res = await fetch(`${baseURL}?date=${day}`);
        const json = await res.json();
        const matches = json.matches;

        if (flt === "1") {
          const grouped = {};
          matches.forEach(match => {
            const cup = match["Cup-Name"] || "بطولات أخرى";
            if (!grouped[cup]) grouped[cup] = [];
            grouped[cup].push(match);
          });

          const html = Object.entries(grouped).map(([cup, list]) => {
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
            const section = sorted.map(buildMatchCard).join("");
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
          const items = list.map(buildMatchCard).join("");
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
