import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {PortalRec} from '../../project.data';
import {ProjectService} from '../../services/project.service';

@Component({
  selector: 'app-clipboard',
  templateUrl: './clipboard.component.html',
  styleUrls: ['./clipboard.component.css']
})
export class ClipboardComponent implements OnInit {

  clipData: PortalRec;
  constructor(public dialogRef: MatDialogRef<ClipboardComponent>,
              @Inject(MAT_DIALOG_DATA) public data: PortalRec,
              public projectService: ProjectService) {
    this.clipData = this.projectService.clipboard;
  }

  ngOnInit(): void {
  }

  paste(data: PortalRec): void {
    this.pasteData(data);
    this.dialogRef.close();
    if (confirm('Do you want to paste More?')){

    } else {
      this.projectService.clipboard = null;
    }
  }

  clearClipBoard(): void {
    this.projectService.clipboard = null;
    this.dialogRef.close();
  }

  onCancelClick(data: PortalRec): void {
    this.dialogRef.close();
  }

  pasteData(data: PortalRec): void {
    const src = this.projectService.clipboard.colName + ':' +
      this.projectService.clipboard.index;
    const dest = data.colName + ':' + data.index;
    const P_FULL = 1;
    const path = data.colName + ':' + data.index;
    data.url = this.projectService.clipboard.url;
    data.latLng = this.projectService.clipboard.latLng;
    data.status = P_FULL;
    data.owner = data.user;
    this.projectService.setPortalRec(data.rawDataId, path, data);
    // this.updatePortalRecs(dlgData); defer this to onclose event in parent
    this.projectService.setLogMsg(
      data.rawDataId,
      data.user + ' Pasted ' + src + ' to ' + dest,
      data);
  }
}
