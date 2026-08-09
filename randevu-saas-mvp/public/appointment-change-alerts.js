/* Makes customer cancellations and reschedules unmistakable for the business. */
(function(){
  const escText=value=>typeof clean==='function'?clean(value):String(value||'');
  const stamp=value=>value?new Date(value).getTime():0;
  const isFresh=value=>Date.now()-stamp(value)>=0&&Date.now()-stamp(value)<30000;
  const dateLabel=value=>typeof dateTR==='function'?dateTR(value):value;
  function eventRow(a,data,type){
    const customer=data.customers.find(x=>x.id===a.customerId)?.name||'Müşteri';
    const service=data.services.find(x=>x.id===a.serviceId)?.name||'Hizmet';
    if(type==='cancelled')return `<div class="appointmentChange cancelledChange"><b>${escText(customer)}</b><span>Randevusunu iptal etti · ${dateLabel(a.date)} ${a.time} · ${escText(service)}</span></div>`;
    const nextDay=a.previousDate!==a.date;
    return `<div class="appointmentChange ${nextDay?'nextDayChange':''} ${nextDay&&isFresh(a.rescheduledAt)?'blinkRed':''}"><b>${escText(customer)}</b><span>${nextDay?'ERTESİ GÜNE ALINDI':'Aynı gün saat değiştirildi'} · ${dateLabel(a.previousDate)} ${a.previousTime} → ${dateLabel(a.date)} ${a.time} · ${escText(service)}</span>${nextDay&&isFresh(a.rescheduledAt)?'<em>30 sn dikkat uyarısı</em>':''}</div>`;
  }
  function draw(){
    if(location.hash!=='#business'||!ownerSession||!['business','appointments'].includes(view))return;
    const main=document.querySelector('.main');if(!main||main.querySelector('[data-change-alerts]')||!db)return;
    const data=tdata(),events=data.appointments.filter(a=>a.customerAction==='cancelled'||a.customerAction==='rescheduled').sort((a,b)=>stamp(b.cancelledAt||b.rescheduledAt)-stamp(a.cancelledAt||a.rescheduledAt));
    if(!events.length)return;
    const sameDay=events.filter(a=>a.customerAction==='rescheduled'&&a.previousDate===a.date),nextDay=events.filter(a=>a.customerAction==='rescheduled'&&a.previousDate!==a.date),cancelled=events.filter(a=>a.customerAction==='cancelled');
    const card=document.createElement('section');card.className='card appointmentChangeCard';card.dataset.changeAlerts='true';
    card.innerHTML=`<div class="toolbar"><div><h2>Randevu değişiklikleri</h2><span class="sub">Müşterilerin yaptığı son iptal ve tarih/saat değişiklikleri.</span></div><span class="pill ${nextDay.length?'trial':''}">${events.length} bildirim</span></div>${nextDay.length?`<h3 class="changeTitle redTitle">Ertesi güne alınanlar</h3>${nextDay.map(a=>eventRow(a,data,'rescheduled')).join('')}`:''}${sameDay.length?`<h3 class="changeTitle">Aynı gün değişen saatler</h3>${sameDay.map(a=>eventRow(a,data,'rescheduled')).join('')}`:''}${cancelled.length?`<h3 class="changeTitle">İptal edilenler</h3>${cancelled.map(a=>eventRow(a,data,'cancelled')).join('')}`:''}`;
    main.querySelector('.top')?.insertAdjacentElement('afterend',card);
  }
  setInterval(draw,250);
})();
