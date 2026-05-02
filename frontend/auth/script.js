'use strict';

/* ===== Config ===== */
// API_BASE は common.js にて定義されています

/* ===== Icons ===== */
const EYE_SVG      = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>';
const EYE_SLASH_SVG = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>';
const GUEST_BTN_HTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/></svg>ゲストとして始める';

/* ===== API ===== */
function authPost(path, data) {
  return $.ajax({
    url:         `${API_BASE}/${path}`,
    method:      'POST',
    contentType: 'application/json',
    data:        JSON.stringify(data),
    dataType:    'json',
    timeout:     8000,
  });
}

/* ===== Session ===== */
function saveSession(token, user) {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
}

function isLoggedIn() {
  return !!localStorage.getItem('auth_token');
}

/* ===== View Switching ===== */
const VIEWS = ['view-login', 'view-register', 'view-forgot', 'view-reset'];

function showView(viewId) {
  VIEWS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.hidden = (id !== viewId);
  });
  clearAllMessages();
}

function clearAllMessages() {
  $('.auth-msg').text('').hide();
}

function showError(selector, msg) {
  $(selector).text(msg).show();
}

function showSuccess(selector, msg) {
  $(selector).text(msg).show();
}

function setLoading($btn, isLoading, defaultText) {
  $btn.prop('disabled', isLoading).text(isLoading ? '処理中...' : defaultText);
}

/* ===== URL パラメータからリセットトークンを読み込む ===== */
function getUrlParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* ===== jQuery Document Ready ===== */
$(function () {

  // ログイン済みなら即リダイレクト
  if (isLoggedIn()) {
    window.location.href = '../dashboard/';
    return;
  }

  // メール内リンク経由のリセット: ?token=xxx が付いていればリセット画面を表示
  const urlToken = getUrlParam('token');
  if (urlToken) {
    $('#reset-token').val(urlToken);
    showView('view-reset');
    // URLからトークンを除去（ブラウザ履歴にトークンを残さない）
    history.replaceState(null, '', window.location.pathname);
  }

  /* ---------- パスワード表示トグル ---------- */
  $(document).on('click', '.toggle-pw', function () {
    const $input = $('#' + $(this).data('target'));
    const isText = $input.attr('type') === 'text';
    $input.attr('type', isText ? 'password' : 'text');
    $(this).html(isText ? EYE_SVG : EYE_SLASH_SVG);
  });

  /* ---------- ビュー切り替えリンク ---------- */
  $('#link-to-register').on('click', (e) => { e.preventDefault(); showView('view-register'); });
  $('#link-to-login-from-reg, #link-forgot-back, #link-reset-back').on('click', (e) => { e.preventDefault(); showView('view-login'); });
  $('#link-to-forgot').on('click', (e) => { e.preventDefault(); showView('view-forgot'); });

  /* ---------- ログイン ---------- */
  $('#form-login').on('submit', function (e) {
    e.preventDefault();
    const $btn     = $('#btn-login');
    const email    = $('#login-email').val().trim();
    const password = $('#login-password').val();

    if (!email || !password) {
      showError('#login-error', 'メールアドレスとパスワードを入力してください');
      return;
    }

    setLoading($btn, true, 'ログイン');
    clearAllMessages();

    authPost('auth/login', { email, password })
      .done(res => {
        saveSession(res.token, res.user);
        window.location.href = '../dashboard/';
      })
      .fail(xhr => {
        showError('#login-error', xhr.responseJSON?.error || 'ログインに失敗しました');
        setLoading($btn, false, 'ログイン');
      });
  });

  /* ---------- 新規登録 ---------- */
  $('#form-register').on('submit', function (e) {
    e.preventDefault();
    const $btn     = $('#btn-register');
    const email    = $('#reg-email').val().trim();
    const password = $('#reg-password').val();
    const confirm  = $('#reg-confirm').val();

    if (!email)               { showError('#register-error', 'メールアドレスを入力してください'); return; }
    if (password.length < 8)  { showError('#register-error', 'パスワードは8文字以上で入力してください'); return; }
    if (password !== confirm)  { showError('#register-error', 'パスワードが一致しません'); return; }

    setLoading($btn, true, 'アカウントを作成');
    clearAllMessages();

    authPost('auth/register', { email, password })
      .done(res => {
        saveSession(res.token, res.user);
        window.location.href = '../dashboard/';
      })
      .fail(xhr => {
        showError('#register-error', xhr.responseJSON?.error || '登録に失敗しました');
        setLoading($btn, false, 'アカウントを作成');
      });
  });

  /* ---------- ゲストログイン ---------- */
  $('#btn-guest').on('click', function () {
    const $btn = $(this);
    $btn.prop('disabled', true).text('処理中...');
    clearAllMessages();

    authPost('auth/guest', {})
      .done(res => {
        saveSession(res.token, res.user);
        window.location.href = '../dashboard/';
      })
      .fail(xhr => {
        showError('#login-error', xhr.responseJSON?.error || 'ゲストログインに失敗しました');
        $btn.prop('disabled', false).html(GUEST_BTN_HTML);
      });
  });

  /* ---------- パスワードを忘れた ---------- */
  $('#form-forgot').on('submit', function (e) {
    e.preventDefault();
    const $btn  = $('#btn-forgot');
    const email = $('#forgot-email').val().trim();

    if (!email) { showError('#forgot-error', 'メールアドレスを入力してください'); return; }

    setLoading($btn, true, 'メールを送信中...');
    clearAllMessages();

    authPost('auth/forgot-password', { email })
      .done(res => {
        setLoading($btn, false, 'メールを送信する');
        showSuccess('#forgot-success', res.message || 'パスワードリセット用のメールをお送りしました。メールをご確認ください。');
        $('#forgot-email').val('');
      })
      .fail(xhr => {
        showError('#forgot-error', xhr.responseJSON?.error || 'エラーが発生しました。しばらくしてから再度お試しください。');
        setLoading($btn, false, 'メールを送信する');
      });
  });

  /* ---------- パスワードリセット ---------- */
  $('#form-reset').on('submit', function (e) {
    e.preventDefault();
    const $btn     = $('#btn-reset');
    const token    = $('#reset-token').val().trim();
    const password = $('#reset-password').val();
    const confirm  = $('#reset-confirm').val();

    if (!token)               { showError('#reset-error', 'リセットリンクが無効です。メール内のリンクをご確認ください。'); return; }
    if (password.length < 8)  { showError('#reset-error', 'パスワードは8文字以上で入力してください'); return; }
    if (password !== confirm)  { showError('#reset-error', 'パスワードが一致しません'); return; }

    setLoading($btn, true, 'パスワードをリセット');
    clearAllMessages();

    authPost('auth/reset-password', { token, password })
      .done(() => {
        showSuccess('#reset-success', 'パスワードをリセットしました。ログイン画面に移動します...');
        setTimeout(() => showView('view-login'), 2200);
      })
      .fail(xhr => {
        showError('#reset-error', xhr.responseJSON?.error || 'リセットリンクが無効または期限切れです。再度パスワードリセットをお試しください。');
        setLoading($btn, false, 'パスワードをリセット');
      });
  });

});
