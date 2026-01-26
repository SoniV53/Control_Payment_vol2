import { Component, Input, OnInit } from '@angular/core';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';

@Component({
  selector: 'app-card-option',
  templateUrl: './card-option.component.html',
  styleUrls: ['./card-option.component.scss'],
  imports: [IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol],
})
export class CardOptionComponent implements OnInit {

  @Input() dataCard = {
    title: "",
    description: ""
  }

  constructor() { }

  ngOnInit() { }

}