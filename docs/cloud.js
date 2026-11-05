import { client } from './auth.js';
import { normalize } from './data.js';
export async function loadPlanner(user) {
  const profile={id:user.id,email:user.email||'',display_name:String(user.user_metadata?.display_name||user.user_metadata?.full_name||'').slice(0,120)};
  const {error:profileError}=await client.from('profiles').upsert(profile,{onConflict:'id'});
  if(profileError)throw profileError;
  const {data,error}=await client.rpc('load_planner');if(error)throw error;
  return {data:normalize(data),revision:data.revision};
}
export async function savePlanner(data,revision) {
  const payload=normalize(data);
  const {data:nextRevision,error}=await client.rpc('save_planner',{payload,expected_revision:revision});
  if(error)throw error;
  return nextRevision;
}
export async function deleteAccount() {
  const {error}=await client.rpc('delete_own_account');if(error)throw error;
}
