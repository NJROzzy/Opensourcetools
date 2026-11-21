(() => {
  const root = document.documentElement;
  const intro = document.getElementById("intro");
  const replay = document.getElementById("intro-replay");
  if (typeof intro.showModal !== "function") return;

  let replaying = false;

  function openIntro(isReplay) {
    replaying = isReplay;
    intro.showModal();
    intro.scrollTop = 0;
    document.getElementById("intro-heading").focus({ preventScroll: true });
  }

  function enterSite() {
    try { localStorage.setItem("amg-intro-seen", "3"); } catch { /* storage unavailable */ }
    intro.close();
  }

  document.getElementById("intro-next").addEventListener("click", enterSite);
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
