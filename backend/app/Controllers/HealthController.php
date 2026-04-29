<?php

namespace App\Controllers;

use Illuminate\Http\JsonResponse;

class HealthController
{
    /**
     * ヘルスチェック。
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'status'    => 'ok',
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
