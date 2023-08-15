import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { RegisterResponse, UserData } from '../models';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  register$!: Promise<RegisterResponse>

  registerForm!: FormGroup
  errorMessage!: string;

  isLoading = false;


  fb = inject(FormBuilder)
  router = inject(Router)
  accountSvc = inject(AccountService)
  errorMessage$!: Observable<string>

  ngOnInit(): void {
    this.registerForm = this.createForm()
    this.errorMessage$ = this.accountSvc.onErrorMessage;
  }

  ngAfterViewInit():void{
    this.errorMessage$ = this.accountSvc.onErrorMessage;
  }


  private createForm(): FormGroup {
    return this.fb.group({
      name: this.fb.control('', [ Validators.required, Validators.minLength(5)]),
      email: this.fb.control('', [ Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')]),
      username: this.fb.control('', [ Validators.required, Validators.minLength(5)]),
      password: this.fb.control('', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[a-zA-Z])(?=.*[@#$%^&+=]).*$')]),
    })
  }

  canExit(): boolean {
    return !this.registerForm.dirty
  }


  invalidField(ctrlName:string): boolean{
    return !!(this.registerForm.get(ctrlName)?.invalid && 
          this.registerForm.get(ctrlName)?.dirty)
  }


  registerAccount() {
    this.isLoading = true;
    const registerData:UserData = this.registerForm.value
    console.info('>> data: ', registerData)
    const name = this.registerForm.get('name')?.value
    const username = this.registerForm.get('username')?.value
    const password = this.registerForm.get('password')?.value

    //the username and password are passed to accountSvc for loginGuard
    this.accountSvc.username = username
    this.accountSvc.password = password
    console.info('registration data: ', registerData)

    setTimeout(() => {
      this.isLoading = false;
    }, 4000);

    //Using promise
    this.register$=firstValueFrom(this.accountSvc.registerAccount(registerData))
    this.register$.then((response) => {
      console.log('status:', response.status);
      console.log('timestamp:', response.timestamp);
      console.log('account_id:', response.account_id);
      console.log('response:', response);

     
      const queryParams = {
        account_id: response.account_id,
        username: response.username
      };

      this.accountSvc.account_id = response.account_id
      this.registerForm.reset

      this.router.navigate(['/dashboard'], { queryParams: queryParams })
    }).catch((error)=>{
  
      this.errorMessage = error.error;
      console.info('this.errorMessage is ' + this.errorMessage)
    });


  }
}

