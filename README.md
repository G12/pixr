# Pixr

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Setup steps

### set up Angular Fire

`ng add @angular/fire`

paste firebase credentials into environment files


add the following to the imports in app.module.ts

`
AngularFireModule.initializeApp(environment.firebaseConfig)
`
### set up Angular Material

`ng add @angular/material`

paste a copy of material.module.ts to the app dir

add: `MaterialModule` to imports in app.module.ts

For google maps get the type library
npm install --save @types/googlemaps

in index.html just below <app-root></app-root> add
  <script src="http://maps.googleapis.com/maps/api/js?key=APIKEY"></script>

in map.component.ts add import {} from 'googlemaps';

add a file index.d.ts containing the line: declare module 'googlemaps';


## NOTEs

NOTE NOTE NOTE NOTE
AFTER CODE REFORMAT this import will be removed: import {} from 'googlemaps';
END NOTE

added:
    "enableIvy": false
to tsconfig.json TODO nead to research the effects of not using Ivy
Apparently Ivy is new packaging tool to optimize deployement package for size efficiency ...

// to set <base href="pixr"> build as follows
ng b --prod --base-href pixr

Need to add dialog components to entry components
entryComponents: [PortalInfoDialogComponent],
