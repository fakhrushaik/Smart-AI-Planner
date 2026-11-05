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
  const updateClocks = () => {
    const now = new Date();
    const clockText = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(now);
    const dateText = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(now);
    const tzText = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.querySelectorAll('[data-clock]').forEach(el => { el.textContent = clockText; });
    document.querySelectorAll('[data-today-date]').forEach(el => { el.textContent = dateText; });
    document.querySelectorAll('[data-timezone]').forEach(el => { el.textContent = tzText; });
  };
  updateClocks();
  setInterval(updateClocks, 30000);
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
