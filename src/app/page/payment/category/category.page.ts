import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonSegmentButton, IonSegment, IonLabel, IonHeader, IonToolbar, IonFooter } from '@ionic/angular/standalone';
import { BannerTopComponent } from "../../../component/card/banner-top/banner-top.component";
import { IonicModule } from "@ionic/angular";
import { BasePage } from '../../main/base/base.page';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
  standalone: true,
  imports: [IonSegmentButton, IonContent, CommonModule, FormsModule, BannerTopComponent, IonSegment, IonLabel, IonHeader, IonToolbar, IonFooter]
})
export class CategoryPage extends BasePage implements OnInit {
  toolBar = {
    title: "Crea Etiquetas o Categorias",
    description: "Puedes crear diferentes filtros para, tu busqueda ya sea por categoria o una etiqueta"
  }

  ngOnInit() {
    const gasto = this.gastoService.getAllGastos();
    console.log('Gastos cargados:', gasto);
  }

}
