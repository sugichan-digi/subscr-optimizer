<?php

namespace App\Services;

use App\Data\LoginInput;
use App\Data\RegisterInput;
use App\Mail\PasswordResetMail;
use App\Models\ResetTokenModel;
use App\Models\SessionModel;
use App\Models\SubscriptionModel;
use App\Models\UserModel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AuthService
{
    public function __construct(
        private readonly AppService        $app,
        private readonly UserModel         $userModel,
        private readonly SessionModel      $sessionModel,
        private readonly ResetTokenModel   $resetTokenModel,
        private readonly SubscriptionModel $subscriptionModel,
    ) {}

    /**
     * ユーザー登録とセッション発行。
     *
     * @return array{token: string, user: array}
     */
    public function register(RegisterInput $input): array
    {
        $token = null;
        $userId = null;

        try {
            DB::transaction(function () use ($input, &$token, &$userId) {
                $userId = $this->userModel->insert($input->email, $this->app->hashPassword($input->password));
                $token  = $this->app->generateToken();
                $this->sessionModel->insert($token, $userId, $this->app->sessionExpiresAt());
            });
        } catch (\Throwable $e) {
            Log::error('register 失敗', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            throw $e;
        }

        return [
            'token' => $token,
            'user'  => ['id' => $userId, 'email' => $input->email, 'is_guest' => false],
        ];
    }

    /**
     * ログイン認証とセッション発行。
     *
     * @return array{token: string, user: array}
     */
    public function login(LoginInput $input): array
    {
        $token = null;

        try {
            DB::transaction(function () use ($input, &$token) {
                $token = $this->app->generateToken();
                $user  = $this->userModel->findByEmail($input->email);
                $this->sessionModel->insert($token, $user->id, $this->app->sessionExpiresAt());
            });
        } catch (\Throwable $e) {
            Log::error('login 失敗', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            throw $e;
        }

        $user = $this->userModel->findByEmail($input->email);

        return [
            'token' => $token,
            'user'  => ['id' => $user->id, 'email' => $user->email, 'is_guest' => false],
        ];
    }

    /**
     * ゲストユーザー作成とセッション発行。
     *
     * @return array{token: string, user: array}
     */
    public function guest(): array
    {
        $token  = null;
        $userId = null;

        try {
            DB::transaction(function () use (&$token, &$userId) {
                $userId = $this->userModel->insertGuest();
                $token  = $this->app->generateToken();
                $this->sessionModel->insert($token, $userId, $this->app->sessionExpiresAt());
            });
        } catch (\Throwable $e) {
            Log::error('guest login 失敗', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            throw $e;
        }

        return [
            'token' => $token,
            'user'  => ['id' => $userId, 'email' => null, 'is_guest' => true, 'display_name' => 'ゲスト'],
        ];
    }

    /**
     * セッション削除（ログアウト）。
     */
    public function logout(string $token): void
    {
        try {
            DB::transaction(function () use ($token) {
                $this->sessionModel->deleteByToken($token);
            });
        } catch (\Throwable $e) {
            Log::error('logout 失敗', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            throw $e;
        }
    }

    /**
     * パスワードリセットメール送信。
     *
     * メール未登録の場合も同一レスポンスを返す（ユーザー列挙攻撃対策）。
     *
     * @return array{success: bool, message: string}
     */
    public function forgotPassword(string $email): array
    {
        $message = 'ご入力のメールアドレスに、パスワードリセット用のリンクを送信しました。メールをご確認ください。';

        $user = $this->userModel->findByEmail($email);

        if ($user === null) {
            // ユーザー列挙攻撃対策：未登録でも同じメッセージを返す
            return ['success' => true, 'message' => $message];
        }

        $token = null;

        try {
            DB::transaction(function () use ($user, $email, &$token) {
                $token = $this->app->generateToken(16);
                $this->resetTokenModel->upsert($token, $user->id, $email, $this->app->resetTokenExpiresAt());
            });
        } catch (\Throwable $e) {
            Log::error('forgotPassword 失敗', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            throw $e;
        }

        try {
            Mail::send(new PasswordResetMail($token, $email));
        } catch (\Throwable $e) {
            Log::error('パスワードリセットメール送信失敗', ['email' => $email, 'message' => $e->getMessage()]);
            // メール送信失敗はユーザーには隠蔽し、ログのみ記録
        }

        return ['success' => true, 'message' => $message];
    }

    /**
     * パスワードリセット実行。
     */
    public function resetPassword(string $token, string $password): void
    {
        try {
            DB::transaction(function () use ($token, $password) {
                $record = $this->resetTokenModel->findActiveByToken($token);
                $this->userModel->updatePassword($record->user_id, $this->app->hashPassword($password));
                $this->resetTokenModel->deleteByToken($token);
            });
        } catch (\Throwable $e) {
            Log::error('resetPassword 失敗', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            throw $e;
        }
    }

    /**
     * アカウントおよび全関連データの削除（退会）。
     */
    public function deleteAccount(int $userId): void
    {
        try {
            DB::transaction(function () use ($userId) {
                $this->subscriptionModel->deleteByUserId($userId);
                $this->resetTokenModel->deleteByUserId($userId);
                $this->sessionModel->deleteByUserId($userId);
                $this->userModel->delete($userId);
            });
        } catch (\Throwable $e) {
            Log::error('deleteAccount 失敗', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            throw $e;
        }
    }

    /**
     * Bearer トークンからユーザー ID を解決。
     */
    public function resolveUserId(string $token): ?int
    {
        $row = $this->sessionModel->findActiveByToken($token);

        return $row ? (int) $row->user_id : null;
    }
}
