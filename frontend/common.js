'use strict';

// キャッシュバスティングや全体で利用するバージョン情報
const APP_VERSION = '2026050201';

// APIのベースURL
const API_BASE = 'http://localhost:8000/api';

// キャッシュバスティング付きでCSSを読み込む関数
function loadStyle(href) {
  document.write('<link rel="stylesheet" href="' + href + '?v=' + APP_VERSION + '">');
}

// キャッシュバスティング付きでJSを読み込む関数
function loadScript(src) {
  document.write('<script src="' + src + '?v=' + APP_VERSION + '"><\\/script>');
}
