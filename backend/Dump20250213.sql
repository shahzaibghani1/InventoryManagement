CREATE DATABASE  IF NOT EXISTS `inventory` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `inventory`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: inventory
-- ------------------------------------------------------
-- Server version	8.0.39

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
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `customerId` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `phoneNo` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`customerId`),
  UNIQUE KEY `customerId_UNIQUE` (`customerId`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (2,'Zeeshan','03128976789'),(3,'Ali Usman','04128976543'),(6,'Usman','03237654321'),(7,'Ali','12345678987'),(8,'fa',' 12345432123'),(9,'hassan','03248976543'),(10,'ali','123'),(16,'sadsad','123213'),(17,'Ahmad','03222288987'),(20,'Ali','0311111111');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `productId` int NOT NULL AUTO_INCREMENT,
  `sku` int NOT NULL,
  `productName` varchar(50) NOT NULL,
  `productAdded` date NOT NULL,
  `sellingPrice` int DEFAULT NULL,
  `purchasePrice` int DEFAULT NULL,
  PRIMARY KEY (`productId`),
  UNIQUE KEY `productId_UNIQUE` (`productId`),
  UNIQUE KEY `sku_UNIQUE` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='			';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1000,'Dana','2024-11-23',150,145),(2,1100,'Baajra','2024-11-23',500,450);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `saleId` int NOT NULL AUTO_INCREMENT,
  `salePrice` int NOT NULL,
  `saleDate` date NOT NULL,
  `profit` int DEFAULT NULL,
  `saleItems` json DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `phoneNo` varchar(45) DEFAULT NULL,
  `saleQuantity` int DEFAULT NULL,
  `sku` int DEFAULT NULL,
  PRIMARY KEY (`saleId`),
  UNIQUE KEY `saleId_UNIQUE` (`saleId`),
  KEY `sales.sku_idx` (`sku`),
  CONSTRAINT `sales.sku` FOREIGN KEY (`sku`) REFERENCES `products` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='			';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

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
  `dateAdded` date NOT NULL,
  PRIMARY KEY (`stockId`),
  UNIQUE KEY `stockId_UNIQUE` (`stockId`),
  KEY `skuStock_idx` (`sku`),
  CONSTRAINT `skuStock` FOREIGN KEY (`sku`) REFERENCES `products` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stocks`
--

LOCK TABLES `stocks` WRITE;
/*!40000 ALTER TABLE `stocks` DISABLE KEYS */;
INSERT INTO `stocks` VALUES (9,1000,50,2500,50,'2024-12-08'),(10,1000,50,3000,60,'2024-12-08'),(15,1000,90,9000,100,'2024-12-08'),(17,1000,50,10000,200,'2024-12-26');
/*!40000 ALTER TABLE `stocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stocksd`
--

DROP TABLE IF EXISTS `stocksd`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stocksd` (
  `stockId` int NOT NULL AUTO_INCREMENT,
  `sku` int NOT NULL,
  `quantity` int DEFAULT NULL,
  PRIMARY KEY (`stockId`),
  UNIQUE KEY `sku_UNIQUE` (`sku`),
  CONSTRAINT `stockDsku` FOREIGN KEY (`sku`) REFERENCES `products` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stocksd`
--

LOCK TABLES `stocksd` WRITE;
/*!40000 ALTER TABLE `stocksd` DISABLE KEYS */;
INSERT INTO `stocksd` VALUES (1,1000,52),(2,1100,48);
/*!40000 ALTER TABLE `stocksd` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-13  8:22:32
