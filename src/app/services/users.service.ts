import { Injectable } from '@angular/core';
// import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AuthService} from './auth.service';
import {IngressNameData} from '../project.data';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private firestore: AngularFirestore,
              private authService: AuthService) { }

  getUserDocs(): any{
    return this.firestore.collection('ingress_names').snapshotChanges();
  }

  updateIngressName(name: string): void {
    this.authService.afAuth.currentUser.then(value => {
      const userUid = value.uid;
      const ingNameData: IngressNameData = {userUid, name};
      this.firestore.doc('ingress_names/' + userUid).set(ingNameData).catch((reason) => {
        console.log(reason);
      });
    });
  }
}
