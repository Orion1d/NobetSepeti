import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Clock, MapPin, TrendingUp, CheckCircle, XCircle, AlertCircle, Clock as ClockIcon, MessageCircle } from 'lucide-react';

interface Shift {
  id: string;
  title: string;
  description: string;
  price: number;
  shift_date: string;
  shift_time: string | null;
  duration: string | null;
  location: string | null;
  status: string;
  seller_id: string;
  buyer_id: string | null;
  created_at: string;
}

type ShiftStatus = 'available' | 'pending' | 'completed' | 'cancelled';

const ShiftOffers = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ShiftStatus | 'all'>('all');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchShifts();
  }, [statusFilter]);

  const fetchShifts = async () => {
    try {
      let query = supabase
        .from('shifts')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setShifts(data || []);
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
            <span className="text-sm font-medium">Durum Filtresi:</span>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ShiftStatus | 'all')}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="available">Müsait</SelectItem>
                <SelectItem value="pending">Beklemede</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="cancelled">İptal Edildi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {shifts.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {statusFilter === 'all' ? 'Henüz nöbet teklifi yok' : `${getStatusText(statusFilter as ShiftStatus)} nöbet bulunamadı`}
            </h3>
            <p className="text-muted-foreground mb-6">
              {statusFilter === 'all' ? 'İlk nöbet teklifini siz oluşturun!' : 'Farklı bir durum filtresi deneyin.'}
            </p>
            {statusFilter === 'all' && (
              <Button onClick={() => navigate('/create-shift')}>
                Nöbet Teklifi Oluştur
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shifts.map((shift) => (
              <Card key={shift.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{shift.title}</CardTitle>
                    <div className="flex flex-col items-end gap-2">
                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                        {shift.price.toFixed(0)} TL
                      </div>
                      {getStatusBadge(shift.status)}
                    </div>
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
                    </div>
                    
                    {shift.shift_time && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatTime(shift.shift_time)}</span>
                      </div>
                    )}
                    
                    {shift.duration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{shift.duration}</span>
                      </div>
                    )}
                    
                    {shift.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{shift.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {shift.status === 'available' && shift.seller_id !== user.id && (
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={() => handleBuyShift(shift.id)}
                      >
                        Nöbeti Satın Al
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full flex items-center gap-2"
                        onClick={() => navigate('/messages')}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Mesaj Gönder
                      </Button>
                    </div>
                  )}
                  
                  {shift.seller_id === user.id && shift.status === 'available' && (
                    <div className="space-y-2">
                      <div className="inline-flex items-center justify-center w-full rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                        Sizin teklifiniz
                      </div>
                      <Button 
                        variant="outline"
                        className="w-full flex items-center gap-2"
                        onClick={() => navigate('/messages')}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Mesajları Görüntüle
                      </Button>
                    </div>
                  )}

                  {/* Status Actions */}
                  {getStatusActions(shift)}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ShiftOffers;