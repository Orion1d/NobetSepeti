import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const CreateShift = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [shiftDate, setShiftDate] = useState('');
  const [shiftTime, setShiftTime] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    const today = new Date().toISOString().split('T')[0];
    if (shiftDate < today) {
      toast({
        title: "Hata",
        description: "Bugünden eski bir tarih seçemezsiniz.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (parseFloat(price) < 0) {
      toast({
        title: "Hata",
        description: "Fiyat negatif olamaz.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('shifts')
        .insert([
          {
            seller_id: user.id,
            title,
            description,
            price: parseFloat(price),
            shift_date: shiftDate,
            shift_time: shiftTime || null,
            duration: duration || null,
            location,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Nöbet teklifiniz oluşturuldu.",
      });

      navigate('/shift-offers');
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Nöbet teklifi oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-foreground">Nöbet Teklifi Oluştur</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Nöbet Detayları</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Nöbet Başlığı *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Örn: Acil Servisi Gece Nöbeti"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Nöbet detaylarını, koşullarını ve özel notlarınızı yazın..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Fiyat (TL) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    placeholder="1500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Hastane/Lokasyon</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Örn: Ankara Şehir Hastanesi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shiftDate">Nöbet Tarihi *</Label>
                  <Input
                    id="shiftDate"
                    type="date"
                    value={shiftDate}
                    onChange={(e) => setShiftDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shiftTime">Nöbet Başlangıç Saati</Label>
                  <Input
                    id="shiftTime"
                    type="time"
                    value={shiftTime}
                    onChange={(e) => setShiftTime(e.target.value)}
                    placeholder="20:00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Nöbet Süresi</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nöbet süresini seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gece 12'ye kadar.">Gece 12'ye kadar.</SelectItem>
                    <SelectItem value="24 Saat">24 Saat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                size="lg"
              >
                {loading ? 'Oluşturuluyor...' : 'Nöbet Teklifini Yayınla'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateShift;