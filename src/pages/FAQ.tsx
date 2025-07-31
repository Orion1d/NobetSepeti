import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQ = () => {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "Nöbet Sepeti nasıl çalışır?",
      answer: "Nöbet Sepeti, doktorların nöbetlerini güvenli bir şekilde takas edebilecekleri bir platformdur. Satıcılar nöbetlerini listeler, alıcılar ise bu nöbetleri satın alabilir. Mesajlaşma sistemi ile detaylar belirlenir ve nöbet transferi gerçekleştirilir."
    },
    {
      id: 2,
      question: "Nöbet satışı için ne yapmam gerekiyor?",
      answer: "Nöbetinizi satmak için önce hesap oluşturmanız gerekiyor. Ardından 'Nöbetimi Satmak İstiyorum' bölümünden nöbet detaylarınızı girin. Fiyat, tarih, saat ve konum bilgilerini belirtin. Teklifiniz onaylandıktan sonra diğer doktorlar görebilecek."
    },
    {
      id: 3,
      question: "Nöbet satın almak güvenli mi?",
      answer: "Evet, platformumuz güvenli ödeme sistemi kullanır. Satın alma işlemi tamamlandıktan sonra satıcı ile mesajlaşarak detayları belirleyebilirsiniz. Tüm işlemler kayıt altına alınır ve güvenlik önlemleri uygulanır."
    },
    {
      id: 4,
      question: "Mesajlaşma sistemi nasıl çalışır?",
      answer: "Nöbet satın aldıktan sonra satıcı ile mesajlaşabilirsiniz. Mesajlaşma sistemi nöbet tarihinden 1 gün sonrasına kadar aktif kalır. Bu süre zarfında tüm detayları belirleyebilir ve iletişim kurabilirsiniz."
    },
    {
      id: 5,
      question: "Hangi ödeme yöntemleri kabul ediliyor?",
      answer: "Şu anda nakit transfer ve banka havalesi kabul ediyoruz. Güvenli ödeme sistemi ile işlemleriniz korunur. Gelecekte kredi kartı ve diğer ödeme yöntemleri de eklenecektir."
    },
    {
      id: 6,
      question: "Hesabımı nasıl silebilirim?",
      answer: "Hesabınızı silmek için profil sayfanızdan 'Hesabı Sil' seçeneğini kullanabilirsiniz. Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinir."
    },
    {
      id: 7,
      question: "Teknik sorun yaşıyorum, ne yapmalıyım?",
      answer: "Teknik sorunlar için iletişim sayfamızdan bize ulaşabilirsiniz. Sorununuzu detaylı bir şekilde açıklayın, en kısa sürede size yardımcı olacağız."
    },
    {
      id: 8,
      question: "Nöbet iptal edebilir miyim?",
      answer: "Evet, nöbetinizi satışa çıkardıktan sonra henüz satılmadıysa iptal edebilirsiniz. Profil sayfanızdan nöbetinizi düzenleyebilir veya silebilirsiniz."
    }
  ];

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

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
            Geri
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Sık Sorulan Sorular</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Sık Sorulan Sorular</h2>
            <p className="text-muted-foreground">
              Nöbet Sepeti hakkında merak ettikleriniz
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{item.question}</CardTitle>
                    {openItems.includes(item.id) ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                {openItems.includes(item.id) && (
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Başka sorunuz mu var?</h3>
              <p className="text-muted-foreground mb-4">
                Burada bulamadığınız sorularınız için bizimle iletişime geçin.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => window.open('mailto:info@nobetsepeti.com', '_blank')}>
                  E-posta Gönder
                </Button>
                <Button variant="outline" onClick={() => window.open('https://t.me/nobetsepeti', '_blank')}>
                  Telegram Grubu
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQ; 