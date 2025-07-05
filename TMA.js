
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
    console.error("🚫 Unauthorized Access");
    debugger;
    return;
  }

  const baseURL = "https://script.google.com/macros/s/AKfycby0xGjUv5LAreOP0LMejmekERzMq1QxBrRUbg4tf2QvODOs1GHUYmE_c21Zxdu7Fu6T/exec";

  const style = document.createElement("style");
  style.innerHTML = `
  .inline-match-item {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60px;
    border-radius: 10px;
    margin-bottom: 5px;
    padding: 18px;
    flex-wrap: wrap;
  }
  .match-live { border-left: 4px solid #FF3131; background: #1c1f2e; }
  .match-upcoming { border-left: 4px solid #FFB400; background: #232636; }
  .match-ended { border-left: 4px solid #444; background: #151825; }

  .inline-match-item .first-team,
  .inline-match-item .second-team {
    flex: 1;
    display: flex;
    align-items: center;
    font-size: 12px;
    color: var(--text);
  }
  .inline-match-item .img {
    width: 26px;
    height: 26px;
    margin-right: 10px;
  }
  .inline-match-item .img img {
    max-width: 100%;
    max-height: 100%;
  }
  .match-section-title {
    font-weight: bold;
    margin: 10px 0 5px;
    color: var(--text);
    font-size: 16px;
  }
  .cup-title {
    width: 100%;
    font-size: 13px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 6px;
    color: var(--text);
  }
  .live-center {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .live-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #FF3131;
    color: #fff;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
  .status-below {
    font-size: 11px;
    margin-top: 4px;
    color: var(--text);
  }
  .match-time {
    font-size: 16px;
    font-weight: bold;
    color: var(--text);
    text-align: center;
  }
  .match-result-center {
    text-align: center;
  }
  .ended-label {
    font-size: 11px;
    color: var(--text);
    margin-bottom: 2px;
  }
  .result-score {
    font-size: 16px;
    font-weight: bold;
    color: var(--text);
  }
`;
  document.head.appendChild(style);

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

       const formatStatus = (match) => {
  const now = new Date();
  const start = new Date(match["Time-Start"]);
  const timeNow = match["Time-Now"];
  const status = match["Match-Status"];
  const diffMin = Math.floor((start - now) / 60000);

  if (status.includes("جارية") || status.includes("شوط")) {
    const minute = (timeNow > 0 && timeNow <= 130) ? `${timeNow}` : "غير محددة";
    return { label: status, minute: minute, type: "live" };
  } else if (status.includes("انتهت")) {
    return { label: "انتهت", type: "ended" };
  } else {
    return {
      label: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "upcoming"
    };
  }
};

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
            const section = sorted.map(match => {
              const statusData = formatStatus(match);
              const className = statusData.type === "live" ? "match-live" : statusData.type === "upcoming" ? "match-upcoming" : "match-ended";
              return `
                <div class="inline-match-item ${className}">
                  <div class="first-team">
                    <div class="img"><img src="${match["Team-Right"]["Logo"]}" alt=""></div>
                    <b>${match["Team-Right"]["Name"]}</b>
                  </div>
                  <div class="result-wrap">
                    <b>${match["Team-Right"]["Goal"]} - ${match["Team-Left"]["Goal"]}</b>
                  </div>
                  <div class="second-team">
                    <b>${match["Team-Left"]["Name"]}</b>
                    <div class="img"><img src="${match["Team-Left"]["Logo"]}" alt=""></div>
                  </div>
                  <div class="match-status">${statusData.label}</div>
                </div>
              `;
            }).join("");

            return `<div class="match-section-title">${cup}</div>${section}`;
          }).join("");

          div.innerHTML = html;
          return;
        }

        // FLT = 2 (عرض حسب الحالة لكن مع اسم البطولة)
        const live = [], upcoming = [], ended = [];
        matches.forEach(match => {
          const status = match["Match-Status"];
          if (status.includes("جارية") || status.includes("شوط")) live.push(match);
          else if (status.includes("انتهت") || status.includes("إنتهت")) ended.push(match);
          else upcoming.push(match);
        });

        const renderSection = (title, list) => {
  if (!list.length) return "";
  const items = list.map(match => {
    const status = formatStatus(match);
    const className = status.type === "live" ? "match-live" : status.type === "upcoming" ? "match-upcoming" : "match-ended";
    let midContent = "";

    if (status.type === "live") {
      midContent = `<div class="live-center">
        <div class="live-circle">${status.minute}</div>
        <div class="status-below">${status.label}</div>
      </div>`;
    } else if (status.type === "upcoming") {
      midContent = `<div class="match-time"><b>${status.label}</b></div>`;
    } else if (status.type === "ended") {
      midContent = `<div class="match-result-center">
        <div class="ended-label">انتهت</div>
        <div class="result-score">${match["Team-Right"]["Goal"]} - ${match["Team-Left"]["Goal"]}</div>
      </div>`;
    }

    return `
      <div class="cup-title">${match["Cup-Name"] || "بطولة غير معروفة"}</div>
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
