import { ChatService } from './chat.service';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideoService {

  public incommingCall : BehaviorSubject<any> = new BehaviorSubject(false)
  public outgoingCall : BehaviorSubject<any> = new BehaviorSubject(false)
  public incomingData  :  BehaviorSubject<any> = new BehaviorSubject('')

  constructor(private chat: ChatService) {}

  callUser(offer, toID ,fromID) {
    this.chat.socket.emit('call-user', { offer, toID , fromID });
  }

  callMade() {
    return new Observable((observer) => {
      this.chat.socket.on('call-made', (data) => {
        observer.next(data);
      });
    });
  }

  makeAnswer(answer, data) {
    this.chat.socket.emit('make-answer', { answer, fromID: data.fromID , toID :data.toID });
  }

  answerMade() {
    return new Observable((observer) => {
      this.chat.socket.on('answer-made', (data) => {
        observer.next(data);
      });
    });
  }

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
