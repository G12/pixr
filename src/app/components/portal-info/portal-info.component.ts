import {AfterViewInit, Component, EventEmitter, Input, Output} from '@angular/core';
import {TrustmanService} from '../../services/trustman.service';
import {LocalMetadata, PortalFrame, PortalInfo} from '../../data';
import {Const} from '../../const';
import {GoogleMap} from '@angular/google-maps';

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
  @Input() imgWidth: number;
  @Input() infoScale: number;
  @Output('parentFun') parentFun: EventEmitter<any> = new EventEmitter();
  // colHeight = Const.DIM_COL_HEIGHT;
  // fudgeFactor = Const.DIM_FUDGE_FACTOR;
  label = '';
  hintMsg = '';
  dirty = false;
  isValidChar = false;
  protected readonly Const = Const;
  inputType = 'text';

  constructor(private trustmanService: TrustmanService) {

  }
  ngAfterViewInit(): void {
    if (Const.DEBUG_PORTAL_INFO){
      console.log('ngAfterViewInit');
      // called only once when map initializes
    }
  }
  forceSaveGlyph(portalFrame: PortalFrame, label: string, ingressName: string): void {
    if (confirm(label + ' is NOT a known Glyph!\nAre you sure you want to force save?')) {
      this.saveChar(portalFrame, label, ingressName);
    }
  }
  saveChar(frame: PortalFrame, label: string, ingressName: string): void {
    frame.canEdit = false;
    if (this.trustmanService.confirmLabel(frame.info, label)){
      // Test distance to portal
      let dst = Const.CONFIDENCE_RED;
      if (frame.info.latLng){
        dst = this.trustmanService.distanceBetween(
          this.pegPosition, frame.info.latLng
        );
      }
      frame.info.distance = dst;
      this.trustmanService.saveChar(frame, label, ingressName);
      this.parentFun.emit(frame.info);
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
      // const label = 'Portal number: ' + currentPortalFrame.index;
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

  delete(portalFrame: PortalFrame, label: string, ingressName: string): void {
    if (confirm('Remove the Value: ' + label )){
      // Wait a bit so snack bar will appear; probably not neccessary on user screen
      // setTimeout(() => {
        console.log('DEBUG delete 1');
        this.trustmanService.saveChar(portalFrame, '', ingressName);
        this.parentFun.emit(portalFrame.info);
      // }, Const.SNACK_WAIT_VERY_SHORT);
    }
  }
  getHint(type: string): string {
    return this.trustmanService.getHint(type);
  }
  testDeleteConditions(label: string, info: PortalInfo): boolean {
    return this.trustmanService.testDeleteConditions(label, info);
  }
  // TODO for future use
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

  toggleEdit(portalFrame: PortalFrame): void {
    if (!portalFrame.canEdit){
      if (confirm('The Distance to Portal:' + portalFrame.index + ' is ' +
        Math.round(portalFrame.dstToPrtl) + ' meters.' +
        '\nMove to within HACKING range for best results!' +
        '\nOR select OK to edit anyways.')){
        portalFrame.canEdit = !portalFrame.canEdit;
      }
    }else{
      portalFrame.canEdit = !portalFrame.canEdit;
    }
  }
}
