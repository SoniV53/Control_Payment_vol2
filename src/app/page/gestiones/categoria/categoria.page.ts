import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter } from '@ionic/angular/standalone';
import { BannerTopComponent } from "src/app/component/card/banner-top/banner-top.component";
import { BasePage } from '../../main/base/base.page';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.page.html',
  styleUrls: ['./categoria.page.scss'],
  standalone: true,
  imports: [IonFooter, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, BannerTopComponent]
})
export class CategoriaPage extends BasePage implements OnInit {
  toolBar = {
    title: "Categorías",
    description: "Aquí puedes administrar las categorías de tus gastos.",
  }

  ngOnInit() {
  }

}
