export async function verifyRecovery(auth, params) {
  if(params.has('error'))throw new Error('This link is invalid or expired. Request a new reset link.');
  const hash=params.get('token_hash');const code=params.get('code');
  if(hash && params.get('type')==='recovery') {
    const {data,error}=await auth.verifyOtp({token_hash:hash,type:'recovery'});
    if(error||!data.session)throw new Error('This link is invalid, expired or already used. Request a new reset link.');
    return true;
  }
  if(code) {
    const {data,error}=await auth.exchangeCodeForSession(code);
    if(error||!data.session||data.redirectType!=='recovery')throw new Error('This reset link expired, was already used, or opened in another tab. Request a new link in this tab.');
    return true;
  }
  return false;
}
