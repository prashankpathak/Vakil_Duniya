import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Volume2, VolumeX, Copy, Check, Mic, MicOff, Maximize2, Minimize2, Trash2, ArrowRight, ShieldCheck, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { useNavigationStore } from '../store';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_LEGAL_PROMPTS = [
  { label: '🏠 जमीन पर स्टे आर्डर (Order 39 CPC)', prompt: 'जमीन या मकान पर अवैध निर्माण व कब्जा रोकने के लिए कोर्ट से स्टे ऑर्डर (Injunction) कैसे प्राप्त करें?' },
  { label: '🚓 पुलिस FIR न लिखे तो 156(3) CrPC', prompt: 'यदि पुलिस थाने में एफआईआर दर्ज करने से मना कर दे, तो धारा 156(3) CrPC के तहत क्या प्रक्रिया है?' },
  { label: '🔓 अग्रिम जमानत (Anticipatory Bail)', prompt: 'गिरफ्तारी की आशंका होने पर अग्रिम जमानत (Anticipatory Bail Sec 438) कैसे और कब मिलती है?' },
  { label: '👨‍👩‍👦 तलाक व गुजारा भत्ता (Sec 125)', prompt: 'तलाक (Divorce) और भरण-पोषण/गुजारा भत्ता (Alimony Sec 125) के नियम और कानूनी अधिकार क्या हैं?' },
  { label: '📜 झूठी FIR रद्द कराना (Quashing Sec 482)', prompt: 'यदि किसी पर झूठी एफआईआर हो गई हो तो उसे हाई कोर्ट से क्वैश (Quashing Sec 482) कैसे कराएं?' },
  { label: '⚖️ वकील कैसे खोजें या बुक करें?', prompt: 'वकील दुनिया पर अपनी समस्या के अनुसार विशेषज्ञ वकील कैसे खोजें और परामर्श बुक करें?' },
];

export function ChatBot() {
  const { navigate, setLawyerCategoryFilter } = useNavigationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      role: 'assistant',
      content: `**नमस्ते! मैं 'न्याय सखा' (Nyaya Sakha) हूँ — वकील दुनिया का समर्पित AI कानूनी सहायक।** ⚖️

मैं आपकी सिविल, आपराधिक, पारिवारिक, संपत्ति विवाद एवं न्यायालयीन प्रक्रियाओं से जुड़े प्रश्नों में कानूनी सहायता कर सकता हूँ:
- 🏛️ **दीवानी कानून (Civil):** संपत्ति बंटवारा, स्टे आर्डर (Order 39), रिकवरी सूट, वसीयत व Plaint ड्राफ्टिंग।
- 🚨 **आपराधिक कानून (Criminal):** FIR व 156(3) CrPC, अग्रिम/नियमित जमानत, 482 Quashing, हाई कोर्ट अपील।
- 👨‍👩‍👦 **पारिवारिक (Family):** तलाक, भरण-पोषण (Sec 125), बच्चों की कस्टडी।

*आप नीचे दिए गए त्वरित कानूनी विषयों पर क्लिक कर सकते हैं या अपना प्रश्न टाइप/बोल सकते हैं:*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN'; // Default Hindi, also understands English terms

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice speech recognition is not supported in this browser. Please type your message.');
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
        console.error("Speech recognition error", err);
        setIsListening(false);
      }
    }
  };

  const handleSpeak = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner audio speech
    const cleanText = text.replace(/[*_#`[\]()]/g, '').replace(/[\n\r]+/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = /[\u0900-\u097F]/.test(text) ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingId(null);
    setMessages([
      {
        id: 'welcome_reset',
        role: 'assistant',
        content: `**न्याय सखा चैट रीसेट हो गया है।**\n\nआप अपनी नई कानूनी समस्या या सवाल यहाँ साझा कर सकते हैं।`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      // Send conversation history to backend for true multi-turn context
      const historyPayload = updatedHistory
        .filter(m => m.id !== 'welcome_1' && m.id !== 'welcome_reset')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: textToSend.trim(),
          history: historyPayload
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: data.reply || "मुझे आपका प्रश्न प्राप्त हुआ। अधिक विस्तृत सलाह के लिए हमारे सत्यापित अधिवक्ताओं से संपर्क करें।",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        setMessages(prev => [...prev, {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: "क्षमा करें, सर्वर से संपर्क करने में समस्या आ रही है। कृपया थोड़ी देर बाद पुनः प्रयास करें।",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: "नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const closeChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingId(null);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Trigger Button with Notification (Draggable / Moveable) */}
      {!isOpen && (
        <motion.div 
          id="nyaya-sakha-trigger-container"
          drag
          dragMomentum={false}
          dragElastic={0.15}
          whileDrag={{ scale: 1.12, cursor: 'grabbing' }}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center touch-none cursor-grab active:cursor-grabbing select-none"
        >
          <motion.button
            id="nyaya-sakha-open-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsOpen(true)}
            className="relative bg-gradient-to-tr from-[#a3803b] via-[#c5a059] to-[#e4c478] text-black p-3.5 sm:p-4 rounded-full shadow-[0_0_30px_rgba(197,160,89,0.35)] hover:shadow-[0_0_40px_rgba(197,160,89,0.5)] flex items-center justify-center cursor-pointer transition-all"
            title="Ask Nyaya Sakha AI Legal Assistant (Drag to move)"
          >
            <Scale className="w-5 h-5 sm:w-6 sm:h-6 pointer-events-none" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-[#050505] rounded-full pointer-events-none"></span>
          </motion.button>
        </motion.div>
      )}

      {/* Main Chat Window & Outside Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close chatbot on clicking anywhere outside */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeChat}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] cursor-pointer"
              title="Click outside to close"
            />

            <motion.div
              id="nyaya-sakha-chatbox"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`fixed z-50 bg-[#0c0c0c] border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col transition-all duration-300 ${
                isExpanded 
                  ? 'inset-2 sm:inset-10 rounded-2xl' 
                  : 'bottom-0 right-0 left-0 sm:left-auto sm:bottom-6 sm:right-6 sm:w-[440px] h-[92vh] sm:h-[620px] rounded-t-2xl sm:rounded-2xl'
              }`}
            >
              {/* Header */}
              <div className="bg-[#141414] border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#a3803b] to-[#c5a059] text-black flex items-center justify-center shadow-md">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-white font-medium tracking-wide text-sm sm:text-base">न्याय सखा (Nyaya Sakha)</h3>
                      <span className="text-[9px] bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 px-1.5 py-0.5 rounded font-mono uppercase">
                        Gemini 3.5
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      <span>24x7 AI Legal Assistant • Vakil Duniya</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons in Header */}
                <div className="flex items-center gap-1">
                  <button
                    id="chat-clear-btn"
                    onClick={clearChat}
                    title="Clear Chat"
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    id="chat-expand-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? "Collapse" : "Expand"}
                    className="hidden sm:block p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  >
                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button
                    id="chat-close-btn"
                    onClick={closeChat}
                    title="Close"
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#0c0c0c] to-[#070707]">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-gray-500">
                    {msg.role === 'assistant' ? (
                      <>
                        <Bot className="w-3 h-3 text-[#c5a059]" />
                        <span>न्याय सखा AI</span>
                      </>
                    ) : (
                      <>
                        <span>आप (You)</span>
                        <User className="w-3 h-3 text-gray-400" />
                      </>
                    )}
                    <span>• {msg.timestamp}</span>
                  </div>

                  <div
                    className={`relative group max-w-[90%] sm:max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#a3803b] to-[#c5a059] text-black font-medium rounded-tr-xs shadow-md'
                        : 'bg-[#151515] text-gray-200 border border-white/10 rounded-tl-xs shadow-lg'
                    }`}
                  >
                    {/* Render Markdown Content */}
                    <div className={msg.role === 'user' ? 'text-black' : 'text-gray-200 space-y-2 text-xs sm:text-sm'}>
                      <Markdown
                        components={{
                          h1: ({ children }) => <h1 className="text-sm font-bold text-[#c5a059] mt-2 mb-1">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xs sm:text-sm font-semibold text-[#c5a059] mt-2 mb-1">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-xs font-semibold text-white mt-1 mb-0.5">{children}</h3>,
                          p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-1.5 text-gray-300">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-1.5 text-gray-300">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          strong: ({ children }) => <strong className={msg.role === 'user' ? 'font-bold text-black' : 'font-semibold text-white'}>{children}</strong>,
                          blockquote: ({ children }) => <blockquote className="border-l-2 border-[#c5a059] pl-2.5 my-2 text-gray-400 italic">{children}</blockquote>
                        }}
                      >
                        {msg.content}
                      </Markdown>
                    </div>

                    {/* Action Bar on Assistant Messages */}
                    {msg.role === 'assistant' && (
                      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            title="Copy text"
                            className="p-1 text-gray-400 hover:text-[#c5a059] rounded hover:bg-white/5 transition-colors flex items-center gap-1 text-[11px]"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-green-400" />
                                <span className="text-green-400 text-[10px]">कॉपी हुआ</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-[10px]">Copy</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleSpeak(msg.content, msg.id)}
                            title={speakingId === msg.id ? "Stop voice" : "Listen in Hindi/English"}
                            className={`p-1 rounded hover:bg-white/5 transition-colors flex items-center gap-1 text-[11px] ${
                              speakingId === msg.id ? 'text-[#c5a059] animate-pulse font-medium' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {speakingId === msg.id ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                            <span className="text-[10px]">{speakingId === msg.id ? 'रोकें' : 'सुनें'}</span>
                          </button>
                        </div>

                        {/* Quick Platform Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              navigate('lawyers');
                            }}
                            className="text-[10px] text-[#c5a059] hover:underline flex items-center gap-0.5 bg-[#c5a059]/10 px-2 py-0.5 rounded border border-[#c5a059]/20"
                          >
                            वकील खोजें <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2"
                >
                  <div className="w-7 h-7 rounded-full bg-[#1c1c1c] border border-[#c5a059]/30 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-[#c5a059] animate-spin" />
                  </div>
                  <div className="bg-[#151515] border border-white/10 rounded-2xl rounded-tl-xs p-3.5 flex items-center gap-2">
                    <span className="text-xs text-gray-400">न्याय सखा विश्लेषण कर रहे हैं...</span>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-[#c5a059] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#c5a059] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#c5a059] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Carousel */}
            <div className="bg-[#0f0f0f] border-t border-white/10 px-3 py-2 shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#c5a059]/80 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> त्वरित कानूनी प्रश्न (Quick Legal Topics)
                </span>
                <span className="text-[9px] text-gray-500 hidden sm:inline">क्लिक करके तुरंत पूछें</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                {QUICK_LEGAL_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    id={`quick-prompt-${idx}`}
                    onClick={() => handleSend(item.prompt)}
                    disabled={isLoading}
                    className="shrink-0 text-[11px] bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 hover:border-[#c5a059]/50 text-gray-300 hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form & Speech Controls */}
            <div className="p-3 border-t border-white/10 bg-[#141414] shrink-0">
              <form
                id="nyaya-sakha-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  id="chat-mic-btn"
                  onClick={toggleVoiceInput}
                  title={isListening ? "Listening... Click to stop" : "Speak question in Hindi/English"}
                  className={`p-2.5 rounded-full transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-lg'
                      : 'bg-[#202020] text-gray-300 hover:text-[#c5a059] hover:bg-[#282828]'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  id="chat-user-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "सुन रहे हैं... बोलिए..." : "कानूनी प्रश्न पूछें (उदा. जमीन स्टे, FIR, जमानत)..."}
                  disabled={isLoading}
                  className="flex-1 bg-[#090909] border border-white/15 focus:border-[#c5a059] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none transition-colors"
                />

                <button
                  id="chat-submit-btn"
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-[#a3803b] to-[#c5a059] text-black p-2.5 rounded-xl hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Bottom Disclaimer */}
              <div className="mt-2 flex items-center justify-between text-[9px] text-gray-500 px-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-green-500" /> केवल कानूनी जानकारी के लिए • विशेषज्ञ सलाह हेतु वकील बुक करें
                </span>
                <span className="font-mono text-gray-600">vakilduniya.in</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </>
);
}

