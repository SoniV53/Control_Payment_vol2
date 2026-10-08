import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ModalTemplateComponent } from '../../modal/modal-template/modal-template.component';
import { getIconPath } from 'src/app/utils/Utils';

@Component({
  selector: 'app-modal-editar-recurrente',
  templateUrl: './modal-editar-recurrente.component.html',
  styleUrls: ['./modal-editar-recurrente.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ModalTemplateComponent],
  encapsulation: ViewEncapsulation.None
})
export class ModalEditarRecurrenteComponent {
  @Input() isOpen: boolean = false;
  @Input() editData: any = { titulo: '', monto: 0, aplicarAtodos: false };
  @Input() gastosHistoricos: any[] = [];
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() toggleAll = new EventEmitter<any>();
  @Output() editarGasto = new EventEmitter<any>();
  @Output() eliminarGasto = new EventEmitter<number>();
  @Output() restablecerGasto = new EventEmitter<any>();

  getIcon(icon: string) {
    return getIconPath(icon, 'assets/ionicons/bar-chart-outline.svg');
  }

  printStado(estado: number): string {
    return estado === 2 ? 'Eliminado' : estado === 1 ? 'Pagado' : 'Pendiente';
  }
}

