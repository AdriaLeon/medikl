CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INT NOT NULL
);

CREATE TABLE IF NOT EXISTS visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    speciality VARCHAR(255) NOT NULL,
    description TEXT,
    visit_date DATETIME NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE -- If the patient is deleted, delete their visits as well
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'doctor') DEFAULT 'doctor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);