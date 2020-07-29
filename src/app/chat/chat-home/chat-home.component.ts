import { VideoService } from './../../video.service';
import { ChatService } from './../../chat.service';

import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-chat-home',
  templateUrl: './chat-home.component.html',
  styleUrls: ['./chat-home.component.css'],
})
export class ChatHomeComponent implements OnInit {

  public selectedUser
  
  public viewProfile = false
  public profileTab(data){
    this.viewProfile = data
  }

  incomingCall= false
  outgoingCall= false
  
  constructor(private chat :ChatService , private video: VideoService) {}

  ngOnInit(): void {
    this.chat.connect()

    this.chat.selectedUser.subscribe(value=>{
      this.selectedUser=value
     })

     this.video.outgoingCall.subscribe(value=>this.outgoingCall = value )
     this.video.incommingCall.subscribe(value=>this.incomingCall = value )


   this.chat.socket.on('request',data=>{
    console.log(data.fromID , 'is requesting you to join the call')
       if (this.video.incommingCall.value == false && this.video.outgoingCall.value==false) {
        const confirmed = confirm(
          `User "Socket: ${data.fromID}" wants to call you. Do accept this call?`
        )    
        if (!confirmed) {
          this.video.rejectCall(data)
          this.video.incommingCall.next(false)
          return;
        }
        else{
          document.getElementById('chatdash').style.display='none'
          this.video.incommingCall.next(true)
          setTimeout(() => {
            this.chat.socket.emit('start_call', data)
            console.log("start")
           }, 6000);
        }
      }
     else
        this.chat.socket.emit('busy',data)
   })

  }
  
}

