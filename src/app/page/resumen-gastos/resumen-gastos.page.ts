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
import { ChipsFilterComponent } from 'src/app/component/filter/chips-filter/chips-filter.component';
import { EmptyStateComponent } from 'src/app/component/empty-state/empty-state.component';
@Component({
  selector: 'app-resumen-gastos',
  templateUrl: './resumen-gastos.page.html',
  styleUrls: ['./resumen-gastos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, BannerTopComponent, ChipsFilterComponent, EmptyStateComponent]
})
export class ResumenGastosPage extends BasePage {
  toolBar = { title: "Resumen de Pagos", description: "Detalle de cuotas y recurrentes" };
  
  // Filtros
  tabTipo: string = 'todos';
  chipList = [{ id: 'todos', label: 'Todos' }, { id: 'recurrente', label: 'Recurrentes' }, { id: 'cuota', label: 'Cuotas' }];
  textoBusqueda: string = '';
  categoriaSeleccionada: any = 'todas';
  categoriasActivas: any[] = [];

  fechaInicio: string = '';
  fechaFin: string = '';

  datosBrutos: any[] = [];
  datosFiltrados: any[] = [];

  totalGlobal: number = 0;
  isChartCollapsed: boolean = false;
  graficaDatos: any[] = [];
  coloresCategorias: string[] = ['#00d09c', '#ff4961', '#ffb400', '#007aff', '#a259ff', '#ff8a00', '#18cefb', '#f48fb1', '#81c784'];

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
    this.datosFiltrados = [];
    for (const originalItem of this.datosBrutos) {
      if (this.tabTipo !== 'todos' && originalItem.tipo !== this.tabTipo) continue;
      if (this.categoriaSeleccionada !== 'todas' && originalItem.categoria_id !== this.categoriaSeleccionada) continue;
      if (this.textoBusqueda.trim() !== '') {
        const busqueda = this.textoBusqueda.toLowerCase();
        if (!originalItem.titulo.toLowerCase().includes(busqueda) && !originalItem.categoria.toLowerCase().includes(busqueda)) {
          continue;
        }
      }

      // Deep copy to avoid mutating original
      let item = JSON.parse(JSON.stringify(originalItem));

      if (this.fechaInicio && this.fechaFin) {
        item.pagosDetalle = item.pagosDetalle.filter((p: any) => {
          if (!p.fecha) return false;
          const monthVal = p.fecha.substring(0, 7);
          return monthVal >= this.fechaInicio && monthVal <= this.fechaFin;
        });
        
        if (item.pagosDetalle.length === 0) continue;
        
        // Recalculate amounts based on filtered details
        item.montoTotal = item.pagosDetalle.reduce((sum: number, d: any) => sum + (d.monto || 0), 0);
        item.pagados = item.pagosDetalle.filter((d: any) => d.estado === 'pagado').length;
      }

      this.datosFiltrados.push(item);
    }
    this.generarGrafica();
  }

  generarGrafica() {
    this.totalGlobal = this.calcularTotal(this.datosFiltrados);
    const map = new Map<string, {monto: number, nombre: string}>();
    this.datosFiltrados.forEach(item => {
      if (!map.has(item.categoria)) {
        map.set(item.categoria, { monto: 0, nombre: item.categoria });
      }
      map.get(item.categoria)!.monto += item.montoTotal;
    });
    let index = 0;
    this.graficaDatos = Array.from(map.values())
      .filter(x => x.monto > 0)
      .sort((a, b) => b.monto - a.monto)
      .map(x => {
        const porcentaje = this.totalGlobal > 0 ? (x.monto / this.totalGlobal) * 100 : 0;
        const color = this.coloresCategorias[index % this.coloresCategorias.length];
        index++;
        return { ...x, porcentaje, color };
      });
  }

  calcularTotal(datos: any[]): number {
    return datos.reduce((sum, item) => sum + (item.montoTotal || 0), 0);
  }

  toggleChart() {
    this.isChartCollapsed = !this.isChartCollapsed;
  }

  toggleExpand(item: any) {
    item.expanded = !item.expanded;
  }
}










