(() => {
  const { disciplines, tools, trends, wire } = window.ATLAS;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const now = new Date();
  $("#today").textContent = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  $("#year").textContent = now.getFullYear();

  // Hero figures
  const licences = new Set(tools.map((t) => t.license));
  $("#stats").innerHTML = [
    [tools.length, "Instruments"],
    [disciplines.length, "Disciplines"],
    [licences.size, "Licences"],
    ["0", "Cost to begin"],
  ].map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join("");

  // Atlas
  let active = "all";
  const tabs = [{ id: "all", name: "All" }, ...disciplines];
  const tabBar = $("#tabs");
  tabBar.innerHTML = tabs.map((t) => `<button role="tab" data-id="${t.id}" aria-selected="${t.id === active}">${esc(t.name)}</button>`).join("");
  tabBar.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    active = b.dataset.id;
    tabBar.querySelectorAll("button").forEach((x) => x.setAttribute("aria-selected", x === b));
    renderAtlas();
  });
  $("#q").addEventListener("input", renderAtlas);

  // Simple Icons SVGs are brand-colour marks; GitHub avatars are full-bleed photos
  const logo = (t, cls = "") => t?.logo
    ? `<span class="plate ${cls}"><img src="${esc(t.logo)}" alt="" loading="lazy" class="${t.logo.endsWith(".svg") ? "glyph" : "photo"}" /></span>`
    : `<span class="plate ${cls}"><b>${esc((t?.name || "?")[0])}</b></span>`;

  const discName = Object.fromEntries(disciplines.map((d) => [d.id, d.name]));

  function renderAtlas() {
    const q = $("#q").value.trim().toLowerCase();
    const list = tools.filter((t) =>
      (active === "all" || t.d === active) &&
      (!q || [t.name, t.kind, t.desc, t.license, discName[t.d]].join(" ").toLowerCase().includes(q))
    );
    $("#atlas-grid").innerHTML = list.map((t, i) => `
      <a class="card" href="${esc(t.url)}" target="_blank" rel="noopener" style="animation-delay:${Math.min(i, 20) * 25}ms">
        <div class="top">${logo(t)}<span class="idx">${String(i + 1).padStart(2, "0")}</span></div>
        <h3>${esc(t.name)}</h3>
        <span class="arrow">↗</span>
        <p class="desc">${esc(t.desc)}</p>
        <div class="meta"><span>${esc(t.kind)}</span><span class="lic">${esc(t.license)}</span></div>
      </a>`).join("");
    $("#empty").hidden = list.length > 0;
  }
  renderAtlas();

  // Trends
  $("#trend-list").innerHTML = trends.map((t) => `
    <li><div>
      <h3>${esc(t.title)}</h3>
      <p>${esc(t.body)}</p>
      <div class="chips">${t.tools.map((n) => `<span class="chip">${esc(n)}</span>`).join("")}</div>
    </div></li>`).join("");

  // Amalgam Map — three-set Venn on a Computer Science ground
  const NS = "http://www.w3.org/2000/svg";
  const circles = {
    ai: { cx: 300, cy: 205, r: 168, label: "Artificial Intelligence", lx: 300, ly: 24 },
    ml: { cx: 213, cy: 352, r: 168, label: "Machine Learning", lx: 20, ly: 552, anchor: "start" },
    robotics: { cx: 387, cy: 352, r: 168, label: "Robotics", lx: 580, ly: 552, anchor: "end" },
  };
  // Label anchors for each region, keyed by its sorted set list
  const anchors = { ai: [300, 115], ml: [140, 410], robotics: [460, 410], "ai+ml": [222, 258], "ai+robotics": [378, 258], "ml+robotics": [300, 418], "ai+ml+robotics": [300, 308], "": [44, 72] };
  const regionKey = (sets) => [...sets].sort().join("+");
  const regions = window.ATLAS.map.map((r) => ({ ...r, key: regionKey(r.sets) }));
  const svg = $("#venn");
  const el = (tag, attrs, parent = svg) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent.appendChild(n);
    return n;
  };

  // Each region is the full plane clipped to its own circles and masked
  // away from the others.
  const defs = el("defs", {});
  for (const [id, c] of Object.entries(circles)) {
    el("circle", { cx: c.cx, cy: c.cy, r: c.r }, el("clipPath", { id: `clip-${id}` }, defs));
  }
  const ground = el("rect", { x: 1, y: 1, width: 598, height: 568, class: "v-ground" });
  const shapes = {};
  for (const r of regions) {
    const mask = el("mask", { id: `mask-${r.key || "cs"}` }, defs);
    el("rect", { width: 600, height: 570, fill: "#fff" }, mask);
    for (const id in circles) if (!r.sets.includes(id)) el("circle", { cx: circles[id].cx, cy: circles[id].cy, r: circles[id].r, fill: "#000" }, mask);
    let g = el("g", { mask: `url(#mask-${r.key || "cs"})`, class: "v-region" });
    shapes[r.key] = g;
    for (const id of r.sets) g = el("g", { "clip-path": `url(#clip-${id})` }, g);
    el("rect", { width: 600, height: 570 }, g);
  }
  for (const [id, c] of Object.entries(circles)) {
    el("circle", { cx: c.cx, cy: c.cy, r: c.r, class: "v-ring", pathLength: 100 });
    el("text", { x: c.lx, y: c.ly, class: "v-set", "text-anchor": c.anchor || "middle" }).textContent = c.label;
  }
  el("text", { x: 20, y: 40, class: "v-set v-cs" }).textContent = "Computer Science";
  const counts = {};
  for (const r of regions) {
    const [x, y] = anchors[r.key];
    const t = el("text", { x, y, class: "v-count", "text-anchor": r.key ? "middle" : "start" });
    t.textContent = r.projects.length;
    counts[r.key] = t;
  }

  const hit = (x, y) => regionKey(Object.keys(circles).filter((id) => {
    const c = circles[id];
    return Math.hypot(x - c.cx, y - c.cy) <= c.r;
  }));
  const toSvg = (e) => {
    const p = svg.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  };
  let selected = "ai+ml+robotics";
  let hovered = null;
  function paint() {
    for (const k in shapes) {
      shapes[k].classList.toggle("on", k === selected);
      shapes[k].classList.toggle("hover", k === hovered && k !== selected);
      counts[k].classList.toggle("on", k === selected);
    }
    keys.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.key === selected));
  }
  svg.addEventListener("pointermove", (e) => { const p = toSvg(e); const k = hit(p.x, p.y); if (k !== hovered) { hovered = k; paint(); } });
  svg.addEventListener("pointerleave", () => { hovered = null; paint(); });
  svg.addEventListener("click", (e) => { const p = toSvg(e); select(hit(p.x, p.y)); });

  const keys = $("#venn-keys");
  keys.innerHTML = regions.map((r) => `<button data-key="${r.key}">${esc(r.title)}</button>`).join("");
  keys.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) select(b.dataset.key); });

  const toolByName = Object.fromEntries(tools.map((t) => [t.name, t]));
  function select(key) {
    selected = key;
    paint();
    const r = regions.find((x) => x.key === key);
    $("#venn-panel").innerHTML = `
      <p class="eyebrow">${r.sets.length ? `${r.sets.length}-way intersection` : "The ground"}</p>
      <h3 class="vp-title">${esc(r.title)}</h3>
      <p class="vp-note">${esc(r.note)}</p>
      <ol class="vp-list">${r.projects.map((p) => `
        <li>
          <h4>${esc(p.name)}</h4>
          <p>${esc(p.desc)}</p>
          <div class="vp-recipe">${p.tools.map((n) => `<button class="chip" data-tool="${esc(n)}" title="${esc(toolByName[n]?.kind || "")}">${logo(toolByName[n], "xs")}${esc(n)}</button>`).join('<span class="plus">+</span>')}</div>
          ${chainFor(p.name) ? `<button class="follow" data-chain="${esc(p.name)}">Follow the chain →</button>` : ""}
        </li>`).join("")}
      </ol>`;
  }
  function jumpToTool(name) {
    active = "all";
    tabBar.querySelectorAll("button").forEach((x) => x.setAttribute("aria-selected", x.dataset.id === "all"));
    $("#q").value = name;
    renderAtlas();
    $("#atlas").scrollIntoView();
  }
  // A recipe chip jumps to that tool in the Atlas; a chain link opens its chain
  $("#venn-panel").addEventListener("click", (e) => {
    const t = e.target.closest("[data-tool]");
    if (t) return jumpToTool(t.dataset.tool);
    const c = e.target.closest("[data-chain]");
    if (c) { showChain(c.dataset.chain); $("#chains").scrollIntoView(); }
  });

  // Recommendation chains
  const chains = window.ATLAS.chains;
  const chainFor = (project) => chains.find((c) => c.project === project);
  const picker = $("#chain-picker");
  picker.innerHTML = chains.map((c) => `
    <button role="tab" data-chain="${esc(c.project)}">
      <span class="cp-name">${esc(c.project)}</span>
      <span class="cp-meta">${esc(c.region)} · ${esc(c.level)}</span>
    </button>`).join("");
  picker.addEventListener("click", (e) => { const b = e.target.closest("[data-chain]"); if (b) showChain(b.dataset.chain); });

  function showChain(project) {
    const c = chainFor(project);
    picker.querySelectorAll("button").forEach((b) => {
      const on = b.dataset.chain === project;
      b.setAttribute("aria-selected", on);
      // On phones the picker scrolls sideways; keep the chosen project visible
      if (on && picker.scrollWidth > picker.clientWidth) picker.scrollLeft = b.offsetLeft - picker.offsetLeft;
    });
    $("#chain-view").innerHTML = `
      <p class="eyebrow">${esc(c.region)} · ${esc(c.level)} · ${c.steps.length} links</p>
      <h3 class="vp-title">${esc(c.project)}</h3>
      <p class="vp-note">${esc(c.goal)}</p>
      <div class="chain-strip" aria-label="Chain summary">${c.steps.map((s) => `<span title="${esc(s.tool)}">${logo(toolByName[s.tool], "sm")}</span>`).join('<i>→</i>')}</div>
      <ol class="chain">${c.steps.map((s, i) => {
        const t = toolByName[s.tool];
        return `
        <li style="animation-delay:${i * 70}ms">
          <div class="node"><span class="step">${String(i + 1).padStart(2, "0")}</span>${logo(t)}</div>
          <div class="link-body">
            <p class="stage">${esc(s.stage)}</p>
            <h4><button class="tool-link" data-tool="${esc(s.tool)}">${esc(s.tool)}</button><span class="role">${esc(s.role)}</span></h4>
            <p class="why"><b>Why it's needed —</b> ${esc(s.why)}</p>
            ${s.alt ? `<p class="alt">Alternative: <button class="chip" data-tool="${esc(s.alt)}">${esc(s.alt)}</button></p>` : ""}
          </div>
        </li>`;
      }).join("")}
      </ol>`;
  }
  $("#chain-view").addEventListener("click", (e) => { const t = e.target.closest("[data-tool]"); if (t) jumpToTool(t.dataset.tool); });

  showChain(chains[0].project);
  select(selected);

  // Live wire — Hacker News via Algolia (CORS-enabled, no key needed)
  const wireTabs = $("#wire-tabs");
  const wireList = $("#wire-list");
  const cache = {};
  wireTabs.innerHTML = wire.map((w, i) => `<button role="tab" data-id="${w.id}" aria-selected="${i === 0}">${esc(w.name)}</button>`).join("");
  wireTabs.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    wireTabs.querySelectorAll("button").forEach((x) => x.setAttribute("aria-selected", x === b));
    loadWire(b.dataset.id);
  });

  const ago = (iso) => {
    const m = Math.round((Date.now() - new Date(iso)) / 60000);
    if (m < 60) return `${m}m ago`;
    if (m < 1440) return `${Math.round(m / 60)}h ago`;
    return `${Math.round(m / 1440)}d ago`;
  };
  const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return "news.ycombinator.com"; } };

  async function loadWire(id) {
    const topic = wire.find((w) => w.id === id);
    wireList.innerHTML = `<li class="note">Receiving transmission…</li>`;
    try {
      if (!cache[id]) {
        const url = `https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=12&numericFilters=points%3E10&query=${encodeURIComponent(topic.query)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(res.status);
        cache[id] = (await res.json()).hits;
      }
      const hits = cache[id].filter((h) => h.title);
      if (!hits.length) { wireList.innerHTML = `<li class="note">The wire is quiet on this topic.</li>`; return; }
      wireList.innerHTML = hits.map((h) => {
        const link = h.url || `https://news.ycombinator.com/item?id=${h.objectID}`;
        return `<li><a href="${esc(link)}" target="_blank" rel="noopener">
          <time datetime="${esc(h.created_at)}">${ago(h.created_at)}</time>
          <span class="t">${esc(h.title)}</span>
          <span class="src">${esc(host(link))}</span>
        </a></li>`;
      }).join("");
    } catch {
      wireList.innerHTML = `<li class="note">The wire could not be reached just now — try again shortly.</li>`;
    }
  }
  loadWire(wire[0].id);

  // Monochrome constellation field
  const c = $("#field");
  const ctx = c.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pts = [], W, H, dpr;
  const mouse = { x: -1e4, y: -1e4 };
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = c.width = innerWidth * dpr;
    H = c.height = innerHeight * dpr;
    const n = Math.round(Math.min(110, (innerWidth * innerHeight) / 14000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25 * dpr, vy: (Math.random() - .5) * .25 * dpr }));
  }
  addEventListener("resize", size);
  addEventListener("pointermove", (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
  function frame() {
    ctx.clearRect(0, 0, W, H);
    const R = 130 * dpr;
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    }
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < R) { ctx.strokeStyle = `rgba(255,255,255,${(1 - d / R) * .22})`; ctx.lineWidth = dpr * .6; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (dm < R * 1.4) { ctx.strokeStyle = `rgba(255,255,255,${(1 - dm / (R * 1.4)) * .45})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
      ctx.fillStyle = "rgba(255,255,255,.7)";
      ctx.fillRect(a.x - dpr, a.y - dpr, 2 * dpr, 2 * dpr);
    }
    if (!reduced) requestAnimationFrame(frame);
  }
  size();
  frame();
})();
