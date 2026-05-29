import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter } from '@ionic/angular/standalone';
import { Route, Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { GastoServiceService } from 'src/app/services/gasto-service.service';
import Swal from 'sweetalert2';
import { Capacitor } from '@capacitor/core';
import { addIcons } from 'ionicons';
import { barbellOutline, createOutline, trashOutline } from 'ionicons/icons';
import { CategoriaServiceService } from 'src/app/services/categoria-service.service';
import { getIconPath } from 'src/app/utils/Utils';
import { ItemInputData } from 'src/app/models/ItemInputData.model';
import { UpdateListado, UpdateParamData } from 'src/app/utils/update-params';
import { ControlGastosAutomaticosService } from 'src/app/services/control-gastos-automaticos.service';
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { NavCtrl } from 'src/app/services/nav-ctrl';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-base',
  templateUrl: './base.page.html',
  styleUrls: ['./base.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ]
})
export class BasePage {

  meses = [
    { id: '01', nombre: 'Enero' },
    { id: '02', nombre: 'Febrero' },
    { id: '03', nombre: 'Marzo' },
    { id: '04', nombre: 'Abril' },
    { id: '05', nombre: 'Mayo' },
    { id: '06', nombre: 'Junio' },
    { id: '07', nombre: 'Julio' },
    { id: '08', nombre: 'Agosto' },
    { id: '09', nombre: 'Septiembre' },
    { id: '10', nombre: 'Octubre' },
    { id: '11', nombre: 'Noviembre' },
    { id: '12', nombre: 'Diciembre' }
  ];

  maxYear = '';

  constructor(public router: Router, public myApp: AppComponent,
    public gastoService: GastoServiceService,
    public fb: FormBuilder, public categoriaService: CategoriaServiceService,
    public controlService: ControlGastosAutomaticosService,
    public toastController: ToastController,
    public navCtrl: NavCtrl,
    public alertController: AlertController
  ) {
    const date = new Date();
    const year = date.getFullYear();

    this.maxYear = Number(year.toString()) + 10 + '';

    addIcons({ barbellOutline,createOutline,trashOutline });
  }

  loaderNav = false;

  getFormatDate(): string {
    const numMes = this.myApp.getFragmentDate()[1];
    const mes = this.meses.find(m => m.id === numMes)?.nombre;
    return `${mes} | ${this.myApp.getFragmentDate()[0]}`;
  }

  getAlertError(error: any) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error instanceof Error ? error.message : 'Ha ocurrido un error intente nuevamente',
      heightAuto: false,
      width: 500,
      padding: "3em",
      color: "var(--ion-background-color)",
      customClass: {
        title: 'swal-title-small',
        htmlContainer: 'swal-text-small'
      },
    });
  }

  getAlertSuccess(message: string) {
    Swal.fire({
      position: "center",
      icon: "success",
      title: message,
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
  }


  async baseService(callback: () => Promise<void>, callError?: () => Promise<void>, callFinally?: () => Promise<void>, addCapasitorCheck: boolean = true) {
    try {
      if (Capacitor.getPlatform() === 'web' && addCapasitorCheck) return;
      //throw new Error('Funcionalidad no disponible en la plataforma web.');
      return await callback();
    } catch (error) {
      console.error('Error obteniendo gastos:', error);
      if (callError) {
        return await callError();
      }
    } finally {
      if (callFinally) {
        return await callFinally();
      }

    }
  }

  getIcon(icon: string, def: string = 'assets/ionicons/bar-chart-outline.svg') {
    return getIconPath(icon, def);
  }

  focusInputIdInput(form: ItemInputData) {
    setTimeout(() => {
      const inputSimple = document.getElementById(form.id);
      inputSimple?.querySelector('input')?.focus();
    })
  }

  loadUpdateParam(name: UpdateListado, value: boolean = false) {
    //this.myApp.writterParams[name].isLoad = value;
  }

  getUpdateParam(name: UpdateListado) {
    //return this.myApp.writterParams[name].isLoad;
  }

  showLoader() {
    this.loaderNav = true;
  }

  dissmissLoader() {
    this.loaderNav = false;
  }

  resetNavigation() {
    this.navCtrl.setRoot('HomePage');
  }

  historialNavigation() {
    console.log(this.navCtrl.getHistorial());
    return this.navCtrl.getHistorial();
  }

  async toastMessage(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      position: 'bottom'
    });

    await toast.present();
  }

  async getParametros() {
    const response = await this.navCtrl.getParams()
    return response;
  }

  getNameMonth(month: string) {
    const findMonth = this.meses.find(res => res.id === month);
    if (findMonth) {
      return findMonth.nombre
    } else {
      const num = Number(month) - 1;
      return this.meses[num].nombre;
    }
  }


  modalDelete(callback: () => Promise<void>) {
    Swal.fire({
      title: "Estas Seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, ¡eliminalo!",
      heightAuto: false,
      width: 500,
      padding: "3em",
      color: "var(--ion-background-color)",
      customClass: {
        title: 'swal-title-small',
        htmlContainer: 'swal-text-small'
      },
    }).then((result) => {
      callback();
    });
  }
}
