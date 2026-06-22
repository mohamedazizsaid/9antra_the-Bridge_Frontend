import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeago', standalone: true })
export class TimeagoPipe implements PipeTransform {
  transform(value: Date | string): string {
    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'à l\'instant';
    if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `il y a ${Math.floor(seconds / 86400)}j`;
    if (seconds < 2592000) return `il y a ${Math.floor(seconds / 604800)} sem.`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}
