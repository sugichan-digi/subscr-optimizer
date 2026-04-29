# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SubsOptimizer — サブスクリプション管理・最適化ツール。

```
frontend/   # 静的フロントエンド（HTML / CSS / jQuery）
backend/    # Laravel バックエンド（PHP 8.4）
docs/       # 設計書・OpenAPI仕様・DBML・DDL
```

---

## Laravel バックエンド コーディングルール

**詳細設計書: [`docs/laravel-design.md`](docs/laravel-design.md)**

バックエンドを実装する際は以下のルールを**必ず**守ること。

### ディレクトリ構成

```
backend/app/
├── Controllers/   # リクエスト受付・レスポンス返却のみ
├── Models/        # DBクエリ定義のみ
└── Services/      # ビジネスロジック
```

### 絶対に守るルール

1. **Eloquent ORM は使用禁止** — `User::find()`, `$model->save()` など一切 NG
2. **DB アクセスは DB ファサードのみ** — `use Illuminate\Support\Facades\DB;`
3. **DB 操作は必ず `DB::transaction()` 内に書く**
4. **トランザクション失敗時は `try/catch` で捕捉し `Log::error()` でログ記録**
   - `use Illuminate\Support\Facades\Log;`
5. **値オブジェクト（`readonly class`）を活用して構造化する**
6. **依存の方向: Controller → Service → Model（一方向）**

### テンプレート

```php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

try {
    DB::transaction(function () {
        DB::insert('INSERT INTO ...', [...]);
    });
} catch (\Throwable $e) {
    Log::error('XXX 失敗', ['message' => $e->getMessage()]);
    throw $e;
}
```
