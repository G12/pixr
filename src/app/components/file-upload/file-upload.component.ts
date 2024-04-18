import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {UploadService} from '../../services/upload.service';
import {LocalMetadata, MsgData, PzBootParam, PzProjectList, UploadResponse} from '../../data';

import {TrustmanService} from '../../services/trustman.service';
import {ProjectService} from '../../services/project.service';
import {AuthService} from '../../services/auth.service';
import {Const} from '../../const';
import {MsgDat} from '../../project.data';
@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit{
  form: FormGroup;
  uploadResponse: UploadResponse;
  showProgress = false;
  uploadComplete = false;
  newProjectInProgress = false;
  fileChosen = false;
  templateSet = false;
  projectName = '';
  localTemplateArray: string[] = [];
  // projectList: ProjectList;
  pzProjectList: PzProjectList;
  constructor(private formBuilder: FormBuilder,
              private uploadService: UploadService,
              private trustmanService: TrustmanService,
              private projectService: ProjectService,
              private authService: AuthService) { }
  ngOnInit(): void {
    this.form = this.formBuilder.group({
      puzzle_img: ['']
    });
    this.getProjectList();
  }
  onFileSelect(event): void {
    this.uploadComplete = false;
    this.fileChosen = true;
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      // this.file = event.target.files[0];
      this.form.get('puzzle_img').setValue(file);
    }else{
      console.log('File Selection FAILED!');
    }
  }
  onSubmit(): void {
    this.showProgress = true;
    this.uploadComplete = false;
    const formData = new FormData();
    formData.append('puzzle_img', this.form.get('puzzle_img').value);
    this.uploadService.uploadFile(formData).subscribe(
      (res) => {
        this.uploadResponse = res;
        this.projectName = this.uploadResponse.name;
        this.showProgress = false;
        this.uploadComplete = true;
      },
      (err) => {
        console.log(err);
        this.uploadComplete = false;
      }
    );
  }
  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////  Start of New Project Area
  ///////////////////////////////////////////////////////////////////////////////
  startNewProject(adminOnly: boolean = false): void {
    if (confirm('Start a NEW project using Image File: ' + this.projectName)){
      this.newProjectInProgress = false;
      if (adminOnly) {
        if (confirm('Proceed to Admin Only')){
          this.newProject(this.projectName, adminOnly);
        }
      } else {
        this.newProject(this.projectName, adminOnly);
      }
    }else{
      this.uploadComplete = false;
      this.fileChosen = false;
    }
  }
  getProjectList(): void {
    // Get the current Project List
    this.projectService.bootParamsCollection.get().subscribe(data => {
      if (!data.empty) {
        // const projLst = data.docs.find(d => d.id === 'project_list');
        // if (projLst) {
          // this.projectList = projLst.data() as PzProjectList;
        // } else {
          // this.projectList = {projects: []};
        // }
        const pzProjLst = data.docs.find(d => d.id === 'pz_project_list');
        if (pzProjLst) {
          this.pzProjectList = pzProjLst.data() as PzProjectList;
        } else {
          this.pzProjectList = {projects: []};
        }
        // console.log('Get latest Project List');
        // console.log(this.pzProjectList);
      }
    });
  }
  /**
   * Create a new First Saturday Project
   */
  newProject(name: string, adminOnly: boolean = false): void {
    this.newProjectInProgress = true;
    // Create template partially filled
    const date = new Date().toISOString();
    const projId = name + ':' + date;
    const localStorage: LocalMetadata = {
      id: '_metadata',
      projectName: name,
      projectID: projId,
      rowCount: Const.DIM_ROW_COUNT,
      rowHeight: Const.DIM_ROW_HEIGHT,
      hdrHeight: Const.HDR_HEIGHT,
      lefMargin: Const.LEFT_MARGIN,
      thumbWidth: Const.THUMB_WIDTH,
      thumbHeight: Const.THUMB_HEIGHT,
      thumbSize: Const.THUMB_SIZE,
      fudgeFactor: Const.FUDGE_FACTOR,
      localTemplateArray: this.localTemplateArray,
    };
    // create new ColRec collection and set it's _metadata document
    this.trustmanService.metadataDocRef(projId).set(localStorage).then(val => {
      if (Const.DEBUG_FILE_UPLOAD){
        console.log(val);
      }
      const bootParam: PzBootParam = {
        project_id: localStorage.projectID,
        folder: name
      };
      const msgDat: MsgData = {
        msg: 'Started Project: ' + name,
        time: JSON.stringify(new Date()),
        ingressName: '',
        portalLabel: '',
        portalIndex: null,
        tStamp: Date.now(),
        prtlId: null,
        url: null,
        pegLatLng: null,
        distance: Const.CONFIDENCE_GREEN
      };
      const messagesDoc = {messages: []};
      messagesDoc.messages.push(msgDat);
      this.trustmanService.msgLogDocRef(projId).set(messagesDoc).then(value => {
        if (Const.DEBUG_FILE_UPLOAD){
          console.log(value);
        }
      });
      this.pzProjectList.projects.push(bootParam);
      // update the project list
      this.trustmanService.projectListBootDocRef.set(this.pzProjectList).then(doc => {
        if (Const.DEBUG_FILE_UPLOAD){
          console.log('project List Updated');
          console.log(this.pzProjectList.projects);
        }
      });
      if (!adminOnly) {
        this.trustmanService.pzUserBootParamDocRef.set(bootParam).then(value2 => {
          if (Const.DEBUG_FILE_UPLOAD){
            console.log('User Updated');
            console.log(value2);
          }
        });
      }
      this.trustmanService.pzAdminBootParamDocRef.set(bootParam).then(value3 => {
        if (Const.DEBUG_FILE_UPLOAD){
          console.log('Admin Updated');
          console.log(value3);
        }
      });
    });
  }
  logout(): void {
    if (confirm('Log Out?')) {
      this.authService.logout();
    }
  }
  ////////////////////////////// End of New Project Area
  logOut(): void {
    this.authService.logout();
  }
  setPasscodeTemplate(): void {
    const pattern = '***##keyword###**';
    const value = prompt(
      'Passcode Template where * = letters and # = numbers', pattern);
    if (value && value !== '') {
      for (let i = 0; i < value.length; i++ ){
        let char = value[i];
        if (char === 'k'){
          const len = 'keyword'.length;
          char = value.substring(i, i + len);
          i = i + len - 1; // assuming i will be incremented next
        }
        this.localTemplateArray.push(char);
      }
      this.templateSet = true;
      alert(JSON.stringify(this.localTemplateArray));
    }
  }
}
