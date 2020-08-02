import { ChatService } from './chat.service';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideoService {

  public incommingCall : BehaviorSubject<any> = new BehaviorSubject(false)
  public outgoingCall : BehaviorSubject<any> = new BehaviorSubject(false)
  public userData  :  BehaviorSubject<any> = new BehaviorSubject('')

  constructor(private chat: ChatService) {}

  rejectCall(data) {
    this.chat.socket.emit('reject-call', {
      fromID: data.fromID , 
      toID :data.toID
    });
  }

  callRejected() {
    return new Observable((observer) => {
      this.chat.socket.on('call-rejected', (data) => {
        observer.next(data);
      });
    });
  }
}
