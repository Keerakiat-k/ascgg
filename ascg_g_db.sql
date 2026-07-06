-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 06, 2026 at 08:51 AM
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
-- Database: `ascg_g_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `type` enum('ข่าวสาร','กิจกรรม','ประกาศสำคัญ') DEFAULT 'ข่าวสาร',
  `cover_image` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `type`, `cover_image`, `status`, `created_at`) VALUES
(1, '🎉 งานเลี้ยงสังสรรค์ประจำปี 2026', 'ขอเชิญพนักงานทุกท่านร่วมงานเลี้ยงประจำปี ในวันศุกร์ที่ 25 ธันวาคมนี้ ธีมงาน: Neon Party!', 'กิจกรรม', NULL, 'Active', '2026-07-06 02:53:44'),
(2, '📢 ประกาศเปลี่ยนแปลงเวลาเข้างาน', 'ตั้งแต่วันที่ 1 สิงหาคม 2026 เป็นต้นไป ขอปรับเวลาเข้างานเป็น 08:30 น. - 17:30 น.', 'ประกาศสำคัญ', NULL, 'Active', '2026-07-06 02:53:44'),
(3, '🏆 ยินดีต้อนรับพนักงานใหม่ประจำเดือน', 'เดือนนี้เรามีสมาชิกใหม่มาร่วมทีมกับเราทั้งหมด 3 ท่าน อย่าลืมทักทายและทำความรู้จักกันนะครับ', 'ข่าวสาร', NULL, 'Active', '2026-07-06 02:53:44');

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` int(11) NOT NULL,
  `prefix` varchar(10) NOT NULL,
  `name` varchar(150) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `prefix`, `name`, `status`, `created_at`) VALUES
(1, 'AEP', 'บริษัท เอเอสซีจี เอ็นจิเนียริ่ง โปรดักส์ จำกัด', 'Active', '2026-07-03 08:05:53'),
(2, 'AGC', 'บริษัท เอเอสซีจี โกลบอล กรุ๊ป จำกัด', 'Active', '2026-07-03 08:05:53'),
(3, 'AIA', 'บริษัท เอเอสซีจี อินเตอร์โปร (เอเชีย) จำกัด', 'Active', '2026-07-03 08:05:53'),
(4, 'AIC', 'บริษัท เอเอสซีจี อินเวนชั่น (1991) จำกัด', 'Active', '2026-07-03 08:05:53'),
(6, 'CST', 'บริษัท ซีเอสที อินเตอร์กรุ๊ป จำกัด', 'Active', '2026-07-03 08:05:53'),
(8, 'QPM', 'บริษัท คิวพีเอ็ม พรีเวนชั่น เทคโนโลยี จำกัด', 'Active', '2026-07-03 08:05:53'),
(9, 'SQT', 'บริษัท ซินเนอจี้ คิว (ประเทศไทย) จำกัด', 'Active', '2026-07-03 08:05:53');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `company_prefix` varchar(10) NOT NULL,
  `employee_code` varchar(20) NOT NULL,
  `title_th` varchar(20) NOT NULL,
  `first_name_th` varchar(100) NOT NULL,
  `last_name_th` varchar(100) NOT NULL,
  `title_en` varchar(20) DEFAULT NULL,
  `first_name_en` varchar(100) DEFAULT NULL,
  `last_name_en` varchar(100) DEFAULT NULL,
  `nickname` varchar(50) DEFAULT NULL,
  `date_of_birth` date NOT NULL,
  `national_id` varchar(20) NOT NULL,
  `height` decimal(5,2) DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `blood_group` varchar(5) DEFAULT NULL,
  `religion` varchar(50) DEFAULT NULL,
  `marital_status` varchar(50) DEFAULT NULL,
  `military_status` varchar(50) DEFAULT NULL,
  `mobile` varchar(20) NOT NULL,
  `home_phone` varchar(20) DEFAULT NULL,
  `personal_email` varchar(100) DEFAULT NULL,
  `home_address` text DEFAULT NULL,
  `current_address` text DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `department_id` int(11) NOT NULL,
  `position_name` varchar(100) NOT NULL,
  `start_date` date DEFAULT NULL,
  `base_salary` decimal(10,2) DEFAULT NULL,
  `role_id` int(11) NOT NULL DEFAULT 3,
  `status` enum('Active','Inactive','Resigned') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `hire_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `company_prefix`, `employee_code`, `title_th`, `first_name_th`, `last_name_th`, `title_en`, `first_name_en`, `last_name_en`, `nickname`, `date_of_birth`, `national_id`, `height`, `weight`, `blood_group`, `religion`, `marital_status`, `military_status`, `mobile`, `home_phone`, `personal_email`, `home_address`, `current_address`, `email`, `position`, `department_id`, `position_name`, `start_date`, `base_salary`, `role_id`, `status`, `created_at`, `updated_at`, `hire_date`) VALUES
(1, '', 'EMP-001', '', '', '', NULL, NULL, NULL, NULL, '0000-00-00', '', NULL, NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 'admin@company.com', NULL, 0, '', NULL, NULL, 1, 'Active', '2026-07-04 04:51:48', '2026-07-04 04:51:48', '2026-07-04'),
(2, 'AEP', 'AEP001', 'นาย', 'ทดสอบ', 'ระบบงาน', 'Mr.', 'Test', 'System', 'เทส', '1995-05-15', '1100112233445', 175.00, 70.00, 'O', 'พุทธ', 'โสด', 'ผ่านเกณฑ์', '0812345678', NULL, 'test.system@gmail.com', '123/45 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กทม. 10110', 'เหมือนที่อยู่ตามทะเบียนบ้าน', 'dev.test@ascggroup.com', 'Full Stack Developer', 1, '', NULL, NULL, 3, 'Active', '2026-07-04 07:06:26', '2026-07-04 07:06:26', NULL),
(3, 'AEP', 'AEP69001', 'นาย', 'ทดสอบ', 'ระบบงาน', 'Mr.', 'Test', 'System', 'เทส', '1995-05-11', '1100112233449', 175.00, 70.00, 'O', 'พุทธ', 'โสด', 'ผ่านเกณฑ์', '0812345678', NULL, 'test.system@gmail.com', '123/45 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กทม. 10110', 'เหมือนที่อยู่ตามทะเบียนบ้าน', 'dev.test@ascggroup.com', 'Full Stack Developer', 1, '', NULL, NULL, 3, 'Inactive', '2026-07-04 08:29:07', '2026-07-04 09:13:33', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employee_additional_info`
--

CREATE TABLE `employee_additional_info` (
  `employee_id` int(11) NOT NULL,
  `thai_speak` varchar(20) DEFAULT NULL,
  `thai_write` varchar(20) DEFAULT NULL,
  `thai_read` varchar(20) DEFAULT NULL,
  `eng_speak` varchar(20) DEFAULT NULL,
  `eng_write` varchar(20) DEFAULT NULL,
  `eng_read` varchar(20) DEFAULT NULL,
  `other_lang_name` varchar(50) DEFAULT NULL,
  `other_speak` varchar(20) DEFAULT NULL,
  `other_write` varchar(20) DEFAULT NULL,
  `other_read` varchar(20) DEFAULT NULL,
  `typing_thai` int(11) DEFAULT NULL,
  `typing_eng` int(11) DEFAULT NULL,
  `computer_skill` text DEFAULT NULL,
  `office_machine` text DEFAULT NULL,
  `drive_car` enum('ได้','ไม่ได้') DEFAULT 'ไม่ได้',
  `car_license` varchar(50) DEFAULT NULL,
  `car_reg` varchar(50) DEFAULT NULL,
  `drive_moto` enum('ได้','ไม่ได้') DEFAULT 'ไม่ได้',
  `moto_license` varchar(50) DEFAULT NULL,
  `moto_reg` varchar(50) DEFAULT NULL,
  `hobbies` text DEFAULT NULL,
  `sports` text DEFAULT NULL,
  `severe_illness` varchar(50) DEFAULT NULL,
  `illness_detail` text DEFAULT NULL,
  `expected_salary` decimal(10,2) DEFAULT NULL,
  `house_type` varchar(100) DEFAULT NULL,
  `relocation_plan` varchar(100) DEFAULT NULL,
  `relocation_detail` text DEFAULT NULL,
  `self_introduction` text DEFAULT NULL,
  `ref1_name` varchar(150) DEFAULT NULL,
  `ref1_occupation` varchar(100) DEFAULT NULL,
  `ref1_relation` varchar(100) DEFAULT NULL,
  `ref1_address` text DEFAULT NULL,
  `ref1_phone` varchar(20) DEFAULT NULL,
  `ref2_name` varchar(150) DEFAULT NULL,
  `ref2_occupation` varchar(100) DEFAULT NULL,
  `ref2_relation` varchar(100) DEFAULT NULL,
  `ref2_address` text DEFAULT NULL,
  `ref2_phone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_additional_info`
--

INSERT INTO `employee_additional_info` (`employee_id`, `thai_speak`, `thai_write`, `thai_read`, `eng_speak`, `eng_write`, `eng_read`, `other_lang_name`, `other_speak`, `other_write`, `other_read`, `typing_thai`, `typing_eng`, `computer_skill`, `office_machine`, `drive_car`, `car_license`, `car_reg`, `drive_moto`, `moto_license`, `moto_reg`, `hobbies`, `sports`, `severe_illness`, `illness_detail`, `expected_salary`, `house_type`, `relocation_plan`, `relocation_detail`, `self_introduction`, `ref1_name`, `ref1_occupation`, `ref1_relation`, `ref1_address`, `ref1_phone`, `ref2_name`, `ref2_occupation`, `ref2_relation`, `ref2_address`, `ref2_phone`) VALUES
(2, 'ดี', 'ดี', 'ดี', 'ปานกลาง', 'ปานกลาง', 'ปานกลาง', NULL, NULL, NULL, NULL, 45, 40, 'React, Node.js, MySQL, Docker', NULL, 'ได้', '6543210', 'กข 1234 กทม', 'ไม่ได้', NULL, NULL, 'เขียนโค้ด, เลี้ยงปลาสวยงาม, จัดสวน', 'วิ่ง', 'ไม่เคย', NULL, 50000.00, 'บ้านเช่า/หอพัก', 'ไม่โยกย้ายแน่ๆ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'ดี', 'ดี', 'ดี', 'ปานกลาง', 'ปานกลาง', 'ปานกลาง', NULL, NULL, NULL, NULL, 45, 40, 'React, Node.js, MySQL, Docker', NULL, 'ได้', '6543210', 'กข 1234 กทม', 'ไม่ได้', NULL, NULL, 'เขียนโค้ด, เลี้ยงปลาสวยงาม, จัดสวน', 'วิ่ง', 'ไม่เคย', NULL, 50000.00, 'บ้านเช่า/หอพัก', 'ไม่โยกย้ายแน่ๆ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employee_addresses`
--

CREATE TABLE `employee_addresses` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `address_type` enum('Permanent','Current') NOT NULL,
  `address_line` text NOT NULL,
  `province` varchar(100) NOT NULL,
  `zip_code` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_credentials`
--

CREATE TABLE `employee_credentials` (
  `employee_id` int(11) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_credentials`
--

INSERT INTO `employee_credentials` (`employee_id`, `password_hash`, `last_login`) VALUES
(1, '$2b$10$mJJuoUYCRPkG9.jY/Kif6uv4Ws1pEHvQkz/rNVFI9oylsCQmXQQCi', '2026-07-06 06:20:12');

-- --------------------------------------------------------

--
-- Table structure for table `employee_educations`
--

CREATE TABLE `employee_educations` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `level` varchar(50) NOT NULL,
  `institution` varchar(150) NOT NULL,
  `major` varchar(150) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `gpa` decimal(3,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_educations`
--

INSERT INTO `employee_educations` (`id`, `employee_id`, `level`, `institution`, `major`, `start_date`, `end_date`, `gpa`) VALUES
(1, 2, 'ปริญญาตรี', 'มหาวิทยาลัยเทคโนโลยี', 'วิทยาการคอมพิวเตอร์', '2013-05-01', '2017-03-31', 3.50),
(2, 3, 'ปริญญาตรี', 'มหาวิทยาลัยเทคโนโลยี', 'วิทยาการคอมพิวเตอร์', '2013-05-01', '2017-03-31', 3.50);

-- --------------------------------------------------------

--
-- Table structure for table `employee_experiences`
--

CREATE TABLE `employee_experiences` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `company` varchar(150) NOT NULL,
  `business_type` varchar(100) DEFAULT NULL,
  `start_position` varchar(100) DEFAULT NULL,
  `end_position` varchar(100) DEFAULT NULL,
  `start_salary` decimal(10,2) DEFAULT NULL,
  `end_salary` decimal(10,2) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `reason_to_leave` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_experiences`
--

INSERT INTO `employee_experiences` (`id`, `employee_id`, `company`, `business_type`, `start_position`, `end_position`, `start_salary`, `end_salary`, `start_date`, `end_date`, `description`, `reason_to_leave`) VALUES
(1, 2, 'บริษัท เทค ซอฟต์แวร์ จำกัด', 'Software House', 'Junior Dev', 'Senior Dev', 25000.00, 45000.00, '2017-06-01', '2023-12-31', 'พัฒนาเว็บแอปพลิเคชันด้วย React และ Node.js', 'ต้องการความท้าทายใหม่'),
(2, 3, 'บริษัท เทค ซอฟต์แวร์ จำกัด', 'Software House', 'Junior Dev', 'Senior Dev', 25000.00, 45000.00, '2017-06-01', '2023-12-31', 'พัฒนาเว็บแอปพลิเคชันด้วย React และ Node.js', 'ต้องการความท้าทายใหม่');

-- --------------------------------------------------------

--
-- Table structure for table `employee_families`
--

CREATE TABLE `employee_families` (
  `employee_id` int(11) NOT NULL,
  `parent_status` varchar(50) DEFAULT NULL,
  `father_name` varchar(150) DEFAULT NULL,
  `father_age` int(11) DEFAULT NULL,
  `father_occupation` varchar(100) DEFAULT NULL,
  `mother_name` varchar(150) DEFAULT NULL,
  `mother_age` int(11) DEFAULT NULL,
  `mother_occupation` varchar(100) DEFAULT NULL,
  `total_siblings` int(11) DEFAULT 0,
  `male_siblings` int(11) DEFAULT 0,
  `female_siblings` int(11) DEFAULT 0,
  `sibling_rank` int(11) DEFAULT NULL,
  `spouse_name` varchar(150) DEFAULT NULL,
  `spouse_workplace` varchar(150) DEFAULT NULL,
  `total_children` int(11) DEFAULT 0,
  `studying_children` int(11) DEFAULT 0,
  `emergency_name` varchar(150) NOT NULL,
  `emergency_relation` varchar(100) NOT NULL,
  `emergency_phone` varchar(20) NOT NULL,
  `emergency_workplace` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_families`
--

INSERT INTO `employee_families` (`employee_id`, `parent_status`, `father_name`, `father_age`, `father_occupation`, `mother_name`, `mother_age`, `mother_occupation`, `total_siblings`, `male_siblings`, `female_siblings`, `sibling_rank`, `spouse_name`, `spouse_workplace`, `total_children`, `studying_children`, `emergency_name`, `emergency_relation`, `emergency_phone`, `emergency_workplace`) VALUES
(2, 'อยู่ด้วยกัน', 'สมชาย ระบบงาน', 60, 'พนักงานเอกชน', 'สมหญิง ระบบงาน', 58, 'แม่บ้าน', 2, 1, 1, 1, NULL, NULL, 0, 0, 'สมชาย ระบบงาน', 'บิดา', '0899999999', NULL),
(3, 'อยู่ด้วยกัน', 'สมชาย ระบบงาน', 60, 'พนักงานเอกชน', 'สมหญิง ระบบงาน', 58, 'แม่บ้าน', 2, 1, 1, 1, NULL, NULL, 0, 0, 'สมชาย ระบบงาน', 'บิดา', '0899999999', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employee_profiles`
--

CREATE TABLE `employee_profiles` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `national_id` varchar(255) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_trainings`
--

CREATE TABLE `employee_trainings` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `course` varchar(200) NOT NULL,
  `institution` varchar(150) DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `it_supports`
--

CREATE TABLE `it_supports` (
  `id` int(11) NOT NULL,
  `ticket_no` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `department` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL,
  `urgency` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `status` enum('รอรับเรื่อง','กำลังดำเนินการ','แก้ไขเสร็จสิ้น','ยกเลิก') DEFAULT 'รอรับเรื่อง',
  `assigned_to` varchar(100) DEFAULT NULL,
  `admin_note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `it_supports`
--

INSERT INTO `it_supports` (`id`, `ticket_no`, `name`, `department`, `category`, `urgency`, `description`, `status`, `assigned_to`, `admin_note`, `created_at`) VALUES
(1, 'IT-001', 'สมชาย ใจดี', 'บัญชี', 'อุปกรณ์คอมพิวเตอร์ (Hardware)', 'สูง (ทำงานต่อไม่ได้)', 'เปิดคอมไม่ติด หน้าจอมืดสนิท', 'กำลังดำเนินการ', 'Keerakiat.K', '', '2026-07-06 03:35:49'),
(2, 'IT-6907001', 'test', 'test', 'อุปกรณ์คอมพิวเตอร์ (Hardware)', 'ปานกลาง', 'test', 'แก้ไขเสร็จสิ้น', 'test', 'test', '2026-07-06 04:41:16');

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `level` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'Admin', 'ผู้ดูแลระบบสูงสุด'),
(2, 'HR', 'ฝ่ายทรัพยากรบุคคล'),
(3, 'Employee', 'พนักงานทั่วไป');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `prefix` (`prefix`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_code` (`employee_code`),
  ADD UNIQUE KEY `national_id` (`national_id`),
  ADD KEY `idx_company` (`company_prefix`),
  ADD KEY `idx_department` (`department_id`);

--
-- Indexes for table `employee_additional_info`
--
ALTER TABLE `employee_additional_info`
  ADD PRIMARY KEY (`employee_id`);

--
-- Indexes for table `employee_addresses`
--
ALTER TABLE `employee_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `employee_credentials`
--
ALTER TABLE `employee_credentials`
  ADD PRIMARY KEY (`employee_id`);

--
-- Indexes for table `employee_educations`
--
ALTER TABLE `employee_educations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `employee_experiences`
--
ALTER TABLE `employee_experiences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `employee_families`
--
ALTER TABLE `employee_families`
  ADD PRIMARY KEY (`employee_id`);

--
-- Indexes for table `employee_profiles`
--
ALTER TABLE `employee_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`);

--
-- Indexes for table `employee_trainings`
--
ALTER TABLE `employee_trainings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `it_supports`
--
ALTER TABLE `it_supports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `employee_addresses`
--
ALTER TABLE `employee_addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_educations`
--
ALTER TABLE `employee_educations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `employee_experiences`
--
ALTER TABLE `employee_experiences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `employee_profiles`
--
ALTER TABLE `employee_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_trainings`
--
ALTER TABLE `employee_trainings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `it_supports`
--
ALTER TABLE `it_supports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `employee_additional_info`
--
ALTER TABLE `employee_additional_info`
  ADD CONSTRAINT `employee_additional_info_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_addresses`
--
ALTER TABLE `employee_addresses`
  ADD CONSTRAINT `employee_addresses_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_credentials`
--
ALTER TABLE `employee_credentials`
  ADD CONSTRAINT `employee_credentials_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_educations`
--
ALTER TABLE `employee_educations`
  ADD CONSTRAINT `employee_educations_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_experiences`
--
ALTER TABLE `employee_experiences`
  ADD CONSTRAINT `employee_experiences_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_families`
--
ALTER TABLE `employee_families`
  ADD CONSTRAINT `employee_families_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_profiles`
--
ALTER TABLE `employee_profiles`
  ADD CONSTRAINT `employee_profiles_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_trainings`
--
ALTER TABLE `employee_trainings`
  ADD CONSTRAINT `employee_trainings_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
