import {Component} from '@angular/core';
import {AuthService} from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'pixr';

  constructor(public authService: AuthService) {
  }
  login(): void {
    this.authService.loginWithGoogle().then((user) => {
    });
  }
}
