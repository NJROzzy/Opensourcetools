(() => {
  const { disciplines, tracks, architectures, designs, tools, projects, chains, trends, wire, venn } = window.ATLAS;
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
    ? `<span class="plate ${cls}"><img src="${esc(t.logo)}" alt="" loading="lazy" draggable="false" class="${t.logo.endsWith(".svg") ? "glyph" : "photo"}" /></span>`
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
      <button class="follow chain-graph" data-chain-graph="${esc(project)}">View its architecture graph →</button>
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
  $("#chain-view").addEventListener("click", (e) => {
    const g = e.target.closest("[data-chain-graph]");
    if (g) return openProjectGraph(g.dataset.chainGraph);
    const t = e.target.closest("[data-tool]");
    if (t) openTool(t.dataset.tool);
  });

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
        <button class="follow" data-path-graph="${id}">See this path as a connected architecture graph →</button>
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
    const pg = e.target.closest("[data-path-graph]");
    if (pg) return openPathGraph(pg.dataset.pathGraph);
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
        <button class="follow" data-drawer-graph="${esc(name)}">View its architecture graph →</button>
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
    const gr = e.target.closest("[data-drawer-graph]");
    if (gr) { drawer.close(); return openProjectGraph(gr.dataset.drawerGraph); }
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

  // ---------------------------------------------------------------------
  // Architecture Studio — drag tools (or whole projects) into the lanes of
  // a path's architecture; an advisor tile inside the grid recommends tools.
  const ST_KEY = "amg-studio";
  const stSave = () => { try { localStorage.setItem(ST_KEY, JSON.stringify(st)); } catch { /* storage unavailable */ } };
  const stLoad = () => {
    try {
      const v = JSON.parse(localStorage.getItem(ST_KEY));
      if (!v || !architectures[v.track]) return null;
      const slots = {};
      for (const [k, names] of Object.entries(v.slots || {})) slots[k] = (names || []).filter((n) => toolByName[n]);
      return { track: v.track, title: String(v.title || "").slice(0, 60), slots, view: v.view === "graph" ? "graph" : "grid" };
    } catch { return null; }
  };
  let st = stLoad() || { track: "web", title: "", slots: {}, view: "grid" };
  let palTab = "tools";
  // One step of undo for actions that replace or merge many tools at once
  let undoSnap = null;
  const snapshot = () => { undoSnap = JSON.parse(JSON.stringify(st)); };

  const stArch = () => architectures[st.track];
  const laneKeys = () => [...stArch().stages.map((_, i) => String(i)), "extra"];
  const placed = () => laneKeys().flatMap((k) => st.slots[k] || []);
  const bestLane = (name) => { const i = stArch().stages.findIndex((s) => s.tools.includes(name)); return i < 0 ? "extra" : String(i); };
  const removeTool = (name) => { for (const k in st.slots) st.slots[k] = st.slots[k].filter((n) => n !== name); };
  function addTool(name, lane = bestLane(name)) {
    removeTool(name);
    (st.slots[lane] ||= []).push(name);
  }
  function setTrack(id) {
    const names = placed();
    st.track = id; st.slots = {};
    names.forEach((n) => addTool(n));
  }
  function loadProject(name) {
    snapshot();
    const p = projectByName[name];
    if (p.track !== st.track) setTrack(p.track);
    p.tools.forEach((n) => { if (!placed().includes(n)) addTool(n); });
    if (!st.title) st.title = p.name;
    stChanged(`Loaded ${p.name}`);
  }

  // Two tools overlap when their kinds match once "library", "framework" and
  // the like are set aside, or when a chain lists one as the other's alternative
  const kindKey = (n) => toolByName[n].kind.toLowerCase().replace(/\b(library|framework|engine|toolkit|& proxy|in one file)\b/g, "").replace(/\s+/g, " ").trim();
  const altPairs = new Set(chains.flatMap((c) => c.steps.filter((x) => x.alt).flatMap((x) => [`${x.tool}|${x.alt}`, `${x.alt}|${x.tool}`])));
  const overlaps = (a, b) => kindKey(a) === kindKey(b) || altPairs.has(`${a}|${b}`);

  // How often two tools appear in the same project
  const together = {};
  for (const p of projects) for (const a of p.tools) for (const b of p.tools) if (a !== b) {
    (together[a] ||= {})[b] = (together[a][b] || 0) + 1;
  }

  const trackSel = $("#st-track"), titleIn = $("#st-title"), board = $("#st-board"), list = $("#st-list"), qIn = $("#st-q");
  trackSel.innerHTML = tracks.map((t) => `<option value="${t.id}">${esc(t.group === "Software Engineering" ? `Software · ${t.name}` : t.name)}</option>`).join("");
  trackSel.addEventListener("change", () => { setTrack(trackSel.value); stChanged(); });
  titleIn.addEventListener("input", () => { st.title = titleIn.value; stSave(); });
  $("#st-clear").addEventListener("click", () => { snapshot(); st.slots = {}; st.title = ""; stChanged("Cleared"); });
  $("#st-undo").addEventListener("click", () => { if (!undoSnap) return; st = undoSnap; undoSnap = null; stChanged("Undone"); });
  document.querySelectorAll(".st-views [data-view]").forEach((b) => b.addEventListener("click", () => { st.view = b.dataset.view; stChanged(); }));
  $("#st-copy").addEventListener("click", async () => {
    const arch = stArch(), tr = trackById[st.track];
    const lines = [`${st.title || "Untitled architecture"} — ${tr.name}`, ""];
    arch.stages.forEach((s, i) => lines.push(`${String(i + 1).padStart(2, "0")} ${s.name}: ${(st.slots[i] || []).join(", ") || "—"}`));
    if ((st.slots.extra || []).length) lines.push(`+  Extras: ${st.slots.extra.join(", ")}`);
    lines.push("", "Every tool is free and open source. Assembled with Amalgam: https://amalgambynjr.vercel.app");
    try { await navigator.clipboard.writeText(lines.join("\n")); flash("Copied"); }
    catch { flash("Copy unavailable here"); }
  });
  let flashT;
  const flash = (msg) => { const el = $("#st-status"); el.textContent = msg; clearTimeout(flashT); flashT = setTimeout(() => { el.textContent = ""; }, 2200); };
  function stChanged(msg) { stSave(); renderStudio(); if (msg) flash(msg); }

  document.querySelectorAll(".pal-tabs [data-tab]").forEach((b) => b.addEventListener("click", () => {
    palTab = b.dataset.tab;
    document.querySelectorAll(".pal-tabs [data-tab]").forEach((x) => x.setAttribute("aria-selected", x === b));
    qIn.placeholder = palTab === "tools" ? "search tools…" : "search projects…";
    renderPalette();
  }));
  qIn.addEventListener("input", renderPalette);

  function renderPalette() {
    const q = qIn.value.trim().toLowerCase();
    const on = new Set(placed());
    if (palTab === "projects") {
      const ps = projects.filter((p) => !q || `${p.name} ${p.desc} ${p.tools.join(" ")}`.toLowerCase().includes(q))
        .sort((a, b) => (b.track === st.track) - (a.track === st.track));
      list.innerHTML = ps.map((p) => `
        <button class="pal-proj" data-drag="project" data-name="${esc(p.name)}">
          <span class="pp-track">${esc(trackById[p.track].name)}</span>
          <b>${esc(p.name)}</b>
          <span class="pp-stack">${p.tools.slice(0, 6).map((n) => logo(toolByName[n], "xs")).join("")}</span>
        </button>`).join("") || `<p class="pal-none">No project matches.</p>`;
      return;
    }
    const chip = (n) => `<button class="pal-tool${on.has(n) ? " on" : ""}" data-drag="tool" data-name="${esc(n)}" title="${esc(toolByName[n].kind)}">${logo(toolByName[n], "xs")}<span>${esc(n)}</span>${on.has(n) ? "<i>✓</i>" : ""}</button>`;
    if (q) {
      const hits = tools.filter((t) => `${t.name} ${t.kind} ${t.desc}`.toLowerCase().includes(q)).map((t) => t.name);
      list.innerHTML = hits.length ? `<div class="pal-group">${hits.map(chip).join("")}</div>` : `<p class="pal-none">No tool matches.</p>`;
      return;
    }
    const arch = stArch();
    const inArch = new Set(arch.stages.flatMap((s) => s.tools));
    list.innerHTML = arch.stages.map((s) => `<p class="pal-label">${esc(s.name)}</p><div class="pal-group">${s.tools.map(chip).join("")}</div>`).join("")
      + `<p class="pal-label">Everything else</p><div class="pal-group">${tools.filter((t) => !inArch.has(t.name)).map((t) => chip(t.name)).join("")}</div>`;
  }

  // How strongly a tool goes with what is already placed
  const stAffinity = (n) => placed().reduce((s, m) => s + ((together[m] || {})[n] || 0), 0);

  // Advisor: coverage, empty layers, good pairings, closest projects, notes
  function advise() {
    const arch = stArch();
    const names = placed(), on = new Set(names);
    const filled = arch.stages.filter((_, i) => (st.slots[i] || []).length).length;
    const affinity = stAffinity;
    const addBtn = (n, lane = bestLane(n), why = "") => `<button class="adv-add" data-add="${esc(n)}" data-to="${lane}" title="${esc(why || toolByName[n].kind)}">${logo(toolByName[n], "xs")}+ ${esc(n)}</button>`;
    const pct = Math.round(filled / arch.stages.length * 100);
    let html = `
      <div class="adv-head">
        <span class="live"><i></i>Advisor</span>
        <span class="adv-cov">${filled}/${arch.stages.length} layers</span>
      </div>
      <div class="adv-meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Layer coverage"><span style="width:${pct}%"></span></div>`;

    if (!names.length) {
      const starters = projects.filter((p) => p.track === st.track);
      return html + `
        <p class="adv-text">Drop tools into the lanes and I'll suggest what's missing. Or start from a project on this path:</p>
        <div class="adv-row">${starters.map((p) => `<button class="adv-load" data-load="${esc(p.name)}">${esc(p.name)}</button>`).join("")}</div>`;
    }

    const empty = arch.stages.map((s, i) => ({ s, i })).filter(({ i }) => !(st.slots[i] || []).length);
    if (empty.length) {
      html += `<p class="adv-label">Fill the empty layers</p><ul class="adv-list">${empty.slice(0, 4).map(({ s, i }) => {
        const picks = [...s.tools].sort((a, b) => affinity(b) - affinity(a)).slice(0, 2);
        return `<li><b>${esc(s.name)}</b><span>${picks.map((n) => addBtn(n, String(i), s.role)).join("")}</span></li>`;
      }).join("")}${empty.length > 4 ? `<li class="adv-more">+${empty.length - 4} more empty layers</li>` : ""}</ul>`;
    } else {
      html += `<p class="adv-text"><b>Every layer is covered.</b> This is a complete ${esc(trackById[st.track].name.toLowerCase())} architecture.</p>`;
    }

    const pairs = Object.keys(toolByName).filter((n) => !on.has(n)).map((n) => {
      let best = null, score = 0;
      for (const m of names) { const c = (together[m] || {})[n] || 0; score += c; if (c && (!best || c > best[1])) best = [m, c]; }
      return { n, score, best };
    }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
    if (pairs.length) {
      html += `<p class="adv-label">Pairs well with your stack</p><div class="adv-row">${pairs.map(({ n, best }) => addBtn(n, bestLane(n), `Often used with ${best[0]}`)).join("")}</div>`;
    }

    const matches = projects.map((p) => {
      const inter = p.tools.filter((n) => on.has(n)).length;
      return { p, inter, score: inter / new Set([...p.tools, ...names]).size };
    }).filter((m) => m.inter).sort((a, b) => b.score - a.score).slice(0, 3);
    if (matches.length) {
      html += `<p class="adv-label">Closest real projects</p><ul class="adv-match">${matches.map(({ p, score }) => `
        <li><button class="adv-proj" data-open-project="${esc(p.name)}"><b>${esc(p.name)}</b><span>${esc(trackById[p.track].name)}</span></button>
        <span class="adv-pct">${Math.round(score * 100)}%</span>
        <button class="adv-load sm" data-graph="${esc(p.name)}" title="See this project's architecture graph">graph</button>
        <button class="adv-load sm" data-load="${esc(p.name)}" title="Add this project's missing tools">merge</button></li>`).join("")}</ul>`;
    }

    // Notes: layers holding tools that do the same job, and licences
    const notes = [];
    arch.stages.forEach((s, i) => {
      const lane = st.slots[i] || [];
      const groups = [];
      for (const n of lane) {
        const g = groups.find((grp) => grp.some((m) => overlaps(m, n)));
        g ? g.push(n) : groups.push([n]);
      }
      groups.filter((g) => g.length > 1).forEach((g) => notes.push(`<b>${esc(s.name)}</b> has ${g.map(esc).join(" and ")}, which do the same job. Most projects pick one.`));
    });
    const lic = {};
    names.forEach((n) => { const l = toolByName[n].license; lic[l] = (lic[l] || 0) + 1; });
    notes.push(`${names.length === 1 ? "This tool is" : `All ${names.length} tools are`} free and open source: ${Object.entries(lic).sort((a, b) => b[1] - a[1]).map(([l, c]) => `${esc(l)}${c > 1 ? ` ×${c}` : ""}`).join(", ")}.`);
    html += `<p class="adv-label">Notes</p><ul class="adv-notes">${notes.map((n) => `<li>${n}</li>`).join("")}</ul>`;
    return html;
  }

  const boardCols = () => getComputedStyle(board).gridTemplateColumns.split(" ").filter(Boolean).length;
  function renderStudio() {
    trackSel.value = st.track;
    if (document.activeElement !== titleIn) titleIn.value = st.title;
    titleIn.placeholder = `My ${trackById[st.track].name.toLowerCase()} architecture`;
    const arch = stArch();
    document.querySelectorAll(".st-views [data-view]").forEach((b) => b.setAttribute("aria-selected", b.dataset.view === st.view));
    $("#st-undo").hidden = !undoSnap;
    if (st.view === "graph") return renderStudioGraph();
    board.classList.remove("graph-mode");
    stGraph = null;
    const lane = (key, num, name, role) => {
      const items = st.slots[key] || [];
      return `<div class="lane${items.length ? "" : " empty"}${key === "extra" ? " extra" : ""}" data-lane="${key}">
        <div class="lane-head"><span class="step">${num}</span><b>${esc(name)}</b>${items.length ? `<span class="lane-n">${items.length}</span>` : ""}</div>
        <p class="lane-role">${esc(role)}</p>
        <div class="lane-nodes">${items.map((n) => `
          <div class="nchip" data-drag="node" data-name="${esc(n)}" data-from="${key}">
            <button class="nchip-open" data-open-tool="${esc(n)}">${logo(toolByName[n], "sm")}<span><b>${esc(n)}</b><i>${esc(toolByName[n].kind)}</i></span></button>
            <button class="nchip-x" data-remove="${esc(n)}" aria-label="Remove ${esc(n)}">×</button>
          </div>`).join("") || `<span class="lane-drop">drop a tool here</span>`}</div>
      </div>`;
    };
    board.innerHTML = arch.stages.map((s, i) => lane(String(i), String(i + 1).padStart(2, "0"), s.name, s.role)).join("")
      + lane("extra", "+", "Extras", "Anything else your project needs.")
      + `<div class="advisor" id="st-advisor" aria-live="polite">${advise()}</div>`;
    // The advisor fills the rest of the last row, or takes a row of its own
    const cols = boardCols(), rest = (cols - ((arch.stages.length + 1) % cols)) % cols;
    $("#st-advisor").style.gridColumn = `span ${rest >= 2 ? rest : cols}`;
    renderPalette();
  }
  // A path's layers plus the tools placed in them, as a design the graph can draw
  function trackDesign(track, slots, { includeEmpty, root } = {}) {
    const arch = architectures[track];
    const nodes = arch.stages.map((s, i) => ({ id: String(i), num: String(i + 1).padStart(2, "0"), name: s.name, role: s.role, tools: slots[i] || [] }))
      .filter((n) => includeEmpty || n.tools.length);
    if ((slots.extra || []).length || includeEmpty) nodes.push({ id: "extra", num: "+", name: "Extras", role: "Anything else the project needs.", tools: slots.extra || [] });
    const keyOf = Object.fromEntries(arch.stages.map((s, i) => [s.name, String(i)]));
    const ids = new Set(nodes.map((n) => n.id));
    const edges = (arch.links || []).map(([a, b, label]) => ({ from: keyOf[a], to: keyOf[b], label })).filter((e) => ids.has(e.from) && ids.has(e.to));
    return { title: root?.title, root, nodes, edges };
  }
  // Group tool names into a path's layers
  function slotsFor(track, names) {
    const arch = architectures[track], slots = {};
    for (const n of names) {
      const i = arch.stages.findIndex((s) => s.tools.includes(n));
      (slots[i < 0 ? "extra" : String(i)] ||= []).push(n);
    }
    return slots;
  }
  // A layer's own options, best fit with the given tools first
  const layerSuggest = (track, id, with_) => id === "extra" ? [] : [...architectures[track].stages[+id].tools]
    .sort((a, b) => with_.reduce((s, m) => s + ((together[m] || {})[b] || 0) - ((together[m] || {})[a] || 0), 0));

  // Graph view of the board: the same state, drawn as a connected architecture
  let stGraph = null, stGraphTrack = null;
  function renderStudioGraph() {
    board.classList.add("graph-mode");
    if (!stGraph || !board.contains(stGraph.host)) {
      board.innerHTML = `<div class="ag-host st-graph"></div><div class="advisor" id="st-advisor" aria-live="polite"></div>`;
      stGraph = createArchGraph(board.querySelector(".st-graph"), {
        mode: "tools", dragTools: true,
        getDesign: () => trackDesign(st.track, st.slots, { includeEmpty: true, root: { title: st.title || titleIn.placeholder, subtitle: `${trackById[st.track].name} · your architecture` } }),
        onEdit: (a) => {
          if (a.type === "addTool") { addTool(a.tool, a.node); stChanged(`Added ${a.tool}`); }
          if (a.type === "removeTool") { removeTool(a.tool); stChanged(`Removed ${a.tool}`); }
        },
        suggest: (id) => layerSuggest(st.track, id, placed()),
        onOpenTool: openTool, esc, logo, toolByName, tools,
      });
      stGraphTrack = st.track;
    }
    $("#st-advisor").innerHTML = advise();
    $("#st-advisor").style.gridColumn = "";
    if (stGraphTrack !== st.track) { stGraphTrack = st.track; stGraph.refit(); } else stGraph.render();
    renderPalette();
  }

  addEventListener("resize", () => {
    const adv = $("#st-advisor");
    if (!adv || st.view === "graph") return;
    const cols = boardCols(), rest = (cols - ((stArch().stages.length + 1) % cols)) % cols;
    adv.style.gridColumn = `span ${rest >= 2 ? rest : cols}`;
  });

  // Clicks: add from the palette, remove or open placed tools, advisor actions
  let suppressClick = false;
  $(".studio").addEventListener("click", (e) => {
    if (suppressClick) { suppressClick = false; e.preventDefault(); return; }
    const rm = e.target.closest("[data-remove]");
    if (rm) { removeTool(rm.dataset.remove); return stChanged(`Removed ${rm.dataset.remove}`); }
    const add = e.target.closest("[data-add]");
    if (add) { addTool(add.dataset.add, add.dataset.to); return stChanged(`Added ${add.dataset.add}`); }
    const load = e.target.closest("[data-load]");
    if (load) return loadProject(load.dataset.load);
    const gph = e.target.closest("[data-graph]");
    if (gph) return openProjectGraph(gph.dataset.graph);
    const op = e.target.closest("[data-open-tool]");
    if (op) return openTool(op.dataset.openTool);
    const pp = e.target.closest("[data-open-project]");
    if (pp) return openProject(pp.dataset.openProject);
    const src = e.target.closest("[data-drag]");
    if (src?.dataset.drag === "tool") {
      if (placed().includes(src.dataset.name)) return flash(`${src.dataset.name} is already on the grid`);
      addTool(src.dataset.name); return stChanged(`Added ${src.dataset.name}`);
    }
    if (src?.dataset.drag === "project") return loadProject(src.dataset.name);
  });

  // Drag and drop with pointer events, so mouse, pen and touch all work.
  // Touch needs a short press-and-hold first, so the palette still scrolls.
  let drag = null;
  const laneAt = (x, y) => document.elementFromPoint(x, y)?.closest("[data-lane]");
  function endDrag() {
    if (!drag) return;
    clearTimeout(drag.timer);
    drag.ghost?.remove();
    document.body.classList.remove("st-dragging");
    board.querySelectorAll("[data-lane].over, [data-lane].fit").forEach((l) => l.classList.remove("over", "fit"));
    drag = null;
  }
  function beginDrag(x, y) {
    drag.started = true;
    document.body.classList.add("st-dragging");
    const g = drag.el.cloneNode(true);
    g.classList.add("st-ghost");
    g.style.width = `${Math.min(drag.el.offsetWidth, 280)}px`;
    document.body.appendChild(g);
    drag.ghost = g;
    if (drag.kind !== "project") {
      const fit = board.querySelector(`[data-lane="${bestLane(drag.name)}"]`);
      fit?.classList.add("fit");
    }
    moveGhost(x, y);
  }
  function moveGhost(x, y) {
    drag.ghost.style.transform = `translate(${x + 12}px, ${y + 12}px) rotate(-2deg)`;
    const over = laneAt(x, y);
    board.querySelectorAll("[data-lane].over").forEach((l) => { if (l !== over) l.classList.remove("over"); });
    if (over && drag.kind !== "project") over.classList.add("over");
    board.classList.toggle("over", drag.kind === "project" && !!document.elementFromPoint(x, y)?.closest("#st-board"));
  }
  $(".studio").addEventListener("pointerdown", (e) => {
    const src = e.target.closest("[data-drag]");
    if (!src || e.button > 0 || e.target.closest(".nchip-x, .ag-x")) return;
    drag = { kind: src.dataset.drag, name: src.dataset.name, el: src, x0: e.clientX, y0: e.clientY, started: false, armed: e.pointerType !== "touch" };
    if (!drag.armed) drag.timer = setTimeout(() => { if (drag && !drag.started) { drag.armed = true; beginDrag(drag.x0, drag.y0); navigator.vibrate?.(12); } }, 280);
  });
  document.addEventListener("pointermove", (e) => {
    if (!drag) return;
    if (!drag.started) {
      const moved = Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0);
      if (!drag.armed) { if (moved > 8) endDrag(); return; } // a touch that moves first is a scroll
      if (moved < 5) return;
      beginDrag(e.clientX, e.clientY);
    }
    moveGhost(e.clientX, e.clientY);
  });
  document.addEventListener("touchmove", (e) => { if (drag?.started) e.preventDefault(); }, { passive: false });
  document.addEventListener("pointerup", (e) => {
    if (!drag) return;
    if (!drag.started) return endDrag();
    const { kind, name } = drag;
    const lane = laneAt(e.clientX, e.clientY), target = lane && board.contains(lane) ? lane : null;
    const onBoard = document.elementFromPoint(e.clientX, e.clientY)?.closest("#st-board");
    const onPalette = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-trash]");
    board.classList.remove("over");
    endDrag();
    suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);
    if (kind === "project") { if (onBoard) loadProject(name); return; }
    if (target) { addTool(name, target.dataset.lane); return stChanged(`${kind === "node" ? "Moved" : "Added"} ${name}`); }
    if (kind === "node" && onPalette) { removeTool(name); return stChanged(`Removed ${name}`); }
    if (kind === "tool" && onBoard) { addTool(name); return stChanged(`Added ${name}`); }
  });
  document.addEventListener("pointercancel", () => { board.classList.remove("over"); endDrag(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && drag) { board.classList.remove("over"); endDrag(); } });


  // ---------------------------------------------------------------------
  // Architecture viewer: any project (or a whole path) as a connected graph.
  // Add or remove tools, then edit it on the canvas or send it to the Studio.
  const gm = $("#gmodal");
  let gmState = null; // { kind, name, track, title, kicker, slots, original }
  const gmNames = () => Object.values(gmState.slots).flat();
  const gmDesign = () => trackDesign(gmState.track, gmState.slots, { includeEmpty: gmState.kind === "path", root: { title: gmState.title, subtitle: gmState.kicker } });
  const gmGraph = createArchGraph($("#gm-graph"), {
    mode: "tools", getDesign: gmDesign,
    onEdit: (a) => {
      const strip = (n) => { for (const k in gmState.slots) gmState.slots[k] = gmState.slots[k].filter((x) => x !== n); };
      if (a.type === "addTool") {
        strip(a.tool);
        const best = architectures[gmState.track].stages.findIndex((s) => s.tools.includes(a.tool));
        (gmState.slots[a.node ?? (best < 0 ? "extra" : String(best))] ||= []).push(a.tool);
      }
      if (a.type === "removeTool") strip(a.tool);
      gmUpdate();
    },
    suggest: (id) => layerSuggest(gmState.track, id, gmNames()),
    onOpenTool: openTool, esc, logo, toolByName, tools,
  });
  function gmUpdate() {
    const now = new Set(gmNames()), was = new Set(gmState.original);
    const added = [...now].filter((n) => !was.has(n)).length, removed = [...was].filter((n) => !now.has(n)).length;
    $("#gm-diff").textContent = added || removed ? `${added ? `+${added} added` : ""}${added && removed ? " · " : ""}${removed ? `−${removed} removed` : ""}` : "";
    $("#gm-reset").hidden = !(added || removed);
    gmGraph.render();
  }
  function openGraph(state) {
    gmState = state;
    $("#gm-kicker").textContent = state.kicker;
    $("#gm-title").textContent = state.title;
    if (!gm.open) gm.showModal();
    gmUpdate();
    requestAnimationFrame(() => gmGraph.refit());
  }
  function openProjectGraph(name) {
    const p = projectByName[name];
    openGraph({ kind: "project", name, track: p.track, title: p.name, kicker: `${trackById[p.track].name} · ${domainLine(p.domains)} · recommended architecture`, slots: slotsFor(p.track, p.tools), original: [...p.tools] });
  }
  const pathTitle = (id) => architectures[id].title.replace(/^The common path of /, "").replace(/^./, (c) => c.toUpperCase());
  function openPathGraph(id) {
    const names = architectures[id].stages.flatMap((s) => s.tools);
    openGraph({ kind: "path", name: id, track: id, title: pathTitle(id), kicker: `${trackById[id].name} · every open-source option, by layer`, slots: slotsFor(id, names), original: names });
  }
  $("#gm-close").addEventListener("click", () => gm.close());
  gm.addEventListener("click", (e) => { if (e.target === gm) gm.close(); });
  $("#gm-reset").addEventListener("click", () => { gmState.slots = slotsFor(gmState.track, gmState.original); gmUpdate(); });
  $("#gm-studio").addEventListener("click", () => {
    snapshot();
    st = { track: gmState.track, title: gmState.kind === "project" ? gmState.title : "", slots: JSON.parse(JSON.stringify(gmState.slots)), view: "graph" };
    gm.close();
    stChanged("Loaded into the Studio · Undo restores your previous board");
    $("#studio").scrollIntoView();
  });
  $("#gm-canvas").addEventListener("click", () => {
    const d = gmDesign();
    gm.close();
    loadCanvas({ title: gmState.title, source: `${gmState.kind === "path" ? "Common path" : "Project"} · ${trackById[gmState.track].name}`, nodes: d.nodes.map(({ num, ...n }) => n), edges: d.edges }, gmState.track);
    $("#canvas").scrollIntoView();
  });

  // ---------------------------------------------------------------------
  // System Design Canvas — the first section: a full diagram editor with
  // ready-made system designs, common paths and projects for every domain.
  const CV_KEY = "amg-canvas";
  const cvHost = $("#cv-graph"), inspector = $("#cv-inspector");
  let cvTrack = "web", sel = null, past = [], future = [];
  const newId = () => Math.random().toString(36).slice(2, 9);
  const designToCanvas = (d) => ({ title: d.name, source: `System design · ${trackById[d.track].name}`, nodes: d.nodes.map((n) => ({ ...n, tools: [...n.tools] })), edges: d.edges.map((e) => ({ ...e })), notes: [] });
  let cv = (() => {
    try {
      const v = JSON.parse(localStorage.getItem(CV_KEY));
      if (v && Array.isArray(v.nodes)) {
        v.nodes.forEach((n) => { n.tools = (n.tools || []).filter((t) => toolByName[t]); });
        v.edges ||= []; v.notes ||= [];
        if (trackById[v.track]) cvTrack = v.track;
        return v;
      }
    } catch { /* storage unavailable */ }
    return null;
  })() || designToCanvas(designs[0]);
  const cvSave = () => { try { localStorage.setItem(CV_KEY, JSON.stringify({ ...cv, track: cvTrack })); } catch { /* storage unavailable */ } };

  // Suggest tools for a component from its name and role, plus what the rest of the design uses
  const toolText = Object.fromEntries(tools.map((t) => [t.name, {
    kind: t.kind.toLowerCase(), desc: t.desc.toLowerCase(),
    layers: Object.values(architectures).flatMap((a) => a.stages.filter((s) => s.tools.includes(t.name)).map((s) => s.name.toLowerCase())).join(" "),
  }]));
  function suggestFor(name, role, inDesign) {
    const stop = ["and", "the", "for", "with", "service", "new", "component", "copy", "what", "does", "this"];
    const split = (t) => t.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !stop.includes(w)).map((w) => w.slice(0, 4));
    // The name's last word is usually the noun ("Response cache", "Load balancer"), so it counts most
    const nameWords = split(name), weights = new Map();
    nameWords.forEach((w, i) => weights.set(w, Math.max(weights.get(w) || 0, i === nameWords.length - 1 ? 3 : 1)));
    split(role).forEach((w) => weights.set(w, Math.max(weights.get(w) || 0, 0.5)));
    return tools.map((t) => {
      const x = toolText[t.name];
      let s = 0;
      for (const [w, k] of weights) s += k * ((x.kind.includes(w) ? 3 : 0) + (x.layers.includes(w) ? 2 : 0) + (x.desc.includes(w) ? 1 : 0));
      // Being used alongside the rest of the design only breaks ties
      if (s) s += Math.min(1, inDesign.reduce((a, m) => a + ((together[m] || {})[t.name] || 0), 0)) * 0.5;
      return [t.name, s];
    }).filter(([n, s]) => s > 0 && !inDesign.includes(n)).sort((a, b) => b[1] - a[1])
      // Drop weak, incidental matches
      .filter(([, s], _, all) => s >= all[0][1] * 0.25).map(([n]) => n);
  }
  const cvTools = () => cv.nodes.flatMap((n) => n.tools);

  const cvGraph = createArchGraph(cvHost, {
    mode: "full",
    getDesign: () => ({ title: cv.title, nodes: cv.nodes, edges: cv.edges, notes: cv.notes }),
    selected: () => sel,
    onSelect: (s) => { sel = s; renderCanvas(); if (s?.focus === "name") $("#ci-name")?.select(); },
    onEdit: canvasEdit,
    suggest: (id) => { const n = cv.nodes.find((x) => x.id === id); return n ? suggestFor(n.name, n.role || "", cvTools()) : []; },
    canUndo: () => past.length > 0, canRedo: () => future.length > 0,
    onOpenTool: openTool, esc, logo, toolByName, tools,
  });

  function commit(fn, msg) {
    past.push(JSON.stringify(cv)); if (past.length > 80) past.shift();
    future = [];
    fn();
    cvSave(); renderCanvas();
    if (msg) cvFlash(msg);
  }
  function placeNew() {
    if (!cv.nodes.length) return { x: 0, y: 0 };
    const maxX = Math.max(...cv.nodes.map((n) => n.x ?? 0)), minY = Math.min(...cv.nodes.map((n) => n.y ?? 0));
    return { x: maxX + 316, y: minY };
  }
  function canvasEdit(a) {
    if (a.type === "undo" || a.type === "redo") {
      const [from, to] = a.type === "undo" ? [past, future] : [future, past];
      if (!from.length) return;
      to.push(JSON.stringify(cv)); cv = JSON.parse(from.pop()); sel = null;
      cvSave(); renderCanvas(); return cvFlash(a.type === "undo" ? "Undone" : "Redone");
    }
    const node = (id) => cv.nodes.find((n) => n.id === id);
    switch (a.type) {
      case "addTool": {
        const target = a.node ?? (sel?.type === "node" ? sel.id : null);
        return commit(() => {
          if (target && node(target)) { if (!node(target).tools.includes(a.tool)) node(target).tools.push(a.tool); }
          else { const id = newId(); cv.nodes.push({ id, name: toolByName[a.tool].kind, role: "", tools: [a.tool], ...placeNew() }); sel = { type: "node", id }; }
        }, `Added ${a.tool}`);
      }
      case "removeTool": return commit(() => { const n = node(a.node); if (n) n.tools = n.tools.filter((t) => t !== a.tool); }, `Removed ${a.tool}`);
      case "moveTool": return commit(() => {
        const f = node(a.from), t = node(a.to);
        f.tools = f.tools.filter((x) => x !== a.tool);
        if (!t.tools.includes(a.tool)) t.tools.push(a.tool);
      }, `Moved ${a.tool} to ${node(a.to).name}`);
      case "move": return commit(() => { Object.assign(node(a.id), { x: a.x, y: a.y }); });
      case "moveNote": return commit(() => { Object.assign(cv.notes.find((n) => n.id === a.id), { x: a.x, y: a.y }); });
      case "connect": {
        const i = cv.edges.findIndex((e) => e.from === a.from && e.to === a.to);
        if (i >= 0) { sel = { type: "edge", index: i }; return renderCanvas(); }
        return commit(() => { cv.edges.push({ from: a.from, to: a.to, label: "connects to" }); sel = { type: "edge", index: cv.edges.length - 1, focus: "label" }; }, "Connected · name the connection in the inspector");
      }
      case "addNode": {
        const id = newId();
        commit(() => { cv.nodes.push({ id, name: "New component", role: "", tools: [], x: a.x, y: a.y }); sel = { type: "node", id }; }, "Component added");
        return $("#ci-name")?.select();
      }
      case "addNote": {
        const id = newId();
        commit(() => { cv.notes.push({ id, text: "Note", x: a.x, y: a.y }); sel = { type: "note", id }; });
        return $("#ci-note")?.select();
      }
      case "noteText": return commit(() => { const n = cv.notes.find((x) => x.id === a.id); if (n) n.text = a.text; });
      case "delete": {
        if (!sel) return;
        const s = sel;
        return commit(() => {
          if (s.type === "node") { cv.nodes = cv.nodes.filter((n) => n.id !== s.id); cv.edges = cv.edges.filter((e) => e.from !== s.id && e.to !== s.id); }
          if (s.type === "edge") cv.edges.splice(s.index, 1);
          if (s.type === "note") cv.notes = cv.notes.filter((n) => n.id !== s.id);
          sel = null;
        }, "Deleted");
      }
      case "autoLayout": return commit(() => {
        const pos = cvGraph.autoPositions();
        cv.nodes.forEach((n) => Object.assign(n, pos[n.id]));
      }, "Arranged by connections");
    }
  }

  // Load a design onto the canvas (undoable), laying it out once so moving one box never reflows the rest
  function loadCanvas(d, track) {
    commit(() => {
      cv = { title: d.title, source: d.source, nodes: d.nodes.map((n) => { const { x, y, ...rest } = n; return { ...rest, tools: [...(n.tools || [])] }; }), edges: d.edges.map((e) => ({ ...e })), notes: [] };
      if (track) cvTrack = track;
      sel = null;
      const pos = cvGraph.autoPositions();
      cv.nodes.forEach((n) => Object.assign(n, pos[n.id]));
    }, `Loaded ${d.title} · Undo brings back your previous canvas`);
    cvGraph.refit();
  }
  function loadTemplate(kind, id) {
    if (kind === "design") return loadCanvas(designToCanvas(designs.find((d) => d.id === id)), cvTrack);
    if (kind === "path") {
      const d = trackDesign(id, slotsFor(id, architectures[id].stages.flatMap((s) => s.tools)), { includeEmpty: true });
      return loadCanvas({ title: pathTitle(id), source: `Common path · ${trackById[id].name}`, nodes: d.nodes.map(({ num, ...n }) => n), edges: d.edges }, id);
    }
    if (kind === "project") {
      const p = projectByName[id], d = trackDesign(p.track, slotsFor(p.track, p.tools), { includeEmpty: false });
      return loadCanvas({ title: p.name, source: `Project · ${trackById[p.track].name}`, nodes: d.nodes.map(({ num, ...n }) => n), edges: d.edges }, p.track);
    }
    if (kind === "blank") return loadCanvas({ title: "Untitled system", source: "Blank canvas", nodes: [], edges: [] }, cvTrack);
  }

  // Templates: system designs, the common path and projects for the chosen domain
  $("#cv-domains").innerHTML = tracks.map((t) => `<button data-cv-track="${t.id}">${esc(t.name)} <span>${designs.filter((d) => d.track === t.id).length}</span></button>`).join("");
  function renderTemplates() {
    $("#cv-domains").querySelectorAll("[data-cv-track]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.cvTrack === cvTrack));
    const ds = designs.filter((d) => d.track === cvTrack), ps = projects.filter((p) => p.track === cvTrack);
    const stack = (names) => `<span class="tc-stack">${[...new Set(names)].slice(0, 7).map((n) => logo(toolByName[n], "xs")).join("")}</span>`;
    $("#cv-templates").innerHTML = `
      ${ds.map((d) => `<button class="tcard design" data-cv-load="design" data-id="${esc(d.id)}">
        <span class="tc-kind">System design · ${d.nodes.length} components</span><b>${esc(d.name)}</b><span class="tc-sum">${esc(d.summary)}</span>${stack(d.nodes.flatMap((n) => n.tools))}</button>`).join("")}
      <button class="tcard path" data-cv-load="path" data-id="${cvTrack}">
        <span class="tc-kind">Common path · ${architectures[cvTrack].stages.length} layers</span><b>${esc(pathTitle(cvTrack))}</b><span class="tc-sum">Every layer, with all its open-source options.</span>${stack(architectures[cvTrack].stages.flatMap((s) => s.tools))}</button>
      ${ps.map((p) => `<button class="tcard project" data-cv-load="project" data-id="${esc(p.name)}">
        <span class="tc-kind">Project · ${p.tools.length} tools</span><b>${esc(p.name)}</b><span class="tc-sum">${esc(p.desc)}</span>${stack(p.tools)}</button>`).join("")}
      <button class="tcard blank" data-cv-load="blank" data-id=""><span class="tc-kind">Start fresh</span><b>Blank canvas</b><span class="tc-sum">Draw your own system from scratch.</span></button>`;
  }
  $("#cv-domains").addEventListener("click", (e) => { const b = e.target.closest("[data-cv-track]"); if (b) { cvTrack = b.dataset.cvTrack; cvSave(); renderTemplates(); } });
  $("#cv-templates").addEventListener("click", (e) => { const b = e.target.closest("[data-cv-load]"); if (b) loadTemplate(b.dataset.cvLoad, b.dataset.id); });

  // Inspector: edit whatever is selected
  let cvFlashT;
  const cvFlash = (msg) => { const el = $("#cv-status"); el.textContent = msg; clearTimeout(cvFlashT); cvFlashT = setTimeout(() => { el.textContent = ""; }, 3200); };
  function renderInspector() {
    const n = sel?.type === "node" && cv.nodes.find((x) => x.id === sel.id);
    const e = sel?.type === "edge" && cv.edges[sel.index];
    const t = sel?.type === "note" && cv.notes.find((x) => x.id === sel.id);
    const nameOf = (id) => cv.nodes.find((x) => x.id === id)?.name || "?";
    if (n) {
      const sugg = suggestFor(n.name, n.role || "", cvTools()).slice(0, 8);
      const links = cv.edges.map((x, i) => ({ ...x, i })).filter((x) => x.from === n.id || x.to === n.id);
      inspector.innerHTML = `
        <p class="eyebrow">Component</p>
        <label class="ci-field"><span>Name</span><input id="ci-name" value="${esc(n.name)}" maxlength="60" /></label>
        <label class="ci-field"><span>Role</span><textarea id="ci-role" rows="2" maxlength="160" placeholder="What does this component do?">${esc(n.role || "")}</textarea></label>
        <p class="vp-label">Tools · ${n.tools.length}</p>
        ${n.tools.length ? `<ul class="ci-tools">${n.tools.map((x) => `<li>
          <button class="ci-tool" data-open-tool="${esc(x)}">${logo(toolByName[x], "xs")}<span><b>${esc(x)}</b><i>${esc(toolByName[x].kind)} · ${esc(toolByName[x].license)}</i></span></button>
          <button class="ci-x" data-ci-remove="${esc(x)}" aria-label="Remove ${esc(x)}">×</button></li>`).join("")}</ul>` : `<p class="ci-empty">No tools yet: pick a suggestion or search below.</p>`}
        ${sugg.length ? `<p class="vp-label">Suggested for “${esc(n.name)}”</p><div class="ci-sugg">${sugg.map((x) => `<button data-ci-add="${esc(x)}" title="${esc(toolByName[x].kind)}">${logo(toolByName[x], "xs")}+ ${esc(x)}</button>`).join("")}</div>` : ""}
        <input class="ci-q" id="ci-q" type="search" placeholder="Search every open-source tool…" aria-label="Search tools to add" />
        <div class="ci-results" id="ci-results"></div>
        <p class="vp-label">Connections · ${links.length}</p>
        ${links.length ? `<ul class="ci-links">${links.map((x) => `<li><button data-ci-edge="${x.i}">${x.from === n.id ? `→ ${esc(nameOf(x.to))}` : `← ${esc(nameOf(x.from))}`} <i>${esc(x.label || "")}</i></button></li>`).join("")}</ul>` : `<p class="ci-empty">Drag the ● on the box's edge to another component to connect it.</p>`}
        <div class="ci-actions"><button class="st-btn" data-ci="dup">Duplicate</button><button class="st-btn danger" data-ci="del">Delete component</button></div>`;
    } else if (e) {
      inspector.innerHTML = `
        <p class="eyebrow">Connection</p>
        <p class="ci-route"><button data-ci-node="${esc(e.from)}">${esc(nameOf(e.from))}</button><span>→</span><button data-ci-node="${esc(e.to)}">${esc(nameOf(e.to))}</button></p>
        <label class="ci-field"><span>Label</span><input id="ci-label" value="${esc(e.label || "")}" maxlength="40" placeholder="e.g. reads & writes" /></label>
        <div class="ci-chips">${["calls", "reads & writes", "publishes", "subscribes", "caches", "streams", "authenticates", "monitors"].map((l) => `<button data-ci-label="${l}">${l}</button>`).join("")}</div>
        <div class="ci-actions"><button class="st-btn" data-ci="reverse">⇄ Reverse</button><button class="st-btn danger" data-ci="del">Delete connection</button></div>`;
    } else if (t) {
      inspector.innerHTML = `
        <p class="eyebrow">Note</p>
        <label class="ci-field"><span>Text</span><textarea id="ci-note" rows="5" maxlength="400">${esc(t.text || "")}</textarea></label>
        <div class="ci-actions"><button class="st-btn danger" data-ci="del">Delete note</button></div>`;
    } else {
      const lic = new Set(cvTools().map((x) => toolByName[x].license));
      inspector.innerHTML = `
        <p class="eyebrow">${esc(cv.source || "Design")}</p>
        <label class="ci-field"><span>System name</span><input id="ci-title" value="${esc(cv.title || "")}" maxlength="60" /></label>
        <div class="ci-stats"><span><b>${cv.nodes.length}</b>components</span><span><b>${cv.edges.length}</b>connections</span><span><b>${new Set(cvTools()).size}</b>tools</span><span><b>${lic.size}</b>licences</span></div>
        <p class="vp-label">Editing</p>
        <ul class="ci-tips">
          <li><kbd>V</kbd> select & drag boxes · <kbd>C</kbd> connect · <kbd>B</kbd> new component · <kbd>N</kbd> note</li>
          <li>Drag the <b>●</b> port on a box onto another box to connect them</li>
          <li>Drag a tool from one box to another to move it</li>
          <li><kbd>Delete</kbd> removes the selection · <kbd>⌘/Ctrl Z</kbd> undo · <kbd>⇧⌘/Ctrl Z</kbd> redo</li>
          <li>Select a box to rename it and get tool suggestions</li>
        </ul>
        <div class="ci-actions"><button class="st-btn" data-ci="copy">Copy as text</button><button class="st-btn" data-ci="png">Download PNG</button></div>`;
    }
    if (sel?.focus === "label") $("#ci-label")?.select();
  }
  function renderCanvas() { cvGraph.render(); renderInspector(); }

  // Typing in the inspector updates live, with one undo step per field visit
  let typing = null;
  inspector.addEventListener("focusin", (e) => { if (e.target.matches("input:not(.ci-q), textarea")) typing = null; });
  inspector.addEventListener("input", (e) => {
    const id = e.target.id;
    if (id === "ci-q") {
      const v = e.target.value.trim().toLowerCase(), n = cv.nodes.find((x) => x.id === sel?.id);
      $("#ci-results").innerHTML = v ? tools.filter((t) => !n?.tools.includes(t.name) && `${t.name} ${t.kind}`.toLowerCase().includes(v)).slice(0, 8)
        .map((t) => `<button data-ci-add="${esc(t.name)}">${logo(t, "xs")}<span>${esc(t.name)}</span><i>${esc(t.kind)}</i></button>`).join("") : "";
      return;
    }
    if (!["ci-name", "ci-role", "ci-label", "ci-note", "ci-title"].includes(id)) return;
    if (typing !== id) { past.push(JSON.stringify(cv)); future = []; typing = id; }
    const v = e.target.value;
    if (id === "ci-name") cv.nodes.find((x) => x.id === sel.id).name = v || "Untitled";
    if (id === "ci-role") cv.nodes.find((x) => x.id === sel.id).role = v;
    if (id === "ci-label") cv.edges[sel.index].label = v;
    if (id === "ci-note") cv.notes.find((x) => x.id === sel.id).text = v;
    if (id === "ci-title") cv.title = v;
    cvSave(); cvGraph.render();
  });
  // Suggestions follow the name and role once you finish typing
  inspector.addEventListener("change", (e) => { if (e.target.id === "ci-name" || e.target.id === "ci-role") renderInspector(); });
  inspector.addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.openTool) return openTool(b.dataset.openTool);
    if (b.dataset.ciAdd) return canvasEdit({ type: "addTool", tool: b.dataset.ciAdd, node: sel.id });
    if (b.dataset.ciRemove) return canvasEdit({ type: "removeTool", tool: b.dataset.ciRemove, node: sel.id });
    if (b.dataset.ciEdge) { sel = { type: "edge", index: +b.dataset.ciEdge }; return renderCanvas(); }
    if (b.dataset.ciNode) { sel = { type: "node", id: b.dataset.ciNode }; return renderCanvas(); }
    if (b.dataset.ciLabel) return commit(() => { cv.edges[sel.index].label = b.dataset.ciLabel; });
    const a = b.dataset.ci;
    if (a === "del") return canvasEdit({ type: "delete" });
    if (a === "reverse") return commit(() => { const x = cv.edges[sel.index]; [x.from, x.to] = [x.to, x.from]; }, "Reversed");
    if (a === "dup") {
      const n = cv.nodes.find((x) => x.id === sel.id), id = newId();
      return commit(() => { cv.nodes.push({ ...JSON.parse(JSON.stringify(n)), id, name: `${n.name} (copy)`, x: (n.x || 0) + 40, y: (n.y || 0) + 40 }); sel = { type: "node", id }; }, "Duplicated");
    }
    if (a === "png") return cvGraph.exportPNG();
    if (a === "copy") {
      const nameOf = (id) => cv.nodes.find((x) => x.id === id)?.name;
      const lines = [cv.title || "Untitled system", "", "Components:", ...cv.nodes.map((n) => `- ${n.name}${n.role ? ` — ${n.role}` : ""}: ${n.tools.join(", ") || "—"}`), "", "Connections:", ...cv.edges.map((x) => `- ${nameOf(x.from)} → ${nameOf(x.to)}${x.label ? ` (${x.label})` : ""}`), "", "Every tool is free and open source. Designed with Amalgam: https://amalgambynjr.vercel.app"];
      try { await navigator.clipboard.writeText(lines.join("\n")); cvFlash("Copied"); } catch { cvFlash("Copy unavailable here"); }
    }
  });

  // First visit: lay the default design out once and save it
  if (cv.nodes.some((n) => n.x == null)) { const pos = cvGraph.autoPositions(); cv.nodes.forEach((n) => Object.assign(n, pos[n.id])); cvSave(); }
  renderTemplates();
  renderCanvas();

  renderStudio();


  // ---------------------------------------------------------------------
  // Live Wire pop-up — Hacker News via Algolia (CORS-enabled, no key),
  // opened from the rotating half-circle on the right edge. Polls every
  // minute while the page is visible, marks headlines that arrived since
  // the last poll, and counts unread ones while closed.
  const side = $("#wire-side"), wireTabs = $("#wire-tabs"), wireList = $("#wire-list");
  const badge = $("#ws-badge"), toggle = $("#ws-toggle"), updatedEl = $("#ws-updated");
  const POLL_MS = 60000;
  const topics = [{ id: "all", name: "All", query: wire.map((w) => w.query).join(" "), any: true }, ...wire];
  let topic = "all", items = [], seen = new Set(), firstLoad = true, unread = 0, lastFetch = 0, timer = null;

  const ago = (iso) => {
    const m = Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    if (m < 1440) return `${Math.round(m / 60)}h ago`;
    return `${Math.round(m / 1440)}d ago`;
  };
  const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return "news.ycombinator.com"; } };
  const isOpen = () => document.body.classList.contains("wire-open");

  function renderBadge() {
    badge.hidden = !unread;
    badge.textContent = unread > 99 ? "99+" : unread;
  }
  function setOpen(open) {
    document.body.classList.toggle("wire-open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close live news" : "Open live news");
    $("#ws-nav").classList.toggle("on", open);
    if (open) { unread = 0; renderBadge(); side.focus({ preventScroll: true }); }
  }
  toggle.addEventListener("click", () => setOpen(!isOpen()));
  $("#ws-close").addEventListener("click", () => { setOpen(false); toggle.focus(); });
  $("#ws-nav").addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); setOpen(!isOpen()); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen() && !$("#drawer").open) { setOpen(false); toggle.focus(); } });
  // A click anywhere outside the pop-up and its orb closes it
  document.addEventListener("click", (e) => {
    if (isOpen() && !side.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });

  wireTabs.innerHTML = topics.map((w) => `<button role="tab" data-id="${w.id}" aria-selected="${w.id === topic}">${esc(w.name)}</button>`).join("");
  wireTabs.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || b.dataset.id === topic) return;
    topic = b.dataset.id;
    wireTabs.querySelectorAll("button").forEach((x) => x.setAttribute("aria-selected", x === b));
    seen = new Set(); items = []; firstLoad = true;
    wireList.innerHTML = `<li class="ws-note">Tuning in…</li>`;
    poll();
  });

  function render(fresh) {
    if (!items.length) { wireList.innerHTML = `<li class="ws-note">The wire is quiet on this topic.</li>`; return; }
    wireList.innerHTML = items.map((h) => {
      const link = h.url || `https://news.ycombinator.com/item?id=${h.objectID}`;
      const isNew = fresh.has(h.objectID);
      return `<li class="ws-item${isNew ? " new" : ""}">
        <a class="ws-link" href="${esc(link)}" target="_blank" rel="noopener">
          <span class="ws-meta">${isNew ? `<b>New</b>` : ""}<time data-t="${esc(h.created_at)}">${ago(h.created_at)}</time> · ${esc(host(link))}</span>
          <span class="ws-title">${esc(h.title)}</span>
        </a>
        <a class="ws-hn" href="https://news.ycombinator.com/item?id=${esc(h.objectID)}" target="_blank" rel="noopener">▲ ${h.points ?? 0} · ${h.num_comments ?? 0} comment${h.num_comments === 1 ? "" : "s"}</a>
      </li>`;
    }).join("");
  }

  async function poll() {
    const tp = topics.find((t) => t.id === topic);
    const q = encodeURIComponent(tp.query);
    const url = "https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=20&numericFilters=points%3E2"
      + `&restrictSearchableAttributes=title&typoTolerance=false&query=${q}${tp.any ? `&optionalWords=${q}` : ""}`;
    side.classList.add("ws-busy");
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      if (tp.id !== topic) return; // the topic changed while this was in flight
      const hits = (await res.json()).hits.filter((h) => h.title);
      const fresh = firstLoad ? new Set() : new Set(hits.filter((h) => !seen.has(h.objectID)).map((h) => h.objectID));
      hits.forEach((h) => seen.add(h.objectID));
      if (fresh.size && !isOpen()) { unread += fresh.size; renderBadge(); }
      items = hits; firstLoad = false; lastFetch = Date.now();
      side.classList.remove("ws-error");
      render(fresh);
      tickClock();
    } catch {
      side.classList.add("ws-error");
      updatedEl.textContent = "offline · retrying";
      if (!items.length) wireList.innerHTML = `<li class="ws-note">The wire could not be reached — retrying shortly.</li>`;
    } finally {
      side.classList.remove("ws-busy");
    }
  }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(async () => { if (!document.hidden) await poll(); schedule(); }, POLL_MS);
  }
  function tickClock() {
    if (lastFetch && !side.classList.contains("ws-error")) {
      const s = Math.round((Date.now() - lastFetch) / 1000);
      updatedEl.textContent = s < 5 ? "updated just now" : `updated ${s < 60 ? `${s}s` : `${Math.round(s / 60)}m`} ago`;
    }
    wireList.querySelectorAll("time[data-t]").forEach((t) => { t.textContent = ago(t.dataset.t); });
  }
  setInterval(tickClock, 5000);
  $("#ws-refresh").addEventListener("click", () => { poll(); schedule(); });
  // Catch up straight away when returning to the tab
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && Date.now() - lastFetch > POLL_MS) { poll(); schedule(); }
  });
  poll();
  schedule();

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
