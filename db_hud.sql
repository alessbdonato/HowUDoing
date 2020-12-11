-- phpMyAdmin SQL Dump
-- version 5.0.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Dic 11, 2020 alle 14:30
-- Versione del server: 10.4.14-MariaDB
-- Versione PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_hud`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `eventtype`
--

CREATE TABLE `eventtype` (
  `id_tipoevento` int(11) NOT NULL,
  `categoria` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `eventtype`
--

INSERT INTO `eventtype` (`id_tipoevento`, `categoria`) VALUES
(0, 'Social event'),
(1, 'Cinema'),
(2, 'Theater'),
(3, 'Appetizer'),
(4, 'Other');

-- --------------------------------------------------------

--
-- Struttura della tabella `post`
--

CREATE TABLE `post` (
  `id` int(11) NOT NULL,
  `full_text` varchar(255) NOT NULL,
  `event_title` varchar(50) NOT NULL,
  `event_data` varchar(20) NOT NULL,
  `price` varchar(20) DEFAULT NULL,
  `limit_people` int(11) DEFAULT NULL,
  `zone` varchar(255) DEFAULT NULL,
  `fk_organizer` int(11) NOT NULL,
  `fk_event_type` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `post`
--

INSERT INTO `post` (`id`, `full_text`, `event_title`, `event_data`, `price`, `limit_people`, `zone`, `fk_organizer`, `fk_event_type`) VALUES
(3, 'FestaInMaschera', 'Karaoke al Pub', '0000-00-00', '34euro', 4, '41.9997952341823855;12.5383342378800782;15', 2, 2),
(4, 'ti diamo il benvenuto all% evento dell% anno', 'Aperitivo al Pub', '0000-00-00', '5 Euro', 4, '41.9997952341823855;12.5383342378800782;15', 2, 2),
(6, 'ti diamo il benvenuto all% evento dell% anno', 'DiscoHouse al Pub', '0000-00-00', '5 Euro', 4, '41.9997952341823855;12.5383342378800782;15', 2, 2),
(7, 'evento dell% anno', 'Cinema con amici', '0000-00-00', '5 Euro', 4, '41.9997952341823855;12.5383342378800782;15', 2, 2),
(22, 'asda', 'TestEvento', '31/12/2020', '23 Euro', 23, '41.89663574263758;12.575416737500076;15', 29, 2);

-- --------------------------------------------------------

--
-- Struttura della tabella `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `age` varchar(2) NOT NULL,
  `gender` varchar(6) NOT NULL,
  `mail` varchar(255) NOT NULL,
  `pw` varchar(11) NOT NULL,
  `picture` longblob DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `zone` varchar(255) DEFAULT NULL,
  `surname` varchar(30) NOT NULL,
  `username` varchar(30) DEFAULT NULL,
  `bio` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `user`
--

INSERT INTO `user` (`id`, `name`, `age`, `gender`, `mail`, `pw`, `picture`, `last_login`, `zone`, `surname`, `username`, `bio`) VALUES
(2, 'Rebecca', '21', '2', 'rsaitta99@gmail.com', 'pwtest', NULL, NULL, NULL, 'Saitta', 'rsaitta', ''),
(3, 'Alessio', '22', '1', 'alessiodonato00@gmail.com', 'pwtest', NULL, NULL, NULL, ' Donato', 'aledo', ''),
(4, 'Andrea', '22', '1', 'andrealiiro@gmail.com', 'pwtest', NULL, NULL, NULL, 'Liirò', 'andreli', ''),
(29, 'Gerry', '24', '2', 'gscotti@gmail.com', 'pwtest', 0x756e646566696e6564, NULL, '41.999795511823855;12.5383378800782;1', 'Scotti', 'gerryscotti', 'Test'),
(30, 'Carmelo', '23', '1', 'car@gmail.com', 'pwtest', NULL, NULL, '41.9997952341823855;12.5383342378800782;15', 'Donato', 'giodona', '');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `eventtype`
--
ALTER TABLE `eventtype`
  ADD PRIMARY KEY (`id_tipoevento`);

--
-- Indici per le tabelle `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_Event_Type` (`fk_event_type`),
  ADD KEY `FK_Post_User` (`fk_organizer`);

--
-- Indici per le tabelle `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `post`
--
ALTER TABLE `post`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT per la tabella `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `post`
--
ALTER TABLE `post`
  ADD CONSTRAINT `FK_Event_Type` FOREIGN KEY (`fk_event_type`) REFERENCES `eventtype` (`id_tipoevento`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_Post_User` FOREIGN KEY (`fk_organizer`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
