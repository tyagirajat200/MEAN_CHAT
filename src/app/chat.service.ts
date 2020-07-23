import { DatabaseService } from './database.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {

  public socket;   //https://meanchatapp7599.herokuapp.com'           'http://localhost:4000'

 public selectedUser: BehaviorSubject<any> = new BehaviorSubject(null)

  constructor(private http : HttpClient , private data : DatabaseService) {    
    this.socket = io('https://meanchatapp7599.herokuapp.com' +`?userId=${data.userData._id}`)

  }

sendConversationsMessages(message,id ,type){
 return this.http.post('/api/chat',{body:message,to:id,type:type},{withCredentials:true})
}

getConversationsMessages(id) {
 return this.http.get<any>('/api/chat/conversations/query/'+id,{withCredentials:true})
}

getConversationsList(){
  console.log("getConversationsList()");
  
   return this.http.get<any>('/api/chat/conversations',{withCredentials:true})
}



// Socket Events

newMessage(){
return new Observable(observer => {
  this.socket.on('messages', (message, id , conversations) => {
            observer.next({message , id, conversations});
        });
});
}

disconnect(){
  this.socket.close()
}

connect(){
  this.socket.open()
}

newUser()
{
  return new Observable(observer => {
    this.socket.on('newUser', users => {
              observer.next(users);
          });
  });
}

onTyping()
{
  return new Observable(observer => {
    this.socket.on('typing', sender => {
              observer.next(sender);
          });
  });
}

}
