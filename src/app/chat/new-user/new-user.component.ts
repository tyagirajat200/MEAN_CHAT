import { ChatService } from './../../chat.service';
import { DatabaseService } from './../../database.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {

  public msg: string
  public disable = true

  public user : any ={}

  sendMessage=new FormGroup({
    email: new FormControl('',[Validators.required , Validators.email]),
    message:new FormControl('',Validators.required)
  })

  constructor(private auth : DatabaseService , private chat : ChatService) { }

  ngOnInit(): void {
  
  }

  emailCheck(){
    this.auth.checkValid(this.sendMessage.get('email').value).subscribe(response=>{
     
      console.log(response);
      if(response.user._id == this.auth.userData._id)
         {
          this.msg = 'You Can not send to Yourself'
          this.user={}
        }
        else{
          this.msg = response.msg
          this.user =response.user
          this.disable = false 
        }
      
    },
    error=>{    
      this.msg=error.error.msg
    })
  }

  onSubmit()
  {    
    this.chat.sendConversationsMessages(this.sendMessage.get('message').value , this.user._id).subscribe(res=>{
      console.log("Message Sent To new User");
    },
    error=>{
      console.log(error.error);
    })
  }

}
