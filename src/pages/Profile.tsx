import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Clock, MapPin, Key, MessageCircle, Edit, Trash2, Eye, LogOut, User, Package, TrendingUp, Settings, Shield, CreditCard, ShoppingCart } from 'lucide-react';

interface Shift {
  id: string;
  title: string;
  description: string;
  price: number;
  shift_date: string;
  shift_time: string | null;
  medical_field: string | null;
  status: string;
  created_at: string;
  seller_id: string;
  buyer_id: string | null;
  duration: string | null;
}

interface Profile {
  full_name: string;
  student_number: string;
  university: string;
  phone_number: string;
  language: string;
}

const Profile = () => {
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [purchasedShifts, setPurchasedShifts] = useState<Shift[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalShifts: 0,
    totalPurchases: 0,
    totalEarnings: 0,
    totalSpent: 0
  });
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchProfile();
    fetchMyShifts();
    fetchPurchasedShifts();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      console.log('Profile data:', data); // Debug için
      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Profil bilgileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const fetchMyShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyShifts(data || []);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Nöbet teklifleriniz yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchasedShifts = async () => {
    try {
      // Fetch purchased shifts with basic query
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // If we have shifts, fetch seller profiles separately
      if (data && data.length > 0) {
        const sellerIds = [...new Set(data.map(shift => shift.seller_id))];
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', sellerIds);

        if (!profilesError && profiles) {
          const profileMap = new Map(profiles.map(profile => [profile.user_id, profile.full_name]));
          
          // Add seller names to shifts
          const shiftsWithSellers = data.map(shift => ({
            ...shift,
            seller: { full_name: profileMap.get(shift.seller_id) || 'Bilinmeyen' }
          }));
          
          setPurchasedShifts(shiftsWithSellers);
        } else {
          setPurchasedShifts(data);
        }
      } else {
        setPurchasedShifts(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching purchased shifts:', error);
    }
  };

  // Update stats when myShifts or purchasedShifts change
  useEffect(() => {
    const totalEarnings = myShifts.reduce((sum, shift) => sum + shift.price, 0);
    const totalSpent = purchasedShifts.reduce((sum, shift) => sum + shift.price, 0);
    
    setStats({
      totalShifts: myShifts.length,
      totalPurchases: purchasedShifts.length,
      totalEarnings,
      totalSpent
    });
  }, [myShifts, purchasedShifts]);

  const handleChangePassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Şifre sıfırlama işlemi başarısız oldu.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteShift = async (shift: Shift) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shift.id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Nöbet teklifi başarıyla silindi.",
      });

      // Refresh the list
      fetchMyShifts();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Hata",
        description: "Nöbet teklifi silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleEditShift = (shift: Shift) => {
    navigate(`/create-shift?edit=${shift.id}`);
  };

  const handleViewShift = (shift: Shift) => {
    navigate(`/shift/${shift.id}`);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="default">Müsait</Badge>;
      case 'pending':
        return <Badge variant="secondary">Beklemede</Badge>;
      case 'completed':
        return <Badge variant="outline">Tamamlandı</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">İptal Edildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Profil</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={signOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl font-bold">
                      {profile ? getInitials(profile.full_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{profile?.full_name}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Öğrenci No:</span> {profile?.student_number}
                      </div>
                      <div>
                        <span className="font-medium">Üniversite:</span> {profile?.university}
                      </div>
                      <div>
                        <span className="font-medium">Telefon:</span> {profile?.phone_number}
                      </div>
                      <div>
                        <span className="font-medium">Dil:</span> {profile?.language}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleChangePassword}>
                    <Key className="h-4 w-4 mr-2" />
                    Şifre Değiştir
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Toplam İlan</p>
                      <p className="text-2xl font-bold">{stats.totalShifts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Toplam Alım</p>
                      <p className="text-2xl font-bold">{stats.totalPurchases}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Toplam Kazanç</p>
                      <p className="text-2xl font-bold">{stats.totalEarnings} ₺</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Toplam Harcama</p>
                      <p className="text-2xl font-bold">{stats.totalSpent} ₺</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="my-shifts" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="my-shifts">İlanlarım</TabsTrigger>
                <TabsTrigger value="purchases">Satın Aldıklarım</TabsTrigger>
                <TabsTrigger value="settings">Ayarlar</TabsTrigger>
              </TabsList>

              <TabsContent value="my-shifts" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      İlanlarım
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {myShifts.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">Henüz ilan oluşturmadınız.</p>
                        <Button onClick={() => navigate('/create-shift')}>
                          İlk İlanınızı Oluşturun
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {myShifts.map((shift) => (
                          <Card key={shift.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold">{shift.title}</h3>
                                    {getStatusBadge(shift.status)}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{shift.description}</p>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>{formatDate(shift.shift_date)}</span>
                                    </div>
                                    {shift.shift_time && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{formatTime(shift.shift_time)}</span>
                                      </div>
                                    )}
                                    <div className="font-semibold text-primary">
                                      {shift.price} ₺
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewShift(shift)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditShift(shift)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteShift(shift)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="purchases" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Satın Aldıklarım
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {purchasedShifts.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">Henüz nöbet satın almadınız.</p>
                        <Button onClick={() => navigate('/shift-offers')}>
                          Nöbet Tekliflerini Gör
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {purchasedShifts.map((shift) => (
                          <Card key={shift.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold">{shift.title}</h3>
                                    {getStatusBadge(shift.status)}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{shift.description}</p>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>{formatDate(shift.shift_date)}</span>
                                    </div>
                                    {shift.shift_time && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{formatTime(shift.shift_time)}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <User className="h-4 w-4" />
                                      <span>Satıcı: {shift.seller?.full_name}</span>
                                    </div>
                                    <div className="font-semibold text-primary">
                                      {shift.price} ₺
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/shift/${shift.id}`)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate('/messages')}
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Hesap Ayarları
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Güvenlik</h3>
                      <Button variant="outline" onClick={handleChangePassword}>
                        <Key className="h-4 w-4 mr-2" />
                        Şifre Değiştir
                      </Button>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="font-semibold">Profil Bilgileri</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Ad Soyad:</span> {profile?.full_name}
                        </div>
                        <div>
                          <span className="font-medium">Öğrenci No:</span> {profile?.student_number}
                        </div>
                        <div>
                          <span className="font-medium">Üniversite:</span> {profile?.university}
                        </div>
                        <div>
                          <span className="font-medium">Telefon:</span> {profile?.phone_number}
                        </div>
                        <div>
                          <span className="font-medium">Dil:</span> {profile?.language}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;