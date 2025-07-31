import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri Dön
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Kullanıcı Sözleşmesi</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">Nöbet Sepeti Kullanıcı Sözleşmesi</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-lg font-semibold mb-3">1. Genel Hükümler</h2>
                        <p className="text-muted-foreground mb-4">
          Bu kullanıcı sözleşmesi ("Sözleşme"), Nöbet Sepeti platformunu ("Platform") kullanarak
          nöbet alım-satım işlemleri yapmak isteyen internler ile platform arasındaki hak ve
          yükümlülükleri düzenler.
        </p>
        <p className="text-muted-foreground">
          Platformu kullanarak, bu sözleşmenin tüm şartlarını kabul etmiş sayılırsınız.
        </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">2. Hizmet Tanımı</h2>
                <p className="text-muted-foreground mb-4">
                  Nöbet Sepeti, tıp fakültesi öğrencileri ve internler arasında nöbet alım-satım işlemlerini 
                  kolaylaştırmak amacıyla kurulmuş bir platformdur.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Platform, nöbet tekliflerinin yayınlanmasını sağlar</li>
                  <li>Kullanıcılar arasında mesajlaşma imkanı sunar</li>
                  <li>Nöbet durumlarının takibini kolaylaştırır</li>
                  <li>Güvenli ödeme süreçleri yönetir</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">3. Kullanıcı Yükümlülükleri</h2>
                <p className="text-muted-foreground mb-4">
                  Platformu kullanırken aşağıdaki kurallara uymayı kabul edersiniz:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Doğru ve güncel bilgiler sağlamak</li>
                  <li>Platformu yasal amaçlar için kullanmak</li>
                  <li>Diğer kullanıcıların haklarına saygı göstermek</li>
                  <li>Platform güvenliğini tehlikeye atmamak</li>
                  <li>Spam veya zararlı içerik paylaşmamak</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">4. Nöbet Alım-Satım Kuralları</h2>
                <p className="text-muted-foreground mb-4">
                  Nöbet işlemleri sırasında uyulması gereken kurallar:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Nöbet bilgileri doğru ve eksiksiz olmalıdır</li>
                  <li>Fiyat belirleme serbesttir ancak makul olmalıdır</li>
                  <li>Anlaşma sonrası sözleşilen şartlara uyulmalıdır</li>
                  <li>İptal durumlarında karşı tarafa bilgi verilmelidir</li>
                  <li>Mesajlaşma kurallarına uyulmalıdır</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">5. Ödeme ve Komisyon</h2>
                <p className="text-muted-foreground mb-4">
                  Platform üzerinden yapılan işlemlerde:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Platform komisyonu %5 olarak belirlenmiştir</li>
                  <li>Ödemeler güvenli ödeme sistemleri üzerinden yapılır</li>
                  <li>Komisyon işlem sonunda otomatik olarak kesilir</li>
                  <li>İptal durumlarında komisyon iadesi yapılır</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">6. Gizlilik ve Veri Güvenliği</h2>
                <p className="text-muted-foreground mb-4">
                  Kişisel verilerinizin korunması için:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Verileriniz KVKK uyumlu olarak işlenir</li>
                  <li>Üçüncü taraflarla paylaşılmaz</li>
                  <li>Güvenli sunucularda saklanır</li>
                  <li>Şifreleme ile korunur</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">7. Sorumluluk Sınırları</h2>
                <p className="text-muted-foreground mb-4">
                  Platform, kullanıcılar arasındaki anlaşmazlıklardan sorumlu değildir. 
                  Kullanıcılar kendi aralarında çözüm bulmakla yükümlüdür.
                </p>
                <p className="text-muted-foreground">
                  Platform, teknik aksaklıklar nedeniyle oluşabilecek zararlardan sorumlu değildir.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">8. Hesap Askıya Alma ve Kapatma</h2>
                <p className="text-muted-foreground mb-4">
                  Aşağıdaki durumlarda hesabınız askıya alınabilir veya kapatılabilir:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Sözleşme ihlali</li>
                  <li>Yanlış bilgi verilmesi</li>
                  <li>Platform kurallarının ihlali</li>
                  <li>Diğer kullanıcıların şikayetleri</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">9. Sözleşme Değişiklikleri</h2>
                <p className="text-muted-foreground">
                  Bu sözleşme, önceden haber verilmeksizin değiştirilebilir. 
                  Değişiklikler platform üzerinden duyurulur ve kullanıma devam etmek 
                  değişiklikleri kabul etmek anlamına gelir.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">10. İletişim</h2>
                <p className="text-muted-foreground">
                  Sorularınız için: <a href="mailto:nobetsepeti@gmail.com" className="text-primary hover:underline">nobetsepeti@gmail.com</a>
                </p>
              </section>

              <div className="border-t pt-6 mt-8">
                <p className="text-sm text-muted-foreground text-center">
                  Bu sözleşmeyi okuyarak ve kabul ederek, tüm şartları anladığınızı ve 
                  kabul ettiğinizi beyan edersiniz.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TermsOfService; 