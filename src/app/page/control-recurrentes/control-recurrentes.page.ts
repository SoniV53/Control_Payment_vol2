import Swal from 'sweetalert2';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

import { AppComponent } from 'src/app/app.component';
import { BasePage } from '../main/base/base.page';
import { NavCtrl } from 'src/app/services/nav-ctrl';
import { GastoRecurrente } from 'src/app/core/models/gasto_recurrente.model';
import { Categoria } from 'src/app/core/models/categoria.model';

import { GastoServiceService } from 'src/app/services/gasto-service.service';
import { CategoriaServiceService } from 'src/app/services/categoria-service.service';
import { ControlGastosAutomaticosService } from 'src/app/services/control-gastos-automaticos.service';
import { DatabaseServiceService } from 'src/app/core/database/database-service.service';
import { BannerTopComponent } from "src/app/component/card/banner-top/banner-top.component";
import { RecurrentesBlockComponent } from "src/app/component/recurrentes/recurrentes-block/recurrentes-block.component";
import { EmptyStateComponent } from "src/app/component/empty-state/empty-state.component";
import { ModalEditarRecurrenteComponent } from "src/app/component/recurrentes/modal-editar-recurrente/modal-editar-recurrente.component";
import { CustomTabsComponent } from 'src/app/component/custom-tabs/custom-tabs.component';
import { ChipsFilterComponent } from 'src/app/component/filter/chips-filter/chips-filter.component';
import { ModalTemplateComponent } from 'src/app/component/modal/modal-template/modal-template.component';
import { DynamicFormComponent } from 'src/app/component/form/dynamic-form/dynamic-form.component';

interface GrupoCategoria {
  categoria: Categoria;
  recurrentes: GastoRecurrente[];
  totalMonto: number;
  totalCantidad: number;
}

@Component({
  selector: 'app-control-recurrentes',
  templateUrl: './control-recurrentes.page.html',
  styleUrls: ['./control-recurrentes.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, BannerTopComponent, RecurrentesBlockComponent, EmptyStateComponent, ModalEditarRecurrenteComponent, CustomTabsComponent, ChipsFilterComponent, ModalTemplateComponent, DynamicFormComponent]
})
export class ControlRecurrentesPage extends BasePage {
  toolBar = {
    title: "Control de Gastos Recurrentes",
    description: "Aquí puedes administrar tus gastos recurrentes.",
  }
  gruposActivos: GrupoCategoria[] = [];
  gruposInactivos: GrupoCategoria[] = [];
  gruposFiltrados: GrupoCategoria[] = [];
  categoriasList: Categoria[] = [];

  selectedTabId: string = 'active';
  tabs = [
    { id: 'active', label: 'Activos', icon: 'checkmark-circle-outline' },
    { id: 'inactive', label: 'Inactivos', icon: 'close-circle-outline' }
  ];

  categoriaSeleccionada: string = 'todas';
  chipList: { id: string, label: string }[] = [];
  textoBusqueda: string = '';

    isModalOpen: boolean = false;
  isEditHistoryModalOpen: boolean = false;
  gastoHistoricoEditando: any = null;
  editHistoryFields: any[] = [];
  recurrenteSeleccionado: GastoRecurrente | null = null;
  editData: any = { titulo: '', monto: 0, categoria_id: null, aplicarAtodos: false };
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
    private dbService: DatabaseServiceService
  ) {
    super(router, myApp, gastoService, fb, categoriaService, controlService, toastController, navCtrl, alertController);
  }

  ionViewWillEnter() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.showLoader();
    try {
      this.categoriasList = await this.categoriaService.getCategoriasActivas();
      const recurrentes = await this.gastoService.getGastosRecurrentes(false);

      const recurrentesActivos = recurrentes.filter(r => r.activo === 1);
      const recurrentesInactivos = recurrentes.filter(r => r.activo === 0);

      this.gruposActivos = this.categoriasList.map(cat => {
        const items = recurrentesActivos.filter(r => r.categoria_id === cat.id);
        const totalMonto = items.reduce((sum, item) => sum + (item.monto || 0), 0);
        return { categoria: cat, recurrentes: items, totalMonto, totalCantidad: items.length };
      }).filter(grupo => grupo.totalCantidad > 0);

      this.gruposInactivos = this.categoriasList.map(cat => {
        const items = recurrentesInactivos.filter(r => r.categoria_id === cat.id);
        const totalMonto = items.reduce((sum, item) => sum + (item.monto || 0), 0);
        return { categoria: cat, recurrentes: items, totalMonto, totalCantidad: items.length };
      }).filter(grupo => grupo.totalCantidad > 0);

      this.chipList = [
        { id: 'todas', label: 'Todas' },
        ...this.categoriasList.map(c => ({ id: c.id!.toString(), label: c.nombre }))
      ];

      this.aplicarFiltros();

    } catch (error) {
      this.getAlertError(error);
    } finally {
      this.dissmissLoader();
    }
  }

  aplicarFiltros() {
    let gruposBase = this.selectedTabId === 'active' ? this.gruposActivos : this.gruposInactivos;

    const busqueda = this.textoBusqueda.trim().toLowerCase();
    
    this.gruposFiltrados = gruposBase.map(grupo => {
      if (this.categoriaSeleccionada !== 'todas' && grupo.categoria.id!.toString() !== this.categoriaSeleccionada) {
        return null;
      }
      
      const itemsFiltrados = grupo.recurrentes.filter(r => {
        if (!busqueda) return true;
        return (r.titulo && r.titulo.toLowerCase().includes(busqueda)) || 
               (grupo.categoria.nombre.toLowerCase().includes(busqueda));
      });
      
      if (itemsFiltrados.length === 0) return null;

      const totalMonto = itemsFiltrados.reduce((sum, item) => sum + (item.monto || 0), 0);
      
      return {
        ...grupo,
        recurrentes: itemsFiltrados,
        totalMonto,
        totalCantidad: itemsFiltrados.length
      };
    }).filter(grupo => grupo !== null) as GrupoCategoria[];
  }

  async toggleDeshabilitar(recurrente: any, event: any) {
    const isChecked = event.detail.checked;
    
    // Evitar que se dispare si el valor ya es correcto (evita el bug de rebote táctil)
    if ((isChecked && recurrente.activo === 1) || (!isChecked && recurrente.activo === 0)) {
      return;
    }

    this.showLoader();
    try {
      // El servicio recibe isCheck, que usaba lógica invertida. Le mandamos !isChecked para compensar
      // o mejor arreglamos la asignación local directa.
      await this.gastoService.desactivarGastoRecurrente(recurrente.id, !isChecked);
      recurrente.activo = isChecked ? 1 : 0;
      this.toastMessage(isChecked ? 'Servicio habilitado' : 'Servicio deshabilitado');
      await this.cargarDatos();
    } catch (error) {
      this.getAlertError(error);
      // Revertir en caso de error
      recurrente.activo = isChecked ? 0 : 1;
      event.target.checked = !isChecked;
    } finally {
      this.dissmissLoader();
    }
  }

  async editarRecurrente(recurrente: GastoRecurrente) {
    this.recurrenteSeleccionado = recurrente;
    this.editData = {
      titulo: recurrente.titulo || '',
      monto: recurrente.monto || 0,
      categoria_id: recurrente.categoria_id || null,
      aplicarAtodos: false
    };
    this.isModalOpen = true;

    await this.obtenerHistorialGastos(recurrente.id);
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

  // --- NUEVO: Controla si se actualizan todos los nombres/montos del historial ---
  toggleAllHistorial(event: any) {
    this.editData.aplicarAtodos = event.detail.checked;
  }

  // --- ACTUALIZADO: Guarda el principal y los meses que estén marcados con el Checkbox ---
  async confirmarEliminarRecurrente() {
    if (!this.recurrenteSeleccionado) return;

    // Solo contamos como historial los gastos que no están eliminados (estado != 2)
    const gastosActivos = this.gastosHistoricos ? this.gastosHistoricos.filter(g => g.estado !== 2) : [];
    const tieneHistorial = gastosActivos.length > 0;
    
    const textMsg = tieneHistorial
      ? 'Se detendrán los pagos futuros pero conservarás tu historial en el Resumen.'
      : 'Este servicio no tiene pagos históricos, será eliminado de forma definitiva.';

    const result = await Swal.fire({
      title: '¿Eliminar servicio?',
      text: textMsg,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4961',
      cancelButtonColor: '#2b2e36',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      heightAuto: false,
      color: '#ffffff',
      background: '#1e2025'
    });

    if (result.isConfirmed) {
      this.showLoader();
      try {
        const db = await this.dbService.getDB();
        if (tieneHistorial) {
          await db.run('UPDATE gasto_recurrente SET activo = 2 WHERE id = ?', [this.recurrenteSeleccionado!.id]);
        } else {
          // Hard delete de la plantilla y de cualquier gasto "basura" en estado 2 que haya quedado
          await db.run('DELETE FROM gasto WHERE recurrente_id = ?', [this.recurrenteSeleccionado!.id]);
          await db.run('DELETE FROM gasto_recurrente WHERE id = ?', [this.recurrenteSeleccionado!.id]);
        }
        this.isModalOpen = false;
        this.getAlertSuccess('Servicio eliminado');
        await this.cargarDatos();
      } catch (error) {
        this.getAlertError(error);
      } finally {
        this.dissmissLoader();
      }
    }
  }

  async guardarEdicion() {
    if (!this.recurrenteSeleccionado) return;

    this.showLoader();
    try {
      const db = await this.dbService.getDB();

      // 1. Actualizamos la plantilla principal
      await db.run(
        'UPDATE gasto_recurrente SET titulo = ?, monto = ?, categoria_id = ? WHERE id = ?',
        [this.editData.titulo, this.editData.monto, this.editData.categoria_id, this.recurrenteSeleccionado.id]
      );

      // 2. Si el toggle está activado, aplicamos nombre y monto a todos los meses
      if (this.editData.aplicarAtodos) {
        for (const gasto of this.gastosHistoricos) {
          await db.run(
            'UPDATE gasto SET titulo = ?, monto = ?, categoria_id = ? WHERE id = ?',
            [this.editData.titulo, this.editData.monto, this.editData.categoria_id, gasto.id]
          );
        }
      }

      // 3. Guardamos el estado de los checkboxes (si lo marcó como pagado o pendiente)
      for (const gasto of this.gastosHistoricos) {
        await db.run(
          'UPDATE gasto SET estado = ? WHERE id = ?',
          [gasto.estado, gasto.id]
        );
      }

      this.getAlertSuccess('Cambios guardados correctamente');
      this.isModalOpen = false;
      await this.cargarDatos();
    } catch (error) {
      this.getAlertError(error);
    } finally {
      this.dissmissLoader();
    }
  }

  editarGastoHistorico(gasto: any) {
    this.gastoHistoricoEditando = gasto;
    const listCat = this.categoriasList.map(c => ({ code: c.id, value: c.nombre, icon: c.icono }));

    this.editHistoryFields = [
      {
        id: 'titulo',
        titulo: 'Título',
        tipo: 'text',
        valueSelect: gasto.titulo,
        required: true,
        placeholder: 'Ej. Netflix'
      },
      {
        id: 'monto',
        titulo: 'Monto',
        tipo: 'number',
        valueSelect: gasto.monto,
        required: true,
        placeholder: 'Ej. 100.00'
      },
      {
        id: 'categoria', 
        titulo: 'Categoría', 
        tipo: 'select', 
        required: true, 
        placeholder: 'Seleccione la categoría',
        list: listCat, 
        valueSelect: gasto.categoria_id 
      }
    ];
    this.isEditHistoryModalOpen = true;
  }

  async guardarGastoHistorico() {
    const titulo = this.editHistoryFields.find(f => f.id === 'titulo')?.valueSelect;
    const monto = this.editHistoryFields.find(f => f.id === 'monto')?.valueSelect;
    const categoriaId = this.editHistoryFields.find(f => f.id === 'categoria')?.valueSelect;

    if (!titulo || !monto || !categoriaId) {
      this.getAlertError('Por favor, completa todos los campos.');
      return;
    }

    this.showLoader();
    try {
      const db = await this.dbService.getDB();
      await db.run('UPDATE gasto SET titulo = ?, monto = ?, estado = ?, categoria_id = ? WHERE id = ?', [titulo, monto, this.gastoHistoricoEditando.estado, categoriaId, this.gastoHistoricoEditando.id]);
      
      this.isEditHistoryModalOpen = false;
      this.getAlertSuccess('Gasto actualizado correctamente');
      
      if (this.recurrenteSeleccionado) {
        await this.obtenerHistorialGastos(this.recurrenteSeleccionado.id);
      }
      await this.cargarDatos();
    } catch (error) {
      this.getAlertError(error);
    } finally {
      this.dissmissLoader();
    }
  }




  async pagarGastoHistorico(gasto: any) {
    this.baseService(async () => {
      if (gasto) {
        this.showLoader();
        await this.gastoService.updateStateGasto(gasto.id.toString(), 1);
        this.getAlertSuccess('Gasto marcado como pagado');
        gasto.estado = 1;
        
        await this.cargarDatos();
      }
    }, async () => {
      this.getAlertError('Error al marcar como pagado.');
    }, async () => {
      this.dissmissLoader();
    });
  }

  async restablecerGastoHistorico(gasto: any) {
    this.baseService(async () => {
      if (gasto) {
        this.showLoader();
        await this.gastoService.updateStateGasto(gasto.id.toString(),0);
        this.getAlertSuccess('Gasto restablecido a pendiente');
        gasto.estado = 0; 
        
        await this.cargarDatos();
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
        await db.run('UPDATE gasto SET estado = 2 WHERE id = ?', [gastoId]);

        if (this.recurrenteSeleccionado) {
          await this.obtenerHistorialGastos(this.recurrenteSeleccionado.id);
        }
        await this.cargarDatos();
        this.getAlertSuccess('Gasto eliminado del historial');
      } catch (error) {
        this.getAlertError(error);
      } finally {
        this.dissmissLoader();
      }
    });
  }

      restablecerFormularioOriginal() {
    if (!this.recurrenteSeleccionado) return;
    
    const tituloField = this.editHistoryFields.find(f => f.id === 'titulo');
    if (tituloField) tituloField.valueSelect = this.recurrenteSeleccionado.titulo;
    
    const montoField = this.editHistoryFields.find(f => f.id === 'monto');
    if (montoField) montoField.valueSelect = this.recurrenteSeleccionado.monto;
    
    const categoriaField = this.editHistoryFields.find(f => f.id === 'categoria');
    if (categoriaField) categoriaField.valueSelect = this.recurrenteSeleccionado.categoria_id;
  }

  eliminarGastoHistoricoActivo() {
    this.modalDelete(async () => {
      this.showLoader();
      try {
        const db = await this.dbService.getDB();
        await db.run('UPDATE gasto SET estado = 2 WHERE id = ?', [this.gastoHistoricoEditando.id]);
        
        this.isEditHistoryModalOpen = false;
        if (this.recurrenteSeleccionado) {
          await this.obtenerHistorialGastos(this.recurrenteSeleccionado.id);
        }
        await this.cargarDatos();
        this.getAlertSuccess('Gasto eliminado del historial');
      } catch (error) {
        this.getAlertError(error);
      } finally {
        this.dissmissLoader();
      }
    });
  }

  restablecerGastoHistoricoActivo() {
    this.baseService(async () => {
      this.showLoader();
      await this.gastoService.updateStateGasto(this.gastoHistoricoEditando.id.toString(), 0);
      
      this.isEditHistoryModalOpen = false;
      this.getAlertSuccess('Gasto restablecido a pendiente');
      
      if (this.recurrenteSeleccionado) {
        await this.obtenerHistorialGastos(this.recurrenteSeleccionado.id);
      }
      await this.cargarDatos();
    }, async () => {
      this.getAlertError('Error al restablecer.');
    }, async () => {
      this.dissmissLoader();
    });
  }

  printStado(estado: number): string {
    return estado === 2 ? 'Eliminado' : estado === 1 ? 'Pagado' : 'Pendiente';
  }

  override getIcon(icon: string) {
    return `assets/ionicons/${icon}.svg`;
  }
}



















