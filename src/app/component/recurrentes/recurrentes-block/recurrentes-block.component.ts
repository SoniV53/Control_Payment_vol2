import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { getIconPath } from 'src/app/utils/Utils';

@Component({
  selector: 'app-recurrentes-block',
  templateUrl: './recurrentes-block.component.html',
  styleUrls: ['./recurrentes-block.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  encapsulation: ViewEncapsulation.None
})
export class RecurrentesBlockComponent {
  @Input() grupo: any;
  @Output() toggleActivo = new EventEmitter<{ item: any, event: any }>();
  @Output() editarRecurrente = new EventEmitter<any>();

  getIcon(icon: string) {
    return getIconPath(icon, 'assets/ionicons/bar-chart-outline.svg');
  }

  onToggle(item: any, event: any) {
    this.toggleActivo.emit({ item, event });
  }

  onEdit(item: any) {
    this.editarRecurrente.emit(item);
  }
}

