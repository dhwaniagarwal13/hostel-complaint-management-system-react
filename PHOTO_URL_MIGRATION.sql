-- SQL Migration: Add photo_url column to users table for profile picture storage
-- Run this in Supabase SQL Editor if photo_url column doesn't exist

-- Check if column exists before adding (PostgreSQL safe way):
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Alternative (if above doesn't work in your Supabase version):
-- ALTER TABLE users ADD COLUMN photo_url TEXT;

-- This field stores base64-encoded profile pictures uploaded during registration
-- for Wardens, Students, and Maintenance Staff
