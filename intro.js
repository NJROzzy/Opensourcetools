(() => {
  const root = document.documentElement;
  const intro = document.getElementById("intro");
  if (typeof intro.showModal !== "function") {
    root.classList.remove("intro-pending");
    return;
  }

  const replay = document.getElementById("intro-replay");
  const stages = [...intro.querySelectorAll("[data-intro-stage]")];
  const progress = document.getElementById("intro-progress");
  const canvas = document.getElementById("canvas");
  const canvasGuide = document.getElementById("cv-onboarding");
  const explore = document.getElementById("cv-explore");
  const back = document.getElementById("intro-back");
  const next = document.getElementById("intro-next");
  const workflow = document.getElementById("intro-task-flow");
  const replayWorkflow = document.getElementById("intro-flow-replay");
  const lastStage = stages.length - 1;
  let stage = 0;
  let replaying = false;
  let finished = false;

  function playWorkflow() {
    workflow.classList.remove("is-playing");
    // Flush the reset so replay also works while the animation is running.
    void workflow.offsetWidth;
    workflow.classList.add("is-playing");
  }

  function showStage(index) {
    stages[stage].hidden = true;
    stage = index;
    stages[stage].hidden = false;
    const heading = stages[stage].querySelector("h2");
    intro.setAttribute("aria-labelledby", heading.id);
    progress.textContent = `Step ${stage + 1} of ${stages.length}`;
    back.hidden = stage === 0;
    next.textContent = stage === lastStage ? "Open System Design Canvas" : "Continue";
    intro.scrollTop = 0;
    heading.focus({ preventScroll: true });
    if (stages[stage].contains(workflow)) playWorkflow();
  }

  function openIntro(isReplay) {
    replaying = isReplay;
    finished = false;
    intro.showModal();
    showStage(0);
  }

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

  replayWorkflow.hidden = false;
  replayWorkflow.addEventListener("click", playWorkflow);
  replay.hidden = false;
  replay.addEventListener("click", () => openIntro(true));

  if (root.classList.contains("intro-pending")) {
    try { openIntro(false); }
    finally { root.classList.remove("intro-pending"); }
  }
})();
