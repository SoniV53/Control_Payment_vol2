export interface ItemInputData {
  id: string;
  titulo: string;
  placeholder: string;
  tipo: 'input' | 'number' | 'text' | 'date' | 'select' | 'text-area';
  required: boolean;
  isError: boolean;
  list?: ItemInputListData[];
  valueSelect?: any;
  icon?: any;
}


export interface ItemInputListData {
  code: number | string;
  value: string;
}