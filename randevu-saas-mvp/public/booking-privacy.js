/* Hide occupied slots from customers and reliably delete businesses with names containing apostrophes. */
async function applyBookingAvailability() {
  const form=document.querySelector('.bookingform form');
  if(!form || form.dataset.availabilityReady) return;
  const slug=location.hash.startsWith('#book/') ? decodeURIComponent(location.hash.slice(6)) : '';
  if(!slug) return;
  const staff=form.querySelector('[name="staffId"]'), date=form.querySelector('[name="date"]'), time=form.querySelector('[name="time"]');
  if(!staff||!date||!time) return;
  form.dataset.availabilityReady='true';
  try {
    const response=await fetch(`/data/public/${encodeURIComponent(slug)}`,{cache:'no-store'}); const data=await response.json(); const busy=data.busySlots||[];
    const refresh=()=>{const selected=time.value; [...time.options].forEach(option=>{const occupied=busy.some(slot=>slot.staffId===staff.value&&slot.date===date.value&&slot.time===option.value); option.hidden=occupied; option.disabled=occupied;}); if(time.selectedOptions[0]?.disabled){const first=[...time.options].find(option=>!option.disabled); if(first)time.value=first.value;}};
    staff.addEventListener('change',refresh); date.addEventListener('change',refresh); refresh();
  } catch (_) { form.dataset.availabilityReady=''; }
}
setInterval(applyBookingAvailability,350);

document.addEventListener('click', async event=>{
  const button=event.target.closest('.iconbtn.danger');
  if(!button || !button.getAttribute('onclick')?.includes('deleteTenant')) return;
  event.preventDefault(); event.stopImmediatePropagation();
  const id=(button.getAttribute('onclick').match(/deleteTenant\('([^']+)'/)||[])[1]; const name=button.closest('tr')?.querySelector('.name')?.textContent?.trim()||'işletme';
  if(!id || !confirm(`“${name}” işletmesini ve ilişkili tüm kayıtlarını silmek istediğinize emin misiniz?`)) return;
  try { const result=await fetch(`/data/tenants/${id}`,{method:'DELETE',headers:{'Content-Type':'application/json'}}); const body=await result.json(); if(!result.ok)throw Error(body.error||'Silinemedi.'); toast('İşletme ve ilişkili kayıtlar silindi.'); await reload(); }
  catch(error){toast(error.message);}
},true);
