import { ChatService } from './../../chat.service';
import { DatabaseService } from './../../database.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css'],
})
export class ChatBoxComponent implements OnInit {
  newMesaage = new FormGroup({
    message: new FormControl('', Validators.required),
  });

  container: HTMLElement;

  public messages = [];
  public selectedUser;

  constructor(private data: DatabaseService, private chat: ChatService) {}


  reloadMessges(user) {
    this.chat.getConversationsMessages(user._id).subscribe(
      (res) => {
        this.messages = res.messages;
      },
      (error) => {
        console.log(error.errro);
      }
    );
  }

  ngOnInit(): void {
    this.chat.selectedUser.subscribe((user) => {
      if (user) {
        this.selectedUser = user;
        this.reloadMessges(user);
      }
    });

    this.chat.newMessage().subscribe((data : any) => {
      console.log(data);
      if (this.chat.selectedUser.getValue() && this.chat.selectedUser.getValue()._id == data.id)
       { 
          // this.reloadMessges(this.chat.selectedUser.getValue());
        this.messages =Object.assign([...this.messages , data.message])      
      }
    });

    this.newMesaage.get('message').valueChanges.subscribe(value=>{
      this.chat.socket.emit( 'typing' , this.chat.selectedUser.getValue()._id , this.data.userData._id)
    })
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

    this.container = document.getElementById('msgContainer');
    this.container.scrollTop = this.container.scrollHeight;
  }

  onSubmit() {
    if (this.newMesaage.valid) {
      if (this.chat.selectedUser.getValue()) {

        this.chat
          .sendConversationsMessages(
            this.newMesaage.get('message').value,
            this.chat.selectedUser.getValue()._id
          )
          .subscribe(
            (res : any) => {
              // this.messages =Object.assign([...this.messages , res.data] )
              console.log("message sent ");
              this.newMesaage.reset()
            },
            (err) => console.log(err.error)
          );
      }
    }
  }
}
