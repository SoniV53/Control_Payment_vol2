import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild('h1_id') h1Class: ElementRef | undefined;
  viewParr = false;


  constructor(private navCtrl: NavController) { }

  ngOnInit() {
    this.viewParr = this.toolBarData?.description != undefined && this.toolBarData?.description.trim().length > 0;
  }

  goBack() {
    this.navCtrl.back();
  }

}
