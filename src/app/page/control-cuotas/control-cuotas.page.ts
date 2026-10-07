import { Component, ViewEncapsulation } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

import { BasePage } from '../main/base/base.page';
import { GastoServiceService } from 'src/app/services/gasto-service.service';
import { CategoriaServiceService } from 'src/app/services/categoria-service.service';
import { BannerTopComponent } from "src/app/component/card/banner-top/banner-top.component";
import { InputSimpleComponent } from "src/app/component/input/input-simple/input-simple.component";
import { SelectorSimpleComponent } from "src/app/component/input/selector-simple/selector-simple.component";
import { AppComponent } from 'src/app/app.component';
import { ControlGastosAutomaticosService } from 'src/app/services/control-gastos-automaticos.service';
import { NavCtrl } from 'src/app/services/nav-ctrl';
import { CuotaServiceService } from 'src/app/services/cuota-service.service';

@Component({
  selector: 'app-control-cuotas',
  templateUrl: './control-cuotas.page.html',
  styleUrls: ['./control-cuotas.page.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, BannerTopComponent, InputSimpleComponent, SelectorSimpleComponent]
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

  countItems(grupos: any[]): number {
    return grupos.reduce((total: number, g: any) => total + g.items.length, 0);
  }

    categoriasMapped: any[] = [];

  async cargarCategorias() {
    await this.baseService(async () => {
      this.categoriasDisponibles = await this.categoriaService.getCategoriasActivas();
      this.categoriasMapped = this.categoriasDisponibles.map(c => ({ code: c.id, value: c.nombre, icon: c.icono }));
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

  async togglePagoCuota(c: any, e: any) {
    const nuevoEstado = e.detail.checked ? 1 : 0;
    const accion = nuevoEstado === 1 ? 'marcar como pagada' : 'desmarcar';

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Deseas ${accion} la Cuota #${c.numero_cuota}?`,
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            // Revertir el checkbox al estado anterior
            c.estado_cuota = nuevoEstado === 1 ? 0 : 1;
            // Forzar re-render
            this.detalleCuotas = [...this.detalleCuotas];
          }
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.baseService(async () => {
              await this.cuotaService.toggleEstadoCuota(c.id, nuevoEstado);
              c.estado_cuota = nuevoEstado;
              this.getAlertSuccess(nuevoEstado === 1 ? '✓ Cuota marcada como pagada' : 'Cuota desmarcada');
              this.cargarCuotas();
            });
          }
        }
      ]
    });
    await alert.present();
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
  showPopup = false;
  tipoModalUse = 'select';
  dataListaSelect: any[] = [];

  getCategoryName(id: any) {
    const cat = this.categoriasMapped.find(c => c.code === id);
    return cat ? cat.value : '';
  }

  getCategoryIcon(id: any) {
    const cat = this.categoriasMapped.find(c => c.code === id);
    return cat ? cat.icon : '';
  }

  onClickItemAction() {
    this.showPopup = true;
    this.tipoModalUse = 'select';
    this.dataListaSelect = this.categoriasMapped;
  }

  closePopupClick() {
    this.showPopup = false;
  }

  onClickItem(item: any) {
    this.showPopup = false;
    this.editData.categoria_id = item.code;
  }

  goToNuevaCategoria() {
    this.showPopup = false;
    setTimeout(() => {
      this.router.navigateByUrl('/categoria');
    }, 150);
  }
}


