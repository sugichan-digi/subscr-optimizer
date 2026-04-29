<?php

use App\Controllers\AuthController;
use App\Controllers\HealthController;
use App\Controllers\PresetController;
use App\Controllers\SubscriptionController;
use Illuminate\Support\Facades\Route;

Route::get('/health', [HealthController::class, 'index']);

Route::prefix('auth')->group(function () {
    Route::post('/register',        [AuthController::class, 'register']);
    Route::post('/login',           [AuthController::class, 'login']);
    Route::post('/guest',           [AuthController::class, 'guest']);
    Route::post('/logout',          [AuthController::class, 'logout']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password',  [AuthController::class, 'resetPassword']);
    Route::delete('/account',       [AuthController::class, 'deleteAccount']);
});

Route::prefix('subscriptions')->group(function () {
    Route::get('/',     [SubscriptionController::class, 'index']);
    Route::post('/',    [SubscriptionController::class, 'store']);
    Route::put('/{id}', [SubscriptionController::class, 'update']);
    Route::delete('/{id}', [SubscriptionController::class, 'destroy']);
});

Route::get('/presets', [PresetController::class, 'index']);
