import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {AngularFireModule} from '@angular/fire';
import {environment} from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MaterialModule} from './modules/material.module';
import {PixrComponent, PortalInfoDialogComponent} from './pixr/pixr.component';
import {FormsModule} from '@angular/forms';
import { MapDialogComponent } from './dialogs/map/map-dialog.component';
import {MapComponent} from './map/map.component';
import { SpeedDialComponent } from './components/speed-dial/speed-dial.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { ClipboardComponent } from './dialogs/clipboard/clipboard.component';
import { StatsComponent } from './dialogs/stats/stats.component';

@NgModule({
  declarations: [
    AppComponent,
    PixrComponent,
    PortalInfoDialogComponent,
    MapDialogComponent,
    MapComponent,
    SpeedDialComponent,
    CanvasComponent,
    ClipboardComponent,
    StatsComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    // AgmCoreModule.forRoot({
    //  apiKey: environment.googleMapsApiKey,
    //  libraries: ['geometry']
    // }),
  ],
  entryComponents: [
    PortalInfoDialogComponent,
    MapDialogComponent,
    ClipboardComponent,
    StatsComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
