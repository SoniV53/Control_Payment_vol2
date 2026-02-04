
export enum UpdateListado {
    UPDATE_CATEGORIA= 'update-categoria',
    UPDATE_RECURRENTE= 'update-recurrente'
}

export interface UpdateParamData{
    nombre?:UpdateListado,
    isLoad:boolean
}

export const updateParams = (): Record<UpdateListado, UpdateParamData> => {
  return {
    [UpdateListado.UPDATE_CATEGORIA]: {
      isLoad: true
    },
    [UpdateListado.UPDATE_RECURRENTE]: {
      isLoad: true
    }
  };
};
// export class Param {
//     const listado = [
//         {nombre: UpdateListado.UPDATE_CATEGORIA ,isLoad:true}
//     ]
//     return listado;
// };