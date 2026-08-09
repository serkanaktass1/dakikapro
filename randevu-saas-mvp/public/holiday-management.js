/* Closed dates are managed by the business and respected by all booking flows. */
(function(){
  const dateKey=value=>/^\d{4}-\d{2}-\d{2}$/.test(String(value||''))?String(value):'';
  const dates=value=>String(value||'').split(',').map(x=>dateKey(x.trim())).filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i).sort();
  const label=value=>new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'long',year:'numeric'}).format(new Date(`${value}T12:00:00`));
  const draw=box=>{const input=box.querySelector('input[name="holidays"]'),list=dates(input.value);input.value=list.join(',');box.querySelector('[data-holiday-list]').innerHTML=list.length?list.map(day=>`<span class="holidayChip">${label(day)} <button type="button" aria-label="Tatil gününü kaldır" data-remove-holiday="${day}">×</button></span>`).join(''):'<span class="sub">Henüz tatil günü eklenmedi.</span>';};
  function addEditor(){
    if(location.hash!=='#business'||view!=='businessSettings'||!ownerSession)return;
    const form=document.querySelector('form[onsubmit*="saveBusinessSettings"]');
    if(!form||form.querySelector('[data-holiday-manager]'))return;
    const tenant=typeof tdata==='function'?tdata().t:{};
    const holder=document.createElement('div');holder.className='field full holidayManager';holder.dataset.holidayManager='true';
    holder.innerHTML=`<span>Tatil / kapalı günler <small class="sub">Bu günlerde müşteriler randevu saati göremez ve randevu oluşturamaz.</small></span><div class="holidayEditor"><input type="date" min="${new Date().toISOString().slice(0,10)}" data-holiday-date><button type="button" class="btn ghost" data-add-holiday>Gün ekle</button></div><input type="hidden" name="holidays" value="${dates(tenant.holidays).join(',')}"><div class="holidayList" data-holiday-list></div>`;
    form.querySelector('.modalfoot')?.insertAdjacentElement('beforebegin',holder);draw(holder);
    holder.querySelector('[data-add-holiday]').addEventListener('click',()=>{const pick=holder.querySelector('[data-holiday-date]'),value=dateKey(pick.value);if(!value)return toast('Önce bir tarih seçin.');const hidden=holder.querySelector('input[name="holidays"]');hidden.value=dates(`${hidden.value},${value}`).join(',');pick.value='';draw(holder);});
    holder.addEventListener('click',event=>{const button=event.target.closest('[data-remove-holiday]');if(!button)return;const hidden=holder.querySelector('input[name="holidays"]');hidden.value=dates(hidden.value).filter(day=>day!==button.dataset.removeHoliday).join(',');draw(holder);});
  }
  async function protectBooking(){
    const form=document.querySelector('.bookingform form');
    if(!form||form.dataset.holidayReady||!location.hash.startsWith('#book/'))return;
    const slug=decodeURIComponent(location.hash.slice(6)),date=form.querySelector('[name="date"]'),time=form.querySelector('[name="time"]');
    if(!date||!time)return;
    form.dataset.holidayReady='true';
    try{
      const response=await fetch(`/data/public/${encodeURIComponent(slug)}`,{cache:'no-store'}),data=await response.json();if(!response.ok)throw Error();
      const closed=dates(data.tenant?.holidays),note=document.createElement('p');note.className='holidayNotice sub';date.closest('.field')?.insertAdjacentElement('afterend',note);
      const refresh=()=>{const blocked=closed.includes(date.value);time.disabled=blocked;const submit=form.querySelector('button[type="submit"]');if(submit)submit.disabled=blocked;note.textContent=blocked?'Bu tarih işletmenin tatil günü; lütfen başka bir gün seçin.':'';};
      date.addEventListener('change',refresh);form.addEventListener('submit',event=>{if(closed.includes(date.value)){event.preventDefault();toast('Bu gün işletme kapalı.');}},true);refresh();
    }catch(_){form.dataset.holidayReady='';}
  }
  setInterval(()=>{addEditor();protectBooking();},250);
})();
