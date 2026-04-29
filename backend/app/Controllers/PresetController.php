<?php

namespace App\Controllers;

use Illuminate\Http\JsonResponse;

class PresetController
{
    private const PRESETS = [
        ['name' => 'Netflix',                'emoji' => '🎬', 'category' => '動画',           'amount' => 1490],
        ['name' => 'Amazon Prime Video',     'emoji' => '📦', 'category' => '動画',           'amount' => 600 ],
        ['name' => 'Disney+',                'emoji' => '🏰', 'category' => '動画',           'amount' => 990 ],
        ['name' => 'YouTube Premium',        'emoji' => '▶️', 'category' => '動画',           'amount' => 1180],
        ['name' => 'Hulu',                   'emoji' => '📺', 'category' => '動画',           'amount' => 1026],
        ['name' => 'U-NEXT',                 'emoji' => '🎥', 'category' => '動画',           'amount' => 2189],
        ['name' => 'Spotify',                'emoji' => '🎵', 'category' => '音楽',           'amount' => 980 ],
        ['name' => 'Apple Music',            'emoji' => '🎶', 'category' => '音楽',           'amount' => 1080],
        ['name' => 'Amazon Music',           'emoji' => '🎼', 'category' => '音楽',           'amount' => 880 ],
        ['name' => 'ChatGPT Plus',           'emoji' => '🤖', 'category' => 'AI',             'amount' => 3000],
        ['name' => 'Claude Pro',             'emoji' => '💡', 'category' => 'AI',             'amount' => 3000],
        ['name' => 'Gemini Advanced',        'emoji' => '✨', 'category' => 'AI',             'amount' => 2900],
        ['name' => 'Adobe Creative Cloud',   'emoji' => '🎨', 'category' => 'クリエイティブ', 'amount' => 6480],
        ['name' => 'Figma',                  'emoji' => '🖌️', 'category' => 'デザイン',       'amount' => 1800],
        ['name' => 'Canva Pro',              'emoji' => '🖼️', 'category' => 'デザイン',       'amount' => 1500],
        ['name' => 'Microsoft 365',          'emoji' => '💼', 'category' => '仕事',           'amount' => 1284],
        ['name' => 'Notion',                 'emoji' => '📝', 'category' => '仕事',           'amount' => 1600],
        ['name' => 'Slack',                  'emoji' => '💬', 'category' => '仕事',           'amount' => 925 ],
        ['name' => 'GitHub',                 'emoji' => '💻', 'category' => '開発',           'amount' => 1100],
        ['name' => 'Vercel Pro',             'emoji' => '▲',  'category' => '開発',           'amount' => 2500],
        ['name' => 'Dropbox',                'emoji' => '☁️', 'category' => 'ストレージ',     'amount' => 1200],
        ['name' => 'Nintendo Switch Online', 'emoji' => '🎮', 'category' => 'ゲーム',         'amount' => 306 ],
        ['name' => 'PlayStation Plus',       'emoji' => '🕹️', 'category' => 'ゲーム',         'amount' => 850 ],
    ];

    /**
     * プリセットサービス一覧取得。
     */
    public function index(): JsonResponse
    {
        return response()->json(['data' => self::PRESETS]);
    }
}
