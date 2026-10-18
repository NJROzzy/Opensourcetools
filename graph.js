// Architecture graph: a pannable, zoomable node diagram of an architecture.
// Layers are group nodes ranked left to right by how they connect; tools sit
// inside them, and edges show how layers (and their tools) talk to each other.
//
//   const g = createArchGraph(host, {
//     arch: () => architecture,              // { stages, links }
//     getModel: () => ({ title, subtitle, slots }), // slots: { "0": [tool], …, extra: [tool] }
//     editable, onAdd(name, laneKey), onRemove(name), onOpenTool(name),
//     affinity(name), esc, logo, toolByName, tools,
//   });
//   g.render(); g.fit();
window.createArchGraph = function createArchGraph(host, o) {
  const { esc, logo, toolByName } = o;
  const GW = 236, COL = 316, ROOT_W = 220, ROOT_GAP = 86, GAP = 28;
  const HEAD = 49, TOOL = 46, ADD = 46;
  const uid = Math.random().toString(36).slice(2, 8);
  const view = { x: 0, y: 0, k: 1 };
  let showEdges = true, showEmpty = o.showEmpty ?? !!o.editable, query = "", fitted = false;
  const toolEdges = o.toolEdges ?? true; // false: connect layers, not every tool pair
  const collapsed = new Set();
  let size = { w: 0, h: 0 };
  let vertical = false; // narrow screens: layers flow top to bottom, two per row

  host.classList.add("ag");
  host.innerHTML = `
    <div class="ag-viewport">
      <div class="ag-world">
        <svg class="ag-edges" aria-hidden="true">
          <defs><marker id="ag-arrow-${uid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" /></marker></defs>
          <g class="ag-paths"></g>
        </svg>
        <div class="ag-nodes"></div>
      </div>
    </div>
    <div class="ag-toolbar">
      <label class="ag-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search tools…" aria-label="Search the graph" /></label>
      <div class="ag-btns">
        <button data-ag="edges" aria-pressed="true"><span aria-hidden="true">⇄</span> Connections</button>
        <button data-ag="collapse" aria-pressed="false"><span aria-hidden="true">⇲</span> Collapse</button>
        ${o.editable ? `<button data-ag="empty" aria-pressed="${showEmpty}"><span aria-hidden="true">▢</span> Empty layers</button>` : ""}
        <button data-ag="fit"><span aria-hidden="true">⛶</span> Fit</button>
      </div>
      ${o.editable ? `<div class="ag-addtool"><input type="search" placeholder="+ Add any tool…" aria-label="Add any tool" autocomplete="off" /><div class="ag-results" hidden></div></div>` : ""}
    </div>
    <div class="ag-zoom">
      <button data-ag="in" aria-label="Zoom in">+</button>
      <button data-ag="out" aria-label="Zoom out">−</button>
      <button data-ag="fit" aria-label="Fit to view">⛶</button>
    </div>
    <p class="ag-hint">Drag to pan · ${navigator.maxTouchPoints ? "pinch" : "Ctrl/⌘ + scroll"} to zoom</p>
    <div class="ag-pop" hidden></div>`;

  const vp = host.querySelector(".ag-viewport"), world = host.querySelector(".ag-world");
  const svg = host.querySelector(".ag-edges"), paths = host.querySelector(".ag-paths"), nodes = host.querySelector(".ag-nodes");
  const toolbar = host.querySelector(".ag-toolbar"), pop = host.querySelector(".ag-pop");

  const apply = () => { world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.k})`; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function zoomAt(k, cx, cy) {
    k = clamp(k, 0.25, 2);
    view.x = cx - (cx - view.x) * (k / view.k);
    view.y = cy - (cy - view.y) * (k / view.k);
    view.k = k;
    apply();
  }
  function fit() {
    const W = vp.clientWidth, H = vp.clientHeight;
    if (!W || !H || !size.w) return;
    const top = toolbar.offsetHeight + 24, pad = vertical ? 14 : 28;
    // Vertical layouts fit the width and scroll down; horizontal ones fit both ways
    const k = vertical ? clamp((W - pad * 2) / size.w, 0.25, 1)
      : clamp(Math.min((W - pad * 2) / size.w, (H - top - pad) / size.h), 0.25, 1.1);
    view.k = k;
    view.x = (W - size.w * k) / 2;
    view.y = vertical ? top : top + (H - top - pad - size.h * k) / 2;
    apply();
  }

  // ---- Layout -----------------------------------------------------------
  const curve = (x1, y1, x2, y2) => {
    const dx = Math.max(40, (x2 - x1) / 2);
    return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
  };
  function render() {
    const m = o.getModel(), arch = o.arch();
    const stages = arch.stages.map((s, i) => ({ key: String(i), num: String(i + 1).padStart(2, "0"), name: s.name, role: s.role, options: s.tools, tools: m.slots[i] || [] }));
    const extra = { key: "extra", num: "+", name: "Extras", role: "Anything else the project needs.", options: [], tools: m.slots.extra || [] };
    const groups = stages.filter((g) => g.tools.length || showEmpty);
    if (extra.tools.length || (showEmpty && o.editable)) groups.push(extra);
    const byKey = Object.fromEntries(groups.map((g) => [g.key, g]));
    const keyOf = Object.fromEntries(arch.stages.map((s, i) => [s.name, String(i)]));
    const links = (arch.links || []).map(([a, b, label]) => ({ from: keyOf[a], to: keyOf[b], label })).filter((l) => byKey[l.from] && byKey[l.to]);

    // Rank layers by the longest chain of links leading into them
    const rank = Object.fromEntries(groups.map((g) => [g.key, 0]));
    for (let i = 0; i < groups.length; i++) for (const l of links) rank[l.to] = Math.max(rank[l.to], rank[l.from] + 1);
    if (byKey.extra) rank.extra = Math.max(0, ...groups.filter((g) => g.key !== "extra").map((g) => rank[g.key])) + 1;
    const cols = [];
    groups.forEach((g) => (cols[rank[g.key]] ||= []).push(g));

    vertical = vp.clientWidth > 0 && vp.clientWidth < 640;
    const height = (g) => collapsed.has(g.key) ? HEAD
      : HEAD + 6 + g.tools.length * TOOL + (o.editable ? ADD : g.tools.length ? 4 : 40);
    let root;
    if (vertical) {
      // Each rank becomes one or more rows of up to two layers, under the root
      const PER = 2, GX = 24, GY = 70, width = PER * GW + (PER - 1) * GX;
      root = { x: (width - ROOT_W) / 2, y: 0, w: ROOT_W, h: 96 };
      let y = root.h + GY;
      cols.forEach((c) => {
        for (let i = 0; i < (c || []).length; i += PER) {
          const row = c.slice(i, i + PER), rowW = row.length * GW + (row.length - 1) * GX;
          let x = (width - rowW) / 2, rowH = 0;
          row.forEach((g) => { g.x = x; g.y = y; g.h = height(g); x += GW + GX; rowH = Math.max(rowH, g.h); });
          y += rowH + GY;
        }
      });
      size = { w: width, h: y - GY };
    } else {
      const colH = cols.map((c) => (c || []).reduce((s, g) => s + height(g), 0) + GAP * ((c || []).length - 1));
      const maxH = Math.max(160, ...colH);
      cols.forEach((c, r) => {
        let y = (maxH - colH[r]) / 2;
        (c || []).forEach((g) => { g.x = ROOT_W + ROOT_GAP + r * COL; g.y = y; g.h = height(g); y += g.h + GAP; });
      });
      root = { x: 0, y: maxH / 2 - 52, w: ROOT_W, h: 104 };
      size = { w: ROOT_W + ROOT_GAP + Math.max(0, cols.length - 1) * COL + GW, h: maxH };
    }

    // Tool anchor points: left and right edges, vertically centred
    const anchor = {};
    groups.forEach((g) => g.tools.forEach((n, i) => {
      const y = g.y + HEAD + 6 + i * TOOL + 20;
      anchor[n] = { l: [g.x + 8, y], r: [g.x + GW - 8, y], g: g.key };
    }));
    const head = (g, side) => [side === "r" ? g.x + GW : g.x, g.y + HEAD / 2];

    // ---- Edges ----
    const edgeHtml = [], labels = [];
    const total = groups.reduce((s, g) => s + g.tools.length, 0);
    const vcurve = (x1, y1, x2, y2) => { const dy = Math.max(30, (y2 - y1) / 2); return `M${x1},${y1} C${x1},${y1 + dy} ${x2},${y2 - dy} ${x2},${y2}`; };
    groups.filter((g) => rank[g.key] === 0 && g.key !== "extra").forEach((g) => {
      const d = vertical ? vcurve(root.x + root.w / 2, root.y + root.h, g.x + GW / 2, g.y)
        : curve(root.w, root.y + root.h / 2, ...head(g, "l"));
      edgeHtml.push(`<path class="ag-edge root" d="${d}" />`);
    });
    for (const l of links) {
      const A = byKey[l.from], B = byKey[l.to];
      const expand = toolEdges && !vertical && !collapsed.has(A.key) && !collapsed.has(B.key) && A.tools.length && B.tools.length;
      if (expand) {
        for (const a of A.tools) for (const b of B.tools) {
          edgeHtml.push(`<path class="ag-edge flow" data-a="${esc(a)}" data-b="${esc(b)}" marker-end="url(#ag-arrow-${uid})" d="${curve(...anchor[a].r, ...anchor[b].l)}" />`);
        }
      } else {
        const d = vertical ? vcurve(A.x + GW / 2, A.y + A.h, B.x + GW / 2, B.y) : curve(...head(A, "r"), ...head(B, "l"));
        edgeHtml.push(`<path class="ag-edge flow layer" data-ga="${A.key}" data-gb="${B.key}" marker-end="url(#ag-arrow-${uid})" d="${d}" />`);
      }
      const [x1, y1] = vertical ? [A.x + GW / 2, A.y + A.h] : head(A, "r"), [x2, y2] = vertical ? [B.x + GW / 2, B.y] : head(B, "l");
      // Labels on links that skip a rank would sit on the nodes between; show those on hover only
      const far = rank[B.key] - rank[A.key] > 1 ? " far" : "";
      labels.push(`<span class="ag-label${far}" data-ga="${A.key}" data-gb="${B.key}" style="left:${(x1 + x2) / 2}px;top:${(y1 + y2) / 2}px">${esc(l.label)}</span>`);
    }
    svg.setAttribute("width", size.w);
    svg.setAttribute("height", size.h);
    paths.innerHTML = edgeHtml.join("");

    // ---- Nodes ----
    const q = query.trim().toLowerCase();
    const matches = (n) => q && `${n} ${toolByName[n].kind}`.toLowerCase().includes(q);
    nodes.innerHTML = `
      <div class="ag-root" style="left:${root.x}px;top:${root.y}px;width:${root.w}px;height:${root.h}px">
        <span class="ag-kicker">${esc(m.subtitle || "Architecture")}</span>
        <b>${esc(m.title || "Untitled architecture")}</b>
        <span class="ag-meta">${total} tool${total === 1 ? "" : "s"} · ${groups.filter((g) => g.tools.length).length} layers</span>
      </div>
      ${groups.map((g) => `
      <div class="ag-group${collapsed.has(g.key) ? " collapsed" : ""}${g.tools.length ? "" : " ag-empty"}" data-lane="${g.key}" style="left:${g.x}px;top:${g.y}px;width:${GW}px;height:${g.h}px" title="${esc(g.role)}">
        <div class="ag-ghead">
          <span class="step">${g.num}</span><b>${esc(g.name)}</b>
          ${g.tools.length ? `<span class="ag-count">${g.tools.length}</span>` : ""}
          <button class="ag-toggle" data-ag-toggle="${g.key}" aria-label="${collapsed.has(g.key) ? "Expand" : "Collapse"} ${esc(g.name)}">${collapsed.has(g.key) ? "▸" : "▾"}</button>
        </div>
        ${collapsed.has(g.key) ? "" : `<div class="ag-gtools">
          ${g.tools.map((n) => `
          <div class="ag-tool${matches(n) ? " match" : ""}" data-tool="${esc(n)}" data-drag="node" data-name="${esc(n)}" data-from="${g.key}">
            <button class="ag-open" data-ag-open="${esc(n)}">${logo(toolByName[n], "xs")}<span><b>${esc(n)}</b><i>${esc(toolByName[n].kind)}</i></span></button>
            ${o.editable ? `<button class="ag-x" data-ag-remove="${esc(n)}" aria-label="Remove ${esc(n)}">×</button>` : ""}
          </div>`).join("")}
          ${g.tools.length || o.editable ? "" : `<span class="ag-none">empty layer</span>`}
          ${o.editable ? `<button class="ag-add" data-ag-add="${g.key}">+ add tool</button>` : ""}
        </div>`}
      </div>`).join("")}
      ${labels.join("")}`;
    host.classList.toggle("ag-searching", !!q);
    host.classList.toggle("no-edges", !showEdges);
    if (!fitted && vp.clientWidth) { fit(); fitted = true; }
  }

  // ---- Highlight a tool's connections on hover ---------------------------
  nodes.addEventListener("pointerover", (e) => {
    const t = e.target.closest(".ag-tool"), g = e.target.closest(".ag-group");
    paths.querySelectorAll(".hot").forEach((p) => p.classList.remove("hot"));
    nodes.querySelectorAll(".ag-label.hot").forEach((p) => p.classList.remove("hot"));
    host.classList.toggle("ag-focus", !!(t || g));
    if (t) {
      const n = t.dataset.tool;
      paths.querySelectorAll(".ag-edge").forEach((p) => { if (p.dataset.a === n || p.dataset.b === n) p.classList.add("hot"); });
    }
    if (g) {
      const k = g.dataset.lane;
      paths.querySelectorAll(".ag-edge.layer").forEach((p) => { if (p.dataset.ga === k || p.dataset.gb === k) p.classList.add("hot"); });
      if (!t) {
        const inLane = new Set([...g.querySelectorAll(".ag-tool")].map((x) => x.dataset.tool));
        paths.querySelectorAll(".ag-edge").forEach((p) => { if (inLane.has(p.dataset.a) || inLane.has(p.dataset.b)) p.classList.add("hot"); });
      }
      nodes.querySelectorAll(".ag-label").forEach((p) => { if (p.dataset.ga === k || p.dataset.gb === k) p.classList.add("hot"); });
    }
  });
  nodes.addEventListener("pointerleave", () => host.classList.remove("ag-focus"));

  // ---- Toolbar, node buttons and the add pop-over -----------------------
  const closePop = () => { pop.hidden = true; pop.innerHTML = ""; };
  function openPop(key, btn) {
    const arch = o.arch(), m = o.getModel();
    const placed = new Set(Object.values(m.slots).flat());
    const stage = key === "extra" ? null : arch.stages[+key];
    const options = (stage ? stage.tools : []).filter((n) => !placed.has(n)).sort((a, b) => o.affinity(b) - o.affinity(a));
    const item = (n, best) => `<button data-ag-pick="${esc(n)}" data-to="${key}">${logo(toolByName[n], "xs")}<span>${esc(n)}</span>${best ? `<em>best fit</em>` : ""}</button>`;
    pop.innerHTML = `
      <p class="ag-pop-title">Add to ${esc(stage ? stage.name : "Extras")}</p>
      ${options.length ? options.map((n, i) => item(n, i === 0 && o.affinity(n) > 0)).join("") : stage ? `<p class="ag-pop-none">Every suggested tool for this layer is already placed.</p>` : ""}
      <input class="ag-pop-q" type="search" placeholder="…or search every tool" aria-label="Search every tool" />
      <div class="ag-pop-results"></div>`;
    const hr = host.getBoundingClientRect(), br = btn.getBoundingClientRect();
    pop.hidden = false;
    pop.style.left = `${clamp(br.left - hr.left, 8, hr.width - pop.offsetWidth - 8)}px`;
    pop.style.top = `${clamp(br.bottom - hr.top + 6, 8, hr.height - pop.offsetHeight - 8)}px`;
    const pq = pop.querySelector(".ag-pop-q");
    pq.addEventListener("input", () => {
      const v = pq.value.trim().toLowerCase();
      pop.querySelector(".ag-pop-results").innerHTML = v ? o.tools.filter((t) => !placed.has(t.name) && `${t.name} ${t.kind}`.toLowerCase().includes(v)).slice(0, 8).map((t) => item(t.name)).join("") : "";
    });
    (options.length ? pop.querySelector("[data-ag-pick]") : pq).focus({ preventScroll: true });
  }

  host.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ag]");
    if (b) {
      const a = b.dataset.ag;
      if (a === "edges") { showEdges = !showEdges; b.setAttribute("aria-pressed", showEdges); host.classList.toggle("no-edges", !showEdges); }
      if (a === "collapse") {
        const all = o.arch().stages.map((_, i) => String(i)).concat("extra");
        const anyOpen = all.some((k) => !collapsed.has(k));
        all.forEach((k) => (anyOpen ? collapsed.add(k) : collapsed.delete(k)));
        b.setAttribute("aria-pressed", anyOpen);
        b.innerHTML = `<span aria-hidden="true">${anyOpen ? "⇱" : "⇲"}</span> ${anyOpen ? "Expand" : "Collapse"}`;
        render(); fit();
      }
      if (a === "empty") { showEmpty = !showEmpty; b.setAttribute("aria-pressed", showEmpty); render(); fit(); }
      if (a === "fit") fit();
      if (a === "in" || a === "out") zoomAt(view.k * (a === "in" ? 1.2 : 1 / 1.2), vp.clientWidth / 2, vp.clientHeight / 2);
      return;
    }
    const tg = e.target.closest("[data-ag-toggle]");
    if (tg) { const k = tg.dataset.agToggle; collapsed.has(k) ? collapsed.delete(k) : collapsed.add(k); return render(); }
    const op = e.target.closest("[data-ag-open]");
    if (op) return o.onOpenTool(op.dataset.agOpen);
    const rm = e.target.closest("[data-ag-remove]");
    if (rm) return o.onRemove(rm.dataset.agRemove);
    const ad = e.target.closest("[data-ag-add]");
    if (ad) { e.stopPropagation(); return pop.hidden || pop.dataset.key !== ad.dataset.agAdd ? (pop.dataset.key = ad.dataset.agAdd, openPop(ad.dataset.agAdd, ad)) : closePop(); }
    const pk = e.target.closest("[data-ag-pick]");
    if (pk) { closePop(); return o.onAdd(pk.dataset.agPick, pk.dataset.to); }
    const rs = e.target.closest("[data-ag-result]");
    if (rs) { addIn.value = ""; results.hidden = true; return o.onAdd(rs.dataset.agResult); }
    if (!pop.contains(e.target)) closePop();
  });
  host.addEventListener("keydown", (e) => { if (e.key === "Escape" && !pop.hidden) { e.stopPropagation(); e.preventDefault(); closePop(); } });
  document.addEventListener("pointerdown", (e) => { if (!pop.hidden && !host.contains(e.target)) closePop(); });

  host.querySelector(".ag-search input").addEventListener("input", (e) => { query = e.target.value; render(); });
  const addIn = host.querySelector(".ag-addtool input"), results = host.querySelector(".ag-results");
  if (addIn) addIn.addEventListener("input", () => {
    const v = addIn.value.trim().toLowerCase();
    const placed = new Set(Object.values(o.getModel().slots).flat());
    const hits = v ? o.tools.filter((t) => !placed.has(t.name) && `${t.name} ${t.kind}`.toLowerCase().includes(v)).slice(0, 8) : [];
    results.hidden = !hits.length;
    results.innerHTML = hits.map((t) => `<button data-ag-result="${esc(t.name)}">${logo(t, "xs")}<span>${esc(t.name)}</span><i>${esc(t.kind)}</i></button>`).join("");
  });

  // ---- Pan (one pointer) and pinch-zoom (two) ----------------------------
  const pts = new Map();
  let last = null;
  vp.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, input, .ag-tool, .ag-pop")) return;
    vp.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    host.classList.add("panning");
    last = null;
  });
  vp.addEventListener("pointermove", (e) => {
    if (!pts.has(e.pointerId)) return;
    const prev = pts.get(e.pointerId);
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 1) {
      view.x += e.clientX - prev[0]; view.y += e.clientY - prev[1]; apply();
    } else if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      const r = vp.getBoundingClientRect();
      const mid = [(a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (last) { view.x += mid[0] - last.mid[0]; view.y += mid[1] - last.mid[1]; zoomAt(view.k * d / last.d, mid[0], mid[1]); }
      last = { mid, d };
    }
  });
  const up = (e) => { pts.delete(e.pointerId); last = null; if (!pts.size) host.classList.remove("panning"); };
  vp.addEventListener("pointerup", up);
  vp.addEventListener("pointercancel", up);
  // Plain scrolling keeps scrolling the page; Ctrl/⌘ + scroll (and trackpad pinch) zooms
  vp.addEventListener("wheel", (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const r = vp.getBoundingClientRect();
    zoomAt(view.k * Math.exp(-e.deltaY * 0.0025), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  new ResizeObserver(() => {
    if (!vp.clientWidth) return;
    const wantVertical = vp.clientWidth < 640;
    if (wantVertical !== vertical) { render(); fit(); fitted = true; }
    else if (!fitted) { fit(); fitted = true; }
  }).observe(vp);

  return { render, fit, refit: () => { fitted = false; render(); fit(); fitted = true; } };
};
