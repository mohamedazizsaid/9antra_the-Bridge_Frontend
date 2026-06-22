import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <!-- Glow effect -->
      <div class="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div class="flex items-center justify-between">
        <div>
          <span class="text-sm font-medium text-[var(--bridge-text-muted)] uppercase tracking-wider">{{ label }}</span>
          <h3 class="text-3xl font-bold mt-2 text-white">{{ value }}</h3>
        </div>
        <div class="p-3 rounded-lg bg-[rgba(255,255,255,0.05)] text-[var(--bridge-gold)]">
          <ng-content select="[icon]"></ng-content>
        </div>
      </div>
      
      <div *ngIf="trend" class="mt-4 flex items-center gap-1.5 text-xs">
        <span [ngClass]="trendPositive ? 'text-emerald-400' : 'text-rose-400'" class="font-semibold">
          {{ trendPositive ? '↑' : '↓' }} {{ trend }}
        </span>
        <span class="text-[var(--bridge-text-muted)]">{{ trendLabel }}</span>
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() trend = '';
  @Input() trendPositive = true;
  @Input() trendLabel = '';
}
