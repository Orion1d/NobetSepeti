import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Clock, User, Package, ShoppingCart, TrendingUp, Eye, MessageCircle, Filter } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'sale' | 'purchase';
  shift: {
    id: string;
    title: string;
    price: number;
    shift_date: string;
    shift_time: string | null;
    medical_field: string | null;
    status: string;
    created_at: string;
  };
  partner: {
    full_name: string;
    user_id: string;
  };
  transaction_date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

const MarketHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sales' | 'purchases'>('all');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Fetch all shifts where user is involved (either as buyer or seller)
      const { data: allShifts, error: allShiftsError } = await supabase
        .from('shifts')
        .select('*')
        .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (allShiftsError) {
        throw allShiftsError;
      }

      // Separate shifts where user is buyer vs seller
      const purchasedShifts = allShifts?.filter(shift => shift.buyer_id === user.id) || [];
      const soldShifts = allShifts?.filter(shift => shift.seller_id === user.id && shift.buyer_id !== null) || [];

      // Get unique user IDs for profile lookups
      const buyerIds = [...new Set(purchasedShifts.map(shift => shift.seller_id))];
      const sellerIds = [...new Set(soldShifts.map(shift => shift.buyer_id))];

      // Fetch profiles for buyers and sellers
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', [...buyerIds, ...sellerIds]);

      if (profilesError) {
        throw profilesError;
      }

      // Create a map for quick profile lookups
      const profileMap = new Map(profiles?.map(profile => [profile.user_id, profile.full_name]) || []);

      // Format transactions
      const purchaseTransactions: Transaction[] = purchasedShifts.map(shift => ({
        id: shift.id,
        type: 'purchase' as const,
        shift: {
          id: shift.id,
          title: shift.title,
          price: shift.price,
          shift_date: shift.shift_date,
          shift_time: shift.shift_time,
          medical_field: shift.medical_field,
          status: shift.status,
          created_at: shift.created_at
        },
        partner: {
          full_name: profileMap.get(shift.seller_id) || 'Bilinmeyen',
          user_id: shift.seller_id
        },
        transaction_date: shift.created_at,
        status: shift.status === 'completed' ? 'completed' : 
                shift.status === 'cancelled' ? 'cancelled' : 'pending'
      }));

      const saleTransactions: Transaction[] = soldShifts.map(shift => ({
        id: shift.id,
        type: 'sale' as const,
        shift: {
          id: shift.id,
          title: shift.title,
          price: shift.price,
          shift_date: shift.shift_date,
          shift_time: shift.shift_time,
          medical_field: shift.medical_field,
          status: shift.status,
          created_at: shift.created_at
        },
        partner: {
          full_name: profileMap.get(shift.buyer_id!) || 'Bilinmeyen',
          user_id: shift.buyer_id!
        },
        transaction_date: shift.created_at,
        status: shift.status === 'completed' ? 'completed' : 
                shift.status === 'cancelled' ? 'cancelled' : 'pending'
      }));

      const allTransactions = [...purchaseTransactions, ...saleTransactions].sort((a, b) => 
        new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      );

      setTransactions(allTransactions);
    } catch (error: any) {
      console.error('Error in fetchTransactions:', error);
      toast({
        title: "Hata",
        description: "İşlem geçmişi yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Tamamlandı</Badge>;
      case 'pending':
        return <Badge variant="secondary">Beklemede</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">İptal Edildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: 'sale' | 'purchase') => {
    return type === 'sale' 
      ? <Badge variant="default" className="bg-green-100 text-green-800">Satış</Badge>
      : <Badge variant="outline" className="bg-blue-100 text-blue-800">Alım</Badge>;
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const totalSales = transactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.shift.price, 0);
  const totalPurchases = transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.shift.price, 0);
  const netProfit = totalSales - totalPurchases;

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
            <h1 className="text-2xl font-bold text-foreground">İşlem Geçmişi</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Toplam Satış</p>
                      <p className="text-2xl font-bold text-green-600">{totalSales} ₺</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Toplam Alım</p>
                      <p className="text-2xl font-bold text-blue-600">{totalPurchases} ₺</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Net Kazanç</p>
                      <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {netProfit} ₺
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Toplam İşlem</p>
                      <p className="text-2xl font-bold">{transactions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Tabs */}
            <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Tüm İşlemler</TabsTrigger>
                <TabsTrigger value="sales">Satışlarım</TabsTrigger>
                <TabsTrigger value="purchases">Alımlarım</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>İşlem Geçmişi ({filteredTransactions.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredTransactions.length === 0 ? (
                      <div className="text-center py-8">
                        <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                          Henüz işlem geçmişiniz bulunmuyor.
                        </p>
                        <Button onClick={() => navigate('/shift-offers')}>
                          Nöbet Tekliflerini Gör
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>İşlem</TableHead>
                              <TableHead>Nöbet</TableHead>
                              <TableHead>Karşı Taraf</TableHead>
                              <TableHead>Tarih</TableHead>
                              <TableHead>Durum</TableHead>
                              <TableHead className="text-right">Fiyat</TableHead>
                              <TableHead className="text-right">İşlemler</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredTransactions.map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getTypeBadge(transaction.type)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="max-w-xs">
                                    <p className="font-medium truncate">{transaction.shift.title}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(transaction.shift.shift_date)}</span>
                                      {transaction.shift.shift_time && (
                                        <>
                                          <Clock className="h-3 w-3" />
                                          <span>{formatTime(transaction.shift.shift_time)}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="truncate max-w-32">{transaction.partner.full_name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm text-muted-foreground">
                                    {formatDate(transaction.transaction_date)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(transaction.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className={`font-semibold ${
                                    transaction.type === 'sale' ? 'text-green-600' : 'text-blue-600'
                                  }`}>
                                    {transaction.type === 'sale' ? '+' : '-'}{transaction.shift.price} ₺
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex gap-2 justify-end">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => navigate(`/shift/${transaction.shift.id}`)}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => navigate('/messages')}
                                    >
                                      <MessageCircle className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sales" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Satışlarım ({transactions.filter(t => t.type === 'sale').length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transactions.filter(t => t.type === 'sale').length === 0 ? (
                      <div className="text-center py-8">
                        <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                          Henüz satış yapmadınız.
                        </p>
                        <Button onClick={() => navigate('/create-shift')}>
                          İlan Oluştur
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>İşlem</TableHead>
                              <TableHead>Nöbet</TableHead>
                              <TableHead>Karşı Taraf</TableHead>
                              <TableHead>Tarih</TableHead>
                              <TableHead>Durum</TableHead>
                              <TableHead className="text-right">Fiyat</TableHead>
                              <TableHead className="text-right">İşlemler</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactions.filter(t => t.type === 'sale').map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getTypeBadge(transaction.type)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="max-w-xs">
                                    <p className="font-medium truncate">{transaction.shift.title}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(transaction.shift.shift_date)}</span>
                                      {transaction.shift.shift_time && (
                                        <>
                                          <Clock className="h-3 w-3" />
                                          <span>{formatTime(transaction.shift.shift_time)}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="truncate max-w-32">{transaction.partner.full_name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm text-muted-foreground">
                                    {formatDate(transaction.transaction_date)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(transaction.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className="font-semibold text-green-600">
                                    +{transaction.shift.price} ₺
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex gap-2 justify-end">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => navigate(`/shift/${transaction.shift.id}`)}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => navigate('/messages')}
                                    >
                                      <MessageCircle className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="purchases" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Alımlarım ({transactions.filter(t => t.type === 'purchase').length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transactions.filter(t => t.type === 'purchase').length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                          Henüz alım yapmadınız.
                        </p>
                        <Button onClick={() => navigate('/shift-offers')}>
                          Nöbet Tekliflerini Gör
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>İşlem</TableHead>
                              <TableHead>Nöbet</TableHead>
                              <TableHead>Karşı Taraf</TableHead>
                              <TableHead>Tarih</TableHead>
                              <TableHead>Durum</TableHead>
                              <TableHead className="text-right">Fiyat</TableHead>
                              <TableHead className="text-right">İşlemler</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactions.filter(t => t.type === 'purchase').map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getTypeBadge(transaction.type)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="max-w-xs">
                                    <p className="font-medium truncate">{transaction.shift.title}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(transaction.shift.shift_date)}</span>
                                      {transaction.shift.shift_time && (
                                        <>
                                          <Clock className="h-3 w-3" />
                                          <span>{formatTime(transaction.shift.shift_time)}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="truncate max-w-32">{transaction.partner.full_name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm text-muted-foreground">
                                    {formatDate(transaction.transaction_date)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(transaction.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className="font-semibold text-blue-600">
                                    -{transaction.shift.price} ₺
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex gap-2 justify-end">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => navigate(`/shift/${transaction.shift.id}`)}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => navigate('/messages')}
                                    >
                                      <MessageCircle className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
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

export default MarketHistory; 