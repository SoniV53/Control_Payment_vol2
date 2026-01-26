import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, } from '@ionic/angular/standalone';
import { BannerTopComponent } from "../../../component/card/banner-top/banner-top.component";

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, BannerTopComponent]
})
export class CategoryPage implements OnInit {
  toolBar = {
    title: "Crea Etiquetas o Categorias",
    description: "Puedes crear diferentes filtros para, tu busqueda ya sea por categoria o una etiqueta"
  }

  constructor() { }

  ngOnInit() {
  }

}
