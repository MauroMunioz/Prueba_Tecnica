import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DecimalTransformer } from '../../common/transformers/decimal.transformer';

// Mapeo de la tabla products definida en database/schema.sql.
// Los @ApiProperty documentan la respuesta de la API.
@Entity({ name: 'products' })
export class Product {
  @ApiProperty({ example: 1, type: 'integer' })
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @ApiProperty({ example: 'SKU-001' })
  @Column({ type: 'varchar', length: 64, unique: true })
  sku!: string;

  @ApiProperty({ example: 'Mesa de roble' })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ example: 199.99 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  price!: number;

  @ApiProperty({ example: 3, type: 'integer' })
  @Column({ type: 'int', unsigned: true, default: 0 })
  stock!: number;

  @ApiProperty({ example: '2026-11-25T18:43:58.000Z' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
