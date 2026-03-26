CREATE DATABASE  IF NOT EXISTS `inventory` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `inventory`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: inventory
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `productId` int NOT NULL AUTO_INCREMENT,
  `sku` int NOT NULL,
  `productName` varchar(150) NOT NULL,
  `productAdded` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sellingPrice` decimal(10,2) DEFAULT '0.00',
  `purchasePrice` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`productId`),
  UNIQUE KEY `productId_UNIQUE` (`productId`),
  UNIQUE KEY `sku_UNIQUE` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='			';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sale_items`
--

DROP TABLE IF EXISTS `sale_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `saleId` int NOT NULL,
  `sku` int DEFAULT NULL,
  `unitPrice` decimal(10,2) NOT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `saleId` (`saleId`),
  CONSTRAINT `fk_sale_items_sale` FOREIGN KEY (`saleId`) REFERENCES `sales` (`saleId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `saleId` int NOT NULL AUTO_INCREMENT,
  `saleTotal` decimal(12,2) DEFAULT NULL,
  `saleDate` datetime DEFAULT NULL,
  `profit` decimal(12,2) DEFAULT NULL,
  `saleItems` json DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `phoneNo` varchar(45) DEFAULT NULL,
  `saleQuantity` int DEFAULT NULL,
  `sku` int DEFAULT NULL,
  `payment` decimal(12,2) DEFAULT NULL,
  `changeBack` decimal(12,2) DEFAULT NULL,
  `grandTotal` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`saleId`),
  UNIQUE KEY `saleId_UNIQUE` (`saleId`),
  KEY `sales.sku_idx` (`sku`) /*!80000 INVISIBLE */,
  CONSTRAINT `sales.sku` FOREIGN KEY (`sku`) REFERENCES `products` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='			';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stocks`
--

DROP TABLE IF EXISTS `stocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stocks` (
  `stockId` int NOT NULL AUTO_INCREMENT,
  `sku` int NOT NULL,
  `quantity` int NOT NULL,
  `purchasePrice` int NOT NULL,
  `pricePerKg` int NOT NULL,
  `dateAdded` datetime NOT NULL,
  PRIMARY KEY (`stockId`),
  UNIQUE KEY `stockId_UNIQUE` (`stockId`),
  KEY `skuStock_idx` (`sku`),
  CONSTRAINT `skuStock` FOREIGN KEY (`sku`) REFERENCES `products` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `txId` int NOT NULL AUTO_INCREMENT,
  `sku` int NOT NULL,
  `tx_type` enum('receive','sale','adjust','transfer_out','transfer_in','return') NOT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `rate` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `tx_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reference_id` int NOT NULL DEFAULT '0',
  `notes` text,
  PRIMARY KEY (`txId`),
  KEY `trans_sku_idx` (`sku`),
  CONSTRAINT `sku_transactions` FOREIGN KEY (`sku`) REFERENCES `products` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'inventory'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-23 22:04:15
