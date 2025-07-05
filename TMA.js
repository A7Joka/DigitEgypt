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
      background: var(--bg);
      margin-bottom: 5px;
      padding: 18px;
      flex-wrap: wrap;
    }
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
    .inline-match-item .result-wrap {
      width: 62px;
      height: 20px;
      border-radius: 50px;
      background: var(--result-bg);
      color: var(--text);
      font-size: 12px;
      font-weight: bold;
      margin: 0 15px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .match-section-title {
      font-weight: bold;
      margin: 10px 0 5px;
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

        const now = new Date();

        if (flt === "1") {
          const grouped = {};
          matches.forEach(match => {
            const cup = match["Cup-Name"] || "بطولات أخرى";
            if (!grouped[cup]) grouped[cup] = [];
            grouped[cup].push(match);
          });

          const html = Object.entries(grouped).map(([cup, list]) => {
            const section = list.map(match => `
              <div class="inline-match-item">
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
                <div style="width:100%;text-align:center;font-size:11px;margin-top:5px;color:var(--text);">
                  ${match["Match-Status"]}
                </div>
              </div>
            `).join("");
            return `<div class="match-section-title">${cup}</div>${section}`;
          }).join("");

          div.innerHTML = html;
          return;
        }

        // FLT=2
        const live = [], upcoming = [], ended = [];
        matches.forEach(match => {
          const status = match["Match-Status"];
          if (status.includes("جارية") || status.includes("شوط")) live.push(match);
          else if (status.includes("انتهت") || status.includes("إنتهت")) ended.push(match);
          else upcoming.push(match);
        });

        const renderSection = (title, list) => {
          if (!list.length) return "";
          const items = list.map(match => `
            <div class="inline-match-item">
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
            </div>
          `).join("");
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
