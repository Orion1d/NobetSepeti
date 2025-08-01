import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Users, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary">Nöbet Sepeti</h1>
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
          <div className="flex justify-center mb-8">
            <Logo width={200} height={80} className="h-20" />
          </div>
          <h2 className="text-5xl font-bold mb-6 text-foreground">
            İnternler İçin <span className="text-primary">Nöbet Sepeti</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Nöbetinizi güvenle satın, başka internlerin nöbetlerini kolayca satın alın. 
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
                Çalışamayacağınız nöbetlerinizi diğer internlere satın
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
                Ekstra gelir için diğer internlerin nöbetlerini satın alın
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

      <Footer />
    </div>
  );
};

export default Index;
