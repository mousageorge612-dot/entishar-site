/* إعدادات الاتصال بقاعدة بيانات المتجر (Supabase).
   هذا المفتاح عام (publishable) ومخصص للمتصفح؛ الحماية تتم عبر صلاحيات قاعدة البيانات. */
window.STORE_CONFIG = {
  supabaseUrl: "https://rdrksssxgeicwlcednsb.supabase.co",
  supabaseKey: "sb_publishable_kchpnnH6nzx2gR2ISvDpoQ_yFlorAwg",
  bucket: "media",
  // يُستخدم إذا لم يُضبط رقم من لوحة التحكم
  whatsappFallback: "963968747231"
};

window.Store = (function () {
  const cfg = window.STORE_CONFIG;
  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
    auth: { persistSession: true, storageKey: "entishar-store-auth" }
  });

  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  // يسمح فقط بروابط http(s) أو مسارات نسبية للصور
  const safeUrl = (u) => {
    u = String(u || "").trim();
    if (!u) return "";
    if (/^https?:\/\//i.test(u) || /^(\.{0,2}\/)?[\w\-./]+$/.test(u)) return u;
    return "";
  };

  const cleanPlans = (plans) => (Array.isArray(plans) ? plans : [])
    .map((p) => ({ label: String(p && p.label || "").trim(), price: String(p && p.price || "").trim() }))
    .filter((p) => p.label || p.price);

  const initials = (name) => {
    const w = String(name || "").trim().split(/\s+/).filter(Boolean);
    return (w.length > 1 ? w[0][0] + w[1][0] : (w[0] || "؟").slice(0, 2)).toUpperCase();
  };

  const waNumber = (n) => String(n || cfg.whatsappFallback).replace(/[^\d]/g, "");
  const waLink = (number, text) => "https://wa.me/" + waNumber(number) + (text ? "?text=" + encodeURIComponent(text) : "");

  const orderText = (service, plan) => {
    let t = "مرحباً متجر انتشار، أريد طلب: " + service.name;
    if (plan) t += "\nالخيار: " + [plan.label, plan.price].filter(Boolean).join(" - ");
    return t;
  };

  // اتجاه السعر حسب محتواه حتى لا تنقلب العملة أو الأرقام
  const priceTag = (txt, cls) => '<span class="' + cls + '" dir="' + (/[\u0600-\u06FF]/.test(txt) ? "rtl" : "ltr") + '">' + esc(txt) + "</span>";

  function priceLine(plans) {
    if (!plans.length) return '<span class="price-ask">اسأل عن السعر</span>';
    const first = plans[0];
    let html = "";
    if (first.price) html += priceTag(first.price, "price");
    if (first.label) html += '<span class="price-label">' + esc(first.label) + "</span>";
    if (!first.price) html = '<span class="price-ask">' + (first.label ? esc(first.label) + " · " : "") + "اسأل عن السعر</span>";
    if (plans.length > 1) html += '<span class="price-more">' + (plans.length === 2 ? "خيار إضافي" : (plans.length - 1) + " خيارات إضافية") + "</span>";
    return html;
  }

  function iconHTML(s, cls) {
    const url = safeUrl(s.icon_url);
    return '<span class="' + (cls || "svc-icon") + '">' + (url
      ? '<img src="' + esc(url) + '" alt="" loading="lazy" referrerpolicy="no-referrer">'
      : '<span class="svc-initials">' + esc(initials(s.name)) + "</span>") + "</span>";
  }

  function coverStyle(s) {
    const a = /^#[0-9a-f]{6}$/i.test(s.accent || "") ? s.accent : "#7B3FD6";
    return "--accent:" + a;
  }

  function coverHTML(s) {
    const url = safeUrl(s.cover_url);
    return '<div class="svc-cover" style="' + coverStyle(s) + '">' +
      (url ? '<img src="' + esc(url) + '" alt="" loading="lazy" referrerpolicy="no-referrer">'
           : '<span class="cover-fallback" aria-hidden="true">' + (safeUrl(s.icon_url) ? '<img src="' + esc(s.icon_url) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : "") + "</span>") +
      (s.badge ? '<span class="svc-badge">' + esc(s.badge) + "</span>" : "") +
      "</div>";
  }

  // بطاقة الخدمة (تستخدم في المتجر وفي معاينة لوحة التحكم)
  function cardHTML(s, catName) {
    const plans = cleanPlans(s.plans);
    return '<article class="svc-card' + (s.featured ? " is-featured" : "") + '" data-id="' + esc(s.id || "") + '">' +
      '<button class="svc-hit" type="button" data-open="' + esc(s.id || "") + '" aria-label="تفاصيل ' + esc(s.name) + '"></button>' +
      coverHTML(s) +
      '<div class="svc-body">' +
        iconHTML(s) +
        (catName ? '<span class="svc-cat">' + esc(catName) + "</span>" : "") +
        '<h3 class="svc-name">' + esc(s.name || "اسم الخدمة") + "</h3>" +
        (s.summary ? '<p class="svc-summary">' + esc(s.summary) + "</p>" : "") +
        '<div class="svc-foot">' +
          '<div class="svc-price">' + priceLine(plans) + "</div>" +
          '<a class="btn btn-wa btn-sm" data-order="' + esc(s.id || "") + '" href="#" rel="noopener">اطلب</a>' +
        "</div>" +
      "</div>" +
    "</article>";
  }

  return { sb, cfg, esc, safeUrl, cleanPlans, initials, waLink, waNumber, orderText, iconHTML, coverHTML, cardHTML, priceLine, priceTag };
})();
