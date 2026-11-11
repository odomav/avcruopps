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
      <div class="grid"><div class="field"><label for="city">City *</label><input id="city" type="text" maxlength="120" required></div>
      <div class="field"><label for="state">State *</label><select id="state" required><option value="">Select state</option><option value="AL">Alabama (AL)</option><option value="AK">Alaska (AK)</option><option value="AZ">Arizona (AZ)</option><option value="AR">Arkansas (AR)</option><option value="CA">California (CA)</option><option value="CO">Colorado (CO)</option><option value="CT">Connecticut (CT)</option><option value="DE">Delaware (DE)</option><option value="FL">Florida (FL)</option><option value="GA">Georgia (GA)</option><option value="HI">Hawaii (HI)</option><option value="ID">Idaho (ID)</option><option value="IL">Illinois (IL)</option><option value="IN">Indiana (IN)</option><option value="IA">Iowa (IA)</option><option value="KS">Kansas (KS)</option><option value="KY">Kentucky (KY)</option><option value="LA">Louisiana (LA)</option><option value="ME">Maine (ME)</option><option value="MD">Maryland (MD)</option><option value="MA">Massachusetts (MA)</option><option value="MI">Michigan (MI)</option><option value="MN">Minnesota (MN)</option><option value="MS">Mississippi (MS)</option><option value="MO">Missouri (MO)</option><option value="MT">Montana (MT)</option><option value="NE">Nebraska (NE)</option><option value="NV">Nevada (NV)</option><option value="NH">New Hampshire (NH)</option><option value="NJ">New Jersey (NJ)</option><option value="NM">New Mexico (NM)</option><option value="NY">New York (NY)</option><option value="NC">North Carolina (NC)</option><option value="ND">North Dakota (ND)</option><option value="OH">Ohio (OH)</option><option value="OK">Oklahoma (OK)</option><option value="OR">Oregon (OR)</option><option value="PA">Pennsylvania (PA)</option><option value="RI">Rhode Island (RI)</option><option value="SC">South Carolina (SC)</option><option value="SD">South Dakota (SD)</option><option value="TN">Tennessee (TN)</option><option value="TX">Texas (TX)</option><option value="UT">Utah (UT)</option><option value="VT">Vermont (VT)</option><option value="VA">Virginia (VA)</option><option value="WA">Washington (WA)</option><option value="WV">West Virginia (WV)</option><option value="WI">Wisconsin (WI)</option><option value="WY">Wyoming (WY)</option><option value="DC">District of Columbia (DC)</option></select></div></div>
      <div class="field"><label for="specialties">Specialties and relevant experience</label><textarea id="specialties" maxlength="3000" placeholder="Tell us about the systems, roles, and projects you know best."></textarea></div>
      <fieldset><legend>Application PDFs — up to five files</legend><p class="hint">A PDF résumé is required. You may also add certifications, a portfolio, professional references, or other relevant PDFs. Select a type for each file.</p><div id="application-documents"><div class="application-document-row"><div class="grid"><div class="field"><label>Document type *</label><select name="document-type" required><option value="resume">Résumé</option></select></div><div class="field"><label>PDF, up to 5 MB *</label><input name="document-file" type="file" accept=".pdf,application/pdf" required></div></div></div></div><button type="button" class="secondary" id="add-document">Add another PDF</button></fieldset>
      <fieldset><legend>Professional references — at least three, up to five *</legend><p class="hint">For each person, include their name, relationship to you, email, and phone number.</p><div id="references"></div>
      <button type="button" class="secondary" id="add-reference">Add another reference</button></fieldset>
      <div class="application-notice"><strong>How we use your information</strong><p>Odom Audio Visual uses your application and résumé to evaluate roster eligibility, contact you and your references, and manage future assignments. We retain applicant records for business and legal purposes and may transfer them as part of a sale or reorganization of the business. We do not sell applicant records separately. You may contact <a href="mailto:admin@odomav.com">admin@odomav.com</a> about your information. Applying does not guarantee an assignment or determine whether a future engagement is employment or independent contract work.</p></div>
      <label class="consent"><input id="privacy" type="checkbox" required> I have read the information notice and confirm that I may provide these references' contact information. *</label>
      <div class="form-actions"><button id="send-application" type="submit">Submit Application</button><span id="application-message" aria-live="polite"></span></div>
    </div></form>`);
  const docs=document.getElementById("application-documents");
  document.getElementById("add-document").onclick=()=>{if(docs.children.length>=5)return;const row=document.createElement("div");row.className="application-document-row";row.innerHTML=`<div class="grid"><div class="field"><label>Document type *</label><select name="document-type" required><option value="">Select type</option><option value="certification">Certification</option><option value="portfolio">Portfolio</option><option value="references">Professional references</option><option value="other">Other PDF</option></select></div><div class="field"><label>PDF, up to 5 MB *</label><input name="document-file" type="file" accept=".pdf,application/pdf" required></div></div><button type="button" class="secondary remove-document">Remove PDF</button>`;row.querySelector(".remove-document").onclick=()=>{row.remove();document.getElementById("add-document").disabled=false};docs.append(row);document.getElementById("add-document").disabled=docs.children.length>=5};
  const refs=document.getElementById("references");
  const addReference=()=>{if(refs.children.length>=5)return;const n=refs.children.length+1;const row=document.createElement("div");row.className="reference-row";row.innerHTML=`<h3>Reference ${n}</h3><div class="grid"><div class="field"><label>Name *</label><input name="ref-name" type="text" maxlength="255" required></div><div class="field"><label>Relationship *</label><input name="ref-relationship" type="text" maxlength="255" required></div><div class="field"><label>Email *</label><input name="ref-email" type="email" required></div><div class="field"><label>Phone *</label><input name="ref-phone" type="tel" maxlength="40" required></div></div>`;refs.append(row);document.getElementById("add-reference").disabled=refs.children.length>=5};
  for(let i=0;i<3;i++)addReference();document.getElementById("add-reference").onclick=addReference;
  document.getElementById("crew-application").addEventListener("submit",async e=>{
    e.preventDefault();const button=document.getElementById("send-application"),message=document.getElementById("application-message");
    const files=[...docs.children].map(row=>({type:row.querySelector('[name="document-type"]').value,file:row.querySelector('[name="document-file"]').files[0]}));
    if(files.length<1||files.length>5||files[0].type!=="resume"){message.textContent="Add a PDF résumé and up to four other PDFs.";return;}
    for(const item of files){if(!item.type||!item.file||item.file.size>5242880||item.file.size<8||new TextDecoder().decode(await item.file.slice(0,5).arrayBuffer())!=="%PDF-"){message.textContent="Each file must be a valid PDF under 5 MB with a selected type.";return;}}
    const references=[...refs.children].map(row=>({name:row.querySelector('[name="ref-name"]').value.trim(),relationship:row.querySelector('[name="ref-relationship"]').value.trim(),email:row.querySelector('[name="ref-email"]').value.trim(),phone:row.querySelector('[name="ref-phone"]').value.trim()}));
    if(references.length<3||references.some(r=>Object.values(r).some(v=>!v))){message.textContent="Complete at least three references.";return;}
    button.disabled=true;message.textContent="Uploading PDFs…";
    const uploadedFiles=[];
    try{
      const raw=JSON.parse(localStorage.getItem(`sb-${new URL(cfg.supabaseUrl).hostname.split(".")[0]}-auth-token`));
      for(const item of files){const bucket=item.type==="resume"?"freelancer-resumes":"freelancer-documents",path=`${me.user.id}/${crypto.randomUUID()}.pdf`;
        const uploaded=await fetch(`${cfg.supabaseUrl}/storage/v1/object/${bucket}/${path}`,{method:"POST",headers:{apikey:cfg.publishableKey,Authorization:`Bearer ${raw.access_token}`,"Content-Type":"application/pdf","x-upsert":"false"},body:item.file});
        if(!uploaded.ok){const error=await uploaded.json().catch(()=>({}));throw new Error(error.message||`PDF upload failed (${uploaded.status})`)}
        uploadedFiles.push({...item,bucket,path});
      }
      message.textContent="Saving application…";
      await db("freelancer_applications","",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({applicant_id:me.user.id,full_name:document.getElementById("full-name").value.trim(),email:me.user.email.toLowerCase(),phone:document.getElementById("phone").value.trim(),home_city:document.getElementById("city").value.trim(),home_state:document.getElementById("state").value.trim(),primary_region:document.getElementById("zone").value,role_code:document.querySelector('[name="role"]:checked').value,specialties:document.getElementById("specialties").value.trim(),resume_path:uploadedFiles[0].path,professional_references:references})});
      const saved=await db("freelancer_application_self","select=id");
      if(!saved?.[0]?.id)throw new Error("Application saved, but the PDF list could not be linked. Please contact OAV.");
      await db("freelancer_application_documents","",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify(uploadedFiles.map(item=>({application_id:saved[0].id,document_type:item.type,file_name:item.file.name,storage_bucket:item.bucket,storage_path:item.path,source:"avcruopps"})))});
      location.reload();
    }catch(error){message.textContent=error.message;button.disabled=false;}
  });
}
