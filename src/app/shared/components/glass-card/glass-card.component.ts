import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-glass-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card p-6" [ngClass]="extraClass">
      <ng-content></ng-content>
    </div>
  `
})
export class GlassCardComponent {
  @Input() extraClass = '';
}
