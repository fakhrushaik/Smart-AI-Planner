export function validDOB(value) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T12:00:00Z');
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0,10) === value && value >= '1900-01-01' && value <= new Date().toISOString().slice(0,10);
}
export function safeAvatar(value) { return typeof value === 'string' && value.length <= 65536 && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(value) ? value : ''; }
