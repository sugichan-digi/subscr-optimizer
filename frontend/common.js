'use strict';

// キャッシュバスティング用のバージョン（日付＋時刻 YYYYMMDDHHMMSS）
const now = new Date();
const APP_VERSION = now.getFullYear() + 
  ("00" + (now.getMonth() + 1)).slice(-2) + 
  ("00" + now.getDate()).slice(-2) +
  ("00" + now.getHours()).slice(-2) + 
  ("00" + now.getMinutes()).slice(-2) + 
  ("00" + now.getSeconds()).slice(-2);

// APIのベースURL
const API_BASE = 'http://localhost:8000';
// const API_BASE = 'https://api-subsc-manage.rbtm.jp/';


/* ===== Shared API & Session ===== */

