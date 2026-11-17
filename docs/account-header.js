import { initHeader } from './profile.js';
import { client } from './auth.js';
initHeader();
client.auth.onAuthStateChange(()=>{setTimeout(initHeader,0);});
window.addEventListener('pageshow',initHeader);
