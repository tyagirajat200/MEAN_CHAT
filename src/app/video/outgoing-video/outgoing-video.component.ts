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
let remoteVideo : any
let localStream 
let remoteStream
let rtcPeerConnection
let toID 
let fromID
let fromName
let timerID

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

let isAlreadyCalling = false;

@Component({
  selector: 'app-outgoing-video',
  templateUrl: './outgoing-video.component.html',
  styleUrls: ['./outgoing-video.component.css']
})
export class OutgoingVideoComponent implements OnInit {

  navigator = <any>navigator

  constructor(private chat: ChatService, private video: VideoService ,private data : DatabaseService) 
  {
    toID = this.chat.selectedUser.getValue()._id
    fromID = this.data.userData._id,
    fromName = this.data.userData.name
    rtcPeerConnection = new RTCPeerConnection(iceServers)
  }


  msg = `Waiting for ${this.chat.selectedUser.value.name} to accept your request`

  onClose()
  {
    this.chat.socket.emit('over' ,{toID : toID})
      localStream.getTracks().forEach(function(track) { track.stop(); }) 
      if(remoteStream) remoteStream.getTracks().forEach(function(track) { track.stop(); })
    rtcPeerConnection.close()
    document.getElementById('chatdash').style.display=''
    this.video.outgoingCall.next(false)
  }


  ngOnInit(): void {

    this.setLocalStream(mediaConstraints)

    if(toID && fromID)
      {
      this.chat.socket.emit('join', {fromID,toID,fromName})
    }
    
    this.chat.socket.on('start_call', async (data) => {
      console.log('Socket event callback: start_call')
        this.msg = `${this.chat.selectedUser.value.name} accepted your request`
        // rtcPeerConnection = new RTCPeerConnection(iceServers)
        localStream.getTracks().forEach((track) => {rtcPeerConnection.addTrack(track, localStream)})
        rtcPeerConnection.ontrack = this.setRemoteStream
        rtcPeerConnection.onicecandidate = (event)=>{
          if (event.candidate) {
            this.chat.socket.emit('webrtc_ice_candidate', {
              label: event.candidate.sdpMLineIndex,
              candidate: event.candidate.candidate,
              toID:data.toID
            })
          }
        }
        const offer = await rtcPeerConnection.createOffer()
        await rtcPeerConnection.setLocalDescription(new RTCSessionDescription(offer));
        this.chat.socket.emit('webrtc_offer', {
          type: 'webrtc_offer',
          sdp: offer,
          fromID:fromID,
          toID:toID
        })
    })

     this.video.callRejected().subscribe((data: any) => {
      localStream.getTracks().forEach(function(track) { track.stop(); })
      if(remoteStream)  remoteStream.getTracks().forEach(function(track) { track.stop(); })
      rtcPeerConnection.close()
      document.getElementById('chatdash').style.display=''
      this.video.outgoingCall.next(false)  
    })

    this.chat.socket.on('busy', (data)=>{
      this.msg = `${this.chat.selectedUser.value.name} is busy on another Call`
      clearTimeout(timerID)
    })
    

    this.chat.socket.on('webrtc_answer', (event) => {
      console.log('Socket event callback: webrtc_answer')
      rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event.sdp))
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
    if(remoteStream)  remoteStream.getTracks().forEach(function(track) { track.stop(); })
      rtcPeerConnection.close()
      document.getElementById('chatdash').style.display=''
      this.video.outgoingCall.next(false)      
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
