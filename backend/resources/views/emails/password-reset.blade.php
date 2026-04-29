<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Sans','Noto Sans JP',sans-serif;color:#1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,0.08);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:28px 32px;">
              <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">サブスク管理人</p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">パスワードリセットのご案内</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
                パスワードリセットのリクエストを受け付けました。<br>
                以下のボタンから新しいパスワードを設定してください。
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ $resetUrl }}"
                       style="display:inline-block;padding:14px 32px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:0.2px;">
                      パスワードをリセットする
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expire notice -->
              <p style="margin:0 0 16px;font-size:13px;color:#64748b;line-height:1.6;">
                このリンクの有効期限は <strong>{{ $expiresIn }}</strong> です。<br>
                期限切れの場合は、再度パスワードリセットをお申し込みください。
              </p>

              <!-- URL fallback -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin:16px 0;">
                <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">ボタンが押せない場合はURLをコピー</p>
                <p style="margin:0;font-size:12px;color:#475569;word-break:break-all;">{{ $resetUrl }}</p>
              </div>

              <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;line-height:1.6;">
                このメールに心当たりがない場合は、無視してください。パスワードは変更されません。<br>
                このメールは サブスク管理人 が自動送信しています。
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
