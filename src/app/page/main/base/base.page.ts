import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';

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

  constructor(public router: Router, public myApp: AppComponent) {
    const date = new Date();
    const year = date.getFullYear();

    this.maxYear = Number(year.toString()) + 10 + '';

  }

  getFormatDate(): string {
    const numMes = this.myApp.getFragmentDate()[1];
    const mes = this.meses.find(m => m.id === numMes)?.nombre;
    return `${mes} | ${this.myApp.getFragmentDate()[0]}`;
  }
}
