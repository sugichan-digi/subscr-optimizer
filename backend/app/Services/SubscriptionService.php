<?php

namespace App\Services;

use App\Data\SubscriptionInput;
use App\Models\SubscriptionModel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SubscriptionService
{
    public function __construct(
        private readonly SubscriptionModel $subscriptionModel,
    ) {}

    /**
     * ユーザーのサブスク一覧取得。
     *
     * @return array<int, array>
     */
    public function list(int $userId): array
    {
        return $this->subscriptionModel->listByUserId($userId);
    }

    /**
     * サブスク新規登録。
     *
     * @return array 登録後のサブスクデータ
     */
    public function create(int $userId, SubscriptionInput $input): array
    {
        $result = null;

        try {
            DB::transaction(function () use ($userId, $input, &$result) {
                $result = $this->subscriptionModel->insert($userId, $input);
            });
        } catch (\Throwable $e) {
            Log::error('subscription create 失敗', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            throw $e;
        }

        return $result;
    }

    /**
     * サブスク更新。
     *
     * @return array|null 更新後のデータ。ID 未存在の場合 null。
     */
    public function update(int $id, int $userId, SubscriptionInput $input): ?array
    {
        if ($this->subscriptionModel->findByIdAndUserId($id, $userId) === null) {
            return null;
        }

        $result = null;

        try {
            DB::transaction(function () use ($id, $userId, $input, &$result) {
                $result = $this->subscriptionModel->update($id, $userId, $input);
            });
        } catch (\Throwable $e) {
            Log::error('subscription update 失敗', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            throw $e;
        }

        return $result;
    }

    /**
     * サブスク削除。
     *
     * @return bool 削除成功は true、ID 未存在は false。
     */
    public function delete(int $id, int $userId): bool
    {
        if ($this->subscriptionModel->findByIdAndUserId($id, $userId) === null) {
            return false;
        }

        try {
            DB::transaction(function () use ($id, $userId) {
                $this->subscriptionModel->delete($id, $userId);
            });
        } catch (\Throwable $e) {
            Log::error('subscription delete 失敗', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            throw $e;
        }

        return true;
    }
}
