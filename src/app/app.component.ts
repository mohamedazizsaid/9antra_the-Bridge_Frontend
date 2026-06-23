import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'the_bridge_frontend';
  theme: 'dark' | 'light' = 'dark';

  ngOnInit(): void {
    const storedTheme = localStorage.getItem('bridge_theme') as 'dark' | 'light' | null;
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    this.theme = storedTheme || (prefersLight ? 'light' : 'dark');
    this.applyTheme();
  }

  toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('bridge_theme', this.theme);
    this.applyTheme();
  }

  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.theme);
    document.body.setAttribute('data-theme', this.theme);
  }
}
