import { client } from './auth.js';
import { normalize } from './data.js';
export async function loadPlanner(user) {
  const meta = user.user_metadata || {};
  const emailLocal = String(user.email || '').split('@')[0];
  // Display name is never empty: sign-up requires it, OAuth fills full_name,
  // and the email local-part is the last fallback before 'there'.
  const displayName = String(meta.display_name || meta.full_name || emailLocal || 'there').trim().slice(0, 120) || emailLocal || 'there';
  const profile = { id: user.id, email: user.email || '', display_name: displayName };
  if (meta.dob) profile.dob = meta.dob;
  if (meta.pronouns) profile.pronouns = String(meta.pronouns).slice(0, 80);
  if (meta.avatar_url) profile.avatar_url = String(meta.avatar_url).slice(0, 500);
  const { error: profileError } = await client.from('profiles').upsert(profile, { onConflict: 'id' });
  if (profileError) throw profileError;
  const { data, error } = await client.rpc('load_planner'); if (error) throw error;
  return { data: normalize(data), revision: data.revision };
}
export async function savePlanner(data, revision) {
  const payload = normalize(data);
  const { data: nextRevision, error } = await client.rpc('save_planner', { payload, expected_revision: revision });
  if (error) throw error;
  return nextRevision;
}
export async function deleteAccount() {
  const { error } = await client.rpc('delete_own_account'); if (error) throw error;
}
// Profile photo: private 'avatars' bucket, one file per account at <user_id>/avatar.<ext>.
// The bucket is private, so the stored URL is a signed URL (valid 1 year);
// re-uploading refreshes it. The storage path is kept in user_metadata.avatar_path.
const AVATAR_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
export async function uploadAvatar(user, file) {
  if (!file) throw new Error('Choose a photo first.');
  const ext = AVATAR_TYPES[file.type];
  if (!ext) throw new Error('Use a JPG, PNG, WebP, or GIF photo.');
  if (file.size > 2 * 1024 * 1024) throw new Error('Photo must be smaller than 2 MB.');
  const path = `${user.id}/avatar.${ext}`;
  const { error: uploadError } = await client.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) throw uploadError;
  const { data: signed, error: urlError } = await client.storage.from('avatars').createSignedUrl(path, 31536000);
  if (urlError) throw urlError;
  const avatarUrl = signed.signedUrl;
  const { data: updated, error: metaError } = await client.auth.updateUser({ data: { avatar_url: avatarUrl, avatar_path: path } });
  if (metaError) throw metaError;
  const { error: profileError } = await client.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
  if (profileError) throw profileError;
  return { avatarUrl, user: updated.user };
}
// Display name is required and may never be blank; pronouns and dob are optional.
// Passing dob as '' clears it. Returns the updated user from Auth.
export async function updateProfile(user, fields) {
  const displayName = String(fields.display_name || '').trim();
  if (!displayName) throw new Error('Display name cannot be blank.');
  const pronouns = String(fields.pronouns || '').trim().slice(0, 80);
  const dob = String(fields.dob || '').trim();
  if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) throw new Error('Date of birth must be a valid date.');
  const meta = { display_name: displayName.slice(0, 120), pronouns, dob: dob || null };
  const { data: updated, error: metaError } = await client.auth.updateUser({ data: meta });
  if (metaError) throw metaError;
  const row = { display_name: meta.display_name, pronouns: meta.pronouns || null, dob: meta.dob };
  const { error: profileError } = await client.from('profiles').update(row).eq('id', user.id);
  if (profileError) throw profileError;
  return updated.user;
}
