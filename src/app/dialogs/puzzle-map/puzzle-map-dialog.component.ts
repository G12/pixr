import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MapDialogComponent} from '../map/map-dialog.component';
import {DialogPackage, LocalMetadata, PortalFrame, PortalInfo} from '../../data';
import {TrustmanService} from '../../services/trustman.service';
import {LatLng} from '../../project.data';
import {Clipboard} from '@angular/cdk/clipboard';
import {Const} from '../../const';
@Component({
  selector: 'app-puzzle-map-dialog',
  templateUrl: './puzzle-map-dialog.component.html',
  styleUrls: ['./puzzle-map-dialog.component.css']
})
export class PuzzleMapDialogComponent {
  hintMsg = '';
  portalInfo: PortalInfo;
  portalFrame: PortalFrame;
  localMetadata: LocalMetadata;
  ingressName: string;

  label = '';
  comment = '';
  owner = '';
  msg = '';
  url = '';
  latLng: LatLng;
  isValidUrl = false;
  isValidChar = false;
  showUrlPage = false;
  savedUrl = false;
  dirty = false;
  pegPosition: LatLng;
  protected readonly Const = Const;
  constructor(
    public dialogRef: MatDialogRef<MapDialogComponent>,
    private clipboard: Clipboard,
    @Inject(MAT_DIALOG_DATA) public dialogPackage: DialogPackage,
    public trustmanService: TrustmanService) {
    this.ingressName = dialogPackage.ingressName;
    this.localMetadata = dialogPackage.localMetadata;
    this.portalInfo = dialogPackage.portalFrame.info;
    this.pegPosition = dialogPackage.pegPosition;
    this.portalFrame = dialogPackage.portalFrame;
    if (this.portalInfo) {
      this.label = this.portalInfo.label;
    }
    if (this.portalInfo.comment) {
      this.comment = this.portalInfo.comment;
    }
    if (this.portalInfo.latLng){
      this.url = this.portalInfo.url;
      this.savedUrl = true;
    }
  }
  getUrlPrompt(): string{
    return this.savedUrl ? 'To edit the Intel url' : 'If you know the Intel url';
  }
  convertToIITC(url: string): string {
    console.log('url: ' + url);
    if (-1 !== url.indexOf('https://intel.ingress.com', 0)){
      return url;
    }else { // Convert Google Maps to IITC format
      const arr = url.split('dir', 2);
      console.log('arr = ' + arr + ' arr[1] = ' + arr[1]);
      if ('\/\/' === arr[1].substring(0, 2)){
        // https://www.google.com/maps/dir//45.42268,-75.693955/@45.4078781,-75.7584253,12z?entry=ttu
        let str = arr[1].substring(2);
        const n = str.indexOf('\/@');
        str = str.substring(0, n);
        return 'https://intel.ingress.com/?pll=' + str;
      }else{
        console.log('// NOT found');
        // https://www.google.com/maps/dir/45.4088403,-75.642488/45.42268,-75.693955/
        // @45.4146821,-75.6822055,14z/data=!3m1!4b1!4m4!4m3!1m1!4e1!1m0?entry=ttu
        const arr2 = arr[1].split('\/', 3);
        console.log('arr2[2] = ' + arr2[2]);
        return 'https://intel.ingress.com/?pll=' + arr2[2];
      }
    }
  }
  validateUrl(url: string): void {
    this.isValidUrl = false;
    this.msg = 'Not a Valid Intel URL';
    if (this.testForValidURL(url)){
      this.msg = 'Missing URL location parameters ie: ?pll=45.5,-75.6';
      // If this is a Google maps URL convert it to IITC
      url = this.convertToIITC(url);
      const latLng = this.makeLatLng(url);
      if (latLng){
        this.msg = '';
        this.isValidUrl = true;
        latLng.isValid = true;
        this.latLng = latLng;
      }else {
        this.msg = 'URL parameters do not match a recognized pattern';
      }
    }
  }
  private makeLatLng(url: string): LatLng {
    if (url) {
      const arr = url.split('?');
      const paramsString = arr[1];
      const searchParams = new URLSearchParams(paramsString);
      const pll = searchParams.get('pll');
      let lat: number;
      let lng: number;
      if (pll) {
        const arr2 = pll.split(',');
        lat = parseFloat(arr2[0]);
        lng = parseFloat(arr2[1]);
        if (isNaN(lat)){return null; }
        if (isNaN(lng)){return null; }
        return {lat, lng, isValid: true};
      } else {
        const ll = searchParams.get('ll');
        if (ll) {
          const arr3 = ll.split(',');
          lat = parseFloat(arr3[0]);
          lng = parseFloat(arr3[1]);
          if (isNaN(lat)){return null; }
          if (isNaN(lng)){return null; }
          return {lat, lng, isValid: false};
        }else {
          return null; // {lat: 0, lng: 0, isValid: false};
        }
      }
    }
    return null;
  }

  saveUrl(portalFrame: PortalFrame): void {
    const projectID = portalFrame.info.projectId;
    const portalInfoID = portalFrame.info.id;
    if (this.isValidUrl) {
      portalFrame.info.url = this.url;
      portalFrame.info.latLng = this.latLng;
    }
    // console.log('Publishing: ' + JSON.stringify(portalInfo));
    this.trustmanService.setPortalInfo
    (projectID, portalInfoID, portalFrame.info).then(value => {
      console.log('setPortalInfo return value: ' + JSON.stringify(value));
      let msg = this.ingressName;
      msg = msg + ' SET intel url: ' + portalFrame.info.url;
      this.trustmanService.setLogMsg(this.ingressName, projectID, msg, portalFrame);
    }).catch(reason => {
      alert('setPortalInfo ERROR reason: ' + JSON.stringify(reason));
      portalFrame.info.published = false;
    });
    this.showUrlPage = false;
    this.savedUrl = true;
  }

  saveChar(portalFrame: PortalFrame, label: string): void {
    if (this.trustmanService.confirmLabel(portalFrame.info, label)){
      // const d = this.trustmanService.distanceBetween(
      //                  this.pegPosition, portalInfo.latLng);

      this.trustmanService.saveChar(portalFrame, label, this.ingressName);
      this.dialogRef.close();
    }
  }
  onCancelClick(portalInfo: PortalInfo): void {
    console.log('puzzle-map-dialog onCancelClick: ');
    console.log(portalInfo);
    this.dialogRef.close();
  }
  // TODO broaden the search scope of test ( removed intel from ...ingress.com/intel )
  private testForValidURL(url: string): boolean {
    return (-1 !== url.indexOf('https://intel.ingress.com', 0)
      || -1 !== url.indexOf('https://www.google.com/maps/dir', 0)
    );
  }
  toggleSetUrl(): void {
    this.showUrlPage = !this.showUrlPage;
  }
  validate(char: string, portalInfo: PortalInfo): void {
    const retVal = this.trustmanService.validateChar(char, portalInfo);
    this.hintMsg = retVal.hintMsg;
    this.dirty = retVal.dirty;
    this.isValidChar = retVal.isValidChar;
  }
  editUrl(): void {
    if (confirm('If this URL is not correct you may' +
      ' edit it. Note all edits will be recorded.')){
      this.savedUrl = false;
    }
  }
  copyToClipBoard(): void {
    if (confirm('Copy to Clipboard')){
      this.clipboard.copy(this.url);
    }
  }
  clip(url: string): string {
    let str = url.substring(0, 40);
    str += '...';
    return str;
  }
  openGoogleMaps(portalInfo: PortalInfo): void {
    if (confirm('The Google Maps App will open with walking' +
      ' directions for you to the portal. Shall we Proceed?')) {
      const dest = portalInfo.latLng;
      const orig = this.pegPosition;
      const url = 'https://www.google.com/maps/dir/?api=1&origin='
        + orig.lat + ',' + orig.lng + '&destination='
        + dest.lat + ',' + dest.lng + '&travelmode=walking';
      window.open(url, 'google-maps');
    }
  }

  delete(portalFrame: PortalFrame, label: string, ingressName: string): void {
    if (confirm('Remove the Value: ' + label )){
      this.label = '';
      // Wait a bit so snack bar will appear; probably not necessary on user screen
      setTimeout(() => {
        this.trustmanService.saveChar(portalFrame, '', ingressName);
      }, Const.SNACK_WAIT_VERY_SHORT);
    }
  }
  getHint(type: string): string {
    return this.trustmanService.getHint(type);
  }
  testDeleteConditions(label: string, portalInfo: PortalInfo): boolean {
    return this.trustmanService.testDeleteConditions(label, portalInfo);
  }

  deleteUrl(portalFrame: PortalFrame): void {
    if (confirm('Remove the url?')){
      const projectID = portalFrame.info.projectId;
      const portalInfoID = portalFrame.info.id;
      // if (this.isValidUrl) {
      portalFrame.info.url = '';
      portalFrame.info.latLng = null;
      this.url = '';
      // }
      // console.log('Publishing: ' + JSON.stringify(portalInfo));
      this.trustmanService.setPortalInfo
      (projectID, portalInfoID, portalFrame.info).then(value => {
        if (Const.DEBUG_PUZZLE_MAP_DIALOG){
          console.log('setPortalInfo return value: ' + JSON.stringify(value));
        }
        let msg = this.ingressName;
        msg = msg + ' REMOVED intel url: ' + portalFrame.info.url;
        this.trustmanService.setLogMsg(this.ingressName, projectID, msg, portalFrame);
      }).catch(reason => {
        alert('setPortalInfo ERROR reason: ' + JSON.stringify(reason));
        portalFrame.info.published = false;
      });
      this.showUrlPage = false;
      this.savedUrl = false;
    }
  }
  openMap(portalInfo: PortalInfo): void {
    this.dialogRef.close(portalInfo);
  }
  toggleEdit(portalFrame: PortalFrame): void {
    if (!portalFrame.canEdit){
      let str = '';
      let str2 = 'First determine the location of Portal:' + portalFrame.index;
      if (portalFrame.info.latLng){
        str = 'The Distance to Portal:' + portalFrame.index + ' is '
          + Math.round(portalFrame.dstToPrtl) + ' meters.';
        str2 = '';
      }
      if (confirm(str2 + str + '\nMove to within HACKING range for best results!' +
        '\nOR select OK to edit anyways.')){
        portalFrame.canEdit = !portalFrame.canEdit;
      }
    }else{
      portalFrame.canEdit = !portalFrame.canEdit;
    }
  }
}
