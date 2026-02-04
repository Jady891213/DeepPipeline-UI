
export enum ColumnType {
  STRING = 'STRING',
  INTEGER = 'INTEGER',
  DECIMAL = 'DECIMAL',
  DATETIME = 'DATETIME',
  BOOLEAN = 'BOOLEAN',
}

export interface TransformationRule {
  id: string;
  sourceField: string;
  targetName: string;
  targetType: ColumnType;
  format?: string; // Optional format for specific types like Date or String
}

export interface FieldMetadata {
  name: string;
  type: ColumnType;
}
