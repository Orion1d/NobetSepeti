import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Clock, MapPin, Trash2, Eye, User, AlertTriangle } from 'lucide-react';

interface DeletedShift {
  id: string;
  original_shift_id: string;
  seller_id: string;
  buyer_id: string | null;
  title: string;
  description: string;
  price: number;
  shift_date: string;
  shift_time: string | null;
  duration: string | null;
  location: string | null;
  status: string;
  deleted_at: string;
  deleted_by: string;
  deletion_reason: string | null;
  created_at: string;
  updated_at: string;
}

interface Profile {
  full_name: string;
  user_id: string;
}

const AdminDeletedShifts = () => {
  const [deletedShifts, setDeletedShifts] = useState<DeletedShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState<Record<string, Profile>>({});
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    checkAdminRole();
  }, []);

  const checkAdminRole = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (profile.role !== 'admin') {
        toast({
          title: "Yetkisiz Erişim",
          description: "Bu sayfaya erişim yetkiniz yok.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      fetchDeletedShifts();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Admin rolü kontrol edilirken bir hata oluştu.",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  };

  const fetchDeletedShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('deleted_shifts')
        .select('*')
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      setDeletedShifts(data || []);

      // Fetch user profiles for seller and buyer names
      const userIds = [...new Set([
        ...data.map(shift => shift.seller_id),
        ...data.map(shift => shift.buyer_id).filter(Boolean),
        ...data.map(shift => shift.deleted_by)
      ])];

      const profilesMap: Record<string, Profile> = {};
      for (const userId of userIds) {
        if (userId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, user_id')
            .eq('user_id', userId)
            .single();
          
          if (profile) {
            profilesMap[userId] = profile;
          }
        }
      }
      setUserProfiles(profilesMap);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Silinen ilanlar yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentDelete = async (deletedShiftId: string) => {
    if (!confirm('Bu ilanı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('deleted_shifts')
        .delete()
        .eq('id', deletedShiftId);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "İlan kalıcı olarak silindi.",
      });

      fetchDeletedShifts();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "İlan kalıcı olarak silinirken bir hata oluştu.",
        variant: "destructive",
      });
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Silinen ilanlar yükleniyor...</p>
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
          <h1 className="text-2xl font-bold text-foreground">Silinen İlanlar (Admin)</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Silinen İlanlar ({deletedShifts.length})</h2>
          </div>
          <p className="text-muted-foreground">
            Bu sayfada silinen tüm ilanları görebilir ve kalıcı olarak silebilirsiniz.
          </p>
        </div>

        {deletedShifts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Henüz silinen ilan yok.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {deletedShifts.map((deletedShift) => (
              <Card key={deletedShift.id} className="border-orange-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4 text-orange-500" />
                        {deletedShift.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Orijinal ID: {deletedShift.original_shift_id}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      Silindi
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">İlan Bilgileri</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(deletedShift.shift_date)}</span>
                        </div>
                        
                        {deletedShift.shift_time && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(deletedShift.shift_time)}</span>
                          </div>
                        )}
                        
                        {deletedShift.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{deletedShift.location}</span>
                          </div>
                        )}
                        
                        <div className="text-lg font-semibold text-primary">
                          {deletedShift.price.toFixed(0)} TL
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Kullanıcı Bilgileri</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>
                            Satıcı: {userProfiles[deletedShift.seller_id]?.full_name || 'Bilinmeyen Kullanıcı'}
                          </span>
                        </div>
                        
                        {deletedShift.buyer_id && (
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            <span>
                              Alıcı: {userProfiles[deletedShift.buyer_id]?.full_name || 'Bilinmeyen Kullanıcı'}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Trash2 className="h-3 w-3" />
                          <span>
                            Silen: {userProfiles[deletedShift.deleted_by]?.full_name || 'Bilinmeyen Kullanıcı'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Silme Bilgileri</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Silme Tarihi:</span> {formatDateTime(deletedShift.deleted_at)}
                      </div>
                      {deletedShift.deletion_reason && (
                        <div>
                          <span className="font-medium">Silme Sebebi:</span> {deletedShift.deletion_reason}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Açıklama</h4>
                    <p className="text-sm text-muted-foreground">{deletedShift.description}</p>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Show full details in a modal or new page
                        alert(`İlan Detayları:\n\nBaşlık: ${deletedShift.title}\nAçıklama: ${deletedShift.description}\nFiyat: ${deletedShift.price} TL\nTarih: ${formatDate(deletedShift.shift_date)}\nSilme Sebebi: ${deletedShift.deletion_reason || 'Belirtilmemiş'}`);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Detayları Gör
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handlePermanentDelete(deletedShift.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Kalıcı Olarak Sil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDeletedShifts; 