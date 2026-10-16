'use strict';
(() => {
  const key = 'smart-planner:solid:v1';
  let solid = false;
  try { solid = localStorage.getItem(key) === 'true'; } catch { /* Settings remain usable in memory. */ }
  const apply = value => {
    solid = value;
    document.documentElement.classList.toggle('solid', solid);
    document.querySelectorAll('[data-solid]').forEach(el => { el.checked = solid; });
  };
  apply(solid);
  document.addEventListener('change', event => {
    if (!event.target.matches('[data-solid]')) return;
    apply(event.target.checked);
    let saved = true;
    try { localStorage.setItem(key, String(solid)); } catch { saved = false; }
    const status = document.querySelector('#preference-status');
    if (status) status.textContent = saved ? 'Display preference saved on this device.' : 'Display preference applied for this page. Browser storage is unavailable.';
  });
})();
