import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms';
import { IonContent, IonInput, IonHeader, IonToolbar, IonSegment, IonSegmentButton, IonLabel, IonSegmentView, IonSegmentContent } from '@ionic/angular/standalone';
import { BannerTopComponent } from "../../../component/card/banner-top/banner-top.component";
import { BasePage } from '../../main/base/base.page';
import { GastoRecurrente } from 'src/app/core/models/gasto_recurrente.model';
import { Categoria } from 'src/app/core/models/categoria.model';
import { CategoryPaymentComponent } from "src/app/component/category-payment/category-payment.component";
import { Gasto } from 'src/app/core/models/gasto.model';
import { CatalogoTipoGasto } from 'src/app/utils/Utils';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { GastoServiceService } from 'src/app/services/gasto-service.service';
import { CategoriaServiceService } from 'src/app/services/categoria-service.service';
import { ControlGastosAutomaticosService } from 'src/app/services/control-gastos-automaticos.service';
import { NavCtrl } from 'src/app/services/nav-ctrl';
import { CuotaServiceService } from 'src/app/services/cuota-service.service';

@Component({
  selector: 'app-add-payment',
  templateUrl: './add-payment.page.html',
  styleUrls: ['./add-payment.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, BannerTopComponent, CategoryPaymentComponent]
})
export class AddPaymentPage extends BasePage implements OnInit {
  toolBar = {
    title: "Gastos Automaticos",
    description: "Administra tus gastos recurrentes y cuotas."
  }

  listadoGastosRecurrentes: GastoRecurrente[] = []
  listCategoria: Categoria[] = []
  gruposProgreso: any[] = [];

  valueSegment: string = 'recurrente'
  isEditModalOpen = false;
  gastoSeleccionado: any = null;
  editData = { titulo: '', monto: 0, cuotas: 1, categoria_id: 0 };
  isModalOpen = false;
  detalleCuotas: any[] = [];

  constructor(
    public override router: Router,
    public override myApp: AppComponent,
    public override gastoService: GastoServiceService,
    public override fb: FormBuilder,
    public override categoriaService: CategoriaServiceService,
    public override controlService: ControlGastosAutomaticosService,
    public override toastController: ToastController,
    public override navCtrl: NavCtrl,
    public override alertController: AlertController,
    private cuotaService: CuotaServiceService
  ) {
    super(router, myApp, gastoService, fb, categoriaService, controlService, toastController, navCtrl, alertController);
  }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    await this.getCategorias()
    await this.getRecurrentes();
    await this.cargarCuotas();

  }

  getCategorias() {
    return this.baseService(async () => {
      this.listCategoria = await this.categoriaService.getCategoriasActivas();


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

  async cargarCuotas() {
    await this.baseService(
      async () => {
        this.showLoader();
        const data = await this.cuotaService.getCuotasConProgreso();

        const gruposMap = data.reduce((acc: any, cur: any) => {
          const cat = cur.cat_nombre || 'Sin Categoría';
          if (!acc[cat]) acc[cat] = { nombre: cat, icono: cur.cat_icono, items: [] };
          acc[cat].items.push(cur);
          return acc;
        }, {});

        const allGroups = Object.values(gruposMap);

        this.gruposProgreso = allGroups.map((g: any) => ({
          ...g,
          items: g.items.filter((i: any) => i.pagadas < i.cuotas)
        })).filter((g: any) => g.items.length > 0);

      },
      async () => { this.getAlertError('No se pudieron cargar las cuotas.'); },
      async () => { this.dissmissLoader(); }
    );
  }

  clickItem(cate: Gasto) {
    console.log("nania")

  }

  changeToggle(data: any) {
    console.log(data)
    if (!data) {
      return;
    }
    const gasto: Gasto = data.gasto;
    const isCheck: boolean = data.isCheck;

    this.baseService(async () => {
      this.showLoader()
      await this.gastoService.desactivarGastoRecurrente(gasto.id || 0, isCheck);

      this.toastMessage("Se actualizo correctamente")
    }, async () => {
      this.getAlertError('No se pudieron cargar.');
    }, async () => {
      this.dissmissLoader();
    });

  }

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

  clickSegment() {

  }

  abrirGestionCuotas(gasto: any) {
    this.baseService(
      async () => {
        this.showLoader();
        this.gastoSeleccionado = gasto;
        this.detalleCuotas = await this.cuotaService.obtenerOCrearDetalleCuotas(gasto);
        this.isModalOpen = true;
      },
      async () => { this.getAlertError('Error al cargar detalle de cuotas'); },
      async () => { this.dissmissLoader(); }
    );
  }

  togglePagoCuota(c: any, e: any) {
    this.baseService(async () => {
      const estado = e.detail.checked ? 1 : 0;
      await this.cuotaService.toggleEstadoCuota(c.id, estado);
      this.cargarCuotas();
    });
  }

  abrirEditarGasto(gasto: any) {
    this.gastoSeleccionado = gasto;
    this.editData = {
      titulo: gasto.titulo,
      monto: gasto.monto,
      cuotas: gasto.cuotas,
      categoria_id: gasto.categoria_id
    };
    this.isEditModalOpen = true;
  }

  guardarEdicion() {
    this.baseService(
      async () => {
        this.showLoader();
        await this.cuotaService.actualizarGastoYCuotas(this.gastoSeleccionado, this.editData);
        this.getAlertSuccess("Cuota actualizada");
        this.isEditModalOpen = false;
        this.cargarCuotas();
      },
      async () => { this.getAlertError('Error al actualizar las cuotas.'); },
      async () => { this.dissmissLoader(); }
    );
  }

  eliminarGasto(gasto: any) {
    this.modalDelete(async () => {
      this.baseService(
        async () => {
          this.showLoader();
          await this.cuotaService.eliminarGastoCuotaCompleto(gasto.id);
          this.cargarCuotas();
          this.getAlertSuccess("Eliminado correctamente");
        },
        async () => { this.getAlertError('Error al eliminar la cuota.'); },
        async () => { this.dissmissLoader(); }
      );
    });
  }
}
