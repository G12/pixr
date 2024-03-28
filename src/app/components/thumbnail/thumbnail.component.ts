import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.css']
})
export class ThumbnailComponent {
  @Input() src: string;
  @Input() index: number;
  @Input() thumbWidth: number;
  @Input() thumbHeight: number;
  @Input() hdrHeight: number;
  @Input() leftMargin: number;
  @Input() thumbSize: number;
  @Input() fudgeFactor: number;
  getYPosition(): string {
    const n = ((this.index - 1) * (this.thumbHeight))
      + (this.hdrHeight) + (this.index * this.fudgeFactor);
    return '-' + this.leftMargin + 'px -' + n + 'px';
  }
}
