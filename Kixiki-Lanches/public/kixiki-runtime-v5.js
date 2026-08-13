(function () {
  const stickyBar = document.getElementById('sticky-header-bar');
  if (!stickyBar) return;

  let framePending = false;

  function updateStickyBar() {
    stickyBar.classList.toggle('visible', window.scrollY > 120);
    framePending = false;
  }

  function requestStickyUpdate() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateStickyBar);
  }

  updateStickyBar();
  window.addEventListener('scroll', requestStickyUpdate, { passive: true });
})();
