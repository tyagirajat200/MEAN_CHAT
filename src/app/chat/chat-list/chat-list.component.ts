import { ChatService } from './../../chat.service';
import { DatabaseService } from './../../database.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'],
})
export class ChatListComponent implements OnInit {


   @Output() profileTab : EventEmitter<any> =new EventEmitter()

  onProfile(){
    this.profileTab.emit(true)
  }

  public imgSrc ="https://www.w3schools.com/howto/img_avatar2.png"
  public conversations = [];
  public onlineUsers :any= []   // contain socketId and userId
  public result = [];

  public currentUser = this.data.userData
  public selectedConv :any

  isLoading  = true


  searchForm = new FormGroup({
    search: new FormControl('')
  })
  
  constructor(private data: DatabaseService, private chat: ChatService) {}

  checkOnline(conversation)
  {
     const userId = this.handleRecipient(conversation.recipients)._id

      const a = this.onlineUsers.find(user=>user.userId==userId)

      if(a)
         return true
      else
         return false
          
  }

  reloadConversations(){   
    this.chat.getConversationsList().subscribe(
      (response) => {
        this.conversations = response.conversations;
        this.result = response.conversations
        console.log(response);
        this.isLoading = false
      },
      (error) => {
        console.log(error.error);
        this.isLoading = false
        alert('Error While Fetching Your Conversations')
      }
    );
  }


  ngOnInit(): void {

    if(this.data.userData.imagePath)
        this.imgSrc = this.data.userData.imagePath
    
    this.reloadConversations()
 
    this.chat.newMessage().subscribe((data : any) => { 
      this.reloadConversations()
     });


     this.chat.newUser().subscribe(users=>{
       console.log('Online Users = >' , users);
       this.onlineUsers=users
     })

     this.searchForm.get('search').valueChanges.subscribe(search => {
      this.conversations = this.result.filter((conversation) =>
      this.handleRecipient(conversation.recipients).name.toLocaleLowerCase().includes(search)
      )
    })
  }



  handleRecipient = (recipients) => {
    for (let i = 0; i < recipients.length; i++) {
      if (recipients[i]._id !== this.data.userData._id) {
        return recipients[i];
      }
    }
    return null;
  };



  setUser(conversation) {
    this.chat.selectedUser.next(this.handleRecipient(conversation.recipients));
    this.selectedConv = conversation._id
  }

}
