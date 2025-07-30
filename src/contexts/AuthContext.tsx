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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Giriş Hatası",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Kullanıcı giriş yaptıktan sonra profil kontrolü yap
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (profileError || !profile) {
          // Profil yoksa otomatik çıkış yap
          await supabase.auth.signOut();
          toast({
            title: "Hesap Hatası",
            description: "Hesabınız bulunamadı. Lütfen tekrar kayıt olun.",
            variant: "destructive",
          });
          return { error: { message: "Profil bulunamadı" } };
        }
      }
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Giriş Hatası",
        description: "Giriş yapılırken bir hata oluştu.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phoneNumber: string, studentNumber: string, university: string, language: string) => {
    try {
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

      // Eğer kullanıcı oluşturulduysa profil tablosuna da ekle
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: data.user.id,
              full_name: fullName,
              phone_number: phoneNumber,
              student_number: studentNumber,
              university: university,
              language: language,
              role: 'doctor', // Varsayılan rol
              is_phone_verified: false,
            }
          ]);

        if (profileError) {
          // Profil oluşturulamazsa auth kullanıcısını da sil
          await supabase.auth.admin.deleteUser(data.user.id);
          toast({
            title: "Kayıt Hatası",
            description: "Profil oluşturulamadı. Lütfen tekrar deneyin.",
            variant: "destructive",
          });
          return { error: profileError };
        }
      }

      // E-mail doğrulama gerekiyorsa kullanıcıya bilgi ver
      if (data.user && !data.session) {
        toast({
          title: "E-mail Doğrulama Gerekli",
          description: "E-mail adresinize doğrulama bağlantısı gönderildi. Lütfen e-mailinizi kontrol edin.",
        });
        return { error: null, needsVerification: true };
      }
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Kayıt Hatası",
        description: "Kayıt olurken bir hata oluştu.",
        variant: "destructive",
      });
      return { error };
    }
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