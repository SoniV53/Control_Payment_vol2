import { Component, OnInit } from '@angular/core';
import { IonGrid, IonRow, IonCol } from "@ionic/angular/standalone";

@Component({
  selector: 'app-details-payment',
  templateUrl: './details-payment.component.html',
  styleUrls: ['./details-payment.component.scss'],
  imports: [IonCol, IonRow, IonGrid],
})
export class DetailsPaymentComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
