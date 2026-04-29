<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RenewalReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        private readonly object $subscription,
        private readonly int    $daysUntil,
    ) {}

    /**
     * メールを構築する。
     */
    public function build(): static
    {
        return $this
            ->subject("【SubsOptimizer】{$this->subscription->name} の更新が{$this->daysUntil}日後です")
            ->view('emails.renewal-reminder')
            ->with([
                'subscription' => $this->subscription,
                'daysUntil'    => $this->daysUntil,
            ]);
    }
}
