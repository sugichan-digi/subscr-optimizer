<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;

class SessionModel
{
    /**
     * 有効なセッションをトークンで検索。
     */
    public function findActiveByToken(string $token): ?object
    {
        return DB::selectOne(
            'SELECT user_id FROM sessions WHERE token = ? AND expires_at > NOW() LIMIT 1',
            [$token]
        );
    }

    /**
     * セッション登録。
     */
    public function insert(string $token, int $userId, string $expiresAt): void
    {
        DB::insert(
            'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
            [$token, $userId, $expiresAt]
        );
    }

    /**
     * トークンでセッション削除（ログアウト）。
     */
    public function deleteByToken(string $token): void
    {
        DB::delete('DELETE FROM sessions WHERE token = ?', [$token]);
    }

    /**
     * ユーザー ID に紐づく全セッション削除（退会時）。
     */
    public function deleteByUserId(int $userId): void
    {
        DB::delete('DELETE FROM sessions WHERE user_id = ?', [$userId]);
    }
}
