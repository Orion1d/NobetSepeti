import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, phoneNumber: string, studentNumber: string, university: string, language: string) => Promise<{ error: any; needsVerification?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [session]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast({
        title: "Giriş Hatası",
        description: error.message,
        variant: "destructive",
      });
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, phoneNumber: string, studentNumber: string, university: string, language: string) => {
    // Check if student number is already registered
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('student_number', studentNumber)
      .single();

    if (existingProfile) {
      const error = { message: 'Bu öğrenci numarası ile daha önce kayıt olunmuş. Eğer hesabınız varsa giriş yapın.' };
      toast({
        title: "Kayıt Hatası",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
          student_number: studentNumber,
          university: university,
          language: language,
        }
      }
    });
    
    if (error) {
      toast({
        title: "Kayıt Hatası",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } 
    
    // Profile creation is handled by Supabase trigger
    // No need for manual profile creation here
    
    // Check if user needs email verification
    if (data.user && !data.session) {
      return { error: null, needsVerification: true };
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Çıkış Yapıldı",
      description: "Başarıyla çıkış yaptınız.",
    });
    // Ana sayfaya yönlendir
    window.location.href = '/';
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};