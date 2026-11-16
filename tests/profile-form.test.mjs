import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {pathToFileURL} from 'node:url';

test('profile consent, removal, safe rendering and persistence failure',async()=>{
 const dom=new JSDOM('<a data-profile-link hidden></a><div id="profile-editor"></div>',{url:'http://localhost/'});
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,CustomEvent:dom.window.CustomEvent});
 let writes=[],fail=false;
 globalThis.profileTestClient={from:()=>({upsert:async payload=>{writes.push(payload);return {error:fail?{message:'Offline'}:null};}})};
 let source=fs.readFileSync('docs/profile.js','utf8').replace("import { client, currentUser } from './auth.js';",'const client=globalThis.profileTestClient; const currentUser=async()=>null;');
 for(const file of ['data.js','profile-validation.js'])source=source.replace(`'./${file}'`,JSON.stringify(pathToFileURL(process.cwd()+'/docs/'+file).href));
 const {mountProfileForm,paintProfile}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const user={id:'fixture',user_metadata:{}};const profile={display_name:'<img src=x onerror=alert(1)>',avatar:'',dob:null};
 mountProfileForm(user,profile);paintProfile(user,profile);
 assert.equal(document.querySelectorAll('img').length,0);
 let form=document.querySelector('form');assert.equal(form.elements.dob_consent.checked,false);
 form.elements.dob.value='2000-01-01';
 const submit=async()=>{form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));await new Promise(r=>setTimeout(r,0));};
 await submit();assert.equal(writes.at(-1).dob,null);assert.equal(form.elements.dob.value,'');
 form.elements.dob.value='2000-01-01';form.elements.dob_consent.checked=true;await submit();assert.equal(writes.at(-1).dob,'2000-01-01');
 form.elements.dob_consent.checked=false;form.elements.remove_avatar.checked=true;await submit();assert.equal(writes.at(-1).dob,null);assert.equal(writes.at(-1).avatar,'');
 assert.deepEqual(Object.keys(writes.at(-1)).sort(),['avatar','display_name','dob','id']);
 fail=true;form.elements.display_name.value='Unsaved';await submit();assert.notEqual(profile.display_name,'Unsaved');assert.equal(document.querySelector('[role=status]').textContent,'Offline');assert.equal(form.querySelector('button').disabled,false);
 paintProfile(null);assert.equal(document.querySelector('[data-profile-link]').hidden,true);
 delete globalThis.profileTestClient;dom.window.close();
});
