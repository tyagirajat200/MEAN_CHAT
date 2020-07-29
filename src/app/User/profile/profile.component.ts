import { DatabaseService } from './../../database.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AngularFireStorage } from "@angular/fire/storage";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  @Output() profileTab : EventEmitter <any> = new EventEmitter()

  onProfile()
  {
    this.profileTab.emit(false)
  }

  imageSrc : any = "https://www.w3schools.com/howto/img_avatar2.png"

  public msg =""
  public error =false
  name = ''

  /***************Password************************/
  oldPassword =''
  newPassword =''
  confirmPassword = ''

/**************Button Loading ****************************/
  imageLoading =false
  nameLoading =false
  passwordLoading = false

  
  constructor(private data : DatabaseService,private af : AngularFireStorage) { }

  ngOnInit(): void {
    this.name =this.data.userData.name
    if(this.data.userData.imagePath)
        this.imageSrc=this.data.userData.imagePath
  }


  imageDetails : any =''

  image(event){
    this.imageDetails = event.target.files[0]
    let fileReader = new FileReader();
    fileReader.readAsDataURL(event.target.files[0]); 
    fileReader.onload = (e) => {
      this.imageSrc=fileReader.result
    }
  }



  updateImage()
  {
    if(this.imageDetails)
   {
    this.imageLoading = true
    var filePath = `Chat/${this.imageDetails.name}_${new Date().getTime()}`
    let fileRef = this.af.ref(filePath)
    this.af.upload(filePath,this.imageDetails).snapshotChanges().subscribe(res=>{
      var progress = (res.bytesTransferred / res.totalBytes) * 100;
      console.log(progress);
    },
    err=>{
      this.imageLoading = false
      alert('Image Not Uploaded Try Again')
    },
    ()=>{
      fileRef.getDownloadURL().subscribe(url=>{
          if(url)
          {
            var data ={imagePath : url ,id : this.data.userData._id}
            this.data.updateProfileImage(data).subscribe((res:any)=>{
              this.imageLoading = false
              this.imageSrc = url
              this.imageDetails=''
              console.log("Image Uploaded");
              localStorage.setItem('user',JSON.stringify(res.data))
              this.data.userData = res.data
              this.msg='Image Uploaded Successfully'
            },
            err=>{
              alert('Please Try Again')
              this.imageLoading = false
            })
            
          }
      })
    })

   }
   else{
     alert('Please Select Image')
   }
  }

  updateName()
  {
      this.nameLoading = true
      var data = {name: this.name.trim() , id : this.data.userData._id}
      this.data.updateProfileName(data).subscribe((res : any)=>{
        this.msg= res.msg
        this.nameLoading = false
        this.error =false
        localStorage.setItem('user',JSON.stringify(res.data))
        this.data.userData = res.data
      },
      err=>{
        this.msg= err.error.msg
        this.nameLoading = false
        this.error =true
      }
      )
  }
  updatePassword()
  {
    this.passwordLoading =true
    var data ={oldPassword :this.oldPassword.trim() , newPassword : this.newPassword.trim() ,
       confirmPassword:this.confirmPassword.trim() , id:this.data.userData._id}
    this.data.updateProfilePassword(data).subscribe((res: any)=>{
      this.error =false
      this.msg= res.msg
      this.passwordLoading = false
    },
    err=>{
      this.msg= err.error.msg
      this.passwordLoading = false
      this.error =true
    }
    )
  }
}
