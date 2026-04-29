<?php

namespace App\Models;

use App\Data\UserRow;
use Illuminate\Support\Facades\DB;

class UserModel
{
    /**
     * メールアドレスでユーザー検索（通常ユーザーのみ）。
     */
    public function findByEmail(string $email): ?UserRow
    {
        $row = DB::selectOne(
            'SELECT id, email, password_hash, is_guest, created_at FROM users WHERE email = ? AND is_guest = 0 LIMIT 1',
            [strtolower($email)]
        );

        return $row ? $this->hydrate($row) : null;
    }

    /**
     * ID でユーザー検索。
     */
    public function findById(int $id): ?UserRow
    {
        $row = DB::selectOne(
            'SELECT id, email, password_hash, is_guest, created_at FROM users WHERE id = ? LIMIT 1',
            [$id]
        );

        return $row ? $this->hydrate($row) : null;
    }

    /**
     * メールアドレスの重複確認（通常ユーザー）。
     */
    public function existsByEmail(string $email): bool
    {
        $row = DB::selectOne(
            'SELECT id FROM users WHERE email = ? AND is_guest = 0 LIMIT 1',
            [strtolower($email)]
        );

        return $row !== null;
    }

    /**
     * 通常ユーザー登録。
     *
     * @return int 採番された user_id
     */
    public function insert(string $email, string $passwordHash): int
    {
        DB::insert(
            'INSERT INTO users (email, password_hash, is_guest) VALUES (?, ?, 0)',
            [strtolower($email), $passwordHash]
        );

        return (int) DB::getPdo()->lastInsertId();
    }

    /**
     * ゲストユーザー登録。
     *
     * @return int 採番された user_id
     */
    public function insertGuest(): int
    {
        DB::insert('INSERT INTO users (email, password_hash, is_guest) VALUES (NULL, NULL, 1)');

        return (int) DB::getPdo()->lastInsertId();
    }

    /**
     * パスワードハッシュ更新。
     */
    public function updatePassword(int $id, string $passwordHash): void
    {
        DB::update(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [$passwordHash, $id]
        );
    }

    /**
     * ユーザー削除。
     */
    public function delete(int $id): void
    {
        DB::delete('DELETE FROM users WHERE id = ?', [$id]);
    }

    /**
     * DB 行を UserRow に変換。
     */
    private function hydrate(object $row): UserRow
    {
        return new UserRow(
            id:           (int) $row->id,
            email:        $row->email,
            passwordHash: $row->password_hash,
            isGuest:      (bool) $row->is_guest,
            createdAt:    $row->created_at,
        );
    }
}
