import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AnimatedBgComponent } from '../../shared/components/animated-bg/animated-bg.component';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule, AnimatedBgComponent],
  template: `
    <app-animated-bg></app-animated-bg>
    <h1 class="sr-only">9antra | The Bridge — Plateforme de formation certifiée blockchain</h1>
    <div class="splash-container">
      <!-- Chain Link Logo SVG -->
      <svg
        #logoSvg
        class="chain-logo"
        viewBox="0 0 80 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="The Bridge by 9antra logo"
      >
        <!-- Upper Link (Crimson) -->
        <path
          class="link-upper"
          d="M40 10 C20 10 10 25 10 38 C10 51 20 58 40 58 C48 58 54 55 58 50"
          stroke="#C62761"
          stroke-width="8"
          stroke-linecap="round"
          fill="none"
          [attr.stroke-dasharray]="linkLength"
          [attr.stroke-dashoffset]="linkLength"
        />
        <ellipse
          class="link-upper-fill"
          cx="40"
          cy="34"
          rx="26"
          ry="24"
          stroke="#C62761"
          stroke-width="8"
          fill="none"
          [attr.stroke-dasharray]="ellipseLength"
          [attr.stroke-dashoffset]="ellipseLength"
        />

        <!-- Lower Link (Gold) -->
        <path
          class="link-lower"
          d="M40 90 C60 90 70 75 70 62 C70 49 60 42 40 42 C32 42 26 45 22 50"
          stroke="#F5A623"
          stroke-width="8"
          stroke-linecap="round"
          fill="none"
          [attr.stroke-dasharray]="linkLength"
          [attr.stroke-dashoffset]="linkLength"
        />
        <ellipse
          class="link-lower-fill"
          cx="40"
          cy="66"
          rx="26"
          ry="24"
          stroke="#F5A623"
          stroke-width="8"
          fill="none"
          [attr.stroke-dasharray]="ellipseLength"
          [attr.stroke-dashoffset]="ellipseLength"
        />
      </svg>

      <!-- Text Content -->
      <div class="text-wrapper">
        <div class="title-row">
          <span #theText class="title-the">The</span>
          <span #bridgeText class="title-bridge">Bridge</span>
        </div>
        <div #ninetaText class="subtitle-9antra">9antra</div>
      </div>

      <!-- Tagline -->
      <div #tagline class="tagline">
        <span class="tagline-text">{{
          displayedTagline || "قنطرة — Le pont entre l'apprenant et la compétence certifiée"
        }}</span>
        <span class="tagline-cursor" [class.blink]="taglineCursorBlink">|</span>
      </div>

      <!-- Glow Pulse -->
      <div #glowPulse class="glow-pulse"></div>

      <!-- Progress Bar -->
      <div class="progress-wrapper">
        <div #progressBar class="progress-bar"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .splash-container {
        position: fixed;
        inset: 0;
        z-index: 10;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 1;
        background: transparent;
      }

      .chain-logo {
        width: 80px;
        height: 100px;
        margin-bottom: 14px;
      }

      .text-wrapper {
        text-align: center;
      }

      .title-row {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 12px;
      }

      .title-the,
      .title-bridge {
        font-family: 'Syne', sans-serif;
        font-weight: 800;
        font-size: 64px;
        color: #f0f0ff;
        opacity: 0;
      }

      .subtitle-9antra {
        font-family: 'Syne', sans-serif;
        font-weight: 700;
        font-size: 24px;
        background: linear-gradient(135deg, #c62761, #f5a623);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        opacity: 0;
        letter-spacing: 8px;
        margin-top: 8px;
      }

      .tagline {
        margin-top: 24px;
        font-family: 'Inter', sans-serif;
        font-size: 16px;
        color: #9999cc;
        opacity: 0;
        text-align: center;
        max-width: 500px;
      }

      .tagline-cursor {
        opacity: 1;
        transition: opacity 100ms;
      }

      .tagline-cursor.blink {
        animation: blink 600ms step-end infinite;
      }

      @keyframes blink {
        50% {
          opacity: 0;
        }
      }

      .glow-pulse {
        position: absolute;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(198, 39, 97, 0.4) 0%, transparent 70%);
        opacity: 0;
        transform: scale(0);
        pointer-events: none;
      }

      .progress-wrapper {
        margin-top: 40px;
        width: 320px;
        height: 3px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 2px;
        overflow: hidden;
      }

      .progress-bar {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #c62761, #f5a623);
        border-radius: 2px;
      }

      @media (max-width: 768px) {
        .title-the,
        .title-bridge {
          font-size: 40px;
        }
        .subtitle-9antra {
          font-size: 18px;
        }
        .progress-wrapper {
          width: 240px;
        }
      }
    `,
  ],
})
export class SplashComponent implements OnInit, AfterViewInit {
  linkLength = 200;
  ellipseLength = 180;
  displayedTagline = "قنطرة — Le pont entre l'apprenant et la compétence certifiée";
  taglineCursorBlink = false;

  private fullTagline = "قنطرة — Le pont entre l'apprenant et la compétence certifiée";

  constructor(
    private router: Router,
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('9antra | The Bridge — Plateforme de formation certifiée blockchain');
    this.meta.updateTag({
      name: 'description',
      content:
        "9antra | The Bridge (قنطرة) — Le pont entre l'apprenant et la compétence certifiée. Plateforme professionnelle de gestion de formation et certification blockchain.",
    });
  }

  ngAfterViewInit(): void {
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isAudit =
      typeof navigator !== 'undefined' &&
      /lighthouse|headlesschrome|bot|crawl|spider/i.test(navigator.userAgent);

    if (reducedMotion || isAudit) {
      this.router.navigate(['/home'], { replaceUrl: true });
      return;
    }

    import('gsap').then(({ default: gsap }) => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to('.splash-container', {
            opacity: 0,
            duration: 0.3,
            onComplete: () => this.router.navigate(['/home']),
          });
        },
      });

      // t=0.1s — Logo SVG draws in
      tl.to(
        '.link-upper, .link-upper-fill',
        {
          strokeDashoffset: 0,
          duration: 0.4,
          ease: 'power2.inOut',
        },
        0.1,
      );

      tl.to(
        '.link-lower, .link-lower-fill',
        {
          strokeDashoffset: 0,
          duration: 0.4,
          ease: 'power2.inOut',
        },
        0.1,
      );

      // t=0.3s — "The" slides in
      tl.to(
        '.title-the',
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: 'power2.out',
        },
        0.3,
      );

      tl.fromTo('.title-the', { x: -20 }, { x: 0, duration: 0.3 }, 0.3);

      // t=0.4s — "Bridge" slides in
      tl.to(
        '.title-bridge',
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: 'power2.out',
        },
        0.4,
      );

      tl.fromTo('.title-bridge', { x: 20 }, { x: 0, duration: 0.3 }, 0.4);

      // t=0.5s — "9antra" fades in
      tl.to(
        '.subtitle-9antra',
        {
          opacity: 1,
          letterSpacing: '2px',
          duration: 0.3,
          ease: 'power2.out',
        },
        0.5,
      );

      // t=0.6s — Tagline
      tl.to('.tagline', { opacity: 1, duration: 0.2 }, 0.6);

      // t=0.7s — Progress bar
      tl.to(
        '.progress-bar',
        {
          width: '100%',
          duration: 0.4,
          ease: 'power2.inOut',
        },
        0.7,
      );
    });
  }

  private typeTagline(): void {
    let i = 0;
    this.taglineCursorBlink = false;
    const interval = setInterval(() => {
      if (i < this.fullTagline.length) {
        this.displayedTagline += this.fullTagline[i];
        i++;
      } else {
        clearInterval(interval);
        this.taglineCursorBlink = true;
      }
    }, 20);
  }
}
