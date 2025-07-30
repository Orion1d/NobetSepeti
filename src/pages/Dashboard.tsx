import { Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, ShoppingCart, LogOut, User, Package, MessageCircle, Calendar, Clock, MapPin } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [purchasedShifts, setPurchasedShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchPurchasedShifts();
  }, []);

  const fetchPurchasedShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select(`
          *,
          seller:profiles!shifts_seller_id_fkey(full_name)
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchasedShifts(data || []);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Satın alınan nöbetler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
  };



  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Nöbet Sepeti</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Profil
            </Button>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Nöbet Sepeti'ne Hoş Geldiniz!</h2>
          <p className="text-muted-foreground">Ne yapmak istiyorsunuz?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/create-shift')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Nöbetimi Satmak İstiyorum</CardTitle>
              <CardDescription>
                Nöbet teklifinizi oluşturun ve diğer doktorlara satın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                Nöbet Teklifi Oluştur
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/shift-offers')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Nöbet Satın Almak İstiyorum</CardTitle>
              <CardDescription>
                Mevcut nöbet tekliflerine göz atın ve satın alın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                Nöbet Tekliflerini Gör
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Koleksiyonum Bölümü */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Koleksiyonum</h3>
            <p className="text-muted-foreground">Satın aldığınız nöbetler</p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
          ) : purchasedShifts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Henüz satın aldığınız nöbet yok.</p>
              <Button onClick={() => navigate('/shift-offers')}>
                Nöbet Tekliflerini Gör
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {purchasedShifts.map((shift) => (
                <Card key={shift.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{shift.title}</CardTitle>
                        <CardDescription>
                          Satıcı: {shift.seller?.full_name || 'Bilinmeyen'}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">
                          {shift.price.toFixed(0)} TL
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(shift.shift_date)}</span>
                      </div>
                      
                      {shift.shift_time && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(shift.shift_time)}</span>
                        </div>
                      )}
                      
                      {shift.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{shift.location}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => navigate('/messages')}
                      >
                        <MessageCircle className="h-3 w-3" />
                        Mesaj Gönder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-card border border-border rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <h4 className="font-semibold text-foreground">Telegram Grubu</h4>
              <p className="text-sm text-muted-foreground mt-1">Topluluk sohbeti</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <h4 className="font-semibold text-foreground">Instagram</h4>
              <p className="text-sm text-muted-foreground mt-1">Güncellemeler</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <h4 className="font-semibold text-foreground">SSS</h4>
              <p className="text-sm text-muted-foreground mt-1">Sık sorulan sorular</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <h4 className="font-semibold text-foreground">İletişim</h4>
              <p className="text-sm text-muted-foreground mt-1">Bize ulaşın</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <h4 className="font-semibold text-foreground">Kullanıcı Sözleşmesi</h4>
              <p className="text-sm text-muted-foreground mt-1">Şartlar ve koşullar</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;