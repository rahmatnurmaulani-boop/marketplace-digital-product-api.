-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table marketplace_digital_product.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `buyer_id` int NOT NULL,
  `product_id` int NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `status` enum('pending','completed','failed') DEFAULT 'completed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `buyer_id` (`buyer_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table marketplace_digital_product.orders: ~0 rows (approximately)

-- Dumping structure for table marketplace_digital_product.products
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seller_id` int NOT NULL,
  `category_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `rating` decimal(3,1) NOT NULL DEFAULT '0.0',
  `thumbnail` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `download_count` int DEFAULT '0',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `seller_id` (`seller_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table marketplace_digital_product.products: ~3 rows (approximately)
INSERT INTO `products` (`id`, `seller_id`, `category_id`, `title`, `description`, `price`, `rating`, `thumbnail`, `file_path`, `download_count`, `status`, `created_at`) VALUES
	(1, 1, 1, 'UI Kit Dashboard Pro', 'Complete UI kit for admin dashboard', 150000.00, 8.7, '/assets/design-workspace.png', 'files/uikit.zip', 45, 'active', '2026-09-20 01:52:28'),
	(2, 1, 2, 'React E-Commerce Starter', 'Boilerplate template for building React store', 250000.00, 9.2, '/assets/study-workspace.png', 'files/react.zip', 120, 'active', '2026-09-20 01:52:28');

-- Dumping structure for table marketplace_digital_product.product_categories
CREATE TABLE IF NOT EXISTS `product_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table marketplace_digital_product.product_categories: ~2 rows (approximately)
INSERT INTO `product_categories` (`id`, `name`, `description`, `created_at`) VALUES
	(1, 'UI Design', 'UI/UX Kits, Wireframes, and Web Templates', '2026-09-20 01:52:28'),
	(2, 'Source Code', 'Web applications, scripts, and code snippets', '2026-09-20 01:52:28');

-- Dumping structure for table marketplace_digital_product.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','seller','buyer') DEFAULT 'buyer',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table marketplace_digital_product.users: ~2 rows (approximately)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
	(1, 'John Designer', 'john@example.com', 'password123', 'seller', '2026-09-20 01:52:28'),
	(2, 'Jane Buyer', 'jane@example.com', 'password123', 'buyer', '2026-09-20 01:52:28');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
