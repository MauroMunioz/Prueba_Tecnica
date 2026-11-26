import { ApiProperty } from '@nestjs/swagger';

// Forma del cuerpo de error que devuelve Nest; solo se usa para documentar
export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({
    description: 'Un texto, o una lista de textos en los errores de validacion',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: ['El precio debe ser mayor que 0'],
  })
  message!: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error!: string;
}
