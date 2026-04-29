<?php

namespace App\Data;

/** 新規登録リクエストの入力値。 */
readonly class RegisterInput
{
    public function __construct(
        /** メールアドレス */
        public string $email,
        /** パスワード（平文） */
        public string $password,
    ) {}
}
