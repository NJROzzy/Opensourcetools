(() => {
  const root = document.documentElement;
  const intro = document.getElementById("intro");
  const tracks = window.ATLAS?.tracks;
  if (typeof intro.showModal !== "function" || !tracks?.length) {
    root.classList.remove("intro-pending");
    return;
  }

  const replay = document.getElementById("intro-replay");
  const stages = [...intro.querySelectorAll("[data-intro-stage]")];
  const progress = document.getElementById("intro-progress");
  const picker = document.getElementById("intro-track");
  const recommendation = document.getElementById("intro-recommendation");
  const canvas = document.getElementById("canvas");
  const canvasGuide = document.getElementById("cv-onboarding");
  const explore = document.getElementById("cv-explore");
  const back = document.getElementById("intro-back");
  const next = document.getElementById("intro-next");
  const goalStage = stages.indexOf(picker.closest("[data-intro-stage]"));
  const lastStage = stages.length - 1;
  let stage = 0;
  let replaying = false;
  let finished = false;

  for (const track of tracks) picker.add(new Option(track.name, track.id), picker.options.length - 2);

  function showStage(index) {
    stages[stage].hidden = true;
    stage = index;
    stages[stage].hidden = false;
    const heading = stages[stage].querySelector("h2");
    intro.setAttribute("aria-labelledby", heading.id);
    progress.textContent = `Step ${stage + 1} of ${stages.length}`;
    back.hidden = stage === 0;
    next.disabled = stage === goalStage && !picker.value;
    next.textContent = stage === lastStage ? "Open System Design Canvas" : "Continue";
    if (stage === lastStage) {
      const track = tracks.find(({ id }) => id === picker.value);
      if (track) {
        recommendation.textContent = `We’ll open the canvas with ${track.name} selected. Pick a design to see how its components fit together, or choose Blank canvas to draw your own.`;
      } else if (picker.value === "scratch") {
        recommendation.textContent = "Choose Blank canvas and draw the to-do list from the lesson. Add a Browser, an App server, and a Database, then label each connection.";
      } else {
        recommendation.textContent = "Pick a ready-made design in the canvas to see how it works. You can move components, swap tools, and sketch a version of your own.";
      }
    }
    intro.scrollTop = 0;
    heading.focus({ preventScroll: true });
  }

  function openIntro(isReplay) {
    replaying = isReplay;
    finished = false;
    picker.value = "";
    intro.querySelectorAll("details[open]").forEach((detail) => { detail.open = false; });
    intro.showModal();
    showStage(0);
  }

  picker.addEventListener("change", () => { next.disabled = !picker.value; });
  back.addEventListener("click", () => showStage(stage - 1));
  next.addEventListener("click", () => {
    if (stage < lastStage) {
      showStage(stage + 1);
    } else {
      finished = true;
      intro.close();
    }
  });

  intro.addEventListener("close", () => {
    if (!finished) {
      (replaying ? replay : document.querySelector("#hero h1")).focus();
      return;
    }
    const trackId = picker.value === "scratch" ? "web" : picker.value;
    const track = tracks.find(({ id }) => id === trackId);
    if (track) canvas.querySelector(`[data-cv-track="${track.id}"]`)?.click();
    document.getElementById("cv-onboarding-guide").textContent = recommendation.textContent;
    canvasGuide.hidden = false;
    root.classList.add("canvas-focus");
    const heading = canvas.querySelector("h2");
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    canvas.scrollIntoView();
  });

  explore.addEventListener("click", () => {
    root.classList.remove("canvas-focus");
    canvasGuide.hidden = true;
    canvas.querySelector("h2").focus({ preventScroll: true });
    canvas.scrollIntoView();
  });

  replay.hidden = false;
  replay.addEventListener("click", () => openIntro(true));

  if (root.classList.contains("intro-pending")) {
    try { openIntro(false); }
    finally { root.classList.remove("intro-pending"); }
  }
})();
