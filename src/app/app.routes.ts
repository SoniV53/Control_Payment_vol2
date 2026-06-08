import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./page/main/home/home.page').then((m) => m.HomePage),
  },

  {
    path: 'new-payment',
    loadComponent: () => import('./page/payment/new-payment/new-payment.page').then(m => m.NewPaymentPage)
  },
  {
    path: 'add-payment',
    loadComponent: () => import('./page/payment/add-payment/add-payment.page').then(m => m.AddPaymentPage)
  },
  {
    path: 'list-payments-month',
    loadComponent: () => import('./page/payment/list-payments-month/list-payments-month.page').then(m => m.ListPaymentsMonthPage)
  },
  {
    path: 'gestiones',
    loadComponent: () => import('./page/menu/menu-gestiones/menu-gestiones.page').then(m => m.MenuGestionesPage)
  },
  {
    path: 'categoria',
    loadComponent: () => import('./page/gestiones/categoria/categoria.page').then(m => m.CategoriaPage)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'update-payment',
    loadComponent: () => import('./page/payment/update-payment/update-payment.page').then( m => m.UpdatePaymentPage)
  },
  {
    path: 'control-recurrentes',
    loadComponent: () => import('./page/control-recurrentes/control-recurrentes.page').then( m => m.ControlRecurrentesPage)
  },
  {
    path: 'control-cuotas',
    loadComponent: () => import('./page/control-cuotas/control-cuotas.page').then( m => m.ControlCuotasPage)
  },
  {
    path: 'historial-gastos',
    loadComponent: () => import('./page/historial-gastos/historial-gastos.page').then( m => m.HistorialGastosPage)
  },
  {
    path: 'resumen-gastos',
    loadComponent: () => import('./page/resumen-gastos/resumen-gastos.page').then( m => m.ResumenGastosPage)
  },



];


