import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { auth } from 'firebase';


@Injectable({
  providedIn: 'root',
})
export class DatabaseService {

  userData : any ={}

  constructor(private http: HttpClient) {

  }

  loginUser(data) :any{
    return this.http.post('/api/user/login', data);
  }

  registerUser(data) :any{
    return this.http.post('/api/user/register', data);
  }

   isLoggedIn(): boolean {
    let authToken = localStorage.getItem('access_token');
    let user = localStorage.getItem('user')
    
  return (authToken !== null && user !=null) ? true : false;
 
  }

  logoutUser() : any{
    let removeToken = localStorage.removeItem('access_token');
    let user= localStorage.removeItem('user')
    if (removeToken == null && user == null) {
      return true
    }
  }

  getToken() {    
    return localStorage.getItem('access_token');
  }

  getUsers() :any{
    return this.http.get('/api/user/getUsers');
  }

  checkValid(email) :any{
    return this.http.post('/api/user/checkValid', {email});
  }

  updateProfileName(data)
  {
    return this.http.put('/api/user/updateProfile/name', data);
  }
  updateProfilePassword(data)
  {
    return this.http.put('/api/user/updateProfile/password', data);
  }
  updateProfileImage(data)
  {
    return this.http.put('/api/user/updateProfile/image', data);
  }

  forgetPassword(email) :any{
    return this.http.post('/api/user/reset-password', email)
  }
  resetPassword(data) :any{
    return this.http.post('/api/user/new-password', data)
  }
}
