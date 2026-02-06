import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BannerTopComponent } from "../../../component/card/banner-top/banner-top.component";
import { CategoryPaymentComponent } from "src/app/component/category-payment/category-payment.component";
import { BasePage } from '../../main/base/base.page';
import { IonicModule } from "@ionic/angular";
import { ModalBaseComponent } from "src/app/component/modal-base/modal-base.component";
import { IonItem, IonContent, IonChip, IonDatetime, IonIcon } from "@ionic/angular/standalone";
import { Categoria } from 'src/app/core/models/categoria.model';
import { Gasto } from 'src/app/core/models/gasto.model';
import { ItemInputData } from 'src/app/models/ItemInputData.model';
import { InputSimpleComponent } from "src/app/component/input/input-simple/input-simple.component";
import { CatalogoTipoGasto, dateSearch, eNumber, formatDate, formatearMonto, getMesActual, getMesAnterior } from 'src/app/utils/Utils';
import { Presupuesto } from 'src/app/core/models/presupuesto.model';
import { UpdateListado } from 'src/app/utils/update-params';
import { DetalleGastoComponent } from "src/app/component/card/detalle-gasto/detalle-gasto.component";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list-payments-month',
  templateUrl: './list-payments-month.page.html',
  styleUrls: ['./list-payments-month.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BannerTopComponent,
    CategoryPaymentComponent,
    ModalBaseComponent,
    IonItem,
    IonContent,
    IonDatetime,
    IonIcon,
    InputSimpleComponent,
    DetalleGastoComponent
  ]
})
export class ListPaymentsMonthPage extends BasePage implements OnInit, OnDestroy {

  toolBar = {
    title: "Noviembre | 2024",
    description: "Visualiza los gastos realizados en el mes",
  }
  showPopup = false;
  showModalInfo = false;
  isEditar = false;

  listCategoria: Categoria[] = []
  presupuesto: Presupuesto | null = null;
  cantidad: number = 0;
  total: number = 0;
  restante: number = 0;
  gastoSelect?: Gasto;

  form: ItemInputData = {
    id: 'presupuesto', titulo: 'Presupuesto', isError: false, placeholder: 'Q 00.00',
    tipo: 'number', required: true
  };


  async ngOnInit() {
    // this.listCategoria = [
    //   {
    //     "id": 1,
    //     "icono": "fast-food-outline",
    //     "nombre": "comida",
    //     "totalMonto": 0,
    //     "dataGasto": [
    //       {
    //         "id": 3,
    //         "titulo": "recurrete",
    //         "monto": 3600,
    //         "descripcion": "",
    //         "cuotas": 1,
    //         "fecha": "2026-02-01",
    //         "fechaEnd": null,
    //         "tipo": "normal",
    //         "etiquetas": "",
    //         "categoria_id": 1,
    //         "recurrente_id": 1,
    //         "estado": 0
    //       },
    //       {
    //         "id": 2,
    //         "titulo": "cuota",
    //         "monto": 3600,
    //         "descripcion": "",
    //         "cuotas": 12,
    //         "fecha": "2026-02-01",
    //         "fechaEnd": "2027-01-01",
    //         "tipo": "cuota",
    //         "etiquetas": "",
    //         "categoria_id": 1,
    //         "recurrente_id": null,
    //         "estado": 0,
    //         "gastoCuota": {
    //           "id": 1,
    //           "gasto_id": 2,
    //           "numero_cuota": 1,
    //           "monto_cuota": 300,
    //           "fecha_pago": "2026-02-01",
    //           "estado_cuota": 0
    //         }
    //       },

    //       {
    //         "id": 3,
    //         "titulo": "cuota ss",
    //         "monto": 3600,
    //         "descripcion": "",
    //         "cuotas": 12,
    //         "fecha": "2026-02-01",
    //         "fechaEnd": "2027-01-01",
    //         "tipo": "cuota",
    //         "etiquetas": "",
    //         "categoria_id": 1,
    //         "recurrente_id": null,
    //         "estado": 0,
    //         "gastoCuota": {
    //           "id": 1,
    //           "gasto_id": 2,
    //           "numero_cuota": 1,
    //           "monto_cuota": 300,
    //           "fecha_pago": "2026-02-01",
    //           "estado_cuota": 0
    //         }
    //       }
    //     ]
    //   },
    //   {
    //     "id": 2,
    //     "icono": "business-outline",
    //     "nombre": "papas",
    //     "totalMonto": 0,
    //     "dataGasto": [
    //       {
    //         "id": 7,
    //         "titulo": "hwh",
    //         "monto": 64,
    //         "descripcion": "",
    //         "cuotas": 1,
    //         "fecha": "2026-02-01",
    //         "fechaEnd": null,
    //         "tipo": "recurrente",
    //         "etiquetas": "",
    //         "categoria_id": 2,
    //         "recurrente_id": 4,
    //         "estado": 0
    //       },
    //     ]
    //   }
    // ];

  }

  ngOnDestroy(): void {

  }

  ionViewDidLeave() {
    this.closePopupClick();
    this.showModalInfo = false;
  }

  ionViewWillEnter() {
    this.toolBar.title = this.getFormatDate();
    this.getCategorias();
  }

  formatearMontoPr(valor: string | number) {
    const num = valor?.toString() || '0'
    return formatearMonto(eNumber(num));
  }

  closePopupClick() {
    if (!this.isEditar) {
      this.loadUpdateParam(UpdateListado.UPDATE_RECURRENTE, true);
      this.loadUpdateParam(UpdateListado.UPDATE_CATEGORIA, true);
      this.getCategorias();
    }
    this.showPopup = false;
    this.isEditar = false;
  }

  onMonthYearChange(event: any) {
    const date = new Date(event.detail.value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const selectedDate = `${year}-${month}-${day}`;

    this.myApp.setDateSelected(selectedDate);
    this.toolBar.title = this.getFormatDate();
  }

  selectDate() {
    this.showPopup = true;
  }

  onActionTitle() {
    this.isEditar = false;
    this.selectDate();
  }

  getCategorias() {
    this.baseService(async () => {
      this.showLoader()
      this.cantidad = 0;
      this.total = 0;
      this.restante = 0;
      await this.controlService.addGastoMensualCuota(this.myApp.dateSelected);
      this.loadUpdateParam(UpdateListado.UPDATE_RECURRENTE);

      this.listCategoria = await this.gastoService.getGastos(this.myApp.dateSelected);


      await this.gastoService.generarPresupuestoMensualSiNoExiste(this.myApp.dateSelected);

      const presupuesto = await this.gastoService.getPresupuestoByMes(this.myApp.dateSelected);
      if (presupuesto) { this.presupuesto = presupuesto[0]; }

      this.form.valueSelect = this.presupuesto?.monto || '';


      this.loadUpdateParam(UpdateListado.UPDATE_CATEGORIA);
      this.listCategoria.map(res => {
        if (res.dataGasto) {
          this.cantidad += res.dataGasto?.length || 0

          res.dataGasto?.map(gas => {
            if (gas.tipo != 'cuota') {
              this.total += gas.monto
            } else {
              this.total += (gas?.gastoCuota?.monto_cuota || 0)
            }
          })
        }

      })

      this.restante = (this.presupuesto?.monto || 0) - this.total;

    }, async () => {
      this.getAlertError('No se pudieron cargar.');
    }, async () => {
      this.dissmissLoader();
    });
  }

  editarPresupuesto() {
    this.showPopup = true;
    this.isEditar = true;
    this.focusInputIdInput(this.form);
  }

  blurInput(form: ItemInputData) {
    this.baseService(async () => {
      if (this.presupuesto) {
        this.presupuesto.monto = eNumber(this.form.valueSelect);
        await this.gastoService.updatePresupuesto(this.presupuesto);
        this.restante = eNumber(this.form.valueSelect) - this.total;
      }

    }, async () => {
      this.getAlertError('No se pudieron cargar.');
    });

  }

  ionChangeInput(form: ItemInputData) { }

  clickItem(gasto: Gasto) {
    this.gastoSelect = gasto;
    this.showModalInfo = true;
  }

  closePopupModalInfo() {
    this.showModalInfo = false;
  }

  clickUpdateCheck(gasto: Gasto) {
    this.baseService(async () => {
      await this.gastoService.updateEstadoGasto(gasto);

      this.toastMessage("Se actualizo estado correctamente");
    }, async () => {
      this.getAlertError('No se pudieron cargar.');
    });
  }

  clickDeleteItem(gasto: Gasto) {
    this.baseService(async () => {
      await this.gastoService.eliminarEstadoGasto(gasto);

      const categoria = this.listCategoria.find(ga => ga.id == gasto.categoria_id);
      if (categoria?.dataGasto) {
        const index = categoria?.dataGasto?.findIndex(res => res.id == gasto.id);
        categoria?.dataGasto.splice(index, 1);
      }
      this.total -= gasto.tipo === CatalogoTipoGasto.CUOTA ? (gasto?.gastoCuota?.monto_cuota || 0) : gasto.monto;
      this.cantidad -= 1;
      this.restante = eNumber(this.form.valueSelect) - this.total;
      

      this.showModalInfo = false;
      this.toastMessage("Se Elimino correctamente");
    }, async () => {
      this.getAlertError('No se pudieron cargar.');
    });
  }
  clickEditItem(gasto: Gasto) {
    this.navCtrl.push("UpdatePaymentPage",{gasto:gasto})
    this.showModalInfo = false;
  }

}
