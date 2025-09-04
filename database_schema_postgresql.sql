-- PostgreSQL Database Schema for FundEase
-- Converted from MySQL schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    userID SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    role VARCHAR(20) DEFAULT 'member',
    isActive BOOLEAN DEFAULT true,
    resetToken VARCHAR(255),
    resetTokenExpiry TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admins table
CREATE TABLE admins (
    adminID SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members table
CREATE TABLE members (
    memberID SERIAL PRIMARY KEY,
    userID INTEGER REFERENCES users(userID) ON DELETE CASCADE,
    phone VARCHAR(20),
    address TEXT,
    employment VARCHAR(100),
    monthlyIncome DECIMAL(10,2),
    emergencyContact VARCHAR(100),
    emergencyPhone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending',
    membershipDate DATE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contributions table
CREATE TABLE contributions (
    contributionID SERIAL PRIMARY KEY,
    memberID INTEGER REFERENCES members(memberID) ON DELETE CASCADE,
    userID INTEGER REFERENCES users(userID) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    paymentMethod VARCHAR(50) NOT NULL,
    paymentProof VARCHAR(255),
    contributionDate DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    referenceNo VARCHAR(100),
    paymongo_source_id VARCHAR(255),
    paymongo_payment_id VARCHAR(255),
    status_detail VARCHAR(100),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loans table
CREATE TABLE loans (
    loanID SERIAL PRIMARY KEY,
    memberID INTEGER REFERENCES members(memberID) ON DELETE CASCADE,
    userID INTEGER REFERENCES users(userID) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    remainingBalance DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    interestRate DECIMAL(5,4) DEFAULT 0.05,
    termMonths INTEGER NOT NULL,
    monthlyPayment DECIMAL(10,2),
    approvedBy INTEGER REFERENCES users(userID),
    approvedAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan repayments table
CREATE TABLE loan_repayments (
    repaymentID SERIAL PRIMARY KEY,
    loanID INTEGER REFERENCES loans(loanID) ON DELETE CASCADE,
    userID INTEGER REFERENCES users(userID) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    paymentMethod VARCHAR(50) NOT NULL,
    paymentProof VARCHAR(255),
    referenceNo VARCHAR(100),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    paymentDate DATE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Withdrawals table
CREATE TABLE withdrawals (
    withdrawalID SERIAL PRIMARY KEY,
    memberID INTEGER REFERENCES members(memberID) ON DELETE CASCADE,
    userID INTEGER REFERENCES users(userID) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    date DATE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    messageID SERIAL PRIMARY KEY,
    senderID INTEGER REFERENCES users(userID) ON DELETE CASCADE,
    receiverID INTEGER REFERENCES users(userID) ON DELETE CASCADE,
    message TEXT NOT NULL,
    isRead BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    notificationID SERIAL PRIMARY KEY,
    userID INTEGER REFERENCES users(userID) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info',
    isRead BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_members_userID ON members(userID);
CREATE INDEX idx_contributions_memberID ON contributions(memberID);
CREATE INDEX idx_contributions_userID ON contributions(userID);
CREATE INDEX idx_loans_memberID ON loans(memberID);
CREATE INDEX idx_loans_userID ON loans(userID);
CREATE INDEX idx_loan_repayments_loanID ON loan_repayments(loanID);
CREATE INDEX idx_loan_repayments_userID ON loan_repayments(userID);
CREATE INDEX idx_withdrawals_memberID ON withdrawals(memberID);
CREATE INDEX idx_withdrawals_userID ON withdrawals(userID);
CREATE INDEX idx_messages_senderID ON messages(senderID);
CREATE INDEX idx_messages_receiverID ON messages(receiverID);
CREATE INDEX idx_notifications_userID ON notifications(userID);

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contributions_updated_at BEFORE UPDATE ON contributions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loan_repayments_updated_at BEFORE UPDATE ON loan_repayments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO admins (username, email, password, firstName, lastName, role) 
VALUES ('admin', 'admin@fundease.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8Kz2', 'System', 'Administrator', 'admin');
