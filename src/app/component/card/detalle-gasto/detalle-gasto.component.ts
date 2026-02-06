import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Gasto } from 'src/app/core/models/gasto.model';
import { DetailsPaymentComponent } from "../../details-payment/details-payment.component";
import { IonToggle, IonButton, IonItem } from "@ionic/angular/standalone";
import { FormsModule } from "@angular/forms";
import { CatalogoTipoGasto } from 'src/app/utils/Utils';
import { ButtonSimpleComponent } from "../../input/button-simple/button-simple.component";
import Swal from 'sweetalert2';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-detalle-gasto',
  templateUrl: './detalle-gasto.component.html',
  styleUrls: ['./detalle-gasto.component.scss'],
  imports: [IonItem, IonButton, IonToggle, DetailsPaymentComponent, FormsModule, ButtonSimpleComponent],
})
export class DetalleGastoComponent implements OnInit {
  @Input() gastoSelect?: Gasto;
  @Output() clickCheck: EventEmitter<Gasto> = new EventEmitter<Gasto>();
  @Output() clickDelete: EventEmitter<Gasto> = new EventEmitter<Gasto>();
  @Output() clickEdit: EventEmitter<Gasto> = new EventEmitter<Gasto>();

  isCheck: boolean = false
  isDeleteHiden: boolean = false

  constructor(public toastController: ToastController) { }

  ngOnInit() {
    if (this.gastoSelect?.tipo === CatalogoTipoGasto.CUOTA) {
      this.isDeleteHiden = true;
      this.isCheck = this.gastoSelect?.gastoCuota?.estado_cuota == 1;
    } else {
      this.isCheck = this.gastoSelect?.estado == 1;
    }
  }

  onChange() {
    if (this.gastoSelect) {
      if (this.gastoSelect?.tipo === CatalogoTipoGasto.CUOTA && this.gastoSelect.gastoCuota) {
        this.gastoSelect.gastoCuota.estado_cuota = this.isCheck ? 1 : 0;
      } else {
        this.gastoSelect.estado = this.isCheck ? 1 : 0;
      }

      this.clickCheck.emit(this.gastoSelect);
    }
  }


  clickRigthButton() {
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
      this.clickDelete.emit(this.gastoSelect);
    });
  }
  clickLeftButton() {
    this.clickEdit.emit(this.gastoSelect);
  }


  async toastMessage(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      position: 'bottom'
    });

    await toast.present();
  }
}
