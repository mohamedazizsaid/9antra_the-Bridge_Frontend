export interface ComboEnrollment {
  id: number;
  studentId: number;
  studentFirstName?: string;
  studentLastName?: string;
  studentEmail?: string;
  studentAvatar?: string;
  formations: ComboFormationItem[];
  totalPrice: number;
  discountPercent: number;
  finalPrice: number;
  status: 'PENDING_PAYMENT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt?: string;
  paidAt?: string;
  stripeSessionId?: string;
  stripeCheckoutUrl?: string;
  receiptRef?: string;
  note?: string;
  enrollments?: ComboEnrollmentDetail[];
}

export interface ComboFormationItem {
  id: string;
  nom: string; // mapped from title
  title?: string;
  description?: string;
  category?: string;
  totalPrice?: number;
  formateurNom?: string;
  defaultDurationWeeks?: number;
  phases?: any[];
}

export interface ComboEnrollmentDetail {
  id: number;
  formationId: number;
  formationTitle?: string;
  status?: string;
  enrollmentDate?: string;
  comboEnrollmentId?: number;
}

/** Calcule la remise progressive selon le nombre de formations cochées */
export function computeComboDiscount(count: number): number {
  if (count < 2) return 0;
  return Math.min(10 + (count - 2) * 5, 40);
}
