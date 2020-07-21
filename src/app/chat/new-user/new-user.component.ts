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
      if(response.user._id == this.auth.userData._id)
         {
          this.msg = 'You can not send to yourself'
          this.user={}
        }
        else{
          this.msg = 'Message will be sent to '+response.user.name
          this.user =response.user
          this.disable = false 
        }
      
    },
    error=>{    
      this.msg=error.error.msg
      this.user={}
    })
  }

  onSubmit()
  {    
    this.chat.sendConversationsMessages(this.sendMessage.get('message').value , this.user._id).subscribe(res=>{
      this.sendMessage.reset()
      this.msg =''
      this.user={}
      this.disable=true
      console.log("Message Sent To new User");
    },
    error=>{
      alert('Message Not Try Again')
      console.log(error.error);
    })
  }

}
