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
import { CatalogoTipoGasto, dateSearch, eNumber, formatDate, formatearMonto, getMesActual, getMesAnterior, getIconPath } from 'src/app/utils/Utils';
import { Presupuesto } from 'src/app/core/models/presupuesto.model';
import { UpdateListado } from 'src/app/utils/update-params';
import { Subscription } from 'rxjs';
import { PaymentCategoryBlockComponent } from 'src/app/component/payment-category-block/payment-category-block.component';

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
    PaymentCategoryBlockComponent
  ]
})
export class ListPaymentsMonthPage extends BasePage implements OnInit, OnDestroy {

  toolBar = {
    title: "Noviembre | 2024",
    description: "Visualiza los gastos realizados en el mes",
  }
  showPopup = false;
  isEditar = false;

  listCategoria: Categoria[] = []
  presupuesto: Presupuesto | null = null;
  cantidad: number = 0;
  total: number = 0;
  restante: number = 0;

  form: ItemInputData = {
    id: 'presupuesto', titulo: 'Presupuesto', isError: false, placeholder: 'Q 00.00',
    tipo: 'number', required: true
  };


 

  async ngOnInit() {
  }

  ngOnDestroy(): void {

  }

  ionViewDidLeave() {
    this.closePopupClick();
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

  handleTogglePago(event: {gasto: Gasto, isChecked: boolean}) {
    this.baseService(async () => {
      event.gasto.estado = event.isChecked ? 1 : 0;
      if (event.gasto.gastoCuota) {
        event.gasto.gastoCuota.estado_cuota = event.isChecked ? 1 : 0;
      }
      await this.gastoService.updateEstadoGasto(event.gasto);

      this.getAlertSuccess("Se actualizo estado correctamente");
    }, async () => {
      this.getAlertError('No se pudieron cargar.');
    });
  }

  reloadCategories(event?: any) {
    this.getCategorias();
  }

  saveEditGasto(gasto: Gasto) {
    this.baseService(async () => {
      await this.gastoService.updateGasto(gasto, false);
      this.getAlertSuccess("Se actualizo el gasto correctamente");
      this.getCategorias();
    }, async () => {
      this.getAlertError('No se pudo actualizar el gasto.');
    });
  }

  deleteEditGasto(gasto: Gasto) {
    this.modalDelete(async () => {
      this.baseService(async () => {
        await this.gastoService.eliminarEstadoGasto(gasto);
        this.toastMessage("Se elimino correctamente");
        this.getCategorias();
      }, async () => {
        this.getAlertError('No se pudo eliminar el gasto.');
      });
    });
  }

  loadRecurrenteData(event: {gasto: Gasto, callback: (data: any) => void}) {
    this.baseService(async () => {
      if (event.gasto?.recurrente_id) {
        this.showLoader();
        const recurrenteList = await this.gastoService.getGastosRecurrentesById(event.gasto.recurrente_id.toString());
        if (recurrenteList && recurrenteList.length > 0) {
          event.callback(recurrenteList[0]);
        }
        this.dissmissLoader();
      }
    }, async () => {
      this.getAlertError('No se pudo cargar el recurrente original.');
      this.dissmissLoader();
    });
  }

}
