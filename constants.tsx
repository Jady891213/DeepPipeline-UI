
import { ColumnType, FieldMetadata } from './types';

export const MOCK_FIELDS: FieldMetadata[] = [
  { name: 'id', type: ColumnType.INTEGER },
  { name: 'is_resend', type: ColumnType.BOOLEAN },
  { name: 'create_type', type: ColumnType.STRING },
  { name: 'status', type: ColumnType.INTEGER },
  { name: 'warehouse_id', type: ColumnType.STRING },
  { name: 'fulfillment_type', type: ColumnType.STRING },
  { name: 'fulfillment_platform', type: ColumnType.STRING },
  { name: 'updated_at', type: ColumnType.DATETIME },
  { name: 'price', type: ColumnType.DECIMAL },
];

export const TYPE_OPTIONS = [
  { label: 'String', value: ColumnType.STRING, hasFormat: true },
  { label: 'Integer', value: ColumnType.INTEGER, hasFormat: false },
  { label: 'Decimal', value: ColumnType.DECIMAL, hasFormat: false },
  { label: 'DateTime', value: ColumnType.DATETIME, hasFormat: true },
  { label: 'Boolean', value: ColumnType.BOOLEAN, hasFormat: false },
];
