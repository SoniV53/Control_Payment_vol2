import { Component, OnInit } from '@angular/core';
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
import { eNumber, formatearMonto } from 'src/app/utils/Utils';
import { Presupuesto } from 'src/app/core/models/presupuesto.model';
import { UpdateListado } from 'src/app/utils/update-params';

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
    IonChip,
    IonDatetime,
    IonIcon,
    InputSimpleComponent
  ]
})
export class ListPaymentsMonthPage extends BasePage implements OnInit {
  toolBar = {
    title: "Noviembre | 2024",
    description: "Visualiza los gastos realizados en el mes",
  }
  showPopup = false;
  isEditar = false;

  listCategoria: Categoria[] = []
  dataGasto: Gasto[] = []
  presupuesto: Presupuesto | null = null;

  form: ItemInputData = {
    id: 'presupuesto', titulo: 'Presupuesto', isError: false, placeholder: 'Q 00.00',
    tipo: 'number', required: true
  }
    ;

  ngOnInit() {
    this.toolBar.title = this.getFormatDate();
    
  }

  ionViewWillEnter() {

    this.toolBar.title = this.getFormatDate();
    this.getCategorias();

    // this.listCategoria.push({
    //   nombre: "Super gsfdhgsfahg",
    //   icono: 'bus-outline',
    //   id: 0
    // })
    // this.listCategoria.push({
    //   nombre: "Super",
    //   icono: 'bus-outline',
    //   id: 0
    // })

    // this.dataGasto.push({
    //   fecha: '2026/01/30',
    //   monto: 100,
    //   tipo: 'normal',
    //   titulo: "nani",
    //   estado: 0
    // })

    // this.dataGasto.push({
    //   fecha: '2026/01/30',

    //   monto: 10000,
    //   tipo: 'cuota',
    //   titulo: "nani",
    //   cuotas: 12,
    //   estado: 0,
    //   gastoCuota: {
    //     monto_cuota: 300,
    //     numero_cuota: 2,
    //     fecha_pago: '2026/01/30',
    //     gasto_id: 1,
    //     estado_cuota: 1
    //   }
    // })

  }

  formatearMontoPr() {
    if (this.form.valueSelect) {
      return formatearMonto(eNumber(this.form.valueSelect));
    }
    return 'Q00.00'
  }

  closePopupClick() {
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
    this.selectDate();
  }

  getCategorias() {
    this.baseService(async (params) => {
      if (this.getUpdateParam(UpdateListado.UPDATE_CATEGORIA)) {
        this.listCategoria = await this.categoriaService.getCategoriasActivas();
        await this.gastoService.generarPresupuestoMensualSiNoExiste(new Date(this.myApp.dateSelected));

        const presupuesto = await this.gastoService.getPresupuestoByMes(this.myApp.dateSelected);
        console.log(presupuesto)

        //this.form.valueSelect = this.presupuesto || '';

        this.loadUpdateParam(UpdateListado.UPDATE_CATEGORIA)
      }

    }, async () => {
      this.getAlertError('No se pudieron cargar.');
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
      }

    }, async () => {
      this.getAlertError('No se pudieron cargar.');
    });

  }

  ionChangeInput(form: ItemInputData) { }

}
