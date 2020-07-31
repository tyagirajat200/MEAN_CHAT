import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/database.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  public msg : string
  isloading = false
  constructor(private data  :DatabaseService , private router : ActivatedRoute ) { }

  loginForm = new FormGroup({
    password: new FormControl('', [Validators.required,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,15}$/)]),
    cpassword: new FormControl('', [Validators.required])
  })

  ngOnInit(): void {
    console.log(this.router.snapshot.params['token'])
    
  }

  onSubmit()
    {
      var password= this.loginForm.get('password').value.trim()
      var cpassword= this.loginForm.get('cpassword').value.trim()
      var token = this.router.snapshot.params['token']

      if(password != '' && cpassword !='')
      {
        var data = {password , cpassword ,token}
        this.isloading = true
        this.data.resetPassword(data).subscribe(res=>{
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
