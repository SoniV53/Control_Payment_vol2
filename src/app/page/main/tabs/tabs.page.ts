import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonTabs, IonIcon, IonTabBar, IonTabButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline,clipboardOutline, library, fileTrayStackedOutline, search, starOutline, addCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [IonTabButton, IonTabBar, IonIcon, IonTabs,CommonModule, FormsModule]
})
export class TabsPage implements OnInit {

  constructor() { 
    addIcons({homeOutline,addCircleOutline,clipboardOutline,fileTrayStackedOutline,starOutline,library,search});
  }

  ngOnInit() {
  }

}
