import { NotificationService } from './../../notification.service';
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
  
  constructor(private chat :ChatService , private video: VideoService ,private notification : NotificationService) {}

  ngOnInit(): void {
    this.chat.connect()

    this.chat.selectedUser.subscribe(value=>{
      this.selectedUser=value
     })

     this.video.outgoingCall.subscribe(value=>this.outgoingCall = value )
     this.video.incommingCall.subscribe(value=>this.incomingCall = value )

   this.chat.socket.on('request',data=>{
    console.log(data.fromName , 'is requesting you to join the call')
       if (this.video.incommingCall.value == false && this.video.outgoingCall.value==false) {
        this.notification.openConfirmDialog(data.fromName).afterClosed().subscribe(res=>{
       if (!res) {
          this.video.rejectCall(data)
          this.video.incommingCall.next(false)
          return;
        }
        else{
          document.getElementById('chatdash').style.display='none'
          this.video.userData.next(data)
          this.video.incommingCall.next(true)
          // setTimeout(() => {
          //   this.chat.socket.emit('start_call', data)
          //   console.log("start")
          //  }, 5000)
        }
        })
      }
     else
        this.chat.socket.emit('busy',data)
   })

   this.chat.socket.on('over' , data=>{
    this.notification.closeConfirmDialog()
   })

  }
}

