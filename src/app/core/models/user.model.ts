export type Role = 'ADMIN' | 'FORMATEUR' | 'STAGIAIRE';

export interface User {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  role: Role;
  avatar?: string;
  dateInscription: Date;
  age?: number;
  status?: string;
  authProvider?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
  motDePasse?: string; // Keep for compatibility if needed
}

export interface RegisterRequest {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  age?: number;
  password?: string;
  motDePasse?: string; // Keep for compatibility if needed
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface OAuthLoginRequest {
  provider: string;
  accessToken: string;
}

export interface AuthResponse {
  token?: string;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  age?: number;
  role: Role;
  status: string;
  createdAt: string;
  authProvider: string;
}

