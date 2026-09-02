export type InternshipStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';

export type InternshipPaymentMode = 'COMPTANT' | 'FACILITE' | 'STRIPE' | 'MAIN_A_MAIN' | 'BANQUE';

export type ReferralStatus = 'PENDING' | 'SENT' | 'USED';

export interface StageInscription {
  id?: number;

  // Stagiaire
  studentId?: number;
  studentFirstName?: string;
  studentLastName?: string;
  studentEmail?: string;
  studentAvatar?: string;
  studentCin?: string;

  // Type
  wantsInternship: boolean;

  // Stage (si wantsInternship = true)
  stageProjectTitle?: string;
  stageDurationWeeks?: number;
  demandeStageUrl?: string;
  lettreAffectationUrl?: string;

  // Formations
  selectedFormationIds?: number[];
  selectedFormationTitles?: string[];

  // Prix
  originalPrice?: number;
  discountAmount?: number;
  discountReason?: string;
  totalPrice?: number;

  // Parrainage
  referralEmail?: string;
  referralStatus?: ReferralStatus;
  referralDiscountApplied?: boolean;

  // Paiement
  paymentMode?: InternshipPaymentMode;
  payNow?: boolean;
  cashDiscountApplied?: boolean;
  stripeSessionId?: string;
  stripePaymentUrl?: string;
  stripePaymentConfirmed?: boolean;

  // Admin & Encadrant
  status?: InternshipStatus;
  adminNotes?: string;
  adminPaymentConfirmed?: boolean;
  adminPaymentDate?: string;
  supervisorId?: number;
  supervisorFirstName?: string;
  supervisorLastName?: string;
  supervisorEmail?: string;
  supervisorAvatar?: string;

  // Source
  heardFrom?: string;
  heardFromOther?: string;

  // Engagement
  termsAccepted?: boolean;
  termsAcceptedAt?: string;

  // Attestation PDF (généré lors de la clôture)
  attestationPdfUrl?: string;

  // Statut
  onboardingCompleted?: boolean;
  completedAt?: string;
  createdAt?: string;
}

export interface OnboardingPayload {
  wantsInternship: boolean;
  stageProjectTitle?: string;
  stageDurationWeeks?: number;
  selectedFormationIds: number[];
  referralEmail?: string;
  paymentMode?: InternshipPaymentMode;
  payNow?: boolean;
  heardFrom?: string;
  heardFromOther?: string;
  termsAccepted: boolean;
}
