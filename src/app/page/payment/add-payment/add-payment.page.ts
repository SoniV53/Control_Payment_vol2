import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonInput, IonHeader, IonToolbar, IonSegment, IonSegmentButton, IonLabel, IonSegmentView, IonSegmentContent } from '@ionic/angular/standalone';
import { BannerTopComponent } from "../../../component/card/banner-top/banner-top.component";
import { BasePage } from '../../main/base/base.page';
import { GastoRecurrente } from 'src/app/core/models/gasto_recurrente.model';
import { Categoria } from 'src/app/core/models/categoria.model';
import { CategoryPaymentComponent } from "src/app/component/category-payment/category-payment.component";
import { Gasto } from 'src/app/core/models/gasto.model';
import { CatalogoTipoGasto } from 'src/app/utils/Utils';

@Component({
  selector: 'app-add-payment',
  templateUrl: './add-payment.page.html',
  styleUrls: ['./add-payment.page.scss'],
  standalone: true,
  imports: [IonInput, IonContent, CommonModule, FormsModule, BannerTopComponent, IonHeader, IonToolbar, IonSegment, IonSegmentButton, IonLabel, IonSegmentView, IonSegmentContent, CategoryPaymentComponent]
})
export class AddPaymentPage extends BasePage implements OnInit {
  toolBar = {
    title: "Gastos Recurrentes",
    description: "A qui puedes visualizar tus gastos Recurrentes"
  }

  listadoGastosRecurrentes: GastoRecurrente[] = []
  listCategoria: Categoria[] = []

  valueSegment:string = 'recurrente'

  ngOnInit() {
  }

  async ionViewWillEnter() {
    await this.getCategorias()
    await this.getRecurrentes();

  }

  getCategorias() {
    return this.baseService(async () => {
      this.listCategoria = await this.categoriaService.getCategoriasActivas();
      // this.listCategoria = [
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

      console.log('categorias cargados:', this.listCategoria);
    }, async () => {
      this.getAlertError('No se pudieron cargar.');
    }, async () => {
      this.dissmissLoader();
    });
  }

  getRecurrentes() {
    return this.baseService(async () => {
      this.showLoader()
      this.listadoGastosRecurrentes = await this.gastoService.getGastosRecurrentes();
      // for (let index = 0; index < 10; index++) {
      //   let dum = {
      //     id: index + 1,
      //     titulo: "test",
      //     fechaInicio: '2026-02-06',
      //     monto: 200,
      //     activo: 1,
      //     categoria_id: 1,
      //     frecuencia: "mensual",
      //     proxima_fecha: '',
      //     cantidad:10
      //   }
      //   if (index % 2 == 0) {
      //     dum.categoria_id = 2;
      //   }
      //   this.listadoGastosRecurrentes.push(dum)
      // }

      for (let item of this.listCategoria) {
        const listaB = this.listadoGastosRecurrentes.filter(res => res.categoria_id == item.id).map(this.modelAToModelB);
        if (listaB) {
          item.dataGasto = listaB;
        }

      }

    }, async () => {
      this.getAlertError('No se pudieron cargar.');
    }, async () => {
      this.dissmissLoader();
    });
  }

  clickItem(cate: Gasto) { }

  modelAToModelB(a: GastoRecurrente): Gasto {
    return {
      id: a.id,
      titulo: a.titulo,
      monto: a.monto,
      fecha: a.fechaInicio,
      estado: a.activo,
      tipo: CatalogoTipoGasto.RECURRENTE,
      categoria_id: a.categoria_id,
      cantidad: a.cantidad,
    };
  }

  clickSegment(){
    
  }
}
