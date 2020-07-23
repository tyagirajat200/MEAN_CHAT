import { ChatService } from './chat.service';
import { AppService } from './app.service';
import { DatabaseService } from './database.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";
import { PickerModule } from '@ctrl/ngx-emoji-mart';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatListComponent } from './chat/chat-list/chat-list.component';
import { ChatBoxComponent } from './chat/chat-box/chat-box.component';
import { MaterialModule } from './matarial/matarial.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {NgxAutoScrollModule} from "ngx-auto-scroll";
import { ChatHomeComponent } from './chat/chat-home/chat-home.component';
import { LoginComponent } from './User/login/login.component';
import { RegisterComponent } from './User/register/register.component';
import { NewUserComponent } from './chat/new-user/new-user.component';
import { SideboxComponent } from './chat/sidebox/sidebox.component';

import { AngularFireStorageModule } from "@angular/fire/storage";
import { AngularFireModule } from "@angular/fire";
import { environment } from "../environments/environment";
import { LoadingComponent } from './loading/loading.component';


export function app_init(appService: AppService) {
  return () => appService.initializeApp();
}

@NgModule({
  declarations: [
    AppComponent,
    ChatListComponent,
    ChatBoxComponent,
    ChatHomeComponent,
    LoginComponent,
    RegisterComponent,
    NewUserComponent,
    SideboxComponent,
    LoadingComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    NgxAutoScrollModule,
    HttpClientModule,
    PickerModule,
    AngularFireStorageModule,
    AngularFireModule.initializeApp(environment.firebaseConfig)
  ],
  providers: [DatabaseService ,ChatService ,
     AppService, {
    provide: APP_INITIALIZER, useFactory: app_init, deps: [AppService], multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
