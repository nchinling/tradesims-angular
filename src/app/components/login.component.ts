import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { LoginResponse } from '../models';
import { AccountService } from '../services/account.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  login$!: Promise<LoginResponse>
  loginForm!: FormGroup
  errorMessage$!: Observable<string>
  errorMessage!: string;
  KEY = "username"

  isLoading = false;

  fb = inject(FormBuilder)
  router = inject(Router)
  accountSvc = inject(AccountService)

  ngOnInit(): void {
    // this.errorMessage$ = this.accountSvc.onErrorMessage;
    this.loginForm = this.fb.group({
      email: this.fb.control<string>('ncl@email.com', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')]),
      password: this.fb.control<string>('#a888888', [ Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[a-zA-Z])(?=.*[@#$%^&+=]).*$') ])
    })
  }


  invalidField(ctrlName:string): boolean{
    return !!(this.loginForm.get(ctrlName)?.invalid && this.loginForm.get(ctrlName)?.dirty)
  }


  login() {
    this.isLoading = true;
    const email = this.loginForm.get('email')?.value
    const password = this.loginForm.get('password')?.value
    

    //the username and password are passed to loginSvc for loginGuard
    // this.accountSvc.username = username
    // this.accountSvc.password = password
  
    console.info('email: ', email)
    console.info('password: ', password)

    setTimeout(() => {
      this.isLoading = false;
    }, 10000);


    //Using promise
    this.login$=firstValueFrom(this.accountSvc.login(email, password))
    this.login$.then((response) => {
      console.log('timestamp:', response.timestamp);
      console.log('username:', response.username);
      console.log('account_id:', response.account_id);
      const queryParams = {
        account_id: response.account_id,
        username: response.username,
        // timestamp: response.timestamp
      };

     
      // this.accountSvc.account_id = response.account_id
      // this.accountSvc.key = response.key


    this.router.navigate(['/dashboard'], { queryParams: queryParams })

   
    });


  }

}


