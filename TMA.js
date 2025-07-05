(function () {
  const baseURL = "https://script.google.com/macros/s/AKfycby0xGjUv5LAreOP0LMejmekERzMq1QxBrRUbg4tf2QvODOs1GHUYmE_c21Zxdu7Fu6T/exec";

  // حظر التشغيل خارج الوسم
  const containers = document.querySelectorAll("JokaMatch");
  if (!containers.length) {
    console.warn("❌ هذا السكربت لا يعمل إلا داخل وسم <JokaMatch>");
    return;
  }

  containers.forEach(container => {
    const divs = container.querySelectorAll("div[day]");
    divs.forEach(async (div) => {
      const day = div.getAttribute("day") || "today";
      const num = div.getAttribute("num") || "1"; // التصميم
      const url = div.getAttribute("url")?.split(",") || [];

      try {
        const res = await fetch(`${baseURL}?date=${day}`);
        const json = await res.json();
        const matches = json.matches;

        if (!matches || !matches.length) {
          div.innerHTML = `<p>لا توجد مباريات لليوم (${day})</p>`;
          return;
        }

        const html = matches.map((match, index) => {
          const teamR = match.teams.right;
          const teamL = match.teams.left;
          const status = match.status;
          const score = match.score;
          const cup = match.cup;
          const time = new Date(match.start);
          const now = new Date();
          const diff = Math.floor((time - now) / 1000); // بالثواني

          let countdown = '';
          if (diff > 0) {
            const min = Math.floor(diff / 60);
            const sec = diff % 60;
            countdown = ` | تبدأ خلال ${min} دقيقة`;
          }

          return `
            <div style="border:1px solid #ddd; padding:10px; margin:10px 0; border-radius:10px; background:#f9f9f9; text-align:center;">
              <div><strong>${cup}</strong></div>
              <div style="margin-top:5px;">
                <img src="${match.logoR || ''}" style="width:25px;height:25px;vertical-align:middle"> 
                <strong>${teamR}</strong>
                <span style="margin:0 10px;">${score}</span>
                <strong>${teamL}</strong> 
                <img src="${match.logoL || ''}" style="width:25px;height:25px;vertical-align:middle">
              </div>
              <div style="margin-top:5px; color:gray;">${status}${countdown}</div>
            </div>
          `;
        }).join("");

        div.innerHTML = html;
      } catch (err) {
        div.innerHTML = `<p style="color:red">⚠️ حدث خطأ أثناء تحميل البيانات</p>`;
        console.error(err);
      }
    });
  });
})();
