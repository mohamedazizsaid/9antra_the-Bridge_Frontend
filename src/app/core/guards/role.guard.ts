import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'] as Role;
    const expectedRoles = route.data['roles'] as Role[];
    const user = this.auth.getCurrentUser();

    if (user && (user.role === expectedRole || (expectedRoles && expectedRoles.includes(user.role)))) {
      return true;
    }

    if (user) {
      this.router.navigate([this.auth.getRedirectUrl(user.role)]);
    } else {
      this.router.navigate(['/auth/login']);
    }
    return false;
  }
}
