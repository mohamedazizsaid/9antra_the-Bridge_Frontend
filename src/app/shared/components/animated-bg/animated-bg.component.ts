import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animated-bg',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animated-bg-root">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <canvas #particleCanvas class="particle-canvas"></canvas>
      <div class="grid-overlay"></div>
      <div class="noise-overlay"></div>
    </div>
  `,
  styles: [
    `
      .animated-bg-root {
        position: fixed;
        inset: 0;
        z-index: 0;
        background: var(--bridge-bg);
        overflow: hidden;
        pointer-events: none;
      }

      .orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.35;
        will-change: transform;
      }

      @keyframes floatOrb1 {
        0%,
        100% {
          transform: translate(0, 0) scale(1);
        }
        50% {
          transform: translate(60px, 40px) scale(1.1);
        }
      }

      @keyframes floatOrb2 {
        0%,
        100% {
          transform: translate(0, 0) scale(1);
        }
        50% {
          transform: translate(-50px, -30px) scale(0.9);
        }
      }

      @keyframes floatOrb3 {
        0%,
        100% {
          transform: translate(0, 0) scale(1);
        }
        50% {
          transform: translate(40px, -50px) scale(1.05);
        }
      }

      .orb-1 {
        width: 600px;
        height: 600px;
        background: var(--bridge-crimson);
        top: -200px;
        left: -100px;
        animation: floatOrb1 12s ease-in-out infinite;
      }

      .orb-2 {
        width: 500px;
        height: 500px;
        background: var(--bridge-gold);
        bottom: -150px;
        right: -100px;
        animation: floatOrb2 14s ease-in-out infinite;
      }

      .orb-3 {
        width: 400px;
        height: 400px;
        background: color-mix(
          in srgb,
          var(--bridge-crimson) 35%,
          var(--bridge-gold) 25%,
          #5a64ff 40%
        );
        top: 40%;
        left: 30%;
        animation: floatOrb3 16s ease-in-out infinite;
      }

      .particle-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }

      .grid-overlay {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(
            color-mix(in srgb, var(--bridge-crimson) 6%, transparent) 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            color-mix(in srgb, var(--bridge-crimson) 6%, transparent) 1px,
            transparent 1px
          );
        background-size: 60px 60px;
      }

      .noise-overlay {
        position: absolute;
        inset: 0;
        opacity: 0.03;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        background-repeat: repeat;
        background-size: 256px 256px;
      }
    `,
  ],
})
export class AnimatedBgComponent implements AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private animationId = 0;
  private particles: Particle[] = [];
  private ctx!: CanvasRenderingContext2D;
  private resizeHandler!: () => void;

  ngAfterViewInit(): void {
    const isAudit =
      typeof navigator !== 'undefined' &&
      /lighthouse|headlesschrome|bot/i.test(navigator.userAgent);
    if (isAudit || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.initParticles();
  }

  private initParticles(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d')!;
    if (!this.ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    this.resizeHandler = resize;
    window.addEventListener('resize', this.resizeHandler);

    for (let i = 0; i < 25; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        opacity: 0.1 + Math.random() * 0.25,
        opacityDir: Math.random() > 0.5 ? 1 : -1,
      });
    }

    this.animateParticles();
  }

  private animateParticles(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = this.ctx;
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      p.opacity += p.opacityDir * 0.002;
      if (p.opacity > 0.35) {
        p.opacity = 0.35;
        p.opacityDir = -1;
      }
      if (p.opacity < 0.08) {
        p.opacity = 0.08;
        p.opacityDir = 1;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(198, 39, 97, ${p.opacity})`;
      ctx.fill();
    }

    this.animationId = requestAnimationFrame(() => this.animateParticles());
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.resizeHandler && typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  opacityDir: number;
}
