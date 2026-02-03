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
  idCategoria: number = 0;

  formCat: ItemInputData = { id: 'categoria', titulo: '', isError: false, placeholder: 'Nombre Categoria', tipo: 'text', required: false, icon: "" };

  listCategoria: Categoria[] = []

  listSim: any[] = getListIconCategoria()

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.disableButton();
    this.updateTitle();

    this.getCategorias();
  }


  getCategorias() {
    this.baseService(async () => {
      this.listCategoria = await this.categoriaService.getCategoriasActivas();
      console.log('categorias cargados:', this.listCategoria);
    }, async () => {
      this.getAlertError('No se pudieron cargar.');
    });
  }

  onItemCategoria(categoria: Categoria) {
    this.formCat.valueSelect = categoria.nombre;
    this.formCat.icon = categoria.icono;
    this.isUpdate = true;
    this.idCategoria = categoria.id || 0;
    this.updateTitle()
  }

  saveNewCategory() {
    this.baseService(async () => {
      const data: Categoria = {
        icono: this.formCat.icon,
        nombre: this.formCat.valueSelect
      };
      if (this.isUpdate && this.idCategoria > 0) {
        data.id = this.idCategoria;
        data.activo = 1;
        await this.categoriaService.updateCategoria(data);

        const cate = this.listCategoria.find(res => res.id === data.id);
        if (cate) {
          cate.nombre = data.nombre;
          cate.icono = data.icono;
        }

      } else {
        const id = await this.categoriaService.addCategoria(data);
        data.id = id;
        this.listCategoria.push(data);
      }


      console.log('Se Agrego correctamente:', this.listCategoria);
      this.resetData();
      //this.getCategorias();
    }, async () => {
      this.getAlertError('Paso algo inesperado');
    });
  }

  ionChangeInput(form: ItemInputData) {
    this.disableButton();
  }

  updateTitle() {
    this.tituloBotton = this.isUpdate ? "Actualizar" : "Agregar"
  }

  resetData() {
    this.formCat.valueSelect = '';
    this.formCat.icon = '';
    this.isUpdate = false;
    this.idCategoria = 0;

    this.updateTitle();
    this.disableButton();
  }

  disableButton() {
    this.disabledButton = !this.formCat.valueSelect || this.formCat.icon === 'file-tray-outline' || !this.formCat.icon
  }

  clickDateModal() {
    this.showPopup = true;
  }

  closePopupClick() {
    this.showPopup = false;
    this.disableButton()
  }

  onSimbolCLick(sim: string) {
    this.formCat.icon = sim;
    this.closePopupClick();
  }
}
