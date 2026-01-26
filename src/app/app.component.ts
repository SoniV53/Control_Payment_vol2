import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    this.toggleTheme(false)
  }

  toggleTheme(isDark: boolean) {
    const body = document.body;
    if (isDark) {
      body.classList.add('md');
    } else {
      body.classList.remove('md');
    }
  }
}
