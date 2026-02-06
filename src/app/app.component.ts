import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon } from '@ionic/angular/standalone';
import { updateParams } from './utils/update-params';
import { addIcons } from 'ionicons';
import { addCircleOutline, clipboardOutline, fileTrayStackedOutline, homeOutline, library, search, starOutline } from 'ionicons/icons';
import { NavCtrl } from './services/nav-ctrl';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonIcon, IonTabButton, IonTabBar, IonTabs, IonApp, IonRouterOutlet],
})
export class AppComponent {
  dateToday = '';
  dateSelected = '';

  writterParams = updateParams();

  constructor(public navCtrl: NavCtrl) {
    this.toggleTheme(false)

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    this.dateToday = `${year}-${month}-${day}`;

    const nombre = localStorage.getItem('date');
    this.dateSelected = !nombre ? this.dateToday : nombre;

    localStorage.setItem('date', this.dateSelected);
    addIcons({ homeOutline, addCircleOutline, clipboardOutline, fileTrayStackedOutline, starOutline, library, search });

  }

  toggleTheme(isDark: boolean) {
    const body = document.body;
    if (isDark) {
      body.classList.add('md');
    } else {
      body.classList.remove('md');
    }
  }

  getDateSelected() {
    const nombre = localStorage.getItem('date');
    if (nombre) {
      this.dateSelected = nombre;
    }
    return this.dateSelected;
  }

  setDateSelected(date: string) {
    this.dateSelected = date;
    localStorage.setItem('date', date);
  }

  getFragmentDate(): string[] {
    const selected = new Date(this.dateSelected);
    const year = selected.getFullYear().toString();
    const month = String(selected.getMonth() + 1).padStart(2, '0');
    const day = String(selected.getDate()).padStart(2, '0');

    return [year, month, day];
  }

  tabNavegation(nav:string){
    this.navCtrl.setRoot(nav);
  }
}
