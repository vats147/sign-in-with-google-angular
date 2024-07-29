import { Component, OnInit, NgZone } from '@angular/core';

declare var google: any;

interface User {
  name: string;
  email: string;
  photoUrl: string;
}

@Component({
  selector: 'app-login',
  template: `
    <div class="jumbotron bg-transparent text-center">
      <div *ngIf="!user" class="card text-center">
        <h6 class="card-header">
          Social Login Demo
        </h6>
        <div class="card-block">
          <h4 class="card-title">Not signed in</h4>
          <p class="card-text">Sign in with</p>
        </div>
        <div class="card-block">
          <button class="btn btn-social-icon btn-google" (click)="signInWithGoogle()">
            <span class="fa fa-google"> Sign In</span>
          </button>
        </div>
      </div>
      <div *ngIf="user" class="card text-center">
        <h6 class="card-header">
          Social Login Demo
        </h6>
        <div class="card-block"></div>
        <img class="card-img-top img-responsive photo"
             [src]="user.photoUrl">
        <div class="card-block">
          <h4 class="card-title">{{ user.name }}</h4>
          <p class="card-text">{{ user.email }}</p>
        </div>
        <div class="card-block">
          <button class="btn btn-danger" (click)="signOut()">Sign out</button>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  user: User | null = null;

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.loadGoogleScript();
  }

  loadGoogleScript() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    script.onload = () => {
      this.initializeGoogleSignIn();
    };
  }

  initializeGoogleSignIn() {
    google.accounts.id.initialize({
      client_id: '651095598599-v41736ecg4m3vr3omlfjat8a17k317ou.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this)
    });
  }

  signInWithGoogle() {
    google.accounts.id.prompt();
  }

  handleCredentialResponse(response: any) {
    const decodedToken = this.decodeJwtResponse(response.credential);
    this.ngZone.run(() => {
      this.user = {
        name: decodedToken.name,
        email: decodedToken.email,
        photoUrl: decodedToken.picture
      };
    });
  }

  decodeJwtResponse(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  signOut() {
    google.accounts.id.revoke(this.user?.email, () => {
      this.ngZone.run(() => {
        this.user = null;
      });
    });
  }
}