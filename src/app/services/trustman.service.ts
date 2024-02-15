import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import {LocalStorage, PortalData} from '../data';
import {BootParam, MsgDat} from '../project.data';
import {ProjectService} from './project.service';

@Injectable({
  providedIn: 'root'
})
export class TrustmanService {

  userBootParamDocRef: AngularFirestoreDocument;
  projectListBootDocRef: AngularFirestoreDocument;

  constructor(private firestore: AngularFirestore,
              private projectService: ProjectService) {
    // get a reference to the AngularFirestoreDocuments
    this.userBootParamDocRef = this.firestore.collection('fs_boot_params').doc('puzzle_name');
    this.projectListBootDocRef = this.firestore.collection('fs_boot_params').doc('project_list');
  }

  getMetadataDoc(id: string): AngularFirestoreDocument {
    return this.firestore.collection(id).doc('_metadata');
  }

  getMsgLogDoc(id: string): AngularFirestoreDocument {
    return this.firestore.collection(id).doc('_MsgLog');
  }



}
