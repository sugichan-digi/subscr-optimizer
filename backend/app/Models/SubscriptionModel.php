<?php

namespace App\Models;

use App\Data\SubscriptionInput;
use Illuminate\Support\Facades\DB;

class SubscriptionModel
{
    /**
     * ユーザーのサブスク一覧取得（次回決済日昇順）。
     *
     * @return array<int, array>
     */
    public function listByUserId(int $userId): array
    {
        $rows = DB::select(
            'SELECT id, name, emoji, category, amount, cycle, next_billing_date, is_trial, trial_end_date, status, notes
             FROM subscriptions WHERE user_id = ? ORDER BY next_billing_date ASC',
            [$userId]
        );

        return array_map(fn($r) => $this->toApiArray($r), $rows);
    }

    /**
     * ID とユーザー ID でサブスク存在確認。
     */
    public function findByIdAndUserId(int $id, int $userId): ?object
    {
        return DB::selectOne(
            'SELECT id FROM subscriptions WHERE id = ? AND user_id = ? LIMIT 1',
            [$id, $userId]
        );
    }

    /**
     * サブスク登録。
     *
     * @return array 登録後のサブスクデータ（API 形式）
     */
    public function insert(int $userId, SubscriptionInput $input): array
    {
        DB::insert(
            'INSERT INTO subscriptions
             (user_id, name, emoji, category, amount, cycle, next_billing_date, is_trial, trial_end_date, status, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $userId,
                $input->name,
                $input->emoji,
                $input->category,
                $input->amount,
                $input->cycle,
                $input->nextBillingDate,
                $input->isTrial ? 1 : 0,
                $input->trialEndDate,
                $input->status,
                $input->notes,
            ]
        );

        $id = (int) DB::getPdo()->lastInsertId();

        return $this->fetchAsApiArray($id);
    }

    /**
     * サブスク更新。
     *
     * @return array 更新後のサブスクデータ（API 形式）
     */
    public function update(int $id, int $userId, SubscriptionInput $input): array
    {
        DB::update(
            'UPDATE subscriptions
             SET name = ?, emoji = ?, category = ?, amount = ?, cycle = ?,
                 next_billing_date = ?, is_trial = ?, trial_end_date = ?, status = ?, notes = ?
             WHERE id = ? AND user_id = ?',
            [
                $input->name,
                $input->emoji,
                $input->category,
                $input->amount,
                $input->cycle,
                $input->nextBillingDate,
                $input->isTrial ? 1 : 0,
                $input->trialEndDate,
                $input->status,
                $input->notes,
                $id,
                $userId,
            ]
        );

        return $this->fetchAsApiArray($id);
    }

    /**
     * サブスク削除。
     */
    public function delete(int $id, int $userId): void
    {
        DB::delete('DELETE FROM subscriptions WHERE id = ? AND user_id = ?', [$id, $userId]);
    }

    /**
     * ユーザー ID に紐づく全サブスク削除（退会時）。
     */
    public function deleteByUserId(int $userId): void
    {
        DB::delete('DELETE FROM subscriptions WHERE user_id = ?', [$userId]);
    }

    /**
     * ID でサブスクを取得して API 配列形式で返却。
     */
    private function fetchAsApiArray(int $id): array
    {
        $row = DB::selectOne(
            'SELECT id, name, emoji, category, amount, cycle, next_billing_date, is_trial, trial_end_date, status, notes
             FROM subscriptions WHERE id = ? LIMIT 1',
            [$id]
        );

        return $this->toApiArray($row);
    }

    /**
     * DB 行を API レスポンス用配列（camelCase）に変換。
     */
    private function toApiArray(object $row): array
    {
        return [
            'id'              => (int) $row->id,
            'name'            => $row->name,
            'emoji'           => $row->emoji,
            'category'        => $row->category,
            'amount'          => (int) $row->amount,
            'cycle'           => $row->cycle,
            'nextBillingDate' => $row->next_billing_date,
            'isTrial'         => (bool) $row->is_trial,
            'trialEndDate'    => $row->trial_end_date,
            'status'          => $row->status,
            'notes'           => $row->notes,
        ];
    }
}
