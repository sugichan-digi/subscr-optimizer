<?php

use App\Console\Commands\SendRenewalReminders;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// 毎朝8時に更新3日前のサブスクに対してリマインドメールを送信
Schedule::command(SendRenewalReminders::class, ['--days=3'])->dailyAt('08:00');
