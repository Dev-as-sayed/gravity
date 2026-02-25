-- Active: 1767112952723@@127.0.0.1@5432@postgres

-- Create database
CREATE DATABASE gravity;

-- Create user
CREATE USER gravity_user WITH PASSWORD 'strongpassword';

-- Assign ownership
ALTER DATABASE gravity OWNER TO gravity_user;

-- Connect to the database
-- \c gravity

-- Create schema
CREATE SCHEMA IF NOT EXISTS gravity AUTHORIZATION gravity_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON SCHEMA gravity TO gravity_user;


ALTER USER postgres CREATEDB;

ALTER USER gravity_user CREATEDB;