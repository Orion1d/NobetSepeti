import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Clock, MessageCircle, User, MapPin } from 'lucide-react';
import { MedicalFieldIcon, fieldIconMap } from '@/components/MedicalFieldIcon';

interface Shift {
  id: string;
  title: string;
  description: string;
  price: number;
  shift_date: string;
  shift_time: string | null;
  medical_field: string | null;
  status: string;
  seller_id: string;
  buyer_id: string | null;
  duration: string | null;
  created_at: string;
}

interface SellerProfile {
  full_name: string;
  university: string;
}

const ShiftDetail = () => {
  const { shiftId } = useParams<{ shiftId: string }>();
  const [shift, setShift] = useState<Shift | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (shiftId) {
      fetchShiftDetails();
    }
  }, [shiftId]);

  const fetchShiftDetails = async () => {
    try {
      // Fetch shift details
      const { data: shiftData, error: shiftError } = await supabase
        .from('shifts')
        .select('*')
        .eq('id', shiftId)
        .single();

      if (shiftError) throw shiftError;
      setShift(shiftData);

      // Fetch seller profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, university')
        .eq('user_id', shiftData.seller_id)
        .single();

      if (profileError) throw profileError;
      setSellerProfile(profileData);

    } catch (error: any) {
      toast({
        title: "Hata",
        description: "İlan detayları yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
      navigate('/shift-offers');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyShift = async () => {
    if (!shift || !user) return;

    setPurchasing(true);
    try {
      const { error } = await supabase
        .from('shifts')
        .update({ 
          buyer_id: user.id,
          status: 'pending'
        })
        .eq('id', shift.id);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Nöbet teklifi kabul edildi. Satıcı ile iletişime geçebilirsiniz.",
      });

      navigate('/messages');
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Nöbet satın alınırken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setPurchasing(false);
    }
  };

  const getRemainingTime = (shiftDate: string) => {
    const now = new Date();
    const shiftDateObj = new Date(shiftDate);
    const diffTime = shiftDateObj.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Geçmiş';
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Yarın';
    if (diffDays <= 3) return `Son ${diffDays} gün`;
    if (diffDays <= 7) return `Son ${diffDays} gün`;
    return `${diffDays} gün kaldı`;
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

  const getMedicalFieldInfo = (fieldValue: string | null) => {
    if (!fieldValue) return null;
    return fieldIconMap[fieldValue];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">İlan detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">İlan Bulunamadı</h2>
          <p className="text-muted-foreground mb-4">Aradığınız ilan mevcut değil veya kaldırılmış olabilir.</p>
          <Button onClick={() => navigate('/shift-offers')}>
            İlanlara Dön
          </Button>
        </div>
      </div>
    );
  }

  const medicalFieldInfo = getMedicalFieldInfo(shift.medical_field);
  const remainingTime = getRemainingTime(shift.shift_date);
  const isOwnShift = shift.seller_id === user?.id;
  const canBuy = shift.status === 'available' && !isOwnShift;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/shift-offers')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri Dön
          </Button>
          <h1 className="text-2xl font-bold text-foreground">İlan Detayları</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{shift.title}</CardTitle>
                  {medicalFieldInfo && (
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-white shadow-md mb-3"
                         style={{ backgroundColor: medicalFieldInfo.color }}>
                                             <MedicalFieldIcon field={shift.medical_field} variant="white" />
                      <span>{medicalFieldInfo.color === '#1976d2' ? 'Göğüs Hastalıkları' : 
                             medicalFieldInfo.color === '#43a047' ? 'Dahiliye' : 
                             medicalFieldInfo.color === '#c2185b' ? 'Kardiyoloji' :
                             medicalFieldInfo.color === '#8e24aa' ? 'Psikyatri' :
                             medicalFieldInfo.color === '#f06292' ? 'Kadın Hastalıkları VE Doğum' :
                             medicalFieldInfo.color === '#00897b' ? 'Ortopedi ve Travmatoloj' :
                             medicalFieldInfo.color === '#fbc02d' ? 'Pediatri' :
                             medicalFieldInfo.color === '#ffa000' ? 'Genel cerrahi' :
                             'Tıp Alanı'}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {shift.price.toFixed(0)} TL
                  </div>
                  <Badge variant={shift.status === 'available' ? 'default' : 'secondary'}>
                    {shift.status === 'available' ? 'Müsait' : 'Satıldı'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Açıklama</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {shift.description}
                </p>
              </div>

              {/* Shift Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Nöbet Bilgileri</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{formatDate(shift.shift_date)}</div>
                        <div className="text-sm text-muted-foreground">({remainingTime})</div>
                      </div>
                    </div>
                    
                    {shift.shift_time && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div className="font-medium">{formatTime(shift.shift_time)}</div>
                      </div>
                    )}
                    
                    {shift.duration && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div className="font-medium">{shift.duration}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seller Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Satıcı Bilgileri</h3>
                  {sellerProfile && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div className="font-medium">{sellerProfile.full_name}</div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div className="font-medium">{sellerProfile.university}</div>
                      </div>
                      
                                             <div className="text-sm text-muted-foreground">
                         İntern
                       </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                {canBuy && (
                  <Button 
                    size="lg" 
                    onClick={handleBuyShift}
                    disabled={purchasing}
                    className="flex-1"
                  >
                    {purchasing ? 'Satın Alınıyor...' : 'Nöbeti Satın Al'}
                  </Button>
                )}
                
                {isOwnShift && (
                  <div className="flex-1 text-center py-3 text-muted-foreground">
                    Bu sizin ilanınız
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/messages')}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Mesaj Gönder
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ShiftDetail; 