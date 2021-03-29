import {AfterViewInit, Component, ElementRef, Input, NgZone, OnInit, ViewChild} from '@angular/core';
import {PortalRec} from '../../project.data';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit, AfterViewInit {

  @ViewChild('canvasElement') canvasElement: ElementRef;
  @Input() portalRec: PortalRec;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  width = 100;
  height = 100;
  imgData: ImageData;
  imageDone = false;
  rec: PortalRec;
  d: number;
  scale: number;
  debugMsg = '';

  constructor(private ngZone: NgZone) { }

  ngOnInit(): void {
    this.scale = this.portalRec.scale;
    this.rec = this.portalRec;
    this.d = 6 * this.portalRec.scale; // scale area down to get rid of ragged edges
    this.width = (this.rec.r - 2 * this.d) * this.scale;
    this.height = (this.rec.b - 2 * this.d) * this.scale;
  }

  ngAfterViewInit(): void {
    this.canvas = this.canvasElement.nativeElement;
    this.ctx = this.canvas.getContext('2d');
    const sx = Math.round((this.rec.l + this.d)  * this.scale);
    const sy = Math.round((this.rec.t + this.d) * this.scale);
    const sw = Math.round((this.rec.r - this.d) * this.scale);
    const sh = Math.round((this.rec.b - this.d) * this.scale);

    try {
      this.imgData = this.portalRec.ctx.getImageData(sx, sy, sw, sh);
    } catch (error) {
      this.debugMsg = 'NO Image? Some Browsers cause this error - working on a fix: ' +
        JSON.stringify(error);
      return;
    }
    this.debugMsg = 'Happy Picture to you! imgData.width: '
      + this.imgData.width + ' imgData.height: ' + this.imgData.height;
    console.log(this.debugMsg);
    setTimeout(() =>  {
      this.ctx.putImageData(this.imgData, 0, 0);
    }, 500);
  }

  drawImage(): void {
    alert(this.debugMsg);
  }
}
