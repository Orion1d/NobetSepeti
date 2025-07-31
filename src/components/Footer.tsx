import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Instagram, HelpCircle, Mail, FileText } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  const handleSocialClick = (platform: string) => {
    switch (platform) {
      case 'instagram':
        window.open('https://instagram.com/nobetsepeti', '_blank');
        break;
      case 'faq':
        navigate('/faq');
        break;
      case 'terms':
        navigate('/terms');
        break;
      default:
        break;
    }
  };

  return (
    <footer className="border-t border-border mt-16 bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <Card 
            className="text-center cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => handleSocialClick('instagram')}
          >
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-pink-500/10 rounded-full flex items-center justify-center mb-3">
                <Instagram className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle className="text-sm">Instagram</CardTitle>
              <CardDescription className="text-xs">
                Güncellemeleri takip edin
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="text-center cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => handleSocialClick('faq')}
          >
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-3">
                <HelpCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-sm">Sık Sorulan Sorular</CardTitle>
              <CardDescription className="text-xs">
                Merak ettikleriniz
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="text-center cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => handleSocialClick('terms')}
          >
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-sm">Kullanıcı Sözleşmesi</CardTitle>
              <CardDescription className="text-xs">
                Şartlar ve koşullar
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        
        <div className="text-center text-muted-foreground border-t border-border pt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mail className="h-4 w-4" />
            <span>nobetsepeti@gmail.com</span>
          </div>
          <p>&copy; 2024 Nöbet Sepeti. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 