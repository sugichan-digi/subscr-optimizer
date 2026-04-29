<?php

namespace App\Data;

/** ログインリクエストの入力値。 */
readonly class LoginInput
{
    public function __construct(
        /** メールアドレス */
        public string $email,
        /** パスワード（平文） */
        public string $password,
    ) {}
}
