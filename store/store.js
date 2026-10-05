(function () {
  const { sb, esc, cleanPlans, waLink, orderText, cardHTML, iconHTML, coverHTML, priceTag } = window.Store;
  const $ = (s) => document.querySelector(s);

  const state = { services: [], cats: [], settings: {}, cat: "all", q: "" };
  const grid = $("#grid"), chips = $("#chips"), empty = $("#empty"), modal = $("#modal");
  $("#year").textContent = new Date().getFullYear();

  const catName = (id) => (state.cats.find((c) => c.id === id) || {}).name || "";
  const findSvc = (id) => state.services.find((s) => s.id === id);
  const wa = () => state.settings.whatsapp;

  function applySettings() {
    const num = wa();
    document.querySelectorAll("[data-wa]").forEach((a) => (a.href = waLink(num, "مرحباً متجر انتشار، أريد الاستفسار عن خدمة.")));
    if (num) {
      const d = String(num).replace(/\D/g, "");
      document.querySelectorAll("[data-tel]").forEach((a) => (a.href = "tel:+" + d));
      if (d.length === 12) document.querySelectorAll("[data-phone]").forEach((el) => (el.textContent = "+" + d.slice(0, 3) + " " + d.slice(3, 6) + " " + d.slice(6, 9) + " " + d.slice(9)));
    }
    const ann = (state.settings.announcement || "").trim();
    const bar = $("#announce");
    bar.textContent = ann;
    bar.hidden = !ann;
  }

  function renderChips() {
    const counts = {};
    state.services.forEach((s) => (counts[s.category_id] = (counts[s.category_id] || 0) + 1));
    const cats = state.cats.filter((c) => counts[c.id]);
    if (state.cat !== "all" && !cats.some((c) => c.id === state.cat)) state.cat = "all";
    chips.innerHTML = [{ id: "all", name: "الكل", n: state.services.length }]
      .concat(cats.map((c) => ({ id: c.id, name: c.name, n: counts[c.id] })))
      .map((c) => '<button type="button" role="tab" class="chip" data-cat="' + esc(c.id) + '" aria-selected="' + (state.cat === c.id) + '">' + esc(c.name) + ' <span class="chip-n">' + c.n + "</span></button>")
      .join("");
    chips.hidden = state.services.length === 0;
  }

  const norm = (s) => String(s || "").toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");

  function renderGrid() {
    const q = norm(state.q.trim());
    const list = state.services.filter((s) =>
      (state.cat === "all" || s.category_id === state.cat) &&
      (!q || norm([s.name, s.summary, s.badge, catName(s.category_id)].join(" ")).includes(q)));
    grid.innerHTML = list.map((s) => cardHTML(s, catName(s.category_id))).join("");
    if (!state.services.length) {
      empty.innerHTML = '<h2>نجهّز قائمة الخدمات</h2><p>تواصل معنا عبر واتساب لمعرفة الخدمات المتوفرة حالياً.</p><a class="btn btn-wa" target="_blank" rel="noopener" href="' + esc(waLink(wa(), "مرحباً متجر انتشار، أريد معرفة الخدمات المتوفرة.")) + '"><svg class="ico"><use href="#i-wa"/></svg>تواصل عبر واتساب</a>';
      empty.hidden = false;
    } else if (!list.length) {
      empty.innerHTML = '<h2>لا توجد نتائج</h2><p>لم نجد خدمة مطابقة. اسألنا عنها عبر واتساب.</p><a class="btn btn-wa" target="_blank" rel="noopener" href="' + esc(waLink(wa(), "مرحباً متجر انتشار، هل تتوفر خدمة: " + state.q.trim())) + '"><svg class="ico"><use href="#i-wa"/></svg>اسأل عن الخدمة</a>';
      empty.hidden = false;
    } else empty.hidden = true;
  }

  function openModal(id, push) {
    const s = findSvc(id);
    if (!s) return;
    const plans = cleanPlans(s.plans);
    const body = $("#modal-body");
    body.innerHTML =
      '<button class="modal-close" type="button" data-close aria-label="إغلاق"><svg class="ico"><use href="#i-close"/></svg></button>' +
      coverHTML(s) +
      '<div class="modal-content">' +
        '<div class="modal-head">' + iconHTML(s, "svc-icon svc-icon-lg") +
          '<div><span class="svc-cat">' + esc(catName(s.category_id)) + '</span><h2 id="m-name">' + esc(s.name) + "</h2></div></div>" +
        (s.summary ? '<p class="modal-summary">' + esc(s.summary) + "</p>" : "") +
        (s.details ? '<div class="modal-details">' + esc(s.details) + "</div>" : "") +
        (plans.length ? '<fieldset class="plans"><legend>اختر الخيار</legend>' + plans.map((p, i) =>
          '<label class="plan"><input type="radio" name="plan" value="' + i + '"' + (i === 0 ? " checked" : "") + '><span class="plan-label">' + esc(p.label || "الخيار " + (i + 1)) + '</span>' + (p.price ? priceTag(p.price, "plan-price") : '<span class="plan-price price-ask">اسأل عن السعر</span>') + "</label>").join("") + "</fieldset>"
          : '<p class="price-ask">السعر عند الاستفسار عبر واتساب.</p>') +
        '<a class="btn btn-wa btn-block" id="m-order" target="_blank" rel="noopener" href="#"><svg class="ico"><use href="#i-wa"/></svg>اطلب عبر واتساب</a>' +
      "</div>";
    const order = body.querySelector("#m-order");
    const sync = () => {
      const sel = body.querySelector('input[name="plan"]:checked');
      order.href = waLink(wa(), orderText(s, sel ? plans[+sel.value] : null));
    };
    body.querySelectorAll('input[name="plan"]').forEach((r) => r.addEventListener("change", sync));
    sync();
    if (!modal.open) modal.showModal();
    if (push !== false) history.replaceState(null, "", "#s=" + s.id);
  }

  function closeModal() {
    if (modal.open) modal.close();
  }
  modal.addEventListener("close", () => { if (location.hash.startsWith("#s=")) history.replaceState(null, "", location.pathname + location.search); });
  modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest("[data-close]")) closeModal(); });

  grid.addEventListener("click", (e) => {
    const order = e.target.closest("[data-order]");
    if (order) {
      const s = findSvc(order.dataset.order);
      const plans = cleanPlans(s.plans);
      if (plans.length > 1) { e.preventDefault(); openModal(s.id); return; }
      order.href = waLink(wa(), orderText(s, plans[0]));
      order.target = "_blank";
      return;
    }
    const hit = e.target.closest("[data-open]");
    if (hit) openModal(hit.dataset.open);
  });

  chips.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    state.cat = b.dataset.cat;
    renderChips(); renderGrid();
  });

  let t;
  $("#q").addEventListener("input", (e) => {
    clearTimeout(t);
    t = setTimeout(() => { state.q = e.target.value; renderGrid(); }, 120);
  });

  async function load() {
    const [svc, cats, set] = await Promise.all([
      sb.from("services").select("*").eq("visible", true).order("featured", { ascending: false }).order("sort").order("created_at"),
      sb.from("categories").select("*").order("sort").order("created_at"),
      sb.from("settings").select("*")
    ]);
    if (svc.error || cats.error) throw svc.error || cats.error;
    state.services = svc.data || [];
    state.cats = cats.data || [];
    (set.data || []).forEach((r) => (state.settings[r.key] = r.value));
    applySettings();
    renderChips();
    renderGrid();
    const m = location.hash.match(/^#s=(.+)$/);
    if (m) openModal(decodeURIComponent(m[1]), false);
  }

  load().catch((err) => {
    console.error(err);
    grid.innerHTML = "";
    chips.hidden = true;
    empty.innerHTML = '<h2>تعذّر تحميل الخدمات</h2><p>تحقق من الاتصال وأعد المحاولة، أو اطلب مباشرة عبر واتساب.</p><button class="btn btn-soft" type="button" onclick="location.reload()">إعادة المحاولة</button> <a class="btn btn-wa" target="_blank" rel="noopener" href="' + esc(waLink(wa(), "مرحباً متجر انتشار، أريد الاستفسار عن خدمة.")) + '"><svg class="ico"><use href="#i-wa"/></svg>واتساب</a>';
    empty.hidden = false;
  });
})();
