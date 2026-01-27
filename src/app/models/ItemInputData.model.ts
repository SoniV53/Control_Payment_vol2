export interface ItemInputData {
  id: string;
  titulo: string;
  placeholder: string;
  tipo: 'input' | 'number' | 'text' | 'date' | 'select' | 'text-area';
  required: boolean;
  isError: boolean;
  list?: ItemInputListData[];
  valueSelect?: string;
}


export interface ItemInputListData {
  code: string;
  value: string;
}