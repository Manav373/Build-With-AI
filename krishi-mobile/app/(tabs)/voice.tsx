import { Redirect } from 'expo-router';

// The Voice tab press is intercepted in _layout.tsx and pushes /voice-assistant
// (push keeps history so back returns to the tabs). This redirect only runs if
// the route is reached directly, e.g. via deep link.
export default function VoiceTab() {
  return <Redirect href="/voice-assistant" />;
}
