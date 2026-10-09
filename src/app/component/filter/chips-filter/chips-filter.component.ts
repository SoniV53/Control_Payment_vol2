import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChipItem {
  id: string;
  label: string;
}

@Component({
  selector: 'app-chips-filter',
  templateUrl: './chips-filter.component.html',
  styleUrls: ['./chips-filter.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ChipsFilterComponent {
  @Input() chips: ChipItem[] = [];
  @Input() activeChipId: string = '';
  @Output() chipChanged = new EventEmitter<string>();

  onChipClick(id: string) {
    this.activeChipId = id;
    this.chipChanged.emit(id);
  }
}
