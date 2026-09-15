/**
 * packages/utils/src/dateUtils.js — Date & relative time utilities
 */

export const formatDate = (dateInput, format = 'medium') => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  if (format === 'short') {
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }
  if (format === 'time') {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const timeAgo = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
