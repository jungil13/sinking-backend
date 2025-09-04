[1mdiff --git a/config/db.js b/config/db.js[m
[1mindex 1188215..8468731 100644[m
[1m--- a/config/db.js[m
[1m+++ b/config/db.js[m
[36m@@ -1,18 +1,20 @@[m
[31m-import mysql from "mysql2/promise";[m
[32m+[m[32mimport pkg from 'pg';[m
[32m+[m[32mconst { Pool } = pkg;[m
 import dotenv from "dotenv";[m
 [m
 // Load environment variables[m
 dotenv.config();[m
 [m
[31m-const pool = mysql.createPool({[m
[32m+[m[32mconst pool = new Pool({[m
   host: process.env.DB_HOST || "localhost",[m
   user: process.env.DB_USER || "root",[m
   password: process.env.DB_PASSWORD || "",[m
[31m-  database: process.env.DB_NAME || "fundeases_db",[m
[31m-  port: process.env.DB_PORT || 3306,[m
[31m-  waitForConnections: true,[m
[31m-  connectionLimit: 10,[m
[31m-  queueLimit: 0,[m
[32m+[m[32m  database: process.env.DB_NAME || "fundease",[m
[32m+[m[32m  port: process.env.DB_PORT || 5432,[m
[32m+[m[32m  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,[m
[32m+[m[32m  max: 10,[m
[32m+[m[32m  idleTimeoutMillis: 30000,[m
[32m+[m[32m  connectionTimeoutMillis: 2000,[m
 });[m
 [m
 export default pool;[m
[1mdiff --git a/database_schema_postgresql.sql b/database_schema_postgresql.sql[m
[1mnew file mode 100644[m
[1mindex 0000000..2e49015[m
[1m--- /dev/null[m
[1m+++ b/database_schema_postgresql.sql[m
[36m@@ -0,0 +1,180 @@[m
[32m+[m[32m-- PostgreSQL Database Schema for FundEase[m
[32m+[m[32m-- Converted from MySQL schema[m
[32m+[m
[32m+[m[32m-- Enable UUID extension[m
[32m+[m[32mCREATE EXTENSION IF NOT EXISTS "uuid-ossp";[m
[32m+[m
[32m+[m[32m-- Users table[m
[32m+[m[32mCREATE TABLE users ([m
[32m+[m[32m    userID SERIAL PRIMARY KEY,[m
[32m+[m[32m    username VARCHAR(50) UNIQUE NOT NULL,[m
[32m+[m[32m    email VARCHAR(100) UNIQUE NOT NULL,[m
[32m+[m[32m    password VARCHAR(255) NOT NULL,[m
[32m+[m[32m    firstName VARCHAR(50) NOT NULL,[m
[32m+[m[32m    lastName VARCHAR(50) NOT NULL,[m
[32m+[m[32m    role VARCHAR(20) DEFAULT 'member',[m
[32m+[m[32m    isActive BOOLEAN DEFAULT true,[m
[32m+[m[32m    resetToken VARCHAR(255),[m
[32m+[m[32m    resetTokenExpiry TIMESTAMP,[m
[32m+[m[32m    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,[m
[32m+[m[32m    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP[m
[32m+[m[32m);[m
[32m+[m
[32m+[m[32m-- Admins table[m
[32m+[m[32mCREATE TABLE admins ([m
[32m+[m[32m    adminID SERIAL PRIMARY KEY,[m
[32m+[m[32m    username VARCHAR(50) UNIQUE NOT NULL,[m
[32m+[m[32m    email VARCHAR(100) UNIQUE NOT NULL,[m
[32m+[m[32m    password VARCHAR(255) NOT NULL,[m
[32m+[m[32m    firstName VARCHAR(50) NOT NULL,[m
[32m+[m[32m    lastName VARCHAR(50) NOT NULL,[m
[32m+[m[32m    role VARCHAR(20) DEFAULT 'admin',[m
[32m+[m[32m    isActive BOOLEAN DEFAULT true,[m
[32m+[m[32m    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,[m
[32m+[m[32m    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP[m
[32m+[m[32m);[m
[32m+[m
[32m+[m[32m-- Members table[m
[32m+[m[32mCREATE TABLE members ([m
[32m+[m[32m    memberID SERIAL PRIMARY KEY,[m
[32m+[m[32m    userID INTEGER REFERENCES users(userID) ON DELETE CASCADE,[m
[32m+[m[32m    phone VARCHAR(20),[m
[32m+[m[32m    address TEXT,[m
[32m+[m[32m    employment VARCHAR(100),[m
[32m+[m[32m    monthlyIncome DECIMAL(10,2),[m
[32m+[m[32m    emergencyContact VARCHAR(100),[m
[32m+[m[32m    emergencyPhone VARCHAR(20),[m
[32m+[m[32m    status VARCHAR(20) DEFAULT 'pending',[m
[32m+[m[32m    membershipDate DATE,[m
[32m+[m[32m    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,[m
[32m+[m[32m    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP[m
[32m+[m[32m);[m
[32m+[m
[32m+[m[32m-- Contributions table[m
[32m+[m[32mCREATE TABLE contributions ([m
[32m+[m[32m    contributionID SERIAL PRIMARY KEY,[m
[32m+[m[32m    memberID INTEGER REFERENCES members(memberID) ON DELETE CASCADE,[m
[32m+[m[32m    userID INTEGER REFERENCES users(userID) ON DELETE CASCADE,[m
[32m+[m[32m    amount DECIMAL(10,2) NOT NULL,[m
[32m+[m[32m    paymentMethod VARCHAR(50) NOT NULL,[m
[32m+[m[32m    paymentProof VARCHAR(255),[m
[32m+[m[32m    contributionDate DATE NOT NULL,[m
[32m+[m[32m    status VARCHAR(20) DEFAULT 'pending',[m
[32m+[m[32m    notes TEXT,[m
[32m+[m[32m    referenceNo VARCHAR(100),[m
[32m+[m[32m    paymongo_source_id VARCHAR(255),[m
[32m+[m[32m    paymongo_payment_id VARCHAR(255),[m
[32m+[m[32m    status_detail VARCHAR(100),[m
[32m+[m[32m    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,[m
[32m+[m[32m    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP[m
[32m+[m[32m);[m
[32m+[m
[32m+[m[32m-- Loans table[m
[32m+[m[32mCREATE TABLE loans ([m
[32m+[m[32m    loanID SERIAL PRIMARY KEY,[m
[32m+[m[32m    memberID INTEGER REFERENCES members(memberID) ON DELETE CASCADE,[m
[32m+[m[32m    userID INTEGER REFERENCES users(userID) ON DELETE CASCADE,[m
[32m+[m[32m    amount DECIMAL(10,2) NOT NULL,[m
[32m+[m[32m    remainingBalance DECIMAL(10,2) NOT NULL,[m
[32m+[m[32m    reason TEXT NOT NULL,[m
[32m+[m[32m    status VARCHAR(20) DEFAULT 'pending',[m
[32m+[m[32m    interestRate DECIMAL(5,4) DEFAULT 0.05,[m
[32m+[m[32m    termMonths INTEGER NOT NULL,[m
[32m+[m[32m    monthlyPayment DECIMAL(10,2),[m
[32m+[m[32m    approvedBy INTEGER REFERENCES users(userID),[m
[32m+[m[32m    approvedAt TIMESTAMP,[m
[32m+[m[32m    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,[m
[32m+[m[32m    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP[m
[32m+[m[32m);[m
[32m+[m
[32m+[m[32m-- Loan repayments table[m
[32m+[m[32mCREATE TABLE loan_repayments ([m
[32m+[m[32m    repaymentID SERIAL PRIMARY KEY,[m
[32m+[m[32m    loanID INTEGER REFERENCES loans(loanID) ON DELETE CASCADE,[m
[32m+[m[32m    userID INTEGER REFERENCES users(userID) ON DELETE CASCADE,[m
[32m+[m[32m    amount DECIMAL(10,2) NOT NULL,[m
[32m+[m[32m    paymentMethod VARCHAR(50) NOT NULL,[m
[32m+[m[32m    paymentProof VARCHAR(255),[m
[32m+[m[32m    referenceNo VARCHAR(100),[m
[32m+[m[32m    notes TEXT,[m
[32m+[m[32m    status VARCHAR(20) DEFAULT 'pending',[m
[32m+[m[32m    paymentDate DATE NOT NULL,[m
[32m+[m[32m    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,[m
[32m+[m[32m    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP[m
[32m+[m[32m);[m
[32m+[m
[32m+[m[32m-- Withdrawals table[m
[32m+[m[32mCREATE TABLE withdrawals ([m
[32m+[m[32m    withdrawalID SERIAL PRIMARY KEY,[m
[32m+[m[32m    memberID INTEGER REFERENCES members(memberID) ON DELETE CASCADE,[m
[32m+[m[32m    userID INTEGER REFERENCES users(userID) ON DELETE CASCADE,[m
[32m+[m[32m    amount DECIMAL(10,2) NOT NULL,[m
[32m+[m[32m    reason TEXT NOT NULL,[m
[32m+[m[32m    status VARCHAR(20) DEFAULT 'pending',[m
[32m+[m[32m    date DATE NOT NULL,[m
[32m+[m[32m    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,[m
[32m+[m[32m    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP[m
[32m+[m[32m);[m
[32m+[m
[32m+[m[32m-- Messages table[m
[32m+[m[32mCREATE TABLE messages ([m
[32m+[m[32m    messageID SERIAL PRIMARY KEY,[m
[32m+[m[32m    senderID INTEGER REFERENCES users(userID) ON DELETE CASCADE,[m
[32m+[m[32m    receiverID INTEGER REFERENCES users(userID) ON DELETE CASCADE,[m
[32m+[m[32m    message TEXT NOT NULL,[m
[32m+[m[32m    isRead BOOLEAN DEFAULT false,[m
[32m+[m[32m    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,[m
[32m+[m[32m    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP[m
[32m+[m[32m);[m
[32m+[m
[32m+[m[32m-- Notifications table[m
[32m+[m[32mCREATE TABLE notifications ([m
[32m+[m[32m    notificationID SERIAL PRIMARY KEY,[m
[32m+[m[32m    userID INTEGER REFERENCES users(userID) ON DELETE CASCADE,[m
[32m+[m[32m    title VARCHAR(255) NOT NULL,[m
[32m+[m[32m    message TEXT NOT NULL,[m
[32m+[m[32m    type VARCHAR(20) DEFAULT 'info',[m
[32m+[m[32m    isRead BOOLEAN DEFAULT false,[m
[32m+[m[32m    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,[m
[32m+[m[32m    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP[m
[32m+[m[32m);[m
[32m+[m
[32m+[m[32m-- Create indexes for better performance[m
[32m+[m[32mCREATE INDEX idx_users_username ON users(username);[m
[32m+[m[32mCREATE INDEX idx_users_email ON users(email);[m
[32m+[m[32mCREATE INDEX idx_members_userID ON members(userID);[m
[32m+[m[32mCREATE INDEX idx_contributions_memberID ON contributions(memberID);[m
[32m+[m[32mCREATE INDEX idx_contributions_userID ON contributions(userID);[m
[32m+[m[32mCREATE INDEX idx_loans_memberID ON loans(memberID);[m
[32m+[m[32mCREATE INDEX idx_loans_userID ON loans(userID);[m
[32m+[m[32mCREATE INDEX idx_loan_repayments_loanID ON loan_repayments(loanID);[m
[32m+[m[32mCREATE INDEX idx_loan_repayments_userID ON loan_repayments(userID);[m
[32m+[m[32mCREATE INDEX idx_withdrawals_memberID ON withdrawals(memberID);[m
[32m+[m[32mCREATE INDEX idx_withdrawals_userID ON withdrawals(userID);[m
[32m+[m[32mCREATE INDEX idx_messages_senderID ON messages(senderID);[m
[32m+[m[32mCREATE INDEX idx_messages_receiverID ON messages(receiverID);[m
[32m+[m[32mCREATE INDEX idx_notifications_userID ON notifications(userID);[m
[32m+[m
[32m+[m[32m-- Create function to update updatedAt timestamp[m
[32m+[m[32mCREATE OR REPLACE FUNCTION update_updated_at_column()[m
[32m+[m[32mRETURNS TRIGGER AS $$[m
[32m+[m[32mBEGIN[m
[32m+[m[32m    NEW.updatedAt = CURRENT_TIMESTAMP;[m
[32m+[m[32m    RETURN NEW;[m
[32m+[m[32mEND;[m
[32m+[m[32m$$ language 'plpgsql';[m
[32m+[m
[32m+[m[32m-- Create triggers for updatedAt[m
[32m+[m[32mCREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();[m
[32m+[m[32mCREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();[m
[32m+[m[32mCREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();[m
[32m+[m[32mCREATE TRIGGER update_contributions_updated_at BEFORE UPDATE ON contributions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();[m
[32m+[m[32mCREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();[m
[32m+[m[32mCREATE TRIGGER update_loan_repayments_updated_at BEFORE UPDATE ON loan_repayments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();[m
[32m+[m[32mCREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();[m
[32m+[m[32mCREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();[m
[32m+[m[32mCREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();[m
[32m+[m
[32m+[m[32m-- Insert default admin user (password: admin123)[m
[32m+[m[32mINSERT INTO admins (username, email, password, firstName, lastName, role)[m[41m [m
[32m+[m[32mVALUES ('admin', 'admin@fundease.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8Kz2', 'System', 'Administrator', 'admin');[m
[1mdiff --git a/package.json b/package.json[m
[1mindex 317d07e..e785e31 100644[m
[1m--- a/package.json[m
[1m+++ b/package.json[m
[36m@@ -21,7 +21,7 @@[m
     "express": "^5.1.0",[m
     "jsonwebtoken": "^9.0.2",[m
     "multer": "^2.0.2",[m
[31m-    "mysql2": "^3.14.4",[m
[32m+[m[32m    "pg": "^8.11.3",[m
     "nodemailer": "^7.0.6",[m
     "socket.io": "^4.8.1"[m
   }[m
[1mdiff --git a/render.yaml b/render.yaml[m
[1mindex cba67b1..4984d11 100644[m
[1m--- a/render.yaml[m
[1m+++ b/render.yaml[m
[36m@@ -19,7 +19,7 @@[m [mservices:[m
       - key: DB_NAME[m
         sync: false[m
       - key: DB_PORT[m
[31m-        value: 3306[m
[32m+[m[32m        value: 5432[m
       - key: JWT_SECRET[m
         sync: false[m
       - key: MAILTRAP_HOST[m
