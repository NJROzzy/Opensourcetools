(() => {
  const { disciplines, tracks, architectures, tools, projects, chains, trends, wire, venn } = window.ATLAS;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const now = new Date();
  $("#today").textContent = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  $("#year").textContent = now.getFullYear();

  const discName = Object.fromEntries(disciplines.map((d) => [d.id, d.name]));
  const discShort = Object.fromEntries(disciplines.map((d) => [d.id, d.short]));
  const toolByName = Object.fromEntries(tools.map((t) => [t.name, t]));
  const chainFor = (project) => chains.find((c) => c.project === project);
  const projectByName = Object.fromEntries(projects.map((p) => [p.name, p]));
  const domainLine = (ids, names = discShort) => ids.map((d) => names[d]).join(" ∩ ");

  // Hero figures
  $("#stats").innerHTML = [
    [tools.length, "Open-source tools"],
    [projects.length, "Projects"],
    [tracks.length, "Build paths"],
    [disciplines.length, "Domains"],
  ].map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join("");

  // Simple Icons SVGs are brand-colour marks; GitHub avatars are full-bleed photos
  const logo = (t, cls = "") => t?.logo
    ? `<span class="plate ${cls}"><img src="${esc(t.logo)}" alt="" loading="lazy" class="${t.logo.endsWith(".svg") ? "glyph" : "photo"}" /></span>`
    : `<span class="plate ${cls}"><b>${esc((t?.name || "?")[0])}</b></span>`;
  const toolChip = (n) => `<button class="chip" data-tool="${esc(n)}" title="${esc(toolByName[n]?.kind || "")}">${logo(toolByName[n], "xs")}${esc(n)}</button>`;

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

  function renderAtlas() {
    const q = $("#q").value.trim().toLowerCase();
    const list = tools.filter((t) =>
      (active === "all" || t.domains.includes(active)) &&
      (!q || [t.name, t.kind, t.desc, t.license, ...t.domains.map((d) => discName[d])].join(" ").toLowerCase().includes(q))
    );
    $("#atlas-grid").innerHTML = list.map((t, i) => `
      <button class="card" data-open-tool="${esc(t.name)}" style="animation-delay:${Math.min(i, 20) * 25}ms">
        <div class="top">${logo(t)}<span class="idx">${String(i + 1).padStart(3, "0")}</span></div>
        <h3>${esc(t.name)}</h3>
        <span class="arrow">→</span>
        <p class="desc">${esc(t.desc)}</p>
        <p class="doms">${t.domains.map((d) => esc(discShort[d])).join(" · ")}</p>
        <div class="meta"><span>${esc(t.kind)}</span><span class="lic">${esc(t.license)}</span></div>
      </button>`).join("");
    $("#empty").hidden = list.length > 0;
  }
  renderAtlas();

  function jumpToTool(name) {
    active = "all";
    tabBar.querySelectorAll("button").forEach((x) => x.setAttribute("aria-selected", x.dataset.id === "all"));
    $("#q").value = name;
    renderAtlas();
    $("#atlas").scrollIntoView();
  }

  // Trends
  $("#trend-list").innerHTML = trends.map((t) => `
    <li><div>
      <h3>${esc(t.title)}</h3>
      <p>${esc(t.body)}</p>
      <div class="chips">${t.tools.map(toolChip).join("")}</div>
    </div></li>`).join("");
  $("#trend-list").addEventListener("click", (e) => { const b = e.target.closest("[data-tool]"); if (b) openTool(b.dataset.tool); });

  // ---------------------------------------------------------------------
  // Amalgam Map — a three-set Venn of any three domains, on a Computer
  // Science ground. Circles are slots 0 (top), 1 (bottom-left), 2 (bottom-
  // right); a region is a bitmask of slots, 0 being the ground.
  const NS = "http://www.w3.org/2000/svg";
  const W = 600, H = 570, R = 168;
  const GEOM = [
    { cx: 300, cy: 205, lx: 300, ly: 24, anchor: "middle" },
    { cx: 213, cy: 352, lx: 20, ly: 552, anchor: "start" },
    { cx: 387, cy: 352, lx: 580, ly: 552, anchor: "end" },
  ];
  // Numeral positions per region mask, used on small screens
  const COUNT_AT = { 1: [300, 115], 2: [140, 410], 4: [460, 410], 3: [222, 258], 5: [378, 258], 6: [300, 418], 7: [300, 308] };
  const MASKS = [1, 2, 4, 3, 5, 6, 7, 0];
  const usable = (y) => y > 48 && y < 528; // keep clear of the set labels

  let chosen = [...venn.default];
  let regions = [], byMask = {};
  let selected = 7, hovered = null, selectedTool = null;
  let mode = "projects";

  const maskOf = (domains) => chosen.reduce((m, d, i) => (domains.includes(d) ? m | (1 << i) : m), 0);
  const slotsOf = (mask) => [0, 1, 2].filter((i) => mask & (1 << i));

  // Which region a point is in; with a margin, -1 when too close to a ring
  const maskAt = (x, y, m = 0) => {
    let mask = 0;
    for (let i = 0; i < 3; i++) {
      const d = Math.hypot(x - GEOM[i].cx, y - GEOM[i].cy);
      if (Math.abs(d - R) < m) return -1;
      if (d <= R) mask |= 1 << i;
    }
    return mask;
  };
  // Rasterised region lookup with a margin, computed once (geometry is fixed)
  const raster = (m) => {
    const a = new Int8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) a[y * W + x] = maskAt(x, y, m);
    return (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? -2 : a[(y | 0) * W + (x | 0)]);
  };
  const near2 = raster(2), near4 = raster(4);

  // Longest horizontal run of each region on each row, for fitting text
  const runs = {};
  for (let y = 40; y < 540; y += 2) {
    runs[y] = {};
    let start = 4, cur = null;
    for (let x = 4; x <= W - 3; x += 2) {
      const a = near4(x, y - 6), b = near4(x, y + 4);
      const k = a === b && a >= 0 ? a : null;
      if (k !== cur || x >= W - 4) {
        if (cur !== null) {
          const best = runs[y][cur];
          if (!best || x - start > best[1] - best[0]) runs[y][cur] = [start, x];
        }
        cur = k; start = x;
      }
    }
  }

  const svg = $("#venn");
  const el = (tag, attrs, parent = svg) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent.appendChild(n);
    return n;
  };

  function computeRegions() {
    regions = MASKS.map((mask) => {
      const ids = slotsOf(mask).map((i) => chosen[i]);
      const others = chosen.filter((d) => !ids.includes(d)).map((d) => discName[d]);
      const inRegion = (domains) => maskOf(domains) === mask;
      const regionTools = mask
        ? tools.filter((t) => inRegion(t.domains))
        : tools.filter((t) => t.foundation && inRegion(t.domains));
      // Tools whose primary domain is in the region read first
      regionTools.sort((a, b) => (ids.includes(b.domains[0]) - ids.includes(a.domains[0])));
      const regionProjects = projects.filter((p) => inRegion(p.domains))
        .sort((a, b) => !!chainFor(b.name) - !!chainFor(a.name));
      const names = ids.map((d) => discName[d]);
      return {
        mask, ids,
        title: mask ? names.join(" ∩ ") : "Computer Science — the ground",
        short: mask ? domainLine(ids) : "The ground",
        note: !mask ? `Foundations every project stands on. Below are the projects outside ${chosen.map((d) => discShort[d]).join(", ")} — choose other domains to place them on the map.`
          : ids.length === 1 ? `Work in ${names[0]} that doesn't draw on ${others.join(" or ")}.`
          : ids.length === 2 ? `Where ${names[0]} meets ${names[1]}, without ${others[0]}.`
          : "The centre — work that draws on all three at once.",
        projects: regionProjects,
        tools: regionTools,
      };
    });
    byMask = Object.fromEntries(regions.map((r) => [r.mask, r]));
  }

  let shapes = {}, nameGroups = {}, countEls = {}, layers = {};

  function buildVenn() {
    computeRegions();
    svg.textContent = "";
    shapes = {}; nameGroups = {}; countEls = {};

    // Each region is the full plane clipped to its own circles and masked
    // away from the others.
    const defs = el("defs", {});
    GEOM.forEach((g, i) => el("circle", { cx: g.cx, cy: g.cy, r: R }, el("clipPath", { id: `clip-${i}` }, defs)));
    el("rect", { x: -13, y: -13, width: 26, height: 26, rx: 6 }, el("clipPath", { id: "tile-clip" }, defs));
    el("rect", { x: 1, y: 1, width: W - 2, height: H - 2, rx: 3, class: "v-ground" });
    for (const r of regions) {
      const mask = el("mask", { id: `mask-${r.mask}` }, defs);
      el("rect", { width: W, height: H, fill: "#fff" }, mask);
      GEOM.forEach((g, i) => { if (!(r.mask & (1 << i))) el("circle", { cx: g.cx, cy: g.cy, r: R, fill: "#000" }, mask); });
      let g = el("g", { mask: `url(#mask-${r.mask})`, class: "v-region" });
      shapes[r.mask] = g;
      for (const i of slotsOf(r.mask)) g = el("g", { "clip-path": `url(#clip-${i})` }, g);
      el("rect", { width: W, height: H }, g);
    }
    GEOM.forEach((g, i) => {
      el("circle", { cx: g.cx, cy: g.cy, r: R, class: "v-ring", pathLength: 100 });
      el("text", { x: g.lx, y: g.ly, class: "v-set", "text-anchor": g.anchor }).textContent = discName[chosen[i]];
    });
    el("text", { x: 20, y: 40, class: "v-set v-cs" }).textContent = "Computer Science";

    layers = { names: el("g", { class: "v-names" }), counts: el("g", { class: "v-counts" }), tools: el("g", { class: "v-tools" }) };
    for (const r of regions) {
      if (!r.mask) continue;
      const [x, y] = COUNT_AT[r.mask];
      const t = el("text", { x, y, class: "v-count", "text-anchor": "middle" }, layers.counts);
      t.textContent = r.projects.length;
      countEls[r.mask] = t;
    }
    layoutNames();
    layoutTools();

    $("#venn-keys").innerHTML = regions.map((r) => `<button data-mask="${r.mask}">${esc(r.short)} <span>${r.projects.length}</span></button>`).join("");
    $("#venn-domains").querySelectorAll("button").forEach((b) => {
      const slot = chosen.indexOf(b.dataset.domain);
      b.setAttribute("aria-pressed", slot >= 0);
    });
    $("#venn-presets").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.domains === [...chosen].sort().join(",")));
    if (selectedTool && maskOfTool(selectedTool) !== null) return showTool(selectedTool);
    // Open on the centre, or on the busiest region when the centre is empty
    const busiest = regions.filter((r) => r.mask).sort((a, b) => b.projects.length - a.projects.length)[0];
    select(byMask[7].projects.length ? 7 : busiest.mask);
  }

  // Projects view: write short project names inside each region, choosing
  // the band of lines whose narrowest row still fits; when a region is too
  // small, the last line becomes "+N more".
  const NAME_SIZE = 16, LINE = 20;
  const measure = (() => {
    const ctx = document.createElement("canvas").getContext("2d");
    return (s) => { ctx.font = `500 ${NAME_SIZE}px "Cormorant Garamond"`; return ctx.measureText(s).width; };
  })();
  function fitLines(mask, lines) {
    const widths = lines.map(measure);
    let pick = null;
    for (let y0 = 60; y0 + (lines.length - 1) * LINE < 524; y0 += 2) {
      const rs = lines.map((_, i) => runs[y0 + i * LINE]?.[mask]);
      if (rs.some((r) => !r)) continue;
      const slack = Math.min(...rs.map((r, i) => r[1] - r[0] - widths[i]));
      if (slack < 6) continue;
      if (!pick || slack > pick.slack) pick = { y0, rs, slack };
    }
    return pick;
  }
  function layoutNames() {
    layers.names.textContent = "";
    for (const r of regions) {
      const g = el("g", { class: "v-name-group" }, layers.names);
      nameGroups[r.mask] = g;
      let all = r.projects.map((p) => p.short || p.name);
      if (!r.mask) all = r.projects.length ? [`${r.projects.length} more projects in other domains`] : [];
      if (!all.length) continue;
      let lines = all, pick = null;
      for (let k = all.length; k >= 1 && !pick; k--) {
        lines = k === all.length ? all : [...all.slice(0, k - 1), `+${all.length - k + 1} more`];
        pick = fitLines(r.mask, lines);
      }
      if (!pick) continue;
      lines.forEach((s, i) => {
        const [a, b] = pick.rs[i];
        el("text", { x: (a + b) / 2, y: pick.y0 + i * LINE, "text-anchor": "middle", class: `v-name${s.startsWith("+") || !r.mask ? " v-more" : ""}` }, g).textContent = s;
      });
    }
  }

  // Tools view: pack logo tiles on a grid, keeping every tile wholly inside
  // its region, nearest the region's centre first. Crowded regions fall back
  // to tighter spacing and smaller tiles, then to a "+N" tile.
  const SIZES = [[36, 30], [34, 30], [32, 28], [30, 26], [28, 24]];
  function gridFor(mask, step, tile, ox, oy) {
    const pts = [];
    const h = tile / 2 + 2;
    const probes = [[0, 0], [-h, -h], [h, -h], [-h, h], [h, h], [0, -h], [0, h], [-h, 0], [h, 0]];
    for (let y = 18 + oy; y < H - 10; y += step) for (let x = 18 + ox; x < W - 10; x += step) {
      if (probes.every(([dx, dy]) => near2(x + dx, y + dy) === mask && usable(y + dy) && x + dx > 6 && x + dx < W - 6)) pts.push([x, y]);
    }
    return pts;
  }
  function layoutTools() {
    for (const r of regions) {
      const n = r.tools.length;
      if (!n) continue;
      let best = null, roomiest = null;
      for (const [step, tile] of SIZES) {
        for (const ox of [0, 8, 16, 24]) for (const oy of [0, 8, 16, 24]) {
          const pts = gridFor(r.mask, step, tile, ox, oy);
          if (!roomiest || pts.length > roomiest.pts.length) roomiest = { pts, tile };
          if (pts.length < n) continue;
          const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
          const chosenPts = pts.sort((a, b) => Math.hypot(a[0] - cx, a[1] - cy) - Math.hypot(b[0] - cx, b[1] - cy)).slice(0, n);
          const spread = chosenPts.reduce((s, p) => s + Math.hypot(p[0] - cx, p[1] - cy), 0);
          if (!best || spread < best.spread) best = { pts: chosenPts, spread, tile };
        }
        if (best) break;
      }
      let shown = r.tools, overflow = 0;
      if (!best) {
        // Not everything fits: show what does, and a "+N" tile for the rest
        const cap = roomiest.pts.length;
        if (!cap) continue;
        shown = r.tools.slice(0, cap - 1);
        overflow = n - shown.length;
        const cx = roomiest.pts.reduce((s, p) => s + p[0], 0) / cap, cy = roomiest.pts.reduce((s, p) => s + p[1], 0) / cap;
        best = { pts: roomiest.pts.sort((a, b) => Math.hypot(a[0] - cx, a[1] - cy) - Math.hypot(b[0] - cx, b[1] - cy)), tile: roomiest.tile };
      }
      const pts = best.pts.slice(0, shown.length + (overflow ? 1 : 0)).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
      const tile = best.tile;
      pts.forEach(([x, y], i) => {
        if (i === shown.length) {
          const g = el("g", { class: "v-more-tile", transform: `translate(${x} ${y})`, "data-mask": r.mask, tabindex: 0, role: "button", "aria-label": `${overflow} more tools in ${r.title}` }, layers.tools);
          el("rect", { x: -tile / 2, y: -tile / 2, width: tile, height: tile, rx: 7 }, g);
          el("text", { "text-anchor": "middle", y: 4 }, g).textContent = `+${overflow}`;
          return;
        }
        const t = shown[i];
        const g = el("g", { class: "v-tool", transform: `translate(${x} ${y})`, "data-tool": t.name, tabindex: 0, role: "button", "aria-label": t.name }, layers.tools);
        el("title", {}, g).textContent = `${t.name} — ${t.kind}`;
        el("rect", { x: -tile / 2, y: -tile / 2, width: tile, height: tile, rx: 7, class: "v-tile" }, g);
        if (!t.logo) { el("text", { "text-anchor": "middle", y: 5, class: "v-mono" }, g).textContent = t.name[0]; return; }
        const photo = !t.logo.endsWith(".svg");
        const s = photo ? tile - 4 : tile * 2 / 3;
        el("image", { href: t.logo, x: -s / 2, y: -s / 2, width: s, height: s, "clip-path": photo ? "url(#tile-clip)" : "", preserveAspectRatio: photo ? "xMidYMid slice" : "xMidYMid meet" }, g);
      });
    }
  }

  // Domain picker: exactly three domains are on the map; choosing a fourth
  // replaces the one chosen longest ago.
  $("#venn-domains").innerHTML = disciplines.map((d) => `<button data-domain="${d.id}">${esc(d.name)}</button>`).join("");
  $("#venn-domains").addEventListener("click", (e) => {
    const b = e.target.closest("[data-domain]");
    if (!b || chosen.includes(b.dataset.domain)) return;
    chosen = [...chosen.slice(1), b.dataset.domain];
    buildVenn();
  });
  $("#venn-presets").innerHTML = venn.presets.map((p) => `<button data-domains="${[...p.domains].sort().join(",")}" data-order="${p.domains.join(",")}">${esc(p.name)}</button>`).join("");
  $("#venn-presets").addEventListener("click", (e) => {
    const b = e.target.closest("[data-order]");
    if (!b) return;
    chosen = b.dataset.order.split(",");
    buildVenn();
  });

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
  function paint() {
    for (const k in shapes) {
      const m = +k;
      const on = m === selected && !selectedTool;
      shapes[k].classList.toggle("on", on);
      shapes[k].classList.toggle("hover", m === hovered && !on);
      countEls[k]?.classList.toggle("on", on);
      nameGroups[k]?.classList.toggle("on", on);
    }
    layers.tools.querySelectorAll(".v-tool").forEach((g) => g.classList.toggle("on", g.dataset.tool === selectedTool));
    $("#venn-keys").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.mask === selected && !selectedTool));
  }
  svg.addEventListener("pointermove", (e) => { const p = toSvg(e); const k = maskAt(p.x, p.y); if (k !== hovered) { hovered = k; paint(); } });
  svg.addEventListener("pointerleave", () => { hovered = null; paint(); });
  svg.addEventListener("click", (e) => {
    const tile = e.target.closest(".v-tool");
    if (tile) return showTool(tile.dataset.tool);
    const more = e.target.closest(".v-more-tile");
    if (more) return select(+more.dataset.mask);
    const p = toSvg(e);
    select(maskAt(p.x, p.y));
  });
  svg.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const tile = e.target.closest(".v-tool"), more = e.target.closest(".v-more-tile");
    if (tile) { e.preventDefault(); showTool(tile.dataset.tool); }
    else if (more) { e.preventDefault(); select(+more.dataset.mask); }
  });
  $("#venn-keys").addEventListener("click", (e) => { const b = e.target.closest("[data-mask]"); if (b) select(+b.dataset.mask); });

  const projectItem = (p, { exclude, role } = {}) => `
        <li>
          <h4>${esc(p.name)}</h4>
          <p class="vp-region">${esc(domainLine(p.domains))}</p>
          ${role ? `<p><b class="vp-role">${esc(role.role)}.</b> ${esc(role.why)}</p>` : `<p>${esc(p.desc)}</p>`}
          <div class="vp-recipe">${p.tools.filter((n) => n !== exclude).map(toolChip).join('<span class="plus">+</span>')}</div>
          ${chainFor(p.name) ? `<button class="follow" data-chain="${esc(p.name)}">Follow the chain →</button>` : ""}
        </li>`;

  function select(mask) {
    selected = mask;
    selectedTool = null;
    paint();
    const r = byMask[mask];
    $("#venn-panel").innerHTML = `
      <p class="eyebrow">${r.mask ? (r.ids.length === 1 ? "One domain" : `${r.ids.length}-way intersection`) : "The ground"} · ${r.projects.length} projects · ${r.tools.length} tools</p>
      <h3 class="vp-title">${esc(r.title)}</h3>
      <p class="vp-note">${esc(r.note)}</p>
      ${r.tools.length ? `<p class="vp-label">${r.mask ? "Tools at home here" : "Foundation tools"}</p>
      <div class="vp-recipe vp-home">${r.tools.map((t) => toolChip(t.name)).join("")}</div>` : ""}
      <p class="vp-label">${r.mask ? "Projects you can build" : "Projects in other domains"}</p>
      ${r.projects.length ? `<ol class="vp-list">${r.projects.map((p) => projectItem(p)).join("")}</ol>`
        : `<p class="vp-note">No project in the atlas sits exactly here yet — try another combination of domains.</p>`}`;
  }

  // Which region of the current map a tool sits in, or null if off the map
  const maskOfTool = (name) => {
    const t = toolByName[name];
    const m = maskOf(t.domains);
    return m || t.foundation ? m : null;
  };

  // Tool-centred view: what a tool is, where it sits, and the role it plays
  // in each project that uses it.
  function showTool(name) {
    const t = toolByName[name];
    const m = maskOfTool(name);
    selectedTool = name;
    if (m !== null) selected = m;
    paint();
    const uses = projects.filter((p) => p.tools.includes(name));
    const roles = Object.fromEntries(chains.flatMap((c) => c.steps.filter((s) => s.tool === name).map((s) => [c.project, s])));
    $("#venn-panel").innerHTML = `
      <p class="eyebrow">Tool · ${esc(t.kind)}</p>
      <div class="tp-head">${logo(t, "lg")}<div><h3 class="vp-title">${esc(t.name)}</h3><span class="lic">${esc(t.license)}</span></div></div>
      <p class="vp-note">${esc(t.desc)}</p>
      <p class="vp-label">Domains</p>
      <div class="dom-tags">${t.domains.map((d) => `<span>${esc(discName[d])}</span>`).join("")}</div>
      ${m !== null ? `<p class="vp-label">On this map</p><button class="region-link" data-mask="${m}">${esc(byMask[m].title)} →</button>`
        : `<p class="vp-label">On this map</p><p class="vp-note">Not among the three chosen domains — pick ${esc(discName[t.domains[0]])} to place it.</p>`}
      <p class="vp-label">Used in ${uses.length} project${uses.length === 1 ? "" : "s"}</p>
      ${uses.length ? `<ol class="vp-list">${uses.map((p) => projectItem(p, { exclude: name, role: roles[p.name] })).join("")}</ol>`
        : `<p class="vp-note">Not yet part of a project recipe — a building block to reach for as needed.</p>`}
      <button class="follow" data-atlas="${esc(name)}">Open in the Atlas →</button>`;
  }

  // In the panel: a tool chip opens that tool, a region link its region, a
  // chain link its chain, and "Open in the Atlas" jumps to the catalogue.
  $("#venn-panel").addEventListener("click", (e) => {
    const t = e.target.closest("[data-tool]");
    if (t) return showTool(t.dataset.tool);
    const r = e.target.closest("[data-mask]");
    if (r) return select(+r.dataset.mask);
    const a = e.target.closest("[data-atlas]");
    if (a) return jumpToTool(a.dataset.atlas);
    const c = e.target.closest("[data-chain]");
    if (c) { showChain(c.dataset.chain); $("#chains").scrollIntoView(); }
  });

  // Recommendation chains
  const picker = $("#chain-picker");
  picker.innerHTML = chains.map((c) => `
    <button role="tab" data-chain="${esc(c.project)}">
      <span class="cp-name">${esc(c.project)}</span>
      <span class="cp-meta">${esc(domainLine(projectByName[c.project].domains))} · ${esc(c.level)}</span>
    </button>`).join("");
  picker.addEventListener("click", (e) => { const b = e.target.closest("[data-chain]"); if (b) showChain(b.dataset.chain); });

  function showChain(project) {
    const c = chainFor(project);
    picker.querySelectorAll("button").forEach((b) => {
      const on = b.dataset.chain === project;
      b.setAttribute("aria-selected", on);
      // The picker scrolls (sideways on phones); keep the chosen project visible
      if (on && picker.scrollWidth > picker.clientWidth) picker.scrollLeft = b.offsetLeft - picker.offsetLeft;
      if (on && picker.scrollHeight > picker.clientHeight) picker.scrollTop = b.offsetTop - picker.offsetTop - 40;
    });
    $("#chain-view").innerHTML = `
      <p class="eyebrow">${esc(domainLine(projectByName[project].domains))} · ${esc(c.level)} · ${c.steps.length} links</p>
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
            ${s.alt ? `<p class="alt">Alternative: <button class="chip" data-tool="${esc(s.alt)}">${logo(toolByName[s.alt], "xs")}${esc(s.alt)}</button></p>` : ""}
          </div>
        </li>`;
      }).join("")}
      </ol>`;
  }
  $("#chain-view").addEventListener("click", (e) => { const t = e.target.closest("[data-tool]"); if (t) openTool(t.dataset.tool); });

  showChain(chains[0].project);
  // Names depend on the web font's metrics, so lay the map out once it loads
  buildVenn();
  document.fonts.ready.then(() => { layoutNames(); paint(); });

  // ---------------------------------------------------------------------
  // Build Paths — tracks, each with a common-path architecture and the
  // projects on it. Project and tool cards open in the explore drawer.
  const trackById = Object.fromEntries(tracks.map((t) => [t.id, t]));
  const tracksFor = (name) => tracks.flatMap((tr) => architectures[tr.id].stages
    .filter((s) => s.tools.includes(name)).map((s) => ({ tr, s })));
  const toolTile = (n) => `<button class="ttile" data-open-tool="${esc(n)}" title="${esc(toolByName[n].kind)}">${logo(toolByName[n], "sm")}<span>${esc(n)}</span></button>`;
  const projectCard = (p) => {
    const c = chainFor(p.name);
    return `
      <button class="pcard" data-open-project="${esc(p.name)}">
        <span class="pc-domains">${esc(domainLine(p.domains))}</span>
        <span class="pc-title">${esc(p.name)}</span>
        <span class="pc-desc">${esc(p.desc)}</span>
        <span class="pc-stack">${p.tools.slice(0, 6).map((n) => logo(toolByName[n], "sm")).join("")}${p.tools.length > 6 ? `<span class="pc-more">+${p.tools.length - 6}</span>` : ""}</span>
        <span class="pc-foot"><span>${p.tools.length} tools${c ? ` · ${esc(c.level)} chain` : ""}</span><span class="pc-go">Explore →</span></span>
      </button>`;
  };

  const groups = [...new Set(tracks.map((t) => t.group))];
  $("#track-groups").innerHTML = groups.map((g) => `
    <div class="tg">
      <p class="vp-label">${esc(g)}</p>
      <div class="pills">${tracks.filter((t) => t.group === g).map((t) => `<button data-track="${t.id}">${esc(t.name)} <span>${projects.filter((p) => p.track === t.id).length}</span></button>`).join("")}</div>
    </div>`).join("");
  $("#track-groups").addEventListener("click", (e) => { const b = e.target.closest("[data-track]"); if (b) showTrack(b.dataset.track); });

  let currentTrack = null;
  function showTrack(id) {
    currentTrack = id;
    const tr = trackById[id], arch = architectures[id];
    const list = projects.filter((p) => p.track === id);
    const archTools = new Set(arch.stages.flatMap((s) => s.tools));
    $("#track-groups").querySelectorAll("[data-track]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.track === id));
    $("#track-view").innerHTML = `
      <div class="tv-head">
        <p class="eyebrow">${esc(tr.group)} · ${list.length} projects · ${archTools.size} tools</p>
        <h3 class="tv-title">${esc(tr.name)}</h3>
        <p class="vp-note">${esc(tr.blurb)}</p>
      </div>
      <div class="arch">
        <p class="vp-label">Architecture · ${esc(arch.title)}</p>
        <ol class="arch-flow">${arch.stages.map((s, i) => `<li><button data-stage="${i}">${esc(s.name)}</button></li>`).join("")}</ol>
        <ol class="arch-stages">${arch.stages.map((s, i) => `
          <li class="layer" data-stage-card="${i}">
            <div class="layer-top"><span class="step">${String(i + 1).padStart(2, "0")}</span><h4>${esc(s.name)}</h4></div>
            <p>${esc(s.role)}</p>
            <div class="layer-tools">${s.tools.map(toolTile).join("")}</div>
          </li>`).join("")}
        </ol>
        ${tr.note ? `<p class="arch-note">${esc(tr.note)}</p>` : ""}
      </div>
      <p class="vp-label">Projects on this path <span class="hint">— hover a card to light up the layers it uses; open it for the full stack</span></p>
      <div class="pcards">${list.map(projectCard).join("")}</div>`;
  }
  const trackView = $("#track-view");
  trackView.addEventListener("click", (e) => {
    const t = e.target.closest("[data-open-tool]");
    if (t) return openTool(t.dataset.openTool);
    const p = e.target.closest("[data-open-project]");
    if (p) return openProject(p.dataset.openProject);
    const s = e.target.closest("[data-stage]");
    if (s) {
      const card = trackView.querySelector(`[data-stage-card="${s.dataset.stage}"]`);
      card.classList.remove("flash"); void card.offsetWidth; card.classList.add("flash");
      card.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
  // Hovering or focusing a project lights up the layers and tools it uses
  const light = (name) => {
    const used = name ? new Set(projectByName[name].tools) : null;
    trackView.classList.toggle("lighting", !!used);
    trackView.querySelectorAll(".layer").forEach((st) => {
      let any = false;
      st.querySelectorAll(".ttile").forEach((tl) => { const on = !!used && used.has(tl.dataset.openTool); tl.classList.toggle("lit", on); any ||= on; });
      st.classList.toggle("lit", any);
    });
  };
  trackView.addEventListener("pointerover", (e) => { const p = e.target.closest(".pcard"); light(p ? p.dataset.openProject : null); });
  trackView.addEventListener("pointerleave", () => light(null));
  trackView.addEventListener("focusin", (e) => { const p = e.target.closest(".pcard"); light(p ? p.dataset.openProject : null); });

  // Explore drawer
  const drawer = $("#drawer"), drawerBody = $("#drawer-body");
  function openDrawer(html) {
    drawerBody.innerHTML = html;
    if (!drawer.open) drawer.showModal();
    drawerBody.scrollTop = 0;
  }
  $("#drawer-close").addEventListener("click", () => drawer.close());

  function openProject(name) {
    const p = projectByName[name], tr = trackById[p.track], arch = architectures[p.track], c = chainFor(name);
    const step = c ? Object.fromEntries(c.steps.map((s) => [s.tool, s])) : {};
    const staged = new Set(arch.stages.flatMap((s) => s.tools));
    const extra = p.tools.filter((n) => !staged.has(n));
    openDrawer(`
      <p class="eyebrow">${esc(tr.name)} · ${esc(domainLine(p.domains))}${c ? ` · ${esc(c.level)}` : ""}</p>
      <h3 class="vp-title" id="drawer-title">${esc(p.name)}</h3>
      <p class="vp-note">${esc(c ? c.goal : p.desc)}</p>
      <p class="vp-label">The stack · ${p.tools.length} tools, all free and open source</p>
      <ol class="dr-stack">${p.tools.map((n) => {
        const t = toolByName[n], s = step[n];
        return `<li>
          <button class="dr-tool" data-open-tool="${esc(n)}">${logo(t)}<span><b>${esc(n)}</b><i>${esc(s ? s.role : t.kind)}</i></span><em class="lic">${esc(t.license)}</em></button>
          <p>${s ? `<b>Why it's needed —</b> ${esc(s.why)}` : esc(t.desc)}</p>
        </li>`;
      }).join("")}</ol>
      <p class="vp-label">Where it sits in the ${esc(tr.name.toLowerCase())} architecture</p>
      <ol class="dr-arch">${arch.stages.map((s, i) => {
        const used = s.tools.filter((n) => p.tools.includes(n));
        return `<li class="${used.length ? "on" : ""}"><span class="step">${String(i + 1).padStart(2, "0")}</span><b>${esc(s.name)}</b><span>${used.length ? used.map(esc).join(", ") : "—"}</span></li>`;
      }).join("")}
      ${extra.length ? `<li class="on"><span class="step">+</span><b>Also</b><span>${extra.map(esc).join(", ")}</span></li>` : ""}
      </ol>
      <div class="dr-actions">
        ${c ? `<button class="follow" data-drawer-chain="${esc(name)}">Follow the step-by-step chain →</button>` : ""}
        <button class="follow" data-drawer-map="${esc(name)}">Place it on the map →</button>
      </div>`);
  }

  function openTool(name) {
    const t = toolByName[name];
    const uses = projects.filter((p) => p.tools.includes(name));
    const where = tracksFor(name);
    const roles = Object.fromEntries(chains.flatMap((c) => c.steps.filter((s) => s.tool === name).map((s) => [c.project, s])));
    openDrawer(`
      <p class="eyebrow">Tool · ${esc(t.kind)}</p>
      <div class="tp-head">${logo(t, "lg")}<div><h3 class="vp-title" id="drawer-title">${esc(t.name)}</h3>
        <span class="badges"><span class="lic">${esc(t.license)}</span><span class="free">Open source · Free</span></span></div></div>
      <p class="vp-note">${esc(t.desc)}</p>
      <p class="vp-label">Domains</p>
      <div class="dom-tags">${t.domains.map((d) => `<span>${esc(discName[d])}</span>`).join("")}</div>
      ${where.length ? `<p class="vp-label">In the build paths</p>
      <div class="dr-where">${where.map(({ tr, s }) => `<button data-drawer-track="${tr.id}">${esc(tr.name)} <i>→</i> ${esc(s.name)}</button>`).join("")}</div>` : ""}
      <p class="vp-label">Used in ${uses.length} project${uses.length === 1 ? "" : "s"}</p>
      ${uses.length ? `<div class="dr-uses">${uses.map((p) => `
        <button class="dr-use" data-open-project="${esc(p.name)}">
          <b>${esc(p.name)}</b>
          <span>${roles[p.name] ? `${esc(roles[p.name].role)} — ${esc(roles[p.name].why)}` : esc(p.desc)}</span>
        </button>`).join("")}</div>` : `<p class="vp-note">Not yet part of a project here — a building block to reach for as needed.</p>`}
      <div class="dr-actions">
        <a class="follow" href="${esc(t.url)}" target="_blank" rel="noopener">Project website ↗</a>
        <button class="follow" data-drawer-atlas="${esc(name)}">Show in the Atlas →</button>
      </div>`);
  }

  // Put a project's domains on the Venn map and select its region
  function placeOnMap(name) {
    const p = projectByName[name];
    const next = p.domains.slice(0, 3);
    for (const d of chosen) if (next.length < 3 && !next.includes(d)) next.push(d);
    chosen = next;
    buildVenn();
    select(maskOf(p.domains));
    $("#map").scrollIntoView();
  }

  drawer.addEventListener("click", (e) => {
    if (e.target === drawer) return drawer.close(); // backdrop
    const t = e.target.closest("[data-open-tool]");
    if (t) return openTool(t.dataset.openTool);
    const p = e.target.closest("[data-open-project]");
    if (p) return openProject(p.dataset.openProject);
    const c = e.target.closest("[data-drawer-chain]");
    if (c) { drawer.close(); showChain(c.dataset.drawerChain); return $("#chains").scrollIntoView(); }
    const m = e.target.closest("[data-drawer-map]");
    if (m) { drawer.close(); return placeOnMap(m.dataset.drawerMap); }
    const a = e.target.closest("[data-drawer-atlas]");
    if (a) { drawer.close(); return jumpToTool(a.dataset.drawerAtlas); }
    const tr = e.target.closest("[data-drawer-track]");
    if (tr) { drawer.close(); showTrack(tr.dataset.drawerTrack); $("#paths").scrollIntoView(); }
  });

  // Tools anywhere outside the map open in the drawer
  $("#atlas-grid").addEventListener("click", (e) => { const b = e.target.closest("[data-open-tool]"); if (b) openTool(b.dataset.openTool); });

  showTrack(tracks[0].id);

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

  // ---------------------------------------------------------------------
  // Hero instruments: typed boot line, UTC clock, stats that count up.
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bootText = `> indexing ${tools.length} open-source tools · ${projects.length} projects · ${tracks.length} build paths … ready`;
  const boot = $("#boot");
  if (reduced) boot.textContent = bootText;
  else { let i = 0; const tick = () => { boot.textContent = bootText.slice(0, ++i); if (i < bootText.length) setTimeout(tick, 22); }; setTimeout(tick, 400); }
  const clock = () => { $("#clock").textContent = new Date().toISOString().slice(11, 19) + " UTC"; };
  clock(); setInterval(clock, 1000);
  document.querySelectorAll("#stats .stat b").forEach((b) => {
    const target = +b.textContent;
    if (reduced || !target) return;
    const start = performance.now(), dur = 1400;
    const step = (now) => {
      const k = Math.min(1, (now - start) / dur);
      b.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    b.textContent = "0";
    requestAnimationFrame(step);
  });

  // ---------------------------------------------------------------------
  // Field: a depth starfield, a rotating point-cloud globe with orbit rings
  // that drifts away as you scroll, and a perspective grid to the horizon.
  const c = $("#field");
  const ctx = c.getContext("2d");
  const root = document.documentElement;
  let FW, FH, dpr, small, stars = [], globe = [];
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 }; // -1..1, eased toward the pointer
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    FW = c.width = innerWidth * dpr;
    FH = c.height = innerHeight * dpr;
    small = innerWidth < 760;
    stars = Array.from({ length: small ? 120 : 240 }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() }));
    // Evenly spread points on a sphere (Fibonacci lattice)
    const n = small ? 300 : 560, golden = Math.PI * (3 - Math.sqrt(5));
    globe = Array.from({ length: n }, (_, i) => {
      const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
      return [Math.cos(th) * r, y, Math.sin(th) * r];
    });
    if (reduced) frame(0);
  }
  addEventListener("resize", size);
  addEventListener("pointermove", (e) => { mouse.tx = e.clientX / innerWidth * 2 - 1; mouse.ty = e.clientY / innerHeight * 2 - 1; });
  if (reduced) addEventListener("scroll", () => frame(0), { passive: true });

  const rotate = ([x, y, z], ay, ax) => {
    const x1 = x * Math.cos(ay) + z * Math.sin(ay), z1 = -x * Math.sin(ay) + z * Math.cos(ay);
    return [x1, y * Math.cos(ax) - z1 * Math.sin(ax), y * Math.sin(ax) + z1 * Math.cos(ax)];
  };

  function frame(now) {
    const t = now / 1000;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    root.style.setProperty("--mx", mouse.x.toFixed(3));
    root.style.setProperty("--my", mouse.y.toFixed(3));
    const sy = scrollY * dpr;

    ctx.fillStyle = "#020202";
    ctx.fillRect(0, 0, FW, FH);

    // Halo behind the globe
    const gx = FW * (small ? 0.5 : 0.72), gy = FH * (small ? 0.3 : 0.42) - sy * 0.45;
    const halo = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(FW, FH) * 0.55);
    halo.addColorStop(0, "rgba(255,255,255,0.08)");
    halo.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, FW, FH);

    // Starfield flying gently toward the viewer
    for (const s of stars) {
      if (!reduced) s.z -= 0.0012;
      let px = FW / 2 + (s.x / s.z) * FW * 0.22 - mouse.x * 20 * dpr * (1 - s.z);
      let py = FH / 2 + (s.y / s.z) * FH * 0.22 - mouse.y * 20 * dpr * (1 - s.z);
      if (s.z < 0.03 || px < 0 || px > FW || py < 0 || py > FH) { s.z = 1; s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; continue; }
      const k = 1 - s.z;
      ctx.fillStyle = `rgba(255,255,255,${(0.15 + k * 0.85).toFixed(3)})`;
      const r = (0.4 + k * 1.6) * dpr;
      ctx.fillRect(px - r / 2, py - r / 2, r, r);
    }

    // Perspective grid floor; scrolling moves you across it
    const horizon = FH * 0.66;
    const spacing = 0.5, off = ((t * 0.25 + sy * 0.0025) % spacing);
    ctx.lineWidth = dpr;
    for (let i = 0; i < 26; i++) {
      const z = 0.35 + i * spacing - off;
      if (z <= 0.3) continue;
      const y = horizon + (FH * 0.22) / z;
      if (y > FH) continue;
      ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.28, 0.5 / (z * 2.2)).toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(FW, y); ctx.stroke();
    }
    const vx = FW / 2 - mouse.x * 60 * dpr;
    for (let k = -18; k <= 18; k++) {
      ctx.strokeStyle = `rgba(255,255,255,${(0.16 - Math.abs(k) * 0.006).toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(vx + k * 6 * dpr, horizon); ctx.lineTo(FW / 2 + k * FW * 0.09, FH); ctx.stroke();
    }
    // Soften the horizon and draw its glow
    const fade = ctx.createLinearGradient(0, horizon - 2, 0, horizon + FH * 0.12);
    fade.addColorStop(0, "rgba(2,2,2,1)"); fade.addColorStop(1, "rgba(2,2,2,0)");
    ctx.fillStyle = fade; ctx.fillRect(0, horizon - 2, FW, FH * 0.12 + 2);
    const glow = ctx.createLinearGradient(0, 0, FW, 0);
    glow.addColorStop(0, "rgba(255,255,255,0)"); glow.addColorStop(0.5, "rgba(255,255,255,0.45)"); glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow; ctx.fillRect(0, horizon - dpr, FW, dpr);

    // Globe of points, with a scanning band and two orbit rings
    const R = Math.min(FW, FH) * (small ? 0.3 : 0.28);
    if (gy + R * 1.6 > 0) {
      const ay = t * 0.12 + mouse.x * 0.5, ax = -0.35 + mouse.y * 0.25;
      const band = Math.sin(t * 0.6);
      for (const p of globe) {
        const [x, y, z] = rotate(p, ay, ax);
        const f = 2.8 / (2.8 - z);
        const lit = Math.abs(y - band) < 0.035;
        const a = lit ? 1 : 0.12 + 0.68 * (z + 1) / 2;
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        const r = (lit ? 2.2 : 1.3) * dpr * f;
        ctx.fillRect(gx + x * R * f - r / 2, gy + y * R * f - r / 2, r, r);
      }
      for (const [tilt, speed, scale] of [[0.9, 0.5, 1.45], [-0.5, -0.35, 1.7]]) {
        ctx.beginPath();
        for (let i = 0; i <= 96; i++) {
          const th = (i / 96) * Math.PI * 2;
          const [x, y, z] = rotate([Math.cos(th) * scale, 0, Math.sin(th) * scale], 0.4, tilt + mouse.y * 0.1);
          const f = 2.8 / (2.8 - z * 0.6);
          const px = gx + x * R * f, py = gy + y * R * f;
          i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.strokeStyle = "rgba(255,255,255,0.16)";
        ctx.stroke();
        const th = t * speed;
        const [x, y, z] = rotate([Math.cos(th) * scale, 0, Math.sin(th) * scale], 0.4, tilt + mouse.y * 0.1);
        const f = 2.8 / (2.8 - z * 0.6);
        const sat = [gx + x * R * f, gy + y * R * f];
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(sat[0], sat[1], 2.6 * dpr, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath(); ctx.arc(sat[0], sat[1], 7 * dpr, 0, Math.PI * 2); ctx.stroke();
      }
    }

    // A slow scan beam sweeping down the screen
    if (!reduced) {
      const by = ((t * 70 * dpr) % (FH * 1.6)) - FH * 0.3;
      const beam = ctx.createLinearGradient(0, by - 60 * dpr, 0, by);
      beam.addColorStop(0, "rgba(255,255,255,0)"); beam.addColorStop(1, "rgba(255,255,255,0.05)");
      ctx.fillStyle = beam; ctx.fillRect(0, by - 60 * dpr, FW, 60 * dpr);
      requestAnimationFrame(frame);
    }
  }
  size();
  if (!reduced) requestAnimationFrame(frame);
})();
