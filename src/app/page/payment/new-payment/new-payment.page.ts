import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from "@ionic/angular";
import { BannerTopComponent } from "src/app/component/card/banner-top/banner-top.component";
import { ItemInputData } from 'src/app/models/ItemInputData.model';
import { ComponentModule } from "src/app/component/components.module";
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
export default Swal;
@Component({
  selector: 'app-new-payment',
  templateUrl: './new-payment.page.html',
  styleUrls: ['./new-payment.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BannerTopComponent,
    ComponentModule
  ]
})
export class NewPaymentPage implements OnInit {
  toolBar = {
    title: "Crear Gasto ",
    description: "Puedes crear un nuevo gasto llenando el siguiente formulario",
  }

  valueSegment = 'normal';
  maxYear = '';
  disabledButton = true;
  dataSelect: ItemInputData | null = null;

  showPopup = false;
  listaFormularioMain: ItemInputData[] = [
    { id: 'titulo', titulo: 'Titulo', isError: false, placeholder: 'Ingrese el titulo del gasto', tipo: 'text', required: true },
    { id: 'descripcion', titulo: 'Descripcion', isError: false, placeholder: 'Ingrese la descripcion del gasto', tipo: 'text', required: false },
    { id: 'monto', titulo: 'Monto', isError: false, placeholder: 'Ingrese el monto del gasto', tipo: 'number', required: true },
    {
      id: 'categoria', titulo: 'Categoria', isError: false, placeholder: 'Seleccione la categoria del gasto', tipo: 'select', required: false, list: [
        { code: 'comida', value: 'Comida' },
        { code: 'transporte', value: 'Transporte' },
      ]
    },
    {
      id: 'Etiqueta', titulo: 'Etiqueta', isError: false, placeholder: 'Seleccione la etiqueta del gasto', tipo: 'select', required: false, list: [
        { code: 'urgente', value: 'Urgente' },
        { code: 'opcional', value: 'Opcional' },
      ]
    },
    //{ id: 'fecha', titulo: 'Fecha', isError: false, placeholder: 'Seleccione la fecha del gasto', tipo: 'date', required: true, valueSelect: '2027-01-26' },
    // { id: 'fechaEnd', titulo: 'Fecha', isError: false, placeholder: 'Seleccione la fecha del gasto', tipo: 'date', required: true, valueSelect: '2027-01-26' },
  ];

  listaFormulario: ItemInputData[] = [...this.listaFormularioMain];

  constructor(private router: Router, public myApp: AppComponent) { }

  ngOnInit() {
    const date = new Date();
    const year = date.getFullYear();

    this.maxYear = Number(year.toString()) + 10 + '';
    console.log('Fecha actual formateada (YYYY-MM-DD):', this.myApp.dateToday);
    const fechaForm = this.listaFormulario.find(item => item.id === 'fecha');
    if (fechaForm) {
      fechaForm.valueSelect = this.myApp.dateToday;
    }


    if (this.valueSegment != 'cuota') {
      this.listaFormulario = [...this.listaFormularioMain];
      this.listaFormulario.push(
        { id: 'fecha', titulo: 'Fecha Inicio', isError: false, placeholder: 'Seleccione la fecha del gasto', tipo: 'date', required: true, valueSelect: this.myApp.dateToday }
      )
    }
  }

  clickSegment(value: string) {
    this.valueSegment = value;
    console.log("Segmento seleccionado: ", this.listaFormulario);
    if (value === 'cuota') {
      this.listaFormulario = [...this.listaFormularioMain];
      this.listaFormulario.push({
        id: 'cuota', titulo: 'Cuotas', isError: false, placeholder: 'Ingrese el numero de cuotas', tipo: 'number', required: true,
        valueSelect: '1'
      })
      this.listaFormulario.push({
        id: 'cuotaNum', titulo: 'Cuotas Pagadas', isError: false, placeholder: 'Ingrese el numero de cuotas pagadas', tipo: 'number', required: true,
        valueSelect: '1'
      })

      this.listaFormulario.push(
        { id: 'fecha', titulo: 'Fecha Inicio', isError: false, placeholder: 'Seleccione la fecha del gasto', tipo: 'date', required: true, valueSelect: this.myApp.dateToday }
      )
      this.listaFormulario.push({
        id: 'fechaEnd', titulo: 'Fecha Final', isError: false, placeholder: 'Seleccione la fecha final del gasto', tipo: 'date', required: true, valueSelect: ''
      })
    } else {
      this.listaFormulario = [...this.listaFormularioMain];
      this.listaFormulario.push(
        { id: 'fecha', titulo: 'Fecha Inicio', isError: false, placeholder: 'Seleccione la fecha del gasto', tipo: 'date', required: true, valueSelect: this.myApp.dateToday }
      )
    }
    this.validButton();
  }

  clickDateModal(form: ItemInputData) {
    this.showPopup = true;
    this.dataSelect = form;
  }

  closePopupClick() {
    this.showPopup = false;
  }

  onMonthYearChange(event: any) {
    const selectedDate = event.detail.value;
    console.log('Fecha seleccionada:', selectedDate);
    if (!selectedDate) return;

    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = date.getDate();

    const formattedDate = `${year}-${month}-${day}`;
    console.log('Fecha formateada (YYYY-MM):', formattedDate);
    if (this.dataSelect) {
      this.dataSelect.valueSelect = formattedDate;
    }
  }

  saveNewPayment() {
    // Swal.fire({
    //   title: 'Todo bien',
    //   text: 'SweetAlert funcionando en Ionic 🚀',
    //   icon: 'success',
    //   heightAuto: false
    // });

    Swal.fire({
      position: "center",
      icon: "success",
      title: "Se ha guardado el pago correctamente",
      showConfirmButton: false,
      timer: 1500,
      heightAuto: false,
      width: 500,
      padding: "3em",
      color: "var(--ion-background-color)",
      customClass: {
        title: 'swal-title-small',
        htmlContainer: 'swal-text-small'
      },
    });

    this.router.navigate(['/tabs/home']);
  }

  ionChangeInput(form: ItemInputData) {
    console.log('Change input:', form);
    // form.isError = false;
    // if (form.required && !form.valueSelect) {
    //   form.isError = true;
    // }

    this.validButton();
  }

  validButton() {
    const hasError = this.listaFormulario.some(item => item.isError || (item.required && !item.valueSelect));
    this.disabledButton = hasError;

  }

  blurInput(form: ItemInputData) {
    console.log('Blur input:', form);
    switch (form.id) {
      case 'cuota':
        this.calculadoraFecha(form);
        break;
      case 'cuotaNum':
        const num = Number(form.valueSelect);
        const nuevaFechaFin = this.sumarMeses(this.myApp.dateToday, -num);
        const fechaEndItem = this.listaFormulario.find(item => item.id === 'fecha');
        if (fechaEndItem) {
          fechaEndItem.valueSelect = nuevaFechaFin;
          const cuota = this.listaFormulario.find(item => item.id === 'cuota');
          if (cuota && cuota.valueSelect) {
            this.calculadoraFecha(cuota);
          }
        }

        break;
      default:
        break;
    }

  }

  calculadoraFecha(form: ItemInputData) {
    const fechaInicioItem = this.listaFormulario.find(item => item.id === 'fecha');
    if (fechaInicioItem && fechaInicioItem.valueSelect) {
      const nuevaFechaFin = this.sumarMeses(fechaInicioItem.valueSelect, Number(form.valueSelect));
      const fechaEndItem = this.listaFormulario.find(item => item.id === 'fechaEnd');
      if (fechaEndItem) {
        fechaEndItem.valueSelect = nuevaFechaFin;
      }
    }
  }

  sumarMeses(fechaInicial: string, cantidadMeses: number): string {
    const fecha = new Date(fechaInicial);

    fecha.setMonth(fecha.getMonth() + cantidadMeses);

    return this.formatearFecha(fecha);
  }

  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

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
}
