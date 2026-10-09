import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { getIconPath } from 'src/app/utils/Utils';

@Component({
  selector: 'app-modal-template',
  templateUrl: './modal-template.component.html',
  styleUrls: ['./modal-template.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  encapsulation: ViewEncapsulation.None
})
export class ModalTemplateComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() customClass: string = 'detail-modal bottom-sheet';
  @Input() initialBreakpoint?: number = 0.75;
  @Input() breakpoints?: number[] = [0, 0.75, 1];
  @Input() bgColor: string = '#121212';
  
  @Output() closeModal = new EventEmitter<void>();

  dismiss() {
    this.isOpen = false;
    this.closeModal.emit();
  }

  getIcon(icon: string) {
    return getIconPath(icon, 'assets/ionicons/bar-chart-outline.svg');
  }
}



