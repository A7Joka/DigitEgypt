
(function () {
  const apiKey = document.currentScript.getAttribute("api-key");
  const containers = document.querySelectorAll("JokaMatch");

  const allowedKeys = {
    "ABC123XYZ": "2325258222068455523"
  };

  let currentBlogId;
  try {
    currentBlogId = window._WidgetManager._GetAllData().blog.blogId;
  } catch (e) {
    console.error("❌ Blog ID not found from Blogger context.");
    debugger;
    throw new Error("Unauthorized Access 🚫 [No Blog ID]");
  }

  if (!apiKey || !allowedKeys[apiKey]) {
    console.error("Unauthorized Access 🚫 [Invalid API Key]");
    debugger;
    throw new Error("Unauthorized Access 🚫");
  }

  if (allowedKeys[apiKey] !== currentBlogId) {
    console.error("Unauthorized Access 🚫 [Blog ID Mismatch]");
    debugger;
    throw new Error("Unauthorized Access 🚫");
  }

  if (!containers.length) {
    console.warn("❌ This script only runs inside <JokaMatch> tag");
    return;
  }

  const baseURL = "https://script.google.com/macros/s/AKfycby0xGjUv5LAreOP0LMejmekERzMq1QxBrRUbg4tf2QvODOs1GHUYmE_c21Zxdu7Fu6T/exec";

  const style = document.createElement("style");
  style.innerHTML = `
  .inline-match-item {
    display: flex;
    align-items: center;
    min-height: 60px;
    border-radius: 10px;
    background: var(--bg);
    margin-bottom: 5px;
    justify-content: center;
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
      const theme = div.getAttribute("theme") || "dark";

      div.style.setProperty('--bg', theme === "dark" ? '#151825' : '#f3f3f3');
      div.style.setProperty('--result-bg', theme === "dark" ? '#191D2D' : '#ddd');
      div.style.setProperty('--text', theme === "dark" ? '#BFC3D4' : '#222');

      try {
        const res = await fetch(`${baseURL}?date=${day}`);
        const json = await res.json();
        const matches = json.matches;

        const now = new Date();
        const live = [];
        const upcoming = [];
        const ended = [];

        matches.forEach(match => {
          const start = new Date(match.start);
          const status = match.status.trim();
          const diff = (start - now) / 1000;

          if (status.includes("جارية") || status.includes("شوط")) {
            live.push(match);
          } else if (status.includes("انتهت") || status.includes("إنتهت")) {
            ended.push(match);
          } else {
            upcoming.push(match);
          }
        });

        const renderSection = (title, list) => {
          if (!list.length) return "";
          const items = list.map(match => {
            return `
            <div class="inline-match-item">
              <div class="first-team">
                <div class="img"><img src="${match.logoR || ''}" alt=""></div>
                <b>${match.teams.right}</b>
              </div>
              <div class="result-wrap">
                <b>${match.score}</b>
              </div>
              <div class="second-team">
                <b>${match.teams.left}</b>
                <div class="img"><img src="${match.logoL || ''}" alt=""></div>
              </div>
            </div>`;
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
