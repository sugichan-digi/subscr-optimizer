<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

define('DATA_DIR',          __DIR__ . '/data');
define('USERS_FILE',        DATA_DIR . '/users.json');
define('SESSIONS_FILE',     DATA_DIR . '/sessions.json');
define('RESET_TOKENS_FILE', DATA_DIR . '/reset_tokens.json');

// ===== JSON Helpers =====

function jsonOk(mixed $data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function jsonError(string $message, int $status = 400): never
{
    http_response_code($status);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function requestBody(): array
{
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

function readJson(string $file): array
{
    if (!file_exists($file)) return [];
    return json_decode(file_get_contents($file), true) ?? [];
}

function writeJson(string $file, array $data): void
{
    file_put_contents($file, json_encode(array_values($data), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

function nextId(array $items): int
{
    return empty($items) ? 1 : max(array_column($items, 'id')) + 1;
}

// ===== Auth Helpers =====

function getBearerToken(): ?string
{
    // PHP built-in server / Apache / CGI でヘッダー取得を統一
    $auth = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? (function_exists('apache_request_headers') ? (apache_request_headers()['Authorization'] ?? '') : '');

    if (preg_match('/^Bearer\s+(\S+)$/i', $auth, $m)) {
        return $m[1];
    }
    return null;
}

function requireAuth(): int
{
    $token = getBearerToken();
    if (!$token) jsonError('認証が必要です', 401);

    $sessions = readJson(SESSIONS_FILE);
    foreach ($sessions as $s) {
        if ($s['token'] === $token && strtotime($s['expires_at']) > time()) {
            return (int)$s['user_id'];
        }
    }
    jsonError('セッションが無効または期限切れです', 401);
}

function generateToken(int $bytes = 32): string
{
    return bin2hex(random_bytes($bytes));
}

function createSession(int $userId): string
{
    $token    = generateToken(32);
    $sessions = readJson(SESSIONS_FILE);
    $sessions = array_filter($sessions, fn($s) => strtotime($s['expires_at']) > time());
    $sessions[] = [
        'token'      => $token,
        'user_id'    => $userId,
        'expires_at' => date('c', strtotime('+30 days')),
        'created_at' => date('c'),
    ];
    writeJson(SESSIONS_FILE, $sessions);
    return $token;
}

// ===== Routing =====

$pathInfo = $_SERVER['PATH_INFO'] ?? '/';
$parts    = array_values(array_filter(explode('/', trim($pathInfo, '/'))));
$seg0     = $parts[0] ?? '';
$seg1     = $parts[1] ?? '';
$id       = isset($parts[1]) && is_numeric($parts[1]) ? (int)$parts[1] : null;
$method   = $_SERVER['REQUEST_METHOD'];

match ($seg0) {
    'auth'          => handleAuth($seg1, $method),
    'subscriptions' => handleSubscriptions($method, $id, requireAuth()),
    'presets'       => handlePresets($method),
    'health'        => jsonOk(['status' => 'ok', 'timestamp' => date('c')]),
    default         => jsonError('Not Found', 404),
};

// ===== /auth =====

function handleAuth(string $action, string $method): never
{
    if ($method !== 'POST' && !($action === 'account' && $method === 'DELETE')) {
        jsonError('Method Not Allowed', 405);
    }

    match ($action) {
        'register'        => authRegister(),
        'login'           => authLogin(),
        'guest'           => authGuest(),
        'logout'          => authLogout(),
        'forgot-password' => authForgotPassword(),
        'reset-password'  => authResetPassword(),
        'account'         => authDeleteAccount(),
        default           => jsonError('Not Found', 404),
    };
}

function authRegister(): never
{
    $body     = requestBody();
    $email    = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';

    if (!$email)                                            jsonError('メールアドレスを入力してください');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL))         jsonError('メールアドレスの形式が正しくありません');
    if (mb_strlen($password) < 8)                           jsonError('パスワードは8文字以上で入力してください');

    $users = readJson(USERS_FILE);
    foreach ($users as $u) {
        if (!($u['is_guest'] ?? false) && strtolower($u['email'] ?? '') === strtolower($email)) {
            jsonError('このメールアドレスはすでに登録されています', 409);
        }
    }

    $id      = nextId($users);
    $users[] = [
        'id'            => $id,
        'email'         => $email,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'is_guest'      => false,
        'created_at'    => date('c'),
    ];
    writeJson(USERS_FILE, $users);

    $token = createSession($id);
    jsonOk(['token' => $token, 'user' => ['id' => $id, 'email' => $email, 'is_guest' => false]], 201);
}

function authLogin(): never
{
    $body     = requestBody();
    $email    = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';

    if (!$email)    jsonError('メールアドレスを入力してください');
    if (!$password) jsonError('パスワードを入力してください');

    $users = readJson(USERS_FILE);
    $found = null;
    foreach ($users as $u) {
        if (!($u['is_guest'] ?? false) && strtolower($u['email'] ?? '') === strtolower($email)) {
            $found = $u;
            break;
        }
    }

    if (!$found || !password_verify($password, $found['password_hash'])) {
        jsonError('メールアドレスまたはパスワードが正しくありません', 401);
    }

    $token = createSession($found['id']);
    jsonOk(['token' => $token, 'user' => ['id' => $found['id'], 'email' => $found['email'], 'is_guest' => false]]);
}

function authGuest(): never
{
    $users   = readJson(USERS_FILE);
    $id      = nextId($users);
    $users[] = ['id' => $id, 'email' => null, 'password_hash' => null, 'is_guest' => true, 'created_at' => date('c')];
    writeJson(USERS_FILE, $users);

    $token = createSession($id);
    jsonOk(
        ['token' => $token, 'user' => ['id' => $id, 'email' => null, 'is_guest' => true, 'display_name' => 'ゲスト']],
        201
    );
}

function authLogout(): never
{
    $token    = getBearerToken();
    $sessions = readJson(SESSIONS_FILE);
    $sessions = array_filter($sessions, fn($s) => $s['token'] !== $token);
    writeJson(SESSIONS_FILE, $sessions);
    jsonOk(['success' => true]);
}

function authForgotPassword(): never
{
    $body  = requestBody();
    $email = trim($body['email'] ?? '');
    if (!$email) jsonError('メールアドレスを入力してください');

    $users = readJson(USERS_FILE);
    $found = null;
    foreach ($users as $u) {
        if (!($u['is_guest'] ?? false) && strtolower($u['email'] ?? '') === strtolower($email)) {
            $found = $u;
            break;
        }
    }

    // メール未登録でも同じレスポンスを返す（ユーザー列挙攻撃対策）
    if (!$found) {
        jsonOk(['success' => true, 'message' => 'メールアドレスが登録されている場合、リセットトークンを発行しました', 'dev_reset_token' => null]);
    }

    $token       = generateToken(16);
    $resetTokens = readJson(RESET_TOKENS_FILE);
    $resetTokens = array_filter($resetTokens, fn($t) => $t['user_id'] !== $found['id']); // 旧トークン削除
    $resetTokens[] = [
        'token'      => $token,
        'user_id'    => $found['id'],
        'email'      => $email,
        'expires_at' => date('c', strtotime('+1 hour')),
        'created_at' => date('c'),
    ];
    writeJson(RESET_TOKENS_FILE, $resetTokens);

    // 実運用ではここでメール送信。モックとして dev_reset_token をレスポンスに含める。
    jsonOk([
        'success'         => true,
        'message'         => 'パスワードリセット用トークンを発行しました',
        'dev_reset_token' => $token,
        'expires_in'      => '1時間',
    ]);
}

function authResetPassword(): never
{
    $body     = requestBody();
    $token    = trim($body['token'] ?? '');
    $password = $body['password'] ?? '';

    if (!$token)              jsonError('リセットトークンを入力してください');
    if (mb_strlen($password) < 8) jsonError('パスワードは8文字以上で入力してください');

    $resetTokens = readJson(RESET_TOKENS_FILE);
    $found       = null;
    foreach ($resetTokens as $t) {
        if ($t['token'] === $token && strtotime($t['expires_at']) > time()) {
            $found = $t;
            break;
        }
    }
    if (!$found) jsonError('トークンが無効または期限切れです', 400);

    $users = readJson(USERS_FILE);
    foreach ($users as &$u) {
        if ($u['id'] === $found['user_id']) {
            $u['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
            break;
        }
    }
    unset($u);
    writeJson(USERS_FILE, $users);

    $resetTokens = array_filter($resetTokens, fn($t) => $t['token'] !== $token);
    writeJson(RESET_TOKENS_FILE, $resetTokens);

    jsonOk(['success' => true, 'message' => 'パスワードをリセットしました']);
}

function authDeleteAccount(): never
{
    $userId  = requireAuth();
    $body    = requestBody();
    $users   = readJson(USERS_FILE);
    $current = null;
    foreach ($users as $u) {
        if ($u['id'] === $userId) { $current = $u; break; }
    }
    if (!$current) jsonError('ユーザーが見つかりません', 404);

    // ゲスト以外はパスワード確認
    if (!($current['is_guest'] ?? false)) {
        $password = $body['password'] ?? '';
        if (!$password) jsonError('パスワードを入力してください');
        if (!password_verify($password, $current['password_hash'])) jsonError('パスワードが正しくありません', 401);
    }

    // ユーザー削除
    writeJson(USERS_FILE, array_filter($users, fn($u) => $u['id'] !== $userId));

    // セッション削除
    $sessions = readJson(SESSIONS_FILE);
    writeJson(SESSIONS_FILE, array_filter($sessions, fn($s) => $s['user_id'] !== $userId));

    // リセットトークン削除
    $rt = readJson(RESET_TOKENS_FILE);
    writeJson(RESET_TOKENS_FILE, array_filter($rt, fn($t) => $t['user_id'] !== $userId));

    // サブスクデータ削除
    $subsFile = DATA_DIR . "/subscriptions_{$userId}.json";
    if (file_exists($subsFile)) unlink($subsFile);

    jsonOk(['success' => true, 'message' => '退会しました']);
}

// ===== /subscriptions =====

function subsFile(int $userId): string
{
    return DATA_DIR . "/subscriptions_{$userId}.json";
}

function handleSubscriptions(string $method, ?int $id, int $userId): never
{
    $file = subsFile($userId);

    switch ($method) {
        case 'GET':
            $items = readJson($file);
            jsonOk(['data' => array_values($items), 'count' => count($items)]);

        case 'POST':
            $body = requestBody();
            $err  = validateSubscription($body);
            if ($err) jsonError($err);
            $items      = readJson($file);
            $body['id'] = nextId($items);
            $items[]    = $body;
            writeJson($file, $items);
            jsonOk(['data' => $body], 201);

        case 'PUT':
            if ($id === null) jsonError('IDが指定されていません');
            $body  = requestBody();
            $err   = validateSubscription($body);
            if ($err) jsonError($err);
            $items = readJson($file);
            $found = false;
            foreach ($items as &$item) {
                if ((int)$item['id'] === $id) { $body['id'] = $id; $item = $body; $found = true; break; }
            }
            unset($item);
            if (!$found) jsonError('指定されたIDが見つかりません', 404);
            writeJson($file, $items);
            jsonOk(['data' => $body]);

        case 'DELETE':
            if ($id === null) jsonError('IDが指定されていません');
            $items  = readJson($file);
            $before = count($items);
            $items  = array_filter($items, fn($s) => (int)$s['id'] !== $id);
            if (count($items) === $before) jsonError('指定されたIDが見つかりません', 404);
            writeJson($file, $items);
            jsonOk(['success' => true, 'id' => $id]);

        default:
            jsonError('Method Not Allowed', 405);
    }
}

function validateSubscription(array $body): string
{
    if (empty($body['name']))                                        return 'サービス名は必須です';
    if (!isset($body['amount']) || (int)$body['amount'] < 1)        return '金額は1以上の数値を入力してください';
    if (empty($body['nextBillingDate']))                             return '次回決済日は必須です';
    if (!in_array($body['cycle'] ?? '', ['monthly', 'yearly'], true)) return 'cycleはmonthlyまたはyearlyを指定してください';
    return '';
}

// ===== /presets =====

function handlePresets(string $method): never
{
    if ($method !== 'GET') jsonError('Method Not Allowed', 405);
    jsonOk(['data' => [
        ['name' => 'Netflix',               'emoji' => '🎬', 'category' => '動画',          'amount' => 1490],
        ['name' => 'Amazon Prime Video',    'emoji' => '📦', 'category' => '動画',          'amount' => 600 ],
        ['name' => 'Disney+',               'emoji' => '🏰', 'category' => '動画',          'amount' => 990 ],
        ['name' => 'YouTube Premium',       'emoji' => '▶️', 'category' => '動画',          'amount' => 1180],
        ['name' => 'Hulu',                  'emoji' => '📺', 'category' => '動画',          'amount' => 1026],
        ['name' => 'U-NEXT',                'emoji' => '🎥', 'category' => '動画',          'amount' => 2189],
        ['name' => 'Spotify',               'emoji' => '🎵', 'category' => '音楽',          'amount' => 980 ],
        ['name' => 'Apple Music',           'emoji' => '🎶', 'category' => '音楽',          'amount' => 1080],
        ['name' => 'Amazon Music',          'emoji' => '🎼', 'category' => '音楽',          'amount' => 880 ],
        ['name' => 'ChatGPT Plus',          'emoji' => '🤖', 'category' => 'AI',            'amount' => 3000],
        ['name' => 'Claude Pro',            'emoji' => '💡', 'category' => 'AI',            'amount' => 3000],
        ['name' => 'Gemini Advanced',       'emoji' => '✨', 'category' => 'AI',            'amount' => 2900],
        ['name' => 'Adobe Creative Cloud',  'emoji' => '🎨', 'category' => 'クリエイティブ', 'amount' => 6480],
        ['name' => 'Figma',                'emoji' => '🖌️', 'category' => 'デザイン',      'amount' => 1800],
        ['name' => 'Canva Pro',             'emoji' => '🖼️', 'category' => 'デザイン',      'amount' => 1500],
        ['name' => 'Microsoft 365',         'emoji' => '💼', 'category' => '仕事',          'amount' => 1284],
        ['name' => 'Notion',                'emoji' => '📝', 'category' => '仕事',          'amount' => 1600],
        ['name' => 'Slack',                 'emoji' => '💬', 'category' => '仕事',          'amount' => 925 ],
        ['name' => 'GitHub',                'emoji' => '💻', 'category' => '開発',          'amount' => 1100],
        ['name' => 'Vercel Pro',            'emoji' => '▲',  'category' => '開発',          'amount' => 2500],
        ['name' => 'Dropbox',               'emoji' => '☁️', 'category' => 'ストレージ',    'amount' => 1200],
        ['name' => 'Nintendo Switch Online','emoji' => '🎮', 'category' => 'ゲーム',        'amount' => 306 ],
        ['name' => 'PlayStation Plus',      'emoji' => '🕹️', 'category' => 'ゲーム',        'amount' => 850 ],
    ]]);
}
