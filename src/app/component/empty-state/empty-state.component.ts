import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { getIconPath } from 'src/app/utils/Utils';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  encapsulation: ViewEncapsulation.None,
})
export class EmptyStateComponent {
  @Input() icon: string = 'checkmark-done-circle-outline';
  @Input() title: string = 'No hay elementos';
  @Input() subtitle: string = '';

  getIcon(icon: string) {
    return getIconPath(icon, 'assets/ionicons/bar-chart-outline.svg');
  }
}

