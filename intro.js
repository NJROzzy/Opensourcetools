(() => {
  const root = document.documentElement;
  const intro = document.getElementById("intro");
  const replay = document.getElementById("intro-replay");
  if (typeof intro.showModal !== "function") return;

  const choices = document.getElementById("intro-choices");
  const storage = document.getElementById("intro-storage");
  const storageNode = document.getElementById("intro-storage-node");
  const feedback = document.getElementById("intro-feedback");
  const reading = document.getElementById("intro-reading");
  const next = document.getElementById("intro-next");
  let replaying = false;

  function openIntro(isReplay) {
    replaying = isReplay;
    choices.hidden = false;
    reading.hidden = true;
    next.hidden = true;
    storage.textContent = "Missing tool";
    storageNode.classList.remove("is-filled");
    feedback.textContent = "";
    intro.showModal();
    intro.scrollTop = 0;
    document.getElementById("intro-heading").focus({ preventScroll: true });
  }

  function enterSite() {
    try { localStorage.setItem("amg-intro-seen", "2"); } catch { /* storage unavailable */ }
    intro.close();
  }

  choices.addEventListener("click", (event) => {
    const tool = event.target.closest("[data-intro-tool]");
    if (!tool) return;
    if (tool.dataset.introTool === "dashboard") {
      feedback.textContent = "Grafana displays the readings. Try the tool that saves them.";
      return;
    }
    storage.textContent = "PostgreSQL";
    storageNode.classList.add("is-filled");
    feedback.textContent = "A subscriber writes readings from the MQTT broker to PostgreSQL. Grafana queries the database to display them. In Amalgam, you can explore full project recipes and edit their architectures in the System Design Canvas.";
    reading.hidden = false;
    next.hidden = false;
    next.focus();
    choices.hidden = true;
  });
  next.addEventListener("click", enterSite);
  document.getElementById("intro-skip").addEventListener("click", enterSite);
  intro.addEventListener("cancel", (event) => {
    event.preventDefault();
    enterSite();
  });
  intro.addEventListener("close", () => {
    const destination = replaying ? replay : document.querySelector("#hero h1");
    destination.focus();
  });
  replay.hidden = false;
  replay.addEventListener("click", () => openIntro(true));

  if (root.classList.contains("intro-pending")) {
    try { openIntro(false); }
    finally { root.classList.remove("intro-pending"); }
  }
})();
