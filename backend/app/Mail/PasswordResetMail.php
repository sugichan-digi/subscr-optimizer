<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        private readonly string $resetToken,
        private readonly string $email,
    ) {}

    /**
     * メールを構築する。
     */
    public function build(): static
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', config('app.url')), '/');
        $resetUrl    = "{$frontendUrl}/auth.html?token={$this->resetToken}";

        return $this
            ->to($this->email)
            ->subject('【サブスク管理人】パスワードのリセット')
            ->view('emails.password-reset')
            ->with([
                'resetUrl'   => $resetUrl,
                'expiresIn'  => '1時間',
            ]);
    }
}
