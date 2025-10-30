import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { on, off, getSocket } from '../socket';
import { useNavigate } from 'react-router-dom';
import ProfilePreviewModal from './ProfilePreviewModal';
import { toastError, toastSuccess, toastInfo } from '../utils/toast';

export default function RequestsDropdown() {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [unread, setUnread] = useState(0);
  const [confirmRejectId, setConfirmRejectId] = useState(null);
  const [preview, setPreview] = useState({ open: false, loading: false, profile: null, requestId: null, senderId: null });
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get('/api/connections/requests?status=pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(data.requests || []);
      setUnread((data.requests || []).length);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    }
  };

  useEffect(() => {
    fetchRequests();
    getSocket();

    const onNotification = (payload) => {
      if (payload?.type === 'request') {
        fetchRequests();
        setUnread((u) => u + 1);
      }
    };
    const onRequestUpdate = ({ request }) => {
      if (request?.status === 'accepted' || request?.status === 'rejected') {
        // Remove from pending list
        setRequests((prev) => prev.filter(r => r._id !== request._id));
        setUnread((u) => Math.max(0, u - 1));
      }
    };
    const onConversationCreated = ({ conversationId }) => {
      navigate(`/chat/${conversationId}`);
    };

    on('notification', onNotification);
    on('request_update', onRequestUpdate);
    on('conversation_created', onConversationCreated);
    return () => {
      off('notification', onNotification);
      off('request_update', onRequestUpdate);
      off('conversation_created', onConversationCreated);
    };
  }, []);

  const respond = async (requestId, action) => {
    try {
      const { data } = await axios.post('/api/connections/respond', { requestId, action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests((prev) => prev.filter(r => r._id !== requestId));
      setUnread((u) => Math.max(0, u - 1));
      // Close preview modal if it's open for this request
      setPreview((p) => (p.open && p.requestId === requestId ? { open: false, loading: false, profile: null, requestId: null, senderId: null } : p));
      if (action === 'accept' && data?.conversation?._id) {
        navigate(`/chat/${data.conversation._id}`);
      }
      toastSuccess(action === 'accept' ? 'Request accepted ✅' : 'Request rejected');
    } catch (err) {
      console.error('Failed to respond to request', err);
      toastError(err?.response?.data?.message || 'Failed to respond');
    } finally {
      setConfirmRejectId(null);
    }
  };

  const openPreview = async (rawSender, requestId) => {
    try {
      const senderId = (rawSender && typeof rawSender === 'object') ? (rawSender._id || rawSender.id) : rawSender;
      if (!senderId) throw new Error('Missing sender id');
      setPreview((p) => ({ ...p, open: true, loading: true, requestId, senderId }));
      // Use query variant to avoid any path encoding issues
      const { data } = await axios.get(`/api/profile/preview`, { params: { userId: senderId }, headers: { Authorization: `Bearer ${token}` } });
      setPreview((p) => ({ ...p, loading: false, profile: data.profile }));
    } catch (e) {
      console.error('Preview unauthorized or failed', e);
      if (e?.response?.status === 403) toastError("You're not authorized to view this profile.");
      else toastError('Failed to load profile');
      setPreview((p) => ({ ...p, open: false, loading: false, profile: null }));
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button onClick={() => setOpen(!open)} className="relative px-3 py-2 bg-purple-600 text-white rounded">
        Requests {unread > 0 && (
          <span className="ml-2 bg-red-500 text-white rounded-full px-2 text-xs">{unread}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded shadow-lg z-50 p-2">
          <div className="font-semibold mb-2">Incoming Requests</div>
          {requests.length === 0 && (
            <div className="text-gray-500 text-sm">No pending requests</div>
          )}
          <div className="space-y-2 max-h-96 overflow-auto">
            {requests.map((req) => (
              <div key={req._id} className="border rounded p-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{req.from?.name || 'Unknown'}</div>
                  <div className="text-xs text-gray-600">{req.message}</div>
                </div>
                <div className="space-x-2">
                  <button onClick={() => respond(req._id, 'accept')} className="px-2 py-1 bg-green-600 text-white rounded text-sm">Accept</button>
                  <button onClick={() => setConfirmRejectId(req._id)} className="px-2 py-1 bg-gray-500 text-white rounded text-sm">Reject</button>
                  <button onClick={() => openPreview(req.from, req._id)} className="px-2 py-1 bg-purple-600 text-white rounded text-sm">View Profile</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {confirmRejectId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-4 w-80">
            <div className="font-semibold mb-2">Reject request?</div>
            <div className="text-sm text-gray-600 mb-4">Are you sure you want to reject this connection request?</div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setConfirmRejectId(null)} className="px-3 py-1 rounded border">Cancel</button>
              <button onClick={() => respond(confirmRejectId, 'reject')} className="px-3 py-1 rounded bg-gray-600 text-white">Reject</button>
            </div>
          </div>
        </div>
      )}

      <ProfilePreviewModal
        isOpen={preview.open}
        profile={preview.profile}
        loadingAction={preview.loading}
        onClose={() => setPreview({ open: false, loading: false, profile: null, requestId: null, senderId: null })}
        onReject={() => preview.requestId && respond(preview.requestId, 'reject')}
        onAccept={() => preview.requestId && respond(preview.requestId, 'accept')}
      />
    </div>
  );
}
