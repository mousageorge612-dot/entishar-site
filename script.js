(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  var D = window.ENTISHAR || {};
  var C = D.contacts || {};
  var L = D.links || {};

  function wa(key, msg) {
    var num = (C[key] || C.main).wa;
    return "https://wa.me/" + num + (msg ? "?text=" + encodeURIComponent(msg) : "");
  }
  function serviceMsg(name) {
    return "مرحباً شركة انتشار، أرغب بالاستفسار عن خدمة " + name + ".";
  }

  /* روابط واتساب الثابتة */
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    var msg = a.getAttribute("data-msg");
    var svc = a.getAttribute("data-service-name");
    a.href = wa(a.getAttribute("data-wa"), svc ? serviceMsg(svc) : msg);
  });
  document.querySelectorAll("[data-link]").forEach(function (a) {
    var url = L[a.getAttribute("data-link")];
    if (url) a.href = url;
  });

  /* السنة */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* الرأس والقائمة */
  var header = document.querySelector(".site-header");
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("menuToggle");
  function closeMenu() {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "فتح القائمة");
    toggle.querySelector("use").setAttribute("href", "#i-menu");
  }
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
    toggle.querySelector("use").setAttribute("href", open ? "#i-close" : "#i-menu");
  });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeMenu(); closeLb(); } });
  window.addEventListener("scroll", function () {
    header.classList.toggle("scrolled", window.scrollY > 10);
  }, { passive: true });

  /* تمييز القسم الحالي في القائمة */
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]:not(.nav-cta)'));
  if ("IntersectionObserver" in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["hero", "services", "works", "process", "about", "contact"].forEach(function (id) {
      var el = document.getElementById(id); if (el) secObs.observe(el);
    });
  }

  /* الظهور التدريجي */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var rObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); rObs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { rObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* محدد الخدمة */
  var SERVICES = {
    design:  { name: "التصميم والهوية البصرية", icon: "i-design" },
    content: { name: "صناعة المحتوى", icon: "i-content" },
    web:     { name: "المواقع الإلكترونية", icon: "i-web" },
    ads:     { name: "التسويق والإعلانات", icon: "i-ads" },
    print:   { name: "المطبوعات", icon: "i-print" },
    pos:     { name: "أنظمة المحاسبة", icon: "i-pos" },
    office:  { name: "الخدمات المكتبية", icon: "i-office" }
  };
  var panel = document.getElementById("pickerPanel");
  var picks = document.querySelectorAll(".pick");
  var serviceSelect = document.getElementById("f-service");
  picks.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-service");
      var s = SERVICES[key];
      var card = document.getElementById("svc-" + key);
      picks.forEach(function (b) { b.setAttribute("aria-checked", String(b === btn)); });
      document.getElementById("pickerTitle").textContent = s.name;
      document.getElementById("pickerDesc").textContent = card.querySelector("p").textContent;
      var list = document.getElementById("pickerList");
      list.innerHTML = "";
      card.querySelectorAll(".ticks li").forEach(function (li, i) {
        if (i < 4) list.appendChild(li.cloneNode(true));
      });
      document.getElementById("pickerIcon").setAttribute("href", "#" + s.icon);
      document.getElementById("pickerWa").href = wa("main", serviceMsg(s.name));
      document.getElementById("pickerMore").href = "#svc-" + key;
      panel.hidden = false;
      panel.style.animation = "none"; void panel.offsetWidth; panel.style.animation = "";
      if (serviceSelect) serviceSelect.value = s.name;
    });
  });
  document.getElementById("pickerMore").addEventListener("click", function () {
    var id = this.getAttribute("href").slice(1);
    var card = document.getElementById(id);
    if (!card) return;
    document.querySelectorAll(".card.highlight").forEach(function (c) { c.classList.remove("highlight"); });
    card.classList.add("highlight");
    setTimeout(function () { card.classList.remove("highlight"); }, 2400);
  });

  /* المعرض */
  var CAT = { identity: "هوية بصرية", social: "سوشال ميديا", web: "مواقع إلكترونية", print: "مطبوعات وتغليف", menu: "منيو إلكتروني" };
  var gallery = document.getElementById("gallery");
  (D.works || []).forEach(function (w) {
    var cats = w.categories || (w.category ? [w.category] : []);
    var imgs = w.images || (w.image ? [w.image] : []);
    var item = document.createElement("article");
    item.className = "work" + (imgs.length ? "" : " placeholder");
    item.setAttribute("data-cat", cats.join(" "));
    var catName = CAT[cats[0]] || "";
    if (imgs.length) {
      var b = document.createElement("button");
      b.className = "work-media";
      b.type = "button";
      b.setAttribute("aria-label", "عرض: " + (w.title || catName));
      var img = document.createElement("img");
      img.src = w.thumb || imgs[0]; img.alt = (w.title || "") + " - " + catName; img.loading = "lazy";
      b.appendChild(img);
      if (imgs.length > 1) {
        var n = document.createElement("span"); n.className = "work-count"; n.textContent = imgs.length === 2 ? "صورتان" : imgs.length + " صور";
        b.appendChild(n);
      }
      b.addEventListener("click", function () { openLb(w, 0); });
      item.appendChild(b);
    } else {
      var ph = document.createElement("div");
      ph.className = "work-media";
      ph.innerHTML = '<div class="ph"><img src="assets/icon-512.png" alt="" width="56" height="56">يضاف قريباً</div>';
      item.appendChild(ph);
    }
    var info = document.createElement("div");
    info.className = "work-info";
    var h = document.createElement("h3"); h.textContent = w.title || "عمل من انتشار";
    info.appendChild(h);
    if (w.subtitle) { var p = document.createElement("p"); p.textContent = w.subtitle; info.appendChild(p); }
    var c = document.createElement("span"); c.textContent = cats.map(function (k) { return CAT[k]; }).filter(Boolean).join(" · ");
    info.appendChild(c);
    item.appendChild(info);
    gallery.appendChild(item);
  });
  var empty = document.createElement("p");
  empty.className = "empty-filter"; empty.textContent = "لا توجد أعمال في هذا التصنيف حالياً."; empty.hidden = true;
  gallery.appendChild(empty);

  document.querySelectorAll(".filter").forEach(function (f) {
    f.addEventListener("click", function () {
      var cat = f.getAttribute("data-filter");
      document.querySelectorAll(".filter").forEach(function (x) {
        x.classList.toggle("active", x === f); x.setAttribute("aria-selected", String(x === f));
      });
      var shown = 0;
      gallery.querySelectorAll(".work").forEach(function (w) {
        var show = cat === "all" || (" " + w.getAttribute("data-cat") + " ").indexOf(" " + cat + " ") > -1;
        w.hidden = !show; if (show) shown++;
      });
      empty.hidden = shown > 0;
    });
  });

  /* التكبير */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbPrev = document.getElementById("lbPrev"), lbNext = document.getElementById("lbNext");
  var lbLink = document.getElementById("lbLink");
  var lastFocus = null, cur = null, idx = 0;
  function showLb() {
    var imgs = cur.images || [cur.image];
    lbImg.src = imgs[idx]; lbImg.alt = (cur.title || "") + " " + (idx + 1);
    document.getElementById("lbCap").textContent = cur.title || "عمل من انتشار";
    document.getElementById("lbSub").textContent = cur.subtitle || "";
    document.getElementById("lbCount").textContent = imgs.length > 1 ? (idx + 1) + " / " + imgs.length : "";
    lbPrev.hidden = lbNext.hidden = imgs.length < 2;
    if (cur.url) { lbLink.href = cur.url; lbLink.hidden = false; } else { lbLink.hidden = true; }
  }
  function step(d) {
    if (!cur) return; var n = (cur.images || []).length; if (n < 2) return;
    idx = (idx + d + n) % n; showLb();
  }
  function openLb(w, i) {
    lastFocus = document.activeElement; cur = w; idx = i || 0; showLb();
    lb.hidden = false; document.body.style.overflow = "hidden";
    document.getElementById("lbClose").focus();
  }
  function closeLb() {
    if (lb.hidden) return;
    lb.hidden = true; document.body.style.overflow = ""; lbImg.src = "";
    if (lastFocus) lastFocus.focus();
  }
  lbPrev.addEventListener("click", function () { step(-1); });
  lbNext.addEventListener("click", function () { step(1); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "ArrowLeft") step(1); else if (e.key === "ArrowRight") step(-1);
  });
  var tx = null;
  lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) step(dx > 0 ? 1 : -1);
  });
  document.getElementById("lbClose").addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });

  /* بطاقات التواصل */
  var ICONS = { main: "i-wa", office: "i-user", support: "i-support", store: "i-store" };
  var cc = document.getElementById("contactCards");
  ["main", "office", "support", "store"].forEach(function (k) {
    var c = C[k]; if (!c) return;
    var el = document.createElement("div");
    el.className = "ccard reveal in" + (k === "store" ? " store" : "");
    var greet = k === "support" ? "مرحباً، أحتاج إلى الدعم الفني لنظام المحاسبة."
      : k === "store" ? "مرحباً متجر انتشار للمبدعين، أرغب بالاستفسار."
      : "مرحباً شركة انتشار، أرغب بالاستفسار.";
    el.innerHTML =
      '<div class="card-icon"><svg class="ico"><use href="#' + ICONS[k] + '"/></svg></div>' +
      "<h3></h3><p class=\"note\"></p>" +
      '<p class="num"></p>' +
      (k === "store" && L.store ? '<a class="store-link"></a>' : "") +
      '<div class="ccard-actions">' +
        '<a class="btn btn-wa" target="_blank" rel="noopener"><svg class="ico"><use href="#i-wa"/></svg> واتساب</a>' +
        '<a class="btn btn-soft"><svg class="ico"><use href="#i-phone"/></svg> اتصال</a>' +
      "</div>";
    el.querySelector("h3").textContent = c.label;
    el.querySelector(".note").textContent = c.note;
    el.querySelector(".num").textContent = c.intl;
    var acts = el.querySelectorAll(".ccard-actions a");
    acts[0].href = wa(k, greet);
    acts[0].setAttribute("aria-label", "واتساب " + c.label);
    acts[1].href = "tel:+" + c.wa;
    acts[1].setAttribute("aria-label", "اتصال " + c.label);
    var sl = el.querySelector(".store-link");
    if (sl) { sl.href = L.store; sl.textContent = "زيارة المتجر"; }
    cc.appendChild(el);
  });
  document.getElementById("addr").textContent = D.address || "";
  var hrs = document.getElementById("hours");
  (D.hours || []).forEach(function (h, i) {
    if (i) hrs.appendChild(document.createElement("br"));
    var s = document.createElement("span"); s.textContent = h; hrs.appendChild(s);
  });
  if (L.maps) {
    var mb = document.getElementById("mapBtn");
    mb.href = L.maps; mb.hidden = false;
  }

  /* نموذج الاستفسار */
  var form = document.getElementById("inquiryForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = form.elements;
    var val = function (n) { return (f[n].value || "").trim(); };
    var ok = true, first = null;
    ["name", "phone", "city", "type", "service"].forEach(function (n) {
      var v = val(n);
      var bad = !v || (n === "phone" && v.replace(/[^\d]/g, "").length < 7);
      f[n].closest(".field").classList.toggle("invalid", bad);
      f[n].setAttribute("aria-invalid", String(bad));
      if (bad) { ok = false; if (!first) first = f[n]; }
    });
    if (!ok) { first.focus(); return; }
    var details = val("details") || "لا يوجد";
    var msg = "مرحباً شركة انتشار، اسمي " + val("name") + ". أرغب بالاستفسار عن خدمة " + val("service") +
      ". نوع مشروعي " + val("type") + " في " + val("city") + ". التفاصيل: " + details +
      "\nرقم التواصل: " + val("phone");
    var url = wa("main", msg);
    var w = window.open(url, "_blank");
    if (!w) window.location.href = url;
  });
  form.querySelectorAll("input,select").forEach(function (el) {
    el.addEventListener("input", function () { el.closest(".field").classList.remove("invalid"); });
    el.addEventListener("change", function () { el.closest(".field").classList.remove("invalid"); });
  });
})();
