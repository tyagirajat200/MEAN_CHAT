import { ChatService } from './../../chat.service';
import { Router } from '@angular/router';
import { DatabaseService } from './../../database.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebox',
  templateUrl: './sidebox.component.html',
  styleUrls: ['./sidebox.component.css']
})
export class SideboxComponent implements OnInit {

  public selectedUser
  public typing = ''
  timerId = null

  constructor(private auth: DatabaseService , private router : Router , private chat: ChatService) { }

  ngOnInit(): void {

    this.chat.selectedUser.subscribe(value=>{
     this.selectedUser=value
    })

    this.chat.onTyping().subscribe(id=>{
      if(this.chat.selectedUser.getValue() && this.chat.selectedUser.getValue()._id == id)
        this.typing = 'typing....'
        this.f()
    })
    
  }

  f() {
    if (this.timerId) {
        clearTimeout(this.timerId)
    }
    this.timerId = setTimeout(() => {
      this.typing = ''
    }, 600);
}

  onLogout()
  {
this.auth.logoutUser().subscribe(res=>{
  console.log(res);
  this.auth.isAuth=false
  this.auth.userData=''
  this.router.navigate(['login'])
  this.chat.disconnect()
},
err=>{
  console.log(err.error);
})
  }

}
