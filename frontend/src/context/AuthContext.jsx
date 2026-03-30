import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfile(session.user.id);
      else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setUser(data);
    setLoading(false);
  };

  const login = async (email, password, expectedRole = null) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    if (expectedRole) {
       const { data: profile } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();
       if (profile) {
          const isStaff = expectedRole === 'field_staff' && (profile.role === 'field_staff' || profile.role === 'pending_staff');
          if (profile.role !== expectedRole && !isStaff) {
             await supabase.auth.signOut();
             setUser(null);
             throw new Error(`Access Denied: Please use the ${profile.role === 'pending_staff' ? 'Staff' : profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} portal to log in.`);
          }
          setUser(profile);
       }
    }
  };

  const register = async (userData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
        }
      }
    });
    if (error) throw error;
    return { user: data.user, session: data.session };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const sendPasswordResetEmail = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, sendPasswordResetEmail, updatePassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
