import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Clock, TrendingUp, CheckCircle, XCircle, AlertCircle, Clock as ClockIcon, MessageCircle } from 'lucide-react';
import { MedicalFieldIcon, fieldIconMap } from '@/components/MedicalFieldIcon';

interface Shift {
  id: string;
  title: string;
  description: string;
  price: number;
  shift_date: string;
  shift_time: string | null;
  duration: string | null;
  medical_field: string | null;
  status: string;
  seller_id: string;
  buyer_id: string | null;
  created_at: string;
}

type ShiftStatus = 'available' | 'pending' | 'completed' | 'cancelled';

// Tıp alanları ve renkleri
const medicalFields = [
  { value: 'acil1', label: 'Acil Dahiliye', color: '#e53935' },
  { value: 'acil2', label: 'Acil Cerrahi', color: '#d32f2f' },
  { value: 'acil3', label: 'Acil Pediatri', color: '#ff7043' },
  { value: 'kardiyoloji', label: 'Kardiyoloji', color: '#c2185b' },
  { value: 'psikyatri', label: 'Psikyatri', color: '#8e24aa' },
  { value: 'gogus', label: 'Göğüs Hastalıkları', color: '#1976d2' },
  { value: 'kadin', label: 'Kadın Hastalıkları VE Doğum', color: '#f06292' },
  { value: 'ortodonti', label: 'Ortopedi ve Travmatoloj', color: '#00897b' },
  { value: 'dahiliye', label: 'Dahiliye', color: '#43a047' },
  { value: 'pediatri', label: 'Pediatri', color: '#fbc02d' },
  { value: 'genel', label: 'Genel cerrahi', color: '#ffa000' },
];

const ShiftOffers = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | 'none'>('none');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchShifts();
  }, [priceSort]);

  const fetchShifts = async () => {
    try {
      let query = supabase
        .from('shifts')
        .select('*')
        .eq('status', 'available')
        .order('shift_date', { ascending: true }); // Default: tarihe göre sırala

      const { data, error } = await query;

      if (error) throw error;
      
      let sortedShifts = data || [];
      
      // Fiyat sıralaması uygula
      if (priceSort !== 'none') {
        sortedShifts = sortedShifts.sort((a, b) => {
          if (priceSort === 'asc') {
            return a.price - b.price;
          } else {
            return b.price - a.price;
          }
        });
      }
      
      setShifts(sortedShifts);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Nöbet teklifleri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyShift = async (shiftId: string) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .update({ 
          buyer_id: user.id,
          status: 'pending'
        })
        .eq('id', shiftId);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Nöbet teklifi kabul edildi. Satıcı ile iletişime geçebilirsiniz.",
      });

      fetchShifts(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Nöbet satın alınırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (shiftId: string, newStatus: ShiftStatus) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .update({ status: newStatus })
        .eq('id', shiftId);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: `Nöbet durumu ${getStatusText(newStatus)} olarak güncellendi.`,
      });

      fetchShifts(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Durum güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">Müsait</div>;
      case 'pending':
        return <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800">Beklemede</div>;
      case 'completed':
        return <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">Tamamlandı</div>;
      case 'cancelled':
        return <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800">İptal Edildi</div>;
      default:
        return <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">{status}</div>;
    }
  };

  const getStatusText = (status: ShiftStatus) => {
    switch (status) {
      case 'available': return 'müsait';
      case 'pending': return 'beklemede';
      case 'completed': return 'tamamlandı';
      case 'cancelled': return 'iptal edildi';
      default: return status;
    }
  };

  const canUpdateStatus = (shift: Shift) => {
    return shift.seller_id === user.id || shift.buyer_id === user.id;
  };

  const getStatusActions = (shift: Shift) => {
    if (!canUpdateStatus(shift)) return null;

    const actions = [];
    
    if (shift.status === 'pending') {
      if (shift.seller_id === user.id) {
        actions.push(
          <Button 
            key="complete" 
            size="sm" 
            variant="outline"
            onClick={() => handleStatusUpdate(shift.id, 'completed')}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Tamamla
          </Button>
        );
      }
      actions.push(
        <Button 
          key="cancel" 
          size="sm" 
          variant="outline"
          onClick={() => handleStatusUpdate(shift.id, 'cancelled')}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <XCircle className="h-3 w-3 mr-1" />
          İptal Et
        </Button>
      );
    }

    return actions.length > 0 ? (
      <div className="flex gap-2 mt-3">
        {actions}
      </div>
    ) : null;
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
    return timeString.slice(0, 5); // Format HH:MM
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

  const getMedicalFieldInfo = (fieldValue: string | null) => {
    if (!fieldValue) return null;
    return medicalFields.find(field => field.value === fieldValue);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Nöbet teklifleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri Dön
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Nöbet Teklifleri</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filter Section */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Fiyat Sıralaması:</span>
            <Select value={priceSort} onValueChange={(value) => setPriceSort(value as 'asc' | 'desc' | 'none')}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tarihe Göre (Varsayılan)</SelectItem>
                <SelectItem value="asc">Fiyat: Düşükten Yükseğe</SelectItem>
                <SelectItem value="desc">Fiyat: Yüksekten Düşüğe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {shifts.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Henüz müsait nöbet teklifi yok
            </h3>
            <p className="text-muted-foreground mb-6">
              İlk nöbet teklifini siz oluşturun!
            </p>
            <Button onClick={() => navigate('/create-shift')}>
              Nöbet Teklifi Oluştur
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shifts.map((shift) => {
              const medicalFieldInfo = getMedicalFieldInfo(shift.medical_field);
              const remainingTime = getRemainingTime(shift.shift_date);
              
              return (
                <Card 
                  key={shift.id} 
                  className="hover:shadow-lg transition-shadow relative overflow-hidden border-2"
                  style={{
                    borderLeftColor: medicalFieldInfo?.color || '#e5e7eb',
                    borderLeftWidth: medicalFieldInfo ? '6px' : '2px'
                  }}
                >
                                     {/* Medical Field Badge */}
                   {medicalFieldInfo && (
                     <div className="absolute top-3 right-3 z-10">
                       <div 
                         className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-md"
                         style={{ backgroundColor: medicalFieldInfo.color }}
                       >
                         <MedicalFieldIcon field={shift.medical_field} />
                         <span className="whitespace-nowrap">{medicalFieldInfo.label}</span>
                       </div>
                     </div>
                   )}

                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-3">
                      <CardTitle className="text-lg flex-1 pr-20">{shift.title}</CardTitle>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {shift.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(shift.shift_date)}</span>
                        <span className="text-xs text-orange-600 font-medium">
                          ({remainingTime})
                        </span>
                      </div>
                      
                      {shift.shift_time && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{formatTime(shift.shift_time)}</span>
                        </div>
                      )}
                      
                      {shift.duration && (
                        <div className="flex items-center gap-2 text-sm">
                          <ClockIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{shift.duration}</span>
                        </div>
                      )}
                    </div>

                    {/* Price Display */}
                    <div className="flex justify-center mb-3">
                      <div className="inline-flex items-center rounded-full border-2 px-4 py-2 text-lg font-bold bg-green-100 text-green-800 shadow-md">
                        {shift.price.toFixed(0)} TL
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={() => navigate(`/shift/${shift.id}`)}
                      >
                        İlanı Görüntüle
                      </Button>
                      
                      {shift.status === 'available' && shift.seller_id !== user.id && (
                        <Button 
                          variant="outline"
                          className="w-full flex items-center gap-2"
                          onClick={() => navigate('/messages')}
                        >
                          <MessageCircle className="h-4 w-4" />
                          Mesaj Gönder
                        </Button>
                      )}
                      
                      {shift.seller_id === user.id && (
                        <div className="inline-flex items-center justify-center w-full rounded-full border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                          Sizin teklifiniz
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ShiftOffers;