import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, IonItem, IonIcon } from '@ionic/angular/standalone';
import { getIconPath } from 'src/app/utils/Utils';

@Component({
  selector: 'app-card-option',
  templateUrl: './card-option.component.html',
  styleUrls: ['./card-option.component.scss'],
  imports: [IonIcon, IonItem, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol,CommonModule],
})
export class CardOptionComponent implements OnInit {

  @Input() dataCard = {
    title: "",
    description: "",
    icon: ""
  }
  @Input() tipo: 'card'|'list' = 'card';

  constructor() { 
   // addIcons({arrowForwardOutline});
  }

  ngOnInit() { }

  getIcon() {
    return getIconPath(this.dataCard.icon,'assets/ionicons/bar-chart-outline.svg');
  }

}