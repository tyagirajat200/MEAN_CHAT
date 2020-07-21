import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class DatabaseService {

  isAuth: boolean = false;
  userData : any =""

  constructor(private http: HttpClient) {
   console.log("Database Service");
   
  }

  loginUser(data) :any{

    return this.http.post('/api/user/login', data , {withCredentials:true});
  }

  registerUser(data) :any{
    return this.http.post('/api/user/register', data);
  }

  authChecker(){
   return this.http.get<any>('/api/user/authchecker',{ withCredentials: true}).toPromise()
  }

  logoutUser() : any{
    return this.http.delete('/api/user/logout',{ withCredentials: true})
  }

  getUsers() :any{
    return this.http.get('/api/user/getUsers',{ withCredentials: true});
  }

  checkValid(email) :any{
    return this.http.post('/api/user/checkValid', {email},{ withCredentials: true});
  }
}
