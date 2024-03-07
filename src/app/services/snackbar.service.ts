import { Injectable } from '@angular/core';
import {MatSnackBar, MatSnackBarConfig, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  verticalPositionTop: MatSnackBarVerticalPosition = 'top';
  verticalPositionBottom: MatSnackBarVerticalPosition = 'bottom';
  constructor(public snackBar: MatSnackBar) {

  }
  openSnackBarTop(message: string, action: string, duration: number): void {
    this.snackBar.open(message, action, {
      duration, verticalPosition: this.verticalPositionTop
    });
  }

  openSnackBarBottom(message: string, action: string, duration: number): void {
    this.snackBar.open(message, action, {
      duration, verticalPosition: this.verticalPositionBottom
    });
  }

}
