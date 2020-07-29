import { DatabaseService } from './../database.service';
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PrivateGuard implements CanActivate {
  constructor(private auth: DatabaseService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean | UrlTree {

    if (this.auth.isLoggedIn())
    {
     this.auth.userData = JSON.parse(localStorage.getItem('user'))   
      return true;
    }
    else return this.router.navigate(['login']);
  }
}
