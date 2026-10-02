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
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, BannerTopComponent]
})
export class ControlRecurrentesPage extends BasePage {
  toolBar = {
    title: "Control de Gastos Recurrentes",
    description: "Aquí puedes administrar tus gastos recurrentes.",
  }
  grupos: GrupoCategoria[] = [];

  isModalOpen: boolean = false;
  recurrenteSeleccionado: GastoRecurrente | null = null;
  editData = { titulo: '', monto: 0, aplicarAtodos: false };
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
      const categorias = await this.categoriaService.getCategoriasActivas();
      const recurrentes = await this.gastoService.getGastosRecurrentes(false);

      this.grupos = categorias.map(cat => {
        const items = recurrentes.filter(r => r.categoria_id === cat.id);
        const totalMonto = items.reduce((sum, item) => sum + (item.monto || 0), 0);

        return {
          categoria: cat,
          recurrentes: items,
          totalMonto: totalMonto,
          totalCantidad: items.length
        };
      }).filter(grupo => grupo.totalCantidad > 0);
    } catch (error) {
      this.getAlertError(error);
    } finally {
      this.dissmissLoader();
    }
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
    this.editData.titulo = recurrente.titulo || '';
    this.editData.monto = recurrente.monto || 0;
    this.editData.aplicarAtodos = false; // Por defecto apagado para evitar errores
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
  async guardarEdicion() {
    if (!this.recurrenteSeleccionado) return;

    this.showLoader();
    try {
      const db = await this.dbService.getDB();

      // 1. Actualizamos la plantilla principal
      await db.run(
        'UPDATE gasto_recurrente SET titulo = ?, monto = ? WHERE id = ?',
        [this.editData.titulo, this.editData.monto, this.recurrenteSeleccionado.id]
      );

      // 2. Si el toggle está activado, aplicamos nombre y monto a todos los meses
      if (this.editData.aplicarAtodos) {
        for (const gasto of this.gastosHistoricos) {
          await db.run(
            'UPDATE gasto SET titulo = ?, monto = ? WHERE id = ?',
            [this.editData.titulo, this.editData.monto, gasto.id]
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
              await this.cargarDatos();
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
        await db.run('DELETE FROM gasto WHERE id = ?', [gastoId]);

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

  printStado(estado: number): string {
    return estado === 2 ? 'Eliminado' : estado === 1 ? 'Pagado' : 'Pendiente';
  }

  override getIcon(icon: string) {
    return `assets/ionicons/${icon}.svg`;
  }
}