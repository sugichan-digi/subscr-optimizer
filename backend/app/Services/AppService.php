<?php

namespace App\Services;

class AppService
{
    /**
     * ランダムな hex トークン生成。
     *
     * @param int $bytes バイト数（デフォルト 32）
     */
    public function generateToken(int $bytes = 32): string
    {
        return bin2hex(random_bytes($bytes));
    }

    /**
     * Authorization ヘッダーから Bearer トークン抽出。
     */
    public function getBearerToken(): ?string
    {
        $header = request()->header('Authorization', '');

        if (preg_match('/^Bearer\s+(\S+)$/i', $header, $m)) {
            return $m[1];
        }

        return null;
    }

    /**
     * メールアドレス形式バリデーション。
     */
    public function isValidEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * パスワード長バリデーション（8文字以上）。
     */
    public function isValidPassword(string $password): bool
    {
        return mb_strlen($password) >= 8;
    }

    /**
     * bcrypt ハッシュ生成。
     */
    public function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_DEFAULT);
    }

    /**
     * パスワードとハッシュの照合。
     */
    public function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    /**
     * セッション有効期限（30日後）。
     */
    public function sessionExpiresAt(): string
    {
        return now()->addDays(30)->format('Y-m-d H:i:s');
    }

    /**
     * リセットトークン有効期限（1時間後）。
     */
    public function resetTokenExpiresAt(): string
    {
        return now()->addHour()->format('Y-m-d H:i:s');
    }
}
