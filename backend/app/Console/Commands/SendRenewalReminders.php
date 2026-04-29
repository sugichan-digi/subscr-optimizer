<?php

namespace App\Console\Commands;

use App\Mail\RenewalReminderMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendRenewalReminders extends Command
{
    protected $signature   = 'subscriptions:send-reminders {--days=3 : 何日前に通知するか}';
    protected $description = 'サブスクリプション更新前のリマインドメールを送信する';

    /**
     * リマインドメールを送信する。
     */
    public function handle(): int
    {
        $days       = (int) $this->option('days');
        $targetDate = now()->addDays($days)->format('Y-m-d');

        $rows = DB::select(
            'SELECT s.id, s.name, s.amount, s.cycle, s.next_billing_date,
                    u.email
             FROM subscriptions s
             INNER JOIN users u ON u.id = s.user_id
             WHERE s.status = ?
               AND s.next_billing_date = ?
               AND u.email IS NOT NULL
               AND u.is_guest = 0',
            ['active', $targetDate]
        );

        if (empty($rows)) {
            $this->info("対象のサブスクリプションはありませんでした（{$targetDate}）");
            return self::SUCCESS;
        }

        $sent = 0;
        foreach ($rows as $row) {
            try {
                Mail::to($row->email)->send(new RenewalReminderMail($row, $days));
                $sent++;
            } catch (\Throwable $e) {
                Log::error('リマインドメール送信失敗', [
                    'subscription_id' => $row->id,
                    'email'           => $row->email,
                    'message'         => $e->getMessage(),
                ]);
            }
        }

        $this->info("リマインドメールを {$sent} 件送信しました（{$targetDate}）");

        return self::SUCCESS;
    }
}
