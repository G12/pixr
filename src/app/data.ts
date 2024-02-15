export interface MarkerData {
  position: google.maps.LatLngLiteral;
  label: string;
}

export interface PortalData {
  index: number;
  lat?: number;
  lng?: number;
  label?: string;
  comment?: string;
  height?: number;
}

export interface LocalStorage {
  id: string;
  projectName: string;
  portals: PortalData[];
  rowCount: number;
  colHeight: number;
  imgColWidth: number;
}
