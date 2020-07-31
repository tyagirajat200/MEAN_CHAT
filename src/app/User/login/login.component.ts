import { ChatService } from './../../chat.service';
import { Router } from '@angular/router';
import { DatabaseService } from './../../database.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr'
import { NotificationService } from 'src/app/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  public msg : string

  isloading = false

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern(/([a-zA-Z0-9]+)([\.{1}])?([a-zA-Z0-9]+)\@gmail([\.])com/g)]),
    password: new FormControl('', [Validators.required,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,15}$/)]),
  });

  constructor(private auth : DatabaseService,private router : Router,private notifyService : NotificationService) {}

  ngOnInit(): void {}


  onSubmit() {
  
    if (this.loginForm.valid) {
      this.isloading = true
      this.auth.loginUser(this.loginForm.value).subscribe(
        (response) => {
          // this.msg = response.msg;
          localStorage.setItem('access_token', response.token)
          localStorage.setItem('user',JSON.stringify(response.user))
          this.isloading = false
          this.router.navigate(['chat/' + response.user._id]);
          this.notifyService.showSuccess( response.msg+" !!", "Welcome")
        },
        (error) => {
          // this.msg = error.error.error;
          this.isloading = false
          this.notifyService.showError(error.error.error+' !!', "Alert")
        }
      );
    }
  }
}
