(function () {
  const { sb, cfg, esc, cleanPlans, cardHTML, iconHTML, safeUrl } = window.Store;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const state = { services: [], cats: [], settings: {}, editing: null };

  /* ===== أدوات ===== */
  let toastT;
  function toast(msg, bad) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.toggle("bad", !!bad);
    t.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(() => (t.hidden = true), 3200);
  }
  const errText = (e) => {
    const m = (e && (e.message || e.error_description)) || String(e);
    if (/Invalid login credentials/i.test(m)) return "البريد أو كلمة المرور غير صحيحة.";
    if (/Email not confirmed/i.test(m)) return "البريد غير مؤكد بعد.";
    if (/row-level security|permission denied|Unauthorized/i.test(m)) return "لا تملك صلاحية لهذا الإجراء.";
    if (/Failed to fetch|NetworkError/i.test(m)) return "تعذّر الاتصال بالخادم، تحقق من الإنترنت.";
    return m;
  };
  const catName = (id) => (state.cats.find((c) => c.id === id) || {}).name || "بدون قسم";

  /* ===== الدخول ===== */
  async function boot() {
    const { data } = await sb.auth.getSession();
    if (data.session) return enter();
    showLogin();
  }
  function showLogin(msg) {
    $("#app-view").hidden = true;
    $("#login-view").hidden = false;
    $("#login-msg").textContent = msg || "";
  }
  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, btn = $("button[type=submit]", f);
    btn.disabled = true;
    $("#login-msg").textContent = "";
    const { error } = await sb.auth.signInWithPassword({ email: f.email.value.trim(), password: f.password.value });
    btn.disabled = false;
    if (error) return ($("#login-msg").textContent = errText(error));
    f.password.value = "";
    enter();
  });
  $("#logout").addEventListener("click", async () => { await sb.auth.signOut(); showLogin(); });

  async function enter() {
    const { data: ok, error } = await sb.rpc("is_admin");
    if (error || !ok) {
      await sb.auth.signOut();
      return showLogin(error ? errText(error) : "هذا الحساب لا يملك صلاحية الأدمن.");
    }
    $("#login-view").hidden = true;
    $("#app-view").hidden = false;
    await loadAll();
  }

  /* ===== التبويبات ===== */
  $$(".tab").forEach((t) => t.addEventListener("click", () => {
    $$(".tab").forEach((x) => x.setAttribute("aria-selected", x === t));
    $$("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== t.dataset.tab));
  }));

  /* ===== تحميل البيانات ===== */
  async function loadAll() {
    const [svc, cats, set] = await Promise.all([
      sb.from("services").select("*").order("sort").order("created_at"),
      sb.from("categories").select("*").order("sort").order("created_at"),
      sb.from("settings").select("*")
    ]);
    const err = svc.error || cats.error || set.error;
    if (err) return toast(errText(err), true);
    state.services = svc.data;
    state.cats = cats.data;
    state.settings = {};
    set.data.forEach((r) => (state.settings[r.key] = r.value));
    renderServices();
    renderCats();
    renderSettings();
  }

  /* ===== الخدمات ===== */
  function renderServices() {
    const filter = $("#svc-cat-filter"), cur = filter.value;
    filter.innerHTML = '<option value="all">كل الأقسام</option>' + state.cats.map((c) => '<option value="' + c.id + '">' + esc(c.name) + "</option>").join("") + '<option value="none">بدون قسم</option>';
    filter.value = $$("option", filter).some((o) => o.value === cur) ? cur : "all";

    const q = $("#svc-q").value.trim().toLowerCase();
    const list = state.services.filter((s) =>
      (filter.value === "all" || (filter.value === "none" ? !s.category_id : s.category_id === filter.value)) &&
      (!q || s.name.toLowerCase().includes(q)));
    const box = $("#svc-list");
    if (!state.services.length) {
      box.innerHTML = '<div class="st-empty"><h2>لا توجد خدمات بعد</h2><p>ابدأ بإضافة أول خدمة للمتجر.</p></div>';
      return;
    }
    if (!list.length) { box.innerHTML = '<div class="st-empty"><p>لا توجد نتائج.</p></div>'; return; }
    box.innerHTML = list.map((s) => {
      const plans = cleanPlans(s.plans);
      return '<div class="svc-row' + (s.visible ? "" : " is-hidden") + '" data-id="' + s.id + '">' +
        iconHTML(s, "row-icon") +
        '<div class="row-main"><strong>' + esc(s.name) + (s.featured ? ' <span class="tag">مميزة</span>' : "") + (s.visible ? "" : ' <span class="tag muted">مخفية</span>') + "</strong>" +
        "<small>" + esc(catName(s.category_id)) + " · " + (plans.length ? "خيارات: " + plans.length + (plans[0].price ? " · " + window.Store.priceTag(plans[0].price, "") : "") : "بدون سعر") + "</small></div>" +
        '<div class="row-actions">' +
          '<button class="icon-btn" data-act="up" title="تحريك للأعلى" aria-label="تحريك للأعلى"><svg class="ico"><use href="#i-up"/></svg></button>' +
          '<button class="icon-btn" data-act="down" title="تحريك للأسفل" aria-label="تحريك للأسفل"><svg class="ico"><use href="#i-down"/></svg></button>' +
          '<button class="icon-btn" data-act="toggle" title="' + (s.visible ? "إخفاء" : "إظهار") + '" aria-label="' + (s.visible ? "إخفاء" : "إظهار") + '"><svg class="ico"><use href="#i-' + (s.visible ? "eye" : "eye-off") + '"/></svg></button>' +
          '<button class="icon-btn" data-act="edit" title="تعديل" aria-label="تعديل"><svg class="ico"><use href="#i-edit"/></svg></button>' +
          '<button class="icon-btn danger" data-act="del" title="حذف" aria-label="حذف"><svg class="ico"><use href="#i-trash"/></svg></button>' +
        "</div></div>";
    }).join("");
  }
  $("#svc-q").addEventListener("input", renderServices);
  $("#svc-cat-filter").addEventListener("change", renderServices);

  async function persistOrder(arr, table) {
    const changed = [];
    arr.forEach((x, i) => { if (x.sort !== i + 1) { x.sort = i + 1; changed.push(x); } });
    const res = await Promise.all(changed.map((x) => sb.from(table).update({ sort: x.sort }).eq("id", x.id)));
    const bad = res.find((r) => r.error);
    if (bad) toast(errText(bad.error), true);
  }

  async function move(arr, id, dir, table) {
    const i = arr.findIndex((x) => x.id === id), j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    await persistOrder(arr, table);
  }

  $("#svc-list").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const id = b.closest("[data-id]").dataset.id;
    const s = state.services.find((x) => x.id === id);
    const act = b.dataset.act;
    if (act === "edit") return openEditor(s);
    if (act === "up" || act === "down") { await move(state.services, id, act === "up" ? -1 : 1, "services"); return renderServices(); }
    if (act === "toggle") {
      const { error } = await sb.from("services").update({ visible: !s.visible }).eq("id", id);
      if (error) return toast(errText(error), true);
      s.visible = !s.visible;
      toast(s.visible ? "أصبحت الخدمة ظاهرة" : "تم إخفاء الخدمة");
      return renderServices();
    }
    if (act === "del") {
      if (!confirm("حذف خدمة «" + s.name + "» نهائياً؟")) return;
      const { error } = await sb.from("services").delete().eq("id", id);
      if (error) return toast(errText(error), true);
      state.services = state.services.filter((x) => x.id !== id);
      toast("تم حذف الخدمة");
      renderServices();
    }
  });

  /* ===== محرر الخدمة ===== */
  const editor = $("#editor"), form = $("#svc-form");

  function planRow(p) {
    return '<div class="plan-row">' +
      '<input class="input" data-k="label" placeholder="المدة أو النوع، مثل: شهر" value="' + esc(p.label || "") + '">' +
      '<input class="input" data-k="price" placeholder="السعر" value="' + esc(p.price || "") + '">' +
      '<button class="icon-btn" type="button" data-p="up" aria-label="للأعلى"><svg class="ico"><use href="#i-up"/></svg></button>' +
      '<button class="icon-btn danger" type="button" data-p="del" aria-label="حذف الخيار"><svg class="ico"><use href="#i-trash"/></svg></button>' +
      "</div>";
  }
  const readPlans = () => $$(".plan-row", form).map((r) => ({ label: $('[data-k="label"]', r).value.trim(), price: $('[data-k="price"]', r).value.trim() }));

  function readForm() {
    return {
      name: form.name.value.trim(),
      category_id: form.category_id.value || null,
      badge: form.badge.value.trim(),
      summary: form.summary.value.trim(),
      details: form.details.value.trim(),
      plans: cleanPlans(readPlans()),
      icon_url: form.icon_url.value,
      cover_url: form.cover_url.value,
      accent: form.accent.value,
      visible: form.visible.checked,
      featured: form.featured.checked
    };
  }

  function refreshPreview() {
    const d = readForm();
    $("#icon-prev").innerHTML = iconHTML(d, "svc-icon svc-icon-lg");
    $("#cover-prev").innerHTML = safeUrl(d.cover_url) ? '<img src="' + esc(d.cover_url) + '" alt="">' : '<span>لا يوجد غلاف</span>';
    $("#card-prev").innerHTML = '<div class="prev-wrap">' + cardHTML(Object.assign({ id: "" }, d), d.category_id ? catName(d.category_id) : "") + "</div>";
  }

  function openEditor(s) {
    state.editing = s || null;
    $("#ed-title").textContent = s ? "تعديل: " + s.name : "خدمة جديدة";
    form.reset();
    form.category_id.innerHTML = '<option value="">بدون قسم</option>' + state.cats.map((c) => '<option value="' + c.id + '">' + esc(c.name) + "</option>").join("");
    const d = s || { visible: true, accent: "#7b3fd6", plans: [{ label: "", price: "" }] };
    ["name", "badge", "summary", "details", "icon_url", "cover_url"].forEach((k) => (form[k].value = d[k] || ""));
    form.category_id.value = d.category_id || (s ? "" : ($("#svc-cat-filter").value.length > 10 ? $("#svc-cat-filter").value : ""));
    form.accent.value = /^#[0-9a-f]{6}$/i.test(d.accent || "") ? d.accent : "#7b3fd6";
    form.visible.checked = d.visible !== false;
    form.featured.checked = !!d.featured;
    const plans = cleanPlans(d.plans);
    $("#plans-ed").innerHTML = (plans.length ? plans : [{}]).map(planRow).join("");
    $("#icon-domain").value = "";
    $("#ed-msg").textContent = "";
    refreshPreview();
    editor.showModal();
    form.name.focus();
  }
  $("#add-svc").addEventListener("click", () => openEditor(null));
  editor.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) editor.close();
  });
  form.addEventListener("input", refreshPreview);
  form.addEventListener("change", refreshPreview);

  $("#add-plan").addEventListener("click", () => {
    $("#plans-ed").insertAdjacentHTML("beforeend", planRow({}));
    $$(".plan-row", form).pop().querySelector("input").focus();
    refreshPreview();
  });
  $("#plans-ed").addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]");
    if (!b) return;
    const row = b.closest(".plan-row");
    if (b.dataset.p === "del") row.remove();
    else if (row.previousElementSibling) row.parentNode.insertBefore(row, row.previousElementSibling);
    refreshPreview();
  });

  $$("[data-clear]", form).forEach((b) => b.addEventListener("click", () => { form[b.dataset.clear].value = ""; refreshPreview(); }));

  $("#fetch-icon").addEventListener("click", () => {
    let d = $("#icon-domain").value.trim().replace(/^https?:\/\//i, "").split(/[/?#]/)[0];
    if (!/^[\w.-]+\.[a-z]{2,}$/i.test(d)) return toast("اكتب نطاق الموقع مثل chatgpt.com", true);
    form.icon_url.value = "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(d) + "&sz=256";
    refreshPreview();
  });

  // تصغير الصورة قبل الرفع
  function resizeImage(file, maxW, maxH) {
    return new Promise((resolve, reject) => {
      if (file.type === "image/svg+xml" || file.type === "image/gif") return resolve(file);
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const r = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
        const c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * r);
        c.height = Math.round(img.naturalHeight * r);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        c.toBlob((b) => (b ? resolve(b) : reject(new Error("تعذّر تجهيز الصورة"))), "image/webp", 0.88);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("الملف ليس صورة صالحة")); };
      img.src = url;
    });
  }

  $$("[data-upload]", form).forEach((inp) => inp.addEventListener("change", async () => {
    const file = inp.files[0];
    inp.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast("اختر ملف صورة", true);
    const kind = inp.dataset.upload;
    const field = kind === "icon" ? "icon_url" : "cover_url";
    const label = inp.closest("label");
    label.classList.add("is-loading");
    try {
      const blob = await resizeImage(file, kind === "icon" ? 256 : 1280, kind === "icon" ? 256 : 1280);
      if (blob.size > 5 * 1024 * 1024) throw new Error("حجم الصورة أكبر من 5 ميغابايت");
      const ext = blob.type === "image/svg+xml" ? "svg" : blob.type === "image/gif" ? "gif" : "webp";
      const path = kind + "s/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
      const { error } = await sb.storage.from(cfg.bucket).upload(path, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
      if (error) throw error;
      form[field].value = sb.storage.from(cfg.bucket).getPublicUrl(path).data.publicUrl;
      refreshPreview();
      toast("تم رفع الصورة، اضغط حفظ لاعتمادها");
    } catch (err) {
      toast(errText(err), true);
    } finally {
      label.classList.remove("is-loading");
    }
  }));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = readForm();
    if (!d.name) { $("#ed-msg").textContent = "اكتب اسم الخدمة."; form.name.focus(); return; }
    const btn = $("#ed-save");
    btn.disabled = true;
    let res;
    if (state.editing) {
      res = await sb.from("services").update(d).eq("id", state.editing.id).select().single();
    } else {
      d.sort = state.services.reduce((m, s) => Math.max(m, s.sort || 0), 0) + 1;
      res = await sb.from("services").insert(d).select().single();
    }
    btn.disabled = false;
    if (res.error) { $("#ed-msg").textContent = errText(res.error); return; }
    if (state.editing) Object.assign(state.editing, res.data);
    else state.services.push(res.data);
    editor.close();
    toast("تم حفظ الخدمة");
    renderServices();
  });

  /* ===== الأقسام ===== */
  function renderCats() {
    const counts = {};
    state.services.forEach((s) => (counts[s.category_id] = (counts[s.category_id] || 0) + 1));
    $("#cat-list").innerHTML = state.cats.length ? state.cats.map((c) =>
      '<div class="cat-row" data-id="' + c.id + '">' +
        '<input class="input" value="' + esc(c.name) + '" aria-label="اسم القسم">' +
        '<span class="cat-n">' + (counts[c.id] || 0) + " خدمة</span>" +
        '<button class="icon-btn" data-act="up" aria-label="للأعلى"><svg class="ico"><use href="#i-up"/></svg></button>' +
        '<button class="icon-btn" data-act="down" aria-label="للأسفل"><svg class="ico"><use href="#i-down"/></svg></button>' +
        '<button class="icon-btn danger" data-act="del" aria-label="حذف القسم"><svg class="ico"><use href="#i-trash"/></svg></button>' +
      "</div>").join("") : '<div class="st-empty"><p>لا توجد أقسام.</p></div>';
  }
  $("#cat-add").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    if (!name) return;
    const sort = state.cats.reduce((m, c) => Math.max(m, c.sort || 0), 0) + 1;
    const { data, error } = await sb.from("categories").insert({ name, sort }).select().single();
    if (error) return toast(errText(error), true);
    state.cats.push(data);
    e.target.reset();
    renderCats(); renderServices();
    toast("تمت إضافة القسم");
  });
  $("#cat-list").addEventListener("change", async (e) => {
    const inp = e.target.closest("input");
    if (!inp) return;
    const id = inp.closest("[data-id]").dataset.id, name = inp.value.trim();
    const c = state.cats.find((x) => x.id === id);
    if (!name) { inp.value = c.name; return; }
    const { error } = await sb.from("categories").update({ name }).eq("id", id);
    if (error) return toast(errText(error), true);
    c.name = name;
    renderServices();
    toast("تم تعديل اسم القسم");
  });
  $("#cat-list").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const id = b.closest("[data-id]").dataset.id, c = state.cats.find((x) => x.id === id);
    if (b.dataset.act === "del") {
      const n = state.services.filter((s) => s.category_id === id).length;
      if (!confirm("حذف قسم «" + c.name + "»؟" + (n ? " ستبقى خدماته (" + n + ") بدون قسم." : ""))) return;
      const { error } = await sb.from("categories").delete().eq("id", id);
      if (error) return toast(errText(error), true);
      state.cats = state.cats.filter((x) => x.id !== id);
      state.services.forEach((s) => { if (s.category_id === id) s.category_id = null; });
      toast("تم حذف القسم");
    } else await move(state.cats, id, b.dataset.act === "up" ? -1 : 1, "categories");
    renderCats(); renderServices();
  });

  /* ===== الإعدادات ===== */
  function renderSettings() {
    const f = $("#settings-form");
    f.whatsapp.value = state.settings.whatsapp || "";
    f.announcement.value = state.settings.announcement || "";
  }
  $("#settings-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const whatsapp = f.whatsapp.value.replace(/\D/g, "");
    if (whatsapp && whatsapp.length < 8) return toast("رقم واتساب غير صالح", true);
    const rows = [{ key: "whatsapp", value: whatsapp }, { key: "announcement", value: f.announcement.value.trim() }];
    const { error } = await sb.from("settings").upsert(rows);
    if (error) return toast(errText(error), true);
    rows.forEach((r) => (state.settings[r.key] = r.value));
    f.whatsapp.value = whatsapp;
    toast("تم حفظ الإعدادات");
  });
  $("#pass-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const { error } = await sb.auth.updateUser({ password: e.target.password.value });
    if (error) return toast(errText(error), true);
    e.target.reset();
    toast("تم تغيير كلمة المرور");
  });

  boot().catch((e) => showLogin(errText(e)));
})();
