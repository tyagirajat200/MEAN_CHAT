import { ChatService } from './../../chat.service';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat-home',
  templateUrl: './chat-home.component.html',
  styleUrls: ['./chat-home.component.css'],
})
export class ChatHomeComponent implements OnInit {

  public selectedUser
  
  constructor(private chat :ChatService) {}

  ngOnInit(): void {
    this.chat.connect()

    this.chat.selectedUser.subscribe(value=>{
      this.selectedUser=value
     })
  }
}
