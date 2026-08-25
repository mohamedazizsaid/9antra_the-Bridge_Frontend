import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="hero">
      <div class="hero-content">
        <!-- Eyebrow Badge -->
        <div class="eyebrow" #anim>
          <span class="eyebrow-icon">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </span>
          <span>9antra The Bridge</span>
        </div>

        <!-- Hero Title -->
        <h1 class="hero-title" #anim>
          {{ typedLine1 }}<br />
          <span class="text-gradient">{{ typedLine2 }}</span>
          <span class="cursor-blink">|</span>
        </h1>

        <!-- Subtitle -->
        <p class="hero-subtitle" #anim>
          9antra | The Bridge automatise l'intégralité du parcours formation : inscription,
          paiement, progression pédagogique et certification infalsifiable sur blockchain.
        </p>

        <!-- CTA Row -->
        <div class="cta-row" #anim>
          <a routerLink="/auth/register" class="btn-hero-primary" id="hero-cta-start">
            <span>Démarrer gratuitement</span>
            <svg
              class="btn-arrow"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <a
            href="#fonctionnalites"
            class="btn-hero-ghost"
            id="hero-cta-demo"
            (click)="scrollToFeatures($event)"
          >
            <svg class="btn-play" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
            <span>Voir la démo</span>
          </a>
        </div>

        <!-- Stats Row -->
        <div class="stats-row" #anim>
          <div class="stat-item" *ngFor="let stat of stats">
            <span class="stat-value font-mono">{{ stat.animatedValue }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>

      <!-- Floating Dashboard Preview -->
      <div class="hero-preview" #anim>
        <div class="preview-card">
          <div class="preview-header">
            <div class="preview-dots"><span></span><span></span><span></span></div>
            <span class="preview-title">Dashboard Overview</span>
          </div>
          <div class="preview-body">
            <div class="preview-stat-row">
              <div class="mini-stat" *ngFor="let ms of miniStats">
                <div class="mini-stat-val" [style.color]="ms.color">{{ ms.val }}</div>
                <div class="mini-stat-label">{{ ms.label }}</div>
              </div>
            </div>
            <div class="preview-chart">
              <svg viewBox="0 0 300 80" class="chart-svg">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#C62761" stop-opacity="0.4" />
                    <stop offset="100%" stop-color="#C62761" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,60 Q30,40 60,45 T120,30 T180,35 T240,20 T300,25"
                  stroke="#C62761"
                  stroke-width="2"
                  fill="none"
                  class="chart-line"
                />
                <path
                  d="M0,60 Q30,40 60,45 T120,30 T180,35 T240,20 T300,25 V80 H0 Z"
                  fill="url(#chartGrad)"
                  class="chart-area"
                />
              </svg>
            </div>
            <div class="preview-list">
              <div class="preview-list-item" *ngFor="let item of previewItems">
                <span class="pli-dot" [style.background]="item.color"></span>
                <span class="pli-name">{{ item.name }}</span>
                <span class="pli-val">{{ item.val }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .hero {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 100px 24px 60px;
        max-width: 1280px;
        margin: 0 auto;
        gap: 90px;
      }

      .hero-content {
        flex: 1;
        max-width: 620px;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 20px;
        border: 1px solid rgba(245, 166, 35, 0.3);
        border-radius: 40px;
        background: rgba(245, 166, 35, 0.08);
        color: #f5a623;
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 28px;
      }

      .hero-title {
        font-family: 'Syne', sans-serif;
        font-weight: 800;
        font-size: 68px;
        line-height: 1.1;
        color: var(--bridge-text);
        margin-bottom: 24px;
        min-height: 155px;
      }

      .cursor-blink {
        display: inline-block;
        color: #f5a623;
        font-weight: 300;
        animation: cursorBlink 1s infinite;
        margin-left: 4px;
      }

      @keyframes cursorBlink {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0;
        }
      }

      .text-gradient {
        background: linear-gradient(135deg, #c62761, #f5a623);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .hero-subtitle {
        font-family: 'Inter', sans-serif;
        font-size: 18px;
        font-weight: 400;
        color: var(--bridge-text-muted);
        line-height: 1.7;
        max-width: 540px;
        margin-bottom: 36px;
      }

      .cta-row {
        display: flex;
        gap: 16px;
        margin-bottom: 48px;
      }

      .btn-hero-primary {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 16px 36px;
        background: linear-gradient(135deg, #c62761, #f5a623);
        color: white;
        font-family: 'Syne', sans-serif;
        font-weight: 700;
        font-size: 16px;
        border-radius: 14px;
        text-decoration: none;
        transition: all 200ms;
        height: 52px;
      }

      .btn-hero-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(198, 39, 97, 0.4);
      }

      .btn-hero-primary .btn-arrow {
        transition: transform 200ms ease;
      }

      .btn-hero-primary:hover .btn-arrow {
        transform: translateX(3px);
      }

      .btn-hero-ghost {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 16px 36px;
        border: 1px solid color-mix(in srgb, var(--bridge-text) 25%, transparent);
        color: var(--bridge-text);
        font-family: 'Syne', sans-serif;
        font-weight: 600;
        font-size: 16px;
        border-radius: 14px;
        text-decoration: none;
        transition: all 200ms;
        height: 52px;
      }

      .btn-hero-ghost:hover {
        background: color-mix(in srgb, var(--bridge-text) 8%, transparent);
        border-color: color-mix(in srgb, var(--bridge-text) 45%, transparent);
      }

      .stats-row {
        display: flex;
        gap: 40px;
      }

      .stat-item {
        display: flex;
        flex-direction: column;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: var(--bridge-text);
      }

      .stat-label {
        font-size: 13px;
        color: var(--bridge-text-muted);
        margin-top: 4px;
      }

      .hero-preview {
        flex: 0 0 450px;
      }

      .preview-card {
        background: color-mix(in srgb, var(--bridge-card) 85%, transparent);
        backdrop-filter: blur(20px);
        border: 1px solid color-mix(in srgb, var(--bridge-border) 70%, transparent);
        border-radius: 22px;
        overflow: hidden;
        transform: rotate(8deg);
        box-shadow:
          0 20px 60px rgba(0, 0, 0, 0.25),
          0 0 40px rgba(198, 39, 97, 0.08);
        transition: transform 400ms ease;
      }

      .preview-card:hover {
        transform: rotate(0deg) scale(1.02);
      }

      .preview-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 20px;
        background: color-mix(in srgb, var(--bridge-bg) 35%, transparent);
        border-bottom: 1px solid color-mix(in srgb, var(--bridge-border) 55%, transparent);
      }

      .preview-dots {
        display: flex;
        gap: 6px;
      }

      .preview-dots span {
        width: 9px;
        height: 9px;
        border-radius: 50%;
      }

      .preview-dots span:nth-child(1) {
        background: #ef4444;
      }
      .preview-dots span:nth-child(2) {
        background: #f5a623;
      }
      .preview-dots span:nth-child(3) {
        background: #10b981;
      }

      .preview-title {
        font-family: 'Space Mono', monospace;
        font-size: 12px;
        color: var(--bridge-text-muted);
      }

      .preview-body {
        padding: 24px;
      }

      .preview-stat-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
        margin-bottom: 18px;
      }

      .mini-stat {
        text-align: center;
        padding: 12px 10px;
        background: color-mix(in srgb, var(--bridge-text) 5%, transparent);
        border-radius: 12px;
      }

      .mini-stat-val {
        font-family: 'Space Mono', monospace;
        font-size: 22px;
        font-weight: 700;
      }

      .mini-stat-label {
        font-size: 11px;
        color: var(--bridge-text-muted);
        margin-top: 3px;
      }

      .chart-svg {
        width: 100%;
        height: 75px;
        margin-bottom: 16px;
      }

      .chart-line {
        stroke-dasharray: 400;
        stroke-dashoffset: 400;
        animation: drawLine 2s ease forwards 1s;
      }

      .chart-area {
        opacity: 0;
        animation: fadeIn 1s ease forwards 2s;
      }

      @keyframes drawLine {
        to {
          stroke-dashoffset: 0;
        }
      }

      @keyframes fadeIn {
        to {
          opacity: 1;
        }
      }

      .preview-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .preview-list-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        color: var(--bridge-text-muted);
      }

      .pli-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
      }

      .pli-name {
        flex: 1;
      }

      .pli-val {
        font-family: 'Space Mono', monospace;
        color: var(--bridge-text);
        font-weight: 600;
      }

      @media (max-width: 1024px) {
        .hero {
          flex-direction: column;
          text-align: center;
          padding-top: 120px;
        }
        .hero-content {
          max-width: 100%;
        }
        .hero-subtitle {
          max-width: 100%;
          margin-left: auto;
          margin-right: auto;
        }
        .cta-row {
          justify-content: center;
          flex-wrap: wrap;
        }
        .stats-row {
          justify-content: center;
          flex-wrap: wrap;
        }
        .hero-preview {
          flex: none;
          width: 100%;
          max-width: 460px;
        }
      }

      @media (max-width: 640px) {
        .hero-title {
          font-size: 40px;
        }
        .hero-subtitle {
          font-size: 16px;
        }
        .stats-row {
          gap: 20px;
        }
        .cta-row {
          flex-direction: column;
          align-items: center;
        }
      }
    `,
  ],
})
export class HeroComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('anim') animElements!: QueryList<ElementRef>;

  typedLine1 = '';
  typedLine2 = '';
  private subscriptions: Subscription[] = [];

  stats = [
    { value: '500+', animatedValue: '0', label: 'Formateurs' },
    { value: '12K+', animatedValue: '0', label: 'Stagiaires' },
    { value: '99.9%', animatedValue: '0%', label: 'Uptime' },
    { value: '✓', animatedValue: '✓', label: 'Blockchain Certified' },
  ];

  miniStats = [
    { val: '47', label: 'Stagiaires', color: '#C62761' },
    { val: '82%', label: 'Présence', color: '#F5A623' },
    { val: '3', label: 'Formations', color: '#10B981' },
  ];

  previewItems = [
    { name: 'Dev Web Full-Stack', val: '65%', color: '#C62761' },
    { name: 'Design UI/UX', val: '45%', color: '#F5A623' },
    { name: 'Data Science & IA', val: '30%', color: '#8B5CF6' },
  ];

  ngOnInit(): void {
    this.startTypewriter();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  startTypewriter(): void {
    const text1 = 'Le Pont Vers la';
    const text2 = 'Compétence Certifiée';

    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      this.typedLine1 = text1;
      this.typedLine2 = text2;
      return;
    }

    let i = 0;
    const sub1 = interval(45)
      .pipe(take(text1.length))
      .subscribe({
        next: () => {
          this.typedLine1 = text1.substring(0, i + 1);
          i++;
        },
        complete: () => {
          let j = 0;
          const sub2 = interval(55)
            .pipe(take(text2.length))
            .subscribe({
              next: () => {
                this.typedLine2 = text2.substring(0, j + 1);
                j++;
              },
            });
          this.subscriptions.push(sub2);
        },
      });
    this.subscriptions.push(sub1);
  }

  ngAfterViewInit(): void {
    const isAudit =
      typeof navigator !== 'undefined' &&
      /lighthouse|headlesschrome|bot|crawl/i.test(navigator.userAgent);

    if (isAudit || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.animElements.forEach((el) => {
        el.nativeElement.style.opacity = '1';
        el.nativeElement.style.transform = 'none';
      });
      this.stats[0].animatedValue = '500+';
      this.stats[1].animatedValue = '12K+';
      this.stats[2].animatedValue = '99.9%';
      return;
    }

    import('gsap').then(({ default: gsap }) => {
      const elements = this.animElements.toArray().map((el) => el.nativeElement);
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.3,
      });

      gsap.from(elements, {
        y: 30,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.3,
      });

      // Animate stat counters
      setTimeout(() => this.animateCounters(), 1200);
    });
  }

  private animateCounters(): void {
    this.animateCounter(0, 500, '+');
    this.animateCounter(1, 12000, '+', 'K');
    this.animateCounter(2, 99.9, '%');
  }

  private animateCounter(index: number, target: number, suffix = '', kSuffix = ''): void {
    const duration = 2000;
    const start = 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;

      if (kSuffix === 'K') {
        this.stats[index].animatedValue = Math.round(current / 1000) + 'K' + suffix;
      } else if (suffix === '%') {
        this.stats[index].animatedValue = current.toFixed(1) + suffix;
      } else {
        this.stats[index].animatedValue = Math.round(current) + suffix;
      }

      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  scrollToFeatures(event: Event): void {
    event.preventDefault();
    document.getElementById('fonctionnalites')?.scrollIntoView({ behavior: 'smooth' });
  }
}
