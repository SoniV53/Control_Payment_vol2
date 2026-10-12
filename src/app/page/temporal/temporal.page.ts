import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton,IonModal,IonItem,IonInput } from '@ionic/angular/standalone';

@Component({
  selector: 'app-temporal',
  templateUrl: './temporal.page.html',
  styleUrls: ['./temporal.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton,IonModal,IonItem,IonInput]
})
export class TemporalPage {

  @ViewChild('modal') modal!: IonModal;
  @ViewChild('input') input!: IonInput;

  constructor() { }
  
  async openModal() {
    await this.modal.present();

    // pequeño delay para asegurar render + animación
    setTimeout(async () => {
      await this.input.setFocus();
    },10);
  }
}
