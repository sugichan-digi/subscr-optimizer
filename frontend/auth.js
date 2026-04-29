'use strict';

const API_BASE = 'http://localhost:8000/api';

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

/* ===== jQuery Document Ready ===== */
$(function () {

  // ログイン済みなら即リダイレクト
  if (isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  /* ---------- パスワード表示トグル ---------- */
  $(document).on('click', '.toggle-pw', function () {
    const $input = $('#' + $(this).data('target'));
    const isText = $input.attr('type') === 'text';
    $input.attr('type', isText ? 'password' : 'text');
    $(this).text(isText ? '👁' : '🙈');
  });

  /* ---------- トークンコピー ---------- */
  $('#btn-copy-token').on('click', function () {
    const token = $('#dev-token-display').text();
    navigator.clipboard.writeText(token).then(() => {
      $(this).text('コピー済み ✓');
      setTimeout(() => $(this).text('コピー'), 2000);
    });
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
        window.location.href = 'index.html';
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
        window.location.href = 'index.html';
      })
      .fail(xhr => {
        showError('#register-error', xhr.responseJSON?.error || '登録に失敗しました');
        setLoading($btn, false, 'アカウントを作成');
      });
  });

  /* ---------- ゲストログイン ---------- */
  $('#btn-guest').on('click', function () {
    const $btn = $(this);
    setLoading($btn, true, '👤 ゲストとして始める');
    clearAllMessages();

    authPost('auth/guest', {})
      .done(res => {
        saveSession(res.token, res.user);
        window.location.href = 'index.html';
      })
      .fail(xhr => {
        showError('#login-error', xhr.responseJSON?.error || 'ゲストログインに失敗しました');
        setLoading($btn, false, '👤 ゲストとして始める');
      });
  });

  /* ---------- パスワードを忘れた ---------- */
  $('#form-forgot').on('submit', function (e) {
    e.preventDefault();
    const $btn  = $('#btn-forgot');
    const email = $('#forgot-email').val().trim();

    if (!email) { showError('#forgot-error', 'メールアドレスを入力してください'); return; }

    setLoading($btn, true, 'リセットトークンを発行');
    clearAllMessages();

    authPost('auth/forgot-password', { email })
      .done(res => {
        setLoading($btn, false, 'リセットトークンを発行');

        if (res.dev_reset_token) {
          // モック: トークンを表示してリセット画面へ自動遷移
          showView('view-reset');
          $('#dev-token-display').text(res.dev_reset_token);
          $('#reset-token-box').show().removeAttr('hidden');
          $('#reset-token').val(res.dev_reset_token);
          showSuccess('#reset-success', '【開発モード】トークンが自動入力されました。新しいパスワードを入力してください。');
        } else {
          showSuccess('#forgot-success', 'メールアドレスが登録されている場合、リセットトークンを発行しました。');
        }
      })
      .fail(xhr => {
        showError('#forgot-error', xhr.responseJSON?.error || 'リセットに失敗しました');
        setLoading($btn, false, 'リセットトークンを発行');
      });
  });

  /* ---------- パスワードリセット ---------- */
  $('#form-reset').on('submit', function (e) {
    e.preventDefault();
    const $btn     = $('#btn-reset');
    const token    = $('#reset-token').val().trim();
    const password = $('#reset-password').val();
    const confirm  = $('#reset-confirm').val();

    if (!token)               { showError('#reset-error', 'リセットトークンを入力してください'); return; }
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
        showError('#reset-error', xhr.responseJSON?.error || 'リセットに失敗しました');
        setLoading($btn, false, 'パスワードをリセット');
      });
  });

});
