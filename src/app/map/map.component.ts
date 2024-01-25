import {AfterViewInit, Component, Input, ViewChild} from '@angular/core';
import {ColumnRecData, PortalRec} from '../project.data';
import {} from 'googlemaps';
import LatLng = google.maps.LatLng;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  @Input() columnRecData: ColumnRecData;
  @ViewChild('map') mapElement: any;
  map: google.maps.Map;
  lastLatLng: LatLng;
  lastIndex: number;
  // bounds: LatLngBounds;
  private ottawaCenter: google.maps.LatLng;

  constructor() {
  }

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
    this.drawMarkers();
  }

  makeInfoMarker(prtl: PortalRec): void {
    const contentString =
      '<h1>Portal: ' + prtl.colName + ':' + prtl.index + '</h1>' +
    '<a href="' + prtl.url + '" target="intel_map"><strong>IntelMap</strong></a>';

    const infowindow = new google.maps.InfoWindow({
      content: contentString,
    });

    const marker = new google.maps.Marker({
      position: prtl.latLng,
      title: prtl.name,
      label: prtl.index + '',
    });
    marker.setMap(this.map);

    marker.addListener('click', () => {
      infowindow.open(this.map, marker);
    });
  }

  drawMarkers(): void {
    this.columnRecData.portalRecs.forEach(prtl => {
      if (prtl.latLng) {
        this.makeInfoMarker(prtl);
        const diff = this.lastIndex ? prtl.index - this.lastIndex : 0;
        if (diff === 1) {
          // draw a line back to it
          const portalCoordinates = [
            {lat: prtl.latLng.lat, lng: prtl.latLng.lng},
            {lat: this.lastLatLng.lat(), lng: this.lastLatLng.lng()},
          ];
          const flightPath = new google.maps.Polyline({
            path: portalCoordinates,
            geodesic: false,
            strokeColor: '#000000',
            strokeOpacity: 1.0,
            strokeWeight: 4,
          });
          flightPath.setMap(this.map);
        }
        // remember to assign a new value to this lastLatLng
        this.lastLatLng = new google.maps.LatLng(prtl.latLng);
        this.lastIndex = prtl.index;
      }
    });
    this.fitBounds();
  }

  fitBounds(): void {
    let count = 0;
    let singlton;
    const bounds = new google.maps.LatLngBounds();
    this.columnRecData.portalRecs.forEach(prtl => {
      if (prtl.latLng) {
        if (count === 0) {
          singlton = prtl.latLng;
        }
        count++;
        bounds.extend({lat: prtl.latLng.lat, lng: prtl.latLng.lng});
      }
    });
    if (count === 1) {
        this.map.setCenter(singlton);
      } else if (!bounds.isEmpty()) {
        this.map.fitBounds(bounds);
      }
    }
  }

