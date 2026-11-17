import { client, currentUser } from './auth.js';
import { escapeHTML } from './data.js';
import { validDOB, safeAvatar } from './profile-validation.js';
export async function loadProfile(user, includeDOB = false) {
  const {data,error} = await client.from('account_details').select(includeDOB ? 'display_name,avatar,dob' : 'display_name,avatar').eq('id',user.id).maybeSingle();
  if(error) throw error;
  return data || {display_name:user.user_metadata?.display_name || '',avatar:'',dob:null};
}
export function paintProfile(user, profile) {
  document.querySelectorAll('[data-profile-link]').forEach(link=>{
    link.hidden=!user; link.replaceChildren();
    if(!user)return;
    const avatar=safeAvatar(profile?.avatar);
    if(avatar){const img=document.createElement('img');img.src=avatar;img.alt='';link.append(img);}
    else link.textContent=(profile?.display_name || user.user_metadata?.display_name || 'Me').slice(0,2).toUpperCase();
  });
}
async function avatarFile(file) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('Choose a JPG, PNG or WebP image under 5 MB.');
  const bitmap=await createImageBitmap(file);
  try {
    const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
    const ctx=canvas.getContext('2d');const size=Math.min(bitmap.width,bitmap.height);
    ctx.drawImage(bitmap,(bitmap.width-size)/2,(bitmap.height-size)/2,size,size,0,0,128,128);
    const result=canvas.toDataURL('image/jpeg',0.8);
    if(!safeAvatar(result))throw new Error('Image is too large. Choose a simpler photo.');
    return result;
  } finally {bitmap.close();}
}
export function mountProfileForm(user,profile) {
  const host=document.getElementById('profile-editor');if(!host||!user)return;
  host.innerHTML=`<form id="profile-form"><label class="field">Display name<input name="display_name" maxlength="120" autocomplete="nickname" value="${escapeHTML(profile.display_name||'')}"></label><label class="field">Profile photo<input name="avatar" type="file" accept="image/jpeg,image/png,image/webp"></label><label><input name="remove_avatar" type="checkbox"> Remove current photo</label><p class="form-help">Photos are resized and stripped of file metadata. Only your account can read them.</p><label class="field">Date of birth (optional)<input name="dob" type="date" min="1900-01-01" max="${new Date().toISOString().slice(0,10)}" value="${escapeHTML(profile.dob||'')}"></label><label><input name="dob_consent" type="checkbox" ${profile.dob?'checked':''}> Save my birth date privately with my account</label><p class="form-help">Your planner does not need your birthday. Leave it blank or uncheck consent to remove it. It is never added to public profiles, sign-in tokens, AI requests or calendar exports.</p><button class="button" type="submit">Save profile</button><p role="status" id="profile-status"></p></form>`;
  const form=host.querySelector('form');
  form.addEventListener('submit',async event=>{
    event.preventDefault();const status=host.querySelector('[role=status]');const button=form.querySelector('button');button.disabled=true;
    try {
      const dob=form.elements.dob_consent.checked ? form.elements.dob.value || null : null;
      if(!validDOB(dob))throw new Error('Enter a valid birth date that is not in the future.');
      let avatar=form.elements.remove_avatar.checked?'':profile.avatar||'';
      if(form.elements.avatar.files[0]&&!form.elements.remove_avatar.checked)avatar=await avatarFile(form.elements.avatar.files[0]);
      const next={id:user.id,display_name:form.elements.display_name.value.trim(),avatar,dob};
      const {error}=await client.from('account_details').upsert(next,{onConflict:'id'});if(error)throw error;
      Object.assign(profile,next);form.elements.avatar.value='';form.elements.dob.value=dob||'';
      paintProfile(user,profile);window.dispatchEvent(new CustomEvent('profile-updated',{detail:profile}));status.textContent='Profile saved.';
    }catch(error){status.textContent=error.message?.includes('account_details')?'Profile setup is pending. Ask the team to apply the reviewed account-details migration.':error.message||'Profile could not be saved. Try again.';}
    finally {button.disabled=false;}
  });
}
export async function initHeader() {
  try { const user=await currentUser();if(!user){paintProfile(null);return;}
    let profile;try{profile=await loadProfile(user);}catch{profile=null;}
    paintProfile(user,profile);
    document.querySelectorAll('a[href="login.html"]').forEach(a=>{if(a.textContent.includes('Open planner'))a.href='planner.html';else if(a.textContent.trim()==='Sign in'){a.href='planner.html#settings';a.textContent='Account settings';}});
  }catch{paintProfile(null);}
}
