# SubsOptimizer

サブスクリプションの継続・解約・アップグレードを意思決定するためのダッシュボード。

Netflix・Spotify・ChatGPT Plus など、月額課金サービスをまとめて管理し、  
トライアル期限切れや更新日をアラートで通知します。

---

## 機能

- **サブスク一覧管理** — 登録・編集・削除
- **トライアルアラート** — 無料期間終了の3日前に警告表示
- **更新日カウントダウン** — 次回決済日をカード上に可視化
- **KPI ダッシュボード** — 月額合計・登録件数・今月の更新件数をひと目で確認
- **プリセット DB** — Netflix / Spotify / ChatGPT Plus など 23 サービスをワンクリック登録
- **ユーザー認証** — メール＋パスワード登録・ログイン・ゲストログイン
- **パスワードリセット** — トークンベースのリセットフロー
- **退会機能** — アカウントおよび全データの削除

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | HTML / CSS / JavaScript（jQuery） |
| バックエンド | PHP 8.4（ビルトインサーバー） |
| データ保存 | JSON ファイル（モック） |
| API 仕様 | OpenAPI 3.0.3 |
| API ドキュメント | Redoc |

---

## ディレクトリ構成

```
subscr-optimizer/
├── frontend/
│   ├── index.html       # ダッシュボード画面
│   ├── auth.html        # ログイン・新規登録・パスワードリセット画面
│   ├── style.css        # ダッシュボード用スタイル
│   ├── auth.css         # 認証画面用スタイル
│   ├── script.js        # ダッシュボードロジック（jQuery）
│   └── auth.js          # 認証ロジック（jQuery）
├── backend/
│   ├── api.php          # API エントリーポイント（PHP）
│   ├── openapi.yaml     # OpenAPI 3.0.3 仕様書
│   └── data/            # JSON データ保存先（.gitignore 対象）
├── apidoc/
│   └── index.html       # Redoc で生成した API ドキュメント（HTML）
├── package.json
└── README.md
```

---

## セットアップ

### 必要な環境

- PHP 8.4 以上
- Node.js / npm（API ドキュメント生成時のみ）

### 手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/<your-name>/subscr-optimizer.git
cd subscr-optimizer

# 2. npm パッケージをインストール（API ドキュメント生成用）
npm install

# 3. PHP ビルトインサーバーを起動
php -S localhost:8080 -t backend

# 4. ブラウザで開く
open frontend/auth.html
```

> **注意**: `backend/data/` ディレクトリは `.gitignore` 対象です。  
> clone 直後はディレクトリのみ存在し、JSON ファイルはありません。  
> サーバー起動後、初回ユーザー登録時に自動生成されます。

---

## API ドキュメントの生成

OpenAPI 仕様書（`backend/openapi.yaml`）から Redoc 形式の静的 HTML を生成します。

```bash
npm run docs
```

生成されたドキュメントは `apidoc/index.html` に出力されます。  
ブラウザで直接開いて参照できます。

```bash
open apidoc/index.html
```

---

## API 仕様の概要

ベース URL: `http://localhost:8080/api.php`

| メソッド | パス | 認証 | 概要 |
|---|---|---|---|
| GET | `/health` | 不要 | ヘルスチェック |
| POST | `/auth/register` | 不要 | 新規ユーザー登録 |
| POST | `/auth/login` | 不要 | ログイン |
| POST | `/auth/guest` | 不要 | ゲストログイン |
| POST | `/auth/logout` | 必要 | ログアウト |
| POST | `/auth/forgot-password` | 不要 | パスワードリセットトークン発行 |
| POST | `/auth/reset-password` | 不要 | パスワードリセット |
| DELETE | `/auth/account` | 必要 | 退会（全データ削除） |
| GET | `/subscriptions` | 必要 | サブスク一覧取得 |
| POST | `/subscriptions` | 必要 | サブスク登録 |
| PUT | `/subscriptions/{id}` | 必要 | サブスク更新 |
| DELETE | `/subscriptions/{id}` | 必要 | サブスク削除 |
| GET | `/presets` | 不要 | プリセットサービス一覧 |

認証が必要なエンドポイントは `Authorization: Bearer {token}` ヘッダーを付与してください。  
詳細は `backend/openapi.yaml` または生成済みの `apidoc/index.html` を参照してください。

---

## 開発上の注意事項

### パスワードリセットのモック動作

本実装はメール送信を行いません。  
`POST /auth/forgot-password` のレスポンスに `dev_reset_token` フィールドとして  
リセットトークンが返却されます。フロントエンドはこれを自動入力してリセット画面に遷移します。  
本番環境への移行時はメール送信処理を実装し、このフィールドを削除してください。

### データの永続化

すべてのデータは `backend/data/` 配下の JSON ファイルに保存されます。  
本番環境への移行時はデータベース（MySQL・PostgreSQL など）への置き換えを推奨します。
