import { VideoService } from './../../video.service';
import { ChatService } from './../../chat.service';
import { Router } from '@angular/router';
import { DatabaseService } from './../../database.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NotificationService } from 'src/app/notification.service';

@Component({
  selector: 'app-sidebox',
  templateUrl: './sidebox.component.html',
  styleUrls: ['./sidebox.component.css'],
})
export class SideboxComponent implements OnInit {
  public selectedUser;
  public typing = '';
  timerId = null;

  onVideoCall()
  {
    this.video.outgoingCall.next(true)
  }

  constructor(
    private auth: DatabaseService,
    private router: Router,
    private chat: ChatService,
    private video  :VideoService,
    private notifyService : NotificationService
  ) {}

  ngOnInit(): void {
    this.chat.selectedUser.subscribe((value) => {
      this.selectedUser = value;      
    });

    this.chat.onTyping().subscribe((id) => {
      if (
        this.chat.selectedUser.getValue() &&
        this.chat.selectedUser.getValue()._id == id
      )
        this.typing = 'typing....';
      this.f();
    });
  }

  f() {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.timerId = setTimeout(() => {
      this.typing = '';
    }, 600);
  }

  onLogout() {
    if(this.auth.logoutUser())
    {
      this.auth.userData = {};
      this.router.navigate(['login']);
      this.chat.disconnect();
      console.log('Log out Successfully');
      this.notifyService.showSuccess( "Log out Successfully !!", "Notification")
    }
    
  }
}
