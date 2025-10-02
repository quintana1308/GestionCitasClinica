/*
SQLyog Ultimate
MySQL - 10.3.39-MariaDB : Database - gestion_citas_db
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`gestion_citas_db` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;

USE `gestion_citas_db`;

/*Table structure for table `appointment_treatments` */

CREATE TABLE `appointment_treatments` (
  `id` varchar(191) NOT NULL,
  `appointmentId` varchar(191) NOT NULL,
  `treatmentId` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(65,30) NOT NULL,
  `notes` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `appointment_treatments_appointmentId_fkey` (`appointmentId`),
  KEY `appointment_treatments_treatmentId_fkey` (`treatmentId`),
  CONSTRAINT `appointment_treatments_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `appointment_treatments_treatmentId_fkey` FOREIGN KEY (`treatmentId`) REFERENCES `treatments` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `appointment_treatments` */

/*Table structure for table `appointments` */

CREATE TABLE `appointments` (
  `id` varchar(191) NOT NULL,
  `clientId` varchar(191) NOT NULL,
  `employeeId` varchar(191) DEFAULT NULL,
  `date` datetime(3) NOT NULL,
  `startTime` datetime(3) NOT NULL,
  `endTime` datetime(3) NOT NULL,
  `status` enum('SCHEDULED','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
  `notes` varchar(191) DEFAULT NULL,
  `totalAmount` decimal(65,30) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `appointments_clientId_fkey` (`clientId`),
  KEY `appointments_employeeId_fkey` (`employeeId`),
  CONSTRAINT `appointments_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `appointments_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `appointments` */

/*Table structure for table `audit_logs` */

CREATE TABLE `audit_logs` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `action` varchar(191) NOT NULL,
  `entity` varchar(191) NOT NULL,
  `entityId` varchar(191) NOT NULL,
  `oldData` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `newData` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `userAgent` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `audit_logs_userId_fkey` (`userId`),
  CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `audit_logs` */

insert  into `audit_logs`(`id`,`userId`,`action`,`entity`,`entityId`,`oldData`,`newData`,`ipAddress`,`userAgent`,`createdAt`) values 
('cmflc23mj0001fgcswal8pu7t','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 16:23:08.245'),
('cmflc2s4r0003fgcs2akjec5w','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 16:23:40.012'),
('cmflc8mts0001sbq20leltq8l','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 16:28:13.073'),
('cmflca1sf0003sbq269f1iq55','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 16:29:19.119'),
('cmflcavhh0005sbq2goqmdpjq','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 16:29:57.605'),
('cmflcbm4k0007sbq2dqi1nuoc','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 16:30:32.133'),
('cmflccgbi0009sbq2bpnqwugj','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 16:31:11.263'),
('cmflcflj7000bsbq2alm3gc59','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 16:33:37.987'),
('cmflcfwyx000dsbq2l4mm6jah','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 16:33:52.809'),
('cmflcgshy000fsbq2148cskcc','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 16:34:33.670'),
('cmflch5so000hsbq26nw4u8wf','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 16:34:50.904'),
('cmflchot2000jsbq2lxnfffw4','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 16:35:15.542'),
('cmflckjq1000lsbq210nve45y','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 16:37:28.921'),
('cmflckw5j000nsbq2yogczl2k','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 16:37:45.031'),
('cmflcmqjq000psbq29prnlnmk','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 16:39:11.079'),
('cmflcoise000rsbq2jmri9qrm','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 16:40:34.334'),
('cmflctl8g000tsbq209itwkbr','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 16:44:30.784'),
('cmfoexobl00019fbdvz3a5hkq','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-17 20:06:59.164'),
('cmg9wbeur0001zoyir0joniml','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-02 20:56:43.246'),
('cmg9wg7az0001j1xvxd1ihmtr','cmfhcwp350003k7h53cbc2r26','LOGIN','User','cmfhcwp350003k7h53cbc2r26',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-02 21:00:26.747');

/*Table structure for table `clients` */

CREATE TABLE `clients` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `dateOfBirth` datetime(3) DEFAULT NULL,
  `gender` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `emergencyContact` varchar(191) DEFAULT NULL,
  `medicalConditions` varchar(191) DEFAULT NULL,
  `allergies` varchar(191) DEFAULT NULL,
  `clientCode` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clients_userId_key` (`userId`),
  UNIQUE KEY `clients_clientCode_key` (`clientCode`),
  CONSTRAINT `clients_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `clients` */

insert  into `clients`(`id`,`userId`,`dateOfBirth`,`gender`,`address`,`emergencyContact`,`medicalConditions`,`allergies`,`clientCode`,`createdAt`,`updatedAt`) values 
('cmg9wkh5n0004rlrwdun0i7fm','cmg9wkh4x0000rlrwthf4v7tc','1985-03-15 00:00:00.000','F','Av. Principal 456, Ciudad','Juan Rodríguez - +1234567895','Ninguna','Ninguna conocida','CLI1759439026138Q14K','2025-10-02 21:03:46.139','2025-10-02 21:03:46.139'),
('cmg9wkh6n0009rlrw0ufswlii','cmg9wkh5w0005rlrwnglrx7x6','1990-07-22 00:00:00.000','F','Calle Secundaria 789, Ciudad','Carlos Fernández - +1234567897','Hipertensión leve','Penicilina','CLI1759439026175UVFZ','2025-10-02 21:03:46.176','2025-10-02 21:03:46.176'),
('cmg9wkh7h000erlrw9q7vfly0','cmg9wkh78000arlrwaskor92w','1988-11-10 00:00:00.000','F','Plaza Central 321, Ciudad','Miguel Torres - +1234567899','Diabetes tipo 2','Látex','CLI1759439026204VAC7','2025-10-02 21:03:46.205','2025-10-02 21:03:46.205'),
('cmg9wkh80000jrlrwangz0sey','cmg9wkh7n000frlrwos0qmauv','1992-04-18 00:00:00.000','F','Av. Norte 654, Ciudad','Luis Martínez - +1234567801','Ninguna','Ninguna conocida','CLI1759439026223GMJW','2025-10-02 21:03:46.224','2025-10-02 21:03:46.224'),
('cmg9wkh8d000orlrw9a4zwb0n','cmg9wkh86000krlrw2bi8gbo5','1987-09-25 00:00:00.000','F','Calle Sur 987, Ciudad','Roberto Gómez - +1234567803','Asma leve','Polen','CLI1759439026237YERA','2025-10-02 21:03:46.238','2025-10-02 21:03:46.238');

/*Table structure for table `employees` */

CREATE TABLE `employees` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `position` varchar(191) NOT NULL,
  `specialties` varchar(191) DEFAULT NULL,
  `schedule` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `salary` decimal(65,30) DEFAULT NULL,
  `hireDate` datetime(3) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employees_userId_key` (`userId`),
  CONSTRAINT `employees_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `employees` */

/*Table structure for table `expenses` */

CREATE TABLE `expenses` (
  `id` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `amount` decimal(65,30) NOT NULL,
  `category` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `supplyId` varchar(191) DEFAULT NULL,
  `receipt` varchar(191) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','PAID','REJECTED') NOT NULL DEFAULT 'PENDING',
  `createdBy` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `expenses_supplyId_fkey` (`supplyId`),
  CONSTRAINT `expenses_supplyId_fkey` FOREIGN KEY (`supplyId`) REFERENCES `supplies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `expenses` */

/*Table structure for table `medical_history` */

CREATE TABLE `medical_history` (
  `id` varchar(191) NOT NULL,
  `clientId` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `diagnosis` varchar(191) DEFAULT NULL,
  `treatment` varchar(191) NOT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `attachments` varchar(191) DEFAULT NULL,
  `createdBy` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `medical_history_clientId_fkey` (`clientId`),
  CONSTRAINT `medical_history_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `medical_history` */

/*Table structure for table `payments` */

CREATE TABLE `payments` (
  `id` varchar(191) NOT NULL,
  `clientId` varchar(191) NOT NULL,
  `appointmentId` varchar(191) DEFAULT NULL,
  `amount` decimal(65,30) NOT NULL,
  `method` enum('CASH','CARD','TRANSFER','CHECK','FINANCING') NOT NULL,
  `status` enum('PENDING','PAID','OVERDUE','CANCELLED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `description` varchar(191) DEFAULT NULL,
  `transactionId` varchar(191) DEFAULT NULL,
  `dueDate` datetime(3) DEFAULT NULL,
  `paidDate` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_clientId_fkey` (`clientId`),
  KEY `payments_appointmentId_fkey` (`appointmentId`),
  CONSTRAINT `payments_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `payments_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `payments` */

/*Table structure for table `roles` */

CREATE TABLE `roles` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `roles` */

insert  into `roles`(`id`,`name`,`description`,`permissions`) values 
('cmfhcwou30000k7h5w0hsebqb','admin','Administrador del sistema','{\"all\":true,\"users\":[\"create\",\"read\",\"update\",\"delete\"],\"appointments\":[\"create\",\"read\",\"update\",\"delete\"],\"treatments\":[\"create\",\"read\",\"update\",\"delete\"],\"supplies\":[\"create\",\"read\",\"update\",\"delete\"],\"payments\":[\"create\",\"read\",\"update\",\"delete\"],\"reports\":[\"read\"]}'),
('cmfhcwove0001k7h5yz4lnu31','employee','Empleado de la clínica','{\"appointments\":[\"create\",\"read\",\"update\"],\"clients\":[\"create\",\"read\",\"update\"],\"treatments\":[\"read\"],\"supplies\":[\"read\",\"update\"],\"payments\":[\"create\",\"read\"]}'),
('cmfhcwovj0002k7h5hzyi9hvv','client','Cliente de la clínica','{\"appointments\":[\"read\",\"update\"],\"profile\":[\"read\",\"update\"],\"payments\":[\"read\"]}');

/*Table structure for table `supplies` */

CREATE TABLE `supplies` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `category` varchar(191) NOT NULL,
  `unit` varchar(191) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `minStock` int(11) NOT NULL DEFAULT 0,
  `maxStock` int(11) DEFAULT NULL,
  `unitCost` decimal(65,30) NOT NULL,
  `supplier` varchar(191) DEFAULT NULL,
  `expiryDate` datetime(3) DEFAULT NULL,
  `status` enum('ACTIVE','LOW_STOCK','OUT_OF_STOCK','EXPIRED','DISCONTINUED') NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `supplies` */

insert  into `supplies`(`id`,`name`,`description`,`category`,`unit`,`stock`,`minStock`,`maxStock`,`unitCost`,`supplier`,`expiryDate`,`status`,`createdAt`,`updatedAt`) values 
('cmfhcwp53000bk7h5vfusf6e5','Ácido Hialurónico','Ácido hialurónico para tratamientos faciales','medicamento','ml',50,10,NULL,25.000000000000000000000000000000,'Laboratorios Estética',NULL,'ACTIVE','2025-09-12 21:35:51.111','2025-09-12 21:35:51.111'),
('cmfhcwp58000ck7h5yjsk4vfj','Mascarillas Hidratantes','Mascarillas faciales hidratantes desechables','consumible','unidad',100,20,NULL,2.500000000000000000000000000000,'Suministros Bella',NULL,'ACTIVE','2025-09-12 21:35:51.116','2025-09-12 21:35:51.116'),
('cmfhcwp5c000dk7h5a2x40866','Aceite de Masaje','Aceite esencial para masajes corporales','consumible','ml',200,50,NULL,0.150000000000000000000000000000,'Aromas Naturales',NULL,'ACTIVE','2025-09-12 21:35:51.121','2025-09-12 21:35:51.121'),
('cmfhcwp5h000ek7h5j86iiau3','Guantes Desechables','Guantes de nitrilo desechables','consumible','unidad',500,100,NULL,0.050000000000000000000000000000,'Suministros Médicos',NULL,'ACTIVE','2025-09-12 21:35:51.125','2025-09-12 21:35:51.125');

/*Table structure for table `supply_movements` */

CREATE TABLE `supply_movements` (
  `id` varchar(191) NOT NULL,
  `supplyId` varchar(191) NOT NULL,
  `type` enum('IN','OUT','ADJUST','EXPIRED') NOT NULL,
  `quantity` int(11) NOT NULL,
  `unitCost` decimal(65,30) DEFAULT NULL,
  `reason` varchar(191) DEFAULT NULL,
  `reference` varchar(191) DEFAULT NULL,
  `createdBy` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `supply_movements_supplyId_fkey` (`supplyId`),
  CONSTRAINT `supply_movements_supplyId_fkey` FOREIGN KEY (`supplyId`) REFERENCES `supplies` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `supply_movements` */

/*Table structure for table `system_config` */

CREATE TABLE `system_config` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_config_key_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `system_config` */

insert  into `system_config`(`id`,`key`,`value`,`description`,`updatedAt`) values 
('cmfhcwp5l000fk7h5favtex2h','clinic_name','{\"name\":\"Clínica Estética Bella\"}','Nombre de la clínica','2025-09-12 21:35:51.129'),
('cmfhcwp5w000gk7h50yzxzpi9','clinic_info','{\"phone\":\"+1234567890\",\"email\":\"info@clinica.com\",\"address\":\"Calle Principal 123, Ciudad\",\"website\":\"www.clinicabella.com\"}','Información de contacto de la clínica','2025-09-12 21:35:51.140'),
('cmfhcwp68000hk7h5ahbsukyo','business_hours','{\"monday\":{\"open\":\"08:00\",\"close\":\"18:00\",\"closed\":false},\"tuesday\":{\"open\":\"08:00\",\"close\":\"18:00\",\"closed\":false},\"wednesday\":{\"open\":\"08:00\",\"close\":\"18:00\",\"closed\":false},\"thursday\":{\"open\":\"08:00\",\"close\":\"18:00\",\"closed\":false},\"friday\":{\"open\":\"08:00\",\"close\":\"18:00\",\"closed\":false},\"saturday\":{\"open\":\"09:00\",\"close\":\"15:00\",\"closed\":false},\"sunday\":{\"closed\":true}}','Horarios de atención de la clínica','2025-09-12 21:35:51.152'),
('cmfhcwp6g000ik7h5frj3byw8','appointment_settings','{\"defaultDuration\":60,\"bufferTime\":15,\"maxAdvanceBooking\":90,\"cancellationPolicy\":24}','Configuración de citas','2025-09-12 21:35:51.161');

/*Table structure for table `treatments` */

CREATE TABLE `treatments` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `duration` int(11) NOT NULL,
  `price` decimal(65,30) NOT NULL,
  `category` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `supplies` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `treatments` */

insert  into `treatments`(`id`,`name`,`description`,`duration`,`price`,`category`,`isActive`,`supplies`,`createdAt`,`updatedAt`) values 
('cmfhcwp410006k7h5yn8e7b3h','Limpieza Facial Profunda','Limpieza facial completa con extracción de comedones y mascarilla hidratante',60,75.000000000000000000000000000000,'facial',1,NULL,'2025-09-12 21:35:51.074','2025-09-12 21:35:51.074'),
('cmfhcwp490007k7h5xw9f51uz','Tratamiento Anti-edad','Tratamiento con ácido hialurónico para reducir líneas de expresión',90,150.000000000000000000000000000000,'facial',1,NULL,'2025-09-12 21:35:51.082','2025-09-12 21:35:51.082'),
('cmfhcwp4l0008k7h5hkgl5t88','Depilación Láser','Sesión de depilación láser para diferentes zonas del cuerpo',45,120.000000000000000000000000000000,'laser',1,NULL,'2025-09-12 21:35:51.093','2025-09-12 21:35:51.093'),
('cmfhcwp4q0009k7h5uzl62ctg','Masaje Corporal Relajante','Masaje corporal completo con aceites esenciales',60,80.000000000000000000000000000000,'corporal',1,NULL,'2025-09-12 21:35:51.098','2025-09-12 21:35:51.098'),
('cmfhcwp4u000ak7h5qdi7506g','Peeling Químico','Peeling químico suave para renovación celular',45,95.000000000000000000000000000000,'facial',1,NULL,'2025-09-12 21:35:51.103','2025-09-12 21:35:51.103');

/*Table structure for table `user_roles` */

CREATE TABLE `user_roles` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `roleId` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_roles_userId_roleId_key` (`userId`,`roleId`),
  KEY `user_roles_roleId_fkey` (`roleId`),
  CONSTRAINT `user_roles_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_roles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `user_roles` */

insert  into `user_roles`(`id`,`userId`,`roleId`) values 
('cmfhcwp3k0005k7h5vz0o46hz','cmfhcwp350003k7h53cbc2r26','cmfhcwou30000k7h5w0hsebqb'),
('cmg9wkh5e0002rlrwe1x5h4u4','cmg9wkh4x0000rlrwthf4v7tc','cmfhcwovj0002k7h5hzyi9hvv'),
('cmg9wkh610007rlrwbo2re299','cmg9wkh5w0005rlrwnglrx7x6','cmfhcwovj0002k7h5hzyi9hvv'),
('cmg9wkh7c000crlrwbjv6b4ct','cmg9wkh78000arlrwaskor92w','cmfhcwovj0002k7h5hzyi9hvv'),
('cmg9wkh7w000hrlrwc5tztfmb','cmg9wkh7n000frlrwos0qmauv','cmfhcwovj0002k7h5hzyi9hvv'),
('cmg9wkh8a000mrlrwqotllab6','cmg9wkh86000krlrw2bi8gbo5','cmfhcwovj0002k7h5hzyi9hvv');

/*Table structure for table `users` */

CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `firstName` varchar(191) NOT NULL,
  `lastName` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `avatar` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `users` */

insert  into `users`(`id`,`email`,`password`,`firstName`,`lastName`,`phone`,`avatar`,`isActive`,`createdAt`,`updatedAt`) values 
('cmfhcwp350003k7h53cbc2r26','admin@clinica.com','$2a$12$YjINjZwW0d4e3fXVWq4xEuz4v8Slc3f3.Sa0dczT0v83KYFnyT4KO','Administrador','Sistema','+1234567890',NULL,1,'2025-09-12 21:35:51.041','2025-09-12 21:35:51.041'),
('cmg9wkh4x0000rlrwthf4v7tc','sofia.rodriguez@email.com','$2a$12$yUuN2sdhxD4QKrXTdokOWeIoKahtawSKWNUUayf6qgeSjrXep68T2','Sofía','Rodríguez','+1234567894',NULL,1,'2025-10-02 21:03:46.113','2025-10-02 21:03:46.113'),
('cmg9wkh5w0005rlrwnglrx7x6','laura.fernandez@email.com','$2a$12$g3Q97sb8ornF5bcO.mMPaOfWe4.eoVxa6K14qqw8f5tornyCb7OpW','Laura','Fernández','+1234567896',NULL,1,'2025-10-02 21:03:46.149','2025-10-02 21:03:46.149'),
('cmg9wkh78000arlrwaskor92w','carmen.torres@email.com','$2a$12$ZlDOUMqAkIH9XOwLV92bEeBtwGnMtXhsoX98RjRmi1ao2dQll30GG','Carmen','Torres','+1234567898',NULL,1,'2025-10-02 21:03:46.196','2025-10-02 21:03:46.196'),
('cmg9wkh7n000frlrwos0qmauv','ana.martinez@email.com','$2a$12$2SyyG0BJ8p0lCYtrHXMrpOF1qxiKJk4z7KU3zLG1mbXwjXpOcX5U6','Ana','Martínez','+1234567800',NULL,1,'2025-10-02 21:03:46.211','2025-10-02 21:03:46.211'),
('cmg9wkh86000krlrw2bi8gbo5','patricia.gomez@email.com','$2a$12$Pyr1afmZQIe3lsjzhXyvLu8hNjSIZZEgpjxOyV30iIW/zaurAMZHq','Patricia','Gómez','+1234567802',NULL,1,'2025-10-02 21:03:46.230','2025-10-02 21:03:46.230');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
