// Pinned-diagram highlighting module
// Connects numbered architecture steps in case study text with SVG diagram components.

let activeObserver = null;

export function initDiagramHighlighting() {
  if (activeObserver) {
    activeObserver.disconnect();
    activeObserver = null;
  }

  const diagram = document.querySelector('.arch-diagram');
  if (!diagram) return;

  const parts = diagram.querySelectorAll('.diag-part');
  if (!parts || parts.length === 0) return;

  // Find all steps in the page
  // Look for elements with data-step, or ordered list items in the architecture section
  const stepElements = document.querySelectorAll('[data-step], .arch-steps li, .project-body ol li');
  if (stepElements.length === 0) return;

  function highlightPart(partNumber) {
    parts.forEach((part) => {
      if (part.getAttribute('data-part') === String(partNumber)) {
        part.classList.add('diag-part-highlight');
      } else {
        part.classList.remove('diag-part-highlight');
      }
    });

    stepElements.forEach((el, index) => {
      const stepNum = el.getAttribute('data-step') || String(index + 1);
      if (stepNum === String(partNumber)) {
        el.classList.add('step-highlight');
      } else {
        el.classList.remove('step-highlight');
      }
    });
  }

  function clearHighlight() {
    parts.forEach((part) => part.classList.remove('diag-part-highlight'));
    stepElements.forEach((el) => el.classList.remove('step-highlight'));
  }

  // Hover on SVG parts highlights text
  parts.forEach((part) => {
    const partNum = part.getAttribute('data-part');
    part.addEventListener('mouseenter', () => highlightPart(partNum));
    part.addEventListener('mouseleave', () => clearHighlight());
    part.addEventListener('click', () => {
      highlightPart(partNum);
      const matchingStep = Array.from(stepElements).find(
        (el, idx) => (el.getAttribute('data-step') || String(idx + 1)) === String(partNum)
      );
      if (matchingStep) {
        matchingStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // Hover and scroll on steps highlights SVG
  stepElements.forEach((stepEl, index) => {
    const stepNum = stepEl.getAttribute('data-step') || String(index + 1);
    stepEl.setAttribute('data-step', stepNum);

    stepEl.addEventListener('mouseenter', () => highlightPart(stepNum));
    stepEl.addEventListener('mouseleave', () => clearHighlight());
  });

  // Scroll intersection observer
  try {
    activeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const stepNum = entry.target.getAttribute('data-step');
          if (stepNum) {
            highlightPart(stepNum);
          }
        }
      });
    }, {
      rootMargin: '-10% 0px -40% 0px',
      threshold: 0.5
    });

    stepElements.forEach((el) => activeObserver.observe(el));
  } catch (e) {
    // IntersectionObserver fallback
  }
}
