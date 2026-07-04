import React from 'react';
import { useNavigate } from 'react-router-dom';
import MandiMap from '../components/feature/MandiMap';
import { useChat } from '../context/ChatContext';

export default function MandiMapPage() {
  const navigate = useNavigate();
  const { userLocation } = useChat();

  return (
    <MandiMap
      onClose={() => navigate('/chat')}
      userLat={userLocation?.lat}
      userLon={userLocation?.lon}
      isPage={true}
    />
  );
}
