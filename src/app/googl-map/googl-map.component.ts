/*
import {AfterViewInit, Component, Input, ViewChild} from '@angular/core';
import {ColumnRecData, LatLng} from '../project.data';

@Component({
  selector: 'app-googl-map',
  templateUrl: './googl-map.component.html',
  styleUrls: ['./googl-map.component.css']
})
export class GooglMapComponent implements AfterViewInit {

  // @Input() columnRecData: ColumnRecData;
  @ViewChild('map') mapElement: any;
  map: google.maps.Map;
  lastLatLng: LatLng;
  lastIndex: number;
  // bounds: LatLngBounds;
  private ottawaCenter: google.maps.LatLng;

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    this.ottawaCenter = new google.maps.LatLng({lat: 45.42, lng: -75.7});
    const mapProperties = {
      center: new google.maps.LatLng(
        {lat: this.ottawaCenter.lat(), lng: this.ottawaCenter.lng()}),
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: true
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapProperties);
    // this.drawMarkers();
  }
}*/
