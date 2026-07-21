import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${id}`);
  }

  updateUserStatus(id: number, status: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${id}/status`, { status });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  createFormateur(formateur: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/formateurs`, formateur);
  }

  getLogs(page = 0, size = 50, method?: string, ip?: string, from?: string, to?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (method) params = params.set('method', method);
    if (ip) params = params.set('ip', ip);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<any>(`${this.apiUrl}/logs`, { params });
  }

  getExtendedStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/extended`);
  }

  broadcastNotification(title: string, message: string, roles: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/notifications/broadcast`, { title, message, roles });
  }
}
