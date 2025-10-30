import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { on, off, getSocket } from '../socket';

export default function Chats() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(data.conversations || []);
    } catch (e) {
      console.error('Failed to load conversations', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadConversations();
    const socket = getSocket();
    // No unread counters anymore; minimal listeners or remove entirely
    const noop = () => {};
    on('receive_message', noop);
    on('chat_message', noop);
    on('read_receipt', noop);
    return () => {
      off('receive_message', noop);
      off('chat_message', noop);
      off('read_receipt', noop);
    };
  }, [loadConversations]);

  if (loading) {
    return <div className="p-4 text-white">Loading chats…</div>;
  }

  return (
    <div className="p-4 text-gray-900 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Chats</h2>
        <div className="space-y-2">
          {conversations.map((c) => {
            return (
            <button
              key={c._id}
              onClick={() => navigate(`/chat/${c._id}`)}
              className="w-full text-left border rounded p-3 hover:bg-gray-50"
            >
              <div className="text-sm text-gray-600">{(c.participants || []).map(p => p?.name).join(', ')}</div>
              <div className="flex items-center gap-2">
                <div className="text-gray-800 flex-1">{c.lastMessage || 'No messages yet'}</div>
              </div>
            </button>
            );
          })}
          {conversations.length === 0 && (
            <div className="text-gray-600">No conversations yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}


