import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/app/chat.service';
import { VideoService } from 'src/app/video.service';
import { DatabaseService } from 'src/app/database.service';
import 'webrtc-adapter'


const mediaConstraints = {
  audio : true,
  video: true,
}

let localVideo: any 
let remoteVideo  :any
let localStream : any
let remoteStream
let rtcPeerConnection

// Free public STUN servers provided by Google.
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    {
      urls: 'turn:192.158.29.39:3478?transport=udp',
      credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      username: '28224511:1379330808'
    },
    {
      urls: 'turn:numb.viagenie.ca',
      credential: 'muazkh',
      username: 'webrtc@live.com'
      },
      {
        urls: 'turn:numb.viagenie.ca',
        credential: 'rajattyagi',
        username: 'cu.16bcs1182@gmail.com'
        },
  ],
}



@Component({
  selector: 'app-incoming-video',
  templateUrl: './incoming-video.component.html',
  styleUrls: ['./incoming-video.component.css']
})
export class IncomingVideoComponent implements OnInit {
  navigator = <any>navigator
  caller : any
  constructor(private chat: ChatService, private video: VideoService ,private data : DatabaseService) {
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    this.caller = this.video.userData.getValue()
  }

  msg = `Connected`

  onClose()
  {
    localStream.getTracks().forEach(function(track) { track.stop(); })
   if(remoteStream) remoteStream.getTracks().forEach(function(track) { track.stop(); })
    rtcPeerConnection.close()
    document.getElementById('chatdash').style.display=''
    this.chat.socket.emit('over' ,{toID : this.caller.fromID})
    this.video.incommingCall.next(false)
  }
  ngOnInit(): void {

   this.setLocalStream(mediaConstraints)

   this.chat.socket.on('webrtc_offer', async (data) => {
    console.log('Socket event callback: webrtc_offer')
      // rtcPeerConnection = new RTCPeerConnection(iceServers)
      localStream.getTracks().forEach((track) =>rtcPeerConnection.addTrack(track, localStream))
      rtcPeerConnection.ontrack = this.setRemoteStream
      rtcPeerConnection.onicecandidate = (event)=>{
        if (event.candidate) {
          this.chat.socket.emit('webrtc_ice_candidate', {
            label: event.candidate.sdpMLineIndex,
            candidate: event.candidate.candidate,
            toID:data.fromID
          })
        }
      }
      rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
      const answer = await rtcPeerConnection.createAnswer()
      await rtcPeerConnection.setLocalDescription(new RTCSessionDescription(answer))
      this.chat.socket.emit('webrtc_answer', {
        type: 'webrtc_answer',
        sdp: answer,
        fromID:data.fromID,
        toID:data.toID
      })
  })

  this.chat.socket.on('webrtc_ice_candidate', (data) => {
    console.log('Socket event callback: webrtc_ice_candidate')
    // ICE candidate configuration.
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: data.label,
      candidate: data.candidate,
    })
    rtcPeerConnection.addIceCandidate(candidate)
  })

  this.chat.socket.on('over', data=>{
    localStream.getTracks().forEach(function(track) { track.stop(); })
    remoteStream.getTracks().forEach(function(track) { track.stop(); })
    rtcPeerConnection.close()
    document.getElementById('chatdash').style.display=''
    this.video.incommingCall.next(false)
  })
      
    }


    setLocalStream(mediaConstraints) {
      this.navigator.getUserMedia = (this.navigator.getUserMedia ||this.navigator.webkitGetUserMedia
        ||this.navigator.mozGetUserMedia ||this.navigator.msGetUserMedia );
        this.navigator.mediaDevices.getUserMedia(mediaConstraints)
        .then(mediaStream=>{
          localStream = mediaStream;
          localVideo= document.getElementById('local-video')
            localVideo.volume=0
            localVideo.muted = true
            localVideo.srcObject = mediaStream
            this.chat.socket.emit('start_call', this.video.userData.getValue())
        })
        .catch(err=>{
          console.log('navigator.getUserMedia error: ', err)
        })
      }

    setRemoteStream(event) {
      remoteVideo = document.getElementById('remote-video')
      remoteVideo.srcObject = event.streams[0]
      remoteStream = event.streams[0]  
    }
    
}
