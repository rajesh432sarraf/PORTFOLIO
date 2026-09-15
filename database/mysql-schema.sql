-- ==============================================================================
-- RAJESH SARRAF DEVELOPER PORTFOLIO - MYSQL RELATIONAL SCHEMA
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `portfolio_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `portfolio_db`;

-- 1. TECHNOLOGIES
CREATE TABLE IF NOT EXISTS `technologies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(80) NOT NULL UNIQUE,
  `slug` VARCHAR(80) NOT NULL UNIQUE,
  `category` ENUM('language', 'frontend', 'backend', 'database', 'ai', 'tool') DEFAULT 'tool',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. PROJECTS
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `number` VARCHAR(10) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `year` VARCHAR(10) NOT NULL,
  `description` TEXT NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `github_url` VARCHAR(255) DEFAULT NULL,
  `live_url` VARCHAR(255) DEFAULT NULL,
  `featured` BOOLEAN DEFAULT TRUE,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. PROJECT TECHNOLOGIES (NORMALIZED RELATIONSHIP)
CREATE TABLE IF NOT EXISTS `project_technologies` (
  `project_id` INT NOT NULL,
  `technology_id` INT NOT NULL,
  PRIMARY KEY (`project_id`, `technology_id`),
  CONSTRAINT `fk_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_technology` FOREIGN KEY (`technology_id`) REFERENCES `technologies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. EXPERIENCE
CREATE TABLE IF NOT EXISTS `experience` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `role` VARCHAR(150) NOT NULL,
  `organization` VARCHAR(150) NOT NULL,
  `period` VARCHAR(80) NOT NULL,
  `location` VARCHAR(100) DEFAULT 'Remote',
  `description` TEXT NOT NULL,
  `is_current` BOOLEAN DEFAULT FALSE,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS `achievements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `number` VARCHAR(20) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `event` VARCHAR(150) NOT NULL,
  `project` VARCHAR(150) NOT NULL,
  `year` VARCHAR(10) NOT NULL,
  `description` TEXT NOT NULL,
  `highlight` VARCHAR(100) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. CERTIFICATIONS
CREATE TABLE IF NOT EXISTS `certifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(180) NOT NULL,
  `issuer` VARCHAR(150) NOT NULL,
  `year` VARCHAR(10) NOT NULL,
  `credential_url` VARCHAR(255) DEFAULT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `badge` VARCHAR(80) DEFAULT 'Verified',
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEED DATA
INSERT IGNORE INTO `technologies` (`name`, `slug`, `category`) VALUES
('React', 'react', 'frontend'),
('JavaScript', 'javascript', 'language'),
('Python', 'python', 'language'),
('FastAPI', 'fastapi', 'backend'),
('Node.js', 'nodejs', 'backend'),
('MongoDB', 'mongodb', 'database'),
('Tailwind CSS', 'tailwind-css', 'frontend'),
('AI Models', 'ai-models', 'ai');
