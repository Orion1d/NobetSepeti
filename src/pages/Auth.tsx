import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { validateStudent } from '@/utils/studentValidation';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [university, setUniversity] = useState('');
  const [language, setLanguage] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    }
  }, [searchParams]);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateStudentInfo = (studentNumber: string, fullName: string) => {
    if (!studentNumber || !fullName) {
      return { isValid: false, error: 'Öğrenci numarası ve isim alanları zorunludur.' };
    }
    
    // Validate student number format (10 digits)
    if (!/^\d{10}$/.test(studentNumber)) {
      return { isValid: false, error: 'Öğrenci numarası 10 haneli olmalıdır.' };
    }
    
    // Use actual student validation
    return validateStudent(studentNumber, fullName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setLoading(true);

    if (isLogin) {
      await signIn(email, password);
    } else {
      // Validate student information
      const validationResult = validateStudentInfo(studentNumber, fullName);
      if (!validationResult.isValid) {
        setValidationError(validationResult.error || 'Öğrenci bilgileri doğrulanamadı.');
        setLoading(false);
        return;
      }

      if (!agreeToTerms) {
        setValidationError('Kullanıcı sözleşmesini kabul etmeniz gerekmektedir.');
        setLoading(false);
        return;
      }

      const result = await signUp(email, password, fullName, phoneNumber, studentNumber, university, language);
      
      if (!result.error) {
        if (result.needsVerification) {
          // E-mail doğrulama gerekiyorsa kullanıcıya bilgi ver
          toast({
            title: "E-mail Doğrulama Gerekli",
            description: "E-mail adresinize doğrulama bağlantısı gönderildi. Lütfen e-mailinizi kontrol edin ve doğrulama bağlantısına tıklayın.",
          });
          // Ana sayfaya yönlendir
          navigate('/');
          return;
        } else {
          // Direkt giriş yapıldıysa dashboard'a yönlendir
          navigate('/dashboard');
          return;
        }
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfa
          </Button>
          <CardTitle className="text-2xl font-bold">
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Nöbet satış platformuna giriş yapın' 
              : 'Nöbet satış platformuna kayıt olun'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Ad Soyad</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    placeholder="AHMET YILMAZ"
                  />
                  <p className="text-xs text-muted-foreground">
                    İsminizi büyük harflerle yazın (örn: AHMET YILMAZ)
                  </p>
                </div>
                 <div className="space-y-2">
                   <Label htmlFor="phoneNumber">Telefon Numarası</Label>
                   <Input
                     id="phoneNumber"
                     type="tel"
                     value={phoneNumber}
                     onChange={(e) => {
                       const value = e.target.value;
                       // Sadece rakam ve + işareti kabul et
                       const cleaned = value.replace(/[^\d+]/g, '');
                       // Maksimum 13 karakter (+90 ile birlikte)
                       if (cleaned.length <= 13) {
                         setPhoneNumber(cleaned);
                       }
                     }}
                     required={!isLogin}
                     placeholder="+90 555 123 4567"
                     maxLength={13}
                   />
                 </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentNumber">Öğrenci Numarası</Label>
                    <Input
                      id="studentNumber"
                      type="text"
                      value={studentNumber}
                      onChange={(e) => setStudentNumber(e.target.value)}
                      required={!isLogin}
                       placeholder="1234567890"
                       maxLength={10}
                       pattern="\d{10}"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="university">Üniversite</Label>
                    <Select value={university} onValueChange={setUniversity} required={!isLogin}>
                      <SelectTrigger>
                        <SelectValue placeholder="Üniversitenizi seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="İstanbul Üniversitesi Tıp Fakültesi">İstanbul Üniversitesi Tıp Fakültesi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Öğrenim Diliniz</Label>
                    <Select value={language} onValueChange={setLanguage} required={!isLogin}>
                      <SelectTrigger>
                        <SelectValue placeholder="Öğrenim dilinizi seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Türkçe">Türkçe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
               </>
             )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ornek@hastane.com"
              />
            </div>
             <div className="space-y-2">
               <Label htmlFor="password">Şifre</Label>
               <div className="relative">
                 <Input
                   id="password"
                   type={showPassword ? "text" : "password"}
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                   placeholder="••••••••"
                 />
                 <Button
                   type="button"
                   variant="ghost"
                   size="sm"
                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                   onClick={() => setShowPassword(!showPassword)}
                 >
                   {showPassword ? (
                     <EyeOff className="h-4 w-4" />
                   ) : (
                     <Eye className="h-4 w-4" />
                   )}
                 </Button>
               </div>
             </div>
             {!isLogin && (
               <div className="flex items-center space-x-2">
                 <Checkbox 
                   id="agreeToTerms"
                   checked={agreeToTerms}
                   onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                 />
                 <div className="flex items-center gap-1">
                   <Label 
                     htmlFor="agreeToTerms" 
                     className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                   >
                     Kullanıcı sözleşmesini okudum ve kabul ediyorum
                   </Label>
                   <Button
                     type="button"
                     variant="link"
                     size="sm"
                     className="text-xs p-0 h-auto font-normal text-primary hover:underline"
                     onClick={() => navigate('/terms')}
                   >
                     (Oku)
                   </Button>
                 </div>
               </div>
             )}
             {validationError && (
               <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                 {validationError}
               </div>
             )}
             <Button 
               type="submit" 
               className="w-full" 
               disabled={loading}
             >
               {loading ? 'Yükleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
             </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin 
                ? 'Hesabınız yok mu? Kayıt olun' 
                : 'Zaten hesabınız var mı? Giriş yapın'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;