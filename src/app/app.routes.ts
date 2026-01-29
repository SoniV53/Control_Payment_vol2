import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('../app/page/main/tabs/tabs.router').then((m) => m.routes),
  },
  {
    path: 'list-payments-month',
    loadComponent: () => import('./page/payment/list-payments-month/list-payments-month.page').then( m => m.ListPaymentsMonthPage)
  },
  {
    path: 'new-payment',
    loadComponent: () => import('./page/payment/new-payment/new-payment.page').then( m => m.NewPaymentPage)
  },
  {
    path: 'base',
    loadComponent: () => import('./page/main/base/base.page').then( m => m.BasePage)
  },
  {
    path: 'menu-gestiones',
    loadComponent: () => import('./page/menu/menu-gestiones/menu-gestiones.page').then( m => m.MenuGestionesPage)
  },
  {
    path: 'categoria',
    loadComponent: () => import('./page/gestiones/categoria/categoria.page').then( m => m.CategoriaPage)
  },

  

];


