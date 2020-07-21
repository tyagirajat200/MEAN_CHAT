import { PublicGuard } from './AuthRoutes/public.guard';
import { PrivateGuard } from './AuthRoutes/private.guard';
import { ChatHomeComponent } from './chat/chat-home/chat-home.component';
import { RegisterComponent } from './User/register/register.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './User/login/login.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate:[PublicGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate:[PublicGuard]
  },
  {
    path: 'chat',
    component: ChatHomeComponent,
    canActivate: [PrivateGuard],
  },
  {
    path: 'chat/:id',
    component: ChatHomeComponent,
  },
  { 
    path: '**', 
    redirectTo:'login' 
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {

  
}
