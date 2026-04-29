-- SQL dump generated using DBML (dbml.dbdiagram.io)
-- Database: MySQL
-- Generated at: 2026-04-27T12:54:53.020Z

CREATE TABLE `users` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'ユーザーID',
  `email` varchar(255) COMMENT 'メールアドレス',
  `password_hash` varchar(255) COMMENT 'パスワードハッシュ',
  `is_guest` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'ゲストフラグ',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '登録日時'
);

CREATE TABLE `sessions` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'セッションID',
  `token` varchar(64) UNIQUE NOT NULL COMMENT 'Bearer トークン',
  `user_id` int NOT NULL COMMENT 'ユーザーID',
  `expires_at` datetime NOT NULL COMMENT '有効期限',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '発行日時'
);

CREATE TABLE `reset_tokens` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'リセットトークンID',
  `token` varchar(32) UNIQUE NOT NULL COMMENT 'リセットトークン',
  `user_id` int UNIQUE NOT NULL COMMENT 'ユーザーID',
  `email` varchar(255) NOT NULL COMMENT 'メールアドレス',
  `expires_at` datetime NOT NULL COMMENT '有効期限',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '発行日時'
);

CREATE TABLE `subscriptions` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'サブスクID',
  `user_id` int NOT NULL COMMENT 'ユーザーID',
  `name` varchar(100) NOT NULL COMMENT 'サービス名',
  `emoji` varchar(10) COMMENT '絵文字',
  `category` varchar(50) COMMENT 'カテゴリ',
  `amount` int NOT NULL COMMENT '金額',
  `cycle` ENUM ('monthly', 'yearly') NOT NULL DEFAULT 'monthly' COMMENT '課金サイクル',
  `next_billing_date` date NOT NULL COMMENT '次回決済日',
  `is_trial` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'トライアルフラグ',
  `trial_end_date` date COMMENT 'トライアル終了日',
  `status` ENUM ('active', 'cancelled') NOT NULL DEFAULT 'active' COMMENT 'ステータス',
  `notes` text COMMENT 'メモ',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '登録日時',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最終更新日時'
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

ALTER TABLE `users` COMMENT = 'ユーザー';

ALTER TABLE `sessions` COMMENT = 'ログインセッション';

ALTER TABLE `reset_tokens` COMMENT = 'パスワードリセットトークン';

ALTER TABLE `subscriptions` COMMENT = 'サブスクリプション';
