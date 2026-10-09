import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { getIconPath } from 'src/app/utils/Utils';

export interface CustomTab {
  id: string;
  label: string;
  icon: string;
  badgeCount?: number;
  badgeClass?: string; // ej. 'done'
}

@Component({
  selector: 'app-custom-tabs',
  templateUrl: './custom-tabs.component.html',
  styleUrls: ['./custom-tabs.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  encapsulation: ViewEncapsulation.None
})
export class CustomTabsComponent {
  @Input() tabs: CustomTab[] = [];
  @Input() selectedTabId: string = '';
  @Input() size: 'default' | 'small' = 'default';
  @Output() tabSelected = new EventEmitter<string>();

  getIcon(icon: string) {
    return getIconPath(icon, 'assets/ionicons/bar-chart-outline.svg');
  }

  selectTab(id: string) {
    this.selectedTabId = id;
    this.tabSelected.emit(id);
  }
}


