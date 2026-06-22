import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RevealDirective],
  template: `
    <section class="contact-section">
      <div class="contact-card glass-card" appReveal>
        <!-- Form State -->
        <div *ngIf="!submitted" class="contact-form-wrapper">
          <h2 class="contact-title">Prenez contact avec nous</h2>
          <p class="contact-subtitle">Notre équipe vous répondra dans les 24 heures</p>

          <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="contact-form">
            <div class="form-group">
              <input formControlName="nom" class="input-dark" placeholder="Votre nom complet"
                     id="contact-name" />
              <span class="error-text" *ngIf="contactForm.get('nom')?.touched && contactForm.get('nom')?.invalid">
                Veuillez entrer votre nom
              </span>
            </div>

            <div class="form-group">
              <input formControlName="email" class="input-dark" placeholder="Adresse email" type="email"
                     id="contact-email" />
              <span class="error-text" *ngIf="contactForm.get('email')?.touched && contactForm.get('email')?.invalid">
                Veuillez entrer un email valide
              </span>
            </div>

            <div class="form-group">
              <select formControlName="sujet" class="input-dark" id="contact-subject">
                <option value="" disabled>Sujet</option>
                <option value="formation">Formation</option>
                <option value="stage">Stage</option>
                <option value="partenariat">Partenariat</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div class="form-group">
              <textarea formControlName="message" class="input-dark textarea" placeholder="Message"
                        rows="4" id="contact-message"></textarea>
              <span class="error-text" *ngIf="contactForm.get('message')?.touched && contactForm.get('message')?.invalid">
                Veuillez entrer votre message
              </span>
            </div>

            <button type="submit" class="btn-primary btn-full" id="contact-submit"
                    [disabled]="contactForm.invalid || sending">
              {{ sending ? 'Envoi en cours...' : 'Envoyer le message →' }}
            </button>
          </form>
        </div>

        <!-- Success State -->
        <div *ngIf="submitted" class="success-state">
          <div class="success-check">✓</div>
          <h3 class="success-title">Message envoyé !</h3>
          <p class="success-text">Nous vous répondrons très bientôt.</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .contact-section {
      padding: 120px 24px;
      max-width: 700px;
      margin: 0 auto;
    }

    .contact-card {
      padding: 56px 48px;
    }

    .contact-title {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 36px;
      color: #F0F0FF;
      text-align: center;
      margin-bottom: 8px;
    }

    .contact-subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      color: #8888BB;
      text-align: center;
      margin-bottom: 40px;
    }

    .contact-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .textarea {
      resize: vertical;
      min-height: 100px;
    }

    .btn-full {
      width: 100%;
      height: 54px;
    }

    .btn-full:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-text {
      font-size: 12px;
      color: #EF4444;
      padding-left: 4px;
    }

    select.input-dark {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%238888BB' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
    }

    select.input-dark option {
      background: #171738;
      color: #F0F0FF;
    }

    /* Success State */
    .success-state {
      text-align: center;
      padding: 40px 0;
    }

    .success-check {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10B981, #059669);
      color: white;
      font-size: 36px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      animation: scaleIn 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes scaleIn {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .success-title {
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 28px;
      color: #F0F0FF;
      margin-bottom: 8px;
    }

    .success-text {
      font-size: 16px;
      color: #F5A623;
    }

    @media (max-width: 640px) {
      .contact-card { padding: 32px 20px; }
      .contact-title { font-size: 28px; }
    }
  `]
})
export class ContactComponent {
  contactForm: FormGroup;
  submitted = false;
  sending = false;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      sujet: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) return;
    this.sending = true;
    setTimeout(() => {
      this.sending = false;
      this.submitted = true;
    }, 1200);
  }
}
