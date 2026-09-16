import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, ThumbsUp, ShieldCheck } from 'lucide-react';

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});

  const rawApi = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const API_BASE = (rawApi.startsWith('http') ? rawApi : `https://${rawApi}`).replace(/\/+$/, '') + '/';

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}api/vendor/reviews`);
      if (res.ok) {
        const json = await res.json();
        setReviews(json.reviews || []);
      } else {
        setReviews([]);
      }
    } catch (e) {
      console.error('Failed to fetch reviews:', e);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (id) => {
    const text = replyText[id];
    if (!text) return;
    setReviews(prev => prev.map(r => r.id === id ? { ...r, vendor_reply: text } : r));
    setReplyText({ ...replyText, [id]: '' });

    try {
      await fetch(`${API_BASE}api/vendor/reviews/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: text })
      });
    } catch (e) {
      console.error('Failed to save vendor reply:', e);
    }
  };

  const cardStyle = {
    background: 'rgba(8, 24, 12, 0.85)',
    border: '1px solid rgba(134, 239, 172, 0.15)',
    borderRadius: '1.25rem',
    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-3">
          <Star className="text-amber-400" size={32} />
          Farmer Ratings & Reviews Feed
        </h1>
        <p className="text-[#86efac]/70 mt-1 text-sm">
          Monitor farmer feedback, trust score metrics, and reply to buyer reviews.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div style={cardStyle} className="p-12 text-center space-y-3">
          <Star size={40} className="mx-auto text-amber-400/40" />
          <h3 className="text-lg font-bold text-white font-['Outfit']">No Customer Reviews Yet</h3>
          <p className="text-xs text-[#86efac]/60 max-w-sm mx-auto">
            When verified farmers purchase your seeds, inputs, or participate in procurement and submit reviews, their verified ratings will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map(r => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={cardStyle}
              className="p-6 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white font-['Outfit']">{r.farmer_name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-amber-400 text-sm">
                    {[...Array(Math.max(1, Math.round(r.rating || 5)))].map((_, i) => (
                      <Star key={i} size={16} fill="#facc15" />
                    ))}
                    <span className="text-xs text-[#86efac]/60 ml-2">{r.date}</span>
                  </div>
                </div>
                <span className="text-xs text-[#86efac]/70 flex items-center gap-1">
                  <ThumbsUp size={14} className="text-[#4ade80]" /> {r.helpful} helpful
                </span>
              </div>

              <p className="text-sm text-gray-200 leading-relaxed">{r.comment}</p>

              {r.vendor_reply ? (
                <div className="p-4 rounded-xl bg-[rgba(14,38,20,0.8)] border border-[rgba(134,239,172,0.1)] text-xs space-y-1">
                  <p className="font-bold text-[#4ade80]">Vendor Official Response:</p>
                  <p className="text-gray-300">{r.vendor_reply}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Write a response..."
                    value={replyText[r.id] || ''}
                    onChange={e => setReplyText({ ...replyText, [r.id]: e.target.value })}
                    style={{
                      flex: 1, padding: '0.55rem 0.85rem',
                      background: 'rgba(14, 38, 20, 0.9)',
                      border: '1px solid rgba(134, 239, 172, 0.2)',
                      borderRadius: '0.75rem', color: '#fff', fontSize: '0.8rem', outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => handleReply(r.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    Reply
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
