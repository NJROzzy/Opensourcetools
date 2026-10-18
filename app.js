(() => {
  const { disciplines, tools, projects, chains, trends, wire, venn } = window.ATLAS;
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
  const licences = new Set(tools.map((t) => t.license));
  $("#stats").innerHTML = [
    [tools.length, "Instruments"],
    [disciplines.length, "Domains"],
    [projects.length, "Projects"],
    [licences.size, "Licences"],
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
      <a class="card" href="${esc(t.url)}" target="_blank" rel="noopener" style="animation-delay:${Math.min(i, 20) * 25}ms">
        <div class="top">${logo(t)}<span class="idx">${String(i + 1).padStart(3, "0")}</span></div>
        <h3>${esc(t.name)}</h3>
        <span class="arrow">↗</span>
        <p class="desc">${esc(t.desc)}</p>
        <p class="doms">${t.domains.map((d) => esc(discShort[d])).join(" · ")}</p>
        <div class="meta"><span>${esc(t.kind)}</span><span class="lic">${esc(t.license)}</span></div>
      </a>`).join("");
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
  $("#trend-list").addEventListener("click", (e) => { const b = e.target.closest("[data-tool]"); if (b) jumpToTool(b.dataset.tool); });

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
  $("#chain-view").addEventListener("click", (e) => { const t = e.target.closest("[data-tool]"); if (t) jumpToTool(t.dataset.tool); });

  showChain(chains[0].project);
  // Names depend on the web font's metrics, so lay the map out once it loads
  buildVenn();
  document.fonts.ready.then(() => { layoutNames(); paint(); });

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
  let pts = [], FW, FH, dpr;
  const mouse = { x: -1e4, y: -1e4 };
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    FW = c.width = innerWidth * dpr;
    FH = c.height = innerHeight * dpr;
    const n = Math.round(Math.min(110, (innerWidth * innerHeight) / 14000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * FW, y: Math.random() * FH, vx: (Math.random() - .5) * .25 * dpr, vy: (Math.random() - .5) * .25 * dpr }));
  }
  addEventListener("resize", size);
  addEventListener("pointermove", (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
  function frame() {
    ctx.clearRect(0, 0, FW, FH);
    const R = 130 * dpr;
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > FW) p.vx *= -1;
      if (p.y < 0 || p.y > FH) p.vy *= -1;
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
