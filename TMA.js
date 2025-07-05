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
    debugger;
    return;
  }

  const baseURL = "https://script.google.com/macros/s/AKfycby0xGjUv5LAreOP0LMejmekERzMq1QxBrRUbg4tf2QvODOs1GHUYmE_c21Zxdu7Fu6T/exec";

  const style = document.createElement("style");
  style.innerHTML = ` .inline-match-item {
      display: flex;
      align-items: center;
      min-height: 60px;
      border-radius: 10px;
      background: #151825;
      margin-bottom: 5px;
      justify-content: center;
      padding: 18px;
      position: relative;
      flex-wrap: wrap;
    }

    .inline-match-item .first-team,
    .inline-match-item .second-team {
      flex: 1;
    }

    .inline-match-item .first-team .team---item,
    .inline-match-item .first-team a,
    .inline-match-item .second-team .team---item,
    .inline-match-item .second-team a {
      color: #BFC3D4;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
    }

    .inline-match-item .first-team .team---item b,
    .inline-match-item .first-team a b,
    .inline-match-item .second-team .team---item b,
    .inline-match-item .second-team a b {
      font-weight: bold;
    }

    .inline-match-item .first-team .img,
    .inline-match-item .second-team .img {
      width: 26px;
      height: 26px;
      flex: 0 0 auto;
      margin-right: 10px;
      text-align: center;
    }

    .inline-match-item .first-team .img img,
    .inline-match-item .second-team .img img {
      max-width: 100%;
      max-height: 100%;
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

    .match-section-title {
      font-weight: bold;
      margin: 10px 0 5px;
      color: #BFC3D4;
      font-size: 16px;
    }

    .cup-title {
      width: 100%;
      font-size: 13px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 6px;
      color: #BFC3D4;
    }

    .goal-number {
      font-size: 14px;
      font-weight: bold;
      min-width: 20px;
      text-align: center;
      color: #BFC3D4;
    }

    .live-progress {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: conic-gradient(#FF3131 calc(var(--percent, 0%) * 1%), #555 0);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    }

    .live-center {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .status-below {
      font-size: 11px;
      margin-top: 4px;
      color: #BFC3D4;
    }

    .match-time {
      font-size: 16px;
      font-weight: bold;
      color: #BFC3D4;
      text-align: center;
    }

    .match-result-center {
      text-align: center;
    }

    .ended-label {
      font-size: 11px;
      color: #BFC3D4;
      margin-bottom: 2px;
    }

    .result-score {
      font-size: 16px;
      font-weight: bold;
      color: #BFC3D4;
    }
  `;
  document.head.appendChild(style);


  const formatStatus = (match) => {
    const now = new Date();
    const start = new Date(match["Time-Start"]);
    const timeNow = match["Time-Now"];
    const status = match["Match-Status"];
    const diffMin = Math.floor((start - now) / 60000);

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
    const className = status.type === "live" ? "match-live"
                     : status.type === "upcoming" ? "match-upcoming"
                     : "match-ended";

    let midContent = "";

    if (status.type === "live") {
      const percent = Math.max(0, Math.min(100, Math.round((status.minute / 90) * 100)));
      midContent = `
        <div class="result-wrap live" style="--percent:${percent}">
          <b>${match["Team-Right"]["Goal"]} - ${match["Team-Left"]["Goal"]}</b>
          <div class="live">${status.minute}'</div>
        </div>
      `;
    } else if (status.type === "upcoming") {
      midContent = `<div class="result-wrap"><b>${status.time}</b></div>`;
    } else if (status.type === "ended") {
      midContent = `<div class="result-wrap"><b>${match["Team-Right"]["Goal"]} - ${match["Team-Left"]["Goal"]}</b></div>`;
    }

    return `
      <div class="inline-match-item ${className}">
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

        // FLT = 2
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
