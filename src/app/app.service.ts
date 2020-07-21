import { DatabaseService } from './database.service';
import { Injectable, Injector } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private injector: Injector , private auth : DatabaseService) { }

  initializeApp(): Promise<any> {
    return new Promise(resolve=>{
      this.injector.get(DatabaseService).authChecker().then(res=>{
        this.auth.isAuth=true
        this.auth.userData=res.User
        resolve()
      })
      .catch(err=>{
        this.auth.isAuth=false
        this.auth.userData=''
        resolve()
      })
    })
}
}
