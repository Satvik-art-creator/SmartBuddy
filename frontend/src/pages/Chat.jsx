import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import { toastError } from '../utils/toast';
import { on, off, getSocket } from '../socket';
import { motion } from 'framer-motion';

export default function Chat() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [isRecipientOnline, setIsRecipientOnline] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastActiveRef = useRef(0);

  const token = localStorage.getItem('token');

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`/api/conversations/${conversationId}/messages?limit=50&skip=0`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const loaded = data.messages || [];
      setMessages(loaded);
      try {
        // Cache messages in session storage for resilience across refresh during session
        sessionStorage.setItem(`chat:${conversationId}`, JSON.stringify(loaded));
      } catch {}
    } catch (err) {
      console.error('Failed to load messages', err);
      toastError(err?.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Fetch conversation to show recipient name in header
  const fetchConversationMeta = async () => {
    try {
      const { data } = await axios.get('/api/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const me = user?._id || user?.id;
      const convo = (data.conversations || []).find(c => c._id === conversationId);
      if (convo) {
        const other = (convo.participants || []).find(p => (p?._id || p) !== me);
        setRecipientName(other?.name || 'Conversation');
      }
    } catch (e) {}
  };

  useEffect(() => {
    // reset unread counter when opening this conversation
    try { sessionStorage.setItem(`unread:${conversationId}`, '0'); } catch {}
    // Load cached messages first for instant display
    try {
      const cached = sessionStorage.getItem(`chat:${conversationId}`);
      if (cached) {
        setMessages(JSON.parse(cached));
      }
    } catch {}
    fetchMessages();
    fetchConversationMeta();
    const socket = getSocket();
    // Join socket room for this conversation
    socket.emit('join_conversation', conversationId);
    // Mark messages as read (no UI counters)
    socket.emit('mark_read', { conversationId });
    const onChatMessage = ({ message }) => {
      if (message?.conversationId === conversationId) {
        // Skip echo of my own message; we already appended optimistic
        const meId = (JSON.parse(localStorage.getItem('user') || '{}')._id) || (JSON.parse(localStorage.getItem('user') || '{}').id);
        const senderId = typeof message.sender === 'object' ? (message.sender?._id || message.sender) : message.sender;
        if (meId && senderId && meId.toString() === senderId.toString()) {
          return;
        }
        setMessages((prev) => {
          const next = [...prev, message];
          try { sessionStorage.setItem(`chat:${conversationId}`, JSON.stringify(next)); } catch {}
          return next;
        });
        lastActiveRef.current = Date.now();
        setIsRecipientOnline(true);
      }
    };
    const onTyping = ({ conversationId: cId, userId }) => {
      const me = JSON.parse(localStorage.getItem('user') || '{}')._id;
      if (cId === conversationId && userId && userId !== me) {
        setIsOtherTyping(true);
        // Fallback auto-hide if stop event missed
        setTimeout(() => setIsOtherTyping(false), 2000);
        lastActiveRef.current = Date.now();
        setIsRecipientOnline(true);
      }
    };
    const onStopTyping = ({ conversationId: cId, userId }) => {
      const me = JSON.parse(localStorage.getItem('user') || '{}')._id;
      if (cId === conversationId && userId && userId !== me) {
        setIsOtherTyping(false);
      }
    };
    // Support both legacy 'chat_message' and new 'receive_message'
    on('chat_message', onChatMessage);
    on('receive_message', onChatMessage);
    on('user_typing', onTyping);
    on('user_stop_typing', onStopTyping);
    const presenceInterval = setInterval(() => {
      // Consider online if activity within last 60s
      const delta = Date.now() - lastActiveRef.current;
      setIsRecipientOnline(delta < 60000 && lastActiveRef.current !== 0);
    }, 5000);
    return () => {
      off('chat_message', onChatMessage);
      off('receive_message', onChatMessage);
      off('user_typing', onTyping);
      off('user_stop_typing', onStopTyping);
      clearInterval(presenceInterval);
    };
  }, [conversationId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const optimisticMessage = {
      _id: `local-${Date.now()}`,
      conversationId,
      sender: JSON.parse(localStorage.getItem('user') || '{}')._id,
      text: trimmed,
      createdAt: new Date().toISOString(),
      isSelf: true,
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setText('');
    // Scroll handled by messages effect

    try {
      // Emit over socket for realtime
      const socket = getSocket();
      socket.emit('send_message', { conversationId, text: trimmed });
      // Also persist via REST to guarantee DB save and legacy emit
      await axios.post(`/api/conversations/${conversationId}/messages`, { text: trimmed }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to send message', err);
      toastError(err?.response?.data?.message || 'Failed to send message');
    }
  };

  // Smooth auto-scroll when messages update
  useEffect(() => {
    try { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }, [messages]);

  // Emit typing with debounce
  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    const socket = getSocket();
    socket.emit('typing', { conversationId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId });
    }, 1000);
  };

  if (loading) {
    return <div className="p-4 text-white">Loading chat…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 text-gray-900">
      <div className="max-w-4xl mx-auto h-screen md:h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-green-500 text-white rounded-t-lg shadow">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
            {(recipientName || 'U').slice(0,1).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <div className="font-semibold leading-tight">{recipientName || 'Conversation'}</div>
          </div>
          {isOtherTyping && (
            <div className="ml-3 text-xs italic opacity-90">typing…</div>
          )}
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 bg-white rounded-b-lg rounded-t-none shadow-sm border space-y-3">
          {messages.map((m) => {
            const meRaw = JSON.parse(localStorage.getItem('user') || '{}');
            const me = meRaw?._id || meRaw?.id;
            const isSelf = typeof m.isSelf === 'boolean'
              ? m.isSelf
              : (() => {
                  const senderId = typeof m.sender === 'object' ? (m.sender?._id || m.sender) : m.sender;
                  return senderId && me ? senderId.toString() === me.toString() : false;
                })();
            const bubbleCls = isSelf
              ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-900 rounded-bl-none';
            const rowCls = isSelf ? 'justify-end' : 'justify-start';
            const senderInitial = (recipientName || 'U').slice(0,1).toUpperCase();
            const nameLabel = isSelf ? 'You' : (recipientName || 'User');
            const labelAlign = isSelf ? 'text-right' : 'text-left';
            return (
              <div key={m._id} className={`w-full flex ${rowCls}`}>
                {!isSelf && (
                  <div className="mr-2 mt-5 w-7 h-7 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-semibold select-none">
                    {senderInitial}
                  </div>
                )}
                <div className="max-w-[75%]">
                  <div className={`text-[10px] text-gray-500 mb-1 ${labelAlign}`}>{nameLabel}</div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`inline-block px-3 py-2 rounded-2xl hover:opacity-90 ${bubbleCls}`}
                  >
                    <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>
                  </motion.div>
                  <div className={`text-[10px] text-gray-400 mt-1 ${isSelf ? 'text-right' : ''}`}>
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}
          {isOtherTyping && (
            <div className="text-xs text-gray-500">Other user is typing…</div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Composer - fixed bottom bar */}
        <form onSubmit={sendMessage} className="flex items-center gap-2 p-3 bg-white border-t shadow-inner sticky bottom-0">
          <input
            value={text}
            onChange={handleChange}
            className="flex-1 rounded-full border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Type a message…"
          />
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-green-500 to-purple-500 text-white px-4 py-2 font-medium"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
// Auto-scroll to bottom on new messages
// Use a dedicated effect inside this module
// Ensures smooth scroll whenever messages array changes
// and after component renders
React.useEffect = React.useEffect;
export function useChatAutoscroll(ref, deps) {
  React.useEffect(() => {
    try { ref?.current?.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }, deps);
}
