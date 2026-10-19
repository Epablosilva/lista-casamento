/**
 * LISTA DE PRESENTES DE CASAMENTO & CHECKLIST INTERATIVO
 * Script Principal da Aplicação
 */

(function () {
  'use strict';

  // State
  let state = {
    items: [],
    config: {},
    stats: { total: 0, reservedCount: 0, availableCount: 0, percentage: 0 },
    categories: [],
    currentCategory: 'all',
    currentStatus: 'all',
    searchQuery: '',
    currentSort: 'default',
    adminPin: localStorage.getItem('wedding_admin_pin') || null,
    isAdmin: false
  };

  // Elements
  const el = {
    navCoupleNames: document.getElementById('navCoupleNames'),
    heroMonogram: document.getElementById('heroMonogram'),
    heroCoupleNames: document.getElementById('heroCoupleNames'),
    heroWeddingDate: document.getElementById('heroWeddingDate'),
    welcomeTitle: document.getElementById('welcomeTitle'),
    welcomeMessage: document.getElementById('welcomeMessage'),
    footerCoupleNames: document.getElementById('footerCoupleNames'),

    // Pix
    pixContainer: document.getElementById('pixContainer'),
    pixKeyInput: document.getElementById('pixKeyInput'),
    pixRecipient: document.getElementById('pixRecipient'),
    btnCopyPix: document.getElementById('btnCopyPix'),

    // Countdown
    countDays: document.getElementById('countDays'),
    countHours: document.getElementById('countHours'),
    countMinutes: document.getElementById('countMinutes'),
    countSeconds: document.getElementById('countSeconds'),

    // Stats
    statReserved: document.getElementById('statReserved'),
    statAvailable: document.getElementById('statAvailable'),
    statTotal: document.getElementById('statTotal'),
    progressBarFill: document.getElementById('progressBarFill'),
    progressText: document.getElementById('progressText'),

    // Controls
    searchInput: document.getElementById('searchInput'),
    btnClearSearch: document.getElementById('btnClearSearch'),
    sortSelect: document.getElementById('sortSelect'),
    categoryPills: document.getElementById('categoryPills'),
    statusPills: document.querySelectorAll('.status-pill'),
    countStatusAll: document.getElementById('countStatusAll'),
    countStatusAvailable: document.getElementById('countStatusAvailable'),
    countStatusReserved: document.getElementById('countStatusReserved'),

    // Grid & States
    giftGrid: document.getElementById('giftGrid'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    emptyState: document.getElementById('emptyState'),
    btnResetFilters: document.getElementById('btnResetFilters'),

    // Admin Elements
    btnAdminAccess: document.getElementById('btnAdminAccess'),
    adminBanner: document.getElementById('adminBanner'),
    adminMsgCount: document.getElementById('adminMsgCount'),
    btnOpenAddItem: document.getElementById('btnOpenAddItem'),
    btnOpenMessages: document.getElementById('btnOpenMessages'),
    btnExportCsv: document.getElementById('btnExportCsv'),
    btnOpenConfig: document.getElementById('btnOpenConfig'),
    btnLogoutAdmin: document.getElementById('btnLogoutAdmin'),

    // Modals
    modalReserve: document.getElementById('modalReserve'),
    formReserve: document.getElementById('formReserve'),
    reserveItemId: document.getElementById('reserveItemId'),
    reserveGiftPreview: document.getElementById('reserveGiftPreview'),
    guestName: document.getElementById('guestName'),
    guestPhone: document.getElementById('guestPhone'),
    guestMessage: document.getElementById('guestMessage'),

    modalSuccess: document.getElementById('modalSuccess'),
    successItemTitle: document.getElementById('successItemTitle'),

    modalAdminLogin: document.getElementById('modalAdminLogin'),
    formAdminLogin: document.getElementById('formAdminLogin'),
    adminPinInput: document.getElementById('adminPinInput'),
    adminLoginError: document.getElementById('adminLoginError'),

    modalItemForm: document.getElementById('modalItemForm'),
    formItem: document.getElementById('formItem'),
    itemFormId: document.getElementById('itemFormId'),
    itemFormTitle: document.getElementById('itemFormTitle'),
    itemFormIconBadge: document.getElementById('itemFormIconBadge'),
    itemInputTitle: document.getElementById('itemInputTitle'),
    itemInputCategory: document.getElementById('itemInputCategory'),
    itemInputDescription: document.getElementById('itemInputDescription'),
    itemInputSuggestedUrl: document.getElementById('itemInputSuggestedUrl'),
    itemInputImageUrl: document.getElementById('itemInputImageUrl'),
    itemInputIcon: document.getElementById('itemInputIcon'),

    modalMessages: document.getElementById('modalMessages'),
    adminMessagesList: document.getElementById('adminMessagesList'),
    msgTotalCount: document.getElementById('msgTotalCount'),
    btnDownloadCsvInModal: document.getElementById('btnDownloadCsvInModal'),

    modalConfig: document.getElementById('modalConfig'),
    formConfig: document.getElementById('formConfig'),
    cfgCoupleNames: document.getElementById('cfgCoupleNames'),
    cfgWeddingDate: document.getElementById('cfgWeddingDate'),
    cfgWelcomeTitle: document.getElementById('cfgWelcomeTitle'),
    cfgWelcomeMessage: document.getElementById('cfgWelcomeMessage'),
    cfgPixKey: document.getElementById('cfgPixKey'),
    cfgPixName: document.getElementById('cfgPixName'),
    cfgNewPin: document.getElementById('cfgNewPin'),

    toast: document.getElementById('toast'),
    toastIcon: document.getElementById('toastIcon'),
    toastMessage: document.getElementById('toastMessage')
  };

  let countdownInterval = null;

  // Initialize
  init();

  async function init() {
    setupEventListeners();
    await checkAdminStatus();
    await loadData();
    startCountdown();
  }

  // Check stored PIN
  async function checkAdminStatus() {
    if (!state.adminPin) {
      state.isAdmin = false;
      updateAdminUI();
      return;
    }
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: state.adminPin })
      });
      if (res.ok) {
        state.isAdmin = true;
      } else {
        state.isAdmin = false;
        state.adminPin = null;
        localStorage.removeItem('wedding_admin_pin');
      }
    } catch {
      state.isAdmin = false;
    }
    updateAdminUI();
  }

  // Load data from API
  async function loadData() {
    el.loadingIndicator.classList.remove('hidden');
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('Falha ao carregar dados');
      const data = await res.json();
      
      state.config = data.config || {};
      state.items = data.items || [];
      state.stats = data.stats || {};
      state.categories = data.categories || [];

      renderConfig();
      renderStats();
      renderCategoryPills();
      renderItems();
    } catch (err) {
      console.error(err);
      showToast('Erro ao carregar lista de presentes.', '⚠️');
    } finally {
      el.loadingIndicator.classList.add('hidden');
    }
  }

  // Render header / config texts
  function renderConfig() {
    const names = state.config.coupleNames || 'Noivos';
    el.navCoupleNames.textContent = `Casamento ${names}`;
    el.heroCoupleNames.textContent = names;
    el.footerCoupleNames.textContent = names;

    // Monogram (e.g. S & L)
    const initials = names.split('&').map(part => part.trim().charAt(0)).filter(Boolean).join(' & ');
    el.heroMonogram.textContent = initials || '💍';

    if (state.config.welcomeTitle) {
      el.welcomeTitle.textContent = state.config.welcomeTitle;
    }
    if (state.config.welcomeMessage) {
      el.welcomeMessage.textContent = state.config.welcomeMessage;
    }

    // Wedding date text
    if (state.config.weddingDate) {
      const d = new Date(state.config.weddingDate + 'T00:00:00');
      const formatted = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      el.heroWeddingDate.innerHTML = `<i class="fa-regular fa-calendar-check"></i> ${formatted}`;
    }

    // Pix
    if (state.config.pixKey) {
      el.pixContainer.classList.remove('hidden');
      el.pixKeyInput.value = state.config.pixKey;
      el.pixRecipient.textContent = state.config.pixName ? `Titular: ${state.config.pixName}` : '';
    } else {
      el.pixContainer.classList.add('hidden');
    }
  }

  // Render Progress & Statistics
  function renderStats() {
    const total = state.items.length;
    const reservedCount = state.items.filter(i => i.reserved).length;
    const availableCount = total - reservedCount;
    const percentage = total > 0 ? Math.round((reservedCount / total) * 100) : 0;

    el.statTotal.textContent = total;
    el.statReserved.textContent = reservedCount;
    el.statAvailable.textContent = availableCount;

    el.countStatusAll.textContent = total;
    el.countStatusAvailable.textContent = availableCount;
    el.countStatusReserved.textContent = reservedCount;

    if (el.adminMsgCount) el.adminMsgCount.textContent = reservedCount;

    el.progressBarFill.style.width = `${percentage}%`;
    el.progressText.textContent = `${percentage}% dos presentes já escolhidos 💖 (${reservedCount} de ${total})`;
  }

  // Render category buttons
  function renderCategoryPills() {
    const categories = ['all', ...state.categories];
    el.categoryPills.innerHTML = '';

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `category-pill ${state.currentCategory === cat ? 'active' : ''}`;
      btn.dataset.category = cat;
      btn.textContent = cat === 'all' ? 'Todas as Categorias' : cat;

      btn.addEventListener('click', () => {
        state.currentCategory = cat;
        document.querySelectorAll('.category-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderItems();
      });

      el.categoryPills.appendChild(btn);
    });
  }

  // Filter, Sort and Render Items Grid
  function renderItems() {
    let filtered = [...state.items];

    // Status Filter
    if (state.currentStatus === 'available') {
      filtered = filtered.filter(i => !i.reserved);
    } else if (state.currentStatus === 'reserved') {
      filtered = filtered.filter(i => i.reserved);
    }

    // Category Filter
    if (state.currentCategory !== 'all') {
      filtered = filtered.filter(i => (i.category || 'Outros') === state.currentCategory);
    }

    // Search Query
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        (i.title && i.title.toLowerCase().includes(q)) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.category && i.category.toLowerCase().includes(q))
      );
    }

    // Sort
    if (state.currentSort === 'az') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (state.currentSort === 'za') {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (state.currentSort === 'category') {
      filtered.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
    }

    // Render cards
    el.giftGrid.innerHTML = '';

    if (filtered.length === 0) {
      el.emptyState.classList.remove('hidden');
    } else {
      el.emptyState.classList.add('hidden');
      filtered.forEach(item => {
        el.giftGrid.appendChild(createGiftCard(item));
      });
    }
  }

  // Create single gift card element
  function createGiftCard(item) {
    const card = document.createElement('div');
    card.className = `gift-card ${item.reserved ? 'is-reserved' : ''}`;
    card.dataset.id = item.id;

    // 1. Checklist indicator
    const indicator = document.createElement('div');
    indicator.className = `checklist-indicator ${item.reserved ? 'claimed' : 'available'}`;
    indicator.title = item.reserved ? 'Presente já escolhido' : 'Disponível - Clique para presentear';
    indicator.innerHTML = item.reserved ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-regular fa-circle"></i>';
    if (!item.reserved) {
      indicator.addEventListener('click', () => openReserveModal(item));
    }

    // 2. Thumbnail
    const thumbBox = document.createElement('div');
    thumbBox.className = 'gift-thumbnail-box';
    if (item.imageUrl) {
      thumbBox.innerHTML = `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'gift-emoji-icon\\'>${escapeHtml(item.icon || '🎁')}</span>';">`;
    } else {
      thumbBox.innerHTML = `<span class="gift-emoji-icon">${escapeHtml(item.icon || '🎁')}</span>`;
    }

    // 3. Info
    const info = document.createElement('div');
    info.className = 'gift-info';

    const badges = document.createElement('div');
    badges.className = 'gift-badges-row';
    badges.innerHTML = `
      <span class="badge-category">${escapeHtml(item.category || 'Geral')}</span>
      <span class="badge-status ${item.reserved ? 'claimed' : 'available'}">
        <i class="fa-solid ${item.reserved ? 'fa-circle-check' : 'fa-gift'}"></i>
        ${item.reserved ? 'Já Escolhido' : 'Disponível'}
      </span>
    `;

    const title = document.createElement('h4');
    title.className = 'gift-title';
    title.textContent = item.title;

    info.appendChild(badges);
    info.appendChild(title);

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'gift-description';
      desc.textContent = item.description;
      info.appendChild(desc);
    }

    if (item.suggestedUrl) {
      const link = document.createElement('a');
      link.className = 'gift-store-link';
      link.href = item.suggestedUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.innerHTML = `<i class="fa-solid fa-arrow-up-right-from-square"></i> Ver sugestão de loja`;
      info.appendChild(link);
    }

    if (item.reserved && item.reservedBy) {
      const reservedTag = document.createElement('div');
      reservedTag.className = 'gift-reserved-info';
      reservedTag.innerHTML = `<i class="fa-solid fa-heart"></i> Escolhido com carinho por: <strong>${escapeHtml(item.reservedBy)}</strong>`;
      info.appendChild(reservedTag);
    }

    // 4. Actions
    const actions = document.createElement('div');
    actions.className = 'gift-actions';

    if (item.reserved) {
      const badge = document.createElement('div');
      badge.className = 'claimed-button-badge';
      badge.innerHTML = `<i class="fa-solid fa-check"></i> Presente Confirmado`;
      actions.appendChild(badge);
    } else {
      const btn = document.createElement('button');
      btn.className = 'btn-gift-reserve';
      btn.innerHTML = `<i class="fa-solid fa-gift"></i> Quero Presentear`;
      btn.addEventListener('click', () => openReserveModal(item));
      actions.appendChild(btn);
    }

    // Admin controls
    if (state.isAdmin) {
      const adminControls = document.createElement('div');
      adminControls.className = 'admin-card-controls';

      // Edit
      const btnEdit = document.createElement('button');
      btnEdit.className = 'btn-card-admin';
      btnEdit.title = 'Editar Presente';
      btnEdit.innerHTML = '<i class="fa-solid fa-pen"></i>';
      btnEdit.addEventListener('click', () => openEditModal(item));
      adminControls.appendChild(btnEdit);

      // Unreserve
      if (item.reserved) {
        const btnUnreserve = document.createElement('button');
        btnUnreserve.className = 'btn-card-admin unreserve';
        btnUnreserve.title = 'Liberar Presente (Cancelar Reserva)';
        btnUnreserve.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
        btnUnreserve.addEventListener('click', () => unreserveItem(item));
        adminControls.appendChild(btnUnreserve);
      }

      // Delete
      const btnDelete = document.createElement('button');
      btnDelete.className = 'btn-card-admin delete';
      btnDelete.title = 'Excluir Presente da Lista';
      btnDelete.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
      btnDelete.addEventListener('click', () => deleteItem(item));
      adminControls.appendChild(btnDelete);

      actions.appendChild(adminControls);
    }

    card.appendChild(indicator);
    card.appendChild(thumbBox);
    card.appendChild(info);
    card.appendChild(actions);

    return card;
  }

  // ================== GUEST RESERVE MODAL ==================
  function openReserveModal(item) {
    el.reserveItemId.value = item.id;
    el.guestName.value = '';
    el.guestPhone.value = '';
    el.guestMessage.value = '';

    el.reserveGiftPreview.innerHTML = `
      <div class="preview-thumb">
        ${item.imageUrl ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}">` : `<span>${escapeHtml(item.icon || '🎁')}</span>`}
      </div>
      <div class="preview-details">
        <strong>${escapeHtml(item.title)}</strong>
        <span>Categoria: ${escapeHtml(item.category || 'Geral')}</span>
      </div>
    `;

    openModal(el.modalReserve);
    setTimeout(() => el.guestName.focus(), 150);
  }

  async function handleReserveSubmit(e) {
    e.preventDefault();
    const id = el.reserveItemId.value;
    const guestName = el.guestName.value.trim();
    const guestPhone = el.guestPhone.value.trim();
    const guestMessage = el.guestMessage.value.trim();

    if (!guestName) {
      alert('Por favor, informe seu nome.');
      return;
    }

    const btn = document.getElementById('btnSubmitReserve');
    const oldText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Confirmando...';
    btn.disabled = true;

    try {
      const res = await fetch(`/api/items/${id}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName, guestPhone, guestMessage })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao registrar presente.');
      }

      closeModal(el.modalReserve);

      // Trigger Confetti Celebration!
      triggerConfetti();

      // Show Success Modal
      const reservedItem = state.items.find(i => String(i.id) === String(id));
      el.successItemTitle.textContent = reservedItem ? `🎁 ${reservedItem.title}` : 'Presente Registrado!';
      openModal(el.modalSuccess);

      // Reload data
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      btn.innerHTML = oldText;
      btn.disabled = false;
    }
  }

  // ================== ADMIN ACTIONS ==================
  function updateAdminUI() {
    if (state.isAdmin) {
      el.adminBanner.classList.remove('hidden');
      el.btnAdminAccess.innerHTML = '<i class="fa-solid fa-crown"></i> <span class="nav-btn-text">Painel dos Noivos</span>';
    } else {
      el.adminBanner.classList.add('hidden');
      el.btnAdminAccess.innerHTML = '<i class="fa-solid fa-lock"></i> <span class="nav-btn-text">Área dos Noivos</span>';
    }
  }

  async function handleAdminLogin(e) {
    e.preventDefault();
    const pin = el.adminPinInput.value.trim();
    el.adminLoginError.classList.add('hidden');

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'PIN incorreto.');

      state.isAdmin = true;
      state.adminPin = pin;
      localStorage.setItem('wedding_admin_pin', pin);

      updateAdminUI();
      closeModal(el.modalAdminLogin);
      showToast('Área dos Noivos liberada com sucesso!', '👑');
      renderItems();
    } catch (err) {
      el.adminLoginError.textContent = err.message;
      el.adminLoginError.classList.remove('hidden');
    }
  }

  function logoutAdmin() {
    state.isAdmin = false;
    state.adminPin = null;
    localStorage.removeItem('wedding_admin_pin');
    updateAdminUI();
    showToast('Você saiu da Área dos Noivos.', '👋');
    renderItems();
  }

  // Add Item Modal
  function openAddItemModal() {
    el.itemFormId.value = '';
    el.itemFormTitle.textContent = 'Adicionar Novo Presente';
    el.itemFormIconBadge.textContent = '✨';
    el.formItem.reset();
    el.itemInputIcon.value = '🎁';
    openModal(el.modalItemForm);
  }

  // Edit Item Modal
  function openEditModal(item) {
    el.itemFormId.value = item.id;
    el.itemFormTitle.textContent = 'Editar Presente';
    el.itemFormIconBadge.textContent = item.icon || '✏️';
    el.itemInputTitle.value = item.title || '';
    el.itemInputCategory.value = item.category || '';
    el.itemInputDescription.value = item.description || '';
    el.itemInputSuggestedUrl.value = item.suggestedUrl || '';
    el.itemInputImageUrl.value = item.imageUrl || '';
    el.itemInputIcon.value = item.icon || '🎁';
    openModal(el.modalItemForm);
  }

  async function handleSaveItem(e) {
    e.preventDefault();
    const id = el.itemFormId.value;
    const isEdit = Boolean(id);

    const payload = {
      title: el.itemInputTitle.value.trim(),
      category: el.itemInputCategory.value.trim(),
      description: el.itemInputDescription.value.trim(),
      suggestedUrl: el.itemInputSuggestedUrl.value.trim(),
      imageUrl: el.itemInputImageUrl.value.trim(),
      icon: el.itemInputIcon.value.trim() || '🎁'
    };

    const url = isEdit ? `/api/items/${id}` : '/api/items';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': state.adminPin
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar presente.');

      closeModal(el.modalItemForm);
      showToast(isEdit ? 'Presente atualizado!' : 'Novo presente adicionado!', '✅');
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteItem(item) {
    if (!confirm(`Tem certeza que deseja excluir "${item.title}" da lista?`)) return;

    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': state.adminPin }
      });
      if (!res.ok) throw new Error('Falha ao excluir item.');

      showToast('Presente excluído com sucesso.', '🗑️');
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function unreserveItem(item) {
    if (!confirm(`Deseja liberar "${item.title}" para que outros convidados possam escolher?`)) return;

    try {
      const res = await fetch(`/api/items/${item.id}/unreserve`, {
        method: 'POST',
        headers: { 'x-admin-pin': state.adminPin }
      });
      if (!res.ok) throw new Error('Falha ao liberar presente.');

      showToast('Presente liberado para escolha!', '🔄');
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Open Messages Modal
  async function openMessagesModal() {
    try {
      const res = await fetch('/api/admin/messages', {
        headers: { 'x-admin-pin': state.adminPin }
      });
      const data = await res.json();
      const list = data.items || [];

      el.msgTotalCount.textContent = list.length;
      el.adminMessagesList.innerHTML = '';

      if (list.length === 0) {
        el.adminMessagesList.innerHTML = '<p class="text-center" style="padding: 24px; color: #888;">Nenhum presente foi reservado ainda.</p>';
      } else {
        list.forEach(item => {
          const card = document.createElement('div');
          card.className = 'message-card';

          const dateStr = item.reservedAt ? new Date(item.reservedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

          card.innerHTML = `
            <div class="message-card-header">
              <span class="message-guest-name"><i class="fa-solid fa-user-heart"></i> ${escapeHtml(item.reservedBy || 'Convidado')}</span>
              <span class="message-date">${dateStr}</span>
            </div>
            <div class="message-gift-name"><i class="fa-solid fa-gift"></i> Presente: ${escapeHtml(item.title)}</div>
            ${item.guestPhone ? `<div style="font-size: 0.8rem; color: #666;"><i class="fa-brands fa-whatsapp"></i> ${escapeHtml(item.guestPhone)}</div>` : ''}
            ${item.guestMessage ? `<div class="message-body">“${escapeHtml(item.guestMessage)}”</div>` : '<div style="font-size: 0.8rem; color: #aaa; font-style: italic;">Sem recado por escrito.</div>'}
          `;
          el.adminMessagesList.appendChild(card);
        });
      }

      openModal(el.modalMessages);
    } catch {
      alert('Erro ao carregar mensagens.');
    }
  }

  // Config Modal
  function openConfigModal() {
    el.cfgCoupleNames.value = state.config.coupleNames || '';
    el.cfgWeddingDate.value = state.config.weddingDate || '';
    el.cfgWelcomeTitle.value = state.config.welcomeTitle || '';
    el.cfgWelcomeMessage.value = state.config.welcomeMessage || '';
    el.cfgPixKey.value = state.config.pixKey || '';
    el.cfgPixName.value = state.config.pixName || '';
    el.cfgNewPin.value = '';

    openModal(el.modalConfig);
  }

  async function handleSaveConfig(e) {
    e.preventDefault();
    const payload = {
      coupleNames: el.cfgCoupleNames.value.trim(),
      weddingDate: el.cfgWeddingDate.value.trim(),
      welcomeTitle: el.cfgWelcomeTitle.value.trim(),
      welcomeMessage: el.cfgWelcomeMessage.value.trim(),
      pixKey: el.cfgPixKey.value.trim(),
      pixName: el.cfgPixName.value.trim(),
      newPin: el.cfgNewPin.value.trim()
    };

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': state.adminPin
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar configurações.');

      if (payload.newPin) {
        state.adminPin = payload.newPin;
        localStorage.setItem('wedding_admin_pin', payload.newPin);
      }

      closeModal(el.modalConfig);
      showToast('Configurações salvas com sucesso!', '⚙️');
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Export CSV Report
  function exportCsvReport() {
    const reservedItems = state.items.filter(i => i.reserved);
    if (reservedItems.length === 0) {
      alert('Ainda não há presentes reservados para exportar.');
      return;
    }

    let csv = '\uFEFF'; // UTF-8 BOM for Excel
    csv += 'Presente;Categoria;Escolhido Por;Telefone/WhatsApp;Data da Reserva;Mensagem dos Convidados\n';

    reservedItems.forEach(i => {
      const title = `"${(i.title || '').replace(/"/g, '""')}"`;
      const cat = `"${(i.category || '').replace(/"/g, '""')}"`;
      const by = `"${(i.reservedBy || '').replace(/"/g, '""')}"`;
      const phone = `"${(i.guestPhone || '').replace(/"/g, '""')}"`;
      const date = i.reservedAt ? `"${new Date(i.reservedAt).toLocaleDateString('pt-BR')} ${new Date(i.reservedAt).toLocaleTimeString('pt-BR')}"` : '""';
      const msg = `"${(i.guestMessage || '').replace(/"/g, '""')}"`;

      csv += `${title};${cat};${by};${phone};${date};${msg}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `presentes-casamento-${(state.config.coupleNames || 'casal').toLowerCase().replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Planilha CSV gerada com sucesso!', '📊');
  }

  // ================== COUNTDOWN TIMER ==================
  function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);

    function update() {
      if (!state.config.weddingDate) return;
      const target = new Date(state.config.weddingDate + 'T00:00:00').getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        el.countDays.textContent = '00';
        el.countHours.textContent = '00';
        el.countMinutes.textContent = '00';
        el.countSeconds.textContent = '00';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      el.countDays.textContent = String(days).padStart(2, '0');
      el.countHours.textContent = String(hours).padStart(2, '0');
      el.countMinutes.textContent = String(minutes).padStart(2, '0');
      el.countSeconds.textContent = String(seconds).padStart(2, '0');
    }

    update();
    countdownInterval = setInterval(update, 1000);
  }

  // ================== EVENT LISTENERS ==================
  function setupEventListeners() {
    // Search
    el.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      el.btnClearSearch.classList.toggle('hidden', !state.searchQuery);
      renderItems();
    });

    el.btnClearSearch.addEventListener('click', () => {
      el.searchInput.value = '';
      state.searchQuery = '';
      el.btnClearSearch.classList.add('hidden');
      renderItems();
    });

    // Status Filter Tabs
    el.statusPills.forEach(pill => {
      pill.addEventListener('click', () => {
        el.statusPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.currentStatus = pill.dataset.status;
        renderItems();
      });
    });

    // Sort Select
    el.sortSelect.addEventListener('change', (e) => {
      state.currentSort = e.target.value;
      renderItems();
    });

    // Reset Filters Button
    el.btnResetFilters.addEventListener('click', () => {
      state.searchQuery = '';
      state.currentCategory = 'all';
      state.currentStatus = 'all';
      el.searchInput.value = '';
      el.btnClearSearch.classList.add('hidden');
      el.statusPills.forEach(p => p.classList.remove('active'));
      document.querySelector('.status-pill[data-status="all"]')?.classList.add('active');
      document.querySelectorAll('.category-pill').forEach(b => b.classList.remove('active'));
      document.querySelector('.category-pill[data-category="all"]')?.classList.add('active');
      renderItems();
    });

    // Copy Pix
    el.btnCopyPix.addEventListener('click', () => {
      el.pixKeyInput.select();
      navigator.clipboard.writeText(el.pixKeyInput.value).then(() => {
        showToast('Chave Pix copiada com sucesso!', '📋');
      }).catch(() => {
        document.execCommand('copy');
        showToast('Chave Pix copiada!', '📋');
      });
    });

    // Admin Access Button
    el.btnAdminAccess.addEventListener('click', () => {
      if (state.isAdmin) {
        showToast('Você já está com o Modo Noivos ativado!', '👑');
      } else {
        el.adminPinInput.value = '';
        el.adminLoginError.classList.add('hidden');
        openModal(el.modalAdminLogin);
      }
    });

    // Admin Forms & Buttons
    el.formAdminLogin.addEventListener('submit', handleAdminLogin);
    el.btnLogoutAdmin.addEventListener('click', logoutAdmin);
    el.btnOpenAddItem.addEventListener('click', openAddItemModal);
    el.btnOpenMessages.addEventListener('click', openMessagesModal);
    el.btnExportCsv.addEventListener('click', exportCsvReport);
    el.btnDownloadCsvInModal.addEventListener('click', exportCsvReport);
    el.btnOpenConfig.addEventListener('click', openConfigModal);

    // Forms
    el.formReserve.addEventListener('submit', handleReserveSubmit);
    el.formItem.addEventListener('submit', handleSaveItem);
    el.formConfig.addEventListener('submit', handleSaveConfig);

    // Quick emoji picks in Add Item Modal
    document.querySelectorAll('.emoji-pick').forEach(span => {
      span.addEventListener('click', () => {
        el.itemInputIcon.value = span.dataset.emoji;
      });
    });

    // Modal Close buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close');
        const modal = document.getElementById(modalId);
        if (modal) closeModal(modal);
      });
    });

    // Close on overlay backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(overlay);
      });
    });
  }

  // ================== UTILITIES ==================
  function openModal(modal) {
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function showToast(message, icon = '✨') {
    el.toastIcon.textContent = icon;
    el.toastMessage.textContent = message;
    el.toast.classList.remove('hidden');

    setTimeout(() => {
      el.toast.classList.add('hidden');
    }, 3500);
  }

  function triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

})();
