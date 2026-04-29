<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AccessLogMiddleware
{
    /**
     * リクエスト処理後にアクセスログを記録。
     */
    public function handle(Request $request, Closure $next): Response
    {
        $start    = microtime(true);
        $response = $next($request);
        $ms       = round((microtime(true) - $start) * 1000, 2);

        Log::channel('access')->info(sprintf(
            '%s %s %d %.2fms %s',
            $request->method(),
            $request->path(),
            $response->getStatusCode(),
            $ms,
            $request->ip(),
        ));

        return $response;
    }
}
