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
              <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">SubsOptimizer</p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">サブスクリプション更新のお知らせ</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
                <strong>{{ $subscription->name }}</strong> の更新日が
                <strong style="color:#6366f1;">{{ $daysUntil }}日後（{{ $subscription->next_billing_date }}）</strong>
                に迫っています。
              </p>

              <!-- Detail table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
                <tr style="background:#f8fafc;">
                  <th style="text-align:left;padding:10px 16px;font-size:12px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">項目</th>
                  <th style="text-align:left;padding:10px 16px;font-size:12px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">内容</th>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:14px;border-bottom:1px solid #f1f5f9;color:#64748b;">サービス名</td>
                  <td style="padding:12px 16px;font-size:14px;border-bottom:1px solid #f1f5f9;font-weight:600;">{{ $subscription->name }}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:14px;border-bottom:1px solid #f1f5f9;color:#64748b;">金額</td>
                  <td style="padding:12px 16px;font-size:14px;border-bottom:1px solid #f1f5f9;font-weight:600;">
                    ¥{{ number_format($subscription->amount) }}
                    {{ $subscription->cycle === 'yearly' ? '/ 年' : '/ 月' }}
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:14px;color:#64748b;">更新日</td>
                  <td style="padding:12px 16px;font-size:14px;font-weight:600;color:#6366f1;">{{ $subscription->next_billing_date }}</td>
                </tr>
              </table>

              <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;">
                このメールは サブスク管理人 が自動送信しています。<br>
                更新の停止・解約はアプリからご確認ください。
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
