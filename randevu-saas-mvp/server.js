const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = __dirname;
const dataDir = process.env.DATA_DIR || path.join(root, 'data');
const dataFile = path.join(dataDir, 'database.json');
const publicDir = path.join(root, 'public');
const port = Number(process.env.PORT || 4173);
const sessions = new Map();
function hashPassword(password) { return crypto.createHash('sha256').update(String(password)).digest('hex'); }

function seed() {
  const today = new Date();
  const date = (offset) => { const d = new Date(today); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };
  return {
    settings: { trialDays: 30, currency: 'TRY', platformName: 'DakikaPro', supportEmail: 'destek@dakikapro.com', supportPhone: '0850 000 00 00', paymentProvider: 'iyzico', allowOnlinePayment: true, allowBankTransfer: true, iban: '', accountHolder: '', maintenanceMode: false, notifications: { trial: true, payment: true, appointment: true } },
    plans: [
      { id: 'starter', name: 'Başlangıç', price: 149, yearlyPrice: 1490, staffLimit: 2, featured: false, features: ['Online randevu sayfası', '2 çalışan', 'Hizmet ve müşteri yönetimi', 'Temel randevu takvimi'] },
      { id: 'pro', name: 'Profesyonel', price: 349, yearlyPrice: 3490, staffLimit: 8, featured: true, features: ['Başlangıç’taki her şey', '8 çalışan', 'Randevu durumu yönetimi', 'Müşteri geçmişi ve notlar', 'Öncelikli destek'] },
      { id: 'business', name: 'İşletme', price: 699, yearlyPrice: 6990, staffLimit: 30, featured: false, features: ['Profesyonel’deki her şey', '30 çalışan', 'Çok şubeli yapıya hazır altyapı', 'Gelişmiş raporlama', 'Özel destek'] }
    ],
    tenants: [
      { id: 't_demo', name: 'The Gentlemen’s Barber Club', slug: 'gentlemens-barber-club', sector: 'Premium Berber', status: 'trial', planId: 'pro', trialEndsAt: date(18), createdAt: date(-12), phone: '0216 450 21 21', address: 'Moda, Kadıköy · İstanbul', color: '#172554' },
      { id: 't_active', name: 'Luna Atelier Beauty', slug: 'luna-atelier-beauty', sector: 'Güzellik & Bakım', status: 'active', planId: 'business', trialEndsAt: null, createdAt: date(-90), phone: '0216 570 34 56', address: 'Nişantaşı, Şişli · İstanbul', color: '#be185d' }
    ],
    staff: [
      { id: 's1', tenantId: 't_demo', name: 'Arda Demir', title: 'Senior Barber', active: true },
      { id: 's2', tenantId: 't_demo', name: 'Kaan Eren', title: 'Grooming Specialist', active: true },
      { id: 's3', tenantId: 't_active', name: 'Lara Aydın', title: 'Cilt Bakım Uzmanı', active: true }
    ],
    services: [
      { id: 'v1', tenantId: 't_demo', name: 'Signature Haircut', duration: 45, price: 650, active: true },
      { id: 'v2', tenantId: 't_demo', name: 'Classic Grooming Ritual', duration: 60, price: 950, active: true },
      { id: 'v3', tenantId: 't_demo', name: 'Sakal Şekillendirme', duration: 30, price: 450, active: true },
      { id: 'v4', tenantId: 't_active', name: 'Hydra Glow Cilt Bakımı', duration: 75, price: 1800, active: true }
    ],
    customers: [
      { id: 'c1', tenantId: 't_demo', name: 'Mert Aydın', phone: '0534 111 22 33', visits: 8 },
      { id: 'c2', tenantId: 't_demo', name: 'Can Eren', phone: '0535 222 33 44', visits: 3 },
      { id: 'c3', tenantId: 't_active', name: 'Deniz Kılıç', phone: '0536 333 44 55', visits: 4 }
    ],
    owners: [
      { id: 'o_demo', tenantId: 't_demo', name: 'Ahmet Yılmaz', email: 'owner@makasberber.com', passwordHash: hashPassword('demo123') }
    ],
    admins: [
      { id: 'admin_1', name: 'Serkan Aktaş', email: 'sa@dakikapro.com', passwordHash: '367dc7290c4575ab0e9847869af3952af0007f8ef2b1799df065002d534582de' }
    ],
    appointments: [
      { id: 'a1', tenantId: 't_demo', customerId: 'c1', staffId: 's1', serviceId: 'v2', date: date(0), time: '10:00', status: 'confirmed', note: '' },
      { id: 'a2', tenantId: 't_demo', customerId: 'c2', staffId: 's2', serviceId: 'v1', date: date(0), time: '11:30', status: 'confirmed', note: '' },
      { id: 'a3', tenantId: 't_demo', customerId: 'c1', staffId: 's1', serviceId: 'v1', date: date(1), time: '14:00', status: 'pending', note: 'İlk kez gelecek' }
    ]
  };
}
function ensureDb() { fs.mkdirSync(path.dirname(dataFile), { recursive: true }); if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify(seed(), null, 2)); }
function readDb() { ensureDb(); const db=JSON.parse(fs.readFileSync(dataFile, 'utf8')); const savedSettings={...db.settings}; let changed=false;if(!db.owners){db.owners=[{id:'o_demo',tenantId:'t_demo',name:'Ahmet Yılmaz',email:'owner@makasberber.com',passwordHash:hashPassword('demo123')}];changed=true}if(!db.admins){db.admins=[{id:'admin_1',name:'Serkan Aktaş',email:'sa@dakikapro.com',passwordHash:'367dc7290c4575ab0e9847869af3952af0007f8ef2b1799df065002d534582de'}];changed=true}for(const admin of db.admins){if(admin.email==='sa@dadikapro.com'){admin.email='sa@dakikapro.com';changed=true}}Object.assign(db.settings,{supportEmail:'destek@dakikapro.com',supportPhone:'0850 000 00 00',paymentProvider:'iyzico',allowOnlinePayment:true,allowBankTransfer:true,iban:'',accountHolder:'',maintenanceMode:false,notifications:{trial:true,payment:true,appointment:true}},savedSettings);if(db.settings.platformName==='RandevuPro'){db.settings.platformName='DakikaPro';changed=true}if(db.settings.supportEmail==='destek@randevupro.com'){db.settings.supportEmail='destek@dakikapro.com';changed=true}if(!db.settings.pricingVersion){const priceMap={starter:[149,1490],pro:[349,3490],business:[699,6990]};for(const p of db.plans){if(priceMap[p.id]){p.price=priceMap[p.id][0];p.yearlyPrice=priceMap[p.id][1]}}db.settings.pricingVersion=1;changed=true}for(const p of db.plans){if(!p.yearlyPrice){p.yearlyPrice=Math.round(p.price*10);changed=true}}for(const t of db.tenants){if(!t.billingCycle){t.billingCycle='monthly';changed=true}if(!t.workingHours){t.workingHours='Pazartesi–Cumartesi, 09:00–19:00';changed=true}}if(changed)writeDb(db); return db; }
function writeDb(db) { fs.writeFileSync(dataFile, JSON.stringify(db, null, 2)); }
function id(prefix) { return `${prefix}_${crypto.randomBytes(5).toString('hex')}`; }
function json(res, code, body) { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); }
function parseBody(req) { return new Promise((resolve, reject) => { let raw=''; req.on('data', x => raw += x); req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Geçersiz JSON')); } }); }); }
function match(route, pathname) { const a = route.split('/').filter(Boolean), b = pathname.split('/').filter(Boolean); if (a.length !== b.length) return null; const p={}; for(let i=0;i<a.length;i++) { if(a[i][0]===':') p[a[i].slice(1)]=decodeURIComponent(b[i]); else if(a[i]!==b[i]) return null; } return p; }
function tenantData(db, tenantId) { return { tenant: db.tenants.find(x=>x.id===tenantId), staff: db.staff.filter(x=>x.tenantId===tenantId), services: db.services.filter(x=>x.tenantId===tenantId), customers: db.customers.filter(x=>x.tenantId===tenantId), appointments: db.appointments.filter(x=>x.tenantId===tenantId) }; }

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`); const incomingPath = url.pathname; const pathname = incomingPath.startsWith('/data/') ? '/api/'+incomingPath.slice('/data/'.length) : incomingPath;
  try {
    if (pathname.startsWith('/api/')) {
      const db = readDb(); let params;
      if (req.method === 'GET' && pathname === '/api/bootstrap') return json(res, 200, db);
      if (req.method === 'POST' && pathname === '/api/auth/signup') {
        const body=await parseBody(req); const slug=(body.slug||'').toLocaleLowerCase('tr-TR').replace(/[^a-z0-9ğüşıöç]+/g,'-').replace(/^-|-$/g,'');
        if(!body.name||!body.ownerName||!body.email||!body.password||!slug) return json(res,400,{error:'Lütfen tüm zorunlu alanları doldurun.'});
        if(db.tenants.some(x=>x.slug===slug)||db.owners.some(x=>x.email.toLowerCase()===body.email.toLowerCase())) return json(res,400,{error:'Bu bağlantı veya e-posta zaten kullanılıyor.'});
        const t={id:id('t'),name:body.name,slug,sector:body.sector||'Diğer',status:'trial',planId:body.planId||'starter',billingCycle:body.billingCycle==='yearly'?'yearly':'monthly',trialEndsAt:new Date(Date.now()+db.settings.trialDays*86400000).toISOString().slice(0,10),createdAt:new Date().toISOString().slice(0,10),phone:body.phone||'',address:body.address||'',color:'#4f46e5'};
        const owner={id:id('o'),tenantId:t.id,name:body.ownerName,email:body.email.toLowerCase(),passwordHash:hashPassword(body.password)};db.tenants.push(t);db.owners.push(owner);const token=crypto.randomBytes(24).toString('hex');sessions.set(token,{ownerId:owner.id,tenantId:t.id});writeDb(db);return json(res,201,{token,tenantId:t.id,owner:{name:owner.name,email:owner.email},tenant:t});
      }
      if (req.method === 'POST' && pathname === '/api/auth/login') {
        const body=await parseBody(req); const owner=db.owners.find(x=>x.email.toLowerCase()===(body.email||'').toLowerCase()&&x.passwordHash===hashPassword(body.password||''));if(!owner)return json(res,401,{error:'E-posta veya şifre hatalı.'});const token=crypto.randomBytes(24).toString('hex');sessions.set(token,{ownerId:owner.id,tenantId:owner.tenantId});return json(res,200,{token,tenantId:owner.tenantId,owner:{name:owner.name,email:owner.email}});
      }
      if (req.method === 'POST' && pathname === '/api/auth/admin-login') {
        const body=await parseBody(req);const admin=db.admins.find(x=>x.email.toLowerCase()===(body.email||'').toLowerCase()&&x.passwordHash===hashPassword(body.password||''));if(!admin)return json(res,401,{error:'Yönetim e-posta veya şifresi hatalı.'});const token=crypto.randomBytes(24).toString('hex');sessions.set(token,{adminId:admin.id,role:'admin'});return json(res,200,{token,admin:{name:admin.name,email:admin.email}});
      }
      if (req.method === 'POST' && pathname === '/api/support/password-reset') {
        const body=await parseBody(req); const email=(body.email||'').trim().toLowerCase();
        if(!email) return json(res,400,{error:'Kayıtlı e-posta adresinizi girin.'});
        const owner=db.owners.find(item=>item.email.toLowerCase()===email); const tenant=owner&&db.tenants.find(item=>item.id===owner.tenantId);
        db.supportRequests=db.supportRequests||[];
        if(owner&&!db.supportRequests.some(item=>item.type==='password-reset'&&item.email===email&&item.status==='open')) db.supportRequests.unshift({id:id('support'),type:'password-reset',status:'open',createdAt:new Date().toISOString(),email,phone:tenant?.phone||'',tenantId:tenant?.id||'',tenantName:tenant?.name||'',note:'İşletme şifre desteği talep etti. Arama yapılmalı.'});
        writeDb(db); return json(res,200,{success:true});
      }
      if (req.method === 'PATCH' && (params=match('/api/support/requests/:requestId',pathname))) {
        const token=(req.headers.authorization||'').replace(/^Bearer\s+/,''); const session=sessions.get(token); if(!session||session.role!=='admin') return json(res,403,{error:'Bu işlem yalnızca yönetici hesabıyla yapılabilir.'});
        const item=(db.supportRequests||[]).find(entry=>entry.id===params.requestId); if(!item) return json(res,404,{error:'Destek kaydı bulunamadı.'}); Object.assign(item,await parseBody(req)); writeDb(db); return json(res,200,item);
      }
      if (req.method === 'POST' && pathname === '/api/admins') {
        const body=await parseBody(req); if(!body.name||!body.email||!body.password)return json(res,400,{error:'Ad, e-posta ve şifre zorunludur.'}); if(db.admins.some(x=>x.email.toLowerCase()===body.email.toLowerCase()))return json(res,400,{error:'Bu e-posta ile kayıtlı bir yönetici var.'}); const admin={id:id('admin'),name:body.name,email:body.email.toLowerCase(),passwordHash:hashPassword(body.password)};db.admins.push(admin);writeDb(db);return json(res,201,{id:admin.id,name:admin.name,email:admin.email});
      }
      if (req.method === 'PATCH' && (params=match('/api/admins/:adminId',pathname))) {
        const body=await parseBody(req);const admin=db.admins.find(x=>x.id===params.adminId);if(!admin)return json(res,404,{error:'Yönetici bulunamadı'});if(body.email&&db.admins.some(x=>x.id!==admin.id&&x.email.toLowerCase()===body.email.toLowerCase()))return json(res,400,{error:'Bu e-posta kullanımda.'});if(body.name)admin.name=body.name;if(body.email)admin.email=body.email.toLowerCase();if(body.password)admin.passwordHash=hashPassword(body.password);writeDb(db);return json(res,200,{id:admin.id,name:admin.name,email:admin.email});
      }
      if (req.method === 'GET' && (params=match('/api/public/:slug/customer', pathname))) {
        const t=db.tenants.find(x=>x.slug===params.slug && x.status!=='inactive'); if(!t) return json(res,404,{error:'İşletme bulunamadı'});
        const phone=(url.searchParams.get('phone')||'').trim(); const customer=db.customers.find(x=>x.tenantId===t.id && x.phone===phone);
        if(!customer) return json(res,404,{error:'Bu telefon numarasıyla kayıtlı randevu bulunamadı.'});
        const appointments=db.appointments.filter(x=>x.tenantId===t.id&&x.customerId===customer.id).map(a=>({...a,service:db.services.find(s=>s.id===a.serviceId)?.name||'Hizmet',staff:db.staff.find(s=>s.id===a.staffId)?.name||'Çalışan'}));
        return json(res,200,{tenant:{id:t.id,name:t.name,slug:t.slug,sector:t.sector,color:t.color},customer,appointments});
      }
      if (req.method === 'PATCH' && (params=match('/api/public/:slug/appointments/:appointmentId', pathname))) {
        const body=await parseBody(req); const t=db.tenants.find(x=>x.slug===params.slug && x.status!=='inactive'); const a=db.appointments.find(x=>x.id===params.appointmentId&&x.tenantId===t?.id); const customer=db.customers.find(x=>x.id===a?.customerId&&x.phone===(body.phone||'').trim());
        if(!t||!a||!customer) return json(res,404,{error:'Randevu bulunamadı.'});
        if(body.status==='cancelled') a.status='cancelled';
        else if(body.date&&body.time) { const clash=db.appointments.some(x=>x.id!==a.id&&x.tenantId===t.id&&x.staffId===a.staffId&&x.date===body.date&&x.time===body.time&&x.status!=='cancelled'); if(clash)return json(res,409,{error:'Bu saat artık dolu. Lütfen başka bir saat seçin.'}); a.date=body.date;a.time=body.time;a.status='pending';a.note='Müşteri tarih/saat değişikliği talebi'; }
        else return json(res,400,{error:'Geçerli bir değişiklik seçin.'}); writeDb(db); return json(res,200,a);
      }
      if (req.method === 'GET' && (params=match('/api/public/:slug', pathname))) { const t=db.tenants.find(x=>x.slug===params.slug && x.status!=='inactive'); if(!t) return json(res,404,{error:'İşletme bulunamadı'}); const d=tenantData(db,t.id); return json(res,200,{tenant:t,staff:d.staff,services:d.services}); }
      if (req.method === 'GET' && (params=match('/api/tenant/:tenantId', pathname))) return json(res, 200, tenantData(db, params.tenantId));
      if (req.method === 'POST' && pathname === '/api/tenants') { const body=await parseBody(req); const slug=(body.slug||'').toLocaleLowerCase('tr-TR').replace(/[^a-z0-9ğüşıöç]+/g,'-').replace(/^-|-$/g,''); if(!body.name||!slug||db.tenants.some(x=>x.slug===slug)) return json(res,400,{error:'İşletme adı ve benzersiz bağlantı gerekir.'}); const t={id:id('t'),name:body.name,slug,sector:body.sector||'Diğer',status:'trial',planId:body.planId||'starter',trialEndsAt:new Date(Date.now()+db.settings.trialDays*86400000).toISOString().slice(0,10),createdAt:new Date().toISOString().slice(0,10),phone:body.phone||'',address:body.address||'',color:'#4f46e5'}; db.tenants.push(t); writeDb(db); return json(res,201,t); }
      if (req.method === 'PATCH' && (params=match('/api/tenants/:tenantId',pathname))) { const t=db.tenants.find(x=>x.id===params.tenantId); if(!t)return json(res,404,{error:'Bulunamadı'}); Object.assign(t,await parseBody(req)); writeDb(db); return json(res,200,t); }
      if (req.method === 'POST' && (params=match('/api/tenants/:tenantId/reset-owner-password',pathname))) {
        const token=(req.headers.authorization||'').replace(/^Bearer\s+/,''); const session=sessions.get(token);
        if(!session||session.role!=='admin') return json(res,403,{error:'Bu işlem yalnızca yönetici hesabıyla yapılabilir.'});
        const body=await parseBody(req); if(!body.password||String(body.password).length<6) return json(res,400,{error:'Yeni şifre en az 6 karakter olmalıdır.'});
        const owner=db.owners.find(x=>x.tenantId===params.tenantId); if(!owner) return json(res,404,{error:'Bu işletme için giriş hesabı bulunamadı.'});
        owner.passwordHash=hashPassword(body.password); writeDb(db); return json(res,200,{success:true,email:owner.email});
      }
      if (req.method === 'DELETE' && (params=match('/api/tenants/:tenantId',pathname))) {
        const index=db.tenants.findIndex(x=>x.id===params.tenantId); if(index<0)return json(res,404,{error:'İşletme bulunamadı'});
        db.tenants.splice(index,1); for(const collection of ['staff','services','customers','appointments','owners']) db[collection]=db[collection].filter(x=>x.tenantId!==params.tenantId); writeDb(db); return json(res,200,{success:true});
      }
      if (req.method === 'POST' && (params=match('/api/tenant/:tenantId/:collection',pathname))) { const body=await parseBody(req); const valid=['staff','services','customers','appointments']; if(!valid.includes(params.collection))return json(res,404,{error:'Geçersiz koleksiyon'}); const singular={staff:'s',services:'v',customers:'c',appointments:'a'}[params.collection]; const item={...body,id:id(singular),tenantId:params.tenantId}; db[params.collection].push(item); writeDb(db); return json(res,201,item); }
      if (req.method === 'PATCH' && (params=match('/api/:collection/:itemId',pathname))) { const valid=['staff','services','customers','appointments','plans']; if(!valid.includes(params.collection))return json(res,404,{error:'Geçersiz koleksiyon'}); const item=db[params.collection].find(x=>x.id===params.itemId); if(!item)return json(res,404,{error:'Bulunamadı'}); Object.assign(item,await parseBody(req)); writeDb(db); return json(res,200,item); }
      if (req.method === 'DELETE' && (params=match('/api/:collection/:itemId',pathname))) { const valid=['staff','services']; if(!valid.includes(params.collection))return json(res,404,{error:'Geçersiz koleksiyon'}); const index=db[params.collection].findIndex(x=>x.id===params.itemId); if(index<0)return json(res,404,{error:'Bulunamadı'}); const item=db[params.collection][index]; const inUse=db.appointments.some(a=>(params.collection==='staff'?a.staffId:a.serviceId)===item.id&&a.status!=='cancelled'); if(inUse)return json(res,409,{error:'Bu kayıt randevularda kullanıldığı için silinemez. Önce pasife alabilirsiniz.'}); db[params.collection].splice(index,1); writeDb(db); return json(res,200,{success:true}); }
      if (req.method === 'POST' && pathname === '/api/plans') { const body=await parseBody(req); const item={id:id('plan'),name:body.name,price:Number(body.price)||0,yearlyPrice:Number(body.yearlyPrice)||Math.round((Number(body.price)||0)*10),staffLimit:Number(body.staffLimit)||1,features:Array.isArray(body.features)?body.features:[],featured:false}; db.plans.push(item);writeDb(db);return json(res,201,item); }
      if (req.method === 'PATCH' && pathname === '/api/settings') { Object.assign(db.settings,await parseBody(req));writeDb(db);return json(res,200,db.settings); }
      return json(res,404,{error:'API bulunamadı'});
    }
    let filePath = pathname === '/' ? path.join(publicDir,'index.html') : path.join(publicDir, pathname);
    if (!filePath.startsWith(publicDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) filePath=path.join(publicDir,'index.html');
    const ext=path.extname(filePath); const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'}[ext]||'application/octet-stream';
    res.writeHead(200,{'Content-Type':mime}); fs.createReadStream(filePath).pipe(res);
  } catch (err) { json(res, 500, { error: err.message || 'Sunucu hatası' }); }
});
function listen(activePort) {
  server.once('error', err => {
    if (err.code === 'EADDRINUSE' && activePort < port + 10) return listen(activePort + 1);
    throw err;
  });
  server.listen(activePort, () => console.log(`DakikaPro hazır: http://localhost:${activePort}`));
}
listen(port);
