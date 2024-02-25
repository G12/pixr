import {Component, Inject, Input, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MapDialogComponent} from '../map/map-dialog.component';
import {PortalInfo} from '../../data';
import {TrustmanService} from '../../services/trustman.service';
import {GoogleMap} from '@angular/google-maps';
import {catchError, map, Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-puzzle-map-dialog',
  templateUrl: './puzzle-map-dialog.component.html',
  styleUrls: ['./puzzle-map-dialog.component.css']
})
export class PuzzleMapDialogComponent {

  // @ViewChild(GoogleMap) map: GoogleMap | undefined;

  url = 'https://maps.googleapis.com/maps/api/js?key=' + environment.googleMapsApiKey;


  label = '';
  comment = '';

  apiLoaded: Observable<boolean>;

  constructor(
    httpClient: HttpClient,
    public dialogRef: MatDialogRef<MapDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public portalInfo: PortalInfo,
    public trustmanService: TrustmanService) {
    /*
    this.apiLoaded = httpClient.jsonp(this.url, 'callback')
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );
  */
    if (portalInfo.label) {
      this.label = portalInfo.label;
    }
    if (portalInfo.comment) {
      this.comment = portalInfo.comment;
    }
  }

  onOkClick(portalInfo: PortalInfo): void {
    alert('Save: ' + JSON.stringify(portalInfo));
  }

  onCancelClick(portalInfo: PortalInfo): void {
    this.dialogRef.close();
  }
}
