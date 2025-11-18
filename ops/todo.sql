-- Drop tables if they exist, for easy re-running of the script
DROP TABLE IF EXISTS `todos`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
                         `id` BIGINT NOT NULL AUTO_INCREMENT,
                         `username` VARCHAR(255) NOT NULL UNIQUE,
                         `hashed_password` VARCHAR(255) NOT NULL,
                         PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` (`username`, `hashed_password`) VALUES
('test', '$2y$10$6CxF/GfVf5ReFx1trN6djOXsDmsz5n7sxjoW6eBN/2MU61.NXu1oG');

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

