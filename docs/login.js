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
      const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:callbackURL(),data:{display_name:$('display-name').value.trim()}}});if(error)throw error;
      if(data.session)location.replace('planner.html');
      else message('Check your email to confirm your account. Open the confirmation in this same browser tab, then sign in. If email is unavailable, contact the project team; do not retry repeatedly.');
    } else {
      const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;
      location.replace('planner.html');
    }
    $('password').value='';
  });
});
for(const provider of ['google','apple']) {
  const button=$(`provider-${provider}`);
  button.hidden=!config.providers[provider];
  button.addEventListener('click',()=>run(async()=>{
    const {error}=await client.auth.signInWithOAuth({provider,options:{redirectTo:callbackURL()}});if(error)throw error;
  }));
}
$('provider-note').hidden=config.providers.google&&config.providers.apple;
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
