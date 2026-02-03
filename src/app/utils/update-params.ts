
export enum UpdateListado {
    UPDATE_CATEGORIA= 'update-categoria'
}

export interface UpdateParamData{
    nombre?:UpdateListado,
    isLoad:boolean
}

export const updateParams = (): Record<UpdateListado, UpdateParamData> => {
  return {
    [UpdateListado.UPDATE_CATEGORIA]: {
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