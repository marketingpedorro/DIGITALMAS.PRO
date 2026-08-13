(function () {
  const root = document.documentElement;
  const toggle = document.getElementById('kx-theme-toggle');
  const themeColor = document.getElementById('kx-theme-color');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const storageKey = 'kixiki-theme';

  if (!toggle) return;

  function storedTheme() {
    try {
      const value = localStorage.getItem(storageKey);
      return value === 'day' || value === 'night' ? value : null;
    } catch (error) {
      return null;
    }
  }

  function applyTheme(theme, remember) {
    const nextTheme = theme === 'night' ? 'night' : 'day';
    const isNight = nextTheme === 'night';

    root.setAttribute('data-kx-theme', nextTheme);
    toggle.setAttribute('aria-checked', String(isNight));
    toggle.setAttribute('title', isNight ? 'Mudar para o modo DIA' : 'Mudar para o modo NOITE');

    if (themeColor) themeColor.setAttribute('content', isNight ? '#001e10' : '#fff8e7');

    if (remember) {
      try { localStorage.setItem(storageKey, nextTheme); } catch (error) {}
    }
  }

  applyTheme(root.getAttribute('data-kx-theme'), false);

  toggle.addEventListener('click', function () {
    const current = root.getAttribute('data-kx-theme');
    applyTheme(current === 'night' ? 'day' : 'night', true);
  });

  systemTheme.addEventListener('change', function (event) {
    if (!storedTheme()) applyTheme(event.matches ? 'night' : 'day', false);
  });
})();
