import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';

@Component({
  selector: 'app-animated-bg',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animated-bg-root">
      <div class="orb orb-1" #orb1></div>
      <div class="orb orb-2" #orb2></div>
      <div class="orb orb-3" #orb3></div>
      <canvas #particleCanvas class="particle-canvas"></canvas>
      <div class="grid-overlay"></div>
      <div class="noise-overlay"></div>
    </div>
  `,
  styles: [`
    .animated-bg-root {
      position: fixed;
      inset: 0;
      z-index: 0;
      background: #08081A;
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

    .orb-1 {
      width: 600px;
      height: 600px;
      background: #C62761;
      top: -200px;
      left: -100px;
    }

    .orb-2 {
      width: 500px;
      height: 500px;
      background: #F5A623;
      bottom: -150px;
      right: -100px;
    }

    .orb-3 {
      width: 400px;
      height: 400px;
      background: #6B2FA0;
      top: 40%;
      left: 30%;
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
        linear-gradient(rgba(198, 39, 97, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(198, 39, 97, 0.04) 1px, transparent 1px);
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
  `]
})
export class AnimatedBgComponent implements AfterViewInit, OnDestroy {
  @ViewChild('orb1') orb1!: ElementRef;
  @ViewChild('orb2') orb2!: ElementRef;
  @ViewChild('orb3') orb3!: ElementRef;
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private animationId = 0;
  private particles: Particle[] = [];
  private ctx!: CanvasRenderingContext2D;
  private resizeHandler!: () => void;

  ngAfterViewInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.animateOrbs();
    this.initParticles();
  }

  private animateOrbs(): void {
    const orbs = [this.orb1, this.orb2, this.orb3];
    orbs.forEach((orb, i) => {
      const el = orb.nativeElement;
      const randomX = () => (Math.random() - 0.5) * 200;
      const randomY = () => (Math.random() - 0.5) * 200;
      const duration = 8 + i * 2 + Math.random() * 4;

      gsap.to(el, {
        x: randomX(),
        y: randomY(),
        duration: duration,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 1.5,
      });

      gsap.to(el, {
        scale: 0.8 + Math.random() * 0.4,
        duration: duration * 1.3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.8,
      });
    });
  }

  private initParticles(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    this.resizeHandler = resize;
    window.addEventListener('resize', this.resizeHandler);

    for (let i = 0; i < 60; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: 0.1 + Math.random() * 0.3,
        opacityDir: Math.random() > 0.5 ? 1 : -1,
      });
    }

    this.animateParticles();
  }

  private animateParticles(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Update + draw particles
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      // Pulse opacity
      p.opacity += p.opacityDir * 0.002;
      if (p.opacity > 0.4) { p.opacity = 0.4; p.opacityDir = -1; }
      if (p.opacity < 0.1) { p.opacity = 0.1; p.opacityDir = 1; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(198, 39, 97, ${p.opacity})`;
      ctx.fill();
    }

    // Draw connecting lines
    for (let i = 0; i < this.particles.length; i++) {
      let connections = 0;
      for (let j = i + 1; j < this.particles.length && connections < 3; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.15;
          ctx.beginPath();
          ctx.moveTo(this.particles[i].x, this.particles[i].y);
          ctx.lineTo(this.particles[j].x, this.particles[j].y);
          ctx.strokeStyle = `rgba(198, 39, 97, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          connections++;
        }
      }
    }

    this.animationId = requestAnimationFrame(() => this.animateParticles());
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
    gsap.killTweensOf([
      this.orb1?.nativeElement,
      this.orb2?.nativeElement,
      this.orb3?.nativeElement,
    ]);
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
