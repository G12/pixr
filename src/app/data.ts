
////////////////////////////////  MAP  /////////////////////////////////////
import {MsgDat} from './project.data';
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
  isActive?: boolean;
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
  circle?: MapCircle;
}

export interface LocalMetadata {
  id: string;
  projectName: string;
  projectID: string;
  rowCount: number;
  colHeight: number;
  imgColWidth: number;
  thumbWidth: number;
  hdrHeight: number;
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
