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
  ],
}



@Component({
  selector: 'app-incoming-video',
  templateUrl: './incoming-video.component.html',
  styleUrls: ['./incoming-video.component.css']
})
export class IncomingVideoComponent implements OnInit {
  navigator = <any>navigator
  constructor(private chat: ChatService, private video: VideoService ,private data : DatabaseService) {}

  msg = `Connected`

  onClose()
  {
    document.getElementById('chatdash').style.display=''
    this.video.incommingCall.next(false)
    
  }
  ngOnInit(): void {

   this.setLocalStream(mediaConstraints)

   this.chat.socket.on('webrtc_offer', async (data) => {
    console.log('Socket event callback: webrtc_offer')
      rtcPeerConnection = new RTCPeerConnection(iceServers)
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
