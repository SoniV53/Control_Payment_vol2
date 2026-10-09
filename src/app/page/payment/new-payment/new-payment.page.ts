import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, NgForm, Validators } from '@angular/forms';
import { BannerTopComponent } from "src/app/component/card/banner-top/banner-top.component";
import { ItemInputData, ItemInputListData } from 'src/app/models/ItemInputData.model';
import Swal from 'sweetalert2';
import { BasePage } from '../../main/base/base.page';
import { IonToolbar, IonSegmentButton, IonLabel, IonSegment, IonContent, IonSelectOption, IonToggle, IonButton, IonDatetime, IonHeader, IonModal, IonTitle, IonButtons, IonFooter, IonItem, IonIcon } from "@ionic/angular/standalone";
import { ModalBaseComponent } from "src/app/component/modal-base/modal-base.component";
import { InputSimpleComponent } from 'src/app/component/input/input-simple/input-simple.component';
import { SelectorSimpleComponent } from "src/app/component/input/selector-simple/selector-simple.component";
import { Gasto } from 'src/app/core/models/gasto.model';
import { Capacitor } from '@capacitor/core';
import { list } from 'ionicons/icons';
import { getIconPath, validarCuotasConRango, addMonthsSafe } from 'src/app/utils/Utils';
import { SelectorModalComponent } from 'src/app/component/input/selector-modal/selector-modal.component';
import { Categoria } from 'src/app/core/models/categoria.model';
import { EmptyBaseComponent } from "src/app/component/card/empty-base/empty-base.component";
import { RouterLink } from '@angular/router';
import { UpdateListado } from 'src/app/utils/update-params';
import { addIcons } from 'ionicons';
import { syncOutline } from 'ionicons/icons';
import { DynamicFormComponent } from 'src/app/component/form/dynamic-form/dynamic-form.component';
import { CustomTabsComponent } from 'src/app/component/custom-tabs/custom-tabs.component';

addIcons({
  'sync-outline': syncOutline
});

export default Swal;
@Component({
  selector: 'app-new-payment',
  templateUrl: './new-payment.page.html',
  styleUrls: ['./new-payment.page.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [IonIcon, IonItem,
    CommonModule,
    FormsModule,
    BannerTopComponent,
    SelectorModalComponent,
    IonToolbar,
    IonSegmentButton,
    IonLabel,
    IonSegment,
    IonContent,
    IonToggle,
    IonButton,
    IonDatetime,
    IonHeader, IonModal, IonTitle, IonButtons,
    ModalBaseComponent,
    InputSimpleComponent,
    SelectorSimpleComponent,
    IonFooter, EmptyBaseComponent, RouterLink, DynamicFormComponent, CustomTabsComponent]
})
export class NewPaymentPage extends BasePage implements OnInit {
  toolBar = {
    title: "Crear Gasto ",
    description: "Puedes crear un nuevo gasto llenando el siguiente formulario",
  }
  //myForm: FormGroup;
    valueSegment = 'normal';
    modoMonto = 'mensual';

    cambiarModoMonto(modo: string) {
      this.modoMonto = modo;
      const montoField = this.listaFormulario.find(f => f.id === 'monto');
      const calculadoField = this.listaFormulario.find(f => f.id === 'montoCalculado');
      const cuotasField = this.listaFormulario.find(f => f.id === 'cuotas' || f.id === 'cuota');
      
      if(montoField && calculadoField && cuotasField) {
         const currentInput = Number(montoField.valueSelect) || 0;
         const cuotas = Number(cuotasField.valueSelect) || 1;
         
         if (this.modoMonto === 'total') {
            montoField.titulo = 'Monto Total (GTQ)';
            calculadoField.titulo = 'Monto Mensual Calculado (GTQ)';
            montoField.valueSelect = String(currentInput * cuotas);
            calculadoField.valueSelect = String(currentInput);
         } else {
            montoField.titulo = 'Monto Mensual (GTQ)';
            calculadoField.titulo = 'Monto Total Calculado (GTQ)';
            montoField.valueSelect = String(currentInput / cuotas);
            calculadoField.valueSelect = String(currentInput);
         }
      }
    }
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

  isStartLoad:boolean = false;

  ionViewDidLeave() {
    this.closePopupClick();
   
  }

  insertInputs() {
    this.listaFormularioMain = [
      { id: 'titulo', titulo: 'Titulo', isError: false, placeholder: 'Ingrese el titulo del gasto', tipo: 'text', required: true },
      //{ id: 'descripcion', titulo: 'Descripcion', isError: false, placeholder: 'Ingrese la descripcion del gasto', tipo: 'text', required: false },
      { id: 'monto', titulo: 'Monto', isError: false, placeholder: 'Ingrese el monto del gasto', tipo: 'number', required: true },
      {
        id: 'categoria', titulo: 'Categoria', isError: false, placeholder: 'Seleccione la categoria del gasto', tipo: 'select', required: true, list: []
      },
      //{ id: 'fecha', titulo: 'Fecha Inicio', isError: false, placeholder: 'Seleccione la fecha del gasto', tipo: 'date', required: true, valueSelect: this.myApp.dateSelected }

    ]

    this.listaFormulario = [...this.listaFormularioMain]
    this.valueSegment = 'normal';
  }

  async ionViewWillEnter() {
    await this.getCategorias();
    this.clickSegment(this.valueSegment);
  }

  async ngOnInit() {
     this.insertInputs();
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
        this.listaFormulario = this.listaFormularioMain.map(obj => ({...obj}));
        const montoField = this.listaFormulario.find(item => item.id === 'monto');
        if (montoField) montoField.titulo = this.modoMonto === 'mensual' ? 'Monto Mensual (GTQ)' : 'Monto Total (GTQ)';

        this.listaFormulario.push({
          id: 'cuota', titulo: 'Cuotas', isError: false, placeholder: 'Ingrese el numero de cuotas', tipo: 'number', required: true, valueSelect: ''
        });
        this.listaFormulario.push({
          id: 'cuotaNum', titulo: 'Cuotas Pagadas', isError: false, placeholder: 'Ingrese el numero de cuotas pagadas', tipo: 'number', required: true, valueSelect: '1'
        });
        this.listaFormulario.push({
          id: 'montoCalculado', titulo: this.modoMonto === 'mensual' ? 'Monto Total Calculado (GTQ)' : 'Monto Mensual Calculado (GTQ)', isError: false, placeholder: '', tipo: 'read', required: false, valueSelect: ''
        });
        this.listaFormulario.push({
          id: 'fecha', titulo: 'Fecha Inicio: ', isError: false, placeholder: 'Seleccione la fecha del gasto', tipo: 'read', required: false, valueSelect: this.myApp.dateToday
        });
        this.listaFormulario.push({
          id: 'fechaEnd', titulo: 'Fecha Final:', isError: false, placeholder: 'Fecha Final (Solo lectura)', tipo: 'read', required: false, valueSelect: ''
        });
      } else {
        this.listaFormulario = this.listaFormularioMain.map(obj => ({...obj}));
        this.listaFormulario.push({
          id: 'fecha', titulo: 'Fecha Inicio', isError: false, placeholder: 'Seleccione la fecha del gasto', tipo: 'date', required: true, valueSelect: this.formatearFecha(new Date(this.myApp.dateToday))
        });
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

  goToNuevaCategoria() {
    this.showPopup = false;
    setTimeout(() => {
      this.router.navigate(['/categoria']);
    }, 150);
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
    // Guard contra doble-tap: si ya se está procesando, ignorar
    if (this.isStartLoad) return;
    this.isStartLoad = true;
    this.disabledButton = true;

   return this.baseService(async () => {
      const g: Gasto = {
        titulo: this.listaFormulario.find(item => item.id === 'titulo')?.valueSelect || '',
        descripcion: this.listaFormulario.find(item => item.id === 'descripcion')?.valueSelect || '',
          monto: this.valueSegment === 'cuota' && this.modoMonto === 'total' ? 
                 (Number(this.listaFormulario.find(item => item.id === 'monto')?.valueSelect) || 0) / (Number(this.listaFormulario.find(item => item.id === 'cuota')?.valueSelect) || 1) :
                 Number(this.listaFormulario.find(item => item.id === 'monto')?.valueSelect) || 0,
        categoria_id: Number(this.listaFormulario.find(item => item.id === 'categoria')?.valueSelect) || null,
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
          this.isStartLoad = false;
          this.disabledButton = false;
          return;
        }
      }

      const numId = await this.gastoService.addGasto(g, this.myApp.dateSelected, (this.isCheck && this.valueSegment === 'normal'),
        this.valueSegment === 'cuota' ?
          Number(this.listaFormulario.find(item => item.id === 'cuotaNum')?.valueSelect) || 1 : 1);

      this.getAlertSuccess('El gasto se ha guardado correctamente.');
      this.resetInputs();
      this.isStartLoad = false;
      this.resetNavigation();
    }, async () => {
      this.getAlertError('No se pudieron cargar los gastos.');
      this.isStartLoad = false;
      this.disabledButton = false;
    });


  }

    ionChangeInput(form: ItemInputData) {
      if (this.valueSegment === 'cuota' && (form.id === 'monto' || form.id === 'cuota')) {
        const montoField = this.listaFormulario.find(f => f.id === 'monto');
        const calculadoField = this.listaFormulario.find(f => f.id === 'montoCalculado');
        const cuotasField = this.listaFormulario.find(f => f.id === 'cuota');
        
        if(montoField && calculadoField && cuotasField) {
           const currentInput = Number(montoField.valueSelect) || 0;
           const cuotas = Number(cuotasField.valueSelect) || 1;
           
           if (this.modoMonto === 'total') {
              calculadoField.valueSelect = String(currentInput / cuotas);
           } else {
              calculadoField.valueSelect = String(currentInput * cuotas);
           }
        }
      }
    // form.isError = false;
    // if (form.required && !form.valueSelect) {
    //   form.isError = true;
    // }

    this.validarErrorInput(form);
    this.validButton();
  }

  manejarAccionFormulario(event: any) {
    if (event.action === 'date-modal') {
      this.clickDateModal(event.field);
    } else if (event.action === 'select-action') {
      this.goToNuevaCategoria();
    }
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
            fechaInicial.valueSelect = addMonthsSafe(this.myApp.dateToday, -(cuotasPagadas - 1));
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
    if (!fechaInicial) return '';
    return addMonthsSafe(fechaInicial, cantidadMeses);
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

      this.validarErrorInput(this.dataSelect as ItemInputData);
      this.validButton();
    }
    
  }

  onClickItemAction(form: ItemInputData) {
    this.showPopup = true;
    this.dataListaSelect = form.list || [];
    this.tipoModalUse = 'select';
    this.dataSelect = form;
  }
}




