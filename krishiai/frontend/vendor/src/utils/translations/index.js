import { en } from './en.js';
import { hi } from './hi.js';
import { gu } from './gu.js';
import { mr } from './mr.js';
import { ta } from './ta.js';

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN', name: 'English' },
  { code: 'hi', label: 'हिंदी', short: 'हि', name: 'Hindi' },
  { code: 'gu', label: 'ગુજરાતી', short: 'ગુ', name: 'Gujarati' },
  { code: 'mr', label: 'मराठी', short: 'म', name: 'Marathi' },
  { code: 'ta', label: 'தமிழ்', short: 'த', name: 'Tamil' },
];

function createFallbackProxy(target, fallback) {
  if (!target && !fallback) return {};
  return new Proxy(target || fallback, {
    get(obj, prop) {
      if (typeof prop === 'symbol') return obj[prop];
      const val = obj ? obj[prop] : undefined;
      const fb = fallback ? fallback[prop] : undefined;
      if (val === undefined) return fb;
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        return createFallbackProxy(val, fb);
      }
      return val;
    }
  });
}

const rawTranslations = {
  en,
  hi,
  gu,
  mr,
  ta,
};

export const translations = new Proxy(rawTranslations, {
  get(target, prop) {
    if (typeof prop === 'symbol') return target[prop];
    const langObj = target[prop] || target['en'] || en;
    if (prop === 'en') return langObj;
    return createFallbackProxy(langObj, en);
  }
});
