import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonItem, IonIcon, IonButton, IonLabel, IonCol, IonGrid, IonRow, IonDatetime } from '@ionic/angular/standalone';
import { BannerTopComponent } from "src/app/component/card/banner-top/banner-top.component";
import { BasePage } from '../../main/base/base.page';
import { EmptyBaseComponent } from "src/app/component/card/empty-base/empty-base.component";
import { InputSimpleComponent } from "src/app/component/input/input-simple/input-simple.component";
import { getIconPath } from 'src/app/utils/Utils';
import { Categoria } from 'src/app/core/models/categoria.model';
import { ItemInputData } from 'src/app/models/ItemInputData.model';
import { ModalBaseComponent } from "src/app/component/modal-base/modal-base.component";
import { getListIconCategoria } from 'src/app/utils/IconosList';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.page.html',
  styleUrls: ['./categoria.page.scss'],
  standalone: true,
  imports: [IonDatetime, IonRow, IonGrid, IonLabel, IonButton, IonIcon, IonItem, IonFooter, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, BannerTopComponent, EmptyBaseComponent, InputSimpleComponent, IonCol, ModalBaseComponent]
})
export class CategoriaPage extends BasePage implements OnInit {
  toolBar = {
    title: "Categorías",
    description: "Aquí puedes administrar las categorías de tus gastos.",
  }

  disabledButton: boolean = true;
  showPopup: boolean = false;

  dataCard = {
    title: "No Hay Categorias",
    description: "",
    icon: "file-tray-outline"
  }

  tituloBotton: string = "Agregar"
  isUpdate: boolean = false

  formCat: ItemInputData = { id: 'categoria', titulo: '', isError: false, placeholder: 'Nombre Categoria', tipo: 'text', required: false, icon: "" };

  listCategoria: Categoria[] = [
    { nombre: "Comida ajskdgahsdfhasdhfgajhsgdahgsfdg", icono: "file-tray-outline" },
    { nombre: "Comida", icono: "barbell-outline" },
    { nombre: "Comida", icono: "file-tray-outline" },
    { nombre: "Comida", icono: "file-tray-outline" },
    { nombre: "Comida", icono: "file-tray-outline" },
    { nombre: "Comida", icono: "file-tray-outline" },
  ]

  listSim:any[] = getListIconCategoria()

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.disableButton();
    this.updateTitle();
  }


  getIcon(icon: string) {
    return getIconPath(icon, 'assets/ionicons/file-tray-outline.svg');
  }

  onItemCategoria(categoria: Categoria) {
    this.formCat.valueSelect = categoria.nombre;
    this.formCat.icon = categoria.icono;
    this.isUpdate = true;
    this.updateTitle()
  }

  saveNewCategory() {


  }

  ionChangeInput(form: ItemInputData) {
    this.disableButton();
  }

  updateTitle() {
    this.tituloBotton = this.isUpdate ? "Actualizar" : "Agregar"
  }

  disableButton() {
    this.disabledButton = !this.formCat.valueSelect || this.formCat.icon === 'file-tray-outline'
  }

  clickDateModal() {
    this.showPopup = true;
  }

  closePopupClick() {
    this.showPopup = false;
    this.disableButton()
  }

  onSimbolCLick(sim:string){
    this.formCat.icon = sim;
    this.closePopupClick(); 
  }
}
