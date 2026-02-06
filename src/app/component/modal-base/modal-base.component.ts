import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { IonContent, IonIcon } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-base',
  templateUrl: './modal-base.component.html',
  styleUrls: ['./modal-base.component.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, CommonModule]
})
export class ModalBaseComponent implements OnInit, OnChanges {
  @Input() showPopup: boolean = false;
  @Input() isButtonClsHidden: boolean = true;
  @Input() sheetBottom: boolean = true;
  @Output() closePopupClick = new EventEmitter<void>();

  constructor() {
    addIcons({ closeOutline });
  }


  ngOnChanges(changes: SimpleChanges): void {
    console.log('Changes in ModalBaseComponent:', this.showPopup);
  }

  closePopup() {
    this.showPopup = false;
    this.closePopupClick.emit();
  }




  ngOnInit() { }

}
