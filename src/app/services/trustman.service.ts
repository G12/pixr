import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import {LocalMetadata, PortalInfo} from '../data';
import {BootParam, Messages, MsgDat, PortalRec} from '../project.data';
import {ProjectService} from './project.service';

@Injectable({
  providedIn: 'root'
})
export class TrustmanService {

  pzAdminBootParamDocRef: AngularFirestoreDocument;
  pzUserBootParamDocRef: AngularFirestoreDocument;
  projectListBootDocRef: AngularFirestoreDocument;

  constructor(private firestore: AngularFirestore,
              private projectService: ProjectService) {
    // get a reference to the AngularFirestoreDocuments
    this.pzUserBootParamDocRef = this.firestore.collection('fs_boot_params').doc('pz_user');
    this.pzAdminBootParamDocRef = this.firestore.collection('fs_boot_params').doc('pz_admin');

    this.projectListBootDocRef = this.firestore.collection('fs_boot_params').doc('pz_project_list');
  }

  updatePortalInfo(docId: string, portalId: string, portalInfo: PortalInfo): void{
    this.firestore.collection(docId).doc(portalId).update(portalInfo);
  }

  setPortalInfo(docId: string, portalId: string, portalInfo: PortalInfo): Promise<void>{
    return this.firestore.collection(docId).doc(portalId).set(portalInfo);
  }


  updateMetaData(metadata: LocalMetadata): void{
    this.firestore.collection(metadata.projectID).doc('_metadata').update(metadata).then(value => {
      // console.log(value); // empty!
      console.log('updated metadata');
    }).catch(reason => {
      console.log(reason);
    });
  }

  metadataDocRef(id: string): AngularFirestoreDocument {
    return this.firestore.collection(id).doc('_metadata');
  }

  msgLogDocRef(id: string): AngularFirestoreDocument {
    return this.firestore.collection(id).doc('_MsgLog');
  }

  setLogMsg(projId: string, msg: string, portalData: PortalInfo): void{
    this.firestore.collection(projId).doc('_MsgLog').get().subscribe(document => {
      const time = JSON.stringify(new Date());
      let id = '';
      if (portalData) { id = portalData.label + ':' + portalData.index; }
      const msgDat: MsgDat = {msg, time, prtlId: id };
      let messagesDoc: Messages;
      if (msg === 'CLEAR_ALL_MESSAGES') {
        messagesDoc = {messages: []};
        // Send a user friendly message
        // const usrName = portalData ? portalData.user : '';
        // msgDat.msg = usrName + ' Cleared the Log!';
      } else if (document.exists){
        messagesDoc = document.data() as Messages;
      } else {
        messagesDoc = {messages: []};
      }
      messagesDoc.messages.unshift(msgDat);
      this.firestore.collection(projId).doc('_MsgLog').set(messagesDoc).then(doc => {
        // console.log('setLogMsg return value: ' + JSON.stringify(doc));
      }).catch(reason => {
        console.log('setLogMsg ERROR reason: ' + JSON.stringify(reason));
      });
    });
  }
}
