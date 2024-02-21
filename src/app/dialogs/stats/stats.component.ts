import {AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StatsList} from '../../project.data';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit, AfterViewInit {

  constructor(public dialogRef: MatDialogRef<StatsComponent>,
              @Inject(MAT_DIALOG_DATA) public data: StatsList) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

  }

  onOkClick(): void {
    this.dialogRef.close();
  }
}

