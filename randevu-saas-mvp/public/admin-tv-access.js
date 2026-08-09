/* Always expose TV screen access while an admin edits a business. */
setInterval(()=>{
  if(!location.hash.startsWith('#admin')||!adminSession)return;
  const form=document.querySelector('.modal form[onsubmit*="saveTenant"]');
  if(!form||form.querySelector('[name="tvDisplayEnabled"]'))return;
  const tenantId=(form.getAttribute('onsubmit').match(/saveTenant\(event,'([^']+)'/)||[])[1];
  const tenant=db?.tenants?.find(item=>item.id===tenantId),enabled=tenant?.tvDisplayEnabled!==false;
  const field=document.createElement('label');field.className='field full';field.dataset.tvAccess='true';
  field.innerHTML=`<span><b>TV ekranı erişimi</b><small class="sub">Bu işletmenin TV randevu ekranını kullanmasına izin verin.</small></span><select name="tvDisplayEnabled"><option value="true" ${enabled?'selected':''}>Açık — TV ekranını kullanabilir</option><option value="false" ${!enabled?'selected':''}>Kapalı — TV ekranı gizli</option></select>`;
  form.querySelector('.modalfoot')?.insertAdjacentElement('beforebegin',field);
},200);
