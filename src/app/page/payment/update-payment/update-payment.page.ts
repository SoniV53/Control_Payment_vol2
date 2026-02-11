import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToggle, IonToolbar, IonFooter, IonButton, IonDatetime, IonItem, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { BasePage } from '../../main/base/base.page';
import { BannerTopComponent } from "src/app/component/card/banner-top/banner-top.component";
import { Gasto } from 'src/app/core/models/gasto.model';
import { ItemInputData, ItemInputListData } from 'src/app/models/ItemInputData.model';
import { SelectorSimpleComponent } from "src/app/component/input/selector-simple/selector-simple.component";
import { CatalogoTipoGasto, validarCuotasConRango } from 'src/app/utils/Utils';
import { InputSimpleComponent } from "src/app/component/input/input-simple/input-simple.component";
import { ModalBaseComponent } from "src/app/component/modal-base/modal-base.component";
import { EmptyBaseComponent } from "src/app/component/card/empty-base/empty-base.component";
import { RouterLink } from '@angular/router';
import { DetalleItemModel } from 'src/app/core/models/detalle-item.model';
import { Categoria } from 'src/app/core/models/categoria.model';
import { GastoRecurrente } from 'src/app/core/models/gasto_recurrente.model';
import { ButtonSimpleComponent } from "src/app/component/input/button-simple/button-simple.component";

@Component({
  selector: 'app-update-payment',
  templateUrl: './update-payment.page.html',
  styleUrls: ['./update-payment.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, RouterLink, IonToolbar, CommonModule, FormsModule,
    BannerTopComponent, IonFooter, SelectorSimpleComponent, InputSimpleComponent, IonButton, ModalBaseComponent,
    IonDatetime, IonItem, IonIcon, IonLabel, EmptyBaseComponent, IonToggle, ButtonSimpleComponent]
})
export class UpdatePaymentPage extends BasePage implements OnInit {
  toolBar = {
    title: "Actualiza Gasto",
    description: "Puedes actualizar tu gasto, tomar en cuenta que no todo los campos se podran editar",
  }
  gasto?: Gasto
  listCategoria: Categoria[] = []

  disabledButton = true;
  dataSelect: ItemInputData | null = null;
  dataCard = {
    title: "No Hay Categorias",
    description: "",
    icon: "file-tray-outline"
  }

  showPopup = false;
  isDeleteHiden: boolean = false
  //listaFormularioMain: ItemInputData[] = [];

  listadoDetalle: DetalleItemModel[] = []
  listaFormulario: ItemInputData[] = [];
  dataListaSelect: ItemInputListData[] = [];
  dataSelectItem: any = {};
  tipoModalUse: string = 'date';
  isCheck: boolean = false;
  isCheckCancel: boolean = false;
  event: any;

  notaMsg = '';

  async ngOnInit() {
    const param = await this.getParametros();
    this.gasto = param.gasto;

  }

  async ionViewWillEnter() {
    // const listCategoria = [
    //   {
    //     "id": 1,
    //     "icono": "fast-food-outline",
    //     "nombre": "comida",
    //     "totalMonto": 0,

    //   },
    //   {
    //     "id": 2,
    //     "icono": "business-outline",
    //     "nombre": "papas",
    //     "totalMonto": 0,
    //   }
    // ];
    // this.formularioNormal(listCategoria);
    // this.formularioRecurrente(listCategoria);
    // this.formularioCuota(listCategoria);

    await this.getCategorias();

  }

  ionViewDidLeave() {
    this.closePopupClick();
  }

  ionChangeToggle() {
    const tipo = this.listadoDetalle.find(res => res.titulo === 'Tipo');
    if (tipo) {
      tipo.valor = this.isCheck ? 'Recurrente' : 'Normal'
    }
  }


  refreshRecurrente() {
    this.getGastoRecurrente();
    this.validButton();
  }

  formularioNormal(categoria?: Categoria[]) {
    if (this.gasto?.tipo === CatalogoTipoGasto.NORMAL) {
      const [yearI, monthI] = this.getFragmentDate(this.gasto.fecha)

      this.listadoDetalle = [
        { titulo: 'Fecha', valor: `${yearI} / ${this.getNameMonth(monthI)}` },
        { titulo: 'Tipo', valor: "Normal" },
      ]

      this.isCheckCancel = this.gasto.estado == 1;

      const form: ItemInputData[] = [
        {
          id: 'titulo', titulo: 'Titulo', isError: false, placeholder: 'Ingrese el titulo del gasto', tipo: 'text', required: true,
          valueSelect: this.gasto.titulo
        },
        { id: 'monto', titulo: 'Monto', isError: false, placeholder: 'Ingrese el monto del gasto', tipo: 'number', required: true, valueSelect: this.gasto.monto },
        {
          id: 'categoria', titulo: 'Categoria', isError: false, placeholder: 'Seleccione la categoria del gasto', tipo: 'select',
          required: true, list: []
        },
      ]
      if (categoria) {
        const cate = form[2];
        categoria.map(res => {
          if (this.gasto && res.id === this.gasto.categoria_id && cate) {
            cate.code = res.id
            cate.valueSelect = res.nombre
          }
          cate?.list?.push({ code: res.id || 0, value: res.nombre, icon: res.icono });
        })
      }

      this.listaFormulario = [...form]
    }
  }

  formularioRecurrente(categoria?: Categoria[]) {
    if (this.gasto?.tipo === CatalogoTipoGasto.RECURRENTE) {
      const [yearI, monthI] = this.getFragmentDate(this.gasto.fecha)
      this.notaMsg = "Nota: Al actualizar un gasto, la modificación se aplicará únicamente a la fecha registrada."
      this.listadoDetalle = [
        { titulo: 'Fecha', valor: `${yearI} / ${this.getNameMonth(monthI)}` },
        { titulo: 'Tipo', valor: "Recurrente" },
      ]

      this.isCheckCancel = this.gasto.estado == 1;

      const form: ItemInputData[] = [
        {
          id: 'titulo', titulo: 'Titulo', isError: false, placeholder: 'Ingrese el titulo del gasto', tipo: 'text', required: true,
          valueSelect: this.gasto.titulo
        },
        { id: 'monto', titulo: 'Monto', isError: false, placeholder: 'Ingrese el monto del gasto', tipo: 'number', required: true, valueSelect: this.gasto.monto },
        {
          id: 'categoria', titulo: 'Categoria', isError: false, placeholder: 'Seleccione la categoria del gasto', tipo: 'select', required: true, list: []
        },
      ]
      if (categoria) {
        const cate = form[2];
        categoria.map(res => {
          if (this.gasto && res.id === this.gasto.categoria_id && cate) {
            cate.code = res.id
            cate.valueSelect = res.nombre
          }
          cate?.list?.push({ code: res.id || 0, value: res.nombre, icon: res.icono });
        })
      }

      this.listaFormulario = [...form]
    }
  }

  formularioCuota(categoria?: Categoria[]) {
    if (this.gasto?.tipo === CatalogoTipoGasto.CUOTA) {
      this.isDeleteHiden = true;
      const [yearI, monthI] = this.getFragmentDate(this.gasto.fecha)
      const [yearF, monthF] = this.getFragmentDate(this.gasto.fechaEnd)
      const findCate = categoria?.find(res => res.id === this.gasto?.categoria_id);

      this.notaMsg = "Nota: Al actualizar un gasto, la modificación se aplicará únicamente a la fecha registrada."
      this.listadoDetalle = [
        { titulo: 'Titulo:', valor: this.gasto.titulo },
        { titulo: 'Fecha Inicio:', valor: `${yearI} / ${this.getNameMonth(monthI)}` },
        { titulo: 'Fecha Final:', valor: `${yearF} / ${this.getNameMonth(monthF)}` },
        { titulo: 'Cuotas', valor: `${this.gasto.gastoCuota?.numero_cuota} / ${this.gasto.cuotas}` },
        { titulo: 'Gategoria', valor: findCate?.nombre || '' },
        { titulo: 'Tipo', valor: "Cuota" },
      ]
      this.isCheckCancel = this.gasto.gastoCuota?.estado_cuota == 1;

      const form: ItemInputData[] = [
        {
          id: 'monto', titulo: 'Monto', isError: false, placeholder: 'Ingrese el monto del gasto', tipo: 'number', required: true,
          valueSelect: this.gasto.gastoCuota?.monto_cuota
        },
      ]

      this.listaFormulario = [...form]
    }
  }

  getCategorias() {
    this.baseService(async () => {
      this.showLoader();
      this.listCategoria = await this.categoriaService.getCategoriasActivas();
      this.formularioNormal(this.listCategoria);
      this.formularioRecurrente(this.listCategoria);
      this.formularioCuota(this.listCategoria);
    }, async () => {
      this.getAlertError('No se pudieron cargar.');
    }, async () => {
      this.dissmissLoader();
    });
  }

  getGastoRecurrente() {
    this.baseService(async () => {
      if (this.gasto?.recurrente_id) {
        this.showLoader();
        const recurrenteList: GastoRecurrente[] = await this.gastoService.getGastosRecurrentesById(this.gasto?.recurrente_id.toString());
        const recurrente: GastoRecurrente = recurrenteList[0];
        this.gasto.categoria_id = recurrente.categoria_id;
        this.gasto.titulo = recurrente.titulo;
        this.gasto.descripcion = recurrente.descripcion;
        this.gasto.monto = recurrente.monto;

        this.formularioRecurrente(this.listCategoria);
      }

    }, async () => {
      this.getAlertError('No se pudieron cargar.');
    }, async () => {
      this.dissmissLoader();
    });
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
    const selectedDate = this.event.detail.value;
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

  async updatePayment() {
    this.baseService(async () => {
      if (this.gasto) {
        const gastoData = this.gasto;
        if (gastoData.tipo != CatalogoTipoGasto.CUOTA) {
          gastoData.titulo = this.findFormId('titulo')?.valueSelect || '';
          gastoData.monto = this.findFormId('monto')?.valueSelect || '';
          gastoData.categoria_id = Number(this.findFormId('categoria')?.code) || null;
          gastoData.estado = this.isCheckCancel ? 1 : 0;
        } else {
          if (gastoData.gastoCuota) {
            gastoData.gastoCuota.monto_cuota = this.findFormId('monto')?.valueSelect || ''
            gastoData.gastoCuota.estado_cuota = this.isCheckCancel ? 1 : 0;
          }
        }

        await this.gastoService.updateGasto(this.gasto, this.isCheck);

        this.getAlertSuccess('El gasto se ha actualizado correctamente.');
        this.resetNavigation();
      }
    }, async () => {
      this.getAlertError('No se pudieron cargar los gastos.');
    });
  }

  ionChangeInput(form: ItemInputData) {
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

  getFragmentDate(date: string | any): string[] {
    if (date) {
      const selected = new Date(date);
      const year = selected.getFullYear().toString();
      const month = String(selected.getMonth() + 1).padStart(2, '0');
      const day = String(selected.getDate()).padStart(2, '0');

      return [year, month, day];
    }
    return []

  }



  findFormId(value: string) {
    return this.listaFormulario.find(res => res.id === value);
  }

  deletePayment() {
    this.modalDelete(async () => {
      this.baseService(async () => {
        if (this.gasto) {
          await this.gastoService.eliminarEstadoGasto(this.gasto);
          this.toastMessage("Se Elimino correctamente");
          this.resetNavigation();
        }
      }, async () => {
        this.getAlertError('No se pudieron cargar.');
      });
    });
  }
}
