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
import { CategoryBlockComponent } from 'src/app/component/cuotas/category-block/category-block.component';
import { EmptyStateComponent } from 'src/app/component/empty-state/empty-state.component';
import { ModalDetalleCuotasComponent } from 'src/app/component/cuotas/modal-detalle-cuotas/modal-detalle-cuotas.component';
import { SelectorModalComponent } from 'src/app/component/input/selector-modal/selector-modal.component';
import { ModalEditarCuotaComponent } from 'src/app/component/cuotas/modal-editar-cuota/modal-editar-cuota.component';
import { CustomTabsComponent } from 'src/app/component/custom-tabs/custom-tabs.component';

@Component({
  selector: 'app-control-cuotas',
  templateUrl: './control-cuotas.page.html',
  styleUrls: ['./control-cuotas.page.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, BannerTopComponent, InputSimpleComponent, SelectorSimpleComponent, CategoryBlockComponent, EmptyStateComponent, ModalDetalleCuotasComponent, SelectorModalComponent, ModalEditarCuotaComponent, CustomTabsComponent]
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

  misTabs: any[] = [];

  actualizarTabs() {
    this.misTabs = [
      { id: 'progreso', label: 'En Progreso', icon: 'hourglass-outline', badgeCount: this.countItems(this.gruposProgreso) },
      { id: 'pagados', label: 'Pagados', icon: 'checkmark-done-outline', badgeCount: this.countItems(this.gruposPagados), badgeClass: 'done' }
    ];
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

        this.actualizarTabs();
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

  manejarConfirmacionToggle(event: {cuota: any, nuevoEstado: number}) {
    const { cuota, nuevoEstado } = event;
    this.baseService(async () => {
      this.showLoader();
      await this.cuotaService.toggleEstadoCuota(cuota.id, nuevoEstado);
      cuota.estado_cuota = nuevoEstado;
      this.getAlertSuccess(nuevoEstado === 1 ? '✓ Cuota marcada como pagada' : 'Cuota desmarcada');
      this.cargarCuotas();
      this.dissmissLoader();
    });
  }

  listaFormularioEditar: any[] = [];

    modoMonto: string = 'mensual';

    abrirEditarGasto(gasto: any) {
      this.gastoSeleccionado = gasto;
      this.modoMonto = 'mensual';
      
      const montoMensual = gasto.cuotas && gasto.cuotas > 0 ? (gasto.monto / gasto.cuotas) : gasto.monto;
      
      this.listaFormularioEditar = [
        { id: 'titulo', titulo: 'Título', placeholder: 'Ingrese el título', tipo: 'text', required: true, valueSelect: gasto.titulo },
        { id: 'monto', titulo: 'Monto Mensual (GTQ)', placeholder: '0.00', tipo: 'number', required: true, valueSelect: montoMensual },
        { id: 'cuotas', titulo: 'Total de Cuotas', placeholder: '0', tipo: 'number', required: true, valueSelect: gasto.cuotas },
        { id: 'categoria', titulo: 'Categoría', placeholder: 'Selecciona categoría', tipo: 'select', required: true, valueSelect: gasto.categoria_id, list: this.categoriasMapped },
        { id: 'montoCalculado', titulo: 'Monto Total Calculado (GTQ)', placeholder: '', tipo: 'read', required: false, valueSelect: gasto.monto }
      ];

      this.isEditModalOpen = true;
    }

    recalcularMonto() {
      const montoField = this.listaFormularioEditar.find(f => f.id === 'monto');
      const calculadoField = this.listaFormularioEditar.find(f => f.id === 'montoCalculado');
      const cuotasField = this.listaFormularioEditar.find(f => f.id === 'cuotas');
      
      if(montoField && calculadoField && cuotasField) {
         const currentInput = Number(montoField.valueSelect) || 0;
         const cuotas = Number(cuotasField.valueSelect) || 1;
         
         if (this.modoMonto === 'total') {
            montoField.titulo = 'Monto Total (GTQ)';
            calculadoField.titulo = 'Monto Mensual Calculado (GTQ)';
            montoField.valueSelect = currentInput * cuotas;
            calculadoField.valueSelect = currentInput;
         } else {
            montoField.titulo = 'Monto Mensual (GTQ)';
            calculadoField.titulo = 'Monto Total Calculado (GTQ)';
            montoField.valueSelect = currentInput / cuotas;
            calculadoField.valueSelect = currentInput;
         }
      }
    }

    onFormChange(event: any) {
      if (event && (event.id === 'monto' || event.id === 'cuotas')) {
        const montoField = this.listaFormularioEditar.find(f => f.id === 'monto');
        const calculadoField = this.listaFormularioEditar.find(f => f.id === 'montoCalculado');
        const cuotasField = this.listaFormularioEditar.find(f => f.id === 'cuotas');
        
        if(montoField && calculadoField && cuotasField) {
           const currentInput = Number(montoField.valueSelect) || 0;
           const cuotas = Number(cuotasField.valueSelect) || 1;
           
           if (this.modoMonto === 'total') {
              calculadoField.valueSelect = currentInput / cuotas;
           } else {
              calculadoField.valueSelect = currentInput * cuotas;
           }
        }
      }
    }

  manejarAccionFormularioEditar(event: any) {
    if (event.action === 'select-action') {
      this.isEditModalOpen = false;
      this.goToNuevaCategoria();
    }
  }

    guardarEdicion() {
      let montoTotalFinal = 0;
      const montoField = this.listaFormularioEditar.find(f => f.id === 'monto')?.valueSelect || 0;
      const cuotas = this.listaFormularioEditar.find(f => f.id === 'cuotas')?.valueSelect || 1;
      
      if (this.modoMonto === 'total') {
         montoTotalFinal = Number(montoField);
      } else {
         montoTotalFinal = Number(montoField) * Number(cuotas);
      }

      this.editData = {
        titulo: this.listaFormularioEditar.find(f => f.id === 'titulo')?.valueSelect || '',
        monto: montoTotalFinal,
        cuotas: cuotas,
        categoria_id: this.listaFormularioEditar.find(f => f.id === 'categoria')?.valueSelect || 0
      };

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




