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
  const themeChoice = (() => { try { return localStorage.getItem('smart-planner:theme:v1') || 'system'; } catch { return 'system'; } })();
  let remindersOn = false; try { remindersOn = localStorage.getItem('smart-planner:reminders:v1') === 'true'; } catch {}
  const notifiedEvents = new Set();
  const aiStore = { get() { try { const raw = localStorage.getItem('smart-planner:ai:v1'); if (raw) return JSON.parse(raw); } catch {} try { const raw = sessionStorage.getItem('smart-planner:ai:v1'); if (raw) return JSON.parse(raw); } catch {} return { provider: 'none', model: '', keep: false, key: '' }; }, save(s) { try { localStorage.removeItem('smart-planner:ai:v1'); sessionStorage.removeItem('smart-planner:ai:v1'); if (s.keep) localStorage.setItem('smart-planner:ai:v1', JSON.stringify(s)); else sessionStorage.setItem('smart-planner:ai:v1', JSON.stringify(s)); } catch {} }, clear() { try { localStorage.removeItem('smart-planner:ai:v1'); sessionStorage.removeItem('smart-planner:ai:v1'); } catch {} } };
  async function callAI(prompt) { const s = aiStore.get(); if (s.provider === 'openai') { if (!s.key || !s.model) throw new Error('Add an OpenAI key and model name in Settings first.'); const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + s.key }, body: JSON.stringify({ model: s.model, messages: [{ role: 'system', content: 'You are a calm planning assistant. Be brief and practical.' }, { role: 'user', content: prompt }], temperature: 0.7, max_tokens: 500 }) }); if (!res.ok) throw new Error('OpenAI returned ' + res.status + '. Check the key and model name.'); const j = await res.json(); return j.choices && j.choices[0] && j.choices[0].message ? j.choices[0].message.content : 'No reply returned.'; } if (s.provider === 'anthropic') { if (!s.key || !s.model) throw new Error('Add a Claude key and model name in Settings first.'); const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': s.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify({ model: s.model, max_tokens: 500, messages: [{ role: 'user', content: prompt }] }) }); if (!res.ok) throw new Error('Claude returned ' + res.status + '. Check the key and model name.'); const j = await res.json(); return j.content ? j.content.map(c => c.text || '').join('') : 'No reply returned.'; } throw new Error('Choose ChatGPT or Claude in Settings first. Siri has no web API key option here.'); }
  function checkReminders() { if (!remindersOn || !('Notification' in window) || Notification.permission !== 'granted') return; const now = new Date(); data.events.filter(e => e.date === dateKey(today)).forEach(e => { const start = new Date(e.date + 'T' + e.start + ':00'); const diff = (start - now) / 60000; if (diff >= 0 && diff <= 15 && !notifiedEvents.has(e.id)) { notifiedEvents.add(e.id); try { new Notification(e.title, { body: 'Starts at ' + e.start }); } catch {} } }); }
  let saving = false;
  let initialMessage = '';
  try {
    const saved = localStorage.getItem(STORAGE);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (validData(parsed)) { if(guest){data=normalize(parsed);saving=true;}else migrationData=normalize(parsed); }
      else initialMessage = 'Saved data could not be read. Your original saved data has not been changed. You can clear it in Settings.';
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
    const names = {today:'Your day',calendar:'Your week',tasks:'Your tasks',settings:'Settings'};
    document.title = `${names[active]} — Smart Planner`;
    const events = data.events.filter(event=>event.date===dateKey(today)).sort((a,b)=>a.start.localeCompare(b.start));
    const tasks = data.tasks.filter(task=>!task.done).sort((a,b)=>a.date.localeCompare(b.date));
    if (active==='today') {
      const minutes = events.reduce((sum,event)=>sum+(Number(event.end.slice(0,2))*60+Number(event.end.slice(3)))-(Number(event.start.slice(0,2))*60+Number(event.start.slice(3))),0);
      el('view').innerHTML = heading(`A little clarity for your ${today.toLocaleDateString(undefined,{weekday:'long'})}.`,today.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'}),eventButton)+`${session && session.welcome ? `<section class="welcome" role="status"><div><strong>${greeting()}, ${text(session.name)}.</strong><span>Welcome back — here is your day at a glance.</span></div><button class="icon-button" data-action="dismiss-welcome" aria-label="Dismiss welcome">×</button></section>` : ''}<div class="stats"><div class="stat"><strong>${events.length}</strong><span>events today</span></div><div class="stat"><strong>${Math.floor(minutes/60)}h ${minutes%60}m</strong><span>scheduled today</span></div><div class="stat"><strong>${tasks.length}</strong><span>tasks to work on</span></div></div><div class="dashboard-grid"><section class="panel"><div class="panel-heading"><h2>Your day</h2><a href="#calendar">See your week ↗</a></div>${events.length?events.map(eventMarkup).join(''):'<div class="empty"><strong>Your first week starts here.</strong><br>1. Add a class or shift with “Add event.”<br>2. Add one task to focus on.<br>3. Visit Settings to try an example week, export your calendar, or delete data.</div>'}</section><div><section class="callout"><h2>A little breathing room.</h2><p>You don't need to fill every hour. Leave some space for yourself, too.</p></section><section class="panel"><div class="panel-heading"><h2>One thing at a time.</h2><a href="#tasks">All tasks ↗</a></div>${tasks.length?tasks.slice(0,3).map(taskMarkup).join(''):'<p>No unfinished tasks. Enjoy the space.</p>'}<button class="button secondary small" data-action="add-task">+ Add task</button></section></div></div><section class="callout"><h2>Your plans, your choice.</h2><p>${guest?(saving?'Local demo · device saving is on.':'Local demo · plans stay in this tab until you save them.'):'Signed-in plans are stored in your Supabase account.'} Live calendar connections are not active. Reminders and AI help are opt-in in <a href="#settings">Settings</a>.</p></section>`;
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
      el('view').innerHTML=heading('Make yourself comfortable.','Your planner, your preferences.')+`<section class="panel"><h2>Appearance</h2><p id="theme-status" role="status">Theme: ${themeChoice}. Saved on this device only, not in your account.</p><div class="settings-options"><div class="preference"><input id="theme-system" type="radio" name="theme-choice" value="system" data-theme-option ${themeChoice==='system'?'checked':''}><label for="theme-system">System<small>Follow your device light/dark setting.</small></label></div><div class="preference"><input id="theme-light" type="radio" name="theme-choice" value="light" data-theme-option ${themeChoice==='light'?'checked':''}><label for="theme-light">Light<small>Always light, even if your device is dark.</small></label></div><div class="preference"><input id="theme-dark" type="radio" name="theme-choice" value="dark" data-theme-option ${themeChoice==='dark'?'checked':''}><label for="theme-dark">Dark<small>Always dark, even if your device is light.</small></label></div></div><p class="form-help">You can also change theme with the sun/moon button at the top of every page. It cycles System, Light, then Dark.</p><h3 class="settings-sub">Display & comfort</h3><div class="preference"><input id="solid-mode" type="checkbox" data-solid ${document.documentElement.classList.contains('solid')?'checked':''}><label for="solid-mode">Accessible solid mode<small>Solid backgrounds, stronger borders, underlined links, and no decorative tilts or shadows.</small></label></div><p id="preference-status" role="status"></p><p>The welcome message uses a short, optional transition. There is no auto-playing media. System reduced-motion and increased-contrast preferences are supported.</p><a href="accessibility.html">Read our accessibility statement ↗</a></section><section class="panel"><h2>Notifications</h2><p id="notification-status" role="status">Notifications: ${'Notification' in window ? Notification.permission : 'not supported in this browser'}.</p><p>Notifications in this preview work while the planner is open in Safari or another modern browser. Remote push when the tab is closed is not included. That needs a service worker, VAPID keys, and a Supabase Edge Function to send messages, which is future work, not a switch on this page. Supabase itself does not send browser push notifications on its own.</p><div class="form-actions"><button class="button secondary" data-action="enable-notifications">Enable notifications</button><button class="button secondary" data-action="test-notification">Send a test notification</button></div><div class="preference"><input id="event-reminders" type="checkbox" ${remindersOn?'checked':''}><label for="event-reminders">Remind me about events starting soon<small>While the planner is open, check for events starting in the next 15 minutes and notify once per event. Turn this off here, or turn notifications off in your browser or system settings, to stop them.</small></label></div><p class="form-help">In Safari on macOS, allow notifications when asked. On iPhone or iPad, web notifications need iOS 16.4 or later and the site added to the Home Screen as a web app.</p></section><section class="panel"><h2>AI assistant — bring your own key</h2><p>Optional, for a pitch demo only. No key is stored in Supabase, in the repo, or in your planner data. A key you enter here is sent only from your browser to the provider you choose, and only when you click Test or Ask. Your planner data is sent to that provider only when you click Ask — never automatically.</p>${(() => { const ai = aiStore.get(); return `<label class="field">Provider<select id="ai-provider"><option value="none" ${ai.provider==='none'?'selected':''}>No AI assistant</option><option value="openai" ${ai.provider==='openai'?'selected':''}>ChatGPT (OpenAI)</option><option value="anthropic" ${ai.provider==='anthropic'?'selected':''}>Claude (Anthropic)</option><option value="siri" disabled>Siri — not available for web</option></select></label><label class="field">Model name<input id="ai-model" value="${text(ai.model)}" placeholder="For example, a model name from your provider" autocomplete="off"></label><label class="field">API key<input id="ai-key" type="password" placeholder="Paste your key here — it is not shown back after saving" autocomplete="off"></label><p class="form-help">${ai.key ? 'Key saved in this browser, ending …' + text(ai.key.slice(-4)) + '. Leave the key field blank to keep it.' : 'No key saved yet.'} Siri has no public web API and no key field here. On Apple devices, use Siri or Shortcuts separately; a future native app could use App Intents, not a web key.</p><div class="preference"><input id="ai-keep" type="checkbox" ${ai.keep?'checked':''}><label for="ai-keep">Keep this key in this browser<small>Unchecked means the key lives only in this tab and is cleared when the tab closes. Do not use a shared computer, do not share the key in chat or in the repo, and set a spending limit with your provider.</small></label></div>`; })()}<div class="form-actions"><button class="button secondary" data-action="save-ai">Save AI settings</button><button class="button secondary" data-action="test-ai">Test connection</button><button class="button secondary danger" data-action="clear-ai">Clear key</button><button class="button" data-action="ask-ai">Ask AI about my week</button></div><p id="ai-status" role="status"></p><div id="ai-result"></div><p class="form-help">Ask uses only titles, dates, times, and categories from your current events and unfinished tasks. It does not send locations, emails, or account details. AI replies can be wrong — check deadlines yourself.</p></section><section class="panel"><h2>Privacy & your data</h2>${guest?`<div class="preference"><input id="save-device" type="checkbox" ${saving?'checked':''}><label for="save-device">Save my planner on this device<small>Optional browser storage. Anyone using this browser profile may be able to see your plans. No data is sent to us.</small></label></div>`:`<p>Changes sync to your signed-in account. Reload to see updates from another device. Sessions stay in this browser tab.</p>${migrationData&&!migrationPending?'<button class="button secondary" data-action="migrate">Import existing local plans into my account</button><p class="form-help">Only import plans that belong to you. Your local copy is removed only after a successful cloud save.</p>':''}`}<div class="form-actions"><button class="button secondary" data-action="export-calendar">Export calendar (.ics)</button><button class="button secondary danger" data-action="clear">Delete planner data</button></div><p class="form-help">Calendar files contain events only. Tasks are not included in .ics files. Exported files may contain personal information. Store and share them carefully.</p><label class="field">Import a calendar (.ics) file<input id="import-ics-file" type="file" accept=".ics,text/calendar"></label><p class="form-help">${guest?'Imports stay in this browser.':'Imported events are saved to your signed-in account.'} Imported events are checked before use. New events are added; existing events are not replaced and duplicates are skipped. Only the title, date, start, end, and location are kept, with a category matched when the file names one.</p><a href="privacy.html">Read the privacy notice ↗</a></section><section class="panel"><h2>Try an example student week</h2><p>Fictional UC student plans: classes, a work shift, a lab deadline, and downtime this week. Your existing plans stay in place.</p><button class="button secondary" data-action="sample">Add example week</button></section>${guest?'':'<section class="panel"><h2>Delete your account</h2><p>Permanently delete your profile, cloud plans, and sign-in account. Export first. Other tabs and downloaded copies must be closed or deleted separately.</p><button class="button secondary danger" data-action="delete-account">Delete account…</button></section>'}`;
    }
    refreshControls();
    checkReminders();
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
    else if(action==='export-calendar')calendarExport();
    else if(action==='enable-notifications'){ if(!('Notification' in window)){announce('Notifications are not supported in this browser.');} else { const permission = await Notification.requestPermission(); render(); announce(permission==='granted'?'Notifications enabled. Try a test notification.':'Notifications are ' + permission + '. You can change this in your browser or system settings.'); } }
    else if(action==='test-notification'){ if(!('Notification' in window)){announce('Notifications are not supported in this browser.');} else if(Notification.permission!=='granted'){announce('Enable notifications first.');} else { try { new Notification('Smart Planner test', { body: 'Notifications are on. Reminders will appear here while the planner is open.' }); announce('Test notification sent.'); } catch { announce('The test notification could not be shown.'); } } }
    else if(action==='save-ai'){ const provider = el('ai-provider').value; const model = el('ai-model').value.trim(); const keyInput = el('ai-key').value.trim(); const keep = el('ai-keep').checked; const existing = aiStore.get(); const key = keyInput || (provider === existing.provider ? existing.key : ''); if (provider !== 'none' && !key) { announce('Paste an API key, or choose No AI assistant.'); } else { aiStore.save({ provider, model, keep, key: provider === 'none' ? '' : key }); render(); announce(provider === 'none' ? 'AI assistant turned off.' : 'AI settings saved. The key is not sent to Supabase.'); } }
    else if(action==='clear-ai'){ aiStore.clear(); render(); announce('AI key removed from this browser.'); }
    else if(action==='test-ai'){ try { const reply = await callAI('Reply with one short sentence: AI connection test.'); const status = el('ai-status'); if (status) status.textContent = 'Connection worked.'; const result = el('ai-result'); if (result) result.textContent = reply; } catch (error) { announce('AI test failed: ' + error.message + ' Keys are not sent to Supabase.'); } }
    else if(action==='ask-ai'){ try { const todayEvents = data.events.filter(e => e.date === dateKey(today)).sort((a,b) => a.start.localeCompare(b.start)); const openTasks = data.tasks.filter(t => !t.done); const prompt = 'Summarize my week in 3 short bullets: what is busiest, what needs attention first, and one small next step. Do not invent events. Events today: ' + (todayEvents.length ? todayEvents.map(e => e.title + ' ' + e.start + '-' + e.end + ' ' + categories[e.category][0]).join('; ') : 'none') + '. Unfinished tasks: ' + (openTasks.length ? openTasks.map(t => t.title + ' ' + t.date).join('; ') : 'none') + '.'; const reply = await callAI(prompt); const status = el('ai-status'); if (status) status.textContent = 'AI reply below. Check deadlines yourself.'; const result = el('ai-result'); if (result) result.textContent = reply; } catch (error) { announce('AI ask failed: ' + error.message); } }
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
    else if(target.id==='import-ics-file'){
      const file=target.files[0];if(!file)return;
      if(file.size>2*1024*1024){announce('Calendar import must be smaller than 2 MB.');target.value='';return;}
      try{
        const unfolded=(await file.text()).replace(/\r\n[ \t]/g,'').replace(/\n[ \t]/g,'');
        const lines=unfolded.split(/\r\n|\n|\r/);
        const unescape=value=>value.replace(/\\n/gi,' ').replace(/\\;/g,';').replace(/\\,/g,',').replace(/\\\\/g,'\\');
        const parseICSDateTime=raw=>{if(!raw)return null;const m=raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?Z?$/);if(!m)return null;const utc=raw.endsWith('Z');if(utc){const d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5]));return{date:dateKey(d),time:String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};}return{date:`${m[1]}-${m[2]}-${m[3]}`,time:`${m[4]}:${m[5]}`};};
        const catFrom=value=>{const v=String(value||'').toLowerCase();if(v.includes('focus'))return 'focus';if(v.includes('work'))return 'work';if(v.includes('personal'))return 'personal';return 'class';};
        const existingIds=new Set(data.events.map(e=>e.id));
        const existingKeys=new Set(data.events.map(e=>`${e.title}|${e.date}|${e.start}|${e.end}`));
        const imported=[];let skipped=0;let inEvent=false;let props={};
        const flush=()=>{if(!inEvent)return;inEvent=false;const start=parseICSDateTime(props.DTSTART);const end=parseICSDateTime(props.DTEND);const title=unescape(props.SUMMARY||'').trim();const location=unescape(props.LOCATION||'').trim().slice(0,120);if(!start||!end||!validTitle(title)||!validDate(start.date)||!validTime(start.time)||!validTime(end.time)||end.time<=start.time||start.date!==end.date){skipped++;return;}const rawId=String(props.UID||'').split('@')[0];const id=/^[a-zA-Z0-9-]{1,60}$/.test(rawId)?rawId:uid();const event={id,title,date:start.date,start:start.time,end:end.time,category:catFrom(props.CATEGORIES),location};if(existingIds.has(id)||existingKeys.has(`${title}|${event.date}|${event.start}|${event.end}`)){skipped++;return;}existingIds.add(id);existingKeys.add(`${title}|${event.date}|${event.start}|${event.end}`);imported.push(event);};
        for(const line of lines){if(line==='BEGIN:VEVENT'){inEvent=true;props={};continue;}if(line==='END:VEVENT'){flush();continue;}if(!inEvent)continue;const idx=line.indexOf(':');if(idx<0)continue;const keyPart=line.slice(0,idx);const key=keyPart.split(';')[0].toUpperCase();const value=line.slice(idx+1);if(key==='DTSTART'||key==='DTEND'||key==='SUMMARY'||key==='LOCATION'||key==='UID'||key==='CATEGORIES')props[key]=value;}
        flush();
        if(!imported.length){announce(skipped?`No new events found. ${skipped} event(s) were skipped because they were duplicates, all-day, or invalid.`:'No events found in that calendar file.');return;}
        const room=1000-data.events.length;const toAdd=imported.slice(0,room);if(toAdd.length<imported.length)skipped+=imported.length-toAdd.length;
        data.events.push(...toAdd);
        await changed(`Imported ${toAdd.length} event(s) from your calendar file.${skipped?` ${skipped} skipped.` : ''} Tasks are not included in .ics files.`);
      }catch(error){announce('That calendar file could not be imported. Use a .ics file exported from Smart Planner or another calendar.');}finally{target.value='';}
    }
    else if(target.id==='event-reminders'){ remindersOn = target.checked; try { localStorage.setItem('smart-planner:reminders:v1', String(remindersOn)); } catch {} announce(remindersOn ? 'Event reminders on while the planner is open.' : 'Event reminders off.'); checkReminders(); }
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
    window.addEventListener('hashchange',()=>navigate(true));navigate();setInterval(checkReminders, 60000);if(initialMessage)announce(initialMessage);
  }catch(error){
    announce('We could not load your account. Your cloud plans have not been changed. Check your connection and sign in again.');
    el('view').innerHTML='<h1>Let’s reconnect.</h1><p>Your saved plans stay in your account.</p><a class="button" href="login.html">Back to sign in</a> <a class="button secondary" href="planner.html?guest=1">Try the local demo</a>';
  }
})();
