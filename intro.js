// The five-step tour. It opens only when asked for (from Home or the footer)
// and ends on the design canvas with a short prompt to draw the example.
(() => {
  const intro = document.getElementById("intro");
  const openers = [document.getElementById("intro-open"), document.getElementById("intro-replay")];
  if (typeof intro.showModal !== "function") {
    openers.forEach((b) => b && (b.hidden = true));
    return;
  }

  const stages = [...intro.querySelectorAll("[data-intro-stage]")];
  const progress = document.getElementById("intro-progress");
  const canvasGuide = document.getElementById("cv-onboarding");
  const back = document.getElementById("intro-back");
  const next = document.getElementById("intro-next");
  const workflow = document.getElementById("intro-task-flow");
  const replayWorkflow = document.getElementById("intro-flow-replay");
  const lastStage = stages.length - 1;
  let stage = 0;
  let opener = null;
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
    next.textContent = stage === lastStage ? "Open the design canvas" : "Continue";
    intro.scrollTop = 0;
    heading.focus({ preventScroll: true });
    if (stages[stage].contains(workflow)) playWorkflow();
  }

  function openIntro(from) {
    opener = from;
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
    if (!finished) { opener?.focus(); return; }
    canvasGuide.hidden = false;
    location.hash = "#design";
  });

  document.getElementById("cv-explore").addEventListener("click", () => { canvasGuide.hidden = true; });

  replayWorkflow.hidden = false;
  replayWorkflow.addEventListener("click", playWorkflow);
  openers.forEach((b) => b && b.addEventListener("click", () => openIntro(b)));
})();
