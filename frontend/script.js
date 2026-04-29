'use strict';

/* ===== Config ===== */
const API_BASE = 'http://localhost:8000/api';

/* ===== Heroicons (outline) ===== */
const ICONS = {
  // UI 汎用
  'credit-card':    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5z"/></svg>',
  'user-circle':    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/></svg>',
  'chevron-down':   '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>',
  'x-mark':         '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>',
  'exclamation-triangle': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>',
  'calendar':       '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>',
  'paper-clip':     '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"/></svg>',
  // カテゴリ別
  '動画':           '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z"/></svg>',
  '音楽':           '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z"/></svg>',
  'AI':             '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z"/></svg>',
  '仕事':           '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"/></svg>',
  '開発':           '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"/></svg>',
  'クリエイティブ': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"/></svg>',
  'デザイン':       '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z"/></svg>',
  'ストレージ':     '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 .75-7.414 5.25 5.25 0 0 0-10.233-2.33 3 3 0 0 0-3.758 3.848A4.5 4.5 0 0 0 2.25 15Z"/></svg>',
  'ゲーム':         '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z"/></svg>',
  'その他':         '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>',
};

function icon(name, cls = '') {
  const svg = ICONS[name] || ICONS['その他'];
  return svg.replace('<svg ', `<svg class="icon${cls ? ' ' + cls : ''}" `);
}

function categoryIcon(category) {
  return icon(ICONS[category] ? category : 'その他', 'card-icon');
}

/* ===== Preset fallback ===== */
const PRESET_SERVICES_FALLBACK = [
  { name: 'Netflix',              category: '動画',          amount: 1490 },
  { name: 'Amazon Prime Video',   category: '動画',          amount: 600  },
  { name: 'Disney+',              category: '動画',          amount: 990  },
  { name: 'YouTube Premium',      category: '動画',          amount: 1180 },
  { name: 'Spotify',              category: '音楽',          amount: 980  },
  { name: 'Apple Music',          category: '音楽',          amount: 1080 },
  { name: 'ChatGPT Plus',         category: 'AI',            amount: 3000 },
  { name: 'Adobe Creative Cloud', category: 'クリエイティブ', amount: 6480 },
  { name: 'Figma',                category: 'デザイン',      amount: 1800 },
  { name: 'Microsoft 365',        category: '仕事',          amount: 1284 },
  { name: 'Notion',               category: '仕事',          amount: 1600 },
  { name: 'GitHub',               category: '開発',          amount: 1100 },
];

const STORAGE_KEY = 'subscr-optimizer-v1';

/* ===== State ===== */
let subscriptions  = [];
let presetServices = [...PRESET_SERVICES_FALLBACK];
let editingId      = null;
let activeFilter   = 'all';
let activeSort     = 'nextBilling';

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
    { id:1, name:'Netflix',             category:'動画',          amount:1490, cycle:'monthly', nextBillingDate:add(6),  isTrial:false, trialEndDate:null,   status:'active', notes:'' },
    { id:2, name:'Spotify',             category:'音楽',          amount:980,  cycle:'monthly', nextBillingDate:add(13), isTrial:false, trialEndDate:null,   status:'active', notes:'' },
    { id:3, name:'ChatGPT Plus',        category:'AI',            amount:3000, cycle:'monthly', nextBillingDate:add(2),  isTrial:true,  trialEndDate:add(2), status:'active', notes:'無料トライアル中' },
    { id:4, name:'Adobe Creative Cloud',category:'クリエイティブ', amount:6480, cycle:'monthly', nextBillingDate:add(23), isTrial:false, trialEndDate:null,   status:'active', notes:'' },
    { id:5, name:'Amazon Prime Video',  category:'動画',          amount:600,  cycle:'monthly', nextBillingDate:add(18), isTrial:false, trialEndDate:null,   status:'active', notes:'' },
    { id:6, name:'Figma',               category:'デザイン',      amount:1800, cycle:'monthly', nextBillingDate:add(5),  isTrial:true,  trialEndDate:add(6), status:'active', notes:'チーム用' },
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

  $.when(fetchSubs, fetchPresets)
    .done(function (subsRes, presetsRes) {
      subscriptions  = subsRes[0].data    || [];
      presetServices = presetsRes[0].data || presetServices;
      populatePresets();
      render();
    })
    .fail(function (xhr) {
      // 401 は api._req が redirectToLogin() 済みなのでここでは無視
      if (xhr && xhr.status === 401) return;

      console.warn('[SubsOptimizer] APIに接続できません。ローカルデータを使用します。');
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
  $('#dropdown-role').text(user.is_guest ? 'ゲスト（データは保持されません）' : '登録済みアカウント');

  // ゲストはパスワード入力不要なのでフィールドを非表示
  if (user.is_guest) $('#withdraw-pw-group').hide();
}

/* ===== Preset Selector ===== */
function populatePresets() {
  const $sel = $('#preset-select').empty();
  $sel.append($('<option>').val('').text('── カスタム入力 ──'));
  presetServices.forEach(p => {
    $sel.append($('<option>').val(p.name).text(`${p.name} (¥${p.amount.toLocaleString()}/月)`));
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
        <span class="alert-icon">${icon('exclamation-triangle')}</span>
        <span class="alert-text"><strong>${escHtml(s.name)}</strong> の無料トライアルが<strong>${when}</strong>に終了します。</span>
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
    if (days <= 0)     { cardClass='card-danger';  alertBar=`<div class="card-alert-bar">${icon('exclamation-triangle')} 本日トライアル終了</div>`;               urgencyBadge='<span class="badge badge-danger">本日終了</span>'; }
    else if (days <= 3){ cardClass='card-danger';  alertBar=`<div class="card-alert-bar">${icon('exclamation-triangle')} トライアル終了まであと${days}日</div>`;  urgencyBadge=`<span class="badge badge-danger">あと${days}日</span>`; }
    else if (days <= 7){ cardClass='card-warning'; alertBar=`<div class="card-alert-bar warning-bar">${icon('exclamation-triangle')} トライアル終了まであと${days}日</div>`; urgencyBadge=`<span class="badge badge-warning">あと${days}日</span>`; }
    else               { urgencyBadge='<span class="badge badge-trial">トライアル中</span>'; }
  } else {
    if (days <= 3)      { cardClass='card-warning'; urgencyBadge=`<span class="badge badge-warning">更新まで${days}日</span>`; }
    else if (days <= 7) { urgencyBadge=`<span class="badge badge-info">あと${days}日</span>`; }
  }

  const amountLine  = s.cycle === 'yearly'
    ? `¥${s.amount.toLocaleString()}<span class="card-amount-sub">/年 (月割 ¥${monthly.toLocaleString()})</span>`
    : `¥${s.amount.toLocaleString()}<span class="card-amount-sub">/月</span>`;
  const billingLine = isTrial
    ? `<div class="card-billing">${icon('calendar')} トライアル終了: <strong>${formatDate(s.trialEndDate)}</strong></div>`
    : `<div class="card-billing">${icon('calendar')} 次回更新: <strong>${formatDate(s.nextBillingDate)}</strong>${days > 0 ? ` <span style="color:var(--text-muted)">(${days}日後)</span>` : ''}</div>`;

  return `
    <div class="sub-card ${cardClass}">
      ${alertBar}
      <div class="card-body">
        <div class="card-top">
          <div class="card-icon-wrap">${categoryIcon(s.category)}</div>
          <div class="card-meta">
            <div class="card-name">${escHtml(s.name)}</div>
            <div class="card-badges"><span class="badge badge-category">${escHtml(s.category)}</span></div>
          </div>
          <div class="card-urgency">${urgencyBadge}</div>
        </div>
        <div class="card-amount">${amountLine}</div>
        ${billingLine}
        ${s.notes ? `<div class="card-notes">${icon('paper-clip')} ${escHtml(s.notes)}</div>` : ''}
      </div>
      <div class="card-actions">
        ${isTrial ? `<button class="btn btn-sm btn-outline-danger" data-cancel-id="${s.id}">解約する</button>` : ''}
        ${!isTrial ? `<button class="btn btn-sm btn-outline-success" data-pay-id="${s.id}">支払済み</button>` : ''}
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
  $('#preset-select').val(''); $('#field-name').val(s.name);
  $('#field-category').val(s.category); $('#field-amount').val(s.amount); $('#field-cycle').val(s.cycle);
  $('#field-next-billing').val(s.nextBillingDate); $('#field-is-trial').prop('checked', s.isTrial);
  $('#field-trial-end').val(s.trialEndDate||''); $('#field-notes').val(s.notes||'');
  $('#trial-end-group').toggle(s.isTrial);
  showModal();
};

function showModal() { $('#modal-overlay').addClass('active'); $('body').addClass('modal-open'); setTimeout(() => $('#field-name').focus(), 50); }
function closeModal() { $('#modal-overlay').removeClass('active'); $('body').removeClass('modal-open'); }

function clearForm() {
  $('#preset-select,#field-name,#field-amount,#field-next-billing,#field-trial-end,#field-notes').val('');
  $('#field-category').val('動画'); $('#field-cycle').val('monthly');
  $('#field-is-trial').prop('checked', false); $('#trial-end-group').hide();
}

function fillFromPreset(p) {
  $('#field-name').val(p.name);
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
    name,
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

  const req = editingId !== null ? api.put('subscriptions', editingId, payload) : api.post('subscriptions', payload);
  req.done(res => onDone(res.data)).fail(onFail).always(onAlways);
}

window.deleteSubscription = function(id) {
  if (!confirm('このサブスクリプションを削除しますか？')) return;
  api.delete('subscriptions', id)
    .done(() => { subscriptions = subscriptions.filter(s => s.id !== id); closeModal(); render(); })
    .fail(() => showToast('APIエラー: 削除に失敗しました', 'danger'));
};

window.cancelSubscription = function(id) {
  if (!confirm('このサブスクリプションを解約済みにしますか？')) return;
  api.delete('subscriptions', id)
    .done(() => { subscriptions = subscriptions.filter(x => x.id !== id); render(); })
    .fail(() => showToast('APIエラー: 解約に失敗しました', 'danger'));
};

/* ===== Pay (次回決済日を自動更新) ===== */
window.paySubscription = function(id) {
  if (!confirm('支払済みとして次回決済日を更新しますか？')) return;
  api.post(`subscriptions/${id}/pay`, {})
    .done(res => {
      const idx = subscriptions.findIndex(s => s.id === id);
      if (idx !== -1) subscriptions[idx] = res.data;
      render();
      showToast('次回決済日を更新しました', 'success');
    })
    .fail(() => showToast('決済日の更新に失敗しました', 'danger'));
};

/* ===== Logout ===== */
function logout() {
  api.post('auth/logout', {}).always(() => { clearSession(); window.location.href = 'auth.html'; });
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
  $(document).on('click', '[data-pay-id]',    function () { window.paySubscription(Number($(this).data('pay-id'))); });

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
