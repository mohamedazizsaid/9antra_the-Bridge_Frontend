import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  private mapUserDTO(u: any): User {
    return {
      id: u.id.toString(),
      prenom: u.firstName,
      nom: u.lastName,
      email: u.email,
      telephone: u.phone,
      role: u.role,
      avatar: u.avatar,
      dateInscription: new Date(u.createdAt),
      age: u.age,
      status: u.status,
      authProvider: u.authProvider
    };
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(list => list.map(u => this.mapUserDTO(u)))
    );
  }

  getMyProfile(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      map(u => this.mapUserDTO(u))
    );
  }

  updateProfile(profile: Partial<User>): Observable<User> {
    const payload = {
      firstName: profile.prenom,
      lastName: profile.nom,
      phone: profile.telephone,
      age: profile.age,
      avatar: profile.avatar
    };
    return this.http.put<any>(`${this.apiUrl}/me`, payload).pipe(
      map(u => this.mapUserDTO(u))
    );
  }

  getAdminStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}
