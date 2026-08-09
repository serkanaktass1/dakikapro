// Kept separate so optional UI extensions can be registered without changing the main bundle bootstrap line.
window.deleteTenant = deleteTenant;

function addLandingVisualStory() {
  const main = document.querySelector('.landing main');
  if (!main || document.querySelector('#visualStory')) return;
  main.insertAdjacentHTML('beforeend', `<section id="visualStory" class="section visualStory"><div class="visualCopy"><div class="eyebrow">Müşteri deneyimi</div><h2>Randevu almak, mesajlaşmak kadar kolay.</h2><p>Müşteriler hizmeti, uzmanı ve saati seçer. Siz ise takvimi, müşteri geçmişini ve işletmenizin büyümesini tek panelden yönetirsiniz.</p><div class="visualPoints"><span>✓ Markanıza ait randevu sayfası</span><span>✓ Telefon için takvime ekleme</span><span>✓ Paylaşılabilir randevu özeti</span></div></div><img src="/assets/booking-experience.png" alt="Telefonla online randevu seçen müşteri"></section>`);
}

function addAuthVisual() {
  const page = document.querySelector('.authpage');
  if (!page || page.querySelector('.authVisual')) return;
  page.insertAdjacentHTML('beforeend', `<aside class="authVisual"><img src="/assets/dashboard-showcase.png" alt="Randevu ve işletme analitiği ekranı"><div class="authVisualCopy"><span>Randevular tek yerde</span><h2>İşletmenizin tüm ritmi kontrolünüz altında.</h2><p>Takvim, müşteriler, ekip ve gelir görünümü tek bir sade panelde.</p><div class="authMiniStats"><b>24/7</b><b>Tek bağlantı</b><b>Kolay yönetim</b></div></div></aside>`);
}

function addPanelSpotlight() {
  const main = document.querySelector('.shell .main');
  const heading = main?.querySelector('.top h1');
  if (!main || !heading || main.querySelector('.dashboardSpotlight')) return;
  if (!['Platforma genel bakış', 'Makas Berber', 'Luna Güzellik'].includes(heading.textContent.trim())) return;
  main.querySelector('.top').insertAdjacentHTML('afterend', `<section class="dashboardSpotlight"><div><span>RandevuPro görünümü</span><h2>İşletmenizin büyümesini daha net görün.</h2><p>Önemli performans göstergeleri ve güncel işletme bilgileri tek bakışta.</p></div><img src="/assets/dashboard-showcase.png" alt="RandevuPro dashboard görseli"></section>`);
}

function applyDakikaProBrand() {
  document.title = 'DakikaPro';
  document.querySelectorAll('.brand').forEach(brand => {
    if (brand.dataset.dakikaPro) return;
    brand.dataset.dakikaPro = 'true';
    brand.innerHTML = '<img class="brandLogo" src="/assets/dakikapro-logo.png" alt="DakikaPro"><span>Dakika</span><span class="brandPro">Pro</span>';
  });
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    if (node.nodeValue.includes('RandevuPro')) node.nodeValue = node.nodeValue.replaceAll('RandevuPro', 'DakikaPro');
    if (node.nodeValue.includes('randevupro')) node.nodeValue = node.nodeValue.replaceAll('randevupro', 'dakikapro');
  });
}

function polishDemoExperience() {
  document.querySelectorAll('.authcard .sub').forEach(item => {
    if (item.textContent.includes('Demo giriş') || item.textContent.includes('Demo:')) item.remove();
  });
  const mockUrl = document.querySelector('.mocktop b');
  const mockName = document.querySelector('.mocktitle');
  if (mockUrl) mockUrl.textContent = 'dakikapro.com/demo';
  if (mockName) mockName.textContent = 'DakikaPro Demo';
}

async function openAdmins() {
  try {
    const response = await fetch('/data/bootstrap');
    const data = await response.json();
    const admins = data.admins || [];
    const main = document.querySelector('.shell .main');
    if (!main) return;
    main.innerHTML = `<div class="top"><div><h1>Yönetici hesapları</h1><p>Platform yöneticilerini ekleyin ve hesap erişimini düzenleyin.</p></div></div><section class="card"><div class="toolbar"><div><h2>Aktif yöneticiler</h2><span class="sub">Yönetici şifreleri yalnızca ilgili yönetici tarafından değiştirilebilir.</span></div></div><div class="tablewrap"><table class="table"><thead><tr><th>Ad</th><th>E-posta</th></tr></thead><tbody>${admins.map(admin => `<tr><td class="name">${safeText(admin.name)}</td><td>${safeText(admin.email)}</td></tr>`).join('')}</tbody></table></div></section><section class="card" style="margin-top:18px"><h2>Yeni yönetici ekle</h2><form class="form" onsubmit="addAdmin(event)"><label class="field full">Ad soyad<input required name="name"></label><label class="field">E-posta<input required type="email" name="email"></label><label class="field">Geçici şifre<input required minlength="8" type="password" name="password"></label><div class="modalfoot field full"><button class="btn">Yönetici ekle</button></div></form></section>`;
  } catch { alert('Yönetici hesapları yüklenemedi.'); }
}

async function addAdmin(event) {
  event.preventDefault();
  const body = Object.fromEntries(new FormData(event.target));
  const response = await fetch('/data/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) return alert(data.error || 'Yönetici eklenemedi.');
  alert('Yeni yönetici eklendi.');
  openAdmins();
}

function addManagerLink() {
  const side = document.querySelector('.sidebar:not(.business-side)');
  if (!side || side.querySelector('[data-managers]')) return;
  const button = document.createElement('button');
  button.className = 'nav';
  button.dataset.managers = 'true';
  button.textContent = 'Yönetici Hesapları';
  button.onclick = openAdmins;
  side.insertBefore(button, side.querySelector('.sidebottom'));
}

window.openAdmins = openAdmins;
window.addAdmin = addAdmin;

new MutationObserver(() => { addLandingVisualStory(); addAuthVisual(); addPanelSpotlight(); applyDakikaProBrand(); polishDemoExperience(); addManagerLink(); }).observe(document.body, { childList: true, subtree: true });
addLandingVisualStory();
addAuthVisual();
addPanelSpotlight();
applyDakikaProBrand();
polishDemoExperience();
addManagerLink();

let testimonialOffset = 0;
const reviewPhrases = [
  'Online randevu bağlantımızı paylaşınca telefon trafiğimiz gözle görülür şekilde azaldı.',
  'Takvim ve müşteri geçmişi sayesinde ekip içindeki randevu karışıklığı bitti.',
  'Küçük bir ekip olarak başladık; işletme büyüdükçe paketi yükseltmek çok kolay oldu.',
  'Müşterilerimiz kendi saatini seçebiliyor, biz de günümüze daha rahat odaklanıyoruz.',
  'Markamıza ait randevu sayfası profesyonel bir ilk izlenim oluşturdu.'
];

function safeText(value) {
  return String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

async function refreshLandingContent() {
  const examples = document.querySelector('.exampleCards');
  const testimonials = document.querySelector('.testimonials .benefits');
  if (!examples && !testimonials) return;
  try {
    const response = await fetch('/data/bootstrap');
    if (!response.ok) return;
    const data = await response.json();
    const tenants = (data.tenants || []).filter(tenant => tenant.status !== 'inactive');
    if (examples) {
      examples.innerHTML = tenants.map(tenant => `<article class="exampleCard" style="--accent:${safeText(tenant.color || '#4f46e5')}"><div class="exampleMark">${safeText(tenant.name.slice(0, 1))}</div><div><span class="sub">${safeText(tenant.sector)}</span><h3>${safeText(tenant.name)}</h3><p>${safeText(tenant.address || 'Online randevu')}</p><a class="link" href="/#book/${encodeURIComponent(tenant.slug)}">Randevu sayfasını gör →</a></div></article>`).join('');
    }
    if (testimonials && tenants.length) {
      const rotated = tenants.map((tenant, index) => ({ tenant, index })).slice(testimonialOffset % tenants.length).concat(tenants.map((tenant, index) => ({ tenant, index })).slice(0, testimonialOffset % tenants.length)).slice(0, Math.min(3, tenants.length));
      testimonials.innerHTML = rotated.map(({ tenant, index }) => `<article><div class="stars">★★★★★</div><p>“${safeText(reviewPhrases[(index + testimonialOffset) % reviewPhrases.length])}”</p><h3>${safeText(tenant.name)}</h3><span class="sub">${safeText(tenant.sector)} · ${safeText(tenant.address || 'RandevuPro işletmesi')}</span></article>`).join('');
      testimonialOffset += 1;
    }
  } catch { /* Local server is not running yet. */ }
}

setInterval(refreshLandingContent, 8000);
refreshLandingContent();

// Business catalogue management: edit, archive, delete, and staff photo URL support.
window.collection = function managedCollection(type) {
  const d = tdata();
  const records = type === 'staff' ? d.staff : d.services;
  const title = type === 'staff' ? 'Çalışanlar' : 'Hizmetler';
  const addLabel = type === 'staff' ? '+ Çalışan ekle' : '+ Hizmet ekle';
  const rows = records.map(item => {
    const main = type === 'staff'
      ? `<td class="staffCell">${item.imageUrl ? `<img class="staffPhoto" src="${esc(item.imageUrl)}" alt="${esc(item.name)}">` : `<span class="staffPlaceholder">${esc(item.name || '?').slice(0, 1)}</span>`}<div><b>${esc(item.name)}</b><span class="sub">${esc(item.title || 'Unvan belirtilmedi')}</span></div></td>`
      : `<td class="name"><b>${esc(item.name)}</b><span class="sub">${item.duration || 0} dk · ${fmt(item.price)}</span></td>`;
    return `<tr>${main}<td>${status(item.active !== false ? 'active' : 'inactive')}</td><td class="actions"><button class="iconbtn" onclick="entityModal('${type}','${item.id}')">Düzenle</button><button class="iconbtn" onclick="deleteEntity('${type}','${item.id}')">Sil</button></td></tr>`;
  }).join('') || `<tr><td colspan="3" class="sub">Henüz kayıt yok.</td></tr>`;
  return `<section class="card"><div class="toolbar"><div><h2>${title}</h2><span class="sub">${records.length} kayıt · Düzenleyebilir, pasife alabilir veya silebilirsiniz.</span></div><button class="btn" onclick="entityModal('${type}')">${addLabel}</button></div><div class="tablewrap"><table class="table"><thead><tr><th>${type === 'staff' ? 'Çalışan' : 'Hizmet'}</th><th>Durum</th><th>İşlem</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
};

window.entityModal = function managedEntityModal(type, itemId = '') {
  const item = itemId ? (type === 'staff' ? tdata().staff : tdata().services).find(entry => entry.id === itemId) : {};
  const isStaff = type === 'staff';
  modal(`<h2>${itemId ? (isStaff ? 'Çalışanı düzenle' : 'Hizmeti düzenle') : (isStaff ? 'Çalışan ekle' : 'Hizmet ekle')}</h2><form class="form" onsubmit="saveManagedEntity(event,'${type}','${itemId}')"><label class="field full">${isStaff ? 'Ad soyad' : 'Hizmet adı'}<input required name="name" value="${esc(item.name || '')}"></label>${isStaff ? `<label class="field">Uzmanlık / unvan<input required name="title" value="${esc(item.title || '')}" placeholder="Örn. Saç tasarım uzmanı"></label><label class="field">Fotoğraf bağlantısı <input type="url" name="imageUrl" value="${esc(item.imageUrl || '')}" placeholder="https://.../calisan.jpg"></label><p class="sub field full">Görsel yüklemek için önce fotoğrafı bir web adresine yükleyin, ardından bağlantıyı buraya yapıştırın.</p>` : `<label class="field">Süre (dakika)<input required min="5" type="number" name="duration" value="${item.duration || 30}"></label><label class="field">Fiyat (₺)<input required min="0" type="number" name="price" value="${item.price ?? ''}"></label>`}<label class="field full">Durum<select name="active"><option value="true" ${item.active !== false ? 'selected' : ''}>Aktif — müşteriler görebilir</option><option value="false" ${item.active === false ? 'selected' : ''}>Pasif — müşteriler göremez</option></select></label><div class="modalfoot field full"><button type="button" class="btn ghost" onclick="closeModal()">Vazgeç</button><button class="btn">${itemId ? 'Değişiklikleri kaydet' : 'Ekle'}</button></div></form>`);
};

window.saveManagedEntity = async function saveManagedEntity(event, type, itemId) {
  event.preventDefault();
  const value = Object.fromEntries(new FormData(event.target));
  value.active = value.active === 'true';
  if (type === 'services') { value.duration = Number(value.duration); value.price = Number(value.price); }
  await api(itemId ? `${type}/${itemId}` : `tenant/${tenantId}/${type}`, itemId ? 'PATCH' : 'POST', value);
  closeModal(); toast(itemId ? 'Değişiklikler kaydedildi' : 'Kayıt eklendi'); reload();
};

window.deleteEntity = async function deleteEntity(type, itemId) {
  if (!confirm('Bu kaydı silmek istediğinize emin misiniz? Randevularda kullanılan kayıtlar silinemez; önce pasife alabilirsiniz.')) return;
  try { await api(`${type}/${itemId}`, 'DELETE'); toast('Kayıt silindi'); reload(); } catch (error) { toast(error.message); }
};
