import {AfterViewInit, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {TrustmanService} from '../../services/trustman.service';
import {LatLng, LocalMetadata, PortalFrame, PortalInfo} from '../../data';
import {Const} from '../../const';
import {GoogleMap, MapInfoWindow} from '@angular/google-maps';

@Component({
  selector: 'app-portal-info',
  templateUrl: './portal-info.component.html',
  styleUrls: ['./portal-info.component.css']
})
export class PortalInfoComponent implements AfterViewInit{
  @Input() portalFrame: PortalFrame;
  @Input() src: string;
  @Input() localMetadata: LocalMetadata;
  @Input() ingressName: string;
  @Input() pegPosition: google.maps.LatLngLiteral;
  @Input() map: GoogleMap;
  @Output('parentFun') parentFun: EventEmitter<any> = new EventEmitter();
  // colHeight = Const.DIM_COL_HEIGHT;
  // fudgeFactor = Const.DIM_FUDGE_FACTOR;
  label = '';
  hintMsg = '';
  dirty = false;
  isValidChar = false;
  constructor(private trustmanService: TrustmanService) {

  }
  ngAfterViewInit(): void {
    if (Const.DEBUG_PORTAL_INFO){
      console.log('ngAfterViewInit');
      // called only once when map initializes
    }
  }
  saveChar(info: PortalInfo, label: string, ingressName: string): void {
    if (this.trustmanService.confirmLabel(info, label)){
      this.trustmanService.saveChar(info, label, ingressName);
      this.parentFun.emit(info);
    }
  }
  validate(char: string, portalInfo: PortalInfo): void {
    const retVal = this.trustmanService.validateChar(char, portalInfo);
    this.hintMsg = retVal.hintMsg;
    this.dirty = retVal.dirty;
    this.isValidChar = retVal.isValidChar;
  }
  openGoogleMaps(currentPortalFrame: PortalFrame): void {
    if (confirm('The Google Maps App will open with walking' +
      ' directions for you to the portal. Shall we Proceed?')){
      const dest = currentPortalFrame.info.latLng;
      const orig = this.pegPosition;
      const label = 'Portal number: ' + currentPortalFrame.index;
      const url = 'https://www.google.com/maps/dir/?api=1&origin='
        + orig.lat + ',' + orig.lng + '&destination='
        + dest.lat + ',' + dest.lng + '&travelmode=walking';
      window.open(url);
      this.parentFun.emit(null);
    }
  }
  onCancelClick(): void {
    this.parentFun.emit(null);
  }
  setInfo(label: string): void {
    this.label = label;
    this.hintMsg = '';
    this.dirty = false;
    this.isValidChar = false;
  }
  delete(info: PortalInfo, label: string, ingressName: string): void {
    if (confirm('Remove the Value: ' + label )){
      // Wait a bit so snack bar will appear; probably not neccessary on user screen
      setTimeout(() => {
        this.trustmanService.saveChar(info, '', ingressName);
      }, Const.SNACK_WAIT_VERY_SHORT);
    }
  }
  getHint(type: string): string {
    return this.trustmanService.getHint(type);
  }
  testDeleteConditions(label: string, info: PortalInfo): boolean {
    return this.trustmanService.testDeleteConditions(label, info);
  }
  openStreetView(portalInfo: PortalInfo): void {
    const streetView = this.map?.googleMap?.getStreetView();
    // @ts-ignore
    streetView.setOptions({
      position: portalInfo.latLng,
      zoom: 0,
      pov: {
        heading: 0,
        pitch: 0,
      },
    });
    const listener = streetView.addListener('closeclick', ($e) => {
      console.log('Street View Closed');
      console.log($e);
      streetView.setVisible(false);
      streetView.unbindAll();
    });
    // IMPORTANT close Info Window first
    // this.mapInfoWindow.close();
    // @ts-ignore
    streetView.setVisible(true);
  }

  protected readonly Const = Const;
}
