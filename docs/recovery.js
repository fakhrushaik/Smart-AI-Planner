import { client, callbackURL, signOut } from './auth.js';
import { verifyRecovery } from './recovery-core.js';
const request=document.getElementById('request-reset'), change=document.getElementById('change-password');
const status=document.getElementById('recovery-status'), error=document.getElementById('recovery-error');
let verified=false, busy=false;
async function run(action){if(busy)return;busy=true;error.textContent='';document.querySelectorAll('form button').forEach(b=>b.disabled=true);try{await action();}catch(e){error.textContent=e.message||'Could not connect. Try again.';}finally{busy=false;document.querySelectorAll('form button').forEach(b=>b.disabled=false);}}
request.addEventListener('submit',event=>{event.preventDefault();run(async()=>{
  const {error:e}=await client.auth.resetPasswordForEmail(request.elements.email.value.trim(),{redirectTo:callbackURL(true)});
  if(e)throw new Error('Email could not be requested. Wait a minute and try again; contact the team if this continues.');
  status.textContent='If an account exists for that address, a reset link has been requested. Check your inbox and spam folder. Open the link in this tab.';
});});
change.addEventListener('submit',event=>{event.preventDefault();run(async()=>{
  if(!verified)throw new Error('Request a new reset link first.');
  if(change.elements.password.value!==change.elements.confirm.value)throw new Error('The passwords do not match.');
  const {error:e}=await client.auth.updateUser({password:change.elements.password.value});if(e)throw e;
  verified=false;change.reset();change.hidden=true;
  status.textContent='Password updated. Signing out…';
  try{await signOut();status.textContent='Password updated. Return to sign in with your new password.';}
  catch{status.textContent='Password updated, but sign-out could not be confirmed. Return to sign in and use Sign out before leaving this device.';}
});});
const params=new URLSearchParams(location.search);
// Remove credentials from the address bar before any network request.
history.replaceState(null,'',location.pathname);
run(async()=>{verified=await verifyRecovery(client.auth,params);change.hidden=!verified;request.hidden=verified;
  if(verified){document.getElementById('recovery-help').textContent='Choose a new password of at least 12 characters.';change.elements.password.focus();}
});
