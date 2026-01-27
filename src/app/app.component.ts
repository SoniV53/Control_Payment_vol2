import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  dateToday = '';
  constructor() {
    this.toggleTheme(false)

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    this.dateToday = `${year}-${month}-${day}`;
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
