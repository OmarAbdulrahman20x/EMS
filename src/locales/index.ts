import { ar } from './ar';
import { en } from './en';

export type Locale = 'ar' | 'en';
export type TranslationKey = string;

export { ar, en };

export const translations = { ar, en };

export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const dict = translations[locale] as Record<string, unknown>;
  const value = getNestedValue(dict, key);
  let result: string;
  if (typeof value === 'string') {
    result = value;
  } else {
    const fallback = getNestedValue(translations.en as Record<string, unknown>, key);
    result = typeof fallback === 'string' ? fallback : key;
  }
  if (params) {
    for (const [param, val] of Object.entries(params)) {
      result = result.replace(`{${param}}`, String(val));
    }
  }
  return result;
}
