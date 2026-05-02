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
        $nextBillingDate = (string) $request->input('nextBillingDate');
        if (!$this->isValidYmdDate($nextBillingDate)) {
            return response()->json(['error' => '次回決済日は YYYY-MM-DD 形式で入力してください'], 400);
        }

        $isTrial = $request->boolean('isTrial', false);
        if (!in_array($request->input('cycle'), ['monthly', 'yearly'], true)) {
            return response()->json(['error' => 'cycleはmonthlyまたはyearlyを指定してください'], 400);
        }

        if ($isTrial) {
            if (!$request->input('trialEndDate')) {
                return response()->json(['error' => 'トライアル終了日は必須です'], 400);
            }
            $trialEndDate = (string) $request->input('trialEndDate');
            if (!$this->isValidYmdDate($trialEndDate)) {
                return response()->json(['error' => 'トライアル終了日は YYYY-MM-DD 形式で入力してください'], 400);
            }
        }

        return null;
    }

    /**
     * YYYY-MM-DD 形式で、かつ実在する日付かを検証する。
     */
    private function isValidYmdDate(string $value): bool
    {
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return false;
        }

        $dt = \DateTimeImmutable::createFromFormat('Y-m-d', $value);
        if ($dt === false) {
            return false;
        }

        // PHP 8.2+ では getLastErrors() はエラーなしの場合 false を返すため、
        // createFromFormat が緩くパースした場合でも format() で最終確認する
        $errors = \DateTimeImmutable::getLastErrors();
        if ($errors !== false && (($errors['warning_count'] ?? 0) > 0 || ($errors['error_count'] ?? 0) > 0)) {
            return false;
        }

        return $dt->format('Y-m-d') === $value;
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
