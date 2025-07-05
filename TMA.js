// 🔒 سكربت JokaMatch - الإصدار الأول (آمن + مبني على JSON)

(function () {
  // 🔐 إعدادات العميل (تُعدل عند البيع)
  const CLIENT_API_KEY = "ABC123XYZ";
  const CLIENT_BLOG_ID = "813492376149827";

  // 🔒 التحقق من الـ Blog ID الموجود في <meta>
  const blogMeta = document.querySelector('meta[name="joka-blog-id"]');
  const blogId = blogMeta ? blogMeta.content : null;

  // 🔒 التحقق من API Key
  const currentScript = document.currentScript;
  const apiKeyFromScript = currentScript ? currentScript.getAttribute("api-key") : null;

  if (blogId !== CLIENT_BLOG_ID || apiKeyFromScript !== CLIENT_API_KEY) {
    debugger;
    document.body.innerHTML = "<h1 style='color:red;text-align:center'>Unauthorized Access 🚫</h1>";
    throw new Error("Unauthorized Access to JokaMatch");
  }

  // 🔍 البحث عن وسم <JokaMatch>
  const jokaTags = document.getElementsByTagName("JokaMatch");
  if (!jokaTags.length) return;

  const divs = jokaTags[0].querySelectorAll("div[day]");

  divs.forEach(div => {
    const day = div.getAttribute("day") || "today";
    const design = div.getAttribute("num") || "1";
    const links = div.getAttribute("url") || "";

    const apiUrl = `https://www.yanb8.com/api/matches/?date=${day}`;

    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        const matches = data["STING-WEB-Matches"] || [];
        div.innerHTML = generateDesign(matches, design);
      })
      .catch(err => {
        console.error("API Error:", err);
        div.innerHTML = "<p style='color:red'>⚠️ حدث خطأ أثناء تحميل البيانات</p>";
      });
  });

  // 🎨 توليد التصميم
  function generateDesign(matches, num) {
    if (num === "1") {
      return matches.map(match => {
        const team1 = match["Team-Right"];
        const team2 = match["Team-Left"];
        const status = match["Match-Status"];
        const time = match["Time-Start"].split("T")[1].slice(0, 5);

        return `
          <div style="
            border: 1px solid #ccc;
            margin: 10px 0;
            padding: 10px;
            border-radius: 8px;
            font-family: sans-serif;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f9f9f9;
            direction: rtl;">

            <div style="text-align: center; flex: 1;">
              <img src="https://www.yanb8.com${team1.Logo}" alt="${team1.Name}" width="30" height="30" />
              <div>${team1.Name}</div>
            </div>

            <div style="text-align: center; flex: 1;">
              <strong>${team1.Goal} - ${team2.Goal}</strong>
              <div style="font-size: 12px; color: gray">${status}</div>
              <div style="font-size: 11px;">${time}</div>
            </div>

            <div style="text-align: center; flex: 1;">
              <img src="https://www.yanb8.com${team2.Logo}" alt="${team2.Name}" width="30" height="30" />
              <div>${team2.Name}</div>
            </div>
          </div>
        `;
      }).join("");
    }

    // 👇 تقدر تضيف تصميمات تانية هنا لاحقًا
    return "<p>⚠️ تصميم غير مدعوم</p>";
  }
})();
