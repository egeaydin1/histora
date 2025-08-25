-- Histora Database Initialization Script
-- This script sets up the initial database extensions and configurations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Create initial admin user (will be updated by Python scripts)
-- This is just a placeholder for database initialization
