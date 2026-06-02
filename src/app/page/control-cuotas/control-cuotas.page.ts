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
import { CuotaServiceService } from 'src/app/services/cuota-service.service';

@Component({
  selector: 'app-control-cuotas',
  templateUrl: './control-cuotas.page.html',
  styleUrls: ['./control-cuotas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, BannerTopComponent]
})
export class ControlCuotasPage extends BasePage {
  toolBar = { title: "Control de Cuotas", description: "Administra tus cuotas." };
  
  // Variables de segmento
  tabEstado = 'progreso';
  gruposProgreso: any[] = [];
  gruposPagados: any[] = [];
  
  // Detalle Modal
  isModalOpen = false;
  detalleCuotas: any[] = [];
  
  // Edición Bottom Sheet
  isEditModalOpen = false;
  gastoSeleccionado: any = null;
  categoriasDisponibles: any[] = [];
  editData = { titulo: '', monto: 0, cuotas: 1, categoria_id: 0 };

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
    private cuotaService: CuotaServiceService
  ) {
    super(router, myApp, gastoService, fb, categoriaService, controlService, toastController, navCtrl, alertController);
  }

  async ionViewWillEnter() { 
    await this.cargarCategorias();
    await this.cargarCuotas(); 
  }

  clickSegment() {
    // Evento disparado al cambiar de pestaña
    console.log("Pestaña cambiada a:", this.tabEstado);
  }

  async cargarCategorias() {
    await this.baseService(async () => {
      this.categoriasDisponibles = await this.categoriaService.getCategoriasActivas();
    });
  }

  async cargarCuotas() {
    await this.baseService(
      async () => {
        this.showLoader();
        const data = await this.cuotaService.getCuotasConProgreso();

        const gruposMap = data.reduce((acc: any, cur: any) => {
          const cat = cur.cat_nombre || 'Sin Categoría';
          if (!acc[cat]) acc[cat] = { nombre: cat, icono: cur.cat_icono, items: [] };
          acc[cat].items.push(cur);
          return acc;
        }, {});

        const allGroups = Object.values(gruposMap);

        // Separar directamente en dos listas para las vistas del segmento
        this.gruposProgreso = allGroups.map((g: any) => ({
          ...g,
          items: g.items.filter((i: any) => i.pagadas < i.cuotas)
        })).filter((g: any) => g.items.length > 0);

        this.gruposPagados = allGroups.map((g: any) => ({
          ...g,
          items: g.items.filter((i: any) => i.pagadas >= i.cuotas)
        })).filter((g: any) => g.items.length > 0);
      },
      async () => { this.getAlertError('No se pudieron cargar las cuotas.'); },
      async () => { this.dissmissLoader(); }
    );
  }

  eliminarGasto(gasto: any) {
    this.modalDelete(async () => {
      this.baseService(
        async () => {
          this.showLoader();
          await this.cuotaService.eliminarGastoCuotaCompleto(gasto.id);
          this.cargarCuotas();
          this.getAlertSuccess("Eliminado correctamente");
        },
        async () => { this.getAlertError('Error al eliminar la cuota.'); },
        async () => { this.dissmissLoader(); }
      );
    });
  }

  abrirGestionCuotas(gasto: any) {
    this.baseService(
      async () => {
        this.showLoader();
        this.gastoSeleccionado = gasto;
        this.detalleCuotas = await this.cuotaService.obtenerOCrearDetalleCuotas(gasto);
        this.isModalOpen = true;
      },
      async () => { this.getAlertError('Error al cargar detalle de cuotas'); },
      async () => { this.dissmissLoader(); }
    );
  }

  togglePagoCuota(c: any, e: any) {
    this.baseService(async () => {
      const estado = e.detail.checked ? 1 : 0;
      await this.cuotaService.toggleEstadoCuota(c.id, estado);
      this.cargarCuotas();
    });
  }

  abrirEditarGasto(gasto: any) {
    this.gastoSeleccionado = gasto;
    this.editData = {
      titulo: gasto.titulo,
      monto: gasto.monto,
      cuotas: gasto.cuotas,
      categoria_id: gasto.categoria_id
    };
    this.isEditModalOpen = true;
  }

  guardarEdicion() {
    this.baseService(
      async () => {
        this.showLoader();
        await this.cuotaService.actualizarGastoYCuotas(this.gastoSeleccionado, this.editData);
        this.getAlertSuccess("Cuota actualizada");
        this.isEditModalOpen = false;
        this.cargarCuotas();
      },
      async () => { this.getAlertError('Error al actualizar las cuotas.'); },
      async () => { this.dissmissLoader(); }
    );
  }
}