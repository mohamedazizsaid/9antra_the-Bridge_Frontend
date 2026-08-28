import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type DaltonismMode =
  | 'none'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia'
  | 'high-contrast'
  | 'inverted';

export type TextScale = 'normal' | 'large' | 'xlarge' | 'huge';
export type LetterSpacing = 'normal' | 'wide' | 'wider';
export type LineHeight = 'normal' | 'relaxed' | 'loose';

export interface AccessibilityConfig {
  daltonism: DaltonismMode;
  dyslexicFont: boolean;
  textScale: TextScale;
  letterSpacing: LetterSpacing;
  lineHeight: LineHeight;
  voiceOn: boolean;
  voiceHover: boolean;
  speechRate: number;
  speechLanguage: string;
  readingRuler: boolean;
  readingMask: boolean;
  bigCursor: boolean;
  highlightLinks: boolean;
  reducedMotion: boolean;
}

const DEFAULT_CONFIG: AccessibilityConfig = {
  daltonism: 'none',
  dyslexicFont: false,
  textScale: 'normal',
  letterSpacing: 'normal',
  lineHeight: 'normal',
  voiceOn: false,
  voiceHover: false,
  speechRate: 1.0,
  speechLanguage: 'fr-FR',
  readingRuler: false,
  readingMask: false,
  bigCursor: false,
  highlightLinks: false,
  reducedMotion: false,
};

@Injectable({
  providedIn: 'root',
})
export class AccessibilityService {
  private readonly STORAGE_KEY = 'bridge_accessibility_settings';
  private config$ = new BehaviorSubject<AccessibilityConfig>(this.loadConfig());
  public config = this.config$.asObservable();

  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingSubject = new BehaviorSubject<boolean>(false);
  public isSpeaking = this.isSpeakingSubject.asObservable();

  private rulerEl: HTMLElement | null = null;
  private maskTopEl: HTMLElement | null = null;
  private maskBottomEl: HTMLElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
      this.injectSvgFilters();
      this.applyConfig(this.config$.value);
      this.initMouseListeners();
    }
  }

  public getConfig(): AccessibilityConfig {
    return this.config$.value;
  }

  public updateConfig(partial: Partial<AccessibilityConfig>): void {
    const updated = { ...this.config$.value, ...partial };
    this.config$.next(updated);
    this.saveConfig(updated);
    this.applyConfig(updated);
  }

  public resetDefaults(): void {
    this.updateConfig(DEFAULT_CONFIG);
    this.stopSpeaking();
  }

  private loadConfig(): AccessibilityConfig {
    if (typeof localStorage === 'undefined') return DEFAULT_CONFIG;
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  private saveConfig(config: AccessibilityConfig): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Silently ignore localStorage quota errors (private browsing, storage full)
    }
  }

  public applyConfig(c: AccessibilityConfig): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    // 1. Daltonism & Contrast Filters
    root.classList.remove(
      'a11y-protanopia',
      'a11y-deuteranopia',
      'a11y-tritanopia',
      'a11y-achromatopsia',
      'a11y-high-contrast',
      'a11y-inverted',
    );
    if (c.daltonism !== 'none') {
      root.classList.add(`a11y-${c.daltonism}`);
    }

    // 2. Dyslexic Font
    if (c.dyslexicFont) {
      body.classList.add('a11y-dyslexic');
    } else {
      body.classList.remove('a11y-dyslexic');
    }

    // 3. Text Scale
    body.classList.remove(
      'a11y-scale-normal',
      'a11y-scale-large',
      'a11y-scale-xlarge',
      'a11y-scale-huge',
    );
    body.classList.add(`a11y-scale-${c.textScale}`);

    // 4. Letter Spacing
    body.classList.remove('a11y-spacing-normal', 'a11y-spacing-wide', 'a11y-spacing-wider');
    body.classList.add(`a11y-spacing-${c.letterSpacing}`);

    // 5. Line Height
    body.classList.remove('a11y-lh-normal', 'a11y-lh-relaxed', 'a11y-lh-loose');
    body.classList.add(`a11y-lh-${c.lineHeight}`);

    // 6. Big Cursor
    if (c.bigCursor) {
      body.classList.add('a11y-big-cursor');
    } else {
      body.classList.remove('a11y-big-cursor');
    }

    // 7. Highlight Links
    if (c.highlightLinks) {
      body.classList.add('a11y-highlight-links');
    } else {
      body.classList.remove('a11y-highlight-links');
    }

    // 8. Reduced Motion
    if (c.reducedMotion) {
      root.classList.add('a11y-reduced-motion');
    } else {
      root.classList.remove('a11y-reduced-motion');
    }

    // 9. Visual Guides (Ruler & Mask)
    this.updateVisualGuides(c);
  }

  // ══════════════ Visual Helpers (Ruler & Mask) ══════════════
  private updateVisualGuides(c: AccessibilityConfig): void {
    // Reading Ruler
    if (c.readingRuler) {
      if (!this.rulerEl) {
        this.rulerEl = document.createElement('div');
        this.rulerEl.className = 'a11y-reading-ruler';
        document.body.appendChild(this.rulerEl);
      }
      this.rulerEl.style.display = 'block';
    } else if (this.rulerEl) {
      this.rulerEl.style.display = 'none';
    }

    // Reading Mask
    if (c.readingMask) {
      if (!this.maskTopEl) {
        this.maskTopEl = document.createElement('div');
        this.maskTopEl.className = 'a11y-reading-mask a11y-mask-top';
        document.body.appendChild(this.maskTopEl);

        this.maskBottomEl = document.createElement('div');
        this.maskBottomEl.className = 'a11y-reading-mask a11y-mask-bottom';
        document.body.appendChild(this.maskBottomEl);
      }
      this.maskTopEl.style.display = 'block';
      if (this.maskBottomEl) this.maskBottomEl.style.display = 'block';
    } else {
      if (this.maskTopEl) this.maskTopEl.style.display = 'none';
      if (this.maskBottomEl) this.maskBottomEl.style.display = 'none';
    }
  }

  private initMouseListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('mousemove', (e: MouseEvent) => {
      const c = this.config$.value;
      if (c.readingRuler && this.rulerEl) {
        this.rulerEl.style.top = `${e.clientY - 16}px`;
      }
      if (c.readingMask && this.maskTopEl && this.maskBottomEl) {
        const h = 50; // Focus band height
        this.maskTopEl.style.height = `${Math.max(0, e.clientY - h / 2)}px`;
        this.maskBottomEl.style.top = `${e.clientY + h / 2}px`;
      }
    });

    // Voice on hover listener
    window.addEventListener('mouseover', (e: MouseEvent) => {
      const c = this.config$.value;
      if (!c.voiceOn || !c.voiceHover) return;

      const target = e.target as HTMLElement;
      if (!target) return;

      // Extract readable text from headings, paragraphs, buttons, labels
      const readableTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'P', 'BUTTON', 'A', 'LABEL', 'SPAN'];
      if (
        readableTags.includes(target.tagName) &&
        target.innerText &&
        target.innerText.trim().length > 1
      ) {
        const text = target.getAttribute('aria-label') || target.innerText.trim();
        if (text && text.length < 180) {
          this.speak(text, true);
        }
      }
    });
  }

  // ══════════════ Voice Synth (Speech-to-Text / Screen Reader) ══════════════
  public speak(text: string, isShort = false): void {
    if (!this.synth || typeof window === 'undefined') return;

    const c = this.config$.value;
    if (isShort && this.synth.speaking) {
      this.synth.cancel();
    }

    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = c.speechRate || 1.0;
    utterance.lang = c.speechLanguage || 'fr-FR';

    // Find best voice
    const voices = this.synth.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(c.speechLanguage.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      this.isSpeakingSubject.next(true);
    };
    utterance.onend = () => {
      this.isSpeakingSubject.next(false);
    };
    utterance.onerror = () => {
      this.isSpeakingSubject.next(false);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeakingSubject.next(false);
    }
  }

  // ══════════════ SVG Daltonism Color Matrices ══════════════
  private injectSvgFilters(): void {
    if (typeof document === 'undefined') return;
    if (document.getElementById('a11y-svg-filters')) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'a11y-svg-filters';
    svg.setAttribute('style', 'display:none;position:absolute;width:0;height:0;');
    svg.innerHTML = `
      <defs>
        <!-- Protanopia (Rouge déficient) -->
        <filter id="protanopia-filter">
          <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0   0.558, 0.442, 0, 0, 0   0, 0.242, 0.758, 0, 0   0, 0, 0, 1, 0"/>
        </filter>
        <!-- Deuteranopia (Vert déficient) -->
        <filter id="deuteranopia-filter">
          <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0   0.7, 0.3, 0, 0, 0   0, 0.3, 0.7, 0, 0   0, 0, 0, 1, 0"/>
        </filter>
        <!-- Tritanopia (Bleu déficient) -->
        <filter id="tritanopia-filter">
          <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0   0, 0.433, 0.567, 0, 0   0, 0.475, 0.525, 0, 0   0, 0, 0, 1, 0"/>
        </filter>
        <!-- Achromatopsia (Monochrome / Noir & Blanc) -->
        <filter id="achromatopsia-filter">
          <feColorMatrix type="matrix" values="0.299, 0.587, 0.114, 0, 0   0.299, 0.587, 0.114, 0, 0   0.299, 0.587, 0.114, 0, 0   0, 0, 0, 1, 0"/>
        </filter>
      </defs>
    `;
    document.body.appendChild(svg);
  }
}
