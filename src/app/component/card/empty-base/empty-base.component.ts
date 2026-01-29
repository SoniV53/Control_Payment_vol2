import { Component, Input, OnInit } from '@angular/core';
import { IonIcon, IonItem, IonCardTitle, IonLabel } from "@ionic/angular/standalone";
import { getIconPath } from 'src/app/utils/Utils';

@Component({
  selector: 'empty-base',
  templateUrl: './empty-base.component.html',
  styleUrls: ['./empty-base.component.scss'],
  imports: [IonLabel, IonCardTitle, IonItem, IonIcon],
})
export class EmptyBaseComponent implements OnInit {
  @Input() dataCard = {
    title: "",
    description: "",
    icon: ""
  }
  @Input() fontSize: string = '100px';
  @Input() color: string = 'white';
  @Input() tipo: 'card' | 'list' = 'card';

  constructor() { }

  ngOnInit() { }

  getIcon() {
    return getIconPath(this.dataCard.icon, 'assets/ionicons/bar-chart-outline.svg');
  }
}
