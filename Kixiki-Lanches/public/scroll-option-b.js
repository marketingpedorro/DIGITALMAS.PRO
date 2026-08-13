(function () {
  const body = document.body;
  if (!body || !body.classList.contains('kx-option-b')) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = Array.from(document.querySelectorAll('.kx-food-card'));

  cards.forEach((card, index) => {
    card.setAttribute('data-kx-card-reveal', '');
    card.style.setProperty('--kx-card-delay', `${(index % 3) * 70}ms`);
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    cards.forEach((card) => card.classList.add('is-card-visible'));
    return;
  }

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-card-visible');
      cardObserver.unobserve(entry.target);
    });
  }, {
    rootMargin: '0px 0px -7% 0px',
    threshold: 0.08
  });

  cards.forEach((card) => cardObserver.observe(card));

  const hero = document.querySelector('.kx-hero-box');
  const photo = document.querySelector('.kx-hero-photo-wrap');
  if (!hero || !photo) return;

  let framePending = false;

  function updateScene() {
    const rect = hero.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const progress = Math.max(0, Math.min(1, (viewport - rect.top) / (viewport + rect.height)));
    photo.style.setProperty('--kx-scene-progress', progress.toFixed(3));
    framePending = false;
  }

  function requestSceneUpdate() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateScene);
  }

  updateScene();
  window.addEventListener('scroll', requestSceneUpdate, { passive: true });
  window.addEventListener('resize', requestSceneUpdate);
})();
