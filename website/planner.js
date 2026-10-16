'use strict';
(() => {
  const STORAGE = 'smart-planner:data:v1';
  const el = id => document.getElementById(id);
  const categories = { class: ['Class', 'lavender'], focus: ['Focus', 'green'], work: ['Work', 'peach'], personal: ['Personal', 'blue'] };
  const today = new Date();
  const dateKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const parseDate = date => new Date(`${date}T12:00:00`);
  const formatDate = (date, options) => parseDate(date).toLocaleDateString(undefined, options);
  const uid = () => crypto.randomUUID();
  const text = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const validDate = value => typeof value === 'string' && /^20\d{2}-\d{2}-\d{2}$|^2100-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseDate(value).valueOf()) && dateKey(parseDate(value)) === value;
  const validTime = value => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  const validTitle = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 120;
  const validData = data => data && data.version === 1 && Array.isArray(data.events) && Array.isArray(data.tasks) && data.events.length <= 1000 && data.tasks.length <= 1000 && [...data.events,...data.tasks].every(item => item && typeof item.id === 'string' && /^[a-zA-Z0-9-]{1,60}$/.test(item.id) && validTitle(item.title) && validDate(item.date) && Object.hasOwn(categories,item.category)) && new Set([...data.events,...data.tasks].map(item => item.id)).size === data.events.length+data.tasks.length && data.events.every(item => validTime(item.start) && validTime(item.end) && item.end > item.start && typeof item.location === 'string' && item.location.length <= 120) && data.tasks.every(item => typeof item.done === 'boolean');
  let data = {version:1, events:[], tasks:[]};
  let saving = false;
  let initialMessage = '';
  try {
    const saved = localStorage.getItem(STORAGE);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (validData(parsed)) { data = parsed; saving = true; }
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
  function changed(message) {
    const success = persist();
    render();
    announce(success ? message + (saving ? ' Saved on this device.' : ' Kept in this tab. Export or enable device saving to keep your plans.') : 'Your change is kept in this tab, but browser storage failed. Export a copy before closing.');
  }
  function heading(title, subtitle, action = '') { return `<div class="page-heading"><div><p class="eyebrow">A LITTLE CLARITY</p><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`; }
  const eventButton = '<button class="button" data-action="add-event">+ Add event</button>';
  function eventMarkup(event) { return `<article class="schedule-item ${categories[event.category][1]}"><div><h3>${text(event.title)}</h3><p>${event.start}–${event.end} · ${categories[event.category][0]}${event.location ? ' · '+text(event.location) : ''}</p></div><button data-action="edit-event" data-id="${event.id}" aria-label="Edit ${text(event.title)}">Edit</button></article>`; }
  function taskMarkup(task) { return `<div class="task-row"><input type="checkbox" id="task-${task.id}" data-task="${task.id}" ${task.done?'checked':''}><label for="task-${task.id}">${text(task.title)}<small>${formatDate(task.date,{month:'short',day:'numeric'})} · ${categories[task.category][0]}${task.date<dateKey(today)&&!task.done?' · Overdue':''}</small></label><button class="icon-button" data-action="edit-task" data-id="${task.id}" aria-label="Edit ${text(task.title)}">✎</button></div>`; }
  function render() {
    document.querySelectorAll('[data-view]').forEach(link => { if(link.dataset.view===active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
    const names = {today:'Your day',calendar:'Your week',tasks:'Your tasks',settings:'Preferences'};
    document.title = `${names[active]} — Smart Planner`;
    const events = data.events.filter(event=>event.date===dateKey(today)).sort((a,b)=>a.start.localeCompare(b.start));
    const tasks = data.tasks.filter(task=>!task.done);
    if (active==='today') {
      const minutes = events.reduce((sum,event)=>sum+(Number(event.end.slice(0,2))*60+Number(event.end.slice(3)))-(Number(event.start.slice(0,2))*60+Number(event.start.slice(3))),0);
      el('view').innerHTML = heading(`A little clarity for your ${today.toLocaleDateString(undefined,{weekday:'long'})}.`,today.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'}),eventButton)+`<div class="stats"><div class="stat"><strong>${events.length}</strong><span>events today</span></div><div class="stat"><strong>${Math.floor(minutes/60)}h ${minutes%60}m</strong><span>scheduled today</span></div><div class="stat"><strong>${tasks.length}</strong><span>tasks to work on</span></div></div><div class="dashboard-grid"><section class="panel"><div class="panel-heading"><h2>Your day</h2><a href="#calendar">See your week ↗</a></div>${events.length?events.map(eventMarkup).join(''):'<div class="empty">A fresh page for your day.<br>Add your first event when you’re ready.</div>'}</section><div><section class="callout"><h2>A little breathing room.</h2><p>You don't need to fill every hour. Leave some space for yourself, too.</p></section><section class="panel"><div class="panel-heading"><h2>One thing at a time.</h2><a href="#tasks">All tasks ↗</a></div>${tasks.length?tasks.slice(0,3).map(taskMarkup).join(''):'<p>No unfinished tasks. Enjoy the space.</p>'}<button class="button secondary small" data-action="add-task">+ Add task</button></section></div></div><section class="callout"><h2>Your plans, your choice.</h2><p>${saving?'Device saving is on.':'Plans stay in this tab until you choose to save them.'} No accounts, live calendar connections, reminders, or AI requests are active in this preview. <a href="#settings">Manage your data</a>.</p></section>`;
    } else if(active==='tasks') {
      el('view').innerHTML=heading('One thing at a time.','Small steps still move you forward.','<button class="button" data-action="add-task">+ Add task</button>')+'<div class="toolbar"><label class="sr-only" for="task-search">Search tasks</label><input id="task-search" type="search" placeholder="Find a task…" maxlength="120"><label class="sr-only" for="task-filter">Filter tasks</label><select id="task-filter"><option value="all">All tasks</option><option value="open">To do</option><option value="done">Completed</option></select></div><section class="panel" aria-label="Task list"><div id="task-list"></div></section>';
      renderTasks();
    } else if(active==='calendar') {
      const start = new Date(today); start.setDate(start.getDate()-((start.getDay()+6)%7)+weekOffset*7);
      const end = new Date(start); end.setDate(end.getDate()+6);
      let days='';
      for(let i=0;i<7;i++) {
        const date=new Date(start);date.setDate(date.getDate()+i);const key=dateKey(date);
        days+=`<section class="calendar-day ${key===dateKey(today)?'today':''}" aria-label="${text(date.toLocaleDateString(undefined,{dateStyle:'full'}))}"><h2>${date.toLocaleDateString(undefined,{weekday:'short'})}<strong>${date.getDate()}</strong>${key===dateKey(today)?' · Today':''}</h2>${data.events.filter(e=>e.date===key).sort((a,b)=>a.start.localeCompare(b.start)).map(e=>`<button class="calendar-event ${categories[e.category][1]}" data-action="edit-event" data-id="${e.id}">${text(e.title)}<span>${e.start}–${e.end} · ${categories[e.category][0]}</span></button>`).join('')}</section>`;
      }
      el('view').innerHTML=heading('See your whole week.','Your classes, commitments, and a little room for you.',eventButton)+`<div class="toolbar"><button class="icon-button" data-action="prev-week" aria-label="Previous week">←</button><button class="button secondary small" data-action="this-week">This week</button><button class="icon-button" data-action="next-week" aria-label="Next week">→</button><strong id="week-label" tabindex="-1">${start.toLocaleDateString(undefined,{month:'short',day:'numeric'})} – ${end.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</strong></div><div class="calendar-days">${days}</div><p class="calendar-note">Times follow your device’s local time zone. Select an event to edit it.</p>`;
    } else {
      el('view').innerHTML=heading('Make yourself comfortable.','Your planner, your preferences.')+`<section class="panel"><h2>Display & comfort</h2><div class="preference"><input id="solid-mode" type="checkbox" data-solid ${document.documentElement.classList.contains('solid')?'checked':''}><label for="solid-mode">Accessible solid mode<small>Solid backgrounds, stronger borders, underlined links, and no decorative tilts or shadows.</small></label></div><p id="preference-status" role="status"></p><p>There are no animated or auto-playing elements. System reduced-motion and increased-contrast preferences are supported.</p><a href="accessibility.html">Read our accessibility statement ↗</a></section><section class="panel"><h2>Privacy & your data</h2><div class="preference"><input id="save-device" type="checkbox" ${saving?'checked':''}><label for="save-device">Save my planner on this device<small>Optional browser storage. Anyone using this browser profile may be able to see your plans. No data is sent to us.</small></label></div><div class="form-actions"><button class="button secondary" data-action="export">Export JSON</button><button class="button secondary" data-action="export-calendar">Export calendar (.ics)</button><button class="button secondary danger" data-action="clear">Delete planner data</button></div><p class="form-help">Exported files may contain personal information. Store and share them carefully. Calendar exports contain events only; JSON includes tasks and events.</p><a href="privacy.html">Read the privacy notice ↗</a></section><section class="panel"><h2>Try a sample day</h2><p>Add three example events and two example tasks for today. Your existing plans stay in place.</p><button class="button secondary" data-action="sample">Add sample plans</button></section>`;
    }
  }
  function renderTasks() {
    const query=el('task-search').value.toLocaleLowerCase();const filter=el('task-filter').value;
    const matches=data.tasks.filter(t=>t.title.toLocaleLowerCase().includes(query)&&(filter==='all'||(filter==='done'?t.done:!t.done))).sort((a,b)=>a.date.localeCompare(b.date));
    el('task-list').innerHTML=matches.length?matches.map(taskMarkup).join(''):'<div class="empty">No tasks here yet, or no tasks match your search.</div>';
  }
  function openEditor(type,id) {
    kind=type;editing=id||null;opener=document.activeElement;
    const item=(kind==='event'?data.events:data.tasks).find(entry=>entry.id===editing);
    const form=el('entry-form');form.reset();el('form-error').textContent='';
    el('editor-title').textContent=`${item?'Edit':'Create'} ${kind==='event'?'an event':'a task'}.`;
    el('entry-kind').textContent=kind;el('delete-entry').hidden=!item;
    el('time-fields').hidden=kind==='task';el('location-field').hidden=kind==='task';
    form.elements.start.required=kind==='event';form.elements.end.required=kind==='event';
    form.elements.title.value=item?.title||'';form.elements.date.value=item?.date||dateKey(today);form.elements.category.value=item?.category|| (kind==='task'?'focus':'class');
    form.elements.start.value=item?.start||'09:00';form.elements.end.value=item?.end||'10:00';form.elements.location.value=item?.location||'';
    el('editor').showModal();form.elements.title.focus();
  }
  function closeEditor(){el('editor').close();if(opener?.isConnected)opener.focus();else el('main').focus();}
  el('close-editor').addEventListener('click',closeEditor);el('cancel-editor').addEventListener('click',closeEditor);
  el('entry-form').addEventListener('submit',event=>{
    event.preventDefault();const form=event.currentTarget;
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
    changed(`${kind==='event'?'Event':'Task'} saved.${overlap?' This overlaps another event; review your calendar.':''}`);closeEditor();
  });
  el('delete-entry').addEventListener('click',()=>{if(kind==='event')data.events=data.events.filter(item=>item.id!==editing);else data.tasks=data.tasks.filter(item=>item.id!==editing);changed('Entry deleted.');closeEditor();});
  function download(content,type,name){const url=URL.createObjectURL(new Blob([content],{type}));const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  const icsEscape = value => value.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
  function foldLine(line){let result='',chunk='',size=0;for(const c of line){const n=new TextEncoder().encode(c).length;if(size+n>73){result+=chunk+'\r\n ';chunk='';size=1;}chunk+=c;size+=n;}return result+chunk;}
  function calendarExport(){const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Smart Planner//Local Calendar//EN','CALSCALE:GREGORIAN',...data.events.flatMap(e=>['BEGIN:VEVENT',`UID:${e.id}@smart-planner.local`,`DTSTAMP:${stamp}`,`DTSTART:${e.date.replace(/-/g,'')}T${e.start.replace(':','')}00`,`DTEND:${e.date.replace(/-/g,'')}T${e.end.replace(':','')}00`,`SUMMARY:${icsEscape(e.title)}`,`LOCATION:${icsEscape(e.location)}`,'END:VEVENT']),'END:VCALENDAR'];download(lines.map(foldLine).join('\r\n')+'\r\n','text/calendar;charset=utf-8','smart-planner.ics');announce('Calendar exported. Times are floating local times; check the destination calendar’s time zone when importing.');}
  el('view').addEventListener('click',event=>{
    const button=event.target.closest('[data-action]');if(!button)return;const action=button.dataset.action;
    if(action==='add-event'||action==='add-task')openEditor(action==='add-event'?'event':'task');
    else if(action==='edit-event'||action==='edit-task')openEditor(action==='edit-event'?'event':'task',button.dataset.id);
    else if(['prev-week','next-week','this-week'].includes(action)){weekOffset=action==='this-week'?0:weekOffset+(action==='prev-week'?-1:1);render();el('week-label').focus();}
    else if(action==='export'){download(JSON.stringify(data,null,2),'application/json','smart-planner.json');announce('Planner exported. Keep this file somewhere private.');}
    else if(action==='export-calendar')calendarExport();
    else if(action==='clear'){opener=button;el('delete-dialog').showModal();el('cancel-clear').focus();}
    else if(action==='sample'){
      if(data.events.some(e=>e.id==='sample-class')){announce('Sample plans have already been added.');return;}
      if(data.events.length>997||data.tasks.length>998){announce('There is not enough room for sample plans. Export and remove older entries first.');return;}
      const day=dateKey(today);data.events.push({id:'sample-class',title:'Database Systems',date:day,start:'09:00',end:'09:50',category:'class',location:'Room 204'},{id:uid(),title:'Finish SQL lab',date:day,start:'11:00',end:'12:00',category:'focus',location:''},{id:uid(),title:'Campus café shift',date:day,start:'14:00',end:'17:00',category:'work',location:'Campus café'});
      data.tasks.push({id:uid(),title:'Review database notes',date:day,category:'class',done:false},{id:uid(),title:'Take a little time outside',date:day,category:'personal',done:false});changed('Sample plans added for today.');
    }
  });
  el('view').addEventListener('input',event=>{if(event.target.id==='task-search')renderTasks();});
  el('view').addEventListener('change',event=>{
    const target=event.target;
    if(target.dataset.task){const task=data.tasks.find(t=>t.id===target.dataset.task);if(task){task.done=target.checked;const id=task.id;changed(task.done?'Task completed.':'Task marked to do.');const checkbox=el('task-'+id);if(checkbox)checkbox.focus();else el('main').focus();}}
    else if(target.id==='task-filter')renderTasks();
    else if(target.id==='save-device'){
      if(target.checked){saving=true;changed('Device saving enabled.');}
      else{try{localStorage.removeItem(STORAGE);saving=false;render();announce('Device saving is off. Your current plans remain in this tab only.');}catch{target.checked=saving;announce('Saved data could not be removed. Clear this site’s storage in your browser settings.');}}
    }
  });
  el('cancel-clear').addEventListener('click',()=>{el('delete-dialog').close();opener?.focus();});
  el('confirm-clear').addEventListener('click',()=>{
    try{localStorage.removeItem(STORAGE);}catch{announce('Browser storage could not be cleared. Use your browser’s website-data settings to remove saved plans.');el('delete-dialog').close();return;}
    data={version:1,events:[],tasks:[]};saving=false;el('delete-dialog').close();render();announce('All planner data deleted from this browser. Downloaded exports are not deleted.');el('main').focus();
  });
  window.addEventListener('storage',event=>{if(event.key===STORAGE)announce('Planner storage changed in another tab. This tab still has its current plans. Reload to use the saved version, or export before making more changes.');});
  function navigate(focus=false){active=['today','calendar','tasks','settings'].includes(location.hash.slice(1))?location.hash.slice(1):'today';render();if(focus)el('main').focus();}
  window.addEventListener('hashchange',()=>navigate(true));navigate();if(initialMessage)announce(initialMessage);
})();
