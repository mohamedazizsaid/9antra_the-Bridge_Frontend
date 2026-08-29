import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../core/services/translation.service';

/**
 * Usage in templates:  {{ 'settings.profile.firstName' | translate }}
 *
 * pure: false → re-evaluates on every change detection cycle so that
 * switching languages updates all pipes without manually triggering CD.
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private lastKey = '';
  private lastValue = '';
  private langSub: Subscription;

  constructor(
    private translationService: TranslationService,
    private cd: ChangeDetectorRef,
  ) {
    // Re-trigger CD when the language changes so *all* rendered pipes refresh
    this.langSub = this.translationService.lang$.subscribe(() => {
      this.lastKey = ''; // bust cache
      this.cd.markForCheck();
    });
  }

  transform(key: string): string {
    if (key === this.lastKey) {
      return this.lastValue;
    }
    this.lastKey = key;
    this.lastValue = this.translationService.t(key);
    return this.lastValue;
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }
}
