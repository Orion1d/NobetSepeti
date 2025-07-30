import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Users, Calendar, TrendingUp, MessageCircle, Instagram, HelpCircle, Mail, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Nöbet Sepeti</h1>
          </div>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => navigate('/auth')}>
              Giriş Yap
            </Button>
            <Button onClick={() => navigate('/auth?mode=signup')}>
              Kayıt Ol
            </Button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 text-foreground">
            Doktorlar İçin <span className="text-primary">Nöbet Sepeti</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Nöbetinizi güvenle satın, başka doktorların nöbetlerini kolayca satın alın. 
            Esnek çalışma saatleri için ideal platform.
          </p>
          <Button size="lg" className="px-8 py-3" onClick={() => navigate('/auth')}>
            Hemen Başla
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Nöbet Sat</CardTitle>
              <CardDescription>
                Çalışamayacağınız nöbetlerinizi diğer doktorlara satın
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-secondary-foreground" />
              </div>
              <CardTitle>Nöbet Al</CardTitle>
              <CardDescription>
                Ekstra gelir için diğer doktorların nöbetlerini satın alın
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-accent-foreground" />
              </div>
              <CardTitle>Güvenli Ödeme</CardTitle>
              <CardDescription>
                Güvenli ödeme sistemi ile komisyonlu işlemler
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <h3 className="text-3xl font-bold mb-4 text-foreground">Nöbet Sepeti Nasıl Çalışır?</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold mb-2">Kayıt Ol</h4>
              <p className="text-muted-foreground">Telefon numarası ile hesap oluştur</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold mb-2">Nöbet Ekle/Bul</h4>
              <p className="text-muted-foreground">Nöbetini sat veya başkalarının nöbetini al</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold mb-2">Anlaş ve Çalış</h4>
              <p className="text-muted-foreground">Güvenli mesajlaşma ile detayları belirle</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-16 bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-3">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-sm">Telegram Grubu</CardTitle>
                <CardDescription className="text-xs">
                  Topluluk sohbetine katılın
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
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

            <Card className="text-center">
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

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mb-3">
                  <Mail className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-sm">İletişim</CardTitle>
                <CardDescription className="text-xs">
                  Bizimle iletişime geçin
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
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
            <p>&copy; 2024 Nöbet Sepeti. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
