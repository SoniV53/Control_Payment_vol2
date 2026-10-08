import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { getIconPath } from 'src/app/utils/Utils';

@Component({
  selector: 'app-category-block',
  templateUrl: './category-block.component.html',
  styleUrls: ['./category-block.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  encapsulation: ViewEncapsulation.None,
})
export class CategoryBlockComponent {
  @Input() grupo: any;
  @Input() estado: 'progreso' | 'pagados' = 'progreso';

  @Output() clickItem = new EventEmitter<any>();
  @Output() editItem = new EventEmitter<any>();
  @Output() deleteItem = new EventEmitter<any>();

  getIcon(icon: string) {
    return getIconPath(icon, 'assets/ionicons/bar-chart-outline.svg');
  }

  abrirGestionCuotas(item: any) {
    this.clickItem.emit(item);
  }

  abrirEditarGasto(item: any, event: Event) {
    event.stopPropagation();
    this.editItem.emit(item);
  }

  eliminarGasto(item: any, event: Event) {
    event.stopPropagation();
    this.deleteItem.emit(item);
  }
}

