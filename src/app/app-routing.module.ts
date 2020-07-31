import { ResetPasswordComponent } from './User/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './User/forgot-password/forgot-password.component';
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
    path: 'chat/:id',
    pathMatch:'full',
    component: ChatHomeComponent,
    canActivate: [PrivateGuard],
  },
  {
    path: 'forget-password',
    pathMatch:'full',
    component: ForgotPasswordComponent,
    canActivate:[PublicGuard]
  },
  {
    path: 'forget-password/:token',
    pathMatch:'full',
    component: ResetPasswordComponent,
    canActivate:[PublicGuard]
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
