CREATE DATABASE IF NOT EXISTS music_catalog;
USE music_catalog;

CREATE TABLE Vinyls (
	ID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(150) NOT NULL,
    Artist VARCHAR(100) NOT NULL,
    Published YEAR,
    Genre VARCHAR(50),
    Price DECIMAL(10,2) NOT NULL,
    Country VARCHAR(50),
    Photo VARCHAR(255)
);

-- Таблиця касет
CREATE TABLE Cassettes (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(150) NOT NULL,
    Artist VARCHAR(100) NOT NULL,
    Published  YEAR,
    Genre VARCHAR(50),
    Price DECIMAL(10,2) NOT NULL,
    Country VARCHAR(50),
    Photo VARCHAR(255)
);
