import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthData } from "./auth-data.model";

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private isAuthenticated:boolean = false;
  private token:string;
  private authStatusListener = new Subject<boolean>();
  private tokenTimer:any;
  private userId:string;

  constructor(private _http:HttpClient, private router:Router) {}

  getToken(){
    return this.token;
  }

  getIsAuth(){
    return this.isAuthenticated;
  }

  getUserId(){
    return this.userId;
  }

  getAuthStatusListener(){
    return this.authStatusListener.asObservable();
  }

  createUser(email:string, password:string){
    const authData:AuthData = { email: email, password: password };
    this._http.post<{ message:string, result: any}>(`${environment.apiUrl}/user/signup`, authData).subscribe(() => {
      this.router.navigate(['/']);
    },
    error => {
      this.authStatusListener.next(false);
    });
  }

  login(email:string, password:string){
    const authData:AuthData = { email: email, password: password };
    this._http.post<{ message: string, token:string, expiresIn:number, userId:string }>(`${environment.apiUrl}/user/login`, authData).subscribe(res => {
      this.token = res.token;
      if(this.token){
        const expiresInDuration = res.expiresIn;
        this.setAuthTimer(expiresInDuration);
        this.isAuthenticated = true;
        this.userId = res.userId;
        this.authStatusListener.next(true);
        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
        this.saveAuthData(this.token, expirationDate, this.userId);
        this.router.navigate(['/']);
      }
    },
    error => {
      this.authStatusListener.next(false);
    });
  }

  autoAuthUser(){
    const authInformation = this.getAuthData();
    if(!authInformation){
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if(expiresIn > 0){
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logOut(){
    this.token =  null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration:number){
    this.tokenTimer = setTimeout(() => this.logOut(), duration * 1000);
  }

  private saveAuthData(token:string, expirationDate:Date, userId:string){
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData(){
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData(){
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if(!token || !expirationDate){
      return null;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    }
  }

}