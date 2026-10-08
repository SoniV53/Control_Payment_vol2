import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms';
import { IonContent, IonInput, IonHeader, IonToolbar, IonSegment, IonSegmentButton, IonLabel, IonSegmentView, IonSegmentContent } from '@ionic/angular/standalone';
import { BannerTopComponent } from "../../../component/card/banner-top/banner-top.component";
import { BasePage } from '../../main/base/base.page';
import { GastoRecurrente } from 'src/app/core/models/gasto_recurrente.model';
import { Categoria } from 'src/app/core/models/categoria.model';
import { CategoryPaymentComponent } from "src/app/component/category-payment/category-payment.component";
import { Gasto } from 'src/app/core/models/gasto.model';
import { CatalogoTipoGasto } from 'src/app/utils/Utils';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { GastoServiceService } from 'src/app/services/gasto-service.service';
import { CategoriaServiceService } from 'src/app/services/categoria-service.service';
import { ControlGastosAutomaticosService } from 'src/app/services/control-gastos-automaticos.service';
import { NavCtrl } from 'src/app/services/nav-ctrl';
import { CuotaServiceService } from 'src/app/services/cuota-service.service';
import { DatabaseServiceService } from 'src/app/core/database/database-service.service';

// Custom Components
import { CustomTabsComponent } from 'src/app/component/custom-tabs/custom-tabs.component';
import { EmptyStateComponent } from 'src/app/component/empty-state/empty-state.component';
import { RecurrentesBlockComponent } from 'src/app/component/recurrentes/recurrentes-block/recurrentes-block.component';
import { CategoryBlockComponent } from 'src/app/component/cuotas/category-block/category-block.component';
import { ModalDetalleCuotasComponent } from 'src/app/component/cuotas/modal-detalle-cuotas/modal-detalle-cuotas.component';
import { ModalEditarCuotaComponent } from 'src/app/component/cuotas/modal-editar-cuota/modal-editar-cuota.component';
import { ModalEditarRecurrenteComponent } from 'src/app/component/recurrentes/modal-editar-recurrente/modal-editar-recurrente.component';

@Component({
  selector: 'app-add-payment',
  templateUrl: './add-payment.page.html',
  styleUrls: ['./add-payment.page.scss'],
  standalone: true,
  imports: [
    IonicModule, CommonModule, FormsModule, BannerTopComponent, CategoryPaymentComponent,
    CustomTabsComponent, EmptyStateComponent, RecurrentesBlockComponent, CategoryBlockComponent,
    ModalDetalleCuotasComponent, ModalEditarCuotaComponent, ModalEditarRecurrenteComponent
  ]
})
export class AddPaymentPage extends BasePage implements OnInit {
  toolBar = {
    title: "Gastos Automaticos",
    description: "Administra tus gastos recurrentes y cuotas."
  }

  listadoGastosRecurrentes: GastoRecurrente[] = [];
  listCategoria: Categoria[] = [];
  gruposProgreso: any[] = [];
  gruposRecurrentes: any[] = [];

  // Tabs
  tabEstado = 'recurrente';
  misTabs: any[] = [];

  // Modals Data
  isEditModalOpen = false;
  gastoSeleccionado: any = null;
  editData = { titulo: '', monto: 0, cuotas: 1, categoria_id: 0 };
  isModalOpen = false;
  detalleCuotas: any[] = [];
  listaFormularioEditar: any[] = [];
  categoriasMapped: any[] = [];

  // Lógica para el modal de Recurrentes
  isModalRecurrenteOpen = false;
  recurrenteSeleccionado: any = null;
  editDataRec = { titulo: '', monto: 0, aplicarAtodos: false };
  gastosHistoricos: any[] = [];

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
    private cuotaService: CuotaServiceService,
    private dbService: DatabaseServiceService
  ) {
    super(router, myApp, gastoService, fb, categoriaService, controlService, toastController, navCtrl, alertController);
  }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    await this.getCategorias()
    await this.getRecurrentes();
    await this.cargarCuotas();
  }

  actualizarTabs() {
    const sumRecurrentes = this.gruposRecurrentes.reduce((acc, g) => acc + g.totalCantidad, 0);
    const sumCuotas = this.gruposProgreso.reduce((acc, g) => acc + g.items.length, 0);

    this.misTabs = [
      { id: 'recurrente', label: 'Recurrentes', icon: 'sync-outline', badgeCount: sumRecurrentes },
      { id: 'cuota', label: 'Cuotas', icon: 'wallet-outline', badgeCount: sumCuotas }
    ];
  }

  getCategorias() {
    return this.baseService(async () => {
      this.listCategoria = await this.categoriaService.getCategoriasActivas();
      this.categoriasMapped = this.listCategoria.map(c => ({ code: c.id, value: c.nombre, icon: c.icono }));
    }, async () => {
      this.getAlertError('No se pudieron cargar.');
    }, async () => {
      this.dissmissLoader();
    });
  }

  getRecurrentes() {
    return this.baseService(async () => {
      this.showLoader()
      this.listadoGastosRecurrentes = await this.gastoService.getGastosRecurrentes();

      for (let item of this.listCategoria) {
        const listaB = this.listadoGastosRecurrentes.filter(res => res.categoria_id == item.id).map(this.modelAToModelB);
        if (listaB) {
          item.dataGasto = listaB;
        }
      }

      this.gruposRecurrentes = this.listCategoria
        .filter(c => c.dataGasto && c.dataGasto.length > 0)
        .map(c => ({
          categoria: { icono: c.icono, nombre: c.nombre },
          totalCantidad: c.dataGasto!.length,
          totalMonto: c.dataGasto!.reduce((sum, g) => sum + (g.monto || 0), 0),
          recurrentes: c.dataGasto
        }));
      
      this.actualizarTabs();

    }, async () => {
      this.getAlertError('No se pudieron cargar.');
    }, async () => {
      this.dissmissLoader();
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

        this.gruposProgreso = allGroups.map((g: any) => ({
          ...g,
          items: g.items.filter((i: any) => i.pagadas < i.cuotas)
        })).filter((g: any) => g.items.length > 0);

        this.actualizarTabs();

      },
      async () => { this.getAlertError('No se pudieron cargar las cuotas.'); },
      async () => { this.dissmissLoader(); }
    );
  }

  // --- Lógica Recurrentes ---
  async clickItemRecurrente(item: any) {
    this.recurrenteSeleccionado = item;
    this.editDataRec.titulo = item.titulo || '';
    this.editDataRec.monto = item.monto || 0;
    this.editDataRec.aplicarAtodos = false;
    this.isModalRecurrenteOpen = true;

    await this.obtenerHistorialGastos(item.id);
  }

  async obtenerHistorialGastos(recurrenteId: number | undefined) {
    try {
      const db = await this.dbService.getDB();
      const res = await db.query(
        'SELECT * FROM gasto WHERE recurrente_id = ? ORDER BY fecha DESC',
        [recurrenteId]
      );
      this.gastosHistoricos = res.values || [];
    } catch (error) {
      this.getAlertError(error);
    }
  }

  toggleAllHistorial(event: any) {
    this.editDataRec.aplicarAtodos = event.detail.checked;
  }

  async guardarEdicionRecurrente() {
    if (!this.recurrenteSeleccionado) return;

    this.showLoader();
    try {
      const db = await this.dbService.getDB();

      await db.run(
        'UPDATE gasto_recurrente SET titulo = ?, monto = ? WHERE id = ?',
        [this.editDataRec.titulo, this.editDataRec.monto, this.recurrenteSeleccionado.id]
      );

      if (this.editDataRec.aplicarAtodos) {
        for (const gasto of this.gastosHistoricos) {
          await db.run(
            'UPDATE gasto SET titulo = ?, monto = ? WHERE id = ?',
            [this.editDataRec.titulo, this.editDataRec.monto, gasto.id]
          );
        }
      }

      for (const gasto of this.gastosHistoricos) {
        await db.run(
          'UPDATE gasto SET estado = ? WHERE id = ?',
          [gasto.estado, gasto.id]
        );
      }

      this.getAlertSuccess('Cambios guardados correctamente');
      this.isModalRecurrenteOpen = false;
      await this.getRecurrentes();
    } catch (error) {
      this.getAlertError(error);
    } finally {
      this.dissmissLoader();
    }
  }

  async editarGastoHistorico(gasto: any) {
    const alert = await this.alertController.create({
      header: 'Editar Gasto del Mes',
      subHeader: this.getNameMonth(gasto.fecha.split('-')[1]),
      mode: 'ios',
      inputs: [
        { name: 'titulo', type: 'text', value: gasto.titulo, placeholder: 'Nombre' },
        { name: 'monto', type: 'number', value: gasto.monto, placeholder: 'Monto (GTQ)' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (!data.titulo || !data.monto) return false;

            this.showLoader();
            try {
              const db = await this.dbService.getDB();
              await db.run(
                'UPDATE gasto SET titulo = ?, monto = ? WHERE id = ?',
                [data.titulo, Number(data.monto), gasto.id]
              );

              if (this.recurrenteSeleccionado) {
                await this.obtenerHistorialGastos(this.recurrenteSeleccionado.id);
              }
              await this.getRecurrentes();
              this.toastMessage('Mes actualizado correctamente');
            } catch (error) {
              this.getAlertError(error);
            } finally {
              this.dissmissLoader();
            }
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async restablecerGastoHistorico(gasto: any) {
    this.baseService(async () => {
      if (gasto) {
        this.showLoader();
        await this.gastoService.updateStateGasto(gasto.id.toString(),0);
        this.getAlertSuccess('Gasto restablecido a pendiente');
        gasto.estado = 0; 
        
        await this.getRecurrentes();
      }
    }, async () => {
      this.getAlertError('Error al restablecer.');
    }, async () => {
      this.dissmissLoader();
    });
  }

  eliminarGastoHistorico(gastoId: number) {
    this.modalDelete(async () => {
      this.showLoader();
      try {
        const db = await this.dbService.getDB();
        await db.run('DELETE FROM gasto WHERE id = ?', [gastoId]);

        if (this.recurrenteSeleccionado) {
          await this.obtenerHistorialGastos(this.recurrenteSeleccionado.id);
        }
        await this.getRecurrentes();
        this.getAlertSuccess('Gasto eliminado del historial');
      } catch (error) {
        this.getAlertError(error);
      } finally {
        this.dissmissLoader();
      }
    });
  }

  changeToggleRecurrente(event: { item: any, event: any }) {
    const { item, event: ionEvent } = event;
    const isChecked = ionEvent.detail.checked;

    if ((isChecked && item.activo === 1) || (!isChecked && item.activo === 0)) {
      return;
    }

    this.baseService(async () => {
      this.showLoader();
      await this.gastoService.desactivarGastoRecurrente(item.id || 0, !isChecked);
      item.estado = isChecked ? 1 : 0;
      item.activo = isChecked ? 1 : 0;
      this.toastMessage(isChecked ? 'Servicio habilitado' : 'Servicio deshabilitado');
    }, async () => {
      this.getAlertError('No se pudieron cargar.');
      item.estado = isChecked ? 0 : 1;
      item.activo = isChecked ? 0 : 1;
    }, async () => {
      this.dissmissLoader();
    });
  }

  // --- Lógica Cuotas ---
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

  abrirEditarGastoCuota(gasto: any) {
    this.gastoSeleccionado = gasto;
    this.listaFormularioEditar = [
      { id: 'titulo', titulo: 'Título', placeholder: 'Ingrese el título', tipo: 'text', required: true, valueSelect: gasto.titulo },
      { id: 'monto', titulo: 'Monto Total (GTQ)', placeholder: '0.00', tipo: 'number', required: true, valueSelect: gasto.monto },
      { id: 'cuotas', titulo: 'Total de Cuotas', placeholder: '0', tipo: 'number', required: true, valueSelect: gasto.cuotas },
      { id: 'categoria', titulo: 'Categoría', placeholder: 'Selecciona categoría', tipo: 'select', required: true, valueSelect: gasto.categoria_id, list: this.categoriasMapped }
    ];
    this.isEditModalOpen = true;
  }

  manejarAccionFormularioEditar(event: any) {
    if (event.action === 'select-action') {
      this.isEditModalOpen = false;
      setTimeout(() => {
        this.router.navigateByUrl('/categoria');
      }, 150);
    }
  }

  guardarEdicionCuota() {
    this.editData = {
      titulo: this.listaFormularioEditar.find(f => f.id === 'titulo')?.valueSelect || '',
      monto: this.listaFormularioEditar.find(f => f.id === 'monto')?.valueSelect || 0,
      cuotas: this.listaFormularioEditar.find(f => f.id === 'cuotas')?.valueSelect || 1,
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

  eliminarGastoCuota(gasto: any) {
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

  // Util
  modelAToModelB(a: GastoRecurrente): any {
    return {
      id: a.id,
      titulo: a.titulo,
      monto: a.monto,
      fecha: a.fechaInicio,
      fechaInicio: a.fechaInicio,
      estado: a.activo, // 1 activo, 0 pausado
      activo: a.activo,
      tipo: CatalogoTipoGasto.RECURRENTE,
      categoria_id: a.categoria_id,
      cantidad: a.cantidad,
    };
  }
}
