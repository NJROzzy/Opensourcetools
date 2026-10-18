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
  // Count anchors (used on small screens), keyed by sorted set list
  const anchors = { ai: [300, 115], ml: [140, 410], robotics: [460, 410], "ai+ml": [222, 258], "ai+robotics": [378, 258], "ml+robotics": [300, 418], "ai+ml+robotics": [300, 308], "": [44, 72] };
  const regionKey = (sets) => [...sets].sort().join("+");
  const regions = window.ATLAS.map.map((r) => ({ ...r, key: regionKey(r.sets) }));
  const toolByName = Object.fromEntries(tools.map((t) => [t.name, t]));
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
  el("rect", { x: 1, y: 1, width: 598, height: 568, rx: 3, class: "v-ground" });
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

  // Which region a point is in; with a margin, null when too close to a ring
  const regionAt = (x, y, m = 0) => {
    const inside = [];
    for (const id in circles) {
      const c = circles[id], d = Math.hypot(x - c.cx, y - c.cy);
      if (Math.abs(d - c.r) < m) return null;
      if (d <= c.r) inside.push(id);
    }
    return regionKey(inside);
  };
  const hit = (x, y) => regionAt(x, y);
  const usable = (y) => y > 48 && y < 528; // keep clear of the set labels

  const layers = { names: el("g", { class: "v-names" }), counts: el("g", { class: "v-counts" }), tools: el("g", { class: "v-tools" }) };
  const nameGroups = {}, countEls = {};

  // Small screens: one numeral per region
  for (const r of regions) {
    const [x, y] = anchors[r.key];
    const t = el("text", { x, y, class: "v-count", "text-anchor": r.key ? "middle" : "start" }, layers.counts);
    t.textContent = r.projects.length;
    countEls[r.key] = t;
  }

  // Projects view: write short project names inside each region, finding
  // the band of lines whose narrowest row still fits its text.
  const NAME_SIZE = 16, LINE = 20;
  const measure = (() => {
    const ctx = document.createElement("canvas").getContext("2d");
    return (s) => { ctx.font = `500 ${NAME_SIZE}px "Cormorant Garamond"`; return ctx.measureText(s).width; };
  })();
  const runAt = (key, y) => {
    let best = null, start = null;
    for (let x = 4; x <= 597; x += 2) {
      const ok = regionAt(x, y - 6, 4) === key && regionAt(x, y + 4, 4) === key;
      if (ok && start === null) start = x;
      if ((!ok || x >= 596) && start !== null) {
        if (!best || x - start > best[1] - best[0]) best = [start, x];
        start = null;
      }
    }
    return best;
  };
  function layoutNames() {
    layers.names.textContent = "";
    for (const r of regions) {
      const lines = r.projects.map((p) => p.short || p.name);
      const widths = lines.map(measure);
      let pick = null;
      for (let y0 = 60; y0 + (lines.length - 1) * LINE < 524; y0 += 2) {
        const runs = lines.map((_, i) => runAt(r.key, y0 + i * LINE));
        if (runs.some((run) => !run)) continue;
        const slack = Math.min(...runs.map((run, i) => run[1] - run[0] - widths[i]));
        if (!pick || slack > pick.slack) pick = { y0, runs, slack };
      }
      const g = el("g", { class: "v-name-group" }, layers.names);
      nameGroups[r.key] = g;
      if (!pick) continue;
      lines.forEach((s, i) => {
        const [a, b] = pick.runs[i];
        el("text", { x: (a + b) / 2, y: pick.y0 + i * LINE, "text-anchor": "middle", class: "v-name" }, g).textContent = s;
      });
    }
    paint();
  }

  // Tools view: pack logo tiles on a grid, keeping every tile wholly inside
  // its region, nearest the region's centre first. Crowded regions fall back
  // to tighter spacing and smaller tiles.
  const TILE = 30;
  const SIZES = [[36, 30], [34, 30], [32, 28], [30, 26]];
  function layoutTools() {
    for (const r of regions) {
      const names = r.home || [];
      let best = null;
      for (const [STEP, tile] of SIZES) {
      for (const ox of [0, 9, 18, 27]) for (const oy of [0, 9, 18, 27]) {
        const pts = [];
        for (let y = 20 + oy; y < 560; y += STEP) for (let x = 20 + ox; x < 590; x += STEP) {
          const h = tile / 2 + 3;
          const probes = [[0, 0], [-h, -h], [h, -h], [-h, h], [h, h], [0, -h], [0, h], [-h, 0], [h, 0]];
          if (probes.every(([dx, dy]) => regionAt(x + dx, y + dy, 2) === r.key && usable(y + dy) && x + dx > 6 && x + dx < 594)) pts.push([x, y]);
        }
        if (pts.length < names.length) continue;
        const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
        // Fill from the centre of the region's usable area outward
        const chosen = pts.sort((a, b) => Math.hypot(a[0] - cx, a[1] - cy) - Math.hypot(b[0] - cx, b[1] - cy)).slice(0, names.length);
        const spread = chosen.reduce((s, p) => s + Math.hypot(p[0] - cx, p[1] - cy), 0);
        if (!best || spread < best.spread) best = { chosen, spread, tile };
      }
      if (best) break;
      }
      if (!best) { console.warn("No room for tools in", r.key); continue; }
      // Keep reading order: left-to-right, top-to-bottom
      best.chosen.sort((a, b) => a[1] - b[1] || a[0] - b[0]).forEach(([x, y], i) => {
        const t = toolByName[names[i]];
        const g = el("g", { class: "v-tool", transform: `translate(${x} ${y})`, "data-tool": t.name, tabindex: 0, role: "button", "aria-label": t.name }, layers.tools);
        el("title", {}, g).textContent = `${t.name} — ${t.kind}`;
        const tile = best.tile;
        el("rect", { x: -tile / 2, y: -tile / 2, width: tile, height: tile, rx: 7, class: "v-tile" }, g);
        const photo = !t.logo.endsWith(".svg");
        const s = photo ? tile - 2 : tile * 2 / 3;
        el("image", { href: t.logo, x: -s / 2, y: -s / 2, width: s, height: s, "clip-path": photo ? "url(#tile-clip)" : "", preserveAspectRatio: photo ? "xMidYMid slice" : "xMidYMid meet" }, g);
      });
    }
  }
  el("rect", { x: -(TILE - 2) / 2, y: -(TILE - 2) / 2, width: TILE - 2, height: TILE - 2, rx: 6 }, el("clipPath", { id: "tile-clip" }, defs));

  let mode = "projects";
  const modeBar = $("#venn-mode");
  modeBar.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    mode = b.dataset.mode;
    modeBar.querySelectorAll("button").forEach((x) => x.setAttribute("aria-selected", x === b));
    svg.classList.toggle("mode-tools", mode === "tools");
    svg.classList.toggle("mode-projects", mode === "projects");
  });
  svg.classList.add("mode-projects");

  const toSvg = (e) => {
    const p = svg.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  };
  let selected = "ai+ml+robotics";
  let hovered = null;
  let selectedTool = null;
  function paint() {
    for (const k in shapes) {
      const on = k === selected && !selectedTool;
      shapes[k].classList.toggle("on", on);
      shapes[k].classList.toggle("hover", k === hovered && !on);
      countEls[k].classList.toggle("on", on);
      nameGroups[k]?.classList.toggle("on", on);
    }
    layers.tools.querySelectorAll(".v-tool").forEach((g) => g.classList.toggle("on", g.dataset.tool === selectedTool));
    keys.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.key === selected && !selectedTool));
  }
  svg.addEventListener("pointermove", (e) => { const p = toSvg(e); const k = hit(p.x, p.y); if (k !== hovered) { hovered = k; paint(); } });
  svg.addEventListener("pointerleave", () => { hovered = null; paint(); });
  svg.addEventListener("click", (e) => {
    const tile = e.target.closest(".v-tool");
    if (tile) return showTool(tile.dataset.tool);
    const p = toSvg(e);
    select(hit(p.x, p.y));
  });
  svg.addEventListener("keydown", (e) => {
    const tile = e.target.closest(".v-tool");
    if (tile && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); showTool(tile.dataset.tool); }
  });

  const keys = $("#venn-keys");
  keys.innerHTML = regions.map((r) => `<button data-key="${r.key}">${esc(r.title)}</button>`).join("");
  keys.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) select(b.dataset.key); });

  const toolChip = (n) => `<button class="chip" data-tool="${esc(n)}" title="${esc(toolByName[n]?.kind || "")}">${logo(toolByName[n], "xs")}${esc(n)}</button>`;
  const regionOfTool = (n) => regions.find((r) => (r.home || []).includes(n));

  function select(key) {
    selected = key;
    selectedTool = null;
    paint();
    const r = regions.find((x) => x.key === key);
    $("#venn-panel").innerHTML = `
      <p class="eyebrow">${r.sets.length ? `${r.sets.length}-way intersection` : "The ground"} · ${r.projects.length} projects · ${(r.home || []).length} tools</p>
      <h3 class="vp-title">${esc(r.title)}</h3>
      <p class="vp-note">${esc(r.note)}</p>
      <p class="vp-label">Tools at home here</p>
      <div class="vp-recipe vp-home">${(r.home || []).map(toolChip).join("")}</div>
      <p class="vp-label">Projects you can build</p>
      <ol class="vp-list">${r.projects.map((p) => `
        <li>
          <h4>${esc(p.name)}</h4>
          <p>${esc(p.desc)}</p>
          <div class="vp-recipe">${p.tools.map(toolChip).join('<span class="plus">+</span>')}</div>
          ${chainFor(p.name) ? `<button class="follow" data-chain="${esc(p.name)}">Follow the chain →</button>` : ""}
        </li>`).join("")}
      </ol>`;
  }

  // Tool-centred view: what a tool is, where it sits, and the role it plays
  // in each project that uses it.
  function showTool(name) {
    const t = toolByName[name];
    const r = regionOfTool(name);
    selectedTool = name;
    if (r) selected = r.key;
    paint();
    const uses = regions.flatMap((reg) => reg.projects.filter((p) => p.tools.includes(name)).map((p) => ({ p, reg })));
    const roles = Object.fromEntries(chains.flatMap((c) => c.steps.filter((s) => s.tool === name).map((s) => [c.project, s])));
    $("#venn-panel").innerHTML = `
      <p class="eyebrow">Tool · ${esc(discName[t.d])} · ${esc(t.kind)}</p>
      <div class="tp-head">${logo(t, "lg")}<div><h3 class="vp-title">${esc(t.name)}</h3><span class="lic">${esc(t.license)}</span></div></div>
      <p class="vp-note">${esc(t.desc)}</p>
      ${r ? `<p class="vp-label">Sits in</p><button class="region-link" data-key="${r.key}">${esc(r.title)} →</button>` : ""}
      <p class="vp-label">Used in ${uses.length} project${uses.length === 1 ? "" : "s"}</p>
      ${uses.length ? `<ol class="vp-list">${uses.map(({ p, reg }) => {
        const role = roles[p.name];
        return `
        <li>
          <h4>${esc(p.name)}</h4>
          <p class="vp-region">${esc(reg.title)}</p>
          ${role ? `<p><b class="vp-role">${esc(role.role)}.</b> ${esc(role.why)}</p>` : `<p>${esc(p.desc)}</p>`}
          <div class="vp-recipe">${p.tools.filter((n) => n !== name).map(toolChip).join('<span class="plus">+</span>')}</div>
          ${chainFor(p.name) ? `<button class="follow" data-chain="${esc(p.name)}">Follow the chain →</button>` : ""}
        </li>`;
      }).join("")}</ol>` : `<p class="vp-note">Not yet part of a project recipe — a foundation to reach for as needed.</p>`}
      <button class="follow" data-atlas="${esc(name)}">Open in the Atlas →</button>`;
  }

  function jumpToTool(name) {
    active = "all";
    tabBar.querySelectorAll("button").forEach((x) => x.setAttribute("aria-selected", x.dataset.id === "all"));
    $("#q").value = name;
    renderAtlas();
    $("#atlas").scrollIntoView();
  }
  // In the panel: a tool chip opens that tool, a region link its region, a
  // chain link its chain, and "Open in the Atlas" jumps to the catalogue.
  $("#venn-panel").addEventListener("click", (e) => {
    const t = e.target.closest("[data-tool]");
    if (t) return showTool(t.dataset.tool);
    const r = e.target.closest("[data-key]");
    if (r) return select(r.dataset.key);
    const a = e.target.closest("[data-atlas]");
    if (a) return jumpToTool(a.dataset.atlas);
    const c = e.target.closest("[data-chain]");
    if (c) { showChain(c.dataset.chain); $("#chains").scrollIntoView(); }
  });

  // Names depend on the web font's metrics, so lay them out once it loads
  document.fonts.ready.then(layoutNames);
  layoutTools();

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
