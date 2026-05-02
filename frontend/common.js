'use strict';

// キャッシュバスティング用のバージョン（日付 YYYYMMDD）
const now = new Date();
const APP_VERSION = now.getFullYear() + 
  ("00" + (now.getMonth() + 1)).slice(-2) + 
  ("00" + now.getDate()).slice(-2);

// APIのベースURL
const API_BASE = 'http://localhost:8000/api';
// const API_BASE = 'https://api-subsc-manage.rbtm.jp/';

// キャッシュバスティング付きでCSSを読み込む関数
function loadStyle(href) {
  document.write('<link rel="stylesheet" href="' + href + '?v=' + APP_VERSION + '">');
}

// キャッシュバスティング付きでJSを読み込む関数
function loadScript(src) {
  document.write('<script src="' + src + '?v=' + APP_VERSION + '"><\\/script>');
}
