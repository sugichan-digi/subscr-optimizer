<?php

namespace App\Controllers;

use App\Data\LoginInput;
use App\Data\RegisterInput;
use App\Models\ResetTokenModel;
use App\Models\UserModel;
use App\Services\AppService;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController
{
    public function __construct(
        private readonly AppService      $app,
        private readonly AuthService     $authService,
        private readonly UserModel       $userModel,
        private readonly ResetTokenModel $resetTokenModel,
    ) {}

    /**
     * 新規ユーザー登録。
     */
    public function register(Request $request): JsonResponse
    {
        $email    = trim($request->input('email', ''));
        $password = $request->input('password', '');

        if (!$email) {
            return $this->error('メールアドレスを入力してください');
        }
        if (!$this->app->isValidEmail($email)) {
            return $this->error('メールアドレスの形式が正しくありません');
        }
        if (!$this->app->isValidPassword($password)) {
            return $this->error('パスワードは8文字以上で入力してください');
        }
        if ($this->userModel->existsByEmail($email)) {
            return $this->error('このメールアドレスはすでに登録されています', 409);
        }

        $result = $this->authService->register(new RegisterInput($email, $password));

        return response()->json($result, 201);
    }

    /**
     * ログイン。
     */
    public function login(Request $request): JsonResponse
    {
        $email    = trim($request->input('email', ''));
        $password = $request->input('password', '');

        if (!$email) {
            return $this->error('メールアドレスを入力してください');
        }
        if (!$password) {
            return $this->error('パスワードを入力してください');
        }

        $user = $this->userModel->findByEmail($email);

        if ($user === null || !$this->app->verifyPassword($password, $user->passwordHash)) {
            return $this->error('メールアドレスまたはパスワードが正しくありません', 401);
        }

        $result = $this->authService->login(new LoginInput($email, $password));

        return response()->json($result);
    }

    /**
     * ゲストログイン。
     */
    public function guest(): JsonResponse
    {
        $result = $this->authService->guest();

        return response()->json($result, 201);
    }

    /**
     * ログアウト（セッション削除）。
     */
    public function logout(): JsonResponse
    {
        $token = $this->app->getBearerToken();

        if ($token) {
            $this->authService->logout($token);
        }

        return response()->json(['success' => true]);
    }

    /**
     * パスワードリセットトークン発行。
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $email = trim($request->input('email', ''));

        if (!$email) {
            return $this->error('メールアドレスを入力してください');
        }

        $result = $this->authService->forgotPassword($email);

        return response()->json($result);
    }

    /**
     * パスワードリセット実行。
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $token    = trim($request->input('token', ''));
        $password = $request->input('password', '');

        if (!$token) {
            return $this->error('リセットトークンを入力してください');
        }
        if (!$this->app->isValidPassword($password)) {
            return $this->error('パスワードは8文字以上で入力してください');
        }

        $record = $this->resetTokenModel->findActiveByToken($token);

        if ($record === null) {
            return $this->error('トークンが無効または期限切れです');
        }

        $this->authService->resetPassword($token, $password);

        return response()->json(['success' => true, 'message' => 'パスワードをリセットしました']);
    }

    /**
     * 退会（アカウントおよび全データ削除）。
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        $token = $this->app->getBearerToken();

        if (!$token) {
            return $this->error('認証が必要です', 401);
        }

        $userId = $this->authService->resolveUserId($token);

        if ($userId === null) {
            return $this->error('セッションが無効または期限切れです', 401);
        }

        $user = $this->userModel->findById($userId);

        if ($user === null) {
            return $this->error('ユーザーが見つかりません', 404);
        }

        if (!$user->isGuest) {
            $password = $request->input('password', '');
            if (!$password) {
                return $this->error('パスワードを入力してください');
            }
            if (!$this->app->verifyPassword($password, $user->passwordHash)) {
                return $this->error('パスワードが正しくありません', 401);
            }
        }

        $this->authService->deleteAccount($userId);

        return response()->json(['success' => true, 'message' => '退会しました']);
    }

    /**
     * エラーレスポンス生成。
     */
    private function error(string $message, int $status = 400): JsonResponse
    {
        return response()->json(['error' => $message], $status);
    }
}
