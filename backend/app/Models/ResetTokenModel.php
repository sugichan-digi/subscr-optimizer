<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;

class ResetTokenModel
{
    /**
     * 有効なリセットトークンをトークン文字列で検索。
     */
    public function findActiveByToken(string $token): ?object
    {
        return DB::selectOne(
            'SELECT user_id, email FROM reset_tokens WHERE token = ? AND expires_at > NOW() LIMIT 1',
            [$token]
        );
    }

    /**
     * リセットトークンの登録（同一ユーザーの既存トークンは削除して上書き）。
     */
    public function upsert(string $token, int $userId, string $email, string $expiresAt): void
    {
        DB::delete('DELETE FROM reset_tokens WHERE user_id = ?', [$userId]);

        DB::insert(
            'INSERT INTO reset_tokens (token, user_id, email, expires_at) VALUES (?, ?, ?, ?)',
            [$token, $userId, $email, $expiresAt]
        );
    }

    /**
     * トークン文字列でリセットトークン削除（使用済み処理）。
     */
    public function deleteByToken(string $token): void
    {
        DB::delete('DELETE FROM reset_tokens WHERE token = ?', [$token]);
    }

    /**
     * ユーザー ID に紐づくリセットトークン削除（退会時）。
     */
    public function deleteByUserId(int $userId): void
    {
        DB::delete('DELETE FROM reset_tokens WHERE user_id = ?', [$userId]);
    }
}
