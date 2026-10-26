import { categories, dateKey, validDate, validTime, validTitle, validData, normalize, escapeHTML, escapeICS } from './data.js';
(async () => {
  const STORAGE = 'smart-planner:data:v1';
  const guest = new URLSearchParams(location.search).get('guest') === '1';
  let auth, cloud, user=null, revision=0, pending=false, dirty=false, welcome=true;
  let migrationData=null, migrationPending=false;
  const getSession=()=>user?{name:user.user_metadata?.display_name||user.email||'there',welcome}:null;
  const saveSession=session=>{welcome=session.welcome;};
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
  const el = id => document.getElementById(id);
  const today = new Date();
  const parseDate = date => new Date(`${date}T12:00:00`);
  const formatDate = (date, options) => parseDate(date).toLocaleDateString(undefined, options);
  const uid = () => crypto.randomUUID();
  const text=escapeHTML;
  let data = {version:1, events:[], tasks:[]};
  let saving = false;
  let initialMessage = '';
  try {
    const saved = localStorage.getItem(STORAGE);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (validData(parsed)) { if(guest){data=normalize(parsed);saving=true;}else migrationData=normalize(parsed); }
      else initialMessage = 'Saved data could not be read. Your original saved data has not been changed. You can clear it in Preferences.';
    }
  } catch { initialMessage = 'Browser storage is unavailable or unreadable. You can plan in this tab and export a copy.'; }
  let active = 'today';
  let weekOffset = 0;
  let editing = null;
  let kind = 'event';
  let opener = null;
  const announce = message => { el('status').textContent = message; };
  function persist() {
    if (!saving) return true;
    try { localStorage.setItem(STORAGE, JSON.stringify(data)); return true; }
    catch { saving = false; return false; }
  }
  function refreshControls() {
    document.querySelectorAll('#view button, #view input, #view select, #editor button, #editor input, #editor select, #confirm-clear').forEach(control=>{control.disabled=pending;});
    const retry=el('retry-save'), reload=el('reload-cloud');
    retry.hidden=guest||!dirty;reload.hidden=guest||!dirty;retry.disabled=pending;reload.disabled=pending;
    el('sync-state').textContent=guest?'Local demo':pending?'Saving…':dirty?'Not saved': 'Saved to your account';
  }
  async function changed(message) {
    if(guest){const success=persist();render();announce(success?message+(saving?' Saved on this device.':' Kept in this tab. Export or enable device saving to keep your plans.'):'Kept in this tab only. Browser storage failed; export a copy.');return success;}
    dirty=true;pending=true;render();announce('Saving your changes…');
    try{
      revision=await cloud.savePlanner(data,revision);dirty=false;
      if(migrationPending){
        migrationPending=false;migrationData=null;
        try{localStorage.removeItem(STORAGE);}catch{announce('Plans saved to your account. The old local copy could not be cleared; remove site data in browser settings.');return true;}
      }
      announce(message+' Saved to your account.');return true;
    }catch(error){announce('Not saved yet. '+(error.code==='40001'?error.message:'Check your connection and retry. If the request reached the server, reload may be required. Export your unsaved plans before reloading.'));return false;}
    finally{pending=false;refreshControls();}
  }
  function heading(title, subtitle, action = '') { return `<div class="page-heading"><div><p class="eyebrow">A LITTLE CLARITY</p><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`; }
  const eventButton = '<button class="button" data-action="add-event">+ Add event</button>';
  function eventMarkup(event) { return `<article class="schedule-item ${categories[event.category][1]}"><div><h3>${text(event.title)}</h3><p>${event.start}–${event.end} · ${categories[event.category][0]}${event.location ? ' · '+text(event.location) : ''}</p></div><button data-action="edit-event" data-id="${event.id}" aria-label="Edit ${text(event.title)}">Edit</button></article>`; }
  function taskMarkup(task) { return `<div class="task-row"><input type="checkbox" id="task-${task.id}" data-task="${task.id}" ${task.done?'checked':''}><label for="task-${task.id}">${text(task.title)}<small>${formatDate(task.date,{month:'short',day:'numeric'})} · ${categories[task.category][0]}${task.date<dateKey(today)&&!task.done?' · Overdue':''}</small></label><button class="icon-button" data-action="edit-task" data-id="${task.id}" aria-label="Edit ${text(task.title)}">✎</button></div>`; }
  function render() {
    const session = getSession();
    const account = el('account-area');
    if (account) account.innerHTML = session ? `Signed in as <strong>${text(session.name)}</strong> · <button type="button" id="account-sign-out" class="text-link">Sign out</button>` : `<a href="login.html">Sign in</a> · Local demo`;
    document.querySelectorAll('[data-view]').forEach(link => { if(link.dataset.view===active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
    const names = {today:'Your day',calendar:'Your week',tasks:'Your tasks',settings:'Preferences'};
    document.title = `${names[active]} — Smart Planner`;
    const events = data.events.filter(event=>event.date===dateKey(today)).sort((a,b)=>a.start.localeCompare(b.start));
    const tasks = data.tasks.filter(task=>!task.done).sort((a,b)=>a.date.localeCompare(b.date));
    if (active==='today') {
      const minutes = events.reduce((sum,event)=>sum+(Number(event.end.slice(0,2))*60+Number(event.end.slice(3)))-(Number(event.start.slice(0,2))*60+Number(event.start.slice(3))),0);
      el('view').innerHTML = heading(`A little clarity for your ${today.toLocaleDateString(undefined,{weekday:'long'})}.`,today.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'}),eventButton)+`${session && session.welcome ? `<section class="welcome" role="status"><div><strong>${greeting()}, ${text(session.name)}.</strong><span>Welcome back — here is your day at a glance.</span></div><button class="icon-button" data-action="dismiss-welcome" aria-label="Dismiss welcome">×</button></section>` : ''}<div class="stats"><div class="stat"><strong>${events.length}</strong><span>events today</span></div><div class="stat"><strong>${Math.floor(minutes/60)}h ${minutes%60}m</strong><span>scheduled today</span></div><div class="stat"><strong>${tasks.length}</strong><span>tasks to work on</span></div></div><div class="dashboard-grid"><section class="panel"><div class="panel-heading"><h2>Your day</h2><a href="#calendar">See your week ↗</a></div>${events.length?events.map(eventMarkup).join(''):'<div class="empty"><strong>Your first week starts here.</strong><br>1. Add a class or shift with “Add event.”<br>2. Add one task to focus on.<br>3. Visit Preferences to try an example week, export your plans, or delete data.</div>'}</section><div><section class="callout"><h2>A little breathing room.</h2><p>You don't need to fill every hour. Leave some space for yourself, too.</p></section><section class="panel"><div class="panel-heading"><h2>One thing at a time.</h2><a href="#tasks">All tasks ↗</a></div>${tasks.length?tasks.slice(0,3).map(taskMarkup).join(''):'<p>No unfinished tasks. Enjoy the space.</p>'}<button class="button secondary small" data-action="add-task">+ Add task</button></section></div></div><section class="callout"><h2>Your plans, your choice.</h2><p>${guest?(saving?'Local demo · device saving is on.':'Local demo · plans stay in this tab until you save them.'):'Signed-in plans are stored in your Supabase account.'} Live calendar connections, reminders, and AI suggestions are not active. <a href="#settings">Manage your data</a>.</p></section>`;
    } else if(active==='tasks') {
      el('view').innerHTML=heading('One thing at a time.','Small steps still move you forward.','<button class="button" data-action="add-task">+ Add task</button>')+'<div class="toolbar"><label class="sr-only" for="task-search">Search tasks</label><input id="task-search" type="search" placeholder="Find a task…" maxlength="120"><label class="sr-only" for="task-filter">Filter tasks</label><select id="task-filter"><option value="all">All tasks</option><option value="open">To do</option><option value="done">Completed</option></select></div><section class="panel" aria-label="Task list"><div id="task-list"></div></section>';
      renderTasks();
    } else if(active==='calendar') {
      const start = new Date(today); start.setDate(start.getDate()-((start.getDay()+6)%7)+weekOffset*7);
      const end = new Date(start); end.setDate(end.getDate()+6);
      let days='';
      for(let i=0;i<7;i++) {
        const date=new Date(start);date.setDate(date.getDate()+i);const key=dateKey(date);
        days+=`<section class="calendar-day ${key===dateKey(today)?'today':''}" aria-label="${text(date.toLocaleDateString(undefined,{dateStyle:'full'}))}"><h2>${date.toLocaleDateString(undefined,{weekday:'short'})}<strong>${date.getDate()}</strong>${key===dateKey(today)?' · Today':''}</h2><button class="icon-button day-add" data-action="add-event-date" data-date="${key}" aria-label="Add event on ${date.toLocaleDateString(undefined,{dateStyle:'full'})}">+</button>${data.events.filter(e=>e.date===key).sort((a,b)=>a.start.localeCompare(b.start)).map(e=>`<button class="calendar-event ${categories[e.category][1]}" data-action="edit-event" data-id="${e.id}">${text(e.title)}<span>${e.start}–${e.end} · ${categories[e.category][0]}</span></button>`).join('')}</section>`;
      }
      el('view').innerHTML=heading('See your whole week.','Your classes, commitments, and a little room for you.',eventButton)+`<div class="toolbar"><button class="icon-button" data-action="prev-week" aria-label="Previous week">←</button><button class="button secondary small" data-action="this-week">This week</button><button class="icon-button" data-action="next-week" aria-label="Next week">→</button><strong id="week-label" tabindex="-1">${start.toLocaleDateString(undefined,{month:'short',day:'numeric'})} – ${end.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</strong></div><div class="calendar-days">${days}</div><p class="calendar-note">Times follow your device’s local time zone. Select an event to edit it.</p>`;
    } else {
      el('view').innerHTML=heading('Make yourself comfortable.','Your planner, your preferences.')+`<section class="panel"><h2>Display & comfort</h2><div class="preference"><input id="solid-mode" type="checkbox" data-solid ${document.documentElement.classList.contains('solid')?'checked':''}><label for="solid-mode">Accessible solid mode<small>Solid backgrounds, stronger borders, underlined links, and no decorative tilts or shadows.</small></label></div><p id="preference-status" role="status"></p><p>The welcome message uses a short, optional transition. There is no auto-playing media. System reduced-motion and increased-contrast preferences are supported.</p><a href="accessibility.html">Read our accessibility statement ↗</a></section><section class="panel"><h2>Privacy & your data</h2>${guest?`<div class="preference"><input id="save-device" type="checkbox" ${saving?'checked':''}><label for="save-device">Save my planner on this device<small>Optional browser storage. Anyone using this browser profile may be able to see your plans. No data is sent to us.</small></label></div>`:`<p>Changes sync to your signed-in account. Reload to see updates from another device. Sessions stay in this browser tab.</p>${migrationData&&!migrationPending?'<button class="button secondary" data-action="migrate">Import existing local plans into my account</button><p class="form-help">Only import plans that belong to you. Your local copy is removed only after a successful cloud save.</p>':''}`}<div class="form-actions"><button class="button secondary" data-action="export">Export JSON</button><button class="button secondary" data-action="export-calendar">Export calendar (.ics)</button><button class="button secondary danger" data-action="clear">Delete planner data</button></div><p class="form-help">Exported files may contain personal information. Store and share them carefully. Calendar exports contain events only; JSON includes tasks and events.</p><label class="field">Import a previously exported JSON file<input id="import-file" type="file" accept="application/json,.json"></label><p class="form-help">${guest?'Imports stay in this browser.':'Imported plans are uploaded to your signed-in account only after confirmation.'} Imported files are checked before use, and only the title, date, time, category, location, and completion fields are kept. Replacing your current plans will ask first.</p><a href="privacy.html">Read the privacy notice ↗</a></section><section class="panel"><h2>Try an example student week</h2><p>Fictional UC student plans: classes, a work shift, a lab deadline, and downtime this week. Your existing plans stay in place.</p><button class="button secondary" data-action="sample">Add example week</button></section>${guest?'':'<section class="panel"><h2>Delete your account</h2><p>Permanently delete your profile, cloud plans, and sign-in account. Export first. Other tabs and downloaded copies must be closed or deleted separately.</p><button class="button secondary danger" data-action="delete-account">Delete account…</button></section>'}`;
    }
    refreshControls();
  }
  function renderTasks() {
    const query=el('task-search').value.toLocaleLowerCase();const filter=el('task-filter').value;
    const matches=data.tasks.filter(t=>t.title.toLocaleLowerCase().includes(query)&&(filter==='all'||(filter==='done'?t.done:!t.done))).sort((a,b)=>a.date.localeCompare(b.date));
    el('task-list').innerHTML=matches.length?matches.map(taskMarkup).join(''):'<div class="empty">No tasks here yet, or no tasks match your search.</div>';
  }
  function openEditor(type,id,presetDate) {
    kind=type;editing=id||null;opener=document.activeElement;
    const item=(kind==='event'?data.events:data.tasks).find(entry=>entry.id===editing);
    const form=el('entry-form');form.reset();el('form-error').textContent='';
    el('editor-title').textContent=`${item?'Edit':'Create'} ${kind==='event'?'an event':'a task'}.`;
    el('entry-kind').textContent=kind;el('delete-entry').hidden=!item;
    el('time-fields').hidden=kind==='task';el('location-field').hidden=kind==='task';
    form.elements.start.required=kind==='event';form.elements.end.required=kind==='event';
    form.elements.title.value=item?.title||'';form.elements.date.value=item?.date||presetDate||dateKey(today);form.elements.category.value=item?.category|| (kind==='task'?'focus':'class');
    form.elements.start.value=item?.start||'09:00';form.elements.end.value=item?.end||'10:00';form.elements.location.value=item?.location||'';
    el('editor').showModal();form.elements.title.focus();
  }
  function closeEditor(){el('editor').close();if(opener?.isConnected)opener.focus();else el('main').focus();}
  el('close-editor').addEventListener('click',closeEditor);el('cancel-editor').addEventListener('click',closeEditor);
  el('entry-form').addEventListener('submit',async event=>{
    event.preventDefault();if(pending)return;const form=event.currentTarget;
    const title=form.elements.title.value.trim(),date=form.elements.date.value,category=form.elements.category.value;
    const start=form.elements.start.value,end=form.elements.end.value;
    let error='';
    if(!validTitle(title)||!validDate(date))error='Enter a title and a valid date between 2000 and 2100.';
    else if(kind==='event'&&(!validTime(start)||!validTime(end)||end<=start))error='End time must be after start time on the same day. Split overnight events across two days.';
    if(error){el('form-error').textContent=error;return;}
    const list=kind==='event'?data.events:data.tasks;
    if(!editing&&list.length>=1000){el('form-error').textContent='This preview supports up to 1,000 entries of each type. Export and remove older entries first.';return;}
    const existing=list.find(item=>item.id===editing);
    const entry={id:editing||uid(),title,date,category,...(kind==='event'?{start,end,location:form.elements.location.value.trim()}:{done:existing?.done||false})};
    const index=list.findIndex(item=>item.id===editing);if(index>=0)list[index]=entry;else list.push(entry);
    const overlap=kind==='event'&&data.events.some(e=>e.id!==entry.id&&e.date===date&&e.start<end&&e.end>start);
    await changed(`${kind==='event'?'Event':'Task'} saved.${overlap?' This overlaps another event; review your calendar.':''}`);closeEditor();
  });
  el('delete-entry').addEventListener('click',async()=>{if(pending)return;if(kind==='event')data.events=data.events.filter(item=>item.id!==editing);else data.tasks=data.tasks.filter(item=>item.id!==editing);await changed('Entry deleted.');closeEditor();});
  function download(content,type,name){const url=URL.createObjectURL(new Blob([content],{type}));const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  const icsEscape=escapeICS;
  function foldLine(line){let result='',chunk='',size=0;for(const c of line){const n=new TextEncoder().encode(c).length;if(size+n>73){result+=chunk+'\r\n ';chunk='';size=1;}chunk+=c;size+=n;}return result+chunk;}
  function calendarExport(){const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Smart Planner//Local Calendar//EN','CALSCALE:GREGORIAN',...data.events.flatMap(e=>['BEGIN:VEVENT',`UID:${e.id}@smart-planner.local`,`DTSTAMP:${stamp}`,`DTSTART:${e.date.replace(/-/g,'')}T${e.start.replace(':','')}00`,`DTEND:${e.date.replace(/-/g,'')}T${e.end.replace(':','')}00`,`SUMMARY:${icsEscape(e.title)}`,`LOCATION:${icsEscape(e.location)}`,'END:VEVENT']),'END:VCALENDAR'];download(lines.map(foldLine).join('\r\n')+'\r\n','text/calendar;charset=utf-8','smart-planner.ics');announce('Calendar exported. Times are floating local times; check the destination calendar’s time zone when importing.');}
  el('view').addEventListener('click',async event=>{
    if(pending)return;
    const button=event.target.closest('[data-action]');if(!button)return;const action=button.dataset.action;
    if(action==='add-event'||action==='add-task')openEditor(action==='add-event'?'event':'task');
    else if(action==='add-event-date')openEditor('event',null,button.dataset.date);
    else if(action==='dismiss-welcome'){const s=getSession();if(s){s.welcome=false;saveSession(s);}render();}
    else if(action==='edit-event'||action==='edit-task')openEditor(action==='edit-event'?'event':'task',button.dataset.id);
    else if(['prev-week','next-week','this-week'].includes(action)){weekOffset=action==='this-week'?0:weekOffset+(action==='prev-week'?-1:1);render();el('week-label').focus();}
    else if(action==='export'){download(JSON.stringify(data,null,2),'application/json','smart-planner.json');announce('Planner exported. Keep this file somewhere private.');}
    else if(action==='export-calendar')calendarExport();
    else if(action==='clear'){opener=button;el('delete-dialog').showModal();el('cancel-clear').focus();}
    else if(action==='migrate') {
      if(migrationPending||!migrationData||!confirm('Add the existing browser-local plans to this signed-in account? Only continue if they belong to you.'))return;
      const imported=normalize(migrationData,{newIds:true});
      if(data.events.length+imported.events.length>1000||data.tasks.length+imported.tasks.length>1000){announce('The combined plans exceed the 1,000 entry limit. Export and reduce them first.');return;}
      data.events.push(...imported.events);data.tasks.push(...imported.tasks);migrationPending=true;await changed('Local plans imported.');
    }
    else if(action==='delete-account'){el('account-delete-dialog').showModal();el('cancel-account-delete').focus();}
    else if(action==='sample'){
      if(data.events.some(e=>e.title==='Example · Database Systems')){announce('The example week is already present.');return;}
      if(data.events.length>995||data.tasks.length>998){announce('There is not enough room for the example week.');return;}
      const monday=new Date(today);monday.setDate(today.getDate()-((today.getDay()+6)%7));
      const day=offset=>{const d=new Date(monday);d.setDate(d.getDate()+offset);return dateKey(d);};
      const examples=[['Database Systems',0,'09:00','09:50','class','Campus classroom'],['Campus café shift',1,'14:00','17:00','work','Campus café'],['Software design lab',2,'11:00','12:30','class','Computer lab'],['Finish SQL lab',3,'15:00','16:00','focus','Library'],['Downtime with friends',5,'13:00','14:00','personal','Campus green']];
      data.events.push(...examples.map(([title,offset,start,end,category,location])=>({id:uid(),title:'Example · '+title,date:day(offset),start,end,category,location})));
      data.tasks.push({id:uid(),title:'Example · SQL lab deadline',date:day(4),category:'class',done:false},{id:uid(),title:'Example · Plan a little downtime',date:day(5),category:'personal',done:false});await changed('Example student week added.');
    }
  });
  el('view').addEventListener('input',event=>{if(event.target.id==='task-search')renderTasks();});
  el('view').addEventListener('change',async event=>{
    if(pending)return;
    const target=event.target;
    if(target.dataset.task){const task=data.tasks.find(t=>t.id===target.dataset.task);if(task){task.done=target.checked;const id=task.id;await changed(task.done?'Task completed.':'Task marked to do.');const checkbox=el('task-'+id);if(checkbox)checkbox.focus();else el('main').focus();}}
    else if(target.id==='task-filter')renderTasks();
    else if(target.id==='import-file'){
      const file=target.files[0];if(!file)return;
      if(file.size>2*1024*1024){announce('Import must be smaller than 2 MB.');target.value='';return;}
      try{
        const imported=normalize(JSON.parse(await file.text()),{newIds:!guest});
        if(pending)return;
        if(!confirm(guest?'Replace current local plans with this file? Export first to keep them.':'Upload this file and replace the plans in your signed-in account? Export first to keep them.'))return;
        data=imported;migrationPending=false;await changed('Plans imported.');
      }catch(error){announce(error.message||'That file could not be imported.');}finally{target.value='';}
    }
    else if(target.id==='save-device'){
      if(target.checked){saving=true;changed('Device saving enabled.');}
      else{try{localStorage.removeItem(STORAGE);saving=false;render();announce('Device saving is off. Your current plans remain in this tab only.');}catch{target.checked=saving;announce('Saved data could not be removed. Clear this site’s storage in your browser settings.');}}
    }
  });
  el('cancel-clear').addEventListener('click',()=>{el('delete-dialog').close();opener?.focus();});
  el('confirm-clear').addEventListener('click',async()=>{
    if(pending)return;
    if(guest){try{localStorage.removeItem(STORAGE);}catch{announce('Browser storage could not be cleared. Use your browser’s website-data settings.');el('delete-dialog').close();return;}saving=false;}
    data={version:1,events:[],tasks:[]};migrationPending=false;el('delete-dialog').close();await changed('Planner data deleted. Downloaded exports and other open tabs are separate copies.');el('main').focus();
  });
  el('retry-save').addEventListener('click',()=>{if(!pending)changed('Changes saved.');});
  el('reload-cloud').addEventListener('click',()=>{if(!pending&&confirm('Discard this tab’s unsaved changes and load the cloud copy? Export first if needed.')){dirty=false;location.reload();}});
  el('cancel-account-delete').addEventListener('click',()=>el('account-delete-dialog').close());
  el('confirm-account-delete').addEventListener('click',async()=>{
    if(pending||guest)return;pending=true;el('confirm-account-delete').disabled=true;
    try{await cloud.deleteAccount();dirty=false;data={version:1,events:[],tasks:[]};document.getElementById('view').replaceChildren();auth.authStorage.removeItem(auth.authStorageKey);location.replace('login.html');}
    catch(error){announce('Account was not deleted: '+error.message);el('account-delete-dialog').close();}
    finally{pending=false;el('confirm-account-delete').disabled=false;}
  });
  window.addEventListener('beforeunload',event=>{if(dirty||pending){event.preventDefault();event.returnValue='';}});
  window.addEventListener('storage',event=>{if(guest&&event.key===STORAGE)announce('Planner storage changed in another tab. This tab still has its current plans. Reload to use the saved version, or export before making more changes.');});
  function navigate(focus=false){active=['today','calendar','tasks','settings'].includes(location.hash.slice(1))?location.hash.slice(1):'today';render();if(focus)el('main').focus();}
  const accountArea=el('account-area');
  accountArea.addEventListener('click',async event=>{
    if(!event.target.closest('#account-sign-out')||pending)return;
    if(dirty&&!confirm('Your changes are not saved. Export them before signing out. Sign out anyway?'))return;
    try{await auth.signOut();dirty=false;data={version:1,events:[],tasks:[]};el('view').replaceChildren();location.replace('login.html');}
    catch(error){announce('Sign-out could not be confirmed. Check your connection and retry.');}
  });
  try{
    if(!guest){
      announce('Loading your account…');
      auth=await import('./auth.js');user=await auth.currentUser();
      if(!user){location.replace('login.html');return;}
      cloud=await import('./cloud.js');
      const loaded=await cloud.loadPlanner(user);data=loaded.data;revision=loaded.revision;
      auth.client.auth.onAuthStateChange((event,session)=>{
        if(event==='SIGNED_OUT'||(session&&session.user.id!==user.id)){
          dirty=false;data={version:1,events:[],tasks:[]};el('view').replaceChildren();location.replace('login.html');
        }
      });
      announce('Your plans are up to date.');
    }
    el('delete-description').textContent=guest?'Remove local planner data from this browser. Downloaded files remain separate.':'Delete every event and task from your signed-in account. Your sign-in account remains. Export first if needed.';
    window.addEventListener('hashchange',()=>navigate(true));navigate();if(initialMessage)announce(initialMessage);
  }catch(error){
    announce('We could not load your account. Your cloud plans have not been changed. Check your connection and sign in again.');
    el('view').innerHTML='<h1>Let’s reconnect.</h1><p>Your saved plans stay in your account.</p><a class="button" href="login.html">Back to sign in</a> <a class="button secondary" href="planner.html?guest=1">Try the local demo</a>';
  }
})();
