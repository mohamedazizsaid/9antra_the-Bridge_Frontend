import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appRipple]',
  standalone: true
})
export class RippleDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    this.renderer.setStyle(this.el.nativeElement, 'overflow', 'hidden');
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = this.el.nativeElement;
    const circle = this.renderer.createElement('span');
    const diameter = Math.max(target.clientWidth, target.clientHeight);
    const radius = diameter / 2;

    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left - radius;
    const y = event.clientY - rect.top - radius;

    this.renderer.setStyle(circle, 'width', `${diameter}px`);
    this.renderer.setStyle(circle, 'height', `${diameter}px`);
    this.renderer.setStyle(circle, 'left', `${x}px`);
    this.renderer.setStyle(circle, 'top', `${y}px`);
    this.renderer.setStyle(circle, 'position', 'absolute');
    this.renderer.setStyle(circle, 'border-radius', '50%');
    this.renderer.setStyle(circle, 'background', 'rgba(255, 255, 255, 0.3)');
    this.renderer.setStyle(circle, 'transform', 'scale(0)');
    this.renderer.setStyle(circle, 'pointer-events', 'none');
    this.renderer.setStyle(circle, 'transition', 'transform 600ms ease-out, opacity 600ms ease-out');

    this.renderer.appendChild(target, circle);

    // Trigger reflow & animation
    setTimeout(() => {
      this.renderer.setStyle(circle, 'transform', 'scale(3)');
      this.renderer.setStyle(circle, 'opacity', '0');
    }, 10);

    setTimeout(() => {
      this.renderer.removeChild(target, circle);
    }, 600);
  }
}
