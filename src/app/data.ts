////////////////////////////////  MAP  /////////////////////////////////////
import {MapCircle, MapMarker} from '@angular/google-maps';
export interface MarkerData {
  position: google.maps.LatLngLiteral;
  label: string;
}
export interface LatLng {
  lat: number;
  lng: number;
  isValid?: boolean;
}
export interface PortalVisiter {
  ingressName: string;
  action: string;
  msg: string;
}
export interface PortalVisiters {
  visiters: PortalVisiter[];
}
///////////////////////////////  PUZZLE ////////////////////////////////////
export interface PortalInfo {
  projectId?: string; // Used to pass project Id to Dialog
  id: string;
  index: number;
  published: boolean;
  latLng?: LatLng;
  url?: string;
  label: string;
  AKA?: string;
  visiters?: PortalVisiters;
  comment?: string;
  type: string;
  isActive?: boolean; // TODO remove if unused
}
export interface RetVal {
  hintMsg: string;
  isValidChar: boolean;
  dirty: boolean;
}
export interface PortalFrame {
  index: number;
  height?: number; // if variable height else colHeight
  info: PortalInfo;
  marker?: MapMarker;
}
export interface LocalMetadata {
  id: string;
  projectName: string;
  projectID: string;
  rowCount: number;
  rowHeight: number;
  hdrHeight: number;
  lefMargin: number;
  thumbWidth: number;
  thumbHeight: number;
  thumbSize: number;
  fudgeFactor: number;
  localTemplateArray: string[];
}
export interface UploadResponse {
  status: string;
  error: boolean;
  message: string;
  target_file: string;
  name: string;
}
export interface PzBootParam {
  project_id?: string;
  folder?: string;
}
export interface PzProjectList {
  projects: PzBootParam[];
}
////////////////////////////////////  PUZZLE INFO DIALOG ///////////////////////////
export interface DialogPackage {
  ingressName: string;
  localMetadata: LocalMetadata;
  portalFrame: PortalFrame;
  pegPosition: LatLng;
}
///////////////////////////////// LOG ///////////////////////////////////////
export interface MsgData {
  ingressName: string;
  portalIndex?: number;
  portalLabel: string;
  msg: string;
  time: string;
  tStamp: number;
  prtlId: string;
  url?: string;
  latLng?: LatLng;
}
export interface LogMessages {
  id?: string;
  messages: MsgData[];
}
export interface OneItem{
  str: string;
}
export interface OneItemArray{
  item: OneItem;
}
///////////////////////// GLYPHS
export interface GlyphData {
  names: string[];
  name: string;
  isGlyph: boolean;
  AKA: string;
}
export interface MarkerOptions {
  icon: string;
  title: string;
}
interface DirectionsRendererOptions {
  /**
   * The directions to display on the map and/or in a <code>&lt;div&gt;</code>
   * panel, retrieved as a <code>DirectionsResult</code> object from
   * <code>DirectionsService</code>.
   */
  directions?: google.maps.DirectionsResult|null;
  /**
   * If <code>true</code>, allows the user to drag and modify the paths of
   * routes rendered by this <code>DirectionsRenderer</code>.
   */
  draggable?: boolean|null;
  /**
   * This property indicates whether the renderer should provide a
   * user-selectable list of routes shown in the directions panel.
   * @defaultValue <code>false</code>
   */
  hideRouteList?: boolean|null;
  /**
   * The <code>InfoWindow</code> in which to render text information when a
   * marker is clicked. Existing info window content will be overwritten and
   * its position moved. If no info window is specified, the
   * <code>DirectionsRenderer</code> will create and use its own info window.
   * This property will be ignored if <code>suppressInfoWindows</code> is set
   * to <code>true</code>.
   */
  infoWindow?: google.maps.InfoWindow|null;
  /**
   * Map on which to display the directions.
   */
  map?: google.maps.Map|null;
  /**
   * Options for the markers. All markers rendered by the
   * <code>DirectionsRenderer</code> will use these options.
   */
  markerOptions?: google.maps.MarkerOptions|null;
  /**
   * The <code>&lt;div&gt;</code> in which to display the directions steps.
   */
  panel?: HTMLElement|null;
  /**
   * Options for the polylines. All polylines rendered by the
   * <code>DirectionsRenderer</code> will use these options.
   */
  polylineOptions?: google.maps.PolylineOptions|null;
  /**
   * If this option is set to <code>true</code> or the map&#39;s center and
   * zoom were never set, the input map is centered and zoomed to the bounding
   * box of this set of directions.
   * @defaultValue <code>false</code>
   */
  preserveViewport?: boolean|null;
  /**
   * The index of the route within the <code>DirectionsResult</code> object.
   * The default value is 0.
   */
  routeIndex?: number|null;
  /**
   * Suppress the rendering of the <code>BicyclingLayer</code> when bicycling
   * directions are requested.
   */
  suppressBicyclingLayer?: boolean|null;
  /**
   * Suppress the rendering of info windows.
   */
  suppressInfoWindows?: boolean|null;
  /**
   * Suppress the rendering of markers.
   */
  suppressMarkers?: boolean|null;
  /**
   * Suppress the rendering of polylines.
   */
  suppressPolylines?: boolean|null;
}
