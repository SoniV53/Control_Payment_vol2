import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonHeader, IonItem } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-banner-top',
  templateUrl: './banner-top.component.html',
  styleUrls: ['./banner-top.component.scss'],
  imports: [CommonModule, IonHeader, IonItem,],
})
export class BannerTopComponent implements OnInit {
  @Input() toolBarData = {
    title: "",
    description: ""
  }

  @Output() onActionTitle:EventEmitter<any> = new EventEmitter<any>(); 

  @ViewChild('h1_id') h1Class: ElementRef | undefined;
  viewParr = false;


  constructor(private navCtrl: NavController) { }

  ngOnInit() {
    this.viewParr = this.toolBarData?.description != undefined && this.toolBarData?.description.trim().length > 0;
  }

  goBack() {
    this.navCtrl.back();
  }

  actionTitle() {
    this.onActionTitle.emit();
  }

}
