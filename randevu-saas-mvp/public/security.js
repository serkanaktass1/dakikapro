/* Secure administrator password reset for business owners. Passwords are never displayed. */
setTimeout(() => {
  const originalEditTenant = window.editTenantModal;
  window.editTenantModal = function (id) {
    originalEditTenant(id);
    const formFooter = document.querySelector('.modal .modalfoot');
    if (!formFooter || document.querySelector('.reset-owner-password')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn ghost reset-owner-password';
    button.textContent = 'Giriş şifresini yenile';
    button.onclick = () => window.resetOwnerPasswordModal(id);
    formFooter.prepend(button);
  };

  window.resetOwnerPasswordModal = function (tenantId) {
    const tenant = db.tenants.find(item => item.id === tenantId);
    modal(`<h2>İşletme giriş şifresini yenile</h2><p>${clean(tenant?.name || 'İşletme')} için yeni giriş şifresi belirleyin. Mevcut şifre güvenlik nedeniyle görüntülenmez.</p><form class="form" onsubmit="resetOwnerPassword(event,'${tenantId}')"><label class="field full">Yeni şifre<input required minlength="6" type="password" name="password" placeholder="En az 6 karakter"></label><label class="field full">Yeni şifre tekrar<input required minlength="6" type="password" name="passwordConfirm" placeholder="Şifreyi tekrar yazın"></label><div class="modalfoot field full"><button type="button" class="btn ghost" onclick="editTenantModal('${tenantId}')">Geri</button><button class="btn">Şifreyi yenile</button></div></form>`);
  };

  window.resetOwnerPassword = async function (event, tenantId) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.target));
    if (values.password !== values.passwordConfirm) return toast('Şifreler aynı değil.');
    try {
      const response = await fetch(`/data/tenants/${tenantId}/reset-owner-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminSession?.token || ''}` },
        body: JSON.stringify({ password: values.password })
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || 'Şifre yenilenemedi.');
      closeModal(); toast('İşletme giriş şifresi yenilendi. Yeni şifreyi işletme sahibine iletebilirsiniz.');
    } catch (error) { toast(error.message); }
  };
}, 100);
