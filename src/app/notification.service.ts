import { ConfirmDialogComponent } from './video/confirm-dialog/confirm-dialog.component';

import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {MatDialog} from '@angular/material/dialog';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastr: ToastrService , private dialog :MatDialog) { }

  showSuccess(message, title){
    this.toastr.success(message, title,{positionClass: 'toast-top-center',})
  }
  showError(message, title){
    this.toastr.error(message, title,{positionClass: 'toast-top-center',})
  }
  showWarning(message, title){
    this.toastr.warning(message, title,{positionClass: 'toast-top-center',})
  }

  openConfirmDialog(data)
  {
   return this.dialog.open(ConfirmDialogComponent,{
      width : '290px',
      panelClass : 'confirm-dialog-container',
      disableClose :  true,
      hasBackdrop:false,
      position: {top:'0'} ,
      data:{
        message : data
      }
    })
  }

  closeConfirmDialog()
  {
     this.dialog.closeAll()
  }
  
}
