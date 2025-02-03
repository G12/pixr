import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {ProjectService} from '../../services/project.service';
import {UsersService} from '../../services/users.service';
import {TrustmanService} from '../../services/trustman.service';
import {MatDialog} from '@angular/material/dialog';
import {Admin, AdminList, IngressNameData} from '../../project.data';
import {AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import {
  DialogPackage,
  LatLng,
  LocalMetadata,
  LogMessages,
  MsgData,
  PortalFrame,
  PortalInfo,
  PzBootParam,
  PzProjectList,
  Size
} from '../../data';
import {Clipboard} from '@angular/cdk/clipboard';
import {PuzzleMapDialogComponent} from '../../dialogs/puzzle-map/puzzle-map-dialog.component';
import {HttpClient} from '@angular/common/http';
import {GEOLOCATION_SUPPORT, GeolocationService} from '@ng-web-apis/geolocation';
import {async, take} from 'rxjs';
import {
  GoogleMap,
  MapDirectionsRenderer,
  MapDirectionsService,
  MapInfoWindow,
  MapMarker
} from '@angular/google-maps';
import {Const} from '../../const';
import {SnackbarService} from '../../services/snackbar.service';
import {ThemePalette} from '@angular/material/core';
import {PortalInfoComponent} from '../portal-info/portal-info.component';
import {MatDrawer} from '@angular/material/sidenav';
// import * as googlemaps from 'googlemaps';

@Component({
  selector: 'app-puzzle',
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.css'],
})
export class PuzzleComponent implements OnInit, AfterViewInit {
  ////////////////////////// PUZZLE
  createNewProject = false;
  loggedIn = false;
  rowHeight = Const.DIM_ROW_HEIGHT;
  rowCount = Const.DIM_ROW_COUNT;
  hdrHeight = Const.HDR_HEIGHT;
  lefMargin = Const.LEFT_MARGIN;
  thumbWidth = Const.THUMB_WIDTH;
  thumbHeight = Const.THUMB_HEIGHT;
  imgWidth = Const.THUMB_SIZE;
  fudgeFactor = Const.FUDGE_FACTOR;
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
  @ViewChild(PortalInfoComponent) PortalInfoComponent;
  @ViewChild('imagePage') imagePage: ElementRef;
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
  lookout = 'https://maps.app.goo.gl/YeHEyFd3H4kP8Bj66';
  lookOutOn = true;
  @ViewChild(GoogleMap) map: GoogleMap | undefined;
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow | undefined;
  // @ViewChild(MapCircle) portalCircle: MapCircle | undefined;
  @ViewChild(MatDrawer) drawer;
  protected readonly Const = Const;
  center: google.maps.LatLngLiteral = Const.LAT_LNG_OTTAWA;
  pegPosition: google.maps.LatLngLiteral = Const.LAT_LNG_OTTAWA;
  zoom = Const.ZOOM_NEIGHBORHOOD;
  mapOptions: google.maps.MapOptions = {
    streetViewControl: true
  };
  pegMarker: MapMarker;
  lastZoomLevel = 0;
  pegMarkerOptions: google.maps.MarkerOptions =
    {draggable: false, title: 'You are Here!', label: 'Your GPS Location'};
  currentPortalFrame: PortalFrame;
  mapIsLoading = true;
  boundsInitialized = false;
  mapWidth: string;
  mapHeight: string;
  geoMsg = '';
  incrementer = 0;
  isDynamicLocation = true;
  pegMsg = '';
  label = '';
  dirty = false;
  openedFromPortal = false;
  openedFromLogIn = true;
  portalCenter: LatLng;
  ////////////////////////////////// Navigation ///////////////////
  isHome = true;
  isMap = true;
  isLog = false;
  //////////////////////////////////  Log //////////////////////////
  //////////////////////////////////////////////////////////////////
  logHeight: number;
  logWidth: number;
  homeHeight: number;
  homeWidth: number;

  /////////////////////////////  Dynamic Compass marker
  heading: number;
  pegImage = {
    path: 'M14 8.947L22 14v2l-8-2.526v5.36l3 1.666V22l-4.5-1L8 22v-1.5l3-1.667v-5.36L3 16v-2l8-5.053V3.5a1.5 1.5 0 0 1 3 0v5.447z',
    fillColor: '#0096ff',
    fillOpacity: 1,
    strokeColor: '000',
    strokeOpacity: 1,
    scale: 2,
    rotation: 0,
    anchor: new google.maps.Point(13, 13)
  };
  headingByDevice: number;
  speed: number;
  lastAlpha = 0; // Need to initialize with value
  ///////////////////////  Direction Service ////////////////////
  // directionsResults$: Observable<google.maps.DirectionsResult|undefined>;
  googleMapsDirectionResult: google.maps.DirectionsResult = null;
  directions: google.maps.DirectionsResult[] = [];
  protected readonly async = async;
  result: google.maps.DirectionsResult;
  destination: LatLng;
  directionsRenderer: MapDirectionsRenderer;
  renderOps: google.maps.DirectionsRendererOptions;

  ////////////////////// Image Scale ////////////////////
  imagePageWidth: number;
  buttonOffset: number;
  imgScale = Const.IMG_SCALE;
  infoScale = Const.INFO_SCALE;
  protected w: number;

  ///////////////////////// edit privelages /////////////////

  // TODO WHAT'S this!
  protected readonly Math = Math; // mistake by Webstorm!

  constructor(httpClient: HttpClient,
              private mapDirectionsService: MapDirectionsService,
              private changeDetectionRef: ChangeDetectorRef,
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
    } else {
    }
    ////////////////////   MAP
    this.mapHeight = (window.innerHeight - 96) + 'px';
    this.mapWidth = (window.innerWidth - 4) + 'px';
    this.logHeight = window.innerHeight - 96 - 16; // toolbar mat-list padding
    this.logWidth = window.innerWidth - 6;
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
    this.getBootParams();
  }
  ngOnInit(): void {
    this.authService.afAuth.currentUser.then(value => {
      this.googleUID = value.uid;
      this.debugMsgs += value.displayName + 'Logged In, ';
    });
    if (this.isDynamicLocation){
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
        this.trustmanService.isAdmin = isAdmin;
        // let id;
        if (this.isAdmin) {
          this.id = this.fsAdmin.project_id;
          this.folder = this.fsAdmin.folder;
        } else {
          this.id = this.fsUser.project_id;
          this.folder = this.fsUser.folder;
        }
        this.src = this.path + this.folder + '.jpg';
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
    if (Const.DEBUG_PUZZLE){
      console.log('Incoming Subscription project id: ' + id);
    }
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
        this.rowHeight = this.localMetadata.rowHeight;
        this.hdrHeight = this.localMetadata.hdrHeight;
        this.rowCount = this.localMetadata.rowCount;
        this.lefMargin = this.localMetadata.lefMargin;
        this.thumbWidth = this.localMetadata.thumbWidth;
        this.thumbHeight = this.localMetadata.thumbHeight;
        this.imgWidth = this.localMetadata.thumbSize;
        this.fudgeFactor = this.localMetadata.fudgeFactor;

        this.trustmanService.getMsgLog(id).get().subscribe(doc2 => {
          if (doc2.exists) {
            this.logMessages = doc2.data() as LogMessages;
            this.logMsgArray = this.logMessages.messages;
            this.debugMsgs += 'getMsgLog length: ' + this.logMsgArray.length + ', ';
            // last log message should be on top
            const logMsg = this.logMsgArray[0].msg;
            // let time = '';
            // if (this.lastLogTime !== '') {
            const time = this.logMsgArray[0].time;
            const tStamp = this.logMsgArray[0].tStamp;
            const now = Date.now();
            const delta = now - tStamp;
            if (delta < 120000){ // No snack bars older than 2 minutes
              // TODO test this interval
              if (this.lastLogTime === time){ // been here before
              }else{
                this.snackbarService.openSnackBarBottom(logMsg, 'Close', 12000);
                this.lastLogTime = time;
              }
            } else {
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
    let zoom = 15;
    if (this.getZoom()){
      zoom = this.getZoom();
    }
    if (isNew) {
      this.rowCount = count;
      this.portalFrames = [];
      for (let i = 1; i < this.rowCount + 1; i++) {
        const type = this.localTemplateArray[i - 1];
        const portalFrame: PortalFrame = {
          // colHeight is optional - will be neccessary if colHeights are not uniform
          index: i, height: this.rowHeight,
          canEdit: false, isTarget: false, dstToPrtl: null, pegLatLng: null,
          info: {
            index: i,
            id: 'P:' + i,
            published: false,
            label: '',
            type,
            history: [],
            // isActive: false,
            distance: null,
          },
          opts: {}
        };
        // some default values for size and color of pin
        // portalFrame.opts = this.setPinOptionsForFrame(portalFrame.info, zoom);
        // TODO TEST TEST
        portalFrame.iconLabel = this.setPinLabelForFrame(portalFrame.info, zoom);
        this.portalFrames.push(portalFrame);
      }
    }
    // The Portal Frames are sorted by index
    // Add the Portal Info by corresponding index
    this.portalFrames.forEach(portlFrame => {
      const test = this.portals.find(portl => portl.index === portlFrame.index);
      if (test) {
        portlFrame.info = test;
        if (test.latLng){
          portlFrame.opts = this.setPinOptionsForFrame(test, zoom);
        }
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
        // TODO work out steps at the server to avoid this
        const portalFrame: PortalFrame = {
          index: null,
          info: {id: this.localMetadata.projectID, label: 'login',
            published: false, distance: Const.CONFIDENCE_GREEN,
            index: null, type: null, history: null
          },
          canEdit: null,
          isTarget: null,
          dstToPrtl: null,
          pegLatLng: null
        };
        if (!this.isAdmin){
          this.trustmanService.setLogMsg(
            this.ingressName, this.localMetadata.projectID, this.ingressName +
            ' Logged In', portalFrame);
        }
      }
      this.showDebug = false;
    }
  }
  /////////////////////////////////////
  ////////////////////////// Set dimension values
  setPortalCount(): void {
    const strCount = prompt('Enter the number of portals', '' + this.rowCount);
    if (strCount != null) {
      this.rowCount = parseInt(strCount, 10);
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
  setLeftMargin(): void {
    const width = prompt('Left margin Width',
      '' + this.lefMargin);
    if (width != null){
      this.lefMargin = parseInt(width, 10);
      // Update metadata
      // getPortalRecs subscription will thence be called
      this.localMetadata.lefMargin = this.lefMargin;
      this.trustmanService.updateMetaData(this.localMetadata);
    }
  }
  setRowHeight(): void {
    const height = prompt('Enter Row Height',
      '' + this.rowHeight);
    if (height != null) {
      this.rowHeight = parseInt(height, 10);
      // Update metadata
      // getPortalRecs subscription will thence be called
      this.localMetadata.rowHeight = this.rowHeight;
      this.trustmanService.updateMetaData(this.localMetadata);
    }
  }
  setThumbHeight(): void {
    const height = prompt('Enter Thumb Height',
      '' + this.thumbHeight);
    if (height != null) {
      this.thumbHeight = parseInt(height, 10);
      // Update metadata
      // getPortalRecs subscription will thence be called
      this.localMetadata.thumbHeight = this.thumbHeight;
      this.trustmanService.updateMetaData(this.localMetadata);
    }
  }
  setThumbSize(): void {
    const width = prompt('Enter Thumbnail Size (%)',
      '' + this.imgWidth);
    if (width != null){
      this.imgWidth = parseInt(width, 10);
      // Update metadata
      // getPortalRecs subscription will thence be called
      this.localMetadata.thumbSize = this.imgWidth;
      this.trustmanService.updateMetaData(this.localMetadata);
    }
  }
  setThumbWidth(): void {
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
      this.fudgeFactor = parseFloat(width);
      // Update metadata
      // getPortalRecs subscription will thence be called
      this.localMetadata.fudgeFactor = this.fudgeFactor;
      this.trustmanService.updateMetaData(this.localMetadata);
    }
  }
  makeSummary(): void {
    // TODO Execute a for loop from 1 to 11
    // Find portalFrame index that matches
    // Set Summary value in the proper order
    this.summary = '';
    let str = '';
    for (let i = 1; i < this.rowCount + 1; i++) {
      let char = '?'; // Should never be this!
      const prtl = this.portals.find(pr => pr.index === i);
      if (prtl){
        if (prtl.label !== '') {
          char = prtl.label; // as string;
        }else{
          char = this.localTemplateArray[i - 1];
        }
      }else{
        char = this.localTemplateArray[i - 1];
      }
      str += char;
    }
    this.summary = str;
  }
  newFSProject(): void {
    if (confirm('Create a new Project?')) {
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
  copyToClipBoard(): void {
    if (confirm('Copy to Clipboard')){
      this.clipboard.copy(this.summary);
    }
  }
  /////////////////////////////////////////////////////////////////////
  ///////////////////////////// Map Dialog ////////////////////////////
  /////////////////////////////////////////////////////////////////////
  popUpDialog(portalFrame: PortalFrame): void {
    portalFrame.info.projectId = this.localMetadata.projectID;
    // The dstToPrtl value is used to determine confidence level
    // when a character value is set
    // This value may change if user sets a value for latLng
    // while dialog is still open
    if (portalFrame.info.latLng){
      portalFrame.dstToPrtl = this.trustmanService.distanceBetween(
        this.pegPosition, portalFrame.info.latLng
      );
      portalFrame.pegLatLng = this.pegPosition;
      portalFrame.canEdit = portalFrame.dstToPrtl <= Const.CONFIDENCE_GREEN;
    }else{
      portalFrame.dstToPrtl = Const.CONFIDENCE_RED;
      portalFrame.canEdit = false;
    }
    const dialogPackage: DialogPackage = {
      ingressName: this.ingressName,
      localMetadata: this.localMetadata,
      portalFrame,
      pegPosition: this.pegPosition
    };
    this.openPuzzleMapDialog(dialogPackage, this.ingressName);
  }
  // Determie the position of Side Bar Button
  // getLeftSideBarPosition(): number {
    // let n = Const.THUMB_WIDTH - Const.SIDE_BAR_RIGHT_PADDING;
    // if (this.homeWidth < Const.THUMB_WIDTH){
    //  n = this.homeWidth - Const.BUTTON_WIDTH - Const.SIDE_BAR_RIGHT_PADDING;
    // }
    // return n;
  // }
  drawerOpened(): void {
    this.isMap = false; // Display map related tools
    if (this.imagePage.nativeElement){
      this.imagePageWidth = this.imagePage.nativeElement.clientWidth;
      this.buttonOffset = this.imagePageWidth - Const.BUTTON_WIDTH;
    }
  }
  drawerClosed(): void {
    this.isMap = true; // Hide map related tools
    if (this.openedFromPortal){
      this.openedFromPortal = false;
    }
  }
  openPuzzleMapDialog(dialogPackage: DialogPackage, owner: string): void {
    const dialogRef = this.dialog.open(PuzzleMapDialogComponent, {
      width: '600px',
      data: dialogPackage,
    });
    dialogRef.afterClosed().subscribe( result => {
      if (result) {
        if (Const.DEBUG_PUZZLE){
          console.log('dialogRef.afterClosed() return value');
          console.log(result);
        }
        const info: PortalInfo = result;
        this.isLog = false;
        this.portalCenter = info.latLng;
        this.openedFromPortal = true;
        this.drawer.toggle(); // The event drawerClosed() is fired
      } else {
        if (Const.DEBUG_PUZZLE){
          console.log('dialogRef.afterClosed() NO return value');
        }
      }
    });
  }
  sendMessage(): void {
    // TODO work out steps at the server to avoid this
    const portalFrame: PortalFrame = {
      index: null,
      info: {id: this.localMetadata.projectID, label: 'login',
        published: false, distance: Const.CONFIDENCE_GREEN,
        index: null, type: null, history: null
      },
      canEdit: null,
      isTarget: null,
      dstToPrtl: null,
      pegLatLng: null
    };
    let str = '@' + this.ingressName + ' sent a Message: ';
    const msg = prompt('Send Message?');
    if (msg != null) {
      str += msg;
      this.trustmanService.setLogMsg(this.ingressName, this.localMetadata.projectID, str, portalFrame);
    }
  }
  testStuff(): void {
    const str = 'CLEAR_ALL_MESSAGES';
    this.trustmanService.setLogMsg(this.ingressName, this.localMetadata.projectID, str, this.currentPortalFrame);
    this.snackbarService.openSnackBarTop
      (str, 'Close', 5000);
  }
  hasUrl(info: PortalInfo): boolean {
    return info.url && info.url.length > 0;
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
  compassHeading(alpha, beta, gamma): number {
    // Convert degrees to radians
    const alphaRad = alpha * (Math.PI / 180);
    const betaRad = beta * (Math.PI / 180);
    const gammaRad = gamma * (Math.PI / 180);
    // Calculate equation components
    const cA = Math.cos(alphaRad);
    const sA = Math.sin(alphaRad);
    const cB = Math.cos(betaRad);
    const sB = Math.sin(betaRad);
    const cG = Math.cos(gammaRad);
    const sG = Math.sin(gammaRad);
    // Calculate A, B, C rotation components
    const rA = - cA * sG - sA * sB * cG;
    const rB = - sA * sG + cA * sB * cG;
    const rC = - cB * cG;
    // Calculate compass heading
    let compassHeading = Math.atan(rA / rB);
    // Convert from half unit circle to whole unit circle
    if (rB < 0) {
      compassHeading += Math.PI;
    }else if (rA < 0) {
      compassHeading += 2 * Math.PI;
    }
    // Convert radians to degrees
    compassHeading *= 180 / Math.PI;
    return compassHeading;
  }
  setPegOrientation(alpha: number, heading: number): void {
    let ok = false;
    if (heading){
      this.pegImage.rotation = heading;
      ok = true;
    }
    if (this.pegMarker && this.pegMarker.options){
      if (ok){
        this.pegMarker.options.icon = this.pegImage;
        this.changeDetectionRef.detectChanges();
      }
    }
  }
  dynamicGeolocation(): void {
    this.geolocation$.subscribe(position => {
      this.pegPosition = {lat: position.coords.latitude,  lng: position.coords.longitude};
      this.trustmanService.pegPosition = this.pegPosition;
      this.heading = Math.round(position.coords.heading);
      this.speed = position.coords.speed; // meters per second
      // TODO why is device orientation unpredictable?
      this.setPegOrientation(null, this.heading);
    });
    // TODO do more research on this capability in a browser
    /*
    if (window.DeviceOrientationEvent) {
      window.addEventListener(
        'deviceorientation',
        (event) => {
          if (event.absolute){ // Device is using earth based framework
            const alpha = event.alpha; // alpha: rotation around z-axis
            const gama = event.gamma; // gamma: left to right
            const beta = event.beta; // beta: front back motion
            this.headingByDevice = Math.round(this.compassHeading(alpha, beta, gama));
          }else{
            this.headingByDevice = -999; // TODO for debug only
          }
        },
        true,
      );
    }*/
  }
  openInfoWindow(marker: MapMarker, portalFrame: PortalFrame): void {
    // let canEdit = false;
    let isTarget = false;
    if (portalFrame){
      if (this.destination && this.directions.length === 1) {
        const latD = this.destination.lat;
        const lngD = this.destination.lng;
        const latO = portalFrame.info.latLng.lat;
        const lngO = portalFrame.info.latLng.lng;
        if (latD === latO && lngD === lngO) {
          isTarget = true;
        }
      }
      const d = this.trustmanService.distanceBetween(this.pegPosition, portalFrame.info.latLng);
      portalFrame.canEdit = d <= Const.CONFIDENCE_GREEN;
      portalFrame.isTarget = isTarget;
      portalFrame.dstToPrtl = d;
      // pegPosition will be stale if user leaves info window open
      // TODO fix by using trustman pegPosition which is updated by geolocation service
      portalFrame.pegLatLng = this.pegPosition;
      this.currentPortalFrame = portalFrame;
      this.label = portalFrame.info.label;
      this.dirty = false;
      // this.setActiveCircle(portalFrame.info);
      setTimeout(() => {
        // populate the PortalInfoComponent ngModel values
        this.PortalInfoComponent.setInfo(portalFrame.info.label);
        if (Const.DEBUG_PUZZLE) {
          console.log('Setting PortalInfoComponent label: '
            + portalFrame.info.label);
        }
      }, this.Const.WAIT_300);
      this.infoWindow?.open(marker);
    }else{
      // This is the pegMarker
      // this.currentPortalFrame = null;
      // this.infoWindow?.open(marker);
    }
  }
  // called by map-info-window (closeclick)
  infoClosed(): void {
  }
  closeWindow(): void {
    this.currentPortalFrame.canEdit = false;
    this.infoWindow.close();
  }
  // event call from app-portal-info
  closeInfoWindow($event: any): void {
    this.closeWindow();
  }

  // getLabel(portalInfo: PortalInfo): string {
  //  return  portalInfo.index + ':' + portalInfo.label;
  // }
  // TODO usefull for opening a route on google maps
  openGoogleMaps(currentPortalFrame: PortalFrame): void {
    const dest = currentPortalFrame.info.latLng;
    const orig = this.center;
    const url = 'https://www.google.com/maps/dir/?api=1&origin='
    + orig.lat + ',' + orig.lng + '&destination='
    + dest.lat + ',' + dest.lng + '&travelmode=walking';
    window.open(url, 'google-maps');
    this.infoWindow.close();
  }
  // TODO usefull for zooming into a location
  zoomToPortal(latLng: LatLng): void{
    // make a fake position a bit away from target
    const NE = {lat: latLng.lat + .0003, lng: latLng.lng + .0003};
    const SW = {lat: latLng.lat - .0003, lng: latLng.lng - .0003};
    const SE = {lat: latLng.lat - .0003, lng: latLng.lng + .0003};
    const NW = {lat: latLng.lat + .0003, lng: latLng.lng - .0003};
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(latLng);
    bounds.extend(NE);
    bounds.extend(SW);
    bounds.extend(SE);
    bounds.extend(NW);
    this.map.fitBounds(bounds);
  }
  fitBounds(): void {
    this.boundsInitialized = true;
    if (this.portals.length === 0){ return; }
    let count = 0;
    let singlton;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({lat: this.pegPosition.lat, lng: this.pegPosition.lng});
    this.portals.forEach(prtl => {
      if (prtl.index) {
      }
      if (prtl.latLng) {
        if (count === 0) {
          singlton = prtl.latLng;
        }
        this.setPinOptionsForFrame(prtl, this.getZoom());
        count++;
        bounds.extend({lat: prtl.latLng.lat, lng: prtl.latLng.lng});
      }
    });
    if (count === 0) {
      // only ingress agent do nothing
    } else if (!bounds.isEmpty()) {
      if (this.map){
        this.map.fitBounds(bounds);
      } else {
        this.snackbarService.openSnackBarTop
        ('MAP undefined!', 'Close', Const.SNACK_WAIT_LONG);
      }
    }
  }
  ////////////////////////////// END ///////////////////////////////
  openLog(): void {
    this.isHome = false;
    this.isLog = true;
  }
  goHome(): void {
    this.isLog = false;
    this.isHome = true;
  }
  getAccent(msgData: MsgData): ThemePalette {
    if (msgData.distance){
      if (msgData.distance <= Const.CONFIDENCE_GREEN){
        return 'primary';
      }else if (msgData.distance < Const.CONFIDENCE_YELLOW){
        return 'accent';
      }else{
        return 'warn';
      }
    }
    return 'primary';
  }
  action(msgData: MsgData): void {
    if (msgData.latLng && msgData.pegLatLng){
      const dest = msgData.latLng;
      const orig = msgData.pegLatLng;
      const url = 'https://www.google.com/maps/dir/?api=1&origin='
        + orig.lat + ',' + orig.lng + '&destination='
        + dest.lat + ',' + dest.lng + '&travelmode=walking';
      window.open(url, 'google-maps');
    }
  }
  mapInitialized(): void { // NOTE only called once when page opens
    this.mapIsLoading = true;
    // TODO unreachable code see NOTE above
    setTimeout(() => {
       if (this.openedFromPortal){
          // Do we ever get here?
       }else{
        if (this.openedFromLogIn){
          this.fitBounds();
          this.openedFromLogIn = false; // Open from last location
        }
       }
       this.mapIsLoading = false;
    }, this.Const.SNACK_WAIT_VERY_SHORT);
  }
  setInfo(currentPortalFrame: PortalFrame = null): void {
    if (currentPortalFrame) {
      if (Const.DEBUG_PUZZLE){
        console.log('mapInfoWindow DOM ready for portal: '
          + currentPortalFrame.index);
      }
    }
  }
  onImageLoad(myImage: HTMLImageElement): void {
    this.debugMsgs += 'onImageLoad START: ';
    this.width = myImage.naturalWidth; // myImage.width;
    this.height = myImage.naturalHeight; // myImage.height;

    const ratio = window.devicePixelRatio || 1;
    this.w = screen.width * ratio;
    if (Const.DEBUG_PUZZLE) {
      console.log('this.width: ' + this.width + ' this.height: ' + this.height);
      console.log('screen.width: ' + screen.width + ' ratio:' + ratio
      + ' screen.width * ratio: ' + this.w);
    }
  }

  showStreetview(latlngPosition: LatLng, info: PortalInfo, heading: number = 0): void {
    const streetView = this.map?.googleMap?.getStreetView();
    let pitch = 0;
    // TODO see if we can store heading and pitch values
    if (info) {
      streetView.addListener('closeclick', ($e) => {
      });
      streetView.addListener('pov_changed', () => {
          heading = streetView.getPov().heading;
          pitch = streetView.getPov().pitch;
      });
    }
    // @ts-ignore
    streetView.setOptions({
      position: latlngPosition,
      zoom: 0,
      pov: {
        heading,
        pitch: 0,
      },
    });
    // IMPORTANT close dialog first
    this.infoWindow.close();
    // @ts-ignore
    streetView.setVisible(true);
  }
  getSize(zoom: number): Size {
    if (zoom === 0){
      zoom = 1;
    }
    let width = 0;
    let height = 0;
    if (zoom > 14) {
      const scale = zoom / (21 * (21 / zoom)); // (21 * (21 / zoom));
      width = Const.SCALE_W * scale;
      height = Const.SCALE_H * scale;
    }
    let dlt = 0;
    if (zoom > 14) {
      switch (zoom) {
        case 22: dlt = 5;
                 break;
        case 21: dlt = 4;
                 break;
        case 20: dlt = 2;
                 break;
        case 19: dlt = 2;
                 break;
        case 18: dlt = 1;
                 break;
        case 17: dlt = -1;
                 break;
        case 16: dlt = -3;
                 break;
        case 15: dlt = -5;
                 break;
        default: dlt = 0;
                 break;
      }
    }
    return {width, height, dlt};
  }
  resizePins(portalFrames: PortalFrame[]): void {
    if (!this.map){return; }
    const zoom = this.map.getZoom();
    if (zoom === this.lastZoomLevel) {return; } // TODO why is resize being called so often
    this.lastZoomLevel = zoom;
    portalFrames.forEach(frame => {
      frame.opts = this.setPinOptionsForFrame(frame.info, zoom);
      frame.iconLabel = this.setPinLabelForFrame(frame.info, zoom);
    });
  }
  setPinLabelForFrame(info: PortalInfo, zoom: number): string{
    let z = this.zoom;
    let label = '';
    if (zoom) {
      z = zoom;
    }
    if (z > 14){
      if (info){
        label = info.index.toString();
      }
    }
    return label;
  }
  setPinOptionsForFrame(info: PortalInfo, zoom: number): google.maps.MarkerOptions {
    let z = this.zoom;
    if (zoom) {
      z = zoom;
    }
    const size = this.getSize(z);
    const url = this.getUrlForInfo(info);
    return {
      icon: {
        url,
        scaledSize: new google.maps.Size(size.width, size.height),
        labelOrigin: new google.maps.Point(Const.LABEL_X + size.dlt,
          Const.LABEL_Y + this.zoom / 2 - 1)
      }
    };
  }
  getShortName(): string {
    return this.ingressName.substring(0, 5);
  }
  getChar(portalInfo: PortalInfo): string{
    let char;
    if (portalInfo.label !== '') {
      char = portalInfo.label; // as string;
    }else{
      char = this.localTemplateArray[portalInfo.index - 1];
    }
    return char;
  }
  getUrlForInfo(info: PortalInfo): string {
    let url = Const.URL_GREY_PIN;
    if (info.label && info.label.length > 0){
      url = Const.URL_GREEN_PIN;
    }
    return url;
  }
  getPegMarkerOptions(marker: MapMarker): google.maps.MarkerOptions {
    const url = Const.URL_SMURF_GIF;
    let opts = {icon: {
      url,
      scaledSize: new google.maps.Size(Const.SCALE_W, Const.SCALE_H),
      labelOrigin: new google.maps.Point(Const.LABEL_X, Const.LABEL_Y)
    }};
    if (this.map) {
      this.pegMarker = marker;
      // const size = this.getSize(21);
      // this.pegMarker.label = this.getShortName();
      this.pegImage.rotation = this.heading;
      // @ts-ignore
      opts = {icon: this.pegImage};
    }
    return opts;
  }
  getZoom(): number {
    // TODO
    if (this.map){
      return this.map.getZoom();
    }
    return null;
  }
  getCenter(): void {
    // TODO
  }
  //////////////////////////// Directions ////////////////////////////////
  closeSideBarAndZoomToPortal(info: PortalInfo): void {
    this.isLog = false;
    this.portalCenter = info.latLng;
    this.openedFromPortal = true;
    this.drawer.toggle();
    this.destination = info.latLng;
    this.getDirectionsFor(info.latLng);
  }
  getDirectionsFor(dstntn: LatLng): void {
    const origin = {lat: this.pegPosition.lat,
      lng: this.pegPosition.lng};
    // const destination = {lat: dstntn.lat,
    //  lng: dstntn.lng};
    const travelMode = google.maps.TravelMode.WALKING;
    // this.getDirections(origin, destination, travelMode);
    this.trustmanService.getDirections
    (origin, dstntn, travelMode).subscribe
    (value => {
      this.googleMapsDirectionResult = value.result;
      if (this.directions.length > 0){
        this.directions.pop();
      }
      this.directions.push(value.result);
    });
  }
  reCenterRoute(directions: google.maps.DirectionsResult[], destination: LatLng): void {
    if (directions.length === 1){ // NOTE should be 0 or 1 exclusively
      this.getDirectionsFor(destination);
    }
  }
  drawDirectionsTo(currentPortalFrame: PortalFrame): void {
    this.closeWindow();
    console.log('closeWindow() from drawDirectionsTo');
    this.destination = currentPortalFrame.info.latLng;
    this.getDirectionsFor(currentPortalFrame.info.latLng);
  }
}
///////////////////// THE END ! ///////////////////////

////////////////////// CODE STORAGE //////////////////////
