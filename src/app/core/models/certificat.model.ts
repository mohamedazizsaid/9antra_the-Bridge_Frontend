export interface Certificat {
  id: string;
  stagiaireId: string;
  formationId: string;
  formationNom: string;
  phaseNom: string;
  dateObtention: Date;
  hashBlockchain: string;
  qrCodeUrl: string;
  pdfUrl: string;
  verified: boolean;
}
