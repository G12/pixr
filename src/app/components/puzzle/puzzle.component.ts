import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {ProjectService} from '../../services/project.service';
import {UsersService} from '../../services/users.service';
import {TrustmanService} from '../../services/trustman.service';
import {MatDialog} from '@angular/material/dialog';
import {Admin, AdminList, IngressNameData} from '../../project.data';
import {AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import {
  DialogPackage,
  LocalMetadata,
  LogMessages,
  MsgData,
  PortalFrame,
  PortalInfo,
  PzBootParam,
  PzProjectList,
  PortalVisiter,
  PortalVisiters
} from '../../data';
import {Clipboard} from '@angular/cdk/clipboard';
import {PuzzleMapDialogComponent} from '../../dialogs/puzzle-map/puzzle-map-dialog.component';
import {HttpClient} from '@angular/common/http';
import {GEOLOCATION_SUPPORT, GeolocationService} from '@ng-web-apis/geolocation';
import {catchError, of, take, map, Observable} from 'rxjs';
import {GoogleMap, MapInfoWindow, MapMarker} from '@angular/google-maps';
import {Const} from '../../const';
import {SnackbarService} from '../../services/snackbar.service';
import {ThemePalette} from '@angular/material/core';


@Component({
  selector: 'app-puzzle',
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.css']
})
export class PuzzleComponent implements OnInit, AfterViewInit {

  ////////////////////////// PUZZLE

  createNewProject = false;
  isNew = false;
  loggedIn = false;
  colHeight = Const.DIM_COL_HEIGHT;
  rowCount = Const.DIM_ROW_COUNT;
  imgColWidth = Const.DIM_COL_WIDTH;
  thumbWidth = Const.DIM_THUMB_WIDTH;
  hdrHeight = Const.DIM_HDR_HEIGHT;
  fudgeFactor = Const.DIM_FUDGE_FACTOR;
  portals: PortalInfo[] = [];
  portalFrames: PortalFrame[] = [];
  summary = '';
  localTemplateArray: string[];

///////////////////////////////////////////////////////////////////
  ////////////////////////// pixr area

  expandMe = true;
  pageXOffset = 0;
  width: number;
  height: number;

  // Banner Info
  bannerInfo = '  @ anonymous arrived!';
  // User information
  ingressName = '';
  ingressNamesDoc: AngularFirestoreDocument;
  allIngressNames: IngressNameData[];
  validated = false; // After user sets ingress name set true and shoe images

  //////////////////////////// user info /////////////////////////////
  googleUID: string;
  isAdmin = false;
  adminList: AdminList;
  fsUser: PzBootParam;
  fsAdmin: PzBootParam;
  folder: string; // current first saturday project name
  id: string;

  projectList: PzProjectList;

  debugMsgs = 'START: ';
  showDebug = true;
  isMobile = false;

  // canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  /** Template reference to the canvas element */
  @ViewChild('canvasEl') canvasEl: ElementRef;
  @ViewChild('myImage') myImage: ElementRef;

  src: string; // path plus image name
  // path = 'https://geopad.ca/pixr2/assets/puzzle_images/';
  path = Const.IMAGE_FOLDER;
  // realWidth = 4887;
  // realHeight = 2699;
  logBuffer = '';

  // Firestore data
  // rawDataDoc: AngularFirestoreDocument;
  localMetadata: LocalMetadata;
  logMessages: LogMessages;
  logMsgArray: MsgData[] = [];
  lastLogTime = '';

  //////////////////////////////////////////////////////////////////
  ///////////////////////// MAP
  //////////////////////////////////////////////////////////////////

  @ViewChild(GoogleMap) map: GoogleMap | undefined;
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow | undefined;

  protected readonly Const = Const;

  center: google.maps.LatLngLiteral = Const.LAT_LNG_OTTAWA;
  pegPosition: google.maps.LatLngLiteral = Const.LAT_LNG_OTTAWA;
  zoom = Const.ZOOM_NEIGHBORHOOD;

  mapOptions: google.maps.MapOptions = {
    streetViewControl: true
  };

  markerOptions: google.maps.MarkerOptions =
    {draggable: false, title: 'You are Here!', label: 'Your GPS Location'};

  currentPortalFrame: PortalFrame;

  mapIsLoading = true;
  boundsInitialized = false;
  mapWidth: number;
  mapHeight: number;
  geoMsg = '';
  incrementer = 0;
  isDynamicLocation = true;
  pegMsg = '';
  label = '';
  dirty = false;

  ////////////////////////////////// Navigation ///////////////////
  isHome = true;
  isMap = false;
  isLog = false;

  //////////////////////////////////  Log //////////////////////////
  //////////////////////////////////////////////////////////////////
  logHeight: number;
  logWidth: number;
  homeHeight: number;
  homeWidth: number;

  constructor(httpClient: HttpClient,
              public snackbarService: SnackbarService,
              public authService: AuthService,
              private projectService: ProjectService,
              private usersService: UsersService,
              private trustmanService: TrustmanService,
              private clipboard: Clipboard,
              public dialog: MatDialog,
              private readonly geolocation$: GeolocationService,
              @Inject(GEOLOCATION_SUPPORT) private readonly geolocationSupport: boolean)
  {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      // true for mobile device
      this.isMobile = true;
      console.log('Mobile Device');
    } else {
      console.log('NOT a Mobile Device!');
    }

    ////////////////////   MAP
    this.mapHeight = window.innerHeight - 112 - 33 - 8;
    this.mapWidth = window.innerWidth;
    this.logHeight = window.innerHeight - 48 - 48 - 64 - 57 - 4;
    this.logWidth = window.innerWidth - 4;
    this.homeHeight = window.innerHeight - 48 - 48 - 64 - 57 - 4;
    this.homeWidth = window.innerWidth - 4;

  }

  logout(): void {
    if (confirm('Log Out?')) {
      this.authService.logout();
    } else {
      this.bannerInfo = '  @ ' + this.SavedIngressName + ' did something and then some more and then a whole lot of nothing '
        + this.bannerInfo;
    }
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit');
    this.getBootParams();
  }

  ngOnInit(): void {
    console.log('ngOnInit');
    this.authService.afAuth.currentUser.then(value => {
      this.googleUID = value.uid;
      this.debugMsgs += value.displayName + 'Logged In, ';
    });
    // this.isFirstLocation = true; // will be set to false after first location
    if (this.isDynamicLocation){
      console.log('Subscribing to geolocation service');
      this.getLocation(Const.DYNAMIC_LOCATION);
    }
  }

  getBootParams(): void {
    // TODO add UI procedure for assigning admin status this.setAdmin('G12mo', '1KYU0BdE0rXTly5Y5KZslOvxpow2');
    this.projectService.bootParamsCollection.get().subscribe(data => {
      if (!data.empty) {
        const projLst = data.docs.find(d => d.id === 'pz_project_list');
        // TODO Project List Not used in puzzle.component
        if (projLst) {
          this.projectList = projLst.data() as PzProjectList;
        } else {
          this.projectList = {projects: []};
        }
        const admlst = data.docs.find(d => d.id === 'admin_list');
        if (admlst) {
          this.adminList = admlst.data() as AdminList;
        }
        const usr = data.docs.find(d => d.id === 'pz_user'); // fs_user
        if (usr) {
          this.fsUser = usr.data() as PzBootParam;
        }
        const adm = data.docs.find(d => d.id === 'pz_admin'); // fs_admin
        if (adm) {
          this.fsAdmin = adm.data() as PzBootParam;
        }
        const test = this.adminList.admins.find(a => a.uid === this.googleUID);
        let isAdmin = false;
        let admin: Admin;
        if (test) {
          isAdmin = true;
          admin = test as Admin;
          // Administrators can elect to run as a User
          isAdmin = admin.isAdmin;
        }
        // this.isAdmin = !!test;
        this.isAdmin = isAdmin;
        // let id;
        if (this.isAdmin) {
          this.id = this.fsAdmin.project_id;
          this.folder = this.fsAdmin.folder;
        } else {
          this.id = this.fsUser.project_id;
          this.folder = this.fsUser.folder;
        }
        // console.log('fsUser.folder: ' + this.fsUser.folder);
        this.src = this.path + this.folder + '.jpg';
        // console.log('src = ' + this.src);
        // Once we have default project id we can subscribe
        this.debugMsgs += 'src: ' + this.src + ', ';
        this.subscribeToFsProject(this.id);
      }
    });
  }

  get SavedIngressName(): string {
    let test: IngressNameData;
    if (this.allIngressNames) {
      test = this.allIngressNames.find((element => element.userUid === this.authService.user.uid));
    }
    return test ? test.name : '';
  }

  ///////////////  initialization helper methods //////////////////////
  subscribeToFsProject(id: string): void {
    // Subscribe to all the portalRec docs
    console.log('Incoming Subscription project id: ' + id);
    this.projectService.getPortalRecs(id).subscribe(data => {
      this.portals = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        } as PortalInfo;
      });
      // Find the metadata
      const test = this.portals.find(pr => pr.id === '_metadata');
      if (test) {
        const unknown: any = test;
        this.localMetadata = unknown as LocalMetadata;
        this.localTemplateArray = this.localMetadata.localTemplateArray;
        this.colHeight = this.localMetadata.colHeight;
        this.hdrHeight = this.localMetadata.hdrHeight;
        this.rowCount = this.localMetadata.rowCount;
        console.log('this.metaData.imgColWidth: ' + this.localMetadata.imgColWidth);
        this.imgColWidth = this.localMetadata.imgColWidth;
        console.log('this.imgColWidth: ' + this.imgColWidth);
        this.trustmanService.getMsgLog(id).get().subscribe(doc2 => {
          if (doc2.exists) {
            this.logMessages = doc2.data() as LogMessages;
            this.logMsgArray = this.logMessages.messages;
            this.debugMsgs += 'getMsgLog length: ' + this.logMsgArray.length + ', ';
            // console.log(this.debugMsgs);
            // last log message should be on top
            const logMsg = this.logMsgArray[0].msg;
            // let time = '';
            // if (this.lastLogTime !== '') {
            const time = this.logMsgArray[0].time;
            const tStamp = this.logMsgArray[0].tStamp;
            const now = Date.now();
            const delta = now - tStamp;
            console.log('Delta Time in milliseconds: ' + delta);
            // console.log('Time: ' + time );
            if (delta < 120000){ // No snack bars older than 2 minutes
              // TODO test this interval
              if (this.lastLogTime === time){ // been here before
                // do nothing
                console.log('Duplicate Message IGNORED!'); // FIX duplication BUG
              }else{
                console.log('MESSAGE to Snackbar: ' + logMsg);
                this.snackbarService.openSnackBarBottom(logMsg, 'Close', 12000);
                this.lastLogTime = time;
              }
            } else {
              console.log('Message older than ' + delta + ' milliseconds IGNORED');
            }
          }
        });
        this.ingressNamesDoc = this.usersService.getUserDocs().subscribe(dat => {
          this.allIngressNames = dat.map(e => {
            return {
              id: e.payload.doc.id,
              ...e.payload.doc.data()
            } as string[];
          });
          this.debugMsgs += 'ingressNames length: ' + this.allIngressNames.length + ', ';
          this.updatePortalFrames(true, this.rowCount); // TODO TESTING TESTING
        });
      }
    });
  }

  updatePortalFrames(isNew: boolean, count: number): void {
    if (isNew) {
      this.rowCount = count;
      this.portalFrames = [];
      for (let i = 1; i < this.rowCount + 1; i++) {
        const type = this.localTemplateArray[i - 1];
        const portalFrame: PortalFrame = {
          // colHeight is optional - will be neccessary if colHeights are not uniform
          index: i, height: this.colHeight,
          info: {
            index: i,
            id: 'P:' + i,
            published: false,
            label: '',
            type
          }
        };
        this.portalFrames.push(portalFrame);
      }
    }
    // The Portal Frames are sorted by index
    // Add the Portal Info by corresponding index
    this.portalFrames.forEach(portlFrame => {
      const test = this.portals.find(portl => portl.index === portlFrame.index);
      if (test) {
        portlFrame.info = test;
      }
    });

    // TODO test if this is safe
    this.makeSummary();

  }

  logger(msg: string): void {
    const date = JSON.stringify(new Date());
    this.logBuffer += ' ' + date + ': ' + msg;
  }

  clearAllMessages(): void {
    if (confirm('CLEAR_ALL_MESSAGES')) {
      // TODO under construction
      this.projectService.clearLog(this.localMetadata.id);
    }
  }

  showStats(): void {
    alert('Under Construction');
    // this.openStatsDialog(this.makeStats());
  }

  setIngressName(): void {
    const testMsg = ''; // ' testing testing: Image dimensions: ' + this.width + ' x ' + this.height;

    const name = prompt('Please enter a Name' + testMsg, this.SavedIngressName);
    if (name && name !== '') {
      this.validated = true;
      this.ingressName = name;
      this.usersService.updateIngressName(name);
      this.expandMe = false;
      // this.initCanvas();
      this.bannerInfo = '  @ ' + name + ' started working!' + this.bannerInfo;
      if (this.localMetadata) {
        this.trustmanService.setLogMsg(this.ingressName, this.localMetadata.id,
          this.ingressName + ' Logged In', null);
      }
      this.showDebug = false;
    }
  }

  /////////////////////////////////////
  ////////////////////////// Set dimension values

  setPortalCount(): void {
    const strCount = prompt('Enter the number of portals', '' + this.rowCount);
    if (strCount != null) {
      const count = parseInt(strCount, 10);
      this.rowCount = count;
      // Update metadata
      // getPortalRecs subscription will thence be called
      this.localMetadata.rowCount = this.rowCount;
      this.trustmanService.updateMetaData(this.localMetadata);
    }
  }

  setHdrHeight(): void {
    const height = prompt('Enter proposed HEADER height',
      '' + this.hdrHeight);
    if (height != null) {
      this.hdrHeight = parseInt(height, 10);
      // Update metadata
      // getPortalRecs subscription will thence be called
      this.localMetadata.hdrHeight = this.hdrHeight;
      this.trustmanService.updateMetaData(this.localMetadata);
    }
  }

  setRowHeight(): void {
    const height = prompt('Enter proposed row height',
      '' + this.colHeight);
    if (height != null) {
      this.colHeight = parseInt(height, 10);
      // Update metadata
      // getPortalRecs subscription will thence be called
      this.localMetadata.colHeight = this.colHeight;
      this.trustmanService.updateMetaData(this.localMetadata);
    }
  }

  setColumnWidth(): void {
    const width = prompt('Enter proposed column width',
      '' + this.imgColWidth);
    if (width != null){
      this.imgColWidth = parseInt(width, 10);
      // Update metadata
      // getPortalRecs subscription will thence be called
      this.localMetadata.imgColWidth = this.imgColWidth;
      this.trustmanService.updateMetaData(this.localMetadata);
    }
  }

  setMaxThumbWidth(): void {
    const width = prompt('Enter proposed Portal Image width',
      '' + this.thumbWidth);
    if (width != null){
      this.thumbWidth = parseInt(width, 10);
      // Update metadata
      // getPortalRecs subscription will thence be called
      this.localMetadata.thumbWidth = this.thumbWidth;
      this.trustmanService.updateMetaData(this.localMetadata);
    }
  }

  setFudgeFactor(): void {
    const width = prompt('Enter Y position Fudge Factor',
      '' + this.fudgeFactor);
    if (width != null){
      this.fudgeFactor = parseInt(width, 10);
      // Update metadata
      // getPortalRecs subscription will thence be called
      this.localMetadata.fudgeFactor = this.fudgeFactor;
      this.trustmanService.updateMetaData(this.localMetadata);
    }
  }

  // + (portFrm.index * 1) + (156 / 2);
  getYPosition(portFrm: PortalFrame): string {
    const n = (portFrm.index - 1) * (this.colHeight / 2)
      + (portFrm.index * 1) + ((this.localMetadata.hdrHeight + this.fudgeFactor) / 2);
    return '-50px -' + n + 'px';
  }


  makeSummary(): void {

    // TODO Execute a for loop from 1 to 11
    // Find portalFrame index that matches
    // Set Summary value in the proper order
    this.summary = '';
    let str = '';
    for (let i = 1; i < this.rowCount + 1; i++) {
      let char = '*';
      const prtl = this.portals.find(pr => pr.index === i);
      if (prtl){
        if (prtl.label !== '') {
          char = prtl.label; // as string;
        }
      }else{
        char = this.localTemplateArray[i - 1];
      }
      str += char;
    }
    this.summary = str;
  }

  newFSProject(): void {
    if (confirm('Upload a New Puzzle Image')) {
      this.createNewProject = true;
    }
  }

  compareMetadata(): void {

    alert('Local Metadata! ' + JSON.stringify(this.localMetadata));

  }

  twoFactorAccess(): void {
    if (this.loggedIn){
      if (prompt('Log Out?')){
        this.loggedIn = false;
        return;
      }
    }
    this.loggedIn = true;
  }

  showDebugInfo(): void {
    const str =
      '\nrowCount: ' + this.rowCount +
      '\ncolHeight: ' + this.colHeight +
      '\nimgColWidth: ' + this.imgColWidth +
      '\nportals: ' + JSON.stringify(this.portals);
    alert(str);
    this.compareMetadata();
  }

  copyToClipBoard(): void {
    if (confirm('Copy to Clipboard')){
      this.clipboard.copy(this.summary);
    }
  }

  /////////////////////////////////////////////////////////////////////
  ///////////////////////////// Map Dialog ////////////////////////////
  /////////////////////////////////////////////////////////////////////

  popUpDialog(portalFrame: PortalFrame): void {
    let prefix = 'Enter';
    let defaultLabel = '';
    if (portalFrame.info) {
      defaultLabel = portalFrame.info.label;
      if (portalFrame.info.label !== ''){
        prefix = 'Edit';
      }
    }
    portalFrame.info.projectId = this.localMetadata.projectID;
    const dialogPackage: DialogPackage = {
      ingressName: this.ingressName,
      localMetadata: this.localMetadata,
      portalFrame,
      pegPosition: this.pegPosition
    };
    this.openPuzzleMapDialog(dialogPackage, this.ingressName);
  }

  openPuzzleMapDialog(dialogPackage: DialogPackage, owner: string): void {
    const dialogRef = this.dialog.open(PuzzleMapDialogComponent, {
      width: '600px',
      data: dialogPackage
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
      } else {
        console.log('NADA');
      }
    });
  }

  sendMessage(): void {
    let str = '@' + this.ingressName + ' sent a Message: ';
    const msg = prompt('Send Message?');
    if (msg != null) {
      str += msg;
      this.trustmanService.setLogMsg(this.ingressName,
        this.localMetadata.projectID, str, null);
      // this.snackbarService.openSnackBarTop
      // (str, 'Close', 5000);
    }
  }

  testStuff(): void {
    const str = 'CLEAR_ALL_MESSAGES';
    this.trustmanService.setLogMsg(this.ingressName,
      this.localMetadata.projectID, str, this.currentPortalFrame.info);
    this.snackbarService.openSnackBarTop
      (str, 'Close', 5000);
  }

  hasUrl(info: PortalInfo): string {
    if (info.url && info.url.length > 0) {
      return '*';
    }
    return '';
  }

  ///////////////////////// Google Map ///////////////////////////////
  ////////////////////////////////////////////////////////////////////
  getLocation(type: number): void {
    if (this.geolocationSupport) {
      this.geoMsg = 'Geolocation Supported';
      switch (type) {
        case Const.STATIC_LOCATION:
          this.staticGeolocation();
          break;
        case Const.DYNAMIC_LOCATION:
          this.dynamicGeolocation();
          break;
      }
    } else {
      this.geoMsg = 'Geolocation NOT supported';
      this.zoom = Const.ZOOM_NEIGHBORHOOD;
    }
  }

  staticGeolocation(): void {
    this.geolocation$.pipe(take(1)).subscribe(position => {
      this.center = {lat: position.coords.latitude, lng: position.coords.longitude};
      this.geoMsg = 'staticGeolocation: ' + JSON.stringify(this.center);
    });
  }

  dynamicGeolocation(): void {
    this.geolocation$.subscribe(position => {
      this.pegPosition = {lat: position.coords.latitude,  lng: position.coords.longitude};
      // Center set in mapInitialized call back
      //  this.center = {lat: this.pegPosition.lat, lng: this.pegPosition.lng};
      this.incrementer++;
      this.pegMsg = 'peg: ' + this.incrementer + ' ' + JSON.stringify(this.pegPosition);
    });
  }

  openInfoWindow(marker: MapMarker, portalFrame: PortalFrame): void {
    if (portalFrame){
      this.currentPortalFrame = portalFrame;
      this.label = portalFrame.info.label;
      this.dirty = false;
    }else{
      // This is the pegMarker
      this.currentPortalFrame = null;
    }
    this.infoWindow?.open(marker);
  }

  infoClosed($event: void): void {
    console.log($event);
  }

  closeWindow($event: MouseEvent): void {
    console.log($event);
    this.infoWindow.close();
  }

  getLabel(portalInfo: PortalInfo): string {
    return  portalInfo.index + ':' + portalInfo.label;
  }

  openGoogleMaps(currentPortalFrame: PortalFrame): void {

    const dest = currentPortalFrame.info.latLng;
    const orig = this.center;
    const label = 'Portal number: ' + currentPortalFrame.index;
    const url = 'https://www.google.com/maps/dir/?api=1&origin='
    + orig.lat + ',' + orig.lng + '&destination='
    + dest.lat + ',' + dest.lng + '&travelmode=walking';
    window.open(url, 'google-maps');

    this.infoWindow.close();
  }

  fitBounds(): void {
    this.boundsInitialized = true;
    console.log('CALLED fitBounds this.portals.length: ' + this.portals.length);
    if (this.portals.length === 0){ return; }
    let count = 0;
    let singlton;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({lat: this.pegPosition.lat, lng: this.pegPosition.lng});
    this.portals.forEach(prtl => {
      if (prtl.index) {
        console.log('PORTAL: ' + prtl.index);
      }
      if (prtl.latLng) {
        if (count === 0) {
          singlton = prtl.latLng;
        }
        count++;
        bounds.extend({lat: prtl.latLng.lat, lng: prtl.latLng.lng});
      }
    });
    if (count === 1) {
      console.log('this.map: ' + JSON.stringify(this.map));
      // only ingress agent do nothing
      console.log('count == 1 this.map: ' + JSON.stringify(this.map));
    } else if (!bounds.isEmpty()) {
      if (this.map){
        this.map.fitBounds(bounds);
      } else {
        this.snackbarService.openSnackBarTop
        ('MAP undefined!', 'Close', Const.SNACK_WAIT_LONG);
      }
    }
  }


  setLabel(): string {
    // TODO investigate changing value base on a criteria
    return this.boundsInitialized ? 'Reset Bounds' : 'Reset Bounds';
  }
  ////////////////////////////// END ///////////////////////////////
  openLog(): void {
    this.isHome = false;
    this.isLog = true;
  }

  closeLog(): void {
    this.isLog = false;
    this.isHome = true;
  }

  openMap(): void {
    this.isHome = false;
    this.isLog = false;
    this.isMap = true;
    if (!this.boundsInitialized) {
      // pop up snackbar instructions
      this.snackbarService.openSnackBarTop
      ('Click "Reset Bounds" to see all portals that have been mapped',
        'Close', this.Const.SNACK_WAIT_SHORT);
    }else{
      // this.fitBounds();
    }
  }

  closeMap(): void {
    this.isMap = false;
    this.isHome = true;
  }

  getWarn(): ThemePalette {
    return 'warn';
  }

  getAccent(msgData: MsgData): ThemePalette {
    if (msgData.latLng){
      return 'warn';
    }
    return 'accent';
  }

  getPrimary(): ThemePalette {
    return 'primary';
  }

  action(msgData: MsgData): void {
    if (msgData.latLng){
      const dest = msgData.latLng;
      const orig = this.pegPosition;
      const label = 'Portal Id: ' + msgData.prtlId;
      const url = 'https://www.google.com/maps/dir/?api=1&origin='
        + orig.lat + ',' + orig.lng + '&destination='
        + dest.lat + ',' + dest.lng + '&travelmode=walking';
      window.open(url, 'google-maps');
    }
  }

  validateChar($event: any, info: PortalInfo): void {
    // TODO validate against Ingress Passcode Pattern string
    console.log($event);
  }

  saveChar(info: PortalInfo, label: string, ingressName: string): void {
    this.trustmanService.saveChar(info, label, ingressName);
    this.infoWindow.close();
  }

  onCancelClick(): void {
    this.infoWindow.close();
  }

  mapInitialized(): void {
    this.center = this.pegPosition;
    this.mapIsLoading = true;
    setTimeout(() => {
      this.fitBounds();
      this.mapIsLoading = false;
    }, this.Const.SNACK_WAIT_VERY_SHORT);
  }

}
