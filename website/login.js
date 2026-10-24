'use strict';
(() => {
  const KEY = 'smart-planner:session:v1';
  const DEMO_USER = 'user';
  const DEMO_PASS = 'password';
  const $ = id => document.getElementById(id);
  const form = $('login-form');
  if (!form) return;
  const note = $('session-note');
  const showSessionNote = () => {
    try { if (sessionStorage.getItem(KEY)) note.hidden = false; } catch { /* Session is optional. */ }
  };
  showSessionNote();
  const signOut = $('sign-out');
  if (signOut) signOut.addEventListener('click', () => {
    try { sessionStorage.removeItem(KEY); } catch { /* Ignore. */ }
    note.hidden = true;
    $('username').focus();
  });
  const toggle = $('toggle-password');
  const password = $('password');
  if (toggle) toggle.addEventListener('click', () => {
    const show = password.type === 'password';
    password.type = show ? 'text' : 'password';
    toggle.textContent = show ? 'Hide password' : 'Show password';
    toggle.setAttribute('aria-pressed', String(show));
    password.focus();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const error = $('login-error');
    error.textContent = '';
    const username = $('username').value.trim();
    const pass = password.value;
    if (!username || !pass) { error.textContent = 'Enter a username and password, or continue as a guest.'; return; }
    if (username !== DEMO_USER || pass !== DEMO_PASS) {
      error.textContent = 'That demo account was not recognised. Use the team demo account shown below, or continue as a guest.';
      password.select();
      return;
    }
    try { sessionStorage.setItem(KEY, JSON.stringify({ name: DEMO_USER, demo: true, welcome: true })); } catch { /* Guest preview still works without a session. */ }
    window.location.href = 'planner.html#today';
  });
})();
