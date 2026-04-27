'use strict';

/* ===== Config ===== */
const API_BASE = 'http://localhost:8080/api.php';

/* ===== Preset fallback ===== */
const PRESET_SERVICES_FALLBACK = [
  { name: 'Netflix',              emoji: '🎬', category: '動画',          amount: 1490 },
  { name: 'Amazon Prime Video',   emoji: '📦', category: '動画',          amount: 600  },
  { name: 'Disney+',              emoji: '🏰', category: '動画',          amount: 990  },
  { name: 'YouTube Premium',      emoji: '▶️', category: '動画',          amount: 1180 },
  { name: 'Spotify',              emoji: '🎵', category: '音楽',          amount: 980  },
  { name: 'Apple Music',          emoji: '🎶', category: '音楽',          amount: 1080 },
  { name: 'ChatGPT Plus',         emoji: '🤖', category: 'AI',            amount: 3000 },
  { name: 'Adobe Creative Cloud', emoji: '🎨', category: 'クリエイティブ', amount: 6480 },
  { name: 'Figma',                emoji: '🖌️', category: 'デザイン',      amount: 1800 },
  { name: 'Microsoft 365',        emoji: '💼', category: '仕事',          amount: 1284 },
  { name: 'Notion',               emoji: '📝', category: '仕事',          amount: 1600 },
  { name: 'GitHub',               emoji: '💻', category: '開発',          amount: 1100 },
];

const STORAGE_KEY = 'subscr-optimizer-v1';

/* ===== State ===== */
let subscriptions  = [];
let presetServices = [...PRESET_SERVICES_FALLBACK];
let editingId      = null;
let activeFilter   = 'all';
let activeSort     = 'nextBilling';
let apiConnected   = false;

/* ===== Session Helpers ===== */
function getAuthToken()  { return localStorage.getItem('auth_token') || ''; }
function getAuthUser()   { try { return JSON.parse(localStorage.getItem('auth_user')) || null; } catch { return null; } }
function clearSession()  { localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user'); }

function redirectToLogin() {
  clearSession();
  window.location.href = 'auth.html';
}

/* ===== jQuery Ajax Wrappers (Bearerトークン付き) ===== */
const api = {
  _req(opts) {
    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return $.ajax({
      url:      opts.url,
      method:   opts.method || 'GET',
      headers,
      contentType: opts.body ? 'application/json' : undefined,
      data:     opts.body ? JSON.stringify(opts.body) : undefined,
      dataType: 'json',
      timeout:  8000,
    }).fail(xhr => {
      if (xhr.status === 401) redirectToLogin();
    });
  },
  get(path)            { return this._req({ url: `${API_BASE}/${path}` }); },
  post(path, body)     { return this._req({ url: `${API_BASE}/${path}`,    method: 'POST',   body }); },
  put(path, id, body)  { return this._req({ url: `${API_BASE}/${path}/${id}`, method: 'PUT', body }); },
  delete(path, id)     { return this._req({ url: `${API_BASE}/${path}/${id}`, method: 'DELETE' }); },
  deleteBody(path, body){ return this._req({ url: `${API_BASE}/${path}`,   method: 'DELETE', body }); },
};

/* ===== API Status Badge ===== */
function setApiStatus(connected) {
  apiConnected = connected;
  const $b = $('#api-status');
  $b.toggleClass('connected', connected).toggleClass('offline', !connected);
  $b.find('.api-status-label').text(connected ? 'API接続中' : 'オフライン（ローカル）');
}

/* ===== LocalStorage fallback ===== */
function localSave() { localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions)); }

function localLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { subscriptions = JSON.parse(raw); return true; }
  } catch (_) {}
  return false;
}

function getSampleData() {
  const add = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  return [
    { id:1, name:'Netflix',             emoji:'🎬', category:'動画',          amount:1490, cycle:'monthly', nextBillingDate:add(6),  isTrial:false, trialEndDate:null,   status:'active', notes:'' },
    { id:2, name:'Spotify',             emoji:'🎵', category:'音楽',          amount:980,  cycle:'monthly', nextBillingDate:add(13), isTrial:false, trialEndDate:null,   status:'active', notes:'' },
    { id:3, name:'ChatGPT Plus',        emoji:'🤖', category:'AI',            amount:3000, cycle:'monthly', nextBillingDate:add(2),  isTrial:true,  trialEndDate:add(2), status:'active', notes:'無料トライアル中' },
    { id:4, name:'Adobe Creative Cloud',emoji:'🎨', category:'クリエイティブ', amount:6480, cycle:'monthly', nextBillingDate:add(23), isTrial:false, trialEndDate:null,   status:'active', notes:'' },
    { id:5, name:'Amazon Prime Video',  emoji:'📦', category:'動画',          amount:600,  cycle:'monthly', nextBillingDate:add(18), isTrial:false, trialEndDate:null,   status:'active', notes:'' },
    { id:6, name:'Figma',               emoji:'🖌️', category:'デザイン',      amount:1800, cycle:'monthly', nextBillingDate:add(5),  isTrial:true,  trialEndDate:add(6), status:'active', notes:'チーム用' },
  ];
}

/* ===== Initialisation ===== */
function initApp() {
  const token = getAuthToken();

  // トークン未保持ならログイン画面へ
  if (!token) {
    redirectToLogin();
    return;
  }

  renderUserMenu();

  const fetchSubs    = api.get('subscriptions');
  const fetchPresets = api.get('presets');
  const healthCheck  = api.get('health');

  $.when(healthCheck, fetchSubs, fetchPresets)
    .done(function (healthRes, subsRes, presetsRes) {
      subscriptions  = subsRes[0].data    || [];
      presetServices = presetsRes[0].data || presetServices;
      setApiStatus(true);
      populatePresets();
      render();
    })
    .fail(function (xhr) {
      // 401 は api._req が redirectToLogin() 済みなのでここでは無視
      if (xhr && xhr.status === 401) return;

      console.warn('[SubsOptimizer] APIに接続できません。ローカルデータを使用します。');
      setApiStatus(false);
      if (!localLoad() || !subscriptions.length) {
        subscriptions = getSampleData();
        localSave();
      }
      populatePresets();
      render();
    });
}

/* ===== User Menu ===== */
function renderUserMenu() {
  const user = getAuthUser();
  if (!user) return;

  const displayName = user.is_guest ? 'ゲスト' : (user.email || 'ユーザー');
  $('#user-display-name').text(displayName);
  $('#dropdown-email').text(user.is_guest ? 'ゲストユーザー' : user.email);
  $('#dropdown-role').text(user.is_guest ? '⚠️ ゲスト（データは保持されません）' : '登録済みアカウント');

  // ゲストはパスワード入力不要なのでフィールドを非表示
  if (user.is_guest) $('#withdraw-pw-group').hide();
}

/* ===== Preset Selector ===== */
function populatePresets() {
  const $sel = $('#preset-select').empty();
  $sel.append($('<option>').val('').text('── カスタム入力 ──'));
  presetServices.forEach(p => {
    $sel.append($('<option>').val(p.name).text(`${p.emoji} ${p.name} (¥${p.amount.toLocaleString()}/月)`));
  });
}

/* ===== Date Utils ===== */
function getDaysUntil(dateStr) {
  if (!dateStr) return Infinity;
  const target = new Date(dateStr), today = new Date();
  today.setHours(0,0,0,0); target.setHours(0,0,0,0);
  return Math.round((target - today) / 86400000);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ===== Render ===== */
function render() { renderAlerts(); renderKPIs(); renderFilterTabs(); renderSubscriptions(); }

function renderAlerts() {
  const $c = $('#alerts-container').empty();
  subscriptions.filter(s => s.status !== 'cancelled' && s.isTrial).forEach(s => {
    const days = getDaysUntil(s.trialEndDate);
    if (days < 0 || days > 3) return;
    const when = days === 0 ? '本日' : `${days}日後`;
    $c.append(`
      <div class="alert alert-danger">
        <span class="alert-icon">⚠️</span>
        <span class="alert-text"><strong>${s.emoji} ${escHtml(s.name)}</strong> の無料トライアルが<strong>${when}</strong>に終了します。</span>
        <button class="alert-btn" data-edit-id="${s.id}">確認する</button>
      </div>`);
  });
}

function renderKPIs() {
  const active  = subscriptions.filter(s => s.status !== 'cancelled');
  const monthly = active.reduce((sum, s) => sum + (s.cycle === 'yearly' ? Math.round(s.amount/12) : s.amount), 0);
  const now = new Date(), eom = new Date(now.getFullYear(), now.getMonth()+1, 0);
  const renewals   = active.filter(s => { const d = new Date(s.nextBillingDate); return d >= now && d <= eom; }).length;
  const trialsNear = active.filter(s => s.isTrial && getDaysUntil(s.trialEndDate) >= 0 && getDaysUntil(s.trialEndDate) <= 7).length;

  $('#kpi-monthly').text(`¥${monthly.toLocaleString()}`);
  $('#kpi-count').text(`${active.length}件`);
  $('#kpi-renewals').text(`${renewals}件`);
  $('#kpi-trials').text(`${trialsNear}件`);
  $('.kpi-alert-card').toggleClass('has-alerts', trialsNear > 0);
}

function renderFilterTabs() {
  const active = subscriptions.filter(s => s.status !== 'cancelled');
  const cats   = ['all', ...new Set(active.map(s => s.category))];
  $('#filter-tabs').empty();
  cats.forEach(cat => {
    $('#filter-tabs').append(
      $('<button>').addClass('filter-tab' + (activeFilter === cat ? ' active' : '')).attr('data-filter', cat).text(cat === 'all' ? 'すべて' : cat)
    );
  });
}

function buildCard(s) {
  const isTrial = s.isTrial && s.status !== 'cancelled';
  const days    = getDaysUntil(isTrial ? s.trialEndDate : s.nextBillingDate);
  const monthly = s.cycle === 'yearly' ? Math.round(s.amount/12) : s.amount;

  let cardClass='', alertBar='', urgencyBadge='';
  if (isTrial) {
    if (days <= 0)     { cardClass='card-danger';  alertBar=`<div class="card-alert-bar">⚠️ 本日トライアル終了</div>`;               urgencyBadge='<span class="badge badge-danger">本日終了</span>'; }
    else if (days <= 3){ cardClass='card-danger';  alertBar=`<div class="card-alert-bar">⚠️ トライアル終了まであと${days}日</div>`;  urgencyBadge=`<span class="badge badge-danger">あと${days}日</span>`; }
    else if (days <= 7){ cardClass='card-warning'; alertBar=`<div class="card-alert-bar warning-bar">トライアル終了まであと${days}日</div>`; urgencyBadge=`<span class="badge badge-warning">あと${days}日</span>`; }
    else               { urgencyBadge='<span class="badge badge-trial">トライアル中</span>'; }
  } else {
    if (days <= 3)      { cardClass='card-warning'; urgencyBadge=`<span class="badge badge-warning">更新まで${days}日</span>`; }
    else if (days <= 7) { urgencyBadge=`<span class="badge badge-info">あと${days}日</span>`; }
  }

  const amountLine  = s.cycle === 'yearly'
    ? `¥${s.amount.toLocaleString()}<span class="card-amount-sub">/年 (月割 ¥${monthly.toLocaleString()})</span>`
    : `¥${s.amount.toLocaleString()}<span class="card-amount-sub">/月</span>`;
  const billingLine = isTrial
    ? `<div class="card-billing">🗓 トライアル終了: <strong>${formatDate(s.trialEndDate)}</strong></div>`
    : `<div class="card-billing">🗓 次回更新: <strong>${formatDate(s.nextBillingDate)}</strong>${days > 0 ? ` <span style="color:var(--text-muted)">(${days}日後)</span>` : ''}</div>`;

  return `
    <div class="sub-card ${cardClass}">
      ${alertBar}
      <div class="card-body">
        <div class="card-top">
          <div class="card-emoji">${s.emoji||'📱'}</div>
          <div class="card-meta">
            <div class="card-name">${escHtml(s.name)}</div>
            <div class="card-badges"><span class="badge badge-category">${escHtml(s.category)}</span></div>
          </div>
          <div class="card-urgency">${urgencyBadge}</div>
        </div>
        <div class="card-amount">${amountLine}</div>
        ${billingLine}
        ${s.notes ? `<div class="card-notes">📌 ${escHtml(s.notes)}</div>` : ''}
      </div>
      <div class="card-actions">
        ${isTrial ? `<button class="btn btn-sm btn-outline-danger" data-cancel-id="${s.id}">解約する</button>` : ''}
        <button class="btn btn-sm btn-secondary" data-edit-id="${s.id}">編集</button>
      </div>
    </div>`;
}

function renderSubscriptions() {
  const $grid = $('#subscriptions-grid');
  $grid.empty();
  let list = subscriptions.filter(s => s.status !== 'cancelled');
  if (activeFilter !== 'all') list = list.filter(s => s.category === activeFilter);
  list.sort((a,b) => {
    if (activeSort === 'nextBilling') return new Date(a.nextBillingDate) - new Date(b.nextBillingDate);
    if (activeSort === 'amount')      return b.amount - a.amount;
    return a.name.localeCompare(b.name, 'ja');
  });
  if (!list.length) { $grid.hide(); $('#empty-state').addClass('visible'); return; }
  $('#empty-state').removeClass('visible');
  $grid.show();
  list.forEach(s => $grid.append(buildCard(s)));
}

/* ===== Subscription Modal ===== */
function openAddModal() {
  editingId = null; $('#modal-title').text('サブスクを追加'); $('#btn-delete').hide();
  clearForm(); showModal();
}

window.openEditModal = function(id) {
  editingId = id;
  const s = subscriptions.find(x => x.id === id);
  if (!s) return;
  $('#modal-title').text('サブスクを編集'); $('#btn-delete').show();
  $('#preset-select').val(''); $('#field-name').val(s.name); $('#field-emoji').val(s.emoji||'');
  $('#field-category').val(s.category); $('#field-amount').val(s.amount); $('#field-cycle').val(s.cycle);
  $('#field-next-billing').val(s.nextBillingDate); $('#field-is-trial').prop('checked', s.isTrial);
  $('#field-trial-end').val(s.trialEndDate||''); $('#field-notes').val(s.notes||'');
  $('#trial-end-group').toggle(s.isTrial);
  showModal();
};

function showModal() { $('#modal-overlay').addClass('active'); $('body').addClass('modal-open'); setTimeout(() => $('#field-name').focus(), 50); }
function closeModal() { $('#modal-overlay').removeClass('active'); $('body').removeClass('modal-open'); }

function clearForm() {
  $('#preset-select,#field-name,#field-emoji,#field-amount,#field-next-billing,#field-trial-end,#field-notes').val('');
  $('#field-category').val('動画'); $('#field-cycle').val('monthly');
  $('#field-is-trial').prop('checked', false); $('#trial-end-group').hide();
}

function fillFromPreset(p) {
  $('#field-name').val(p.name); $('#field-emoji').val(p.emoji);
  $('#field-category').val(p.category); $('#field-amount').val(p.amount);
}

/* ===== CRUD ===== */
function saveSubscription() {
  const name     = $('#field-name').val().trim();
  const amount   = parseInt($('#field-amount').val(), 10);
  const nextBill = $('#field-next-billing').val();
  const isTrial  = $('#field-is-trial').is(':checked');
  const trialEnd = $('#field-trial-end').val();

  if (!name)                 { showValidationError('#field-name',        'サービス名を入力してください'); return; }
  if (!amount || amount < 1) { showValidationError('#field-amount',      '金額を正しく入力してください'); return; }
  if (!nextBill)             { showValidationError('#field-next-billing', '次回決済日を入力してください'); return; }
  if (isTrial && !trialEnd)  { showValidationError('#field-trial-end',   'トライアル終了日を入力してください'); return; }

  const payload = {
    name, emoji: $('#field-emoji').val().trim() || '📱',
    category: $('#field-category').val(), amount,
    cycle: $('#field-cycle').val(), nextBillingDate: nextBill,
    isTrial, trialEndDate: isTrial ? trialEnd : null,
    status: 'active', notes: $('#field-notes').val().trim(),
  };

  const $btn = $('#btn-save').prop('disabled', true).text('保存中...');

  const onDone = (saved) => {
    if (editingId !== null) {
      const idx = subscriptions.findIndex(s => s.id === editingId);
      if (idx !== -1) subscriptions[idx] = saved;
    } else {
      subscriptions.push(saved);
    }
    if (!apiConnected) localSave();
    closeModal(); render();
  };

  const onFail = () => {
    // ローカルフォールバック
    if (editingId !== null) {
      const idx = subscriptions.findIndex(s => s.id === editingId);
      if (idx !== -1) subscriptions[idx] = { ...subscriptions[idx], ...payload };
    } else {
      const newId = subscriptions.length ? Math.max(...subscriptions.map(s => s.id)) + 1 : 1;
      subscriptions.push({ id: newId, ...payload });
    }
    localSave(); closeModal(); render();
    showToast('APIエラー: ローカルに保存しました', 'warning');
  };

  const onAlways = () => $btn.prop('disabled', false).text('保存する');

  if (apiConnected) {
    const req = editingId !== null ? api.put('subscriptions', editingId, payload) : api.post('subscriptions', payload);
    req.done(res => onDone(res.data)).fail(onFail).always(onAlways);
  } else {
    const newId = editingId !== null ? editingId : (subscriptions.length ? Math.max(...subscriptions.map(s => s.id)) + 1 : 1);
    onDone({ id: newId, ...payload }); onAlways();
  }
}

window.deleteSubscription = function(id) {
  if (!confirm('このサブスクリプションを削除しますか？')) return;
  if (!apiConnected) {
    subscriptions = subscriptions.filter(s => s.id !== id);
    localSave(); closeModal(); render(); return;
  }
  api.delete('subscriptions', id)
    .done(() => { subscriptions = subscriptions.filter(s => s.id !== id); closeModal(); render(); })
    .fail(() => showToast('APIエラー: 削除に失敗しました', 'danger'));
};

window.cancelSubscription = function(id) {
  if (!confirm('このサブスクリプションを解約済みにしますか？')) return;
  if (!apiConnected) {
    subscriptions = subscriptions.filter(x => x.id !== id);
    localSave(); render(); return;
  }
  api.delete('subscriptions', id)
    .done(() => { subscriptions = subscriptions.filter(x => x.id !== id); render(); })
    .fail(() => showToast('APIエラー: 解約に失敗しました', 'danger'));
};

/* ===== Logout ===== */
function logout() {
  if (apiConnected) {
    api.post('auth/logout', {}).always(() => { clearSession(); window.location.href = 'auth.html'; });
  } else {
    clearSession(); window.location.href = 'auth.html';
  }
}

/* ===== Withdraw (退会) ===== */
function openWithdrawModal() {
  const user = getAuthUser();
  if (user && user.is_guest) {
    $('#withdraw-pw-group').hide();
  } else {
    $('#withdraw-pw-group').show();
  }
  $('#withdraw-password').val('');
  $('#withdraw-error').text('').hide();
  $('#modal-withdraw').removeAttr('hidden').addClass('active');
  $('body').addClass('modal-open');
}

function closeWithdrawModal() {
  $('#modal-withdraw').removeClass('active').attr('hidden', '');
  $('body').removeClass('modal-open');
}

function confirmWithdraw() {
  const user     = getAuthUser();
  const password = $('#withdraw-password').val();
  const $btn     = $('#btn-withdraw-confirm');

  if (!user) return;
  if (!user.is_guest && !password) {
    $('#withdraw-error').text('パスワードを入力してください').show();
    return;
  }

  $btn.prop('disabled', true).text('処理中...');
  $('#withdraw-error').hide();

  const body = user.is_guest ? {} : { password };

  api.deleteBody('auth/account', body)
    .done(() => {
      clearSession();
      window.location.href = 'auth.html';
    })
    .fail(xhr => {
      const msg = xhr.responseJSON?.error || '退会に失敗しました';
      $('#withdraw-error').text(msg).show();
      $btn.prop('disabled', false).text('退会する');
    });
}

/* ===== Toast ===== */
function showToast(message, type = 'info') {
  const colors = { info:'#3b82f6', warning:'#f59e0b', danger:'#ef4444', success:'#10b981' };
  const $t = $(`<div style="position:fixed;bottom:24px;right:24px;z-index:9999;background:${colors[type]};color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.2);">${escHtml(message)}</div>`);
  $('body').append($t);
  setTimeout(() => $t.fadeOut(300, () => $t.remove()), 3000);
}

function showValidationError(selector, msg) {
  const $el = $(selector);
  $el.css('border-color', 'var(--danger)').focus();
  $el.one('input change', () => $el.css('border-color', ''));
  alert(msg);
}

/* ===== jQuery Document Ready ===== */
$(function () {

  /* --- Subscription modal --- */
  $('#btn-add, #btn-add-empty').on('click', openAddModal);
  $('#modal-close, #btn-cancel').on('click', closeModal);
  $('#modal-overlay').on('click', e => { if ($(e.target).is('#modal-overlay')) closeModal(); });
  $(document).on('keydown', e => { if (e.key === 'Escape') { closeModal(); closeWithdrawModal(); closeUserDropdown(); } });

  $('#preset-select').on('change', function () {
    const val = $(this).val();
    if (!val) return;
    const p = presetServices.find(x => x.name === val);
    if (p) fillFromPreset(p);
  });

  $('#field-is-trial').on('change', function () { $('#trial-end-group').toggle($(this).is(':checked')); });
  $('#btn-save').on('click', saveSubscription);
  $('#btn-delete').on('click', () => window.deleteSubscription(editingId));

  /* --- Filter / Sort --- */
  $('#filter-tabs').on('click', '.filter-tab', function () {
    activeFilter = $(this).data('filter');
    $('#filter-tabs .filter-tab').removeClass('active');
    $(this).addClass('active');
    renderSubscriptions();
  });
  $('#sort-select').on('change', function () { activeSort = $(this).val(); renderSubscriptions(); });

  /* --- Card buttons (delegated) --- */
  $(document).on('click', '[data-edit-id]',   function () { window.openEditModal(Number($(this).data('edit-id'))); });
  $(document).on('click', '[data-cancel-id]', function () { window.cancelSubscription(Number($(this).data('cancel-id'))); });

  /* --- User menu dropdown --- */
  $('#user-menu-btn').on('click', function (e) {
    e.stopPropagation();
    const isOpen = !$('#user-dropdown').attr('hidden');
    if (isOpen) {
      closeUserDropdown();
    } else {
      $('#user-dropdown').removeAttr('hidden');
      $('#user-menu-wrap').addClass('open');
    }
  });

  $(document).on('click', e => {
    if (!$(e.target).closest('#user-menu-wrap').length) closeUserDropdown();
  });

  function closeUserDropdown() {
    $('#user-dropdown').attr('hidden', '');
    $('#user-menu-wrap').removeClass('open');
  }

  /* --- Logout --- */
  $('#btn-logout').on('click', () => {
    closeUserDropdown();
    if (confirm('ログアウトしますか？')) logout();
  });

  /* --- Withdraw --- */
  $('#btn-withdraw-open').on('click', () => { closeUserDropdown(); openWithdrawModal(); });
  $('#withdraw-close, #withdraw-cancel').on('click', closeWithdrawModal);
  $('#modal-withdraw').on('click', e => { if ($(e.target).is('#modal-withdraw')) closeWithdrawModal(); });
  $('#btn-withdraw-confirm').on('click', confirmWithdraw);

  /* --- Boot --- */
  initApp();
});
