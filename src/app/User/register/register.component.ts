import { DatabaseService } from './../../database.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  public msg: string;

  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    cpassword: new FormControl('', [Validators.required]),
  });

  constructor(private auth: DatabaseService) {}

  ngOnInit(): void {}

  onSubmit() {
    if (this.registerForm.valid) {
      this.auth.registerUser(this.registerForm.value).subscribe(
        (response) => {
          this.msg = response.msg;
          this.registerForm.reset()
        },
        (error) => {
          this.msg = error.error.error;
        }
      );
    }
  }
}
