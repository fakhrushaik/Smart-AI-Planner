'use strict';
(() => {
  const solidKey = 'smart-planner:solid:v1';
  const themeKey = 'smart-planner:theme:v1';
  let solid = false;
  try { solid = localStorage.getItem(solidKey) === 'true'; } catch { /* Settings remain usable in memory. */ }
  const applySolid = value => {
    solid = value;
    document.documentElement.classList.toggle('solid', solid);
    document.querySelectorAll('[data-solid]').forEach(el => { el.checked = solid; });
  };
  let theme = 'system';
  try { theme = localStorage.getItem(themeKey) || 'system'; } catch { theme = 'system'; }
  if (!['light', 'dark', 'system'].includes(theme)) theme = 'system';
  const themeIcon = value => value === 'light' ? '☀' : value === 'dark' ? '🌙' : '◐';
  const applyTheme = value => {
    theme = value;
    if (theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(el => {
      el.textContent = themeIcon(theme);
      el.setAttribute('aria-label', 'Theme: ' + theme + '. Click to change theme.');
      el.setAttribute('title', 'Theme: ' + theme);
    });
    document.querySelectorAll('[data-theme-option]').forEach(el => { el.checked = el.value === theme; });
    const status = document.querySelector('#theme-status');
    if (status) status.textContent = 'Theme: ' + theme + '. Saved on this device only, not in your account.';
  };
  applySolid(solid);
  applyTheme(theme);
  document.addEventListener('change', event => {
    if (event.target.matches('[data-solid]')) {
      applySolid(event.target.checked);
      let saved = true;
      try { localStorage.setItem(solidKey, String(solid)); } catch { saved = false; }
      const status = document.querySelector('#preference-status');
      if (status) status.textContent = saved ? 'Display preference saved on this device.' : 'Display preference applied for this page. Browser storage is unavailable.';
      return;
    }
    if (event.target.matches('[data-theme-option]')) {
      let saved = true;
      try { localStorage.setItem(themeKey, event.target.value); } catch { saved = false; }
      applyTheme(event.target.value);
      const status = document.querySelector('#theme-status');
      if (status && !saved) status.textContent = 'Theme applied for this page. Browser storage is unavailable.';
    }
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-theme-toggle]');
    if (!button) return;
    const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    let saved = true;
    try { localStorage.setItem(themeKey, next); } catch { saved = false; }
    applyTheme(next);
    if (!saved) { const status = document.querySelector('#theme-status'); if (status) status.textContent = 'Theme applied for this page. Browser storage is unavailable.'; }
  });
})();
