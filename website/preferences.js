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
  /* Apple-style symbols, 2026-11-05: SF Symbols may not be used on the web, so these are our own simple SVG drawings in that style — sun.max, moon.fill, circle.lefthalf.filled. */
  const themeIcon = value => value === 'light' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>' : value === 'dark' ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 13.5A8.5 8.5 0 0 1 10.5 4 8.5 8.5 0 1 0 20 13.5Z"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" stroke="none"/></svg>';
  const applyTheme = value => {
    theme = value;
    if (theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(el => {
      el.innerHTML = themeIcon(theme);
      el.setAttribute('aria-label', 'Appearance: ' + theme + '. Click to change appearance.');
      el.setAttribute('title', 'Appearance: ' + theme);
      el.setAttribute('data-tip', 'Appearance: ' + theme);
    });
    document.querySelectorAll('[data-theme-option]').forEach(el => { el.checked = el.value === theme; });
    const status = document.querySelector('#theme-status');
    if (status) status.textContent = 'Theme: ' + theme + '. Saved on this device only, not in your account.';
  };
  applySolid(solid);
  applyTheme(theme);
  /* Dropdown top bar, 2026-11-05: Menu button toggles the nav panel; Escape or a click outside closes it. */
  const closeMenus = () => document.querySelectorAll('.nav-menu.open').forEach(m => { m.classList.remove('open'); const b = m.querySelector('[data-nav-toggle]'); if (b) b.setAttribute('aria-expanded', 'false'); });
  document.querySelectorAll('[data-nav-toggle]').forEach(btn => btn.addEventListener('click', event => { event.stopPropagation(); const menu = btn.closest('.nav-menu'); const open = !menu.classList.contains('open'); closeMenus(); if (open) { menu.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); } }));
  document.addEventListener('click', event => { if (!event.target.closest('.nav-menu')) closeMenus(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenus(); });
  document.querySelectorAll('.nav-menu nav a').forEach(a => a.addEventListener('click', closeMenus));
  /* Logo, 2026-11-05: replace the ✳ text mark with our own SVG sparkle logo on every page. */
  document.querySelectorAll('.brand-icon').forEach(el => {
    el.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#6142ad"/><path d="M16 5 L18.6 13.4 L27 16 L18.6 18.6 L16 27 L13.4 18.6 L5 16 L13.4 13.4 Z" fill="#fff"/></svg>';
  });
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
  /* Display timezone, 2026-11-05: chosen in Settings, saved on this device only. 'device' means the device's own timezone. Planner event times stay device-local; only the clock follows this choice. */
  const timezoneKey = 'smart-planner:timezone:v1';
  const chosenTimezone = () => { try { const v = localStorage.getItem(timezoneKey); return v && v !== 'device' ? v : undefined; } catch { return undefined; } };
  const updateClocks = () => {
    const now = new Date();
    const tz = chosenTimezone();
    const clockText = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short', timeZone: tz }).format(now);
    const dateText = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: tz }).format(now);
    const tzText = tz || Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.querySelectorAll('[data-clock]').forEach(el => { el.textContent = clockText; });
    document.querySelectorAll('[data-today-date]').forEach(el => { el.textContent = dateText; });
    document.querySelectorAll('[data-timezone]').forEach(el => { el.textContent = tzText; });
  };
  updateClocks();
  setInterval(updateClocks, 30000);
  document.addEventListener('smart-planner:timezone-changed', updateClocks);
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-theme-toggle]');
    if (!button) return;
    const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    let saved = true;
    try { localStorage.setItem(themeKey, next); } catch { saved = false; }
    applyTheme(next);
    if (!saved) { const status = document.querySelector('#theme-status'); if (status) status.textContent = 'Theme applied for this page. Browser storage is unavailable.'; }
  });
  /* Breathing Room spotlight, 2026-11-05: mouse position only, on showcase tiles. No-op on touch, reduced motion, or solid mode. */
  if (window.matchMedia && window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('pointermove', event => {
      if (document.documentElement.classList.contains('solid')) return;
      const tile = event.target.closest ? event.target.closest('.bento-tile,.settings-tile,.notfound-tile,.feature') : null;
      if (!tile) return;
      const rect = tile.getBoundingClientRect();
      tile.style.setProperty('--mx', (event.clientX - rect.left) + 'px');
      tile.style.setProperty('--my', (event.clientY - rect.top) + 'px');
    }, { passive: true });
  }
})();

