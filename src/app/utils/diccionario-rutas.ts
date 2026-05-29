// DESCRIPCION DEL MANEJO DE RUTAS
// [ NOMBRE-DE-LA-CLASE ]: NOMBRE-DE-LA-RUTA
// LA RUTA DEBE COINCIDIR CON LA INGRESADA EN APP-ROUTING.MODULE.TS

// export let rutas = {
//     ['HomePage']: 'home',
// };

export let rutasModel = (): Record<string, string> => {
  return {
    ['HomePage']: 'home',
    ['ListPaymentsMonthPage']: 'list-payments-month',
    ['CategoriaPage']: 'categoria',
    ['MenuGestionesPage']: 'gestiones',
    ['AddPaymentPage']: 'add-payment',
    ['NewPaymentPage']: 'new-payment',
    ['UpdatePaymentPage']: 'update-payment',
    ['ControlRecurrentesPage']: 'control-recurrentes',
  };
};