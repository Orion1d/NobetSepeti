import { Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, ShoppingCart, LogOut, User, Package, MessageCircle, Calendar, Clock, MapPin } from 'lucide-react';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

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

      if (error) {
        console.error('Error fetching purchased shifts:', error);
        // Don't show toast for normal database responses
      }
      setPurchasedShifts(data || []);
    } catch (error: any) {
      console.error('Error in fetchPurchasedShifts:', error);
      // Don't show toast for normal errors
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
              variant="ghost" 
              onClick={() => navigate('/messages')}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Mesajlar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/create-shift')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nöbet Sat
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

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/market-history')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-xl">Alım-Satım Geçmişi</CardTitle>
              <CardDescription>
                Tüm işlemlerinizi ve geçmişinizi görüntüleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" variant="outline">
                Geçmişi Görüntüle
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
                        <CardDescription className="mt-2">
                          {shift.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(shift.shift_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(shift.shift_time)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Satıcı: {shift.seller?.full_name}</span>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                          {shift.price} ₺
                        </Badge>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/shift/${shift.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Detayları Gör
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate('/messages')}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Mesaj
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;