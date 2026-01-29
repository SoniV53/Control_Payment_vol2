import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () => import('../home/home.page').then((m) => m.HomePage),
      },

      {
        path: 'new-payment',
        loadComponent: () => import('../../payment/new-payment/new-payment.page').then(m => m.NewPaymentPage)
      },
      {
        path: 'add-payment',
        loadComponent: () => import('../../payment/add-payment/add-payment.page').then(m => m.AddPaymentPage)
      },
      {
        path: 'category',
        loadComponent: () => import('../../payment/category/category.page').then(m => m.CategoryPage)
      },
      {
        path: 'list-payments-month',
        loadComponent: () => import('../../payment/list-payments-month/list-payments-month.page').then(m => m.ListPaymentsMonthPage)
      },
      {
        path: 'gestiones',
        loadComponent: () => import('../../menu/menu-gestiones/menu-gestiones.page').then(m => m.MenuGestionesPage)
      },
      {
        path: 'categoria',
        loadComponent: () => import('../../gestiones/categoria/categoria.page').then(m => m.CategoriaPage)
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];