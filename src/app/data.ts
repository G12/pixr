export interface MarkerData {
  position: google.maps.LatLngLiteral;
  label: string;
}

export interface PortalInfo {
  id: string;
  index: number;
  published: boolean;
  lat?: number;
  lng?: number;
  label: string;
  comment?: string;
}

export interface PortalFrame {
  index: number;
  height?: number; // if variable height else colHeight
  info: PortalInfo;
}

export interface LocalMetadata {
  id: string;
  projectName: string;
  projectID: string;
  rowCount: number;
  colHeight: number;
  imgColWidth: number;
}
