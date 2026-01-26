import { Component, OnInit } from '@angular/core';
import { DetailsPaymentComponent } from "../details-payment/details-payment.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-payment',
  templateUrl: './category-payment.component.html',
  styleUrls: ['./category-payment.component.scss'],
  imports: [DetailsPaymentComponent,CommonModule],
})
export class CategoryPaymentComponent implements OnInit {

  mostrar: boolean = true;
  textMostrar = '-';

  constructor() { }

  ngOnInit() { }

  onClickMostrar(){
    this.mostrar = !this.mostrar;
    this.textMostrar = this.mostrar ? '-' : '+';
  }
}
