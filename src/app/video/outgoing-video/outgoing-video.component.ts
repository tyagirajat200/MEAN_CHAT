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

// Free public STUN servers provided by Google.
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
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
    fromID = this.data.userData._id
  }


  msg = `Waiting for ${this.chat.selectedUser.value.name} to accept your request`

  onClose()
  {
    document.getElementById('chatdash').style.display=''
    this.video.outgoingCall.next(false)
  }


  ngOnInit(): void {

    this.setLocalStream(mediaConstraints)

    if(toID && fromID)
      {
      this.chat.socket.emit('join', {fromID,toID})
    }

    this.chat.socket.on('start_call', async (data) => {
      console.log('Socket event callback: start_call')
      console.log(data , "start Call");
        this.msg = `${this.chat.selectedUser.value.name} accepted your request`
        rtcPeerConnection = new RTCPeerConnection(iceServers)
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
      this.msg = `${this.chat.selectedUser.value.name} rejected your call. Call Again`
    })

    this.chat.socket.on('busy', (data)=>{
      this.msg = `${this.chat.selectedUser.value.name} is busy on another Call`
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
  }

  setLocalStream(mediaConstraints) {

    this.navigator.getUserMedia = (this.navigator.getUserMedia ||this.navigator.webkitGetUserMedia
      ||this.navigator.mozGetUserMedia ||this.navigator.msGetUserMedia );
      this.navigator.mediaDevices.getUserMedia(mediaConstraints)
      .then(mediaStream=>{
        localStream = mediaStream;
        localVideo= document.getElementById('local-video')
          localVideo.srcObject = mediaStream
      })
      .catch(err=>{
        console.log('navigator.getUserMedia error: ', err)
      })
    }

     setRemoteStream(event) {
      remoteVideo = document.getElementById('remote-video')
      remoteVideo.srcObject = event.streams[0]
      remoteStream = event.stream
    }

}
