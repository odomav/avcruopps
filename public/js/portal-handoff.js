const origins=new Set(['https://odomav-site-preview.onrender.com','https://odomav.com','https://www.odomav.com']);
const status=document.getElementById('handoff-status');
const requested=new URLSearchParams(location.search).get('next')||'/opportunities';
const next=requested.startsWith('/')&&!requested.startsWith('//')?requested:'/opportunities';
if(!window.opener){status.textContent='Start at Odom AV to sign in.';}
else{
  let used=false;
  window.addEventListener('message',async(event)=>{
    if(used||event.source!==window.opener||!origins.has(event.origin)||event.data?.type!=='oav-portal-token'||event.data?.destination!=='crew')return;
    used=true;
    try{
      const c=window.AVCRUOPPS;
      const response=await fetch(`${c.supabaseUrl}/auth/v1/verify`,{method:'POST',headers:{apikey:c.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({token_hash:event.data.token_hash,type:'magiclink'})});
      const session=await response.json();
      if(!response.ok||!session.access_token||!session.refresh_token)throw new Error(session.msg||session.error_description||'Sign-in failed');
      const project=new URL(c.supabaseUrl).hostname.split('.')[0];
      localStorage.setItem(`sb-${project}-auth-token`,JSON.stringify(session));
      window.opener.postMessage({type:'oav-portal-complete',destination:'crew'},event.origin);
      location.replace(next);
    }catch(error){status.textContent=error.message||'Could not open portal. Return to Odom AV and try again.';}
  });
  for(const origin of origins)window.opener.postMessage({type:'oav-portal-ready',destination:'crew'},origin);
  setTimeout(()=>{if(!used)status.textContent='Connection timed out. Return to Odom AV and try again.';},15000);
}
