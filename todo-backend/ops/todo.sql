-- Drop tables if they exist, for easy re-running of the script
DROP TABLE IF EXISTS `todos`;
DROP TABLE IF EXISTS `users`;

-- Create the 'users' table first
-- This table will store user login information.
CREATE TABLE `users` (
                         `id` BIGINT NOT NULL AUTO_INCREMENT,
                         `username` VARCHAR(255) NOT NULL UNIQUE,
                         `hashed_password` VARCHAR(255) NOT NULL,
                         PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create the 'todos' table
-- This maps to your 'TodoPO' persistent object.
-- Column names use snake_case to match the mybatis-plus configuration.
CREATE TABLE `todos` (
                         `id` BIGINT NOT NULL AUTO_INCREMENT,
                         `user_id` BIGINT NOT NULL,
                         `title` VARCHAR(255) NOT NULL,
                         `description` TEXT NULL,
                         `completed` BOOLEAN NOT NULL DEFAULT FALSE,
                         `category` VARCHAR(100) DEFAULT 'inbox',
                         `due_at` TIMESTAMP NULL,
                         `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         `deleted` BOOLEAN NOT NULL DEFAULT FALSE,

                         PRIMARY KEY (`id`),

                         FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,

                         INDEX `idx_user_id` (`user_id`),

                         INDEX `idx_user_updated` (`user_id`, `updated_at`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;