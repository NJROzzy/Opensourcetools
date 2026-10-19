// Architecture graph: a pannable, zoomable node diagram of a system design.
// Components are boxes holding the tools that implement them, joined by
// labelled connections. Boxes without saved positions are ranked left to
// right by their connections (top to bottom on narrow screens).
//
//   const g = createArchGraph(host, {
//     getDesign: () => ({ title, root?, nodes: [{ id, name, role, tools, num?, x?, y? }],
//                         edges: [{ from, to, label }], notes?: [{ id, text, x, y }] }),
//     mode: "view" | "tools" | "full",   // tools: add/remove tools; full: a diagram editor
//     onEdit(action), onSelect(selection), selected(), suggest(nodeId),
//     canUndo(), canRedo(), dragTools, esc, logo, toolByName, tools,
//   });
//
// Actions sent to onEdit: addTool { tool, node? }, removeTool { tool, node },
// moveTool { tool, from, to }, move { id, x, y }, moveNote { id, x, y },
// connect { from, to }, addNode { x, y }, addNote { x, y }, noteText { id, text },
// delete, undo, redo, autoLayout.
window.createArchGraph = function createArchGraph(host, o) {
  const { esc, logo, toolByName } = o;
  const mode = o.mode || "view", full = mode === "full", editsTools = mode !== "view";
  const GW = 236, COL = 316, ROOT_W = 220, ROOT_GAP = 86, GAP = 28, HEAD = 49, TOOL = 46, ADD = 46, NOTE_W = 200;
  const uid = Math.random().toString(36).slice(2, 8);
  const view = { x: 0, y: 0, k: 1 };
  let showEdges = true, query = "", fitted = false, vertical = false, tool = "select", pendingFrom = null;
  const collapsed = new Set();
  let L = null; // last layout: { nodes: { id: box }, order, edges, root, notes, bounds }

  const btn = (attr, label, title) => `<button ${attr} title="${title || ""}">${label}</button>`;
  host.classList.add("ag");
  if (full) { host.classList.add("ag-full"); host.tabIndex = 0; }
  host.innerHTML = `
    <div class="ag-viewport">
      <div class="ag-world">
        <svg class="ag-edges" aria-hidden="true">
          <defs><marker id="ag-arrow-${uid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" /></marker></defs>
          <g class="ag-paths"></g><path class="ag-temp" hidden />
        </svg>
        <div class="ag-nodes"></div>
        <div class="ag-labels"></div>
      </div>
    </div>
    <div class="ag-toolbar">
      ${full ? `<div class="ag-btns ag-modes" role="toolbar" aria-label="Editing tools">
        ${btn('data-agtool="select" aria-pressed="true"', '<span aria-hidden="true">➤</span><span class="lbl"> Select</span>', "Select and move (V)")}
        ${btn('data-agtool="connect" aria-pressed="false"', '<span aria-hidden="true">↗</span><span class="lbl"> Connect</span>', "Click two components to connect them (C), or drag a component's port")}
        ${btn('data-agtool="box" aria-pressed="false"', '<span aria-hidden="true">▢</span><span class="lbl"> Component</span>', "Click the canvas to add a component (B)")}
        ${btn('data-agtool="note" aria-pressed="false"', '<span aria-hidden="true">✎</span><span class="lbl"> Note</span>', "Click the canvas to add a note (N)")}
      </div>
      <div class="ag-btns">
        ${btn('data-ag="undo" aria-label="Undo"', "↶", "Undo (Ctrl/⌘ + Z)")}
        ${btn('data-ag="redo" aria-label="Redo"', "↷", "Redo (Ctrl/⌘ + Shift + Z)")}
        ${btn('data-ag="delete"', '<span aria-hidden="true">⌫</span><span class="lbl"> Delete</span>', "Delete the selection (Delete)")}
        ${btn('data-ag="layout"', '<span aria-hidden="true">⇶</span><span class="lbl"> Auto-layout</span>', "Arrange components by their connections")}
        ${btn('data-ag="png"', '<span aria-hidden="true">⤓</span><span class="lbl"> PNG</span>', "Download the diagram as an image")}
      </div>` : ""}
      <label class="ag-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search tools…" aria-label="Search the graph" /></label>
      <div class="ag-btns">
        ${btn('data-ag="edges" aria-pressed="true"', '<span aria-hidden="true">⇄</span><span class="lbl"> Connections</span>')}
        ${btn('data-ag="collapse" aria-pressed="false"', '<span aria-hidden="true">⇲</span><span class="lbl"> Collapse</span>')}
        ${btn('data-ag="fit"', '<span aria-hidden="true">⛶</span><span class="lbl"> Fit</span>')}
      </div>
      ${editsTools ? `<div class="ag-addtool"><input type="search" placeholder="${full ? "+ Add a tool to the selection…" : "+ Add any tool…"}" aria-label="Add a tool" autocomplete="off" /><div class="ag-results" hidden></div></div>` : ""}
    </div>
    <div class="ag-zoom">
      <button data-ag="in" aria-label="Zoom in">+</button>
      <button data-ag="out" aria-label="Zoom out">−</button>
      <button data-ag="fit" aria-label="Fit to view">⛶</button>
    </div>
    <p class="ag-hint">${full ? "Drag boxes to move · drag ● to connect · " : "Drag to pan · "}${navigator.maxTouchPoints ? "pinch" : "Ctrl/⌘ + scroll"} to zoom</p>
    <div class="ag-pop" hidden></div>`;

  const $q = (s) => host.querySelector(s);
  const vp = $q(".ag-viewport"), world = $q(".ag-world"), svg = $q(".ag-edges"), paths = $q(".ag-paths");
  const temp = $q(".ag-temp"), nodesEl = $q(".ag-nodes"), labelsEl = $q(".ag-labels"), toolbar = $q(".ag-toolbar"), pop = $q(".ag-pop");

  // ---- View transform ------------------------------------------------------
  const apply = () => { world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.k})`; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function zoomAt(k, cx, cy) {
    k = clamp(k, 0.2, 2);
    view.x = cx - (cx - view.x) * (k / view.k);
    view.y = cy - (cy - view.y) * (k / view.k);
    view.k = k;
    apply();
  }
  const toWorld = (cx, cy) => { const r = vp.getBoundingClientRect(); return [(cx - r.left - view.x) / view.k, (cy - r.top - view.y) / view.k]; };
  function fit() {
    const W = vp.clientWidth, H = vp.clientHeight;
    if (!W || !H || !L) return;
    const b = L.bounds, top = toolbar.offsetHeight + 24, pad = vertical ? 14 : 28;
    // On narrow screens, fit the width and scroll down rather than shrinking to fit the height
    const tall = vertical && b.h / b.w > (H - top) / W;
    const k = tall ? clamp((W - pad * 2) / b.w, 0.2, 1) : clamp(Math.min((W - pad * 2) / b.w, (H - top - pad) / b.h), 0.2, 1.1);
    view.k = k;
    view.x = (W - b.w * k) / 2 - b.x * k;
    view.y = (tall ? top : top + (H - top - pad - b.h * k) / 2) - b.y * k;
    apply();
  }

  // ---- Layout ----------------------------------------------------------------
  const heightOf = (n) => collapsed.has(n.id) ? HEAD : HEAD + 6 + n.tools.length * TOOL + (editsTools ? ADD : n.tools.length ? 4 : 40);
  function layout(d) {
    const nodes = d.nodes.map((n) => ({ ...n, tools: n.tools || [] }));
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const edges = (d.edges || []).map((e, i) => ({ ...e, i })).filter((e) => byId[e.from] && byId[e.to] && e.from !== e.to);

    // Rank by the longest chain of connections, ignoring edges that close a cycle
    const out = {}, state = {}, back = new Set(), order = [];
    edges.forEach((e) => (out[e.from] ||= []).push(e.to));
    const visit = (id) => {
      state[id] = 1;
      for (const t of out[id] || []) { if (state[t] === 1) back.add(`${id}>${t}`); else if (!state[t]) visit(t); }
      state[id] = 2; order.push(id);
    };
    nodes.forEach((n) => { if (!state[n.id]) visit(n.id); });
    const rank = Object.fromEntries(nodes.map((n) => [n.id, 0]));
    for (const id of order.reverse()) for (const t of out[id] || []) if (!back.has(`${id}>${t}`)) rank[t] = Math.max(rank[t], rank[id] + 1);
    if (byId.extra) rank.extra = Math.max(0, ...nodes.filter((n) => n.id !== "extra").map((n) => rank[n.id])) + 1;

    nodes.forEach((n) => { n.w = GW; n.h = heightOf(n); });
    const cols = [];
    nodes.forEach((n) => (cols[rank[n.id]] ||= []).push(n));
    const hasRoot = !!d.root;
    vertical = vp.clientWidth > 0 && vp.clientWidth < 640;
    let root = null;
    if (vertical) {
      const PER = 2, GX = 24, GY = 70, width = PER * GW + (PER - 1) * GX;
      let y = 0;
      if (hasRoot) { root = { x: (width - ROOT_W) / 2, y: 0, w: ROOT_W, h: 96 }; y = root.h + GY; }
      cols.forEach((c) => {
        for (let i = 0; i < (c || []).length; i += PER) {
          const row = c.slice(i, i + PER), rowW = row.length * GW + (row.length - 1) * GX;
          let x = (width - rowW) / 2, rowH = 0;
          row.forEach((n) => { n.ax = x; n.ay = y; x += GW + GX; rowH = Math.max(rowH, n.h); });
          y += rowH + GY;
        }
      });
    } else {
      const x0 = hasRoot ? ROOT_W + ROOT_GAP : 0;
      const colH = cols.map((c) => (c || []).reduce((s, n) => s + n.h, 0) + GAP * ((c || []).length - 1));
      const maxH = Math.max(160, ...colH);
      cols.forEach((c, r) => {
        let y = (maxH - colH[r]) / 2;
        (c || []).forEach((n) => { n.ax = x0 + r * COL; n.ay = y; y += n.h + GAP; });
      });
      if (hasRoot) root = { x: 0, y: maxH / 2 - 52, w: ROOT_W, h: 104 };
    }
    // Saved positions win over the automatic ones
    const placed = nodes.length > 0 && nodes.every((n) => n.x != null);
    nodes.forEach((n) => { n.x = n.x ?? n.ax; n.y = n.y ?? n.ay; });
    const notes = (d.notes || []).map((t, i) => ({ ...t, x: t.x ?? 0, y: t.y ?? -120 - i * 90, w: NOTE_W, h: 0 }));

    const boxes = [...nodes, ...(root ? [root] : []), ...notes.map((t) => ({ ...t, h: 80 }))];
    const minX = Math.min(...boxes.map((b) => b.x)), minY = Math.min(...boxes.map((b) => b.y));
    const maxX = Math.max(...boxes.map((b) => b.x + b.w)), maxY = Math.max(...boxes.map((b) => b.y + b.h));
    return {
      nodes: Object.fromEntries(nodes.map((n) => [n.id, n])), order: nodes, edges, rank, root, notes, placed,
      bounds: boxes.length ? { x: minX, y: minY, w: maxX - minX, h: maxY - minY } : { x: 0, y: 0, w: 400, h: 300 },
    };
  }

  // A curve between two boxes, leaving from the sides that face each other
  function edgeGeom(A, B) {
    const dx = (B.x + B.w / 2) - (A.x + A.w / 2), dy = (B.y + B.h / 2) - (A.y + A.h / 2);
    let p1, p2, c1, c2;
    const horizontal = Math.abs(dx) > GW * 0.75 || Math.abs(dx) >= Math.abs(dy);
    if (horizontal) {
      const y1 = A.y + HEAD / 2, y2 = B.y + HEAD / 2;
      p1 = dx >= 0 ? [A.x + A.w, y1] : [A.x, y1];
      p2 = dx >= 0 ? [B.x, y2] : [B.x + B.w, y2];
      const k = Math.max(40, Math.abs(p2[0] - p1[0]) / 2) * (dx >= 0 ? 1 : -1);
      c1 = [p1[0] + k, p1[1]]; c2 = [p2[0] - k, p2[1]];
    } else {
      p1 = dy >= 0 ? [A.x + A.w / 2, A.y + A.h] : [A.x + A.w / 2, A.y];
      p2 = dy >= 0 ? [B.x + B.w / 2, B.y] : [B.x + B.w / 2, B.y + B.h];
      const k = Math.max(30, Math.abs(p2[1] - p1[1]) / 2) * (dy >= 0 ? 1 : -1);
      c1 = [p1[0], p1[1] + k]; c2 = [p2[0], p2[1] - k];
    }
    const mid = [(p1[0] + 3 * c1[0] + 3 * c2[0] + p2[0]) / 8, (p1[1] + 3 * c1[1] + 3 * c2[1] + p2[1]) / 8];
    return { d: `M${p1} C${c1} ${c2} ${p2}`, p1, c1, c2, p2, mid };
  }
  const inside = ([x, y], b) => x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h;

  function drawEdges() {
    const sel = o.selected?.() || null;
    const out = [], labels = [];
    if (L.root) {
      L.order.filter((n) => L.rank[n.id] === 0 && n.id !== "extra").forEach((n) => out.push(`<path class="ag-edge root" d="${edgeGeom(L.root, n).d}" />`));
    }
    L.edges.forEach((e) => {
      const A = L.nodes[e.from], B = L.nodes[e.to], g = edgeGeom(A, B);
      const on = sel?.type === "edge" && sel.index === e.i ? " sel" : "";
      out.push(`<path class="ag-edge flow${on}" data-e="${e.i}" data-ga="${esc(e.from)}" data-gb="${esc(e.to)}" marker-end="url(#ag-arrow-${uid})" d="${g.d}" />`);
      if (full) out.push(`<path class="ag-hit" data-e="${e.i}" d="${g.d}" />`);
      if (e.label) {
        // A label that would sit on another box shows on hover only
        const far = L.order.some((n) => n !== A && n !== B && inside(g.mid, n)) ? " far" : "";
        labels.push(`<span class="ag-label${far}${on}" data-e="${e.i}" data-ga="${esc(e.from)}" data-gb="${esc(e.to)}" style="left:${g.mid[0]}px;top:${g.mid[1]}px">${esc(e.label)}</span>`);
      }
    });
    const b = L.bounds;
    svg.setAttribute("width", Math.max(1, b.x + b.w + 60));
    svg.setAttribute("height", Math.max(1, b.y + b.h + 60));
    paths.innerHTML = out.join("");
    labelsEl.innerHTML = labels.join("");
  }

  function render() {
    const d = o.getDesign();
    L = layout(d);
    const sel = o.selected?.() || null;
    const q = query.trim().toLowerCase();
    const matches = (n) => q && `${n} ${toolByName[n]?.kind || ""}`.toLowerCase().includes(q);
    const total = L.order.reduce((s, n) => s + n.tools.length, 0);
    nodesEl.innerHTML = `
      ${L.root ? `<div class="ag-root" style="left:${L.root.x}px;top:${L.root.y}px;width:${L.root.w}px;height:${L.root.h}px">
        <span class="ag-kicker">${esc(d.root.subtitle || "Architecture")}</span>
        <b>${esc(d.root.title || "Untitled")}</b>
        <span class="ag-meta">${total} tool${total === 1 ? "" : "s"} · ${L.order.filter((n) => n.tools.length).length} layers</span>
      </div>` : ""}
      ${L.order.map((n) => {
        const isSel = sel?.type === "node" && sel.id === n.id;
        return `
      <div class="ag-group${collapsed.has(n.id) ? " collapsed" : ""}${n.tools.length ? "" : " ag-empty"}${isSel ? " sel" : ""}${pendingFrom === n.id ? " pending" : ""}" data-node="${esc(n.id)}" data-lane="${esc(n.id)}" style="left:${n.x}px;top:${n.y}px;width:${GW}px;height:${n.h}px" title="${esc(n.role || "")}">
        <div class="ag-ghead">
          ${n.num ? `<span class="step">${esc(n.num)}</span>` : ""}<b>${esc(n.name)}</b>
          ${n.tools.length ? `<span class="ag-count">${n.tools.length}</span>` : ""}
          <button class="ag-toggle" data-ag-toggle="${esc(n.id)}" aria-label="${collapsed.has(n.id) ? "Expand" : "Collapse"} ${esc(n.name)}">${collapsed.has(n.id) ? "▸" : "▾"}</button>
        </div>
        ${collapsed.has(n.id) ? "" : `<div class="ag-gtools">
          ${n.tools.map((t) => `
          <div class="ag-tool${matches(t) ? " match" : ""}" data-tool="${esc(t)}" data-node-of="${esc(n.id)}"${o.dragTools ? ` data-drag="node" data-name="${esc(t)}"` : ""}>
            <button class="ag-open" data-ag-open="${esc(t)}">${logo(toolByName[t], "xs")}<span><b>${esc(t)}</b><i>${esc(toolByName[t]?.kind || "")}</i></span></button>
            ${editsTools ? `<button class="ag-x" data-ag-remove="${esc(t)}" data-node="${esc(n.id)}" aria-label="Remove ${esc(t)}">×</button>` : ""}
          </div>`).join("")}
          ${n.tools.length || editsTools ? "" : `<span class="ag-none">empty layer</span>`}
          ${editsTools ? `<button class="ag-add" data-ag-add="${esc(n.id)}">+ add tool</button>` : ""}
        </div>`}
        ${full ? `<span class="ag-port" data-port="${esc(n.id)}" title="Drag to another component to connect"></span>` : ""}
      </div>`;
      }).join("")}
      ${L.notes.map((t) => `<div class="ag-note${sel?.type === "note" && sel.id === t.id ? " sel" : ""}" data-note="${esc(t.id)}" style="left:${t.x}px;top:${t.y}px;width:${NOTE_W}px">${esc(t.text || "")}</div>`).join("")}
      ${!L.order.length && full ? `<div class="ag-blank"><b>Blank canvas</b><span>Pick <em>Component</em> and click anywhere, or load a system design.</span></div>` : ""}`;
    drawEdges();
    host.classList.toggle("ag-searching", !!q);
    host.classList.toggle("no-edges", !showEdges);
    host.dataset.tool = tool;
    if (full) {
      $q('[data-ag="undo"]').disabled = !o.canUndo?.();
      $q('[data-ag="redo"]').disabled = !o.canRedo?.();
      $q('[data-ag="delete"]').disabled = !sel;
    }
    if (!fitted && vp.clientWidth) { fit(); fitted = true; }
  }

  // ---- Hover: light up a box's connections -----------------------------------
  nodesEl.addEventListener("pointerover", (e) => {
    const g = e.target.closest(".ag-group");
    host.classList.toggle("ag-focus", !!g);
    paths.querySelectorAll(".hot").forEach((p) => p.classList.remove("hot"));
    labelsEl.querySelectorAll(".hot").forEach((p) => p.classList.remove("hot"));
    if (!g) return;
    const k = g.dataset.node;
    paths.querySelectorAll(".ag-edge").forEach((p) => { if (p.dataset.ga === k || p.dataset.gb === k) p.classList.add("hot"); });
    labelsEl.querySelectorAll(".ag-label").forEach((p) => { if (p.dataset.ga === k || p.dataset.gb === k) p.classList.add("hot"); });
  });
  nodesEl.addEventListener("pointerleave", () => host.classList.remove("ag-focus"));

  // ---- Toolbar, buttons, pop-over ------------------------------------------------
  function setTool(t) {
    tool = t; pendingFrom = null;
    host.querySelectorAll("[data-agtool]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.agtool === t));
    host.dataset.tool = t;
    nodesEl.querySelectorAll(".pending").forEach((n) => n.classList.remove("pending"));
  }
  const closePop = () => { pop.hidden = true; pop.innerHTML = ""; delete pop.dataset.key; };
  function openPop(id, anchorEl) {
    const node = L.nodes[id];
    const placed = new Set(L.order.flatMap((n) => n.tools));
    const options = (o.suggest?.(id) || []).filter((n) => !placed.has(n));
    const item = (n, best) => `<button data-ag-pick="${esc(n)}" data-to="${esc(id)}">${logo(toolByName[n], "xs")}<span>${esc(n)}</span>${best ? `<em>best fit</em>` : ""}</button>`;
    pop.innerHTML = `
      <p class="ag-pop-title">Add to ${esc(node.name)}</p>
      ${options.slice(0, 8).map((n, i) => item(n, i === 0)).join("") || `<p class="ag-pop-none">Search for any tool below.</p>`}
      <input class="ag-pop-q" type="search" placeholder="…or search every tool" aria-label="Search every tool" />
      <div class="ag-pop-results"></div>`;
    pop.dataset.key = id;
    const hr = host.getBoundingClientRect(), br = anchorEl.getBoundingClientRect();
    pop.hidden = false;
    pop.style.left = `${clamp(br.left - hr.left, 8, hr.width - pop.offsetWidth - 8)}px`;
    pop.style.top = `${clamp(br.bottom - hr.top + 6, 8, hr.height - pop.offsetHeight - 8)}px`;
    const pq = pop.querySelector(".ag-pop-q");
    pq.addEventListener("input", () => {
      const v = pq.value.trim().toLowerCase();
      pop.querySelector(".ag-pop-results").innerHTML = v ? o.tools.filter((t) => !placed.has(t.name) && `${t.name} ${t.kind}`.toLowerCase().includes(v)).slice(0, 8).map((t) => item(t.name)).join("") : "";
    });
    (pop.querySelector("[data-ag-pick]") || pq).focus({ preventScroll: true });
  }

  host.addEventListener("click", (e) => {
    const tb = e.target.closest("[data-agtool]");
    if (tb) return setTool(tb.dataset.agtool);
    const b = e.target.closest("[data-ag]");
    if (b) {
      const a = b.dataset.ag;
      if (a === "edges") { showEdges = !showEdges; b.setAttribute("aria-pressed", showEdges); host.classList.toggle("no-edges", !showEdges); }
      if (a === "collapse") {
        const anyOpen = L.order.some((n) => !collapsed.has(n.id));
        L.order.forEach((n) => (anyOpen ? collapsed.add(n.id) : collapsed.delete(n.id)));
        b.setAttribute("aria-pressed", anyOpen);
        b.innerHTML = `<span aria-hidden="true">${anyOpen ? "⇱" : "⇲"}</span> ${anyOpen ? "Expand" : "Collapse"}`;
        render(); fit();
      }
      if (a === "fit") fit();
      if (a === "in" || a === "out") zoomAt(view.k * (a === "in" ? 1.2 : 1 / 1.2), vp.clientWidth / 2, vp.clientHeight / 2);
      if (a === "undo" || a === "redo" || a === "delete") o.onEdit({ type: a });
      if (a === "layout") o.onEdit({ type: "autoLayout" });
      if (a === "png") exportPNG();
      return;
    }
    const tg = e.target.closest("[data-ag-toggle]");
    if (tg) { const k = tg.dataset.agToggle; collapsed.has(k) ? collapsed.delete(k) : collapsed.add(k); return render(); }
    const op = e.target.closest("[data-ag-open]");
    if (op) return o.onOpenTool?.(op.dataset.agOpen);
    const rm = e.target.closest("[data-ag-remove]");
    if (rm) return o.onEdit({ type: "removeTool", tool: rm.dataset.agRemove, node: rm.dataset.node });
    const ad = e.target.closest("[data-ag-add]");
    if (ad) { e.stopPropagation(); return pop.dataset.key === ad.dataset.agAdd ? closePop() : openPop(ad.dataset.agAdd, ad); }
    const pk = e.target.closest("[data-ag-pick]");
    if (pk) { closePop(); return o.onEdit({ type: "addTool", tool: pk.dataset.agPick, node: pk.dataset.to }); }
    const rs = e.target.closest("[data-ag-result]");
    if (rs) { addIn.value = ""; results.hidden = true; return o.onEdit({ type: "addTool", tool: rs.dataset.agResult }); }
    if (!pop.contains(e.target)) closePop();
  });
  document.addEventListener("pointerdown", (e) => { if (!pop.hidden && !host.contains(e.target)) closePop(); });

  $q(".ag-search input").addEventListener("input", (e) => { query = e.target.value; render(); });
  const addIn = $q(".ag-addtool input"), results = $q(".ag-results");
  if (addIn) addIn.addEventListener("input", () => {
    const v = addIn.value.trim().toLowerCase();
    const placed = new Set(L.order.flatMap((n) => n.tools));
    const hits = v ? o.tools.filter((t) => !placed.has(t.name) && `${t.name} ${t.kind}`.toLowerCase().includes(v)).slice(0, 8) : [];
    results.hidden = !hits.length;
    results.innerHTML = hits.map((t) => `<button data-ag-result="${esc(t.name)}">${logo(t, "xs")}<span>${esc(t.name)}</span><i>${esc(t.kind)}</i></button>`).join("");
  });

  // Keyboard shortcuts for the editor (ignored while typing)
  host.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!pop.hidden) { e.preventDefault(); e.stopPropagation(); return closePop(); }
      if (full && (pendingFrom || tool !== "select")) { e.preventDefault(); e.stopPropagation(); return setTool("select"); }
    }
    if (!full || e.target.closest("input, textarea, [contenteditable=true]")) return;
    const mod = e.metaKey || e.ctrlKey, k = e.key.toLowerCase();
    if (mod && k === "z") { e.preventDefault(); return o.onEdit({ type: e.shiftKey ? "redo" : "undo" }); }
    if (mod && k === "y") { e.preventDefault(); return o.onEdit({ type: "redo" }); }
    if (mod) return;
    if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); return o.onEdit({ type: "delete" }); }
    const keys = { v: "select", c: "connect", b: "box", n: "note" };
    if (keys[k]) { e.preventDefault(); setTool(keys[k]); }
  });

  // Double-click a note to edit it in place, or a component to rename it
  nodesEl.addEventListener("dblclick", (e) => {
    if (!full) return;
    const n = e.target.closest(".ag-note");
    if (n) {
      n.contentEditable = "true"; n.focus();
      document.getSelection().selectAllChildren(n);
      n.addEventListener("blur", () => { n.contentEditable = "false"; o.onEdit({ type: "noteText", id: n.dataset.note, text: n.innerText.trim() }); }, { once: true });
      return;
    }
    const g = e.target.closest(".ag-group");
    if (g && !e.target.closest("button")) o.onSelect?.({ type: "node", id: g.dataset.node, focus: "name" });
  });

  // ---- Pointer: pan, pinch, and in the editor move / connect / drag tools ----
  const pts = new Map();
  let pinch = null, act = null;
  vp.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return;
    if (full) host.focus({ preventScroll: true });
    const t = e.target;
    if (t.closest("button, input, .ag-pop, [contenteditable=true]")) return;
    const port = t.closest(".ag-port"), toolEl = t.closest(".ag-tool"), group = t.closest(".ag-group"), note = t.closest(".ag-note"), hit = t.closest(".ag-hit, .ag-label");
    if (toolEl && !full) return; // the Studio's own drag handles these
    vp.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    const [wx, wy] = toWorld(e.clientX, e.clientY);
    if (pts.size === 2) { act = null; return; }
    if (full && port) act = { kind: "connect", from: port.dataset.port };
    else if (full && toolEl) act = { kind: "tool", tool: toolEl.dataset.tool, from: toolEl.dataset.nodeOf, el: toolEl };
    else if (full && group) { const n = L.nodes[group.dataset.node]; act = { kind: "move", id: n.id, el: group, dx: wx - n.x, dy: wy - n.y }; }
    else if (full && note) { const n = L.notes.find((x) => x.id === note.dataset.note); act = { kind: "note", id: n.id, el: note, dx: wx - n.x, dy: wy - n.y }; }
    else if (group) act = { kind: "click-node", id: group.dataset.node };
    else if (hit) act = { kind: "click-edge", index: +hit.dataset.e };
    else act = { kind: "pan" };
    Object.assign(act, { x0: e.clientX, y0: e.clientY, moved: false });
    host.classList.toggle("panning", act.kind === "pan");
  });
  vp.addEventListener("pointermove", (e) => {
    if (!pts.has(e.pointerId)) return;
    const prev = pts.get(e.pointerId);
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 2) {
      const [a, b] = [...pts.values()], r = vp.getBoundingClientRect();
      const mid = [(a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top], dist = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinch) { view.x += mid[0] - pinch.mid[0]; view.y += mid[1] - pinch.mid[1]; zoomAt(view.k * dist / pinch.dist, mid[0], mid[1]); }
      pinch = { mid, dist };
      return;
    }
    if (!act) return;
    if (!act.moved && Math.hypot(e.clientX - act.x0, e.clientY - act.y0) < 4) return;
    act.moved = true;
    const [wx, wy] = toWorld(e.clientX, e.clientY);
    if (act.kind === "pan") { view.x += e.clientX - prev[0]; view.y += e.clientY - prev[1]; apply(); }
    if (act.kind === "move") {
      const n = L.nodes[act.id];
      n.x = Math.round((wx - act.dx) / 4) * 4; n.y = Math.round((wy - act.dy) / 4) * 4;
      act.el.style.left = `${n.x}px`; act.el.style.top = `${n.y}px`;
      drawEdges();
    }
    if (act.kind === "note") {
      const n = L.notes.find((x) => x.id === act.id);
      n.x = Math.round(wx - act.dx); n.y = Math.round(wy - act.dy);
      act.el.style.left = `${n.x}px`; act.el.style.top = `${n.y}px`;
    }
    const over = (x, y) => document.elementFromPoint(x, y)?.closest(".ag-group");
    if (act.kind === "connect") {
      const A = L.nodes[act.from];
      temp.hidden = false;
      temp.setAttribute("d", `M${A.x + A.w},${A.y + HEAD / 2} L${wx},${wy}`);
      nodesEl.querySelectorAll(".ag-group.target").forEach((g) => g.classList.remove("target"));
      over(e.clientX, e.clientY)?.classList.add("target");
    }
    if (act.kind === "tool") {
      if (!act.ghost) { act.ghost = act.el.cloneNode(true); act.ghost.classList.add("ag-ghost"); document.body.appendChild(act.ghost); }
      act.ghost.style.transform = `translate(${e.clientX + 10}px, ${e.clientY + 10}px)`;
      nodesEl.querySelectorAll(".ag-group.target").forEach((g) => g.classList.remove("target"));
      over(e.clientX, e.clientY)?.classList.add("target");
    }
  });
  const up = (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    pinch = null;
    host.classList.remove("panning");
    if (!act) return;
    const a = act; act = null;
    temp.hidden = true;
    a.ghost?.remove();
    const targetEl = document.elementFromPoint(e.clientX, e.clientY)?.closest(".ag-group");
    nodesEl.querySelectorAll(".ag-group.target").forEach((g) => g.classList.remove("target"));
    if (e.type === "pointercancel") return render();
    if (a.kind === "move") return a.moved ? o.onEdit({ type: "move", id: a.id, x: L.nodes[a.id].x, y: L.nodes[a.id].y }) : clickNode(a.id);
    if (a.kind === "note") {
      const n = L.notes.find((x) => x.id === a.id);
      return a.moved ? o.onEdit({ type: "moveNote", id: a.id, x: n.x, y: n.y }) : o.onSelect?.({ type: "note", id: a.id });
    }
    if (a.kind === "connect") { if (targetEl && targetEl.dataset.node !== a.from) o.onEdit({ type: "connect", from: a.from, to: targetEl.dataset.node }); return; }
    if (a.kind === "tool") {
      if (a.moved && targetEl && targetEl.dataset.node !== a.from) return o.onEdit({ type: "moveTool", tool: a.tool, from: a.from, to: targetEl.dataset.node });
      if (!a.moved) clickNode(a.from);
      return;
    }
    if (a.kind === "click-node" && !a.moved) return clickNode(a.id);
    if (a.kind === "click-edge" && !a.moved) return o.onSelect?.({ type: "edge", index: a.index });
    if (a.kind === "pan" && !a.moved && full) {
      const [wx, wy] = toWorld(e.clientX, e.clientY);
      if (tool === "box") { setTool("select"); return o.onEdit({ type: "addNode", x: Math.round(wx - GW / 2), y: Math.round(wy - HEAD / 2) }); }
      if (tool === "note") { setTool("select"); return o.onEdit({ type: "addNote", x: Math.round(wx - NOTE_W / 2), y: Math.round(wy - 20) }); }
      if (pendingFrom) setTool("select");
      o.onSelect?.(null);
    }
  };
  function clickNode(id) {
    if (!full) return o.onSelect?.({ type: "node", id });
    if (tool === "connect") {
      if (!pendingFrom) { pendingFrom = id; return render(); }
      const from = pendingFrom; pendingFrom = null;
      if (from !== id) return o.onEdit({ type: "connect", from, to: id });
      return render();
    }
    o.onSelect?.({ type: "node", id });
  }
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
    if (!vp.clientWidth || !L) return;
    const wantVertical = vp.clientWidth < 640;
    if (wantVertical !== vertical && !L.placed) { render(); fit(); fitted = true; }
    else if (!fitted) { fit(); fitted = true; }
  }).observe(vp);

  // ---- Export the diagram as a PNG ---------------------------------------
  async function exportPNG() {
    const d = o.getDesign(), b = L.bounds, pad = 48, head = 70, s = 2;
    // Draw in the current theme's colours
    const cs = getComputedStyle(document.documentElement), v = (n, f) => cs.getPropertyValue(n).trim() || f;
    const FG = v("--fg", "255,255,255"), HI = v("--hi", "#fff");
    const [S0, S1, S2, S3] = [["--s0", "#050505"], ["--s1", "#0b0b0b"], ["--s2", "#121212"], ["--s3", "#151515"]].map(([n, f]) => v(n, f));
    const W = Math.ceil(b.w + pad * 2), H = Math.ceil(b.h + pad * 2 + head);
    const cv = document.createElement("canvas");
    cv.width = W * s; cv.height = H * s;
    const c = cv.getContext("2d");
    c.scale(s, s);
    c.fillStyle = S0; c.fillRect(0, 0, W, H);
    c.fillStyle = `rgba(${FG},.08)`;
    for (let x = 10; x < W; x += 20) for (let y = 10; y < H; y += 20) c.fillRect(x, y, 1, 1);
    c.fillStyle = HI; c.font = 'italic 30px "Cormorant Garamond", serif';
    c.fillText(d.title || d.root?.title || "Architecture", pad, 50);
    c.fillStyle = `rgba(${FG},.45)`; c.font = '10px "IBM Plex Mono", monospace';
    c.fillText("AMALGAM · OPEN-SOURCE ARCHITECTURE", Math.max(pad, W - pad - 230), 46);
    c.translate(pad - b.x, pad + head - b.y);
    const srcs = [...new Set(L.order.flatMap((n) => n.tools.map((t) => toolByName[t]?.logo).filter(Boolean)))];
    const imgs = Object.fromEntries(await Promise.all(srcs.map((src) => new Promise((r) => {
      const im = new Image(); im.onload = () => r([src, im]); im.onerror = () => r([src, null]); im.src = src;
    }))));
    const round = (x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
    // Connections
    c.lineWidth = 1.4;
    for (const e of L.edges) {
      const g = edgeGeom(L.nodes[e.from], L.nodes[e.to]);
      c.strokeStyle = `rgba(${FG},.55)`; c.setLineDash([6, 5]); c.stroke(new Path2D(g.d)); c.setLineDash([]);
      const ang = Math.atan2(g.p2[1] - g.c2[1], g.p2[0] - g.c2[0]);
      c.fillStyle = `rgba(${FG},.8)`; c.beginPath();
      c.moveTo(g.p2[0], g.p2[1]);
      c.lineTo(g.p2[0] - 9 * Math.cos(ang - 0.4), g.p2[1] - 9 * Math.sin(ang - 0.4));
      c.lineTo(g.p2[0] - 9 * Math.cos(ang + 0.4), g.p2[1] - 9 * Math.sin(ang + 0.4));
      c.fill();
      if (e.label) {
        c.font = '10px "IBM Plex Mono", monospace';
        const w = c.measureText(e.label).width + 14;
        round(g.mid[0] - w / 2, g.mid[1] - 9, w, 18, 9); c.fillStyle = S0; c.fill(); c.strokeStyle = `rgba(${FG},.3)`; c.stroke();
        c.fillStyle = `rgba(${FG},.75)`; c.fillText(e.label, g.mid[0] - w / 2 + 7, g.mid[1] + 3.5);
      }
    }
    // Components
    for (const n of L.order) {
      const h = collapsed.has(n.id) ? HEAD : HEAD + 10 + n.tools.length * TOOL;
      round(n.x, n.y, GW, h, 12); c.fillStyle = S1; c.fill(); c.strokeStyle = `rgba(${FG},.35)`; c.stroke();
      c.fillStyle = HI; c.font = '500 18px "Cormorant Garamond", serif';
      c.fillText(n.name, n.x + 14, n.y + 30, GW - 28);
      c.strokeStyle = `rgba(${FG},.12)`; c.beginPath(); c.moveTo(n.x, n.y + HEAD); c.lineTo(n.x + GW, n.y + HEAD); c.stroke();
      if (collapsed.has(n.id)) continue;
      n.tools.forEach((t, i) => {
        const ty = n.y + HEAD + 6 + i * TOOL;
        round(n.x + 8, ty, GW - 16, 40, 9); c.fillStyle = S2; c.fill(); c.strokeStyle = `rgba(${FG},.12)`; c.stroke();
        round(n.x + 14, ty + 7, 26, 26, 6); c.fillStyle = "#f7f7f4"; c.fill();
        const im = imgs[toolByName[t]?.logo];
        if (im) c.drawImage(im, n.x + 18, ty + 11, 18, 18);
        c.fillStyle = HI; c.font = '11.5px "IBM Plex Mono", monospace'; c.fillText(t, n.x + 48, ty + 18, GW - 70);
        c.fillStyle = `rgba(${FG},.45)`; c.font = 'italic 12px "Cormorant Garamond", serif'; c.fillText(toolByName[t]?.kind || "", n.x + 48, ty + 32, GW - 70);
      });
    }
    // Notes
    for (const t of L.notes) {
      round(t.x, t.y, NOTE_W, 70, 10); c.fillStyle = S3; c.fill(); c.strokeStyle = `rgba(${FG},.4)`; c.setLineDash([3, 3]); c.stroke(); c.setLineDash([]);
      c.fillStyle = `rgba(${FG},.85)`; c.font = 'italic 15px "Cormorant Garamond", serif';
      (t.text || "").split("\n").slice(0, 3).forEach((line, i) => c.fillText(line, t.x + 12, t.y + 24 + i * 18, NOTE_W - 24));
    }
    cv.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${(d.title || "architecture").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "architecture"}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, "image/png");
  }

  return {
    host, render, fit, setTool, exportPNG,
    refit: () => { fitted = false; render(); fit(); fitted = true; },
    // Box positions from a fresh automatic layout, so an owner can save them
    autoPositions: () => {
      const d = o.getDesign();
      const lay = layout({ ...d, nodes: d.nodes.map(({ x, y, ...n }) => n) });
      return Object.fromEntries(lay.order.map((n) => [n.id, { x: n.x, y: n.y }]));
    },
  };
};
