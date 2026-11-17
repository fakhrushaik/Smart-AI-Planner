import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyRecovery} from '../docs/recovery-core.js';
import {validDOB,safeAvatar} from '../docs/profile-validation.js';
test('a signed-in session or recovery query alone cannot enable password changes',async()=>{
 const auth={getSession(){throw Error('must not trust ambient session');}};
 assert.equal(await verifyRecovery(auth,new URLSearchParams('flow=recovery')),false);
 assert.equal(await verifyRecovery(auth,new URLSearchParams('token_hash=x&type=signup')),false);
});
test('PKCE recovery must exchange successfully and have recovery intent',async()=>{
 for(const data of [{session:{}},{session:{},redirectType:'signup'},{session:null,redirectType:'recovery'}]){
 await assert.rejects(verifyRecovery({exchangeCodeForSession:async()=>({data})},new URLSearchParams('code=x')));
 }
 assert.equal(await verifyRecovery({exchangeCodeForSession:async()=>({data:{session:{},redirectType:'recovery'}})},new URLSearchParams('code=x')),true);
});
test('expired, replayed and failed OTP links fail closed',async()=>{
 await assert.rejects(verifyRecovery({},new URLSearchParams('error=access_denied')));
 await assert.rejects(verifyRecovery({verifyOtp:async()=>({error:{message:'expired'}})},new URLSearchParams('token_hash=x&type=recovery')));
 let used=false;
 const auth={verifyOtp:async input=>{assert.deepEqual(input,{token_hash:'x',type:'recovery'});if(used)return {error:{}};used=true;return {data:{session:{}}};}};
 assert.equal(await verifyRecovery(auth,new URLSearchParams('token_hash=x&type=recovery')),true);
 await assert.rejects(verifyRecovery(auth,new URLSearchParams('token_hash=x&type=recovery')));
});
test('DOB is optional and rejects impossible/future dates; avatars reject executable/external content',()=>{
 assert.ok(validDOB(null));assert.ok(validDOB('2000-02-29'));assert.ok(!validDOB('2001-02-29'));assert.ok(!validDOB('2999-01-01'));assert.ok(!validDOB('1899-01-01'));
 assert.equal(safeAvatar('https://tracker.example/photo'), '');assert.equal(safeAvatar('data:image/svg+xml,<svg>'), '');assert.equal(safeAvatar('data:image/jpeg;base64,YQ=='),'data:image/jpeg;base64,YQ==');
});
