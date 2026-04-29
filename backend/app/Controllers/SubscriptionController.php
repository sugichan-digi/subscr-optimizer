<?php

namespace App\Controllers;

use App\Data\SubscriptionInput;
use App\Services\AppService;
use App\Services\AuthService;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController
{
    public function __construct(
        private readonly AppService          $app,
        private readonly AuthService         $authService,
        private readonly SubscriptionService $subscriptionService,
    ) {}

    /**
     * サブスク一覧取得。
     */
    public function index(): JsonResponse
    {
        $userId = $this->resolveAuthOrFail();

        if ($userId instanceof JsonResponse) {
            return $userId;
        }

        $items = $this->subscriptionService->list($userId);

        return response()->json(['data' => $items, 'count' => count($items)]);
    }

    /**
     * サブスク新規登録。
     */
    public function store(Request $request): JsonResponse
    {
        $userId = $this->resolveAuthOrFail();

        if ($userId instanceof JsonResponse) {
            return $userId;
        }

        $validation = $this->validateInput($request);

        if ($validation !== null) {
            return $validation;
        }

        $result = $this->subscriptionService->create($userId, $this->buildInput($request));

        return response()->json(['data' => $result], 201);
    }

    /**
     * サブスク更新。
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $userId = $this->resolveAuthOrFail();

        if ($userId instanceof JsonResponse) {
            return $userId;
        }

        $validation = $this->validateInput($request);

        if ($validation !== null) {
            return $validation;
        }

        $result = $this->subscriptionService->update($id, $userId, $this->buildInput($request));

        if ($result === null) {
            return response()->json(['error' => '指定されたIDが見つかりません'], 404);
        }

        return response()->json(['data' => $result]);
    }

    /**
     * 支払済み処理：次回決済日を自動更新。
     */
    public function pay(int $id): JsonResponse
    {
        $userId = $this->resolveAuthOrFail();

        if ($userId instanceof JsonResponse) {
            return $userId;
        }

        $result = $this->subscriptionService->pay($id, $userId);

        if ($result === null) {
            return response()->json(['error' => '指定されたIDが見つかりません'], 404);
        }

        return response()->json(['data' => $result]);
    }

    /**
     * サブスク削除。
     */
    public function destroy(int $id): JsonResponse
    {
        $userId = $this->resolveAuthOrFail();

        if ($userId instanceof JsonResponse) {
            return $userId;
        }

        $deleted = $this->subscriptionService->delete($id, $userId);

        if (!$deleted) {
            return response()->json(['error' => '指定されたIDが見つかりません'], 404);
        }

        return response()->json(['success' => true, 'id' => $id]);
    }

    /**
     * Bearer トークン認証。失敗時はエラーレスポンスを返す。
     */
    private function resolveAuthOrFail(): int|JsonResponse
    {
        $token = $this->app->getBearerToken();

        if (!$token) {
            return response()->json(['error' => '認証が必要です'], 401);
        }

        $userId = $this->authService->resolveUserId($token);

        if ($userId === null) {
            return response()->json(['error' => 'セッションが無効または期限切れです'], 401);
        }

        return $userId;
    }

    /**
     * リクエストボディのバリデーション。
     */
    private function validateInput(Request $request): ?JsonResponse
    {
        if (!$request->input('name')) {
            return response()->json(['error' => 'サービス名は必須です'], 400);
        }
        if (!$request->has('amount') || (int) $request->input('amount') < 1) {
            return response()->json(['error' => '金額は1以上の数値を入力してください'], 400);
        }
        if (!$request->input('nextBillingDate')) {
            return response()->json(['error' => '次回決済日は必須です'], 400);
        }
        if (!in_array($request->input('cycle'), ['monthly', 'yearly'], true)) {
            return response()->json(['error' => 'cycleはmonthlyまたはyearlyを指定してください'], 400);
        }

        return null;
    }

    /**
     * リクエストから SubscriptionInput を生成。
     */
    private function buildInput(Request $request): SubscriptionInput
    {
        return new SubscriptionInput(
            name:            $request->input('name'),
            emoji:           $request->input('emoji'),
            category:        $request->input('category'),
            amount:          (int) $request->input('amount'),
            cycle:           $request->input('cycle'),
            nextBillingDate: $request->input('nextBillingDate'),
            isTrial:         (bool) $request->input('isTrial', false),
            trialEndDate:    $request->input('trialEndDate'),
            status:          $request->input('status', 'active'),
            notes:           $request->input('notes'),
        );
    }
}
