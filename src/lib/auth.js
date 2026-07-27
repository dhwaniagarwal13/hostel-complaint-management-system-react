import { supabase } from './supabase';

const SESSION_KEY = 'hostel_care_session';

export const authService = {
  // Supervisor Login
  supervisorLogin: async (email, password) => {
    try {
      // Query supervisor credentials
      const { data, error } = await supabase
        .from('supervisor_credentials')
        .select('id, username, password_hash')
        .eq('username', email)
        .maybeSingle();

      if (error) {
        console.error('Supervisor login error:', error);
        throw new Error('Database connection error. Please ensure supervisor_credentials table exists: ' + (error.message || 'Unknown error'));
      }

      if (!data) {
        throw new Error('Supervisor account not found. Please check your email.');
      }

      // Simple password verification (in production, use bcrypt)
      if (data.password_hash !== password) {
        throw new Error('Incorrect password');
      }

      // Create session for supervisor
      const sessionData = {
        id: data.id,
        email: email,
        role: 'supervisor',
        name: 'Supervisor Admin'
      };
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      return sessionData;
    } catch (error) {
      console.error('Supervisor login exception:', error);
      throw new Error(error.message || 'Supervisor login failed');
    }
  },

  // Register a new user
  register: async (userData) => {
    try {
      // Check for duplicate email across all user types
      const email = userData.email || userData.college_email;
      
      // Check if email exists in any user table via Supabase Auth or users table
      const { data: existingAuthUser } = await supabase.auth.admin.listUsers();
      const authUserExists = existingAuthUser?.users?.some(u => u.email === email);
      
      if (authUserExists) {
        throw new Error('An account with this email already exists. Please login instead.');
      }

      // Also check in users table if it exists
      try {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .maybeSingle();
        if (existingUser) {
          throw new Error('An account with this email already exists. Please login instead.');
        }
      } catch (e) {
        // Users table might not exist, continue
      }

      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: userData.password,
      });

      if (authError) throw authError;

      // Insert user profile into users table
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: email,
            role: userData.role,
            name: userData.name,
            phone_number: userData.phone_number || null,
            registration_number: userData.registration_number,
            staff_id: userData.staff_id,
            warden_id: userData.warden_id,
            supervisor_id: userData.supervisor_id,
            hostel_id: userData.hostel_id,
            room_number: userData.room_number,
            category: userData.category,
            photo_url: userData.photo_url || null,
          }
        ])
        .select();

      if (profileError) throw profileError;

      return profileData[0];
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  },

  // Login a user
  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) {
        throw new Error("Account corrupted (Your initial registration was stopped by a database rule). Please delete your account in Supabase or use a new email to re-register.");
      }

      // Save session
      const sessionData = {
        ...profileData,
        authUser: data.user,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

      return sessionData;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  },

  // Logout
  logout: async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      throw new Error(error.message || 'Logout failed');
    }
  },

  // Get current user session
  getCurrentUser: () => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  // Check if logged in
  isAuthenticated: () => {
    return !!localStorage.getItem(SESSION_KEY);
  },

  // Get Supabase auth session
  getAuthSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Request Password Reset OTP
  resetPasswordRequest: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(error.message || 'Failed to send OTP');
    }
  },

  // Verify OTP and Update Password
  verifyOtpAndUpdatePassword: async (email, token, newPassword) => {
    try {
      // For password reset, type is 'recovery'
      const { error: otpError } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
      if (otpError) throw otpError;

      // Update the user's password using the active session from OTP
      const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
      if (pwdError) throw pwdError;

      return true;
    } catch (error) {
      throw new Error(error.message || 'Failed to verify OTP or update password');
    }
  }
};
