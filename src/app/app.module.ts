import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
// import {AngularFireModule} from '@angular/fire';
import { AngularFireModule} from '@angular/fire/compat';
import {environment} from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MaterialModule} from './modules/material.module';
import {PixrComponent, PortalInfoDialogComponent} from './pixr/pixr.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MapDialogComponent } from './dialogs/map/map-dialog.component';
import {MapComponent} from './map/map.component';
import { SpeedDialComponent } from './components/speed-dial/speed-dial.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { ClipboardComponent } from './dialogs/clipboard/clipboard.component';
import { StatsComponent } from './dialogs/stats/stats.component';
import { WarningComponent } from './dialogs/warning/warning.component';
import { HelpComponent } from './components/help/help.component';
import { PuzzleComponent } from './components/puzzle/puzzle.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import {HttpClientModule} from '@angular/common/http';
import {PuzzleMapDialogComponent} from './dialogs/puzzle-map/puzzle-map-dialog.component';
// import { GooglMapComponent } from './googl-map/googl-map.component';
import {GoogleMapsModule} from '@angular/google-maps';
import {POSITION_OPTIONS} from '@ng-web-apis/geolocation';


@NgModule({
  declarations: [
    AppComponent,
    PixrComponent,
    PortalInfoDialogComponent,
    MapDialogComponent,
    PuzzleMapDialogComponent,
    MapComponent,
    SpeedDialComponent,
    CanvasComponent,
    ClipboardComponent,
    StatsComponent,
    WarningComponent,
    HelpComponent,
    PuzzleComponent,
    FileUploadComponent,
    // GooglMapComponent
  ],
    imports: [
        BrowserModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        BrowserAnimationsModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        GoogleMapsModule
        // AgmCoreModule.forRoot({
        //  apiKey: environment.googleMapsApiKey,
        //  libraries: ['geometry']
        // }),
    ],
  entryComponents: [
    PortalInfoDialogComponent,
    MapDialogComponent,
    PuzzleMapDialogComponent,
    ClipboardComponent,
    StatsComponent,
    WarningComponent],
  providers: [
    {
      provide: POSITION_OPTIONS,
      useValue: {enableHighAccuracy: true, timeout: 3000, maximumAge: 1000},
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
