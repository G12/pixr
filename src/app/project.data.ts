/* firestor document */
export interface Messages {
  id?: string;
  messages: MsgDat[];
}

export interface MsgDat {
  msg: string;
  time: string;
  prtlId?: string;
}

export interface CharDat{
  char: string;
  ingressName: string;
  time: string;
}

/* firestore document */
export interface ColumnChar {
  id?: string; // unique identifier _CHAR: then column names A to P...
  final?: CharDat;
  notes?: string;
  rawDataId: string;
  portalCount?: number;
  portalsLength: number;
  percentDone: number;
}

export interface ColumnRecData {
  rawDataId: string;
  id: string; // _ColRec: <columnName>
  column?: Column; // used for passing data - striped before save to db
  portalRecs?: PortalRec[]; // used for passing data - striped before save to db
  columnChar: ColumnChar;
  ingressName?: string; // used for passing data - striped before save to db
  isMobile?: boolean;
}

export interface LatLng {
  lat: number;
  lng: number;
}

/* A firestore Document */
export interface PortalRec {
  id?: string;
  index: number;
  colName: string;
  rawDataId: string;
  user: string;
  owner: string;
  l: number;
  t: number;
  r: number;
  b: number;
  status?: number;
  name?: string;
  url?: string;
  latLng?: LatLng;
  msg?: string;
  ctx?: CanvasRenderingContext2D;
  scale?: number;
  isMobile?: boolean;
}

export interface Column{
  name: string;
  offset: number;
  width: number;
  portals?: PortalRec[];
}

export interface RawData {
  id?: string;
  name?: string;
  imgUrl?: string;
  srcHeight?: number;
  srcWidth?: number;
  displayWidth?: number;
  displayHeight?: number;
  columns?: Column[];
}

// March 13 2021 migrating to single project firebase collection
export interface MetaData {
  lastUpdate: string;
  rawData: RawData;
  rawDataId: string;
  rawDataName: string;
}

// TODO columnCollection is no longer used - remove these items globally and test when time allows
export interface PortalData {
  colName: string;
  x: number;
  y: number;
  x2: number;
  y2: number;
  name?: string;
  url?: string;
  discoverer?: string;
}

export interface ColumnData {
  name: string;
  width: number;
  offset: number;
  portals: PortalData[];
}

export interface CanvasData {
  imgUrl: string;
  srcHeight: number;
  srcWidth: number;
  displayWidth: number;
  displayHeight: number;
  columnCollection: ColumnData[];
}

/*
  "uid": "1KYU0BdE0rXTly5Y5KZslOvxpow2",
  "displayName": "Tom Wiegand",
  "photoURL": "https://lh3.googleusercontent.com/a-/AOh14GhUE1ZS-PPJZ3ygHR3bStggNLzwXttyRimxxr4y=s96-c",
  "email": "surrealranchhand@gmail.com",
 */
export interface ProjectUser {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
}

export interface FirstSatProject {
  id?: string;
  name: string;
  date: string;
  projectUsers: ProjectUser[];
  canvasData: CanvasData;
}

// NOTE all fields are optional since firebase returns unknown TODO more research needed here
/*
export interface BootParam {
  id?: string;
  project_id?: string;
  folder?: string;
  portalCollectionName?: string;
  admin_list?: string[];
}

export interface BootParams {
  bootParams: BootParam[];
}
*/

export interface IngressNameData {
  userUid: string;
  name: string;
}

//////////////////////// User and security Boot Params
export interface Admin {
  uid: string;
  name: string;
}

export interface AdminList {
  admins: Admin[];
}

export interface BootParam {
  project_id?: string;
  folder?: string;
}

