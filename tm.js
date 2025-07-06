(function () {// إعدادات التحقق
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
  console.error("⛔ Unauthorized Access - BlogID or API Key mismatch");
  containers.forEach(el => {
    el.innerHTML = `
      <div style="color: red; text-align: center; padding: 20px;">
        ⛔ غير مصرح لك باستخدام هذه الأداة<br/>
        <a href="https://wa.me/201234567890" target="_blank" style="color: #39DBBF;">تواصل مع المطور</a>
      </div>
    `;
  });
  throw new Error("Unauthorized");
}

// ⚙️ دالة التوقيع SHA-256
async function generateSignature(str) {
  const buffer = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}

containers.forEach(async container => {
  const targetDiv = container.querySelector('div[day]');
  if (!targetDiv) return;

  const day = targetDiv.getAttribute("day") || "today";

  // 🔒 إعداد التوقيع
  const SECRET = "NinJ0kaKey";
  const ts = Math.floor(Date.now() / 1000);
  const sig = await generateSignature(`${ts}:${SECRET}`);

  // 🌀 عرض اللودينج
  targetDiv.innerHTML = `
    <div style="text-align:center; padding: 20px;">
      <img src="https://i.imgur.com/llF5iyg.gif" alt="loading..." style="width: 40px;" />
    </div>
  `;

  // 🔗 رابط البروكسي الآمن
  const url = `https://joka.abdallah-hussein193193.workers.dev/?ts=${ts}&sig=${sig}&date=${encodeURIComponent(day)}`;

  fetch(url, {
  headers: {
    "X-From-Joka": "YES"
  }
})
    .then(res => res.text())
    .then(data => {
      try {
        const parsed = JSON.parse(data.replace(/^NinJoka\((.*)\)$/, "$1"));

        if (parsed.error) {
          if (parsed.message.includes("Unauthorized")) {
            targetDiv.innerHTML = `
              <div style="text-align:center; color:red; padding:20px;">
                ⛔ غير مصرح بالوصول<br/>
                <a href="https://wa.me/201234567890" target="_blank" style="color:#39DBBF;">تواصل مع المطور</a>
              </div>
            `;
          } else {
            throw new Error(parsed.message);
          }
          return;
        }

        const matches = parsed.matches || [];

        if (matches.length === 0) {
          targetDiv.innerHTML = `
            <div style="text-align:center; padding:20px; color:gray;">
              ⚽ لا توجد مباريات اليوم.
            </div>
          `;
          return;
        }

        // ✅ عرض المباريات بشكل مبدئي
        targetDiv.innerHTML = matches.map(match => `
          <div style="margin:10px; padding:10px; background:#1f1f1f; color:#fff; border-radius:8px;">
            <strong>${match["Team-Left"]?.Name || ""}</strong>
            vs
            <strong>${match["Team-Right"]?.Name || ""}</strong><br/>
            <small>${match["Time"] || ""} - ${match["Cup-Name"] || ""}</small>
          </div>
        `).join('');
      } catch (err) {
        targetDiv.innerHTML = `
          <div style="text-align:center; padding:20px; color:red;">
            ⚠️ مشكلة في جلب البيانات<br/>
            <button onclick="location.reload()" style="margin-top:10px;padding:5px 15px;background:#39DBBF;color:#fff;border:none;border-radius:5px;">أعد المحاولة</button>
          </div>
        `;
      }
    })
    .catch(() => {
      targetDiv.innerHTML = `
        <div style="text-align:center; padding:20px; color:red;">
          ❌ لا يمكن الاتصال بالسيرفر<br/>
          <button onclick="location.reload()" style="margin-top:10px;padding:5px 15px;background:#39DBBF;color:#fff;border:none;border-radius:5px;">إعادة تحميل</button>
        </div>
      `;
    });
});
})();
