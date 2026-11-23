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
    next.textContent = "Continue";
    if (stage === lastStage) {
      const track = tracks.find(({ id }) => id === picker.value);
      if (track) {
        next.textContent = "Open build path";
        recommendation.textContent = `Start with ${track.name}. ${track.blurb} We’ll open that build path so you can see its architecture and choose a project recipe.`;
      } else if (picker.value === "scratch") {
        next.textContent = "Open System Design Canvas";
        recommendation.textContent = "Choose Blank canvas to draw the greenhouse monitor or sketch your own system. Write down the requirements, add one box per job, and trace a request or reading through the diagram.";
      } else {
        next.textContent = "Explore Amalgam";
        recommendation.textContent = "Open the System Design Canvas and start with a ready-made design. You can change the components, try different tools, and export the result.";
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
    const trackButton = [...document.querySelectorAll("#track-groups [data-track]")]
      .find((button) => button.dataset.track === picker.value);
    trackButton?.click();
    const section = document.getElementById(trackButton ? "paths" : "canvas");
    const heading = section.querySelector("h2");
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    section.scrollIntoView();
  });

  replay.hidden = false;
  replay.addEventListener("click", () => openIntro(true));

  if (root.classList.contains("intro-pending")) {
    try { openIntro(false); }
    finally { root.classList.remove("intro-pending"); }
  }
})();
