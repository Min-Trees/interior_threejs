import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, RefreshCw, ShoppingBag, ExternalLink, Mic, MicOff, Calendar, Check, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const formatPrice = (amount) => {
  if (!amount) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

const SUGGESTIONS = [
  "Tư vấn sofa da Ý cho phòng khách hiện đại",
  "Tìm bàn ăn gỗ óc chó cho gia đình 6 người",
  "Nội thất phòng ngủ tầm giá 20-25 triệu",
  "Bàn làm việc thông minh nâng hạ điện tử",
];

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('phuquy_chat_session') || null);
  const [isListening, setIsListening] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Appointment Form state
  const { user } = useAuth();
  const [appointForm, setAppointForm] = useState({
    customerName: '',
    phone: '',
    appointmentDate: '',
    appointmentTime: 'Sáng (9h - 11h30)',
    note: '',
  });
  const [appointSuccess, setAppointSuccess] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const { addToCart } = useCart();

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Set default appointment form when user changes
  useEffect(() => {
    if (user) {
      setAppointForm((prev) => ({
        ...prev,
        customerName: user.fullName || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  // Setup Web Speech API for Voice Input
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'vi-VN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage((prev) => (prev ? prev + ' ' + transcript : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói. Vui lòng thử Google Chrome hoặc Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ASSISTANT',
          content: 'Xin chào quý khách! Tôi là **Phú Quý AI** - Trợ lý tư vấn chuyên sâu về nội thất.\n\nTôi có thể giúp bạn tìm kiếm sofa, bàn ăn, giường ngủ, tủ kệ theo kích thước, chất liệu hoặc ngân sách dựa trên kho dữ liệu thực tế của showroom. Bạn có thể gõ phím hoặc **bấm nút Micro 🎙️ để nói trực tiếp** nhé!',
          suggestedProducts: [],
        },
      ]);
    }
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Streaming Message Handler via SSE & Multimodal Vision
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if ((!query && !selectedImage) || loading) return;

    const currentImg = selectedImage;
    const currentPreview = imagePreview;
    setSelectedImage(null);
    setImagePreview(null);

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'USER',
      content: query || 'Tư vấn phong cách nội thất cho bức ảnh căn phòng này',
      image: currentPreview,
    };

    // Placeholder for assistant stream message
    const botMsgId = Date.now() + 1;
    const initialBotMsg = {
      id: botMsgId,
      sender: 'ASSISTANT',
      content: currentImg ? '📸 Đang phân tích màu sắc, ánh sáng và phong cách căn phòng của bạn...' : '',
      suggestedProducts: [],
    };

    setMessages((prev) => [...prev, userMsg, initialBotMsg]);
    setInputMessage('');
    setLoading(true);

    // Nếu có hình ảnh, gọi API Multimodal Vision
    if (currentImg) {
      try {
        const res = await api.post('/chat/message', {
          sessionId: sessionId,
          message: query || 'Hãy phân tích hình ảnh phòng khách này và tư vấn đồ nội thất phù hợp từ showroom Phú Quý',
          imageBase64: currentImg,
        });

        if (res.data) {
          if (res.data.sessionId && res.data.sessionId !== sessionId) {
            setSessionId(res.data.sessionId);
            localStorage.setItem('phuquy_chat_session', res.data.sessionId);
          }
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMsgId
                ? {
                    ...msg,
                    content: res.data.reply,
                    suggestedProducts: res.data.suggestedProducts || [],
                  }
                : msg
            )
          );
        }
      } catch (err) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId ? { ...msg, content: 'Đã xảy ra lỗi khi phân tích ảnh: ' + err.message } : msg
          )
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const token = localStorage.getItem('phuquy_token');
      const response = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sessionId: sessionId,
          message: query,
        }),
      });

      if (!response.ok) {
        throw new Error('Streaming connection failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = 'message';
        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.replace('event:', '').trim();
          } else if (line.startsWith('data:')) {
            const dataStr = line.replace('data:', '').trim();

            if (currentEvent === 'meta') {
              try {
                const meta = JSON.parse(dataStr);
                if (meta.sessionId && meta.sessionId !== sessionId) {
                  setSessionId(meta.sessionId);
                  localStorage.setItem('phuquy_chat_session', meta.sessionId);
                }
                if (meta.products) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMsgId ? { ...msg, suggestedProducts: meta.products } : msg
                    )
                  );
                }
              } catch (e) {
                console.error('Error parsing SSE meta:', e);
              }
            } else if (currentEvent === 'token') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === botMsgId ? { ...msg, content: msg.content + dataStr } : msg
                )
              );
            } else if (currentEvent === 'done' || dataStr === '[DONE]') {
              setLoading(false);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Falling back to standard message API:', err);
      try {
        const res = await api.post('/chat/message', {
          sessionId: sessionId,
          message: query,
        });
        if (res.success && res.data) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMsgId
                ? {
                    ...msg,
                    content: res.data.reply,
                    suggestedProducts: res.data.suggestedProducts || [],
                  }
                : msg
            )
          );
        }
      } catch (fallbackErr) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId
              ? {
                  ...msg,
                  content: 'Xin lỗi bạn, dịch vụ tư vấn AI đang bảo trì kết nối. Bạn vui lòng thử lại sau giây lát!',
                }
              : msg
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    localStorage.removeItem('phuquy_chat_session');
    setSessionId(null);
    setMessages([
      {
        id: 'welcome-new',
        sender: 'ASSISTANT',
        content: 'Chào bạn! Phiên trò chuyện mới đã bắt đầu. Hãy cho Phú Quý biết yêu cầu nội thất của bạn nhé!',
        suggestedProducts: [],
      },
    ]);
  };

  const handleQuickAdd = async (productId) => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }
    try {
      await addToCart(productId, 1);
      alert('Đã thêm sản phẩm vào giỏ hàng thành công!');
    } catch (err) {
      alert(err.message);
    }
  };

  // Submit Showroom Appointment
  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!appointForm.customerName || !appointForm.phone || !appointForm.appointmentDate) {
      alert('Vui lòng điền đầy đủ họ tên, số điện thoại và ngày hẹn');
      return;
    }
    try {
      await api.post('/appointments', appointForm);
      setAppointSuccess(true);
      setTimeout(() => {
        setAppointSuccess(false);
        setAppointmentModalOpen(false);
        // Append confirmation card into chat
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: 'ASSISTANT',
            content: `🎉 **ĐẶT HẸN SHOWROOM THÀNH CÔNG!**\n\nCảm ơn **${appointForm.customerName}**! Showroom Nội thất Phú Quý (88 Xa Lộ Hà Nội, TP. Thủ Đức) đã ghi nhận lịch hẹn trải nghiệm của bạn vào ngày **${appointForm.appointmentDate} (${appointForm.appointmentTime})**.\n\nChuyên viên tư vấn sẽ chuẩn bị đón tiếp chu đáo nhất!`,
            suggestedProducts: [],
          },
        ]);
      }, 1500);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-lg border border-brand-200 text-xs font-semibold text-stone-700 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Tư vấn AI RAG trực tuyến
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="ai-glow-btn w-14 h-14 rounded-full bg-gradient-to-tr from-brand-700 via-brand-600 to-amber-500 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
            title="Mở chatbot tư vấn AI"
          >
            <Bot className="w-7 h-7" />
          </button>
        </div>
      )}

      {/* Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[430px] h-[620px] max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-900 via-stone-900 to-brand-950 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-400/40 flex items-center justify-center text-amber-300">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-stone-900 rounded-full" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                  Phú Quý AI
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-normal">
                    Streaming RAG
                  </span>
                </h4>
                <p className="text-[11px] text-stone-300">Tư vấn viên nội thất thông minh 24/7</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Showroom appointment trigger */}
              <button
                onClick={() => setAppointmentModalOpen(true)}
                className="p-1.5 text-amber-300 hover:text-amber-200 rounded-lg hover:bg-white/10 transition flex items-center gap-1 text-[11px] font-semibold"
                title="Đặt lịch hẹn xem trực tiếp tại showroom"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hẹn Showroom</span>
              </button>
              <button
                onClick={resetChat}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                title="Bắt đầu phiên mới"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/70 text-xs sm:text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.sender === 'USER'
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-white text-stone-800 border border-stone-200/80 rounded-tl-none'
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Ảnh phòng khách"
                      className="w-48 h-36 object-cover rounded-xl mb-2 border border-white/30 shadow"
                    />
                  )}
                  {msg.content ? (
                    <div className="prose prose-stone prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 text-xs sm:text-sm">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 py-1 text-stone-400">
                      <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce delay-100" />
                      <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce delay-200" />
                    </div>
                  )}
                </div>

                {/* Suggested Products Cards (RAG) */}
                {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                  <div className="w-full mt-2.5 space-y-2">
                    <p className="text-[11px] font-bold text-brand-800 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Sản phẩm được gợi ý:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.suggestedProducts.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white p-2.5 rounded-xl border border-brand-200/80 flex items-center gap-3 hover:shadow-md transition"
                        >
                          <img
                            src={p.thumbnail || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80'}
                            alt={p.name}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-xs text-stone-900 truncate">{p.name}</h5>
                            <p className="text-[11px] text-stone-500 truncate">{p.material || p.dimensions}</p>
                            <div className="text-xs font-extrabold text-brand-700 mt-0.5">
                              {formatPrice(p.discountPrice || p.price)}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            <Link
                              to={`/products/${p.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition text-center"
                              title="Xem chi tiết"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleQuickAdd(p.id)}
                              className="p-1.5 bg-brand-50 hover:bg-brand-600 hover:text-white text-brand-700 rounded-lg transition text-center"
                              title="Thêm vào giỏ"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-3 py-2 bg-white border-t border-stone-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item)}
                className="whitespace-nowrap text-[11px] bg-stone-100 hover:bg-brand-50 hover:text-brand-700 text-stone-600 px-2.5 py-1 rounded-full border border-stone-200 transition flex-shrink-0"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Voice status banner if listening */}
          {isListening && (
            <div className="px-4 py-1.5 bg-red-50 text-red-600 text-[11px] font-semibold flex items-center justify-between border-t border-red-200 animate-pulse">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                Đang lắng nghe giọng nói tiếng Việt... Hãy nói yêu cầu của bạn!
              </span>
              <button onClick={toggleVoiceInput} className="text-red-800 font-bold underline">
                Dừng
              </button>
            </div>
          )}

          {/* Image attachment preview */}
          {imagePreview && (
            <div className="px-3 py-1.5 bg-amber-50 border-t border-amber-200 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <img
                  src={imagePreview}
                  alt="Ảnh đính kèm"
                  className="w-10 h-10 rounded-lg object-cover border border-amber-300 shadow-sm"
                />
                <div className="text-[11px] text-amber-900 leading-tight">
                  <p className="font-bold">Ảnh không gian phòng</p>
                  <p className="text-[10px] text-amber-700">AI sẽ phân tích bố cục & đề xuất nội thất</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="w-6 h-6 rounded-full bg-amber-200/80 hover:bg-red-500 hover:text-white text-stone-700 flex items-center justify-center text-xs transition"
                title="Hủy ảnh"
              >
                ✕
              </button>
            </div>
          )}

          {/* Input Form with Vision, Voice & Send */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={imagePreview ? "Hỏi thêm về ảnh hoặc bấm gửi để AI phân tích..." : "Nhập câu hỏi, tải ảnh hoặc bấm micro..."}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 bg-stone-100 border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
            />

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            {/* Image Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-full bg-stone-100 hover:bg-amber-100 hover:text-amber-800 text-stone-600 flex items-center justify-center transition flex-shrink-0"
              title="Tải ảnh phòng khách để AI tư vấn phối màu & nội thất"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition flex-shrink-0 ${
                isListening
                  ? 'bg-red-600 text-white shadow-lg animate-bounce'
                  : 'bg-stone-100 text-stone-600 hover:bg-brand-100 hover:text-brand-700'
              }`}
              title={isListening ? 'Đang nghe... Bấm để tắt' : 'Bấm để nói bằng giọng nói'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || (!inputMessage.trim() && !imagePreview)}
              className="w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white flex items-center justify-center shadow transition flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Appointment Booking Modal Inside Widget */}
          {appointmentModalOpen && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full p-5 space-y-4 animate-in fade-in zoom-in-95 shadow-2xl">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-sm text-stone-900 font-serif flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-brand-600" /> Đặt Hẹn Xem Showroom
                  </h3>
                  <button onClick={() => setAppointmentModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {appointSuccess ? (
                  <div className="text-center py-6 space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-sm text-stone-900">Đặt Lịch Hẹn Thành Công!</h4>
                    <p className="text-xs text-stone-500">Chuyên viên Phú Quý sẽ gọi điện xác nhận trong 10 phút.</p>
                  </div>
                ) : (
                  <form onSubmit={handleAppointmentSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="font-semibold text-stone-700 block mb-0.5">Họ và tên *</label>
                      <input
                        type="text"
                        required
                        value={appointForm.customerName}
                        onChange={(e) => setAppointForm({ ...appointForm, customerName: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-stone-700 block mb-0.5">Số điện thoại *</label>
                      <input
                        type="tel"
                        required
                        value={appointForm.phone}
                        onChange={(e) => setAppointForm({ ...appointForm, phone: e.target.value })}
                        placeholder="0909..."
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-stone-700 block mb-0.5">Ngày hẹn *</label>
                        <input
                          type="date"
                          required
                          value={appointForm.appointmentDate}
                          onChange={(e) => setAppointForm({ ...appointForm, appointmentDate: e.target.value })}
                          className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-stone-700 block mb-0.5">Khung giờ</label>
                        <select
                          value={appointForm.appointmentTime}
                          onChange={(e) => setAppointForm({ ...appointForm, appointmentTime: e.target.value })}
                          className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-[11px]"
                        >
                          <option value="Sáng (9h - 11h30)">Sáng (9h - 11h30)</option>
                          <option value="Chiều (14h - 17h)">Chiều (14h - 17h)</option>
                          <option value="Tối (18h - 20h)">Tối (18h - 20h)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-stone-700 block mb-0.5">Ghi chú (Mẫu muốn xem)</label>
                      <input
                        type="text"
                        value={appointForm.note}
                        onChange={(e) => setAppointForm({ ...appointForm, note: e.target.value })}
                        placeholder="Ví dụ: Muốn xem mẫu sofa da bò Ý Florence"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setAppointmentModalOpen(false)}
                        className="px-3 py-2 rounded-xl bg-stone-100 text-stone-600 font-bold"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow"
                      >
                        Xác Nhận Hẹn
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
