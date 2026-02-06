import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, NgForm, Validators } from '@angular/forms';
import { BannerTopComponent } from "src/app/component/card/banner-top/banner-top.component";
import { ItemInputData, ItemInputListData } from 'src/app/models/ItemInputData.model';
import Swal from 'sweetalert2';
import { BasePage } from '../../main/base/base.page';
import { IonToolbar, IonSegmentButton, IonLabel, IonSegment, IonContent, IonSelectOption, IonToggle, IonButton, IonDatetime, IonHeader, IonFooter, IonItem, IonIcon } from "@ionic/angular/standalone";
import { ModalBaseComponent } from "src/app/component/modal-base/modal-base.component";
import { InputSimpleComponent } from 'src/app/component/input/input-simple/input-simple.component';
import { SelectorSimpleComponent } from "src/app/component/input/selector-simple/selector-simple.component";
import { Gasto } from 'src/app/core/models/gasto.model';
import { Capacitor } from '@capacitor/core';
import { list } from 'ionicons/icons';
import { getIconPath, validarCuotasConRango } from 'src/app/utils/Utils';
import { Categoria } from 'src/app/core/models/categoria.model';
import { EmptyBaseComponent } from "src/app/component/card/empty-base/empty-base.component";
import { RouterLink } from '@angular/router';
import { UpdateListado } from 'src/app/utils/update-params';

export default Swal;
@Component({
  selector: 'app-new-payment',
  templateUrl: './new-payment.page.html',
  styleUrls: ['./new-payment.page.scss'],
  standalone: true,
  imports: [IonIcon, IonItem,
    CommonModule,
    FormsModule,
    BannerTopComponent,
    IonToolbar,
    IonSegmentButton,
    IonLabel,
    IonSegment,
    IonContent,
    IonToggle,
    IonButton,
    IonDatetime,
    IonHeader,
    ModalBaseComponent,
    InputSimpleComponent,
    SelectorSimpleComponent,
    IonFooter, EmptyBaseComponent, RouterLink],
})
export class NewPaymentPage extends BasePage implements OnInit {
  toolBar = {
    title: "Crear Gasto ",
    description: "Puedes crear un nuevo gasto llenando el siguiente formulario",
  }
  //myForm: FormGroup;
  valueSegment = 'normal';
  myForm!: FormGroup;
  @ViewChild('f') f: NgForm | undefined;

  disabledButton = true;
  dataSelect: ItemInputData | null = null;
  dataCard = {
    title: "No Hay Categorias",
    description: "",
    icon: "file-tray-outline"
  }

  showPopup = false;
  listaFormularioMain: ItemInputData[] = [];

  listaFormulario: ItemInputData[] = [];
  dataListaSelect: ItemInputListData[] = [];
  dataSelectItem: any = {};
  tipoModalUse: string = 'date';
  isCheck: boolean = false;
  event: any;

  ionViewDidLeave() {
    this.closePopupClick();
   
  }

  insertInputs() {
    this.listaFormularioMain = [
      { id: 'titulo', titulo: 'Titulo', isError: false, placeholder: 'Ingrese el titulo del gasto', tipo: 'text', required: true },
      //{ id: 'descripcion', titulo: 'Descripcion', isError: false, placeholder: 'Ingrese la descripcion del gasto', tipo: 'text', required: false },
      { id: 'monto', titulo: 'Monto', isError: false, placeholder: 'Ingrese el monto del gasto', tipo: 'number', required: true },
      {
        id: 'categoria', titulo: 'Categoria', isError: false, placeholder: 'Seleccione la categoria del gasto', tipo: 'select', required: false, list: []
      },
      //{ id: 'fecha', titulo: 'Fecha Inicio', isError: false, placeholder: 'Seleccione la fecha del gasto', tipo: 'date', required: true, valueSelect: this.myApp.dateSelected }

    ]

    this.listaFormulario = [...this.listaFormularioMain]
    this.valueSegment = 'normal';
  }

  async ionViewWillEnter() {

    await this.getCategorias();

    console.log(this.listaFormulario)

  }

  async ngOnInit() {
    this.insertInputs();


    // console.log('Fecha actual formateada (YYYY-MM-DD):', this.myApp.dateToday);
    // const fechaForm = this.listaFormulario.find(item => item.id === 'fecha');
    // if (fechaForm) {
    //   fechaForm.valueSelect = this.myApp.dateToday;
    // }

  }

  resetInputs() {
    this.valueSegment = 'normal';
    this.isCheck = false;
    this.listaFormularioMain.map(res => {
      if (res.tipo != 'date') res.valueSelect = '';
      else res.valueSelect = this.myApp.dateSelected;
    })
  }

  getCategorias() {
   return this.baseService(async () => {
      this.showLoader();
      const listCategoria = await this.categoriaService.getCategoriasActivas();
      const catego = this.listaFormularioMain.find(res => res.id === 'categoria');
      if (catego) {
        catego.list = [];
        if (this.dataSelect) {
          this.dataSelect.valueSelect = '';
          this.dataSelect.icon = '';
          this.dataSelect.code = '';
        }
        listCategoria.map(res => {
          catego?.list?.push({ code: res.id || 0, value: res.nombre, icon: res.icono });
        })
      }

      this.listaFormulario = [...this.listaFormularioMain];

      if (this.valueSegment != 'cuota') {
        this.listaFormulario = [...this.listaFormularioMain];
        this.listaFormulario.push(
          { id: 'fecha', titulo: 'Fecha Inicio', isError: false, placeholder: 'Seleccione la fecha del gasto', tipo: 'date', required: true, valueSelect: this.myApp.dateSelected }
        )
      }
    }, async () => {
      this.getAlertError('No se pudieron cargar.');
    }, async () => {
      this.dissmissLoader();
    });
  }

  clickSegment(value: string) {
    this.valueSegment = value;
    console.log("Segmento seleccionado: ", this.listaFormulario);
    if (value === 'cuota') {
      this.listaFormulario = [...this.listaFormularioMain];
      this.listaFormulario.push({
        id: 'cuota', titulo: 'Cuotas', isError: false, placeholder: 'Ingrese el numero de cuotas', tipo: 'number', required: true,
        valueSelect: ''
      })
      this.listaFormulario.push({
        id: 'cuotaNum', titulo: 'Cuotas Pagadas', isError: false, placeholder: 'Ingrese el numero de cuotas pagadas', tipo: 'number', required: true,
        valueSelect: '1'
      })

      this.listaFormulario.push(
        {
          id: 'fecha',
          titulo: `Fecha Inicio: `, isError: false, placeholder: 'Seleccione la fecha del gasto', tipo: 'read', required: false,
          valueSelect: this.formatearFecha(new Date(this.myApp.dateToday))
        }
      )
      this.listaFormulario.push({
        id: 'fechaEnd', titulo: 'Fecha Final:', isError: false, placeholder: 'Fecha Final (Solo lectura)', tipo: 'read', required: false, valueSelect: ''
      })
    } else {
      this.listaFormulario = [...this.listaFormularioMain];
      this.listaFormulario.push(
        { id: 'fecha', titulo: 'Fecha Inicio', isError: false, placeholder: 'Seleccione la fecha del gasto', tipo: 'date', required: true, valueSelect: this.formatearFecha(new Date(this.myApp.dateToday)) }
      )
    }
    this.validButton();

    console.log(this.isCheck)
  }

  clickDateModal(form: ItemInputData) {
    if (form.id === 'fechaEnd') {
      return;
    }
    this.showPopup = true;
    this.dataSelect = form;
    this.tipoModalUse = 'date'
  }

  closePopupClick() {
    this.showPopup = false;
    this.validButton();
    this.changeDate();
  }


  onMonthYearChange(event: any) {
    this.event = event;
  }

  changeDate() {
    if (!this.dataSelect) {
      return;
    }
    const selectedDate = this.event?.detail?.value;
    console.log('Fecha seleccionada:', selectedDate);
    if (!selectedDate) return;

    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = date.getDate();

    const formattedDate = `${year}-${month}-01`;
    console.log('Fecha formateada (YYYY-MM):', formattedDate);
    if (this.dataSelect) {
      this.dataSelect.valueSelect = formattedDate;
    }
  }

  async saveNewPayment() {
   return this.baseService(async () => {
      const g: Gasto = {
        titulo: this.listaFormulario.find(item => item.id === 'titulo')?.valueSelect || '',
        descripcion: this.listaFormulario.find(item => item.id === 'descripcion')?.valueSelect || '',
        monto: Number(this.listaFormulario.find(item => item.id === 'monto')?.valueSelect) || 0,
        categoria_id: Number(this.listaFormulario.find(item => item.id === 'categoria')?.code) || null,
        etiquetas: '',
        fecha: this.listaFormulario.find(item => item.id === 'fecha')?.valueSelect || '',
        fechaEnd: this.listaFormulario.find(item => item.id === 'fechaEnd')?.valueSelect || '',
        cuotas: this.valueSegment === 'cuota' ? Number(this.listaFormulario.find(item => item.id === 'cuota')?.valueSelect) || 1 : 1,
        tipo: this.valueSegment === 'cuota' ? 'cuota' : 'normal',
      }

      if (this.valueSegment === 'cuota') {
        const ok = validarCuotasConRango(g.fecha, g.fechaEnd || '', g.cuotas || 0);

        if (!ok) {
          this.getAlertError('Rango de fechas no valida');
          return;
        }
      }

      const numId = await this.gastoService.addGasto(g, this.myApp.dateSelected, (this.isCheck && this.valueSegment === 'normal'),
        this.valueSegment === 'cuota' ?
          Number(this.listaFormulario.find(item => item.id === 'cuotaNum')?.valueSelect) || 1 : 1);

      this.getAlertSuccess('El gasto se ha guardado correctamente.');
      this.resetInputs();
      this.resetNavigation();
    }, async () => {
      this.getAlertError('No se pudieron cargar los gastos.');
    });


  }

  ionChangeInput(form: ItemInputData) {
    // form.isError = false;
    // if (form.required && !form.valueSelect) {
    //   form.isError = true;
    // }

    this.validarErrorInput(form);
    this.validButton();
  }

  validarErrorInput(form: ItemInputData) {
    form.isError = false;
    form.msgInput = '';

    switch (form.id) {
      case 'cuotaNum':
        if (form.valueSelect <= 0) {
          form.isError = true;
          form.msgInput = "Ingrese un valor mayor a 0"
        }

        const cuota = this.listaFormulario.find(item => item.id === 'cuota');
        if (form.valueSelect > cuota?.valueSelect) {
          form.isError = true;
          form.msgInput = "Cuota Invalida"
        }
        break;
      case 'cuota':
        if (form.valueSelect <= 1) {
          form.isError = true;
          form.msgInput = "Ingrese un valor mayor a 1"
        }
        break;
    }
  }

  validButton() {
    const hasError = this.listaFormulario.some(item => item.isError || (item.required && !item.valueSelect));
    this.disabledButton = hasError;

  }

  blurInput(form: ItemInputData) {
    switch (form.id) {
      case 'cuota':
        this.calculadoraFechaFinal(form);
        break;
      case 'cuotaNum':
        const cuotasPagadas = Number(form.valueSelect);

        if (!cuotasPagadas || cuotasPagadas <= 0) return;

        const fechaInicial = this.listaFormulario.find(item => item.id === 'fecha');
        const cuota = this.listaFormulario.find(item => item.id === 'cuota');

        if (fechaInicial) {
          fechaInicial.valueSelect = this.sumarMeses(this.myApp.dateToday, -(cuotasPagadas - 1));
        }

        if (cuota?.valueSelect) {
          this.calculadoraFechaFinal({ valueSelect: cuota.valueSelect } as ItemInputData);
        }
        break;
      default:
        break;
    }
    this.validButton();
  }

  calculadoraFechaFinal(form: ItemInputData) {
    const fechaInicio = this.listaFormulario.find(item => item.id === 'fecha');
    const fechaFinal = this.listaFormulario.find(item => item.id === 'fechaEnd');

    if (!fechaInicio?.valueSelect) return;

    const numCuotas = Number(form.valueSelect);

    if (!numCuotas || numCuotas <= 0) return;

    const fechaEndCalc = this.sumarMeses(fechaInicio.valueSelect, numCuotas - 1);

    if (fechaFinal) {
      fechaFinal.valueSelect = fechaEndCalc;
    }
  }


  sumarMeses(fechaInicial: string | null, cantidadMeses: number): string {
    if (!fechaInicial) {
      return '';
    }
    const fecha = new Date(fechaInicial);

    fecha.setMonth(fecha.getMonth() + cantidadMeses);

    return this.formatearFecha(fecha);
  }

  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    //return `${year}-${month}-${day}`;
    return `${year}-${month}-${day}`;
  }

  mesesEntreFechas(fechaInicio: string, fechaFin: string): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    let meses = (fin.getFullYear() - inicio.getFullYear()) * 12;
    meses += fin.getMonth() - inicio.getMonth();

    if (fin.getDate() < inicio.getDate()) {
      meses--;
    }

    return meses;
  }

  onClickItem(form: ItemInputListData) {
    this.showPopup = false;
    if (this.dataSelect) {
      this.dataSelect.valueSelect = form.value || '';
      this.dataSelect.icon = form.icon || '';
      this.dataSelect.code = form.code || '';
    }

  }

  onClickItemAction(form: ItemInputData) {
    this.showPopup = true;
    this.dataListaSelect = form.list || [];
    this.tipoModalUse = 'select';
    this.dataSelect = form;
  }
}
