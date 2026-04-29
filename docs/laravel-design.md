# Laravel バックエンド設計書

## ディレクトリ構成

```
backend/
└── app/
    ├── Controllers/   # リクエスト受付・レスポンス返却
    ├── Models/        # DB接続・クエリ定義
    └── Services/      # ビジネスロジック・ユーティリティ
```

---

## 層の責務

### Controller
- HTTP リクエストを受け取り、Service / Model を呼び出してレスポンスを返す
- ロジックは書かない

### Model
- `DB` ファサードを使ったクエリメソッドのみ定義する
- Eloquent ORM（`Model::find()` など）は**絶対に使用しない**
- `use Illuminate\Support\Facades\DB;` を必ずインポートする

### Service
- ビジネスロジックを書く
- 共通ユーティリティは単一クラス（例: `AppService`）にまとめてよい

---

## 禁止事項

- **Eloquent ORM による DB 操作は一切禁止**
  - `User::find()`, `User::create()`, `$model->save()` などすべて NG
  - DB アクセスは必ず `DB` ファサード経由

---

## DB ファサード使用規則

```php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

DB::transaction(function () {
    // すべての DB 操作はトランザクション内に書く
    DB::insert('INSERT INTO users (email) VALUES (?)', [$email]);
});
```

### トランザクションのエラーハンドリング

```php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

try {
    DB::transaction(function () {
        // DB 操作
    });
} catch (\Throwable $e) {
    Log::error('処理名 失敗', [
        'message' => $e->getMessage(),
        'trace'   => $e->getTraceAsString(),
    ]);
    // 呼び出し元へ例外を再スローするか、エラーレスポンスを返す
    throw $e;
}
```

- **DB 操作には必ず `DB::transaction()` を使う**
- 例外は `try/catch` で捕捉し、`Log::error()` でログに記録する
- ログクラスは `use Illuminate\Support\Facades\Log;`

---

## 構造化の指針

- データの受け渡しには PHP の `readonly class`（値オブジェクト）や配列型を活用する
- Controller → Service → Model の一方向の依存にする

```php
// 値オブジェクトの例
readonly class CreateSubscriptionInput
{
    public function __construct(
        public int    $userId,
        public string $name,
        public int    $amount,
        public string $cycle,
        public string $nextBillingDate,
    ) {}
}
```

---

## インポート一覧（必須）

| 用途 | use 文 |
|---|---|
| DB 操作 | `use Illuminate\Support\Facades\DB;` |
| ログ記録 | `use Illuminate\Support\Facades\Log;` |
