export const categories = { class:['Class','lavender'], focus:['Focus','green'], work:['Work','peach'], personal:['Personal','blue'] };
export const emptyPlanner = () => ({version:1,events:[],tasks:[]});
export const dateKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const validDate = value => typeof value==='string' && /^(20\d{2}|2100)-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00`).valueOf()) && dateKey(new Date(`${value}T12:00:00`))===value;
export const validTime = value => typeof value==='string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
export const validTitle = value => typeof value==='string' && value.trim().length>0 && value.length<=120 && !/[\r\n\u0000]/.test(value);
export function validData(data) {
  return !!(data && data.version===1 && Array.isArray(data.events) && Array.isArray(data.tasks) && data.events.length<=1000 && data.tasks.length<=1000 &&
    [...data.events,...data.tasks].every(item=>item && typeof item.id==='string' && /^[a-zA-Z0-9-]{1,60}$/.test(item.id) && validTitle(item.title) && validDate(item.date) && Object.hasOwn(categories,item.category)) &&
    new Set([...data.events,...data.tasks].map(item=>item.id)).size===data.events.length+data.tasks.length &&
    data.events.every(item=>validTime(item.start)&&validTime(item.end)&&item.end>item.start&&typeof item.location==='string'&&item.location.length<=120&&!/[\r\n\u0000]/.test(item.location)) &&
    data.tasks.every(item=>typeof item.done==='boolean'));
}
export function normalize(data,{newIds=false}={}) {
  if(!validData(data))throw new Error('Use a valid Smart Planner JSON export with at most 1,000 events and 1,000 tasks.');
  return {version:1,events:data.events.map(e=>({id:newIds?crypto.randomUUID():e.id,title:e.title.trim(),date:e.date,start:e.start,end:e.end,category:e.category,location:e.location})),tasks:data.tasks.map(t=>({id:newIds?crypto.randomUUID():t.id,title:t.title.trim(),date:t.date,category:t.category,done:t.done}))};
}
export const escapeHTML = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const escapeICS = value => value.replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
