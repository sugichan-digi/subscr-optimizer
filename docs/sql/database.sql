-- SQL dump generated using DBML (dbml.dbdiagram.io)
-- Database: MySQL
-- Generated at: 2026-04-27T12:54:53.020Z

CREATE TABLE `users` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'ユーザーID（自動採番）',
  `email` varchar(255) COMMENT 'メールアドレス。ゲストユーザーは NULL。',
  `password_hash` varchar(255) COMMENT 'bcrypt ハッシュ値。ゲストユーザーは NULL。',
  `is_guest` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'ゲストフラグ（1 = ゲスト）',
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP) COMMENT '登録日時'
);

CREATE TABLE `sessions` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'セッションID（自動採番）',
  `token` varchar(64) UNIQUE NOT NULL COMMENT 'Bearer トークン（random_bytes(32) の hex 文字列）',
  `user_id` int NOT NULL COMMENT '紐づくユーザーID（FK → users.id）',
  `expires_at` datetime NOT NULL COMMENT 'トークンの有効期限（発行から 30 日後）',
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP) COMMENT '発行日時'
);

CREATE TABLE `reset_tokens` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'リセットトークンID（自動採番）',
  `token` varchar(32) UNIQUE NOT NULL COMMENT 'リセットトークン（random_bytes(16) の hex 文字列）',
  `user_id` int UNIQUE NOT NULL COMMENT '紐づくユーザーID（FK → users.id）1ユーザー1トークン',
  `email` varchar(255) NOT NULL COMMENT 'リセット対象メールアドレス（申請時点のスナップショット）',
  `expires_at` datetime NOT NULL COMMENT 'トークンの有効期限（発行から 1 時間後）',
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP) COMMENT '発行日時'
);

CREATE TABLE `subscriptions` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'サブスクID（自動採番）',
  `user_id` int NOT NULL COMMENT '所有ユーザーID（FK → users.id）',
  `name` varchar(100) NOT NULL COMMENT 'サービス名（例: Netflix）',
  `emoji` varchar(10) COMMENT 'アイコン絵文字（例: 🎬）utf8mb4 必須',
  `category` varchar(50) COMMENT 'カテゴリ（例: 動画、音楽、AI）',
  `amount` int NOT NULL COMMENT '金額（円）。CHECK 制約で 1 以上を保証。',
  `cycle` ENUM ('monthly', 'yearly') NOT NULL DEFAULT 'monthly' COMMENT '課金サイクル',
  `next_billing_date` date NOT NULL COMMENT '次回決済日（YYYY-MM-DD）',
  `is_trial` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'トライアル中フラグ（1 = トライアル中）',
  `trial_end_date` date COMMENT 'トライアル終了日。is_trial = 1 の場合に使用。',
  `status` ENUM ('active', 'cancelled') NOT NULL DEFAULT 'active' COMMENT 'ステータス',
  `notes` text COMMENT '任意のメモ',
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP) COMMENT '登録日時',
  `updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) COMMENT '最終更新日時'
);

CREATE UNIQUE INDEX `uq_users_email` ON `users` (`email`);

CREATE INDEX `idx_users_is_guest` ON `users` (`is_guest`);

CREATE UNIQUE INDEX `uq_sessions_token` ON `sessions` (`token`);

CREATE INDEX `idx_sessions_user_id` ON `sessions` (`user_id`);

CREATE INDEX `idx_sessions_expires_at` ON `sessions` (`expires_at`);

CREATE UNIQUE INDEX `uq_reset_tokens_token` ON `reset_tokens` (`token`);

CREATE UNIQUE INDEX `uq_reset_tokens_user_id` ON `reset_tokens` (`user_id`);

CREATE INDEX `idx_reset_tokens_expires_at` ON `reset_tokens` (`expires_at`);

CREATE INDEX `idx_subscriptions_user_id` ON `subscriptions` (`user_id`);

CREATE INDEX `idx_subscriptions_user_status` ON `subscriptions` (`user_id`, `status`);

CREATE INDEX `idx_subscriptions_next_billing_date` ON `subscriptions` (`next_billing_date`);

CREATE INDEX `idx_subscriptions_trial` ON `subscriptions` (`is_trial`, `trial_end_date`);

ALTER TABLE `users` COMMENT = 'ユーザー。ゲストユーザーは email・password_hash が NULL、is_guest = 1 となる。';

ALTER TABLE `sessions` COMMENT = 'ログインセッション。有効期限は 30 日間。期限切れレコードは定期バッチで削除推奨。';

ALTER TABLE `reset_tokens` COMMENT = 'パスワードリセットトークン。有効期限は 1 時間。user_id に UNIQUE 制約で 1 ユーザー 1 トークンを保証。';

ALTER TABLE `subscriptions` COMMENT = 'サブスクリプション。emoji カラムは 4 バイト文字を含むため utf8mb4 が必須。';
