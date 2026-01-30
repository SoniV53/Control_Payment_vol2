import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { GastoServiceService } from 'src/app/services/gasto-service.service';
import Swal from 'sweetalert2';
import { Capacitor } from '@capacitor/core';
import { addIcons } from 'ionicons';
import { barbellOutline } from 'ionicons/icons';

@Component({
  selector: 'app-base',
  templateUrl: './base.page.html',
  styleUrls: ['./base.page.scss'],
  standalone: true,
  imports: [IonFooter,
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

  constructor(public router: Router, public myApp: AppComponent, public gastoService: GastoServiceService, public fb: FormBuilder) {
    const date = new Date();
    const year = date.getFullYear();

    this.maxYear = Number(year.toString()) + 10 + '';

    addIcons({ barbellOutline });
  }

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


  async baseService(callback: () => Promise<void>, callError?: () => Promise<void>, addCapasitorCheck: boolean = true) {
    try {
      if (Capacitor.getPlatform() === 'web' && addCapasitorCheck) return;
      //throw new Error('Funcionalidad no disponible en la plataforma web.');
      return await callback();
    } catch (error) {
      console.error('Error obteniendo gastos:', error);
      if (callError) {
        return await callError();
      }
    }
  }
}
