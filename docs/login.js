import { client, config, callbackURL, currentUser, signOut, authStorage } from './auth.js';
const $ = id => document.getElementById(id);
let mode = 'signin';
let busy = false;
function setMode(next) {
  mode = next;
  $('login-title').textContent = ({signin:'Welcome back.',signup:'Make room for your week.',reset:'Reset your password.',recovery:'Choose a new password.'})[mode];
  $('submit-login').textContent = ({signin:'Sign in',signup:'Create account',reset:'Send reset link',recovery:'Update password'})[mode];
  $('email-field').hidden = mode === 'recovery';
  $('email').required = mode !== 'recovery';
  $('password-field').hidden = mode === 'reset';
  $('password').required = mode !== 'reset';
  $('password').minLength = ['signup','recovery'].includes(mode) ? 12 : 1;
  $('password').autocomplete = mode === 'signin' ? 'current-password' : 'new-password';
  $('name-field').hidden = mode !== 'signup';
  $('dob-field').hidden = mode !== 'signup';
  $('pronouns-field').hidden = mode !== 'signup';
  $('photo-field').hidden = mode !== 'signup';
  $('photo-help').hidden = mode !== 'signup';
  $('display-name').required = mode === 'signup';
  if (mode === 'signup') $('dob').max = new Date().toISOString().slice(0, 10);
  $('password-help').hidden = !['signup','recovery'].includes(mode);
  $('login-error').textContent = '';
  $('login-status').textContent = '';
  document.querySelectorAll('[data-mode]').forEach(button => { button.hidden = button.dataset.mode === mode || mode === 'recovery'; });
  document.title = $('login-title').textContent + ' — Smart Planner';
}
function message(value) { $('login-status').textContent = value; }
function failed(error) {
  $('login-error').textContent = error?.code === 'invalid_credentials' ? 'That email and password did not match. Try again or reset your password.' : error?.message || 'We could not connect. Check your connection and try again.';
}
async function run(action) {
  if (busy) return;
  busy = true;
  document.querySelectorAll('button').forEach(b => b.disabled = true);
  $('login-error').textContent = '';
  try { await action(); } catch(error) { failed(error); }
  finally { busy = false; document.querySelectorAll('button').forEach(b => b.disabled = false); }
}
document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
$('toggle-password').addEventListener('click', () => {
  const show = $('password').type === 'password'; $('password').type = show ? 'text' : 'password';
  $('toggle-password').textContent = show ? 'Hide password' : 'Show password';
  $('toggle-password').setAttribute('aria-pressed',String(show));
});
$('login-form').addEventListener('submit', event => {
  event.preventDefault();
  run(async () => {
    const email=$('email').value.trim(), password=$('password').value;
    if (mode==='reset') {
      const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:callbackURL(true)}); if(error)throw error;
      message('If this address can receive account email, a reset link is on its way. Open it in this same browser tab to finish.');
    } else if(mode==='recovery') {
      const {error}=await client.auth.updateUser({password});if(error)throw error;
      await signOut();setMode('signin');message('Password updated. Sign in with your new password.');
    } else if(mode==='signup') {
      const displayName=$('display-name').value.trim();
      if(!displayName){$('login-error').textContent='Display name is required.';return;}
      const dob=$('dob').value, pronouns=$('pronouns').value.trim().slice(0,80);
      const today=new Date().toISOString().slice(0,10);
      if(dob&&(dob<'1900-01-01'||dob>today)){$('login-error').textContent='Date of birth must be between 1900-01-01 and today.';return;}
      const meta={display_name:displayName};
      if(dob)meta.dob=dob;
      if(pronouns)meta.pronouns=pronouns;
      const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:callbackURL(),data:meta}});if(error)throw error;
      const photo=$('profile-photo').files[0];
      if(data.session){
        if(photo){
          try{
            const cloud=await import('./cloud.js');
            await cloud.uploadAvatar(data.user,photo);
          }catch(photoError){
            message('Account created, but the photo could not be uploaded: '+(photoError.message||'try again in Settings → Profile.'));
            setTimeout(()=>location.replace('planner.html'),2500);return;
          }
        }
        location.replace('planner.html');
      }
      else message('Check your email to confirm your account. Open the confirmation in this same browser tab, then sign in.'+(photo?' Your photo will be added after you confirm your email — Settings → Profile.':'')+' If email is unavailable, contact the project team; do not retry repeatedly.');
    } else {
      const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;
      location.replace('planner.html');
    }
    $('password').value='';
  });
});
for(const provider of ['github','apple','google']) {
  const button=$(`provider-${provider}`);
  button.hidden=!config.providers[provider];
  button.addEventListener('click',()=>run(async()=>{
    const {error}=await client.auth.signInWithOAuth({provider,options:{redirectTo:callbackURL()}});if(error)throw error;
  }));
}
$('provider-note').hidden=config.providers.github||config.providers.apple||config.providers.google;
$('sign-out').addEventListener('click',()=>run(async()=>{await signOut();$('session-note').hidden=true;message('Signed out.');}));
setMode('signin');
(async()=>{
  try {
    // Remove the old demo marker; it has no authentication authority.
    authStorage.removeItem('smart-planner:session:v1');
    const params=new URLSearchParams(location.search);
    const code=params.get('code');
    if(params.has('error'))throw new Error('Sign-in was not completed. Try again or choose email sign-in.');
    if(code){
      const {error}=await client.auth.exchangeCodeForSession(code);
      history.replaceState(null,'',location.pathname+(params.get('flow')==='recovery'?'?flow=recovery':''));
      if(error)throw error;
    }
    const user=await currentUser();
    if(params.get('flow')==='recovery') {
      if(!user)throw new Error('This reset link has expired or was opened in a different tab. Request a new link.');
      setMode('recovery'); message('Enter a new password of at least 12 characters.');
    } else if(user) {
      $('session-note').hidden=false;
      $('signed-in-name').textContent=user.user_metadata?.display_name||user.email||'your account';
      if(code)location.replace('planner.html');
    }
  }catch(error){failed(error);}
})();
