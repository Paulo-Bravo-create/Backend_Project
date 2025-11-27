

CREATE DATABASE IF NOT EXISTS moodnight_db;
USE moodnight_db;


CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL, 
    password_hash VARCHAR(255) NOT NULL, 
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS journal_entries (
    journal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100),
    content TEXT NOT NULL, 
    entry_date DATETIME DEFAULT CURRENT_TIMESTAMP, 
    sentiment_score DECIMAL(3, 2),
    

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS mood_logs (
    mood_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mood_value INT NOT NULL CHECK (mood_value BETWEEN 1 AND 10), 
    mood_emoji VARCHAR(10), 
    mood_note VARCHAR(255), 
    log_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, 
    
  
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);