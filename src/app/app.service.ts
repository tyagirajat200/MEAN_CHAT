import { Router } from '@angular/router';

import { DatabaseService } from './database.service';
import { Injectable,Injector } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from "@angular/common/http";
import {  catchError } from "rxjs/operators";
import { throwError } from 'rxjs/internal/observable/throwError';
// import { throwError } from 'rxjs';

@Injectable()

export class AuthInterceptor  implements HttpInterceptor {
    constructor(private injector: Injector , private router  :Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const authToken = this.injector.get(DatabaseService).getToken()
        req = req.clone({
            setHeaders: {
                Authorization: "Bearer " + authToken
            }
        });
        return next.handle(req).pipe(catchError((err)=>{
        if (err instanceof HttpErrorResponse && err.status === 401)
            {
            console.log('Unauthorized Request',err.error);
            localStorage.removeItem('access_token')
            localStorage.removeItem('user')
            this.router.navigate(['login'])
        }   
        else{
            console.log('Server Error');
        }
           return throwError(err);
        }))
    }
}

