
export enum UpdateListado {
  UPDATE_CATEGORIA = 'update-categoria',
  UPDATE_RECURRENTE = 'update-recurrente'
}

export interface UpdateParamData {
  data?: Record<string, boolean>,
}


export let updateParams = (): Record<string, UpdateParamData[]> => {
  return {
    ['HomePage']: [
      { data: { [UpdateListado.UPDATE_CATEGORIA]: true } },
      { data: { [UpdateListado.UPDATE_RECURRENTE]: true } }
    ],
  };
};
// export class Param {
//     const listado = [
//         {nombre: UpdateListado.UPDATE_CATEGORIA ,isLoad:true}
//     ]
//     return listado;
// };