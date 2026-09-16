import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

const ChatPage = lazy(() => import('../pages/ChatPage.jsx'));
const MarketPricePage = lazy(() => import('../pages/MarketPricePage.jsx'));
const PredictPage = lazy(() => import('../pages/PredictPage.jsx'));
const RecommendPage = lazy(() => import('../pages/RecommendPage.jsx'));
const SatellitePage = lazy(() => import('../pages/SatellitePage.jsx'));
const MandiMapPage = lazy(() => import('../pages/MandiMapPage.jsx'));
const SchemesPage = lazy(() => import('../pages/SchemesPage.jsx'));
const FarmerAnalytics = lazy(() => import('../pages/FarmerAnalytics.jsx'));
const FarmerHeatmap = lazy(() => import('../pages/FarmerHeatmap.jsx'));
const FarmerBrowseRequirementsPage = lazy(() => import('../pages/FarmerBrowseRequirementsPage.jsx'));
const VoiceAssistantPage = lazy(() => import('../pages/VoiceAssistantPage.jsx'));
const CallHistoryPage = lazy(() => import('../pages/CallHistoryPage.jsx'));
const CommunityPage = lazy(() => import('../pages/CommunityPage.jsx'));
const WhatsAppPage = lazy(() => import('../pages/WhatsAppPage.jsx'));
<<<<<<< HEAD
const FarmerIotPage = lazy(() => import('../pages/FarmerIotPage.jsx'));
=======
const IoTPage = lazy(() => import('../pages/IoTPage.jsx'));
const SettingsPage = lazy(() => import('../pages/SettingsPage.jsx'));
const HelpPage = lazy(() => import('../pages/HelpPage.jsx'));
>>>>>>> origin/main

export const FarmerAppRoutes = [
  <Route key="iot" path="/iot" element={<FarmerIotPage />} />,
  <Route key="chat" path="/chat" element={<ChatPage />} />,
  <Route key="iot" path="/iot" element={<IoTPage />} />,
  <Route key="analytics" path="/analytics" element={<FarmerAnalytics />} />,
  <Route key="heatmap" path="/heatmap" element={<FarmerHeatmap />} />,
  <Route key="market-prices" path="/market-prices" element={<MarketPricePage />} />,
  <Route key="predict" path="/predict" element={<PredictPage />} />,
  <Route key="recommend" path="/recommend" element={<RecommendPage />} />,
  <Route key="satellite" path="/satellite" element={<SatellitePage />} />,
  <Route key="mandi-map" path="/mandi-map" element={<MandiMapPage />} />,
  <Route key="schemes" path="/schemes" element={<SchemesPage />} />,
  <Route key="sell-crops" path="/sell-crops" element={<FarmerBrowseRequirementsPage />} />,
  <Route key="whatsapp" path="/whatsapp" element={<WhatsAppPage />} />,
  <Route key="community" path="/community" element={<CommunityPage />} />,
  <Route key="call-history" path="/call-history" element={<CallHistoryPage />} />,
  <Route key="voice-assistant" path="/voice-assistant" element={<VoiceAssistantPage />} />,
  <Route key="settings" path="/settings" element={<SettingsPage />} />,
  <Route key="help" path="/help" element={<HelpPage />} />,
];
