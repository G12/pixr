import {Component, Inject, Input, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MapDialogComponent} from '../map/map-dialog.component';
import {PortalInfo} from '../../data';
import {TrustmanService} from '../../services/trustman.service';
import {LatLng, PortalRec} from '../../project.data';
import {Clipboard} from '@angular/cdk/clipboard';

@Component({
  selector: 'app-puzzle-map-dialog',
  templateUrl: './puzzle-map-dialog.component.html',
  styleUrls: ['./puzzle-map-dialog.component.css']
})
export class PuzzleMapDialogComponent {

  label = '';
  comment = '';
  owner = '';
  msg = '';
  url = '';
  latLng: LatLng;
  isValidUrl = false;
  showUrlPage = false;
  savedUrl = false;
  dirty = false;

  urlPrompt = 'If you know the Intel url';

  constructor(
    public dialogRef: MatDialogRef<MapDialogComponent>,
    private clipboard: Clipboard,
    @Inject(MAT_DIALOG_DATA) public portalInfo: PortalInfo,
    public trustmanService: TrustmanService) {
    if (portalInfo.label) {
      this.label = portalInfo.label;
    }
    if (portalInfo.comment) {
      this.comment = portalInfo.comment;
    }
    if (portalInfo.latLng){
      this.url = portalInfo.url;
      this.savedUrl = true;
    }
  }

  getUrlPrompt(): string{
    return this.savedUrl ? 'To edit the Intel url' : 'If you know the Intel url';
  }

  validateUrl(url: string, portalInfo: PortalInfo): void {
    this.isValidUrl = false;
    console.log(url);
    this.msg = 'Not a Valid Intel URL';
    if (this.testForValidURL(url)){
      this.msg = 'Missing URL location parameters ie: ?pll=45.5,-75.6';
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

  saveUrl(portalInfo: PortalInfo): void {
    const projectID = portalInfo.projectId;
    const portalInfoID = portalInfo.id;
    if (this.isValidUrl) {
      portalInfo.url = this.url;
      portalInfo.latLng = this.latLng;
    }
    console.log('Publishing: ' + JSON.stringify(portalInfo));
    this.trustmanService.setPortalInfo
    (projectID, portalInfoID, portalInfo).then(value => {
      console.log('setPortalInfo return value: ' + JSON.stringify(value));
    }).catch(reason => {
      alert('setPortalInfo ERROR reason: ' + JSON.stringify(reason));
      portalInfo.published = false;
    });
    this.showUrlPage = false;
    this.savedUrl = true;
  }

  saveChar(portalInfo: PortalInfo): void {
    const projectID = portalInfo.projectId;
    const portalInfoID = portalInfo.id;
    portalInfo.label = this.label;
    portalInfo.published = true; // TODO make a publish log
    console.log('Publishing: ' + JSON.stringify(portalInfo));
    this.trustmanService.setPortalInfo
    (projectID, portalInfoID, portalInfo).then(value => {
      console.log('setPortalInfo return value: ' + JSON.stringify(value));
    }).catch(reason => {
      alert('setPortalInfo ERROR reason: ' + JSON.stringify(reason));
      portalInfo.published = false;
    });
    this.dialogRef.close();
  }

  onCancelClick(portalInfo: PortalInfo): void {
    this.dialogRef.close();
  }

  // TODO broadend the search scope of test ( removed intel from ...ingress.com/intel )
  private testForValidURL(url: string): boolean {
    return (-1 !== url.indexOf('https://intel.ingress.com', 0));
  }

  toggleSetUrl(): void {
    this.showUrlPage = !this.showUrlPage;
  }

  validateChar(char: string, portalInfo: PortalInfo): void {
    this.dirty = true;
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
}
