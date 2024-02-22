import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {UploadService} from '../../services/upload.service';
import {LocalMetadata, PzBootParam, PzProjectList, UploadResponse} from '../../data';
import {BootParam, MsgDat} from '../../project.data';
import {TrustmanService} from '../../services/trustman.service';
import {ProjectService} from '../../services/project.service';
import {AuthService} from '../../services/auth.service';

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
  projectName = '';
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
    // console.log(event);
    if (event.target.files.length > 0) {
      // console.log('DEBUG1');
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
    // console.log('formData');
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
  startNewProject(): void {
    if (confirm('Start a NEW project using Image File: ' + this.projectName)){
      this.newProjectInProgress = false;
      this.newProject(this.projectName);
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

        console.log('Get latest Project List');
        console.log(this.pzProjectList);
      }
    });
  }

  setUserProject(bootParams: PzBootParam): void {
  }

  /**
   * Create a new First Saturday Project
   * @param name: The name part of the uploaded Ingress image.
   */
  newProject(name: string): void {
    this.newProjectInProgress = true;
    // Create template partially filled
    const date = new Date().toISOString();
    const projId = name + ':' + date;
    const localStorage: LocalMetadata = {
      id: '_metadata',
      projectName: name,
      projectID: projId,
      rowCount: 11,
      colHeight: 299,
      imgColWidth: 2480,
      hdrHeight: 144
    };

    // create new ColRec collection and set it's _metadata document
    this.trustmanService.metadataDocRef(projId).set(localStorage).then(val => {
      // console.log('trustmanService.getMetadataDoc(' + projId + '): ', val);
      const bootParam: PzBootParam = {
        project_id: localStorage.projectID,
        folder: name
      };
      const msgDat: MsgDat = {
        msg: 'Started Project: ' + name,
        time: JSON.stringify(new Date())
      };
      const messagesDoc = {messages: []};
      messagesDoc.messages.push(msgDat);
      this.trustmanService.msgLogDocRef(projId).set(messagesDoc).then(value => {
        // console.log('set _MsgLog return: ', value);
      });
      this.pzProjectList.projects.push(bootParam);
      // update the project list
      this.trustmanService.projectListBootDocRef.set(this.pzProjectList).then(doc => {
        console.log('project List Updated');
        console.log(this.pzProjectList.projects);
      });
      this.trustmanService.pzUserBootParamDocRef.set(bootParam).then(value2 => {
        console.log('User Updated');
      });
      this.trustmanService.pzAdminBootParamDocRef.set(bootParam).then(value3 => {
        console.log('Admin Updated');
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
}
