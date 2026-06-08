import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

import { BasePage } from '../main/base/base.page';
import { GastoServiceService } from 'src/app/services/gasto-service.service';
import { CategoriaServiceService } from 'src/app/services/categoria-service.service';
import { BannerTopComponent } from "src/app/component/card/banner-top/banner-top.component";
import { AppComponent } from 'src/app/app.component';
import { ControlGastosAutomaticosService } from 'src/app/services/control-gastos-automaticos.service';
import { NavCtrl } from 'src/app/services/nav-ctrl';

import { ResumenService } from 'src/app/services/resumen.service';

@Component({
  selector: 'app-resumen-gastos',
  templateUrl: './resumen-gastos.page.html',
  styleUrls: ['./resumen-gastos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, BannerTopComponent]
})
export class ResumenGastosPage extends BasePage {
  toolBar = { title: "Resumen de Pagos", description: "Detalle de cuotas y recurrentes" };
  
  // Filtros
  tabTipo: string = 'todos';
  textoBusqueda: string = '';
  categoriaSeleccionada: any = 'todas';
  categoriasActivas: any[] = [];

  // Datos
  datosBrutos: any[] = [];
  datosFiltrados: any[] = [];

  constructor(
    public override router: Router,
    public override myApp: AppComponent,
    public override gastoService: GastoServiceService,
    public override fb: FormBuilder,
    public override categoriaService: CategoriaServiceService,
    public override controlService: ControlGastosAutomaticosService,
    public override toastController: ToastController,
    public override navCtrl: NavCtrl,
    public override alertController: AlertController,
    private resumenService: ResumenService
  ) {
    super(router, myApp, gastoService, fb, categoriaService, controlService, toastController, navCtrl, alertController);
  }

  async ionViewWillEnter() {
    await this.cargarCategorias();
    await this.cargarResumen();
  }

  cargarCategorias() {
    return this.baseService(async () => {
      this.categoriasActivas = await this.categoriaService.getCategoriasActivas();
    });
  }

  cargarResumen() {
    return this.baseService(
      async () => {
        this.showLoader();
        this.datosBrutos = await this.resumenService.getResumenCompleto();
        this.aplicarFiltros();
      },
      async () => { this.getAlertError('Error cargando el resumen'); },
      async () => { this.dissmissLoader(); }
    );
  }

  aplicarFiltros() {
    this.datosFiltrados = this.datosBrutos.filter(item => {
      // Filtro Tipo
      if (this.tabTipo !== 'todos' && item.tipo !== this.tabTipo) return false;
      
      // Filtro Categoría
      if (this.categoriaSeleccionada !== 'todas' && item.categoria_id !== this.categoriaSeleccionada) return false;

      // Filtro Búsqueda
      if (this.textoBusqueda.trim() !== '') {
        const busqueda = this.textoBusqueda.toLowerCase();
        if (!item.titulo.toLowerCase().includes(busqueda) && !item.categoria.toLowerCase().includes(busqueda)) {
          return false;
        }
      }

      return true;
    });
  }

  toggleExpand(item: any) {
    item.expanded = !item.expanded;
  }
}