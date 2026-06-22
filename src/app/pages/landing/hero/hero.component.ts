import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import gsap from 'gsap';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="hero">
      <div class="hero-content">
        <!-- Eyebrow Badge -->
        <div class="eyebrow" #anim>
          <span class="eyebrow-icon">🔗</span>
          Plateforme certifiée blockchain
        </div>

        <!-- Hero Title -->
        <h1 class="hero-title" #anim>
          Le Pont Vers la<br>
          <span class="text-gradient">Compétence Certifiée</span>
        </h1>

        <!-- Subtitle -->
        <p class="hero-subtitle" #anim>
          9antra | The Bridge automatise l'intégralité du parcours formation :
          inscription, paiement, progression pédagogique et certification
          infalsifiable sur blockchain.
        </p>

        <!-- CTA Row -->
        <div class="cta-row" #anim>
          <a routerLink="/auth/register" class="btn-hero-primary" id="hero-cta-start">
            Démarrer gratuitement →
          </a>
          <a href="#fonctionnalites" class="btn-hero-ghost" id="hero-cta-demo" (click)="scrollToFeatures($event)">
            Voir la démo ▶
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
            <div class="preview-dots">
              <span></span><span></span><span></span>
            </div>
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
                    <stop offset="0%" stop-color="#C62761" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="#C62761" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,60 Q30,40 60,45 T120,30 T180,35 T240,20 T300,25"
                      stroke="#C62761" stroke-width="2" fill="none" class="chart-line"/>
                <path d="M0,60 Q30,40 60,45 T120,30 T180,35 T240,20 T300,25 V80 H0 Z"
                      fill="url(#chartGrad)" class="chart-area"/>
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
  styles: [`
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 100px 24px 60px;
      max-width: 1280px;
      margin: 0 auto;
      gap: 60px;
    }

    .hero-content {
      flex: 1;
      max-width: 640px;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 20px;
      border: 1px solid rgba(245, 166, 35, 0.3);
      border-radius: 40px;
      background: rgba(245, 166, 35, 0.08);
      color: #F5A623;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 28px;
      opacity: 0;
    }

    .hero-title {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 68px;
      line-height: 1.1;
      color: #F0F0FF;
      margin-bottom: 24px;
      opacity: 0;
    }

    .text-gradient {
      background: linear-gradient(135deg, #C62761, #F5A623);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 18px;
      font-weight: 400;
      color: #8888BB;
      line-height: 1.7;
      max-width: 540px;
      margin-bottom: 36px;
      opacity: 0;
    }

    .cta-row {
      display: flex;
      gap: 16px;
      margin-bottom: 48px;
      opacity: 0;
    }

    .btn-hero-primary {
      display: inline-flex;
      align-items: center;
      padding: 16px 36px;
      background: linear-gradient(135deg, #C62761, #F5A623);
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

    .btn-hero-ghost {
      display: inline-flex;
      align-items: center;
      padding: 16px 36px;
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #F0F0FF;
      font-family: 'Syne', sans-serif;
      font-weight: 600;
      font-size: 16px;
      border-radius: 14px;
      text-decoration: none;
      transition: all 200ms;
      height: 52px;
    }

    .btn-hero-ghost:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.45);
    }

    .stats-row {
      display: flex;
      gap: 40px;
      opacity: 0;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #F0F0FF;
    }

    .stat-label {
      font-size: 13px;
      color: #8888BB;
      margin-top: 4px;
    }

    /* Floating Preview Card */
    .hero-preview {
      flex: 0 0 380px;
      opacity: 0;
    }

    .preview-card {
      background: rgba(23, 23, 56, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(198, 39, 97, 0.2);
      border-radius: 20px;
      overflow: hidden;
      transform: rotate(3deg);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4),
                  0 0 40px rgba(198, 39, 97, 0.1);
      transition: transform 400ms ease;
    }

    .preview-card:hover {
      transform: rotate(0deg) scale(1.02);
    }

    .preview-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: rgba(0, 0, 0, 0.3);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .preview-dots {
      display: flex;
      gap: 6px;
    }

    .preview-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .preview-dots span:nth-child(1) { background: #EF4444; }
    .preview-dots span:nth-child(2) { background: #F5A623; }
    .preview-dots span:nth-child(3) { background: #10B981; }

    .preview-title {
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      color: #8888BB;
    }

    .preview-body {
      padding: 20px;
    }

    .preview-stat-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }

    .mini-stat {
      text-align: center;
      padding: 10px;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 10px;
    }

    .mini-stat-val {
      font-family: 'Space Mono', monospace;
      font-size: 20px;
      font-weight: 700;
    }

    .mini-stat-label {
      font-size: 10px;
      color: #8888BB;
      margin-top: 2px;
    }

    .chart-svg {
      width: 100%;
      height: 60px;
      margin-bottom: 12px;
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
      to { stroke-dashoffset: 0; }
    }

    @keyframes fadeIn {
      to { opacity: 1; }
    }

    .preview-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .preview-list-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #8888BB;
    }

    .pli-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .pli-name { flex: 1; }

    .pli-val {
      font-family: 'Space Mono', monospace;
      color: #F0F0FF;
    }

    @media (max-width: 1024px) {
      .hero { flex-direction: column; text-align: center; padding-top: 120px; }
      .hero-content { max-width: 100%; }
      .hero-subtitle { max-width: 100%; margin-left: auto; margin-right: auto; }
      .cta-row { justify-content: center; flex-wrap: wrap; }
      .stats-row { justify-content: center; flex-wrap: wrap; }
      .hero-preview { flex: none; width: 100%; max-width: 400px; }
    }

    @media (max-width: 640px) {
      .hero-title { font-size: 40px; }
      .hero-subtitle { font-size: 16px; }
      .stats-row { gap: 20px; }
      .cta-row { flex-direction: column; align-items: center; }
    }
  `]
})
export class HeroComponent implements AfterViewInit {
  @ViewChildren('anim') animElements!: QueryList<ElementRef>;

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

  ngAfterViewInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.animElements.forEach(el => el.nativeElement.style.opacity = '1');
      return;
    }

    const elements = this.animElements.toArray().map(el => el.nativeElement);
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
      let current = start + (target - start) * eased;

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
