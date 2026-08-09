/* Plan-based feature access. A higher plan becomes active immediately after plan change. */
setTimeout(() => {
  const planRank = { starter: 1, pro: 2, business: 3 };
  const requiredPlan = { businessAnalytics: 'pro' };
  const baseBusinessNav = window.businessNav;
  const baseBusinessGo = window.businessGo;
  const baseCreateEntity = window.createEntity;

  function canUse(section) {
    const tenant = tdata().t;
    return !requiredPlan[section] || (planRank[tenant.planId] || 1) >= planRank[requiredPlan[section]];
  }

  function lockMessage(section) {
    const planName = db.plans.find(item => item.id === requiredPlan[section])?.name || 'Profesyonel';
    return `${section === 'businessAnalytics' ? 'Analitik ve gelişmiş raporlar' : 'Bu bölüm'} ${planName} paketinden itibaren kullanılabilir.`;
  }

  window.businessNav = function () {
    const tenant = tdata().t;
    const items = [['business','Genel Bakış'],['appointments','Randevular'],['staff','Çalışanlar'],['services','Hizmetler'],['customers','Müşteriler'],['businessAnalytics','Analitik'],['businessSettings','İşletme & Sayfa'],['subscription','Paketim']];
    return `<aside class="sidebar business-side"><div class="brand">Dakika<span>Pro</span></div><div class="role">${clean(tenant.name)}</div>${items.map(([key,label]) => { const locked=!canUse(key); return `<button class="nav ${view===key?'active':''} ${locked?'planLocked':''}" onclick="businessGo('${key}')">${label}${locked?'<small>PRO</small>':''}</button>`; }).join('')}<div class="sidebottom"><button class="nav" onclick="ownerLogout()">Çıkış yap</button></div></aside>`;
  };

  window.businessGo = function (section) {
    if (!canUse(section)) {
      view = 'subscription'; location.hash = '#business'; render();
      setTimeout(() => toast(lockMessage(section) + ' Paket yükselttiğinizde otomatik açılır.'), 50);
      return;
    }
    baseBusinessGo(section);
  };

  window.createEntity = async function (event, type) {
    if (type === 'staff') {
      const tenant = tdata().t;
      const limit = db.plans.find(item => item.id === tenant.planId)?.staffLimit || 1;
      if (tdata().staff.length >= limit) {
        event.preventDefault(); closeModal(); view = 'subscription'; location.hash = '#business'; render();
        return toast(`Mevcut paketiniz en fazla ${limit} çalışan destekliyor. Paket yükselttiğinizde limit anında artar.`);
      }
    }
    return baseCreateEntity(event, type);
  };

  const style = document.createElement('style');
  style.textContent = '.nav.planLocked{opacity:.62;position:relative}.nav.planLocked small{float:right;background:#4f46e5;color:#fff;border-radius:10px;padding:2px 5px;font-size:9px;letter-spacing:.4px}.planAccessNote{margin-bottom:18px}';
  document.head.appendChild(style);
}, 120);

setInterval(()=>{
  if(location.hash!=='#business') return;
  const labels={business:'Kontrol Merkezi',appointments:'Randevu Takvimi',staff:'Ekip Yönetimi',services:'Hizmet Kataloğu',customers:'Müşteri Yönetimi',businessAnalytics:'Raporlar & Analiz',businessSettings:'İşletme Profili & Sayfa',subscription:'Paket & Ödemeler'};
  document.querySelectorAll('.business-side .nav').forEach(button=>{const action=button.getAttribute('onclick')||'',key=Object.keys(labels).find(id=>action.includes("'"+id+"'"));if(key){const badge=button.querySelector('small');button.childNodes[0].nodeValue=labels[key];if(badge)button.appendChild(badge);}});
},250);

const sectorDatalist=document.createElement('datalist');
sectorDatalist.id='dakikaProSectors';
sectorDatalist.innerHTML=['Berber','Kuaför','Güzellik Salonu','Nail Studio','Cilt Bakım & Estetik','Masaj & Spa','Psikolog & Danışmanlık','Diyetisyen','Fizyoterapi','Pilates & Fitness','Yoga Stüdyosu','Özel Ders & Kurs','Veteriner Kliniği','Sağlık & Klinik','Araç Servis & Bakım','Evcil Hayvan Bakımı','Diğer'].map(x=>`<option value="${x}">`).join('');
document.head.appendChild(sectorDatalist);
setInterval(()=>document.querySelectorAll('input[name="sector"]').forEach(input=>input.setAttribute('list','dakikaProSectors')),400);
