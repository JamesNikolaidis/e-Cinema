import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgForm, NgModel, FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from 'src/app/shared/services/user.service';
import { Response } from '@angular/http';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from 'src/app/objects/user.object';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/shared/services/header.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  categories = [
    'Action',
    'Comedy',
    'Thriller',
    'Drama',
    'Documentary'
]

adminLoggedInUser:boolean;
authenticationForm: FormGroup;
userObject : User;
loggedInUserId:boolean = false;

@ViewChild('closeAuthenticationPanel') emailInput:ElementRef;
@ViewChild('openRegisterPanel') openRegisterPanelBtn:ElementRef;

forbiddenUsernames = ['Chris', 'Anna'];

  constructor(private userService : UserService,private router:Router,private headerService:HeaderService) { }
  isSearchFieldEnabled:boolean = false;




  ngOnInit() {
    this.authenticationForm = new FormGroup({
      'userData': new FormGroup({
        'email': new FormControl(null, [Validators.required]),
        'password': new FormControl(null, [Validators.required])
      })
    });

    this.userService.isAuthenticatedObservable.subscribe((data:boolean)=>{
      this.adminLoggedInUser=data;
     })

     
    this.userService.isAuthenticatedObservable.subscribe((data:any)=>{
      this.loggedInUserId=data;
    })

    this.headerService.enableSearchField.subscribe((data:boolean)=>{
      console.log("In header to active search "+data);
      this.isSearchFieldEnabled = data;
      console.log(this.isSearchFieldEnabled);
    })
  }

  onSubmit(formData  : NgForm){
      let el: HTMLElement = this.emailInput.nativeElement as HTMLElement;
      this.userService.authenticateUser(this.authenticationForm.get('userData.email').value,
      this.authenticationForm.get('userData.password').value).subscribe((data:any)=>{
          if(data===null){
            alert("You Insert invalid credentials.Please try again")
          }else{
        
            this.userService.saveUser(data);
            el.click();
            this.userObject = this.userService.getLoggInUser();
            sessionStorage.setItem("userId", this.userObject.getUserId().toString());
            this.userService.authenticatdUser.next(data);
            console.log(data +" fdsdfdsfsdf")
            if(data.userType=="admin"){
              this.adminLoggedInUser=true;
            }
            this.userService.isAuthenticated=true;
            this.loggedInUserId =this.userService.isAuthenticated;
            this.router.navigate(['']);

          }

    },(error:HttpErrorResponse) =>{
      alert("User doesnt exist!");
    });


  }

  forbiddenNames(control: FormControl): {[s: string]: boolean} {
    if (this.forbiddenUsernames.indexOf(control.value) !== -1) {
      return {'nameIsForbidden': true};
    }
    return null;
  }

  forbiddenEmails(control: FormControl): Promise<any> | Observable<any> {
    const promise = new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        if (control.value === 'test@test.com') {
          resolve({'emailIsForbidden': true});
        } else {
          resolve(null);
        }
      }, 1500);
    });
    return promise;
  }

  logOutUser(){
    sessionStorage.removeItem("userId");
    this.userService.isAuthenticated=false;
    this.userService.isAuthenticatedObservable.next(false);
    this.router.navigate(['']);
  }

  registerUser(){
    let el: HTMLElement = this.emailInput.nativeElement as HTMLElement;
    this.router.navigate(['userRegister']);
    el.click();
 
  }
}
