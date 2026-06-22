import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimatedBgComponent } from '../../shared/components/animated-bg/animated-bg.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HeroComponent } from './hero/hero.component';
import { FeaturesComponent } from './features/features.component';
import { RolesComponent } from './roles/roles.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    AnimatedBgComponent,
    NavbarComponent,
    HeroComponent,
    FeaturesComponent,
    RolesComponent,
    AboutComponent,
    ContactComponent,
    FooterComponent,
  ],
  template: `
    <app-animated-bg></app-animated-bg>
    <app-navbar></app-navbar>
    <main class="landing-main">
      <app-hero></app-hero>
      <app-features id="fonctionnalites"></app-features>
      <app-roles></app-roles>
      <app-about id="apropos"></app-about>
      <app-contact id="contact"></app-contact>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    .landing-main {
      position: relative;
      z-index: 1;
    }
  `]
})
export class LandingComponent {}
