import { DatabaseService } from './../../database.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  public msg: string;
  isloading = false

  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    cpassword: new FormControl('', [Validators.required]),
  });

  constructor(private auth: DatabaseService ,private router : Router) {}

  ngOnInit(): void {}

  onSubmit() {
    if (this.registerForm.valid) {
     this.registerForm.value.imagePath = 'https://www.w3schools.com/howto/img_avatar2.png'
      this.isloading=true
      this.auth.registerUser(this.registerForm.value).subscribe(
        (response) => {
          this.msg = response.msg;
          this.registerForm.reset()
          this.isloading=false
          this.router.navigate(['login'])
        },
        (error) => {
          this.msg = error.error.error;
          this.isloading=false
        }
      );
    }
  }
}
