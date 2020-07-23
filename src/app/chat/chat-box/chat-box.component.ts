import { ChatService } from './../../chat.service';
import { DatabaseService } from './../../database.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { finalize } from "rxjs/operators";

import { AngularFireStorage } from "@angular/fire/storage";

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css'],
})
export class ChatBoxComponent implements OnInit {
  container: HTMLElement;
  public messages = [];
  public selectedUser;

  isLoading = true

  url :''

  // ******* Emoji **********//
  showEmojiPicker = false;
  toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
  }
  addEmoji(event) {
     let data = this.newMesaage.get('message');
     if(data)
          this.newMesaage.get('message').patchValue(data.value + event.emoji.native)
      else
          this.newMesaage.get('message').patchValue(event.emoji.native)
  }
  // ******* Emoji **********//


  newMesaage = new FormGroup({
    message: new FormControl('', Validators.required),
  });

  constructor(private data: DatabaseService, private chat: ChatService ,private af : AngularFireStorage) {}

  ngAfterViewInit() {         
    this.container = document.getElementById("msgContainer");           
    this.container.scrollTop = this.container.scrollHeight;     
  }  

  reloadMessges(user) {
    this.chat.getConversationsMessages(user._id).subscribe(
      (res) => {
        this.isLoading = false
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
        this.isLoading =true
        this.selectedUser = user;
        this.reloadMessges(user);
      }
    });

    this.chat.newMessage().subscribe((data: any) => {
      if (
        this.chat.selectedUser.getValue() &&
        this.chat.selectedUser.getValue()._id == data.id
      ) {
        this.messages = Object.assign([...this.messages, data.message]);
      }
    });

    this.newMesaage.get('message').valueChanges.subscribe((value) => {
      this.chat.socket.emit(
        'typing',
        this.chat.selectedUser.getValue()._id,
        this.data.userData._id
      );
    });
  }


  onSubmit() {
    if (this.newMesaage.valid) {
      if (this.chat.selectedUser.getValue()) {
        this.chat
          .sendConversationsMessages(
            this.newMesaage.get('message').value,
            this.chat.selectedUser.getValue()._id,
            "text"
          )
          .subscribe(
            (res: any) => {
              console.log('message sent ');
              // this.messages = Object.assign([...this.messages, res.data]);
              this.newMesaage.reset();
            },
            (err) => console.log(err.error)
          );
      }
    }
  }

  onFileChange(event){

    var filePath = `Chat/${event.target.files[0].name}_${new Date().getTime()}` 

    console.log(event.target.files[0].type.split('/')[0]);
    console.log(event.target.files[0].type);
    
    var fileRef = this.af.ref(filePath)

    this.af.upload(filePath,event.target.files[0]).snapshotChanges().subscribe(
    (res)=>{
      var progress = (res.bytesTransferred / res.totalBytes) * 100;
      console.log(progress);
    },
    (error) => {
      console.log(error)
    },
    ()=>{
        fileRef.getDownloadURL().subscribe(url=>{
          if (this.chat.selectedUser.getValue()) {
            this.chat
              .sendConversationsMessages(
                url,
                this.chat.selectedUser.getValue()._id,
                event.target.files[0].type.split('/')[0]
              )
              .subscribe(
                (res: any) => {
                  console.log('message sent => ' ,res);
                },
                (err) => console.log(err.error)
              );
          }
        })
    }
    )
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.chat.selectedUser.next(null)
    
  }
}
