import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.css']
})
export class ThumbnailComponent implements OnInit {
  @Input() src: string;
  constructor( ) {
  }

  ngOnInit(): void {
    console.log('src:' + this.src);
  }
}
