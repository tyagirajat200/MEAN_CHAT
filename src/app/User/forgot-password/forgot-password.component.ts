import { DatabaseService } from './../../database.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  public msg : string
  isloading = false
  constructor(private data  :DatabaseService) { }

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required,Validators.pattern(/([a-zA-Z0-9]+)([\.{1}])?([a-zA-Z0-9]+)\@gmail([\.])com/g)])
  });

  ngOnInit(): void {
  }

  onSubmit()
    {
      var email= this.loginForm.get('email').value.trim()
      console.log(email)
      if(email != null && email !='')
      {
        this.isloading = true
        this.data.forgetPassword({email}).subscribe(res=>{
          console.log(res)
          this.msg = res.msg
          this.isloading = false
          this.loginForm.reset()
        },
        err=>{
          this.msg = err.error.msg
          console.log(err.error);
          this.isloading = false
        }
        )
      }
    }

}
