-- Hostel Complaint Management System - Supabase Schema
-- Run this in the Supabase SQL Editor

-- 1. CLEAN SLATE: Safely delete any old, conflicting tables
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS wardens CASCADE;
DROP TABLE IF EXISTS hostels CASCADE;
DROP TABLE IF EXISTS maintenance_staff CASCADE;
DROP TABLE IF EXISTS supervisor_credentials CASCADE;

-- 2. CREATE USERS TABLE: Optimized for Text-based Hostels
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    phone_number TEXT,
    registration_number TEXT,
    staff_id TEXT,
    warden_id TEXT,
    supervisor_id TEXT,
    hostel_id TEXT, 
    room_number TEXT,
    category TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    hostel_id TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('mild','normal','extreme')),
    photos TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','resolved','escalated')),
    priority TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    is_emergency BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 4. CREATE FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE NOT NULL UNIQUE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE SUPERVISOR CREDENTIALS TABLE (for manual supervisor login)
CREATE TABLE IF NOT EXISTS supervisor_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable Row-Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisor_credentials ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES

-- USERS TABLE POLICIES
-- Allow authenticated users to read all profiles (for mapping names/IDs in UI)
CREATE POLICY "Allow authenticated users to read all profiles" 
ON users FOR SELECT 
TO authenticated 
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- COMPLAINTS TABLE POLICIES
-- Students can see their own complaints
CREATE POLICY "Students can see own complaints" 
ON complaints FOR SELECT 
TO authenticated 
USING (auth.uid() = student_id);

-- Wardens can see all complaints (for now, simplify to hostel check if needed in app logic)
CREATE POLICY "Wardens can see all complaints" 
ON complaints FOR SELECT 
TO authenticated 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'warden'));

-- Staff can see complaints assigned to them
CREATE POLICY "Staff can see assigned complaints" 
ON complaints FOR SELECT 
TO authenticated 
USING (auth.uid() = assigned_to);

-- Allow students to insert complaints
CREATE POLICY "Students can insert complaints" 
ON complaints FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = student_id);

-- Allow wardens to update any complaint (to assign staff)
CREATE POLICY "Wardens can update complaints" 
ON complaints FOR UPDATE 
TO authenticated 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'warden'));

-- Allow staff to update complaints assigned to them (for status updates)
CREATE POLICY "Staff can update assigned complaints" 
ON complaints FOR UPDATE 
TO authenticated 
USING (auth.uid() = assigned_to);

-- Note: supervisor_credentials contains manual login info.
-- Default Supervisor Credentials
INSERT INTO supervisor_credentials(username, password_hash) 
VALUES ('rajveersingh3hm@gmail.com', '123456')
ON CONFLICT (username) DO NOTHING;
