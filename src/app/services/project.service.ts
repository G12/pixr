import {Injectable} from '@angular/core';
import {
  BootParam,
  FirstSatProject,
  IngressNameData,
  PortalRec,
  ProjectUser,
  Messages,
  MsgDat,
  ColumnChar, ColumnRecData
} from '../project.data';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  projectUser: ProjectUser = {
    uid: '',
    displayName: '',
    photoURL: '',
    email: '',
  };

  firstSatProject: FirstSatProject = {
    name: 'FS TEST Project',
    date: '2021-02-26',
    projectUsers: null,
    canvasData: null,
  };

  // NEW March 8 2021
  public clipboard: PortalRec;
  projectUsers: ProjectUser[] = [];

  projectId: string;
  // rawDataId: string;

  // Boot parameters used to determine program flow
  fsAdmin: BootParam;
  fsUser: BootParam;

  userBootParamDocRef: AngularFirestoreDocument;
  adminBootParamDocRef: AngularFirestoreDocument;
  firstSatProjectDocRef: AngularFirestoreDocument;
  rawDataDocRef: AngularFirestoreDocument;
  bootParamsCollection: AngularFirestoreCollection;

  constructor(private firestore: AngularFirestore) {
    // this.columnData.portals = this.portals;
    // this.canvasData.columnCollection = this.columnCollection;
    // this.firstSatProject.canvasData = this.canvasData;
    this.firstSatProject.projectUsers = this.projectUsers;

    // get a reference to the AngularFirestoreDocuments
    this.userBootParamDocRef = this.firestore.collection('fs_boot_params').doc('fs_user');
    this.adminBootParamDocRef = this.firestore.collection('fs_boot_params').doc('fs_admin');
    this.bootParamsCollection = this.firestore.collection('fs_boot_params');
    ///////////////////////////   Boot Up  //////////////////////////

  }

  /////////////////////////////  User data  ////////////////////////////
  setIngressName(name: string, userUid: string): void{
    const data: IngressNameData = {name, userUid};
    this.firestore.collection('ingress_names').add(data);
  }

  ////////////////// disparate PortalRecCollection objects //////////////
  setColumnRecData(columnRecData: ColumnRecData): void{
    // console.log('columnRecData: ' + JSON.stringify(columnRecData));
    this.firestore.collection(columnRecData.rawDataId).doc(columnRecData.id).set(columnRecData).then(value => {
      // console.log('setportal return value: ' + JSON.stringify(value));
    }).catch(reason => {
      console.log('setColumnRecData ERROR reason: ' + JSON.stringify(reason));
    });
  }

  ////////////////////////////////////////////  Not used
  setCodeChar(columnChar: ColumnChar): void{
    // console.log('setCodeChar ColumnChar: ' + JSON.stringify(columnChar));
    // if (true) {return; }
    this.firestore.collection(columnChar.rawDataId).doc(columnChar.id).set(columnChar).then(value => {
      // console.log('setportal return value: ' + JSON.stringify(value));
    }).catch(reason => {
      console.log('setCodeChar ERROR reason: ' + JSON.stringify(reason));
    });
  }

  clearLog(rawDatId: string): void {
    this.firestore.collection(rawDatId).doc('_MsgLog').set({messages: []});
  }

  setLogMsg(rawDatId: string, msg: string, prtlRec: PortalRec): void{
    this.firestore.collection(rawDatId).doc('_MsgLog').get().subscribe(document => {
      const time = JSON.stringify(new Date());
      let id = '';
      if (prtlRec) { id = prtlRec.colName + ':' + prtlRec.index; }
      const msgDat: MsgDat = {msg, time, prtlId: id };
      let messagesDoc: Messages;
      if (msg === 'CLEAR_ALL_MESSAGES') {
        messagesDoc = {messages: []};
        // Send a user friendly message
        const usrName = prtlRec ? prtlRec.user : '';
        msgDat.msg = usrName + ' Cleared the Log!';
      } else if (document.exists){
        messagesDoc = document.data() as Messages;
      } else {
        messagesDoc = {messages: []};
      }
      messagesDoc.messages.unshift(msgDat);
      this.firestore.collection(rawDatId).doc('_MsgLog').set(messagesDoc).then(doc => {
        // console.log('setLogMsg return value: ' + JSON.stringify(doc));
      }).catch(reason => {
        console.log('setLogMsg ERROR reason: ' + JSON.stringify(reason));
      });
    });
  }

  //////////////////////////// PortalRecCollection  /////////////////////
  updatePortalRec(rawDatId: string, path: string, portalRec: PortalRec): void{
    this.firestore.collection(rawDatId).doc(path).update(portalRec);
  }

  getPortalRecs(path: string): any{
    return this.firestore.collection(path).snapshotChanges();
  }

  setPortalRec(rawDatId: string, path: string, portalRec: PortalRec): void{
    this.firestore.collection(rawDatId).doc(path).set(portalRec).then(value => {
      // console.log('setportal return value: ' + JSON.stringify(value));
    }).catch(reason => {
      console.log('setPortal ERROR reason: ' + JSON.stringify(reason));
    });
  }

  getMsgLog(rawDatId: string): AngularFirestoreDocument{
    return this.firestore.collection(rawDatId).doc('_MsgLog');
    // this.rawDataDocRef = this.firestore.collection(rawDatId).doc('_MsgLog');
    // return this.rawDataDocRef;
  }

  /*
  getRawDataDocRef(projectId): AngularFirestoreDocument{
    this.rawDataDocRef = this.firestore.collection('raw_data_projects').doc(projectId);
    return this.rawDataDocRef;
  }
   */

}
