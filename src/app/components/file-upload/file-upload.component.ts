import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {UploadService} from '../../services/upload.service';
import {LocalMetadata, UploadResponse} from '../../data';
import {BootParam, MsgDat, ProjectList} from '../../project.data';
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
  fileChosen = false;
  projectName = '';
  projectList: ProjectList;

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
        // console.log(res);
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
        const projLst = data.docs.find(d => d.id === 'project_list');
        if (projLst) {
          this.projectList = projLst.data() as ProjectList;
        } else {
          this.projectList = {projects: []};
        }
        console.log('Get latest Project List');
        console.log(this.projectList);
      }
    });
  }

  setUserProject(bootParams: BootParam): void {
    if (confirm('Set the fs_user data using: ' + bootParams.folder)) {
      this.projectService.userBootParamDocRef.set(bootParams);
      this.projectService.adminBootParamDocRef.set(bootParams);
      this.logout();
    }
  }

  /**
   * Create a new First Saturday Project
   * @param name: The name part of the uploaded Ingress image.
   */
  newProject(name: string): void {
    // Create template partially filled
    const date = new Date().toISOString();
    const projId = name + ':' + date;
    const localStorage: LocalMetadata = {
      id: '_metadata',
      projectName: name,
      projectID: projId,
      rowCount: 11,
      colHeight: 196,
      imgColWidth: 1024
    };

    // create new ColRec collection and set it's _metadata document
    this.trustmanService.metadataDocRef(projId).set(localStorage).then(val => {
      // console.log('trustmanService.getMetadataDoc(' + projId + '): ', val);
      const bootParam: BootParam = {
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
      this.projectList.projects.push(bootParam);
      // update the project list
      this.trustmanService.projectListBootDocRef.set(this.projectList).then(doc => {
        // alert('Project: ' + name + ' published - list updated');
        this.setUserProject(bootParam);
      });
    });
  }

  logout(): void {
    if (confirm('Log Out?')) {
      this.authService.logout();
    }
  }


  ////////////////////////////// End of New Project Area
}
