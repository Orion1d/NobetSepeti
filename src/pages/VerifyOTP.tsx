import { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const email = location.state?.email;

  // Redirect if already logged in or no email provided
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!email) {
    return <Navigate to="/auth" replace />;
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Hata",
        description: "Lütfen 6 haneli kodu girin.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Başarılı",
          description: "Hesabınız doğrulandı! Giriş yapılıyor...",
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Doğrulama Hatası",
        description: "Kod geçersiz veya süresi dolmuş. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      toast({
        title: "Hata",
        description: "Kod tekrar gönderilemedi. Lütfen daha sonra deneyin.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Kod Gönderildi",
        description: "Yeni doğrulama kodu email adresinize gönderildi.",
      });
    }

    setResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/auth')}
            className="absolute top-4 left-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Button>
          <CardTitle className="text-2xl font-bold">
            Email Doğrulama
          </CardTitle>
          <CardDescription>
            {email} adresine gönderilen 6 haneli kodu girin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              value={otp}
              onChange={setOtp}
              maxLength={6}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          
          <Button 
            onClick={handleVerifyOTP}
            className="w-full" 
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'Doğrulanıyor...' : 'Doğrula'}
          </Button>

          <div className="text-center">
            <Button
              variant="link"
              onClick={handleResendOTP}
              disabled={resending}
              className="text-sm"
            >
              {resending ? 'Gönderiliyor...' : 'Kodu tekrar gönder'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOTP;