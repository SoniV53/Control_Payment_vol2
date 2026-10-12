import { Component, Input } from '@angular/core';
import { IonIcon, IonLabel } from "@ionic/angular/standalone";
import { getIconPath } from 'src/app/utils/Utils';

@Component({
  selector: 'empty-base',
  templateUrl: './empty-base.component.html',
  styleUrls: ['./empty-base.component.scss'],
  imports: [IonLabel, IonIcon],
})
export class EmptyBaseComponent {
  @Input() dataCard = {
    title: "",
    description: "",
    icon: ""
  }
  @Input() fontSize: string = '100px';
  @Input() color: string = 'white';
  @Input() tipo: 'card' | 'list' = 'card';

  constructor() { }

  getIcon() {
    return getIconPath(this.dataCard.icon, 'assets/ionicons/bar-chart-outline.svg');
  }
}
