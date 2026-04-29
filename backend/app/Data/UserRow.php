<?php

namespace App\Data;

/** users テーブルの 1 行を表す値オブジェクト。 */
readonly class UserRow
{
    public function __construct(
        /** ユーザー ID */
        public int     $id,
        /** メールアドレス（ゲストは null） */
        public ?string $email,
        /** bcrypt ハッシュ（ゲストは null） */
        public ?string $passwordHash,
        /** ゲストフラグ */
        public bool    $isGuest,
        /** 登録日時 */
        public string  $createdAt,
    ) {}
}
