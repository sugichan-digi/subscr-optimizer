<?php

namespace App\Data;

/** サブスク登録・更新リクエストの入力値。 */
readonly class SubscriptionInput
{
    public function __construct(
        /** サービス名 */
        public string  $name,
        /** アイコン絵文字 */
        public ?string $emoji,
        /** カテゴリ */
        public ?string $category,
        /** 金額（円） */
        public int     $amount,
        /** 課金サイクル（monthly / yearly） */
        public string  $cycle,
        /** 次回決済日（YYYY-MM-DD） */
        public string  $nextBillingDate,
        /** トライアル中フラグ */
        public bool    $isTrial,
        /** トライアル終了日（YYYY-MM-DD） */
        public ?string $trialEndDate,
        /** ステータス（active / cancelled） */
        public string  $status,
        /** メモ */
        public ?string $notes,
    ) {}
}
