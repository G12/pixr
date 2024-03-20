import { Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {PortalRec} from '../../project.data';

@Component({
  selector: 'app-warning',
  templateUrl: './warning.component.html',
  styleUrls: ['./warning.component.css']
})
export class WarningComponent implements OnInit {

  help = false;

  constructor(public dialogRef: MatDialogRef<WarningComponent>,
              @Inject(MAT_DIALOG_DATA) public data: PortalRec) {
    // console.log(data);
  }

  ngOnInit(): void {
  }

  onCancelClick(data: PortalRec): void {
    this.dialogRef.close();
  }

  helpPage(): void {
    this.dialogRef.close();
    window.open('https://geopad.ca/pixr-help/', 'help_page');
  }

  onHelp(): void {
    this.help = !this.help;
  }
}
