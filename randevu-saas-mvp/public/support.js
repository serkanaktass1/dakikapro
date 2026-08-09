/* Password help requests: records the request for the admin to call the business. */
setTimeout(() => {
  window.forgotPassword = function () {
    modal(`<h2>Şifre desteği</h2><p>Kayıtlı e-posta adresinizi yazın. Talebiniz DakikaPro yönetimine iletilecek ve işletmeniz kayıtlı telefon numarasından aranacaktır.</p><form class="form" onsubmit="submitPasswordHelp(event)"><label class="field full">Kayıtlı e-posta adresi<input required type="email" name="email" placeholder="ornek@isletme.com"></label><div class="modalfoot field full"><button type="button" class="btn ghost" onclick="closeModal()">Vazgeç</button><button class="btn">Yönetime bildir</button></div></form>`);
  };
  window.submitPasswordHelp = async function (event) {
    event.preventDefault(); const values=Object.fromEntries(new FormData(event.target));
    try { await api('support/password-reset','POST',values); closeModal(); toast('Talebiniz yönetime iletildi. Kayıtlı telefon numaranızdan aranacaksınız.'); }
    catch (error) { toast(error.message); }
  };
  const baseOverview = window.overview;
  window.overview = function () {
    const requests=(db.supportRequests||[]).filter(item=>item.status==='open');
    return `${baseOverview()}<section class="card" style="margin-top:18px"><div class="toolbar"><div><h2>Şifre desteği talepleri</h2><span class="sub">İşletme sahibi araması bekleyen talepler.</span></div><span class="pill pending">${requests.length} açık</span></div>${requests.map(item=>`<div class="listitem"><div><b>${clean(item.tenantName||'Kayıtlı işletme')}</b><span class="sub">${clean(item.email)} · ${clean(item.phone||'Telefon bilgisi yok')} · Arama bekliyor</span></div><button class="iconbtn" onclick="completeSupportRequest('${item.id}')">Arandı / tamamla</button></div>`).join('')||'<p class="sub">Açık şifre desteği talebi yok.</p>'}</section>`;
  };
  window.completeSupportRequest = async function (id) {
    try { await fetch(`/data/support/requests/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${adminSession?.token||''}`},body:JSON.stringify({status:'completed',completedAt:new Date().toISOString()})}); await reload(); toast('Destek talebi tamamlandı olarak işaretlendi.'); }
    catch (error) { toast('Destek talebi güncellenemedi.'); }
  };
}, 160);
