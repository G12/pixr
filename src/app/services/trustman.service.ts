import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import {LocalMetadata, LogMessages, MsgData, PortalInfo, PortalVisiter} from '../data';
import {SnackbarService} from './snackbar.service';
import {Const} from '../const';
// import {ProjectService} from './project.service';

@Injectable({
  providedIn: 'root'
})
export class TrustmanService {

  pzAdminBootParamDocRef: AngularFirestoreDocument;
  pzUserBootParamDocRef: AngularFirestoreDocument;
  projectListBootDocRef: AngularFirestoreDocument;

  constructor(private firestore: AngularFirestore,
              private snackbarService: SnackbarService) {
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

  getMsgLog(rawDatId: string): AngularFirestoreDocument{
    return this.firestore.collection(rawDatId).doc('_MsgLog');
    // this.rawDataDocRef = this.firestore.collection(rawDatId).doc('_MsgLog');
    // return this.rawDataDocRef;
  }

  setLogMsg(ingressName: string, projId: string, msg: string, portalData: PortalInfo): void{
    this.firestore.collection(projId).doc('_MsgLog').get().subscribe(document => {
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const time = hours + ':' + minutes; // JSON.stringify(new Date());
      const tStamp = Date.now();
      let prtlId = '';
      let url = '';
      let latLng = null;
      let portalIndex = null;
      let portalLabel = '';
      if (portalData) {
          portalLabel = portalData.label;
          prtlId = 'P:' + portalData.index;
          if (portalData.url && portalData.url.length > 0){
            url = portalData.url;
          }
          if (portalData.latLng){
            latLng = portalData.latLng;
          }
          if (portalData.index) {
            portalIndex = portalData.index;
          }
      }
      const msgDat: MsgData = { ingressName, portalIndex, portalLabel, msg, time, tStamp, prtlId, url, latLng };
      let messagesDoc: LogMessages;
      if (msg === 'CLEAR_ALL_MESSAGES') {
        messagesDoc = {messages: []};
        // Send a user friendly message
        // const usrName = portalData ? portalData.user : '';
        // msgDat.msg = usrName + ' Cleared the Log!';
      } else if (document.exists){
        messagesDoc = document.data() as LogMessages;
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

  saveChar(portalInfo: PortalInfo, label: string, ingressName: string): void {
    const projectID = portalInfo.projectId;
    const portalInfoID = portalInfo.id;
    let action = 'EDITED';
    if (!portalInfo.published){
      action = 'SET';
      portalInfo.published = true;
    }
    portalInfo.label = label;
    const portalVisiter: PortalVisiter = {
      ingressName,
      action,
      msg: ''
    };
    // TODO push new PortalVisiter into visiters
    if (!portalInfo.visiters){

    }else{

    }
    // portalInfo.published = true; // TODO make a publish log
    console.log('Publishing: ' + JSON.stringify(portalInfo));
    this.setPortalInfo
    (projectID, portalInfoID, portalInfo).then(value => {
      console.log('setPortalInfo return value: ' + JSON.stringify(value));
      let msg = ingressName + ' ' + action + ' Portal Character';
      msg = msg + ' to ' + portalInfo.label;
      this.setLogMsg(ingressName, projectID, msg, portalInfo);
    }).catch(reason => {
      const str = 'Could not set the value; ERROR reason: ' + JSON.stringify(reason);
      this.snackbarService.openSnackBarTop(str, 'Close', Const.SNACK_WAIT_LONG);
      portalInfo.published = false;
    });
  }

  isGlyphName(name: string): boolean {
    const glyphs = [
      'Before',
      'Begin',
      'Human',
      'Body',
      'Breathe',
      'Call',
      'Capture',
      'Change',
      'Chaos',
      'Clear',
      'Clear All',
      'Complex',
      'Conflict',
      'Consequence',
      'Contemplate',
      'Courage',
      'Create',
      'Idea',
      'Creativity',
      'Danger',
      'Data',
      'Defend',
      'Destiny',
      'Destination',
      'Destroy',
      'Deteriorate',
      'Easy',
      'Die',
      'Difficult',
      'Discover',
      'Distance',
      'End',
      'Enlightened',
      'Equal',
      'Escape',
      'Evolution',
      'Failure',
      'Fear',
      'Field',
      'Follow',
      'Forget',
      'Future',
      'Gain',
      'Civilization',
      'Grow',
      'Harm',
      'Harmony',
      'Have',
      'Help',
      'Hide',
      'Me',
      'Ignore',
      'Imperfect',
      'Imperfect',
      'Improve',
      'Impure',
      'Intelligence',
      'Interrupt',
      'Journey',
      'Key',
      'Knowledge',
      'Lead',
      'Legacy',
      'Less',
      'Liberate',
      'Lie',
      'Link',
      'Live Again',
      'Reincarnate',
      'Lose',
      'Message',
      'Mind',
      'More',
      'Mystery',
      'N\'zeer',
      'Nature',
      'Nemesis',
      'New',
      'Inside',
      'Nourish',
      'Old',
      'Open',
      'Accept',
      'Open All',
      'Osiris',
      'Portal',
      'Past',
      'Path',
      'Perfection',
      'Perspective',
      'Potential',
      'Presence',
      'Present',
      'Pure',
      'Pursue',
      'Chase',
      'Question',
      'React',
      'Rebel',
      'Recharge',
      'Repair',
      'Repair',
      'Reduce',
      'Resistance',
      'Response',
      'Restraint',
      'Retreat',
      'Safety',
      'Save',
      'See',
      'Search',
      'Seek',
      'Self',
      'I',
      'Me',
      'Separate',
      'Shapers',
      'Share',
      'Shield',
      'Signal',
      'Simple',
      'Soul',
      'Stay',
      'Star',
      'Strong',
      'Sustain',
      'Sustain All',
      'Technology',
      'Them',
      'Together',
      'Truth',
      'Unbounded',
      'Use',
      'Victory',
      'Want',
      'We',
      'Us',
      'Weak',
      'Worth',
      'XM',
      'You',
      'Your',
      'Other',
    ];
    const test = glyphs.find(d => d.toUpperCase() === name.toUpperCase());
    if (test){
      return true;
    }
    return false;
  }

}
