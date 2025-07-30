import { useEffect, useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, MessageCircle, Calendar, Clock, MapPin, User, CheckCircle, XCircle } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  shift_id: string;
  read_at: string | null;
}

interface Shift {
  id: string;
  title: string;
  shift_date: string;
  shift_time: string | null;
  location: string | null;
  seller_id: string;
  buyer_id: string | null;
  status: string;
}

interface ChatPartner {
  id: string;
  full_name: string;
  user_id: string;
}

const Messages = () => {
  const [conversations, setConversations] = useState<Array<{
    shift: Shift;
    partner: ChatPartner;
    lastMessage?: Message;
    unreadCount: number;
  }>>([]);
  const [selectedConversation, setSelectedConversation] = useState<{
    shift: Shift;
    partner: ChatPartner;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.shift.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      // Get shifts where user is either buyer or seller
      const { data: shifts, error: shiftsError } = await supabase
        .from('shifts')
        .select('*')
        .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (shiftsError) throw shiftsError;

      const conversationsData = [];

      for (const shift of shifts || []) {
        // Get the other person in the conversation
        const partnerId = shift.seller_id === user.id ? shift.buyer_id : shift.seller_id;
        
        if (!partnerId) continue; // Skip if no buyer yet

        // Get partner's profile
        const { data: partnerProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', partnerId)
          .single();

        if (!partnerProfile) continue;

        // Get last message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('shift_id', shift.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get unread count
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('shift_id', shift.id)
          .eq('receiver_id', user.id)
          .is('read_at', null);

        conversationsData.push({
          shift,
          partner: {
            id: partnerProfile.id,
            full_name: partnerProfile.full_name || 'Unknown User',
            user_id: partnerProfile.user_id,
          },
          lastMessage,
          unreadCount: unreadCount || 0,
        });
      }

      setConversations(conversationsData);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Konuşmalar yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (shiftId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('shift_id', shiftId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('shift_id', shiftId)
        .eq('receiver_id', user.id)
        .is('read_at', null);

      // Refresh conversations to update unread count
      fetchConversations();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Mesajlar yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    const shift = selectedConversation.shift;
    const partner = selectedConversation.partner;

    // Check if messaging is allowed (within 1 day after shift)
    const shiftDate = new Date(shift.shift_date);
    const oneDayAfter = new Date(shiftDate);
    oneDayAfter.setDate(oneDayAfter.getDate() + 1);
    const now = new Date();

    if (now > oneDayAfter) {
      toast({
        title: "Mesaj Gönderilemez",
        description: "Nöbet tarihinden 1 gün sonra mesaj gönderemezsiniz.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            content: newMessage.trim(),
            sender_id: user.id,
            receiver_id: partner.user_id,
            shift_id: shift.id,
          }
        ]);

      if (error) throw error;

      setNewMessage('');
      fetchMessages(shift.id);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Mesaj gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const canSendMessage = (shift: Shift) => {
    const shiftDate = new Date(shift.shift_date);
    const oneDayAfter = new Date(shiftDate);
    oneDayAfter.setDate(oneDayAfter.getDate() + 1);
    const now = new Date();
    return now <= oneDayAfter;
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

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Mesajlar yükleniyor...</p>
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
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri Dön
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Mesajlar</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1 border rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Konuşmalar</h2>
            </div>
            <div className="overflow-y-auto h-full">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Henüz konuşmanız yok</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.shift.id}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedConversation?.shift.id === conversation.shift.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedConversation({
                      shift: conversation.shift,
                      partner: conversation.partner,
                    })}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{conversation.partner.full_name}</h3>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      {conversation.shift.title}
                    </div>
                    
                    {conversation.lastMessage && (
                      <div className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage.content}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(conversation.shift.shift_date)}</span>
                      {conversation.shift.shift_time && (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(conversation.shift.shift_time)}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 border rounded-lg flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{selectedConversation.partner.full_name}</h3>
                      <div className="text-sm text-muted-foreground">
                        {selectedConversation.shift.title}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(selectedConversation.shift.shift_date)}</span>
                      </div>
                      {selectedConversation.shift.shift_time && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(selectedConversation.shift.shift_time)}</span>
                        </div>
                      )}
                      {selectedConversation.shift.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{selectedConversation.shift.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!canSendMessage(selectedConversation.shift) && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Bu nöbet için mesajlaşma süresi dolmuş. Mesajlar korunuyor ancak yeni mesaj gönderemezsiniz.
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === user.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div className={`text-xs mt-1 ${
                          message.sender_id === user.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {formatMessageTime(message.created_at)}
                          {message.read_at && message.sender_id === user.id && (
                            <CheckCircle className="h-3 w-3 inline ml-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={
                        canSendMessage(selectedConversation.shift)
                          ? "Mesajınızı yazın..."
                          : "Mesajlaşma süresi dolmuş"
                      }
                      disabled={!canSendMessage(selectedConversation.shift) || sending}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!canSendMessage(selectedConversation.shift) || sending || !newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Bir konuşma seçin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages; 