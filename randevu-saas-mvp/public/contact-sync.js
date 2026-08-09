/* One source of truth: platform contact settings appear everywhere they are useful. */
(function(){
  const safe=value=>typeof esc==='function'?esc(value||''):String(value||'');
  const phoneHref=value=>String(value||'').replace(/[^\d+]/g,'');
  const whatsappHref=value=>String(value||'').replace(/\D/g,'');
  function contactMarkup(compact=false){
    const s=db?.settings||{},email=s.supportEmail||'',phone=s.supportPhone||'',wa=s.supportWhatsApp||'',address=s.supportAddress||'',message=s.supportMessage||'Yardıma mı ihtiyacınız var? Destek ekibimiz yanınızda.';
    return `<div class="platformContact ${compact?'compact':''}" data-platform-contact><div class="contactIntro"><b>${safe(message)}</b>${address?`<small>${safe(address)}</small>`:''}</div><div class="contactLinks">${phone?`<a href="tel:${phoneHref(phone)}">☎ ${safe(phone)}</a>`:''}${email?`<a href="mailto:${safe(email)}">✉ ${safe(email)}</a>`:''}${wa?`<a target="_blank" rel="noopener" href="https://wa.me/${whatsappHref(wa)}">◉ WhatsApp</a>`:''}${s.instagramUrl?`<a target="_blank" rel="noopener" href="${safe(s.instagramUrl)}">◎ Instagram</a>`:''}</div></div>`;
  }
  function apply(){
    if(!db?.settings)return;
    document.title=db.settings.platformName||'DakikaPro';
    const landing=document.querySelector('.landing,.dakikaproLanding');
    if(landing&&!landing.querySelector('.landingContact')){const footer=landing.querySelector('footer');if(footer){const wrap=document.createElement('div');wrap.className='landingContact';wrap.innerHTML=contactMarkup();footer.insertAdjacentElement('beforebegin',wrap);}}
    const publicBook=document.querySelector('.public .book');
    if(publicBook&&!publicBook.querySelector('[data-platform-contact]'))publicBook.insertAdjacentHTML('beforeend',contactMarkup(true));
    const auth=document.querySelector('.authcard');
    if(auth&&!auth.querySelector('[data-platform-contact]'))auth.insertAdjacentHTML('beforeend',contactMarkup(true));
    const business=document.querySelector('.shell .business-side');
    if(business&&!business.querySelector('.businessContact')&&location.hash==='#business'){const info=document.createElement('div');info.className='businessContact';info.innerHTML=contactMarkup(true);business.append(info);}
  }
  setInterval(apply,300);
})();
