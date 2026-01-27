import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-modal-base',
  templateUrl: './modal-base.component.html',
  styleUrls: ['./modal-base.component.scss'],
  standalone: false,
})
export class ModalBaseComponent implements OnInit, OnChanges {
  @Input() showPopup: boolean = false;
  @Input() isButtonClsHidden: boolean = false;
  @Input() sheetBottom: boolean = false;
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
