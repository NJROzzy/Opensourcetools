(() => {
  const root = document.documentElement;
  const intro = document.getElementById("intro");
  const replay = document.getElementById("intro-replay");
  if (typeof intro.showModal !== "function") return;

  const chapters = [...intro.querySelectorAll("[data-intro-step]")];
  const progress = document.getElementById("intro-progress");
  const back = document.getElementById("intro-back");
  const next = document.getElementById("intro-next");
  let chapter = 0;
  let replaying = false;

  function showChapter(index) {
    chapters[chapter].hidden = true;
    chapter = index;
    chapters[chapter].hidden = false;
    progress.textContent = `${chapter + 1} of ${chapters.length}`;
    back.hidden = chapter === 0;
    next.textContent = chapter === chapters.length - 1 ? "Enter Amalgam" : "Continue";
    intro.scrollTop = 0;
    chapters[chapter].querySelector("h2").focus({ preventScroll: true });
  }

  function openIntro(isReplay) {
    replaying = isReplay;
    intro.showModal();
    showChapter(0);
  }

  function enterSite() {
    try { localStorage.setItem("amg-intro-seen", "1"); } catch { /* storage unavailable */ }
    intro.close();
  }

  next.addEventListener("click", () => {
    if (chapter === chapters.length - 1) enterSite();
    else showChapter(chapter + 1);
  });
  back.addEventListener("click", () => showChapter(chapter - 1));
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
