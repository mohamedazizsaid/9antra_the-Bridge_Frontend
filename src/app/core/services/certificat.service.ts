import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Certificat } from '../models/certificat.model';

@Injectable({ providedIn: 'root' })
export class CertificatService {

  private mockCertificats: Certificat[] = [
    {
      id: 'cert1', stagiaireId: '3', formationId: 'f1',
      formationNom: 'Développement Web Full-Stack', phaseNom: 'Fondamentaux Web',
      dateObtention: new Date('2026-04-18'),
      hashBlockchain: '0x7a3b9c2d8e1f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
      qrCodeUrl: '', pdfUrl: '', verified: true
    },
    {
      id: 'cert2', stagiaireId: '3', formationId: 'f2',
      formationNom: 'Design UI/UX', phaseNom: 'Principes UX',
      dateObtention: new Date('2026-05-20'),
      hashBlockchain: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
      qrCodeUrl: '', pdfUrl: '', verified: true
    },
    {
      id: 'cert3', stagiaireId: '3', formationId: 'f1',
      formationNom: 'Développement Web Full-Stack', phaseNom: 'Backend & APIs',
      dateObtention: new Date('2026-06-10'),
      hashBlockchain: '0x4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f',
      qrCodeUrl: '', pdfUrl: '', verified: true
    }
  ];

  getCertificatsByStagiaire(stagiaireId: string): Observable<Certificat[]> {
    return of(this.mockCertificats.filter(c => c.stagiaireId === stagiaireId)).pipe(delay(300));
  }

  verifyCertificat(hash: string): Observable<Certificat | undefined> {
    return of(this.mockCertificats.find(c => c.hashBlockchain === hash)).pipe(delay(500));
  }
}
