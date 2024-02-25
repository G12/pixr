import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {ProjectService} from '../../services/project.service';
import {UsersService} from '../../services/users.service';
import {TrustmanService} from '../../services/trustman.service';
import {MatDialog} from '@angular/material/dialog';
import {
  Admin,
  AdminList, CharDat, Column, ColumnChar, ColumnRecData,
  // BootParam,
  IngressNameData,
  Messages,
  MsgDat, PortalRec,
  // ProjectList,
} from '../../project.data';
import {AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import {LocalMetadata, PortalFrame, PortalInfo, PzBootParam, PzProjectList} from '../../data';
import {Clipboard} from '@angular/cdk/clipboard';
import {PuzzleMapDialogComponent} from '../../dialogs/puzzle-map/puzzle-map-dialog.component';
import {catchError, map, Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';


@Component({
  selector: 'app-puzzle',
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.css']
})
export class PuzzleComponent implements OnInit, AfterViewInit {

  ////////////////////////// PUZZLE

  createNewProject = false;

  // mapInfo = 'bigworld';
  loggedIn = false;

  colHeight = 299;
  rowCount = 11;
  imgColWidth = 1024;
  hdrHeight = 144;

  portals: PortalInfo[] = [];
  portalFrames: PortalFrame[] = [];

  summary = '';

///////////////////////////////////////////////////////////////////
  ////////////////////////// pixr area

  expandMe = true;
  pageXOffset = 0;
  bannerWidth: number;
  width: number;
  height: number;
  bannerWidthO: number;
  widthO: number;
  heightO: number;

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
  // imageLoaded = false;
  showDebug = true;
  // waves = 'assets/waves.gif';
  isMobile = false;

  // canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  /** Template reference to the canvas element */
  @ViewChild('canvasEl') canvasEl: ElementRef;
  @ViewChild('myImage') myImage: ElementRef;
  /** Canvas 2d context */
  // ctx: CanvasRenderingContext2D;
  // img: HTMLImageElement;


  //////////////////////////  Hard Code ZONE Caution
  // TODO someday have an upload service for this
  // imgUrl = 'assets/FirstSatBlackSmall.jpg'; // 'assets/FirstSatBlack.jpg';
  // imgUrl: string; // assigned after project data aquired from Firebase
  src: string; // TODO make constants for = 'https://geopad.ca/fs_pics/' + folder + '/black.jpg';
  path = 'https://geopad.ca/pixr2/assets/puzzle_images/';
  // realWidth = 4887;
  // realHeight = 2699;
  logBuffer = '';
  ///////////////////////////////////////////////////


  // Firestore data
  // rawDataDoc: AngularFirestoreDocument;
  localMetadata: LocalMetadata;
  logMessages: Messages;
  logMsgArray: MsgDat[] = [];

  //////////////////////////////////////////////////////////////////
  ///////////////////////// MAP
  //////////////////////////////////////////////////////////////////

  isMap = false;
  mapWidth: number;
  mapHeight: number;

  constructor(httpClient: HttpClient,
              public authService: AuthService,
              private projectService: ProjectService,
              private usersService: UsersService,
              private trustmanService: TrustmanService,
              private clipboard: Clipboard,
              public dialog: MatDialog) {
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
        this.colHeight = this.localMetadata.colHeight;
        this.hdrHeight = this.localMetadata.hdrHeight;
        this.rowCount = this.localMetadata.rowCount;
        console.log('this.metaData.imgColWidth: ' + this.localMetadata.imgColWidth);
        this.imgColWidth = this.localMetadata.imgColWidth;
        console.log('this.imgColWidth: ' + this.imgColWidth);
        this.projectService.getMsgLog(id).get().subscribe(doc2 => {
          if (doc2.exists) {
            this.logMessages = doc2.data() as Messages;
            this.logMsgArray = this.logMessages.messages;
            this.debugMsgs += 'getMsgLog length: ' + this.logMsgArray.length + ', ';
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
        const portalFrame: PortalFrame = {
          // colHeight is optional - will be neccessary if colHeights are not uniform
          index: i, height: this.colHeight,
          info: {
            index: i,
            id: 'P:' + i,
            published: false,
            label: ''
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
        this.trustmanService.setLogMsg(this.localMetadata.id,
          this.ingressName + ' Logged In', null);
      }
      this.showDebug = false;
    }
  }

  /////////////////////////////////////
  ////////////////////////////////

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

  popUpDialog(portalFrame: PortalFrame): void {
    let prefix = 'Enter';
    let defaultLabel = '';
    if (portalFrame.info) {
      defaultLabel = portalFrame.info.label;
      if (portalFrame.info.label !== ''){
        prefix = 'Edit';
      }
    }
    const label = prompt(
      prefix + ' character from media item for portal ' + portalFrame.index, defaultLabel
    );
    if (label != null) {
      if (portalFrame.info.label === '') {
        // always overwrite ''
        portalFrame.info.label = label;
      } else {
        if (portalFrame.info.label !== label) {
          if (confirm('Do you want to over write the value: ' + portalFrame.info.label + ' with: ' + label)) {
            portalFrame.info.label = label;
          }
        } else {
          portalFrame.info.label = label;
        }
      }

      const projectID = this.localMetadata.projectID;
      const portalInfoID = portalFrame.info.id;

      portalFrame.info.published = true; // TODO make a publish log
      this.trustmanService.setPortalInfo
      (projectID, portalInfoID, portalFrame.info).then(value => {
        console.log('setPortalInfo return value: ' + JSON.stringify(value));
      }).catch(reason => {
        alert('setPortalInfo ERROR reason: ' + JSON.stringify(reason));
        portalFrame.info.published = false;
      });

    }
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
        char = '*';
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

  openMapDialog(portalInfo: PortalInfo): void {
    const dialogRef = this.dialog.open(PuzzleMapDialogComponent, {
      width: '600px',
      data: portalInfo
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      } else {
      }
    });
  }

  prepareMapDialog(): void {
    const portalInfo: PortalInfo = {
        id: 'P1',
        index: 1,
        published: true,
        lat: 45,
        lng: 76.4,
        label: 'SHAPERS',
        comment: 'wasupdoc'
    };
    this.openMapDialog(portalInfo);
  }

  toggleMap(): void {
    this.isMap = !this.isMap;
  }
}
