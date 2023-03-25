import {Injectable} from '@angular/core';

// import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import {Subscription} from 'rxjs';
import {BootParam} from '../project.data';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  adminList = ['1KYU0BdE0rXTly5Y5KZslOvxpow2'];
  fsAdmin: BootParam;
  fsUser: BootParam;

  user: firebase.User;
  err: boolean;
  admin = false;
  private subscription: Subscription;

  constructor(public  afAuth: AngularFireAuth) {
    this.subscription = this.afAuth.authState.subscribe(user => {
      this.err = false;
      if (user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(this.user));
      } else {
        localStorage.setItem('user', null);
      }
    });
  }

  get hasError(): boolean {
    return this.err;
  }

  set hasError(val: boolean) {
    this.err = val;
  }

  get savedUser(): any {
    return JSON.parse(localStorage.getItem('user'));
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null;
  }

  async isAdmin(): Promise <boolean>{
    this.afAuth.currentUser.then((user) => {
      this.adminList.forEach((value => {
        if (value === user.uid){ this.admin = true; }
      }));
    });
    return this.admin;
  }

  async getFirebaseUser(): Promise<firebase.User> {
    this.afAuth.currentUser.then((user) => {
      this.adminList.forEach((value => {
        if (value === user.uid){ this.admin = true; }
      }));
      return user;
    });
    return null;
  }

  async login(email: string, password: string): Promise<any> {
    await this.afAuth.signInWithEmailAndPassword(email, password);
  }

  async logout(): Promise<any> {
    await this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
    });
  }

  async loginWithGoogle(): Promise<any> {
    this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((user) => {
      this.err = false;
      if (user) {
        this.user = user.user;
        localStorage.setItem('user', JSON.stringify(this.user));
      } else {
        localStorage.setItem('user', null);
      }
    });
  }
}
