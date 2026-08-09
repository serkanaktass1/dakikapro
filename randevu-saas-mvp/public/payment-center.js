/* Subscription payment experience. Provider connection can be activated later without redesigning the panels. */
(function(){
  const safe=value=>typeof clean==='function'?clean(value):String(value||'');
  const amount=tenant=>{const plan=db.plans.find(x=>x.id===tenant.planId);return tenant.billingCycle==='yearly'?(plan?.yearlyPrice||0):(plan?.price||0)};
  const methodName=method=>({card:'Online kart',bank:'Havale / EFT',cash:'Nakit',free:'Ücretsiz'}[method]||'—');
  window.paymentRequest=async function(method,total){
    const tenant=tdata().t,settings=db.settings||{},isOnline=method==='online',providerReady=isOnline&&settings.paymentProviderStatus==='active'&&settings.packagePaymentUrl;
    const selected=isOnline?'card':'bank';
    try{
      const updated=await api(`tenants/${tenant.id}`,'PATCH',{paymentMethod:selected,paymentStatus:'pending',paymentRequestedAt:new Date().toISOString(),paymentRequestedAmount:total});
      Object.assign(db.tenants.find(x=>x.id===tenant.id),updated);
      if(providerReady){toast('Güvenli ödeme sayfasına yönlendiriliyorsunuz.');window.open(settings.packagePaymentUrl,'_blank','noopener');}
      else if(isOnline)modal(`<h2>Online ödeme talebiniz alındı</h2><p>${safe(settings.paymentProvider||'Ödeme kuruluşu')} bağlantısı henüz etkinleştirilmediği için talebiniz yönetim paneline iletildi.</p><p class="sub">Yönetim, ödeme bağlantısını tanımladığında bu ekrandan güvenli ödeme sayfasına yönlendirileceksiniz.</p><div class="modalfoot"><button class="btn" onclick="closeModal()">Tamam</button></div>`);
      else modal(`<h2>Havale / EFT bildirimi oluşturuldu</h2><p><b>Tutar:</b> ${fmt(total)}</p><p><b>IBAN:</b> ${safe(settings.iban||'Yönetim tarafından henüz girilmedi')}</p><p><b>Hesap sahibi:</b> ${safe(settings.accountHolder||'—')}</p><p class="sub">${safe(settings.paymentNote||'Havale açıklamasına işletme adınızı yazın.')} Ödeme yönetim tarafından onaylandığında paketiniz güncellenir.</p><div class="modalfoot"><button class="btn" onclick="closeModal()">Tamam</button></div>`);
    }catch(error){toast(error.message||'Ödeme talebi kaydedilemedi.');}
  };
  function inject(){
    if(location.hash!=='#business'||view!=='subscription'||!ownerSession||document.querySelector('[data-payment-center]')||!db)return;
    const tenant=tdata().t,settings=db.settings||{},total=amount(tenant),state={paid:'Ödendi',pending:'Yönetim onayı bekliyor',free:'Ücretsiz'}[tenant.paymentStatus]||'Ödeme planı bekliyor';
    const section=document.createElement('section');section.className='card paymentCenter';section.dataset.paymentCenter='true';
    section.innerHTML=`<div class="toolbar"><div><h2>Ödeme merkezi</h2><span class="sub">Paket yenilemenizi buradan takip edin veya ödeme talebi oluşturun.</span></div><span class="pill ${tenant.paymentStatus==='pending'?'trial':'active'}">${state}</span></div><div class="paymentSummary"><div><span>Mevcut paket</span><b>${safe(db.plans.find(x=>x.id===tenant.planId)?.name||'—')}</b></div><div><span>Ödeme dönemi</span><b>${tenant.billingCycle==='yearly'?'Yıllık':'Aylık'}</b></div><div><span>Yenileme tutarı</span><b>${fmt(total)}</b></div><div><span>Tercih edilen yöntem</span><b>${methodName(tenant.paymentMethod)}</b></div></div><div class="paymentActions">${settings.allowOnlinePayment?`<button class="btn" onclick="paymentRequest('online',${total})">Online kartla öde</button>`:''}${settings.allowBankTransfer?`<button class="btn ghost" onclick="paymentRequest('bank',${total})">Havale / EFT bildir</button>`:''}</div><p class="sub paymentSafety">Kart bilgileriniz DakikaPro’da saklanmaz. Online ödeme, aktif olduğunda ${safe(settings.paymentProvider||'ödeme kuruluşu')} güvenli sayfasında tamamlanır.</p>`;
    document.querySelector('.main')?.append(section);
  }
  setInterval(inject,250);
})();
