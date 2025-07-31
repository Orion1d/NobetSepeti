import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { MedicalFieldIcon, fieldIconMap } from '@/components/MedicalFieldIcon';

// Tıp alanları ve renkleri
            const medicalFields = [
              { value: 'acil1', label: 'Acil Dahiliye', color: '#e53935' },
              { value: 'acil2', label: 'Acil Cerrahi', color: '#d32f2f' },
              { value: 'acil3', label: 'Acil Pediatri', color: '#ff7043' },
              { value: 'kardiyoloji', label: 'Kardiyoloji', color: '#c2185b' },
              { value: 'psikyatri', label: 'Psikiyatri', color: '#8e24aa' },
              { value: 'gogus', label: 'Göğüs Hastalıkları', color: '#1976d2' },
              { value: 'kadin', label: 'Kadın ve Doğum Hastalıkları', color: '#f06292' },
              { value: 'ortodonti', label: 'Ortopedi ve Travmatoloji', color: '#00897b' },
              { value: 'dahiliye', label: 'Dahiliye', color: '#43a047' },
              { value: 'pediatri', label: 'Pediatri', color: '#fbc02d' },
              { value: 'genel', label: 'Genel Cerrahi', color: '#ffa000' },
            ];

const CreateShift = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [shiftDate, setShiftDate] = useState('');
  const [shiftTime, setShiftTime] = useState('');
  const [duration, setDuration] = useState('');
  const [medicalField, setMedicalField] = useState('');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [shiftId, setShiftId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location_obj = useLocation();
  const { toast } = useToast();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if we're in edit mode
  useEffect(() => {
    if (location_obj.state?.editMode && location_obj.state?.shiftData) {
      const shiftData = location_obj.state.shiftData;
      setEditMode(true);
      setShiftId(shiftData.id);
      setTitle(shiftData.title);
      setDescription(shiftData.description);
      setPrice(shiftData.price.toString());
      setShiftDate(shiftData.shift_date);
      setShiftTime(shiftData.shift_time || '');
      setDuration(shiftData.duration || '');
      setMedicalField(shiftData.medical_field || '');
    }
  }, [location_obj.state]);

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

    if (!price || parseFloat(price) <= 0) {
      toast({
        title: "Hata",
        description: "Geçerli bir fiyat girmelisiniz.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Fiyatın tam sayı olduğunu kontrol et
    if (!Number.isInteger(parseFloat(price))) {
      toast({
        title: "Hata",
        description: "Fiyat tam sayı olmalıdır (kuruş kısmı olmamalı).",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Maksimum fiyat kontrolü
    if (parseFloat(price) > 10000) {
      toast({
        title: "Hata",
        description: "Fiyat maksimum 10.000 TL olabilir.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      if (editMode && shiftId) {
        // Update existing shift
        const { error } = await supabase
          .from('shifts')
          .update({
            title,
            description,
            price: parseInt(price),
            shift_date: shiftDate,
            shift_time: shiftTime,
            duration: duration,
            medical_field: medicalField,
          })
          .eq('id', shiftId)
          .eq('seller_id', user.id);

        if (error) throw error;

        toast({
          title: "Başarılı!",
          description: "Nöbet ilanınız güncellendi.",
        });
      } else {
        // Create new shift
        const { error } = await supabase
          .from('shifts')
          .insert([
            {
              seller_id: user.id,
              title,
              description,
              price: parseInt(price),
              shift_date: shiftDate,
              shift_time: shiftTime,
              duration: duration,
              medical_field: medicalField,
            }
          ]);

        if (error) throw error;

        toast({
          title: "Başarılı!",
          description: "Nöbet ilanınız oluşturuldu.",
        });
      }

      navigate('/profile');
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Nöbet ilanı işlemi sırasında bir hata oluştu.",
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
          <h1 className="text-2xl font-bold text-foreground">
            {editMode ? 'Nöbet İlanını Düzenle' : 'Nöbet İlanı Oluştur'}
          </h1>
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
                            <Label htmlFor="title">İlan Başlığı * (Maksimum 30 karakter)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                if (e.target.value.length <= 30) {
                  setTitle(e.target.value);
                }
              }}
              required
              placeholder="Örn: Acil Servisi Nöbeti"
              maxLength={30}
            />
            <div className="text-xs text-muted-foreground text-right">
              {title.length}/30
            </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama * (Maksimum 100 karakter)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => {
                    if (e.target.value.length <= 100) {
                      setDescription(e.target.value);
                    }
                  }}
                  required
                  placeholder="Nöbetinizle ilgili detayları belirtiniz. Konum, nöbetin başlangıç ve bitiş saatleri, dikkat edilmesi gereken şeyler, vb."
                  rows={4}
                  maxLength={100}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {description.length}/100
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Fiyat (TL) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  max="10000"
                  step="1"
                  value={price}
                  onChange={(e) => {
                    // Sadece tam sayıları kabul et ve maksimum 10000
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) {
                      const numValue = parseInt(value) || 0;
                      if (numValue <= 10000) {
                        setPrice(value);
                      }
                    }
                  }}
                  required
                  placeholder="1500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shiftDate">Nöbet Tarihi * (Maksimum 1 ay sonra)</Label>
                  <Input
                    id="shiftDate"
                    type="date"
                    value={shiftDate}
                    onChange={(e) => setShiftDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shiftTime">Nöbet Başlangıç Saati *</Label>
                  <Input
                    id="shiftTime"
                    type="time"
                    value={shiftTime}
                    onChange={(e) => setShiftTime(e.target.value)}
                    required
                    placeholder="20:00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medicalField">Tıp Alanı *</Label>
                  <Select value={medicalField} onValueChange={setMedicalField} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Tıp alanını seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicalFields.map((field) => {
                        return (
                          <SelectItem key={field.value} value={field.value}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: field.color }}></div>
                              <MedicalFieldIcon field={field.value} variant="black" />
                              <span className="whitespace-nowrap">{field.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Nöbet Süresi *</Label>
                  <Select value={duration} onValueChange={setDuration} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Nöbet süresini seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yarım Gün">Yarım Gün</SelectItem>
                      <SelectItem value="Tam Gün">Tam Gün</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                size="lg"
              >
                {loading 
                  ? (editMode ? 'Güncelleniyor...' : 'Oluşturuluyor...') 
                  : (editMode ? 'Güncelle' : 'Nöbet İlanını Yayınla')
                }
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateShift;