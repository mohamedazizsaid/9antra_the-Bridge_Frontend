import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { fr, en, ar } from '../i18n/index';

export type SupportedLang = 'fr' | 'en' | 'ar';

const DICTIONARIES: Record<SupportedLang, typeof fr> = { fr, en, ar };
const STORAGE_KEY = 'bridge_lang';
const RTL_LANGS: SupportedLang[] = ['ar'];

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private _lang = new BehaviorSubject<SupportedLang>(this.detectLang());

  /** Observable that emits whenever the active language changes */
  lang$: Observable<SupportedLang> = this._lang.asObservable();

  constructor() {
    this.applyLang(this._lang.value);
  }

  /** Return the current active language code */
  get currentLang(): SupportedLang {
    return this._lang.value;
  }

  /**
   * Change the active language.
   * Persists choice to localStorage and toggles RTL on <html>.
   */
  setLang(lang: SupportedLang): void {
    localStorage.setItem(STORAGE_KEY, lang);
    this._lang.next(lang);
    this.applyLang(lang);
  }

  /**
   * Translate a dot-separated key, e.g. 'settings.profile.firstName'
   * Falls back to the key itself if not found.
   */
  t(key: string): string {
    const dict = DICTIONARIES[this._lang.value] as Record<string, any>;
    const parts = key.split('.');
    let result: any = dict;
    for (const part of parts) {
      if (result === null || typeof result !== 'object') {
        return key; // key not found → return raw key as fallback
      }
      result = result[part];
    }
    return typeof result === 'string' ? result : key;
  }

  /** Shorthand alias for t() */
  translate(key: string): string {
    return this.t(key);
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  private detectLang(): SupportedLang {
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLang | null;
    if (stored && (stored === 'fr' || stored === 'en' || stored === 'ar')) {
      return stored;
    }
    // Auto-detect from browser
    const browserLang = navigator.language?.split('-')[0] as SupportedLang;
    if (browserLang === 'ar') return 'ar';
    if (browserLang === 'en') return 'en';
    return 'fr'; // default
  }

  private applyLang(lang: SupportedLang): void {
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    if (RTL_LANGS.includes(lang)) {
      html.setAttribute('dir', 'rtl');
    } else {
      html.setAttribute('dir', 'ltr');
    }
  }
}
