const roles=[
  ["fpm1","Field Production Manager I"],
  ["fpm2","Field Production Manager II"],
  ["field_events_rentals","Field Technician, Events & Rentals"],
  ["field_support_install","Field Technician, Support & Installation"]
];
const zones=[["NE","Northeast"],["SC","South Central"],["SE","Southeast"],["NC","North Central"],["WE","West"]];

export async function renderApplication({me,shell,cfg,db,esc}){
  if(!me.user){
    shell("Apply to Join",`<h1 class="page-title">Apply to Join the OAV Freelance Roster</h1>
      <p>Odom Audio Visual is based in Ulster County, New York, and Bossier Parish, Louisiana. We work with crew across multiple regions.</p>
      <section class="box"><h2>Start your application</h2><div class="box-b">
      <p>Create a sign-in, then complete the application here on AVCruOpps. OAV reviews each application before granting roster access.</p>
      <p><a class="button" href="/sign-in?next=/apply">Create Account or Sign In</a></p>
      </div></section>`);return;
  }
  const previous=await db("freelancer_application_self","select=*");
  if(previous.length){
    const a=previous[0];shell("Application Received",`<h1 class="page-title">Application Received</h1>
      <div class="msg ok">Your application for <strong>${esc(roles.find(r=>r[0]===a.role_code)?.[1]||a.role_code)}</strong> was received on ${esc(new Date(a.applied_at).toLocaleDateString("en-US",{timeZone:"America/New_York"}))}.</div>
      <p>Current review status: <strong>${esc(a.status.replaceAll("_"," "))}</strong>. OAV will contact you using the details you submitted.</p>`);return;
  }
  if(me.staff){shell("OAV Staff",`<h1 class="page-title">OAV Staff Account</h1><div class="msg info">Manage applications and crew in <a href="https://avbizopps.com/oav/applicants.html">AVBizOpps.com</a>. Please sign in there.</div>`);return;}
  shell("Apply to Join",`<h1 class="page-title">Apply to Join the OAV Freelance Roster</h1>
    <p>Odom Audio Visual is based in Ulster County, New York, and Bossier Parish, Louisiana. Choose one primary role. You can discuss other skills with our team during review.</p>
    <form id="crew-application" class="box"><h2>Freelancer Application</h2><div class="box-b">
      <fieldset class="application-roles"><legend>Position applying for <span aria-hidden="true">*</span></legend>
      ${roles.map(([code,name])=>`<label><input type="radio" name="role" value="${code}" required><span>${esc(name)}</span></label>`).join("")}</fieldset>
      <div class="grid"><div class="field"><label for="full-name">Full name *</label><input id="full-name" type="text" autocomplete="name" maxlength="255" required></div>
      <div class="field"><label for="phone">Phone *</label><input id="phone" type="tel" autocomplete="tel" maxlength="40" required></div></div>
      <div class="grid"><div class="field"><label for="email">Account email</label><input id="email" type="email" value="${esc(me.user.email)}" readonly></div>
      <div class="field"><label for="zone">Primary region *</label><select id="zone" required><option value="">Select region</option>${zones.map(([code,name])=>`<option value="${code}">${name}</option>`).join("")}</select></div></div>
      <div class="grid"><div class="field"><label for="city">City or county *</label><input id="city" type="text" maxlength="120" required></div>
      <div class="field"><label for="state">State *</label><input id="state" type="text" maxlength="80" required></div></div>
      <div class="field"><label for="specialties">Specialties and relevant experience</label><textarea id="specialties" maxlength="3000" placeholder="Tell us about the systems, roles, and projects you know best."></textarea></div>
      <div class="field"><label for="resume">Résumé (PDF, up to 5 MB) *</label><input id="resume" type="file" accept=".pdf,application/pdf" required></div>
      <fieldset><legend>Professional references — at least three, up to five *</legend><p class="hint">For each person, include their name, relationship to you, email, and phone number.</p><div id="references"></div>
      <button type="button" class="secondary" id="add-reference">Add another reference</button></fieldset>
      <div class="application-notice"><strong>How we use your information</strong><p>Odom Audio Visual uses your application and résumé to evaluate roster eligibility, contact you and your references, and manage future assignments. We retain applicant records for business and legal purposes and may transfer them as part of a sale or reorganization of the business. We do not sell applicant records separately. You may contact <a href="mailto:admin@odomav.com">admin@odomav.com</a> about your information. Applying does not guarantee an assignment or determine whether a future engagement is employment or independent contract work.</p></div>
      <label class="consent"><input id="privacy" type="checkbox" required> I have read the information notice and confirm that I may provide these references' contact information. *</label>
      <div class="form-actions"><button id="send-application" type="submit">Submit Application</button><span id="application-message" aria-live="polite"></span></div>
    </div></form>`);
  const refs=document.getElementById("references");
  const addReference=()=>{if(refs.children.length>=5)return;const n=refs.children.length+1;const row=document.createElement("div");row.className="reference-row";row.innerHTML=`<h3>Reference ${n}</h3><div class="grid"><div class="field"><label>Name *</label><input name="ref-name" type="text" maxlength="255" required></div><div class="field"><label>Relationship *</label><input name="ref-relationship" type="text" maxlength="255" required></div><div class="field"><label>Email *</label><input name="ref-email" type="email" required></div><div class="field"><label>Phone *</label><input name="ref-phone" type="tel" maxlength="40" required></div></div>`;refs.append(row);document.getElementById("add-reference").disabled=refs.children.length>=5};
  for(let i=0;i<3;i++)addReference();document.getElementById("add-reference").onclick=addReference;
  document.getElementById("crew-application").addEventListener("submit",async e=>{
    e.preventDefault();const button=document.getElementById("send-application"),message=document.getElementById("application-message"),file=document.getElementById("resume").files[0];
    if(!file||file.size>5242880||file.size<8){message.textContent="Choose a PDF résumé under 5 MB.";return;}
    const signature=new TextDecoder().decode(await file.slice(0,5).arrayBuffer());if(signature!=="%PDF-"){message.textContent="The résumé must be a valid PDF.";return;}
    const references=[...refs.children].map(row=>({name:row.querySelector('[name="ref-name"]').value.trim(),relationship:row.querySelector('[name="ref-relationship"]').value.trim(),email:row.querySelector('[name="ref-email"]').value.trim(),phone:row.querySelector('[name="ref-phone"]').value.trim()}));
    if(references.length<3||references.some(r=>Object.values(r).some(v=>!v))){message.textContent="Complete at least three references.";return;}
    button.disabled=true;message.textContent="Uploading résumé…";
    const path=`${me.user.id}/${crypto.randomUUID()}.pdf`;
    try{
      const raw=JSON.parse(localStorage.getItem(`sb-${new URL(cfg.supabaseUrl).hostname.split(".")[0]}-auth-token`));
      const uploaded=await fetch(`${cfg.supabaseUrl}/storage/v1/object/freelancer-resumes/${path}`,{method:"POST",headers:{apikey:cfg.publishableKey,Authorization:`Bearer ${raw.access_token}`,"Content-Type":"application/pdf","x-upsert":"false"},body:file});
      if(!uploaded.ok){const error=await uploaded.json().catch(()=>({}));throw new Error(error.message||`Résumé upload failed (${uploaded.status})`)}
      message.textContent="Saving application…";
      await db("freelancer_applications","",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({applicant_id:me.user.id,full_name:document.getElementById("full-name").value.trim(),email:me.user.email.toLowerCase(),phone:document.getElementById("phone").value.trim(),home_city:document.getElementById("city").value.trim(),home_state:document.getElementById("state").value.trim(),primary_region:document.getElementById("zone").value,role_code:document.querySelector('[name="role"]:checked').value,specialties:document.getElementById("specialties").value.trim(),resume_path:path,professional_references:references})});
      location.reload();
    }catch(error){message.textContent=error.message;button.disabled=false;}
  });
}
