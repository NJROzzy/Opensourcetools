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

  const discName = Object.fromEntries(disciplines.map((d) => [d.id, d.name]));

  function renderAtlas() {
    const q = $("#q").value.trim().toLowerCase();
    const list = tools.filter((t) =>
      (active === "all" || t.d === active) &&
      (!q || [t.name, t.kind, t.desc, t.license, discName[t.d]].join(" ").toLowerCase().includes(q))
    );
    $("#atlas-grid").innerHTML = list.map((t, i) => `
      <a class="card" href="${esc(t.url)}" target="_blank" rel="noopener" style="animation-delay:${Math.min(i, 20) * 25}ms">
        <div class="top"><h3>${esc(t.name)}</h3><span class="idx">${String(i + 1).padStart(2, "0")}</span></div>
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
