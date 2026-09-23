export class Const {
  public static SIDE_BAR_RIGHT_PADDING = 56;
  public static BUTTON_WIDTH = 56;

  public static CONFIDENCE_GREEN = 40; // 40
  public static CONFIDENCE_YELLOW = 240;
  public static CONFIDENCE_RED = 99999999;

  // desk top Left Drawer setup thumbnail defaults
  public static THUMB_WIDTH = 500;
  public static THUMB_HEIGHT = 192;
  public static THUMB_SIZE = 500; // not used
  public static FUDGE_FACTOR = 1;
  public static HDR_HEIGHT = 144;
  public static LEFT_MARGIN = 110;

  public static IMG_SCALE = 1.25;
  public static INFO_SCALE = 1.32; // 1.25;
  public static DIM_ROW_COUNT = 11;
  public static DIM_ROW_HEIGHT = 299;

  // for desktop Info Dialog
  public static INFO_THUMB_WIDTH = Const.THUMB_WIDTH / 2;
  public static INFO_HDR_HEIGHT = 96;


  // Mobile Info Dialog thumbnail defaults
  public static MOBILE_THUMB_WIDTH = Const.THUMB_WIDTH / 2;
  public static MOBILE_THUMB_HEIGHT = 192; // 95
  public static MOBILE_FUDGE_FACTOR = 1;
  public static MOBILE_HDR_HEIGHT = 96;
  public static MOBILE_LEFT_MARGIN = 110; // 35

  // Various static values
  public static DEBUG_PUZZLE = false;
  public static DEBUG_FILE_UPLOAD = false;
  public static DEBUG_PORTAL_INFO = true;
  public static DEBUG_TRUSTMAN = false;
  public static DEBUG_PUZZLE_MAP_DIALOG = false;
  public static LAT_LNG_OTTAWA = { lat: 45.423502, lng: -75.691320};
  public static STATIC_LOCATION = 1;
  public static DYNAMIC_LOCATION = 2;
  public static IMAGE_FOLDER = 'https://g12mo.ca/pixr3/assets/puzzle_images/';

  public static ZOOM_POSTAGE_STAMP = 22;
  public static ZOOM_BACKYARD = 20;
  public static ZOOM_TO_PORTAL = 18;
  public static ZOOM_NEIGHBORHOOD = 15;
  public static ZOOM_VILLAGE = 14;
  public static ZOOM_CITY = 13;
  public static ZOOM_METROPOLIS = 12;
  public static ZOOM_COUNTY = 10;
  public static ZOOM_PROVINCE = 8;
  public static ZOOM_SMALL_COUNTRY = 6;
  public static ZOOM_COUNTRY = 5;
  public static ZOOM_CONTINENT = 4;
  public static ZOOM_HEMISPHERE = 3;
  public static ZOOM_WORLD = 2;

  public static SNACK_WAIT_VERY_LONG = 50000;
  public static SNACK_WAIT_LONG = 10000;
  public static SNACK_WAIT_SHORT = 5000;
  public static SNACK_WAIT_VERY_SHORT = 1000;
  public static WAIT_300 = 300;

  public static NUMBER_CODE = '#';
  public static LETTER_CODE = '*';
  public static GLYPH_CODE = 'keyword';

  public static LABEL_X = 14;
  public static LABEL_Y = 9;
  public static SCALE_W = 37.5;
  public static SCALE_H = 60;
  public static DISPLAY_THRESHOLD = 17;

  public static URL_SMURF_GIF = 'https://g12mo.ca/pixr3/assets/smurf.gif';
  public static URL_GREY_PIN = 'https://g12mo.ca/pixr3/assets/WhitePin.png';
  public static URL_GREEN_PIN = 'https://g12mo.ca/pixr3/assets/GreenPin.png';

  public static CIRCLE_FILL_1 = '#ff9c00';
  public static CIRCLE_STROKE_1 = '#704500';
  public static CIRCLE_FILL_2 = '#5889ee';
  public static CIRCLE_STROKE_2 = '#2d4472';

  public static Z_INDEX_100 = 100;
  public static Z_INDEX_200 = 200;

  public static CIRCLE_OPTIONS = {
    strokeColor: Const.CIRCLE_STROKE_1,
    strokeOpacity: 1,
    strokeWeight: 1,
    fillColor: Const.CIRCLE_FILL_1,
    fillOpacity: 0.20,
    zIndex: Const.Z_INDEX_100,
  };

  public static PEG_CIRCLE_OPTIONS = {
    strokeColor: Const.CIRCLE_STROKE_2,
    strokeOpacity: 1,
    strokeWeight: 1,
    fillColor: Const.CIRCLE_FILL_2,
    fillOpacity: 0.20,
    zIndex: Const.Z_INDEX_200,
  };
  public static RENDER_OPTIONS =
    { markerOptions: { visible: false },
      polylineOptions: { strokeColor: '#5889ee',
        strokeWeight: 6}
    };
}
