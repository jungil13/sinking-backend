-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 03, 2025 at 05:21 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fundeases_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `adminID` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `role` enum('super_admin','treasurer','screening_committee') NOT NULL DEFAULT 'screening_committee',
  `isActive` tinyint(1) DEFAULT 1,
  `lastLogin` datetime DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`adminID`, `username`, `password`, `email`, `firstName`, `lastName`, `role`, `isActive`, `lastLogin`, `createdAt`, `updatedAt`) VALUES
(1, 'admin', '$2b$12$UsBsQGTdrdk7HWo374YWyuC0ge/HTNmxwuXFeZ8ESIotHd5GYN5Fq', 'admin@fundeases.com', 'System', 'Administrator', 'super_admin', 1, NULL, '2025-08-30 14:04:03', '2025-09-01 09:28:01');

-- --------------------------------------------------------

--
-- Table structure for table `contributions`
--

CREATE TABLE `contributions` (
  `contributionID` int(11) NOT NULL,
  `memberID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paymentMethod` enum('cash','gcash','maya','bank_transfer','qrph') NOT NULL,
  `paymentProof` varchar(255) DEFAULT NULL,
  `referenceNo` varchar(100) DEFAULT NULL,
  `status` enum('pending','confirmed','rejected') DEFAULT 'pending',
  `contributionDate` date NOT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `paymongo_source_id` varchar(255) DEFAULT NULL,
  `paymongo_payment_id` varchar(255) DEFAULT NULL,
  `status_detail` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contributions`
--

INSERT INTO `contributions` (`contributionID`, `memberID`, `userID`, `amount`, `paymentMethod`, `paymentProof`, `referenceNo`, `status`, `contributionDate`, `notes`, `createdAt`, `updatedAt`, `paymongo_source_id`, `paymongo_payment_id`, `status_detail`) VALUES
(1, 1, 1, 1000.00, 'gcash', NULL, NULL, 'confirmed', '2024-01-15', 'Monthly contribution', '2025-08-30 14:04:03', '2025-08-30 14:04:03', NULL, NULL, NULL),
(2, 1, 1, 1000.00, 'maya', NULL, NULL, 'confirmed', '2024-02-15', 'Monthly contribution', '2025-08-30 14:04:03', '2025-08-30 14:04:03', NULL, NULL, NULL),
(5, 5, 5, 1000.00, 'gcash', NULL, NULL, 'confirmed', '2025-09-13', '', '2025-09-01 06:08:41', '2025-09-01 06:22:28', NULL, NULL, NULL),
(6, 5, 5, 2000.00, 'gcash', NULL, NULL, 'confirmed', '2025-09-08', '', '2025-09-01 06:32:34', '2025-09-01 10:05:08', NULL, NULL, NULL),
(7, 5, 5, 5500.00, 'gcash', NULL, NULL, 'rejected', '2025-09-01', '', '2025-09-01 14:14:37', '2025-09-01 17:14:43', NULL, NULL, NULL),
(10, 12, 14, 100.00, 'gcash', NULL, NULL, 'confirmed', '2025-09-03', '', '2025-09-02 20:53:45', '2025-09-02 21:00:21', NULL, NULL, NULL),
(11, 12, 14, 100.00, 'gcash', NULL, NULL, 'confirmed', '2025-09-03', '', '2025-09-02 20:56:02', '2025-09-02 21:00:24', NULL, NULL, NULL),
(12, 12, 14, 100.00, 'gcash', NULL, NULL, 'rejected', '2025-09-03', '', '2025-09-02 20:56:16', '2025-09-02 21:00:34', NULL, NULL, NULL),
(13, 12, 14, 100.00, 'gcash', NULL, NULL, 'rejected', '2025-09-03', '', '2025-09-02 20:58:32', '2025-09-02 21:00:36', 'src_QmSNcTnD9f3z4xBA2wYXf5Ma', NULL, NULL),
(14, 12, 14, 1000.00, 'maya', NULL, NULL, 'rejected', '2025-09-03', '', '2025-09-02 21:05:24', '2025-09-02 21:13:52', NULL, NULL, NULL),
(15, 12, 14, 1000.00, 'gcash', NULL, NULL, 'confirmed', '2025-09-03', '', '2025-09-02 21:05:38', '2025-09-02 21:13:47', 'src_hHwEwCpBeMaAkjzYpAoVSUuM', NULL, NULL),
(16, 12, 14, 500.00, 'gcash', NULL, NULL, 'confirmed', '2025-09-03', '', '2025-09-02 21:12:31', '2025-09-02 21:13:59', 'src_wFHfhwW8vRPd4sCVGLzPn9pS', NULL, NULL),
(18, 5, 5, 1000.00, 'gcash', NULL, NULL, 'rejected', '2025-09-03', '', '2025-09-02 21:21:46', '2025-09-03 02:52:32', NULL, NULL, NULL),
(19, 5, 5, 2500.00, 'gcash', NULL, NULL, 'confirmed', '2025-09-03', '', '2025-09-03 02:46:57', '2025-09-03 02:52:23', 'src_WFNDwnGmKqjaFNA9JSapKY1v', NULL, NULL),
(28, 12, 14, 100.00, 'gcash', 'proof-1756877544021-422262184.png', NULL, 'rejected', '2025-09-26', '', '2025-09-03 05:32:24', '2025-09-03 05:35:55', NULL, NULL, NULL),
(32, 12, 14, 1500.00, 'qrph', 'proof-1756890077282-304922622.jpg', '12312132123132', 'confirmed', '2025-09-15', '', '2025-09-03 09:01:17', '2025-09-03 09:52:46', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `loans`
--

CREATE TABLE `loans` (
  `loanID` int(11) NOT NULL,
  `memberID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `remainingBalance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected','disbursed','completed') DEFAULT 'pending',
  `interestRate` decimal(5,2) DEFAULT 5.00,
  `termMonths` int(11) DEFAULT 12,
  `monthlyPayment` decimal(10,2) DEFAULT NULL,
  `approvedBy` int(11) DEFAULT NULL,
  `approvedAt` datetime DEFAULT NULL,
  `disbursedAt` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loans`
--

INSERT INTO `loans` (`loanID`, `memberID`, `userID`, `amount`, `remainingBalance`, `reason`, `status`, `interestRate`, `termMonths`, `monthlyPayment`, `approvedBy`, `approvedAt`, `disbursedAt`, `notes`, `createdAt`, `updatedAt`) VALUES
(7, 5, 5, 10000.00, 5000.00, 'Vacation', 'approved', 0.05, 3, 3500.00, NULL, NULL, NULL, NULL, '2025-09-01 13:14:30', '2025-09-01 14:13:20'),
(12, 12, 14, 10000.00, 7000.00, 'Business', 'approved', 0.05, 3, 3500.00, NULL, NULL, NULL, NULL, '2025-09-03 03:14:11', '2025-09-03 11:07:05'),
(13, 12, 14, 20000.00, 20000.00, 'Requirements for Abroad', 'pending', 0.05, 5, 4200.00, NULL, NULL, NULL, NULL, '2025-09-03 15:03:31', '2025-09-03 15:03:31');

-- --------------------------------------------------------

--
-- Table structure for table `loan_repayments`
--

CREATE TABLE `loan_repayments` (
  `repaymentID` int(11) NOT NULL,
  `loanID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paymentMethod` enum('cash','gcash','maya','bank_transfer') NOT NULL,
  `paymentProof` varchar(255) DEFAULT NULL,
  `referenceNo` varchar(100) DEFAULT NULL,
  `status` enum('pending','confirmed','rejected') DEFAULT 'pending',
  `paymentDate` date NOT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loan_repayments`
--

INSERT INTO `loan_repayments` (`repaymentID`, `loanID`, `userID`, `amount`, `paymentMethod`, `paymentProof`, `referenceNo`, `status`, `paymentDate`, `notes`, `createdAt`, `updatedAt`) VALUES
(11, 7, 5, 5000.00, 'gcash', 'screenshot123.png', NULL, 'rejected', '2025-09-01', 'Way Proof -Admin', '2025-09-01 14:13:20', '2025-09-03 14:36:57'),
(12, 12, 14, 2000.00, 'gcash', 'proof-1756897625184-943182266.png', '65656565456', 'confirmed', '2025-09-03', 'yahaya', '2025-09-03 10:10:35', '2025-09-03 13:36:13'),
(13, 12, 14, 1000.00, 'gcash', 'proof-1756897625184-943182266.png', '65656565456', 'rejected', '2025-09-03', 'pataka rag butangs ref no. -Admin', '2025-09-03 11:07:05', '2025-09-03 14:01:48');

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `memberID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `employment` varchar(100) DEFAULT NULL,
  `monthlyIncome` decimal(10,2) DEFAULT NULL,
  `emergencyContact` varchar(100) DEFAULT NULL,
  `emergencyPhone` varchar(20) DEFAULT NULL,
  `status` enum('pending','active','suspended','inactive') DEFAULT 'pending',
  `membershipDate` date DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`memberID`, `userID`, `phone`, `address`, `employment`, `monthlyIncome`, `emergencyContact`, `emergencyPhone`, `status`, `membershipDate`, `createdAt`, `updatedAt`) VALUES
(1, 1, '+639123456789', '123 Main St, Manila', 'Software Engineer', 50000.00, 'Jane Doe', '+639123456790', 'active', '2024-01-01', '2025-08-30 14:04:03', '2025-08-30 14:04:03'),
(4, 4, '09917198428', 'Poblacion Cordova Cebu', 'Unemployed', 15000.00, 'Mark Cayude', 'Renz Ando', 'pending', NULL, '2025-08-30 14:05:36', '2025-08-30 14:05:36'),
(5, 5, '09917198428', 'Bangkal Basak Lapu lapu', 'Employed', 20000.00, 'Jun Gil', 'Rica', 'pending', NULL, '2025-08-30 17:01:15', '2025-08-30 17:01:15'),
(8, 8, '09917198428', 'Secreet', 'Self-employed', 20000.00, 'Kate', 'Jun Gil', 'pending', NULL, '2025-09-01 14:08:39', '2025-09-01 14:08:39'),
(9, 9, '09917198428', 'Cordova Cebu', 'Employed', 20000.00, 'Kate', 'Jun Gil', 'pending', NULL, '2025-09-01 17:19:02', '2025-09-01 17:19:02'),
(10, 10, '09917198428', 'Cordova Cebu', 'Employed', 20000.00, 'Kate ', 'Jun Gil', 'pending', NULL, '2025-09-01 17:20:10', '2025-09-01 17:20:10'),
(12, 14, '09917198428', 'Poblacion Cordova', 'Employed', 20000.00, 'None', 'None', 'pending', NULL, '2025-09-02 19:06:13', '2025-09-02 19:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `messageID` int(11) NOT NULL,
  `senderID` int(11) NOT NULL,
  `receiverID` int(11) NOT NULL,
  `message` text NOT NULL,
  `isRead` tinyint(1) DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`messageID`, `senderID`, `receiverID`, `message`, `isRead`, `createdAt`, `updatedAt`) VALUES
(4, 5, 8, 'Hello Treasurer! This is a test message.', 1, '2025-09-02 05:38:20', '2025-09-02 14:02:04'),
(5, 5, 8, 'oaky', 1, '2025-09-02 06:19:35', '2025-09-02 14:02:04'),
(6, 5, 8, 'nice', 1, '2025-09-02 06:23:36', '2025-09-02 14:02:04'),
(7, 8, 5, 'haha', 1, '2025-09-02 06:23:58', '2025-09-02 13:53:12'),
(8, 8, 5, 'patol naka', 1, '2025-09-02 06:24:04', '2025-09-02 13:53:12'),
(9, 5, 8, 'ikaw buang', 1, '2025-09-02 06:24:09', '2025-09-02 14:02:04'),
(10, 8, 5, '😊 😊', 1, '2025-09-02 06:24:18', '2025-09-02 13:53:12'),
(11, 8, 5, 'paldo', 1, '2025-09-02 06:25:43', '2025-09-02 13:53:12'),
(12, 5, 8, 'ikaw', 1, '2025-09-02 06:25:56', '2025-09-02 14:02:04'),
(13, 8, 5, 'admin ko', 1, '2025-09-02 06:56:03', '2025-09-02 13:53:12'),
(14, 5, 8, 'member ko', 1, '2025-09-02 06:56:07', '2025-09-02 14:02:04'),
(15, 5, 8, 'Hello Treasurer! This is a test message.', 1, '2025-09-02 13:02:32', '2025-09-02 14:02:04'),
(16, 5, 8, 'Hello Admin! This is my first test message.', 1, '2025-09-02 13:30:38', '2025-09-02 14:02:04'),
(17, 5, 8, 'Hello Admin! This is my first test message.', 1, '2025-09-02 13:32:42', '2025-09-02 14:02:04'),
(18, 5, 8, 'ok', 1, '2025-09-02 13:54:50', '2025-09-02 14:02:04'),
(19, 5, 8, 'hooy admin', 1, '2025-09-02 13:54:58', '2025-09-02 14:02:04'),
(20, 8, 5, 'hi admin ko ni chat', 1, '2025-09-02 13:58:00', '2025-09-02 13:58:14'),
(21, 10, 5, 'hi treasuer ko ni chat', 1, '2025-09-02 13:59:07', '2025-09-02 13:59:14'),
(22, 5, 10, 'oo', 0, '2025-09-02 13:59:17', '2025-09-02 13:59:17'),
(23, 8, 5, 'unsaman', 1, '2025-09-02 14:02:13', '2025-09-02 14:07:49'),
(24, 8, 5, 'aw', 1, '2025-09-02 14:06:35', '2025-09-02 14:07:49'),
(25, 8, 5, 'ok', 1, '2025-09-02 14:09:40', '2025-09-02 14:13:43'),
(26, 5, 8, 'AWH', 1, '2025-09-02 14:13:26', '2025-09-02 14:13:30'),
(27, 5, 8, 'oo', 1, '2025-09-02 14:41:29', '2025-09-02 14:41:47'),
(28, 8, 5, 'hahah', 1, '2025-09-02 18:45:02', '2025-09-02 18:45:20'),
(29, 8, 5, 'sheesh', 1, '2025-09-02 19:18:02', '2025-09-02 21:21:03'),
(30, 14, 8, 'ADD', 0, '2025-09-02 19:36:20', '2025-09-02 19:36:20'),
(31, 8, 14, 'OK', 1, '2025-09-02 19:36:34', '2025-09-02 19:41:55'),
(32, 14, 9, 'hello po', 0, '2025-09-02 19:42:42', '2025-09-02 19:42:42'),
(33, 14, 10, 'hello po', 0, '2025-09-02 19:42:46', '2025-09-02 19:42:46'),
(34, 10, 14, 'hello sad unsay ato?', 1, '2025-09-02 19:47:27', '2025-09-02 19:48:43'),
(35, 10, 5, 'oo', 1, '2025-09-02 19:47:43', '2025-09-02 21:21:01'),
(36, 9, 14, 'oo?', 1, '2025-09-02 19:50:28', '2025-09-02 21:20:37'),
(37, 9, 14, 'yabag naka', 1, '2025-09-02 19:50:32', '2025-09-02 21:20:37'),
(38, 8, 14, 'hooy', 1, '2025-09-03 13:34:00', '2025-09-03 13:34:12'),
(39, 8, 14, 'imong utang', 1, '2025-09-03 13:34:04', '2025-09-03 13:34:12'),
(40, 14, 8, 'hahaha', 0, '2025-09-03 13:34:16', '2025-09-03 13:34:16');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notificationID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `isRead` tinyint(1) DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notificationID`, `userID`, `title`, `message`, `type`, `isRead`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'Welcome to Fundeases!', 'Thank you for joining our community. Your membership has been activated.', 'success', 0, '2025-08-30 14:04:04', '2025-08-30 14:04:04'),
(4, 4, 'Welcome to Fundeases!', 'Your registration has been submitted successfully. Please wait for admin approval.', 'success', 0, '2025-08-30 14:05:36', '2025-08-30 14:05:36'),
(5, 5, 'Welcome to Fundeases!', 'Your registration has been submitted successfully. Please wait for admin approval.', 'success', 0, '2025-08-30 17:01:15', '2025-08-30 17:01:15');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `role` enum('member','admin','screening_committee','treasurer') NOT NULL DEFAULT 'member',
  `isActive` tinyint(1) DEFAULT 1,
  `lastLogin` datetime DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `username`, `password`, `email`, `firstName`, `lastName`, `role`, `isActive`, `lastLogin`, `createdAt`, `updatedAt`) VALUES
(1, 'member1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzqKqK', 'member1@example.com', 'John', 'Doe', 'member', 1, NULL, '2025-08-30 14:04:03', '2025-08-30 14:04:03'),
(4, 'jungil', '$2b$12$TXaE/r94vD6YUFl/DNkXb...KbjN1WNB7vCbCmrClGaPXlo.uR3RC', 'jungil@gmail.com', 'Jun Gil', 'Casquejo', 'member', 1, NULL, '2025-08-30 14:05:36', '2025-09-02 18:56:38'),
(5, 'kate', '$2a$12$r3CqIDBnb.rU88.8NZpHEeKbPKB0cw2jWtiVUUypI8MggoSt5.T4y', 'kate@gmail.com', 'Honey Kate', 'Padilla', 'member', 1, NULL, '2025-08-30 17:01:15', '2025-08-30 17:01:15'),
(8, 'admin', '$2b$12$CEcMgeuGb9M8jJSrvv6QjuAwgoKSK88FcqedknrniSMgawmXMfLiq', 'admin@gmail.com', 'Admin', 'User', 'admin', 1, NULL, '2025-09-01 14:08:39', '2025-09-01 14:08:50'),
(9, 'committee', '$2b$12$Jerx3UzGciwbu/nPAMPymuPN4U3xHZ6PLlxvf5IL3eQ.IYdTayOSS', 'committee@gmail.com', 'Committee', 'User', 'screening_committee', 1, NULL, '2025-09-01 17:19:02', '2025-09-01 17:19:15'),
(10, 'treasurer', '$2b$12$ZVRQxjF4wlAO/XlCD/YmVeGRb4mjeHOtJOuuWWBTBNsduPQ.dN7ju', 'treasurer@gmail.com', 'Treasurer', 'User', 'treasurer', 1, NULL, '2025-09-01 17:20:10', '2025-09-01 17:20:23'),
(14, 'mark', '$2b$12$DnfkqGPYXEZdk5vBPMfbneZc23SeicufFFQlx7zCdNs1s7FoAoY4G', 'mark@gmail.com', 'Mark ', 'Cayude', 'member', 1, NULL, '2025-09-02 19:06:13', '2025-09-02 19:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `withdrawals`
--

CREATE TABLE `withdrawals` (
  `withdrawalID` int(11) NOT NULL,
  `memberID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `date` date NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `withdrawals`
--

INSERT INTO `withdrawals` (`withdrawalID`, `memberID`, `userID`, `amount`, `reason`, `status`, `date`, `createdAt`, `updatedAt`) VALUES
(1, 5, 5, 2000.00, 'Tuition Fee', 'approved', '2025-09-01', '2025-09-01 14:50:45', '2025-09-01 15:20:35'),
(2, 5, 5, 6000.00, 'Vacation', 'approved', '2025-09-01', '2025-09-01 14:51:27', '2025-09-01 16:48:46'),
(3, 5, 5, 1000.00, 'Emergency', 'approved', '2025-09-01', '2025-09-01 16:01:21', '2025-09-03 14:37:41'),
(6, 5, 5, 20000.00, 'Allowance', 'approved', '2025-09-02', '2025-09-01 16:12:53', '2025-09-01 17:01:47'),
(9, 12, 14, 1000.00, 'pang tagay ragud broken ko', 'rejected', '2025-09-03', '2025-09-03 14:26:50', '2025-09-03 14:37:30'),
(10, 12, 14, 2000.00, 'Books', 'approved', '2025-09-03', '2025-09-03 14:34:12', '2025-09-03 14:37:31');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`adminID`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `contributions`
--
ALTER TABLE `contributions`
  ADD PRIMARY KEY (`contributionID`),
  ADD KEY `idx_memberID` (`memberID`),
  ADD KEY `idx_userID` (`userID`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_contributionDate` (`contributionDate`),
  ADD KEY `idx_paymentMethod` (`paymentMethod`),
  ADD KEY `idx_contributions_amount` (`amount`);

--
-- Indexes for table `loans`
--
ALTER TABLE `loans`
  ADD PRIMARY KEY (`loanID`),
  ADD KEY `idx_memberID` (`memberID`),
  ADD KEY `idx_userID` (`userID`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_approvedBy` (`approvedBy`),
  ADD KEY `idx_createdAt` (`createdAt`),
  ADD KEY `idx_loans_amount` (`amount`);

--
-- Indexes for table `loan_repayments`
--
ALTER TABLE `loan_repayments`
  ADD PRIMARY KEY (`repaymentID`),
  ADD KEY `idx_loanID` (`loanID`),
  ADD KEY `idx_userID` (`userID`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_paymentDate` (`paymentDate`),
  ADD KEY `idx_paymentMethod` (`paymentMethod`),
  ADD KEY `idx_loan_repayments_amount` (`amount`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`memberID`),
  ADD KEY `idx_userID` (`userID`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_membershipDate` (`membershipDate`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`messageID`),
  ADD KEY `idx_senderID` (`senderID`),
  ADD KEY `idx_receiverID` (`receiverID`),
  ADD KEY `idx_isRead` (`isRead`),
  ADD KEY `idx_createdAt` (`createdAt`),
  ADD KEY `idx_messages_created_at` (`createdAt`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notificationID`),
  ADD KEY `idx_userID` (`userID`),
  ADD KEY `idx_isRead` (`isRead`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_createdAt` (`createdAt`),
  ADD KEY `idx_notifications_created_at` (`createdAt`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `withdrawals`
--
ALTER TABLE `withdrawals`
  ADD PRIMARY KEY (`withdrawalID`),
  ADD KEY `idx_memberID` (`memberID`),
  ADD KEY `idx_userID` (`userID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `adminID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `contributions`
--
ALTER TABLE `contributions`
  MODIFY `contributionID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `loans`
--
ALTER TABLE `loans`
  MODIFY `loanID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `loan_repayments`
--
ALTER TABLE `loan_repayments`
  MODIFY `repaymentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `memberID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `messageID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notificationID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `withdrawals`
--
ALTER TABLE `withdrawals`
  MODIFY `withdrawalID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `contributions`
--
ALTER TABLE `contributions`
  ADD CONSTRAINT `contributions_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `members` (`memberID`) ON DELETE CASCADE,
  ADD CONSTRAINT `contributions_ibfk_2` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `loans`
--
ALTER TABLE `loans`
  ADD CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `members` (`memberID`) ON DELETE CASCADE,
  ADD CONSTRAINT `loans_ibfk_2` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE,
  ADD CONSTRAINT `loans_ibfk_3` FOREIGN KEY (`approvedBy`) REFERENCES `admins` (`adminID`) ON DELETE SET NULL;

--
-- Constraints for table `loan_repayments`
--
ALTER TABLE `loan_repayments`
  ADD CONSTRAINT `loan_repayments_ibfk_1` FOREIGN KEY (`loanID`) REFERENCES `loans` (`loanID`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_repayments_ibfk_2` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `members`
--
ALTER TABLE `members`
  ADD CONSTRAINT `members_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`senderID`) REFERENCES `users` (`userID`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiverID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `withdrawals`
--
ALTER TABLE `withdrawals`
  ADD CONSTRAINT `withdrawals_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `members` (`memberID`) ON DELETE CASCADE,
  ADD CONSTRAINT `withdrawals_ibfk_2` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
