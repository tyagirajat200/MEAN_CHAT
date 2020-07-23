import { ChatService } from './../../chat.service';
import { Router } from '@angular/router';
import { DatabaseService } from './../../database.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  public msg : string

  isloading = false

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(private auth : DatabaseService,private router : Router) {}

  ngOnInit(): void {}


  onSubmit() {
  
    if (this.loginForm.valid) {
      this.isloading = true
      this.auth.loginUser(this.loginForm.value).subscribe(
        (response) => {
          this.auth.isAuth=true
          this.auth.userData = (response.User)
          this.msg = response.msg;
          this.isloading = false
          this.router.navigate(['chat'])
        },
        (error) => {
          this.msg = error.error.error;
          this.isloading = false
        }
      );
    }
  }
}
