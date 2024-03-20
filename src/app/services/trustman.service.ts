import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import {GlyphData, LocalMetadata, LogMessages, MarkerOptions, MsgData, PortalInfo, PortalVisiter, RetVal} from '../data';
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

  iconBase = 'https://geopad.ca/pixr2/assets/';

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
      }).catch(reason => {
        console.log('setLogMsg ERROR reason: ' + JSON.stringify(reason));
      });
    });
  }

  saveChar(portalInfo: PortalInfo, label: string, ingressName: string): void {
    const projectID = portalInfo.projectId;
    const portalInfoID = portalInfo.id;
    const startValue = portalInfo.label;
    let action = 'EDITED';
    if (!portalInfo.published){
      action = 'SET';
      portalInfo.published = true;
    }else{
      if (label === ''){
        action = 'REMOVED';
      }
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
    this.setPortalInfo
    (projectID, portalInfoID, portalInfo).then(value => {
      let msg = 'At Portal:' + portalInfo.index + ' ' + ingressName + ' ' + action + ' value';
      if (action === 'EDITED'){
        msg = msg + ' from "' + startValue + '" to "' + portalInfo.label + '"';
      }else if (action === 'REMOVED'){
        msg = msg + ': "' + startValue + '"';
      }else{
        msg = msg + ' to "' + portalInfo.label + '"';
      }
      this.setLogMsg(ingressName, projectID, msg, portalInfo);
    }).catch(reason => {
      const str = 'Could not set the value; ERROR reason: ' + JSON.stringify(reason);
      this.snackbarService.openSnackBarTop(str, 'Close', Const.SNACK_WAIT_LONG);
      portalInfo.published = false;
    });
  }

  isGlyphName(glyphName: string): GlyphData {
    const glyphs = [
      ['Abandon'],
      ['Adapt'],
      ['Advance'],
      ['After'],
      ['Again', 'Repeat'],
      ['All'],
      ['Answer'],
      ['Attack', 'War'],
      ['Avoid', 'Struggle'],
      ['Barrier', 'Obstacle'],
      ['Being'],
      ['Before'],
      ['Begin', 'Human'],
      ['Body', 'Shell'],
      ['Breathe'],
      ['Call'],
      ['Capture'],
      ['Change', 'Modify'],
      ['Chaos', 'Disorder'],
      ['Clear'],
      ['Clear All'],
      ['Complex'],
      ['Conflict'],
      ['Consequence'],
      ['Contemplate'],
      ['Contract', 'Reduce'],
      ['Courage'],
      ['Create', 'Creation'],
      ['Creativity'],
      ['Mind', 'Thought', 'Idea'],
      ['Danger'],
      ['Data', 'Signal', 'Message'],
      ['Defend'],
      ['Destiny'],
      ['Destination'],
      ['Destroy', 'Destruction'],
      ['Deteriorate', 'Erode'],
      ['Die'],
      ['Difficult'],
      ['Discover'],
      ['Distance', 'Outside'],
      ['Easy'],
      ['End', 'Close', 'Finality'],
      ['Enlightened', 'Enlightenment'],
      ['Equal'],
      ['Escape'],
      ['Evolution', 'Success', 'Progress'],
      ['Failure'],
      ['Fear'],
      ['Field'],
      ['Follow'],
      ['Forget'],
      ['Future', 'Forward-Time'],
      ['Gain'],
      ['Civilization', 'Government', 'City', 'Structure'],
      ['Grow'],
      ['Harm'],
      ['Harmony', 'Peace'],
      ['Have'],
      ['Help'],
      ['Hide'],
      ['I', 'Me', 'Self'],
      ['Ignore'],
      ['Imperfect'],
      ['Improve'],
      ['Impure'],
      ['Intelligence'],
      ['Interrupt'],
      ['Journey'],
      ['Key'],
      ['Knowledge'],
      ['Lead'],
      ['Legacy'],
      ['Less'],
      ['Liberate'],
      ['Lie'],
      ['Link'],
      ['Live Again', 'Reincarnate'],
      ['Lose', 'Loss'],
      ['Message'],
      ['Mind', 'Idea', 'Thougt'],
      ['More'],
      ['Mystery'],
      ['N\'zeer'],
      ['Nature'],
      ['Nemesis'],
      ['New'],
      ['No', 'Not', 'Absent', 'Inside'],
      ['Nourish'],
      ['Old'],
      ['Open', 'Accept'],
      ['Open All'],
      ['Osiris'],
      ['Portal', 'Opening', 'Doorway'],
      ['Past'],
      ['Path'],
      ['Perfection', 'Balance'],
      ['Perspective'],
      ['Potential'],
      ['Presence'],
      ['Present', 'Now'],
      ['Pure', 'Purity'],
      ['Pursue', 'Aspiration'],
      ['Chase'],
      ['Question'],
      ['React'],
      ['Rebel'],
      ['Recharge', 'Repair'],
      ['Resistance', 'Resist', 'Struggle'],
      ['Response'],
      ['Restraint'],
      ['Retreat'],
      ['Safety'],
      ['Save', 'Rescue'],
      ['See'],
      ['Seek', 'Search'],
      ['Self', 'Individual'],
      ['Separate'],
      ['Shapers', 'Collective'],
      ['Share'],
      ['Shield'],
      ['Simple'],
      ['Soul', 'Spirit', 'Life Fource'],
      ['Stability', 'Stay'],
      ['Star'],
      ['Strong'],
      ['Sustain'],
      ['Sustain All'],
      ['Technology'],
      ['Them'],
      ['Together'],
      ['Truth'],
      ['Unbounded'],
      ['Use'],
      ['Victory'],
      ['Want', 'Desire'],
      ['We', 'Us'],
      ['Weak'],
      ['Worth'],
      ['XM'],
      ['You', 'Other'],
    ];
    const names: string[] = [];
    const name = '';
    const glyphData: GlyphData = {
        names,
        name: glyphName,
        isGlyph: false,
        AKA: '',
    };
    const test = glyphs.find(arr => {
      arr.find(str => {
        const t = glyphName.toUpperCase() === str.toUpperCase();
        if (t){
          glyphData.names = arr;
          glyphData.isGlyph = true;
          const r = glyphData.names.filter
          (e => e.toUpperCase() !== glyphData.name.toUpperCase());
          glyphData.AKA = 'AKA: ' + r.toString();
        }
        return t;
      });
    });
    return glyphData;
  }

  validateChar(char: string, portalInfo: PortalInfo): RetVal {
    const type = portalInfo.type;
    let hintMsg = '';
    let isValidChar = true;
    let dirty = false;
    const retVal: RetVal = {
      hintMsg, isValidChar, dirty
    };

    switch (type) {
      case Const.GLYPH_CODE:
        if (char.length >= 2 || char.toUpperCase() === 'I'){ // smallest Glyph names are 2 characters
          // Now test for valid glyph name
          const glyphData: GlyphData = this.isGlyphName(char);
          hintMsg = '';
          if (glyphData.isGlyph){
            if (glyphData.names.length > 1){
              hintMsg = glyphData.AKA;
              portalInfo.AKA = glyphData.AKA;
            }
          } else {
            hintMsg = 'Not a Glyph Name!';
            isValidChar = false;
          }
        }else{
          hintMsg = 'Not a Glyph Name!';
          isValidChar = false;
        }
        break;
      case Const.NUMBER_CODE:
        const regX = /^-?\d+$/;
        if (!regX.test(char)){
          hintMsg = 'Only Numbers!';
          isValidChar = false;
        }
        break;
      case Const.LETTER_CODE:
        const regex = /^[a-zA-Z]+$/;
        if (!regex.test(char)){
          hintMsg = 'Only Letters A-Z!';
          isValidChar = false;
        }
        break;
    }
    dirty = true;
    retVal.dirty = dirty;
    retVal.isValidChar = isValidChar;
    retVal.hintMsg = hintMsg;
    return retVal;
  }

  getHint(type: string): string {
    let str = 'Glyph Name';
    if (type === Const.LETTER_CODE){
      str = 'Letter';
    }else if (type === Const.NUMBER_CODE) {
      str = 'Number';
    }
    return str;
  }

  getIconUrl(info: PortalInfo): string {
    let done = false;
    if (info.label && info.label.length > 0){
      done = true;
    }
    let filename = '';
    if (info.type === Const.LETTER_CODE){
      filename = done ? 'letterDone.png' : 'letter.png';
    }else if (info.type === Const.NUMBER_CODE){
      filename = done ? 'numberIsDone.png' : 'number.png';
    }else{
      filename = done ? 'gliphDone.png' : 'gliph.png';
    }
    return this.iconBase + filename; // this.iconBase + 'gliph.png';
  }

  getOptons(info: PortalInfo): google.maps.MarkerOptions {
    const url = this.getIconUrl(info);
    let title = 'Portal:' + info.index + ' value = ';
    if (!info.label || info.label === ''){
      title += 'UKNOWN?';
    }else{
      title += info.label;
    }
    return {icon: {url, labelOrigin: new google.maps.Point(20, -8) }};
  }
  confirmLabel(portalInfo: PortalInfo, label: string): boolean {
    // Check letters and numbers in case multiple chars are being used
    if (portalInfo.type !== Const.GLYPH_CODE && label.length > 1){
      if (!confirm('The length of: ' + label +
        ' is more than one character; do you want to Continue?')){
        return false;
      }
    }
    // Confirmation not necessary for deletion indicator value ''
    if (portalInfo.label !== label && portalInfo.label !== ''){
      if (!confirm('Do you really want to replace the original value: ' +
        portalInfo.label + ' with ' + label)){
        return false;
      }
    }
    console.log('OK now?');
    return true;
  }




  testDeleteConditions(label: string, portalInfo: PortalInfo): boolean {
    return label.length !== 0 && portalInfo.label && label === portalInfo.label;
  }

}
