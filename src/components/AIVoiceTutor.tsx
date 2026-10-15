import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Trash2,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Bot,
  User,
  Info,
} from 'lucide-react';
import { speechController, soundEffects } from '../utils/audio';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  hasAudio?: boolean;
  audioBase64?: string;
}

export const AIVoiceTutor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! Welcome to Hai Ba Trung Shrine. I am your English museum guide and Grade 6 tutor. You can speak to me or type your questions about the Trung Sisters, historical heritage, or new vocabulary. What would you like to explore today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedInterim, setRecognizedInterim] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check backend Gemini status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(Boolean(data.hasApiKey));
      })
      .catch(() => {
        setHasApiKey(false);
      });
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, recognizedInterim, isProcessing]);

  // Handle Speech Recognition Setup
  const startListening = () => {
    soundEffects.playClick();
    setErrorMessage(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        'Speech recognition is not supported in this browser. You can still type your questions below!'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setRecognizedInterim('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setRecognizedInterim(interim);
        }

        if (final) {
          setRecognizedInterim('');
          setIsListening(false);
          handleSendMessage(final);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setRecognizedInterim('');

        if (event.error === 'not-allowed') {
          setErrorMessage(
            'Microphone access was denied. Please allow microphone permissions in your browser bar.'
          );
        } else if (event.error !== 'no-speech') {
          setErrorMessage(`Microphone error: ${event.error}. Please try again or type below.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setErrorMessage('Could not activate microphone. Please try again.');
    }
  };

  const stopListening = () => {
    soundEffects.playClick();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setRecognizedInterim('');
  };

  // Send message to AI Tutor
  const handleSendMessage = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isProcessing) return;

    soundEffects.playClick();
    setTextInput('');
    setErrorMessage(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsProcessing(true);

    try {
      // Call server-side Gemini chat endpoint
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            'Could not get a response from the AI Tutor. Please check your Gemini API key in Secrets.'
        );
      }

      const data = await response.json();
      const aiReply = data.reply || "I am glad to help you learn about Hai Ba Trung Shrine!";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsProcessing(false);

      // Play audio response using Gemini TTS or browser speech
      speakAiReply(aiReply, aiMessage.id);
    } catch (err: any) {
      console.error('Chat error:', err);
      setIsProcessing(false);
      setErrorMessage(
        err.message || 'Failed to connect to AI tutor. Check server logs or configure GEMINI_API_KEY.'
      );
    }
  };

  // Speak AI reply via Gemini TTS or browser fallback
  const speakAiReply = async (text: string, messageId: string) => {
    setIsAiSpeaking(true);

    // Try server-side Gemini TTS first
    try {
      const ttsRes = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (ttsRes.ok) {
        const ttsData = await ttsRes.json();
        if (ttsData.audio) {
          speechController.playBase64Audio(ttsData.audio, ttsData.mimeType, () => {
            setIsAiSpeaking(false);
          });
          return;
        }
      }
    } catch (e) {
      console.warn('Gemini TTS endpoint unavailable, using browser speech synthesis fallback', e);
    }

    // Fallback: Browser Web Speech Synthesis
    speechController.speak(text, {
      rate: 0.88,
      onEnd: () => setIsAiSpeaking(false),
      onError: () => setIsAiSpeaking(false),
    });
  };

  const handleRepeatMessage = (text: string) => {
    soundEffects.playClick();
    speakAiReply(text, 'repeat');
  };

  const handleClearConversation = () => {
    soundEffects.playClick();
    speechController.stop();
    setIsAiSpeaking(false);
    setIsListening(false);
    setMessages([
      {
        id: 'welcome_reset',
        role: 'assistant',
        content:
          'Conversation cleared. I am ready to help! What would you like to talk about today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const conversationStarters = [
    { title: 'Teach Me New Words', prompt: 'Can you teach me new words from the Hai Ba Trung Shrine reading?' },
    { title: 'Ask Me About the Shrine', prompt: 'Can you ask me a question about Hai Ba Trung Shrine?' },
    { title: "Let's Practise English", prompt: "I want to practise speaking English. Can we roleplay a visit to the shrine?" },
    { title: 'Help Me Describe My Neighbourhood', prompt: 'Can you help me describe historical places in my neighbourhood?' },
  ];

  // Visual status banner
  let statusLabel = 'Ready to talk';
  let statusBadgeStyle = 'bg-slate-100 text-slate-800 border-slate-300';
  if (isListening) {
    statusLabel = 'Listening to your voice...';
    statusBadgeStyle = 'bg-red-100 text-red-900 border-red-400 animate-pulse';
  } else if (isAiSpeaking) {
    statusLabel = 'AI Tutor is speaking...';
    statusBadgeStyle = 'bg-emerald-100 text-emerald-900 border-emerald-400';
  } else if (isProcessing) {
    statusLabel = 'Thinking and preparing response...';
    statusBadgeStyle = 'bg-amber-100 text-amber-900 border-amber-400';
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Title Header */}
      <div className="bg-slate-900 text-white rounded-xl border-2 border-amber-500 shadow-md p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-950 bg-amber-400 px-2 py-0.5 rounded">
                AI VOICE TUTOR
              </span>
              <span className="text-xs text-slate-300">Grade 6 Friendly</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
              Talk, Learn, and Explore English!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Practise speaking English with your friendly museum guide. Ask questions, practise pronunciation, or explore heritage.
            </p>
          </div>

          {/* Status Indicator & Audio Bars */}
          <div className="flex flex-col items-start sm:items-end gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${statusBadgeStyle}`}>
              <span
                className={`w-2 h-2 rounded-full ${
                  isListening
                    ? 'bg-red-600 animate-ping'
                    : isAiSpeaking
                    ? 'bg-emerald-600 animate-pulse'
                    : isProcessing
                    ? 'bg-amber-500 animate-bounce'
                    : 'bg-slate-400'
                }`}
              />
              <span>{statusLabel}</span>
            </div>

            {/* CSS Sound Wave Equalizer Bars */}
            {(isListening || isAiSpeaking) && (
              <div className="flex items-center gap-1 h-5 px-2">
                <span className="w-1 bg-amber-400 rounded-full animate-[pulse_0.4s_infinite] h-3" />
                <span className="w-1 bg-amber-400 rounded-full animate-[pulse_0.7s_infinite] h-5" />
                <span className="w-1 bg-amber-400 rounded-full animate-[pulse_0.3s_infinite] h-2" />
                <span className="w-1 bg-amber-400 rounded-full animate-[pulse_0.6s_infinite] h-4" />
                <span className="w-1 bg-amber-400 rounded-full animate-[pulse_0.5s_infinite] h-3" />
              </div>
            )}
          </div>
        </div>

        {/* API key configuration notice */}
        {hasApiKey === false && (
          <div className="mt-4 p-3 bg-amber-950/80 border border-amber-500/70 rounded-lg text-xs text-amber-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Gemini API Key Required: </span>
              To enable live AI generation and speech responses, make sure your <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">GEMINI_API_KEY</code> is set in the AI Studio Settings &gt; Secrets panel.
            </div>
          </div>
        )}
      </div>

      {/* Suggested Conversation Starters */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Try asking the AI Tutor:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {conversationStarters.map((starter, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(starter.prompt)}
              disabled={isProcessing || isListening}
              className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-amber-500 hover:bg-amber-50/50 text-left transition shadow-xs disabled:opacity-50"
            >
              <div className="font-bold text-xs text-slate-800">
                {starter.title}
              </div>
              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                "{starter.prompt}"
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Transcript Area */}
      <div className="bg-white rounded-xl border-2 border-slate-200 shadow-sm p-4 sm:p-6 space-y-4 min-h-[380px] max-h-[500px] overflow-y-auto flex flex-col">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse self-end' : 'self-start'} max-w-[85%]`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                  isUser
                    ? 'bg-red-800 text-white'
                    : 'bg-slate-900 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-red-800 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                <div
                  className={`mt-1.5 flex items-center justify-between gap-3 text-[10px] ${
                    isUser ? 'text-red-200' : 'text-slate-400'
                  }`}
                >
                  <span>{m.timestamp}</span>

                  {!isUser && (
                    <button
                      onClick={() => handleRepeatMessage(m.content)}
                      className="hover:text-amber-600 flex items-center gap-1 font-semibold transition"
                      title="Listen again"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Repeat</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Interim speech recognition preview */}
        {isListening && recognizedInterim && (
          <div className="self-end max-w-[85%] flex items-start gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-red-400 text-white flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3 rounded-2xl bg-red-100 text-red-900 text-xs sm:text-sm italic border border-red-200">
              {recognizedInterim}...
            </div>
          </div>
        )}

        {/* Thinking indicator */}
        {isProcessing && (
          <div className="self-start flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
            <Bot className="w-4 h-4 text-amber-600 animate-spin" />
            <span>AI Tutor is preparing your explanation...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {/* Voice and Text Controls */}
      <div className="bg-slate-900 p-4 sm:p-5 rounded-xl border-2 border-amber-500 space-y-4">
        {/* Main Microphone Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isListening ? (
              <button
                onClick={startListening}
                disabled={isProcessing}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-800 hover:bg-red-700 text-white font-extrabold text-sm shadow transition active:scale-95"
              >
                <Mic className="w-4 h-4 text-amber-300" />
                <span>Start Speaking</span>
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow animate-pulse"
              >
                <MicOff className="w-4 h-4" />
                <span>Stop Listening</span>
              </button>
            )}

            <button
              onClick={() => {
                soundEffects.playClick();
                speechController.stop();
                setIsAiSpeaking(false);
              }}
              disabled={!isAiSpeaking}
              className="px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-bold transition"
              title="Stop current audio"
            >
              End Conversation
            </button>
          </div>

          <button
            onClick={handleClearConversation}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-300 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Conversation</span>
          </button>
        </div>

        {/* Text Input Fallback */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(textInput);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isProcessing || isListening}
            placeholder="Or type your English message here..."
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm focus:border-amber-400 outline-none"
          />
          <button
            type="submit"
            disabled={!textInput.trim() || isProcessing}
            className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs flex items-center gap-1 transition"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
