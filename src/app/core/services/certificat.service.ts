import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Certificat } from '../models/certificat.model';

@Injectable({ providedIn: 'root' })
export class CertificatService {
  private apiUrl = 'http://localhost:8080/api/certificates';

  constructor(private http: HttpClient) {}

  private mapCertificateDTO(c: any): Certificat {
    return {
      id: c.id.toString(),
      stagiaireId: c.studentId.toString(),
      formationId: c.formationId ? c.formationId.toString() : '',
      formationNom: c.formationTitle || 'Formation',
      phaseNom: c.phaseTitle || 'Phase',
      dateObtention: new Date(c.issueDate),
      hashBlockchain: c.blockchainTransactionHash || c.hashValue || '',
      qrCodeUrl: '',
      pdfUrl: c.pdfUrl || '',
      verified: true
    };
  }

  getCertificatsByStagiaire(stagiaireId: string): Observable<Certificat[]> {
    return this.http.get<any[]>(`${this.apiUrl}/student/${stagiaireId}`).pipe(
      map(list => list.map(c => this.mapCertificateDTO(c)))
    );
  }

  verifyCertificat(hash: string): Observable<Certificat | undefined> {
    return this.http.get<any>(`${this.apiUrl}/verify/${hash}`).pipe(
      map(c => this.mapCertificateDTO(c))
    );
  }
}
