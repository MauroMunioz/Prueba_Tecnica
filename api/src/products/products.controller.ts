import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { PaginatedProductsDto } from './dto/paginated-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

// Se repite en todas las rutas con :id
const ApiIdParam = () =>
  ApiParam({ name: 'id', type: 'integer', description: 'Id del producto', example: 1 });

@ApiTags('products')
@ApiBadRequestResponse({
  description: 'Datos, parametros o id invalidos',
  type: ErrorResponseDto,
})
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar productos paginados, opcionalmente filtrando por nombre',
  })
  @ApiOkResponse({ type: PaginatedProductsDto })
  findAll(@Query() query: FindProductsQueryDto): Promise<PaginatedProductsDto> {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto' })
  @ApiIdParam()
  @ApiOkResponse({ type: Product })
  @ApiNotFoundResponse({ description: 'El producto no existe', type: ErrorResponseDto })
  findOne(@Param('id', ParseIdPipe) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un producto' })
  @ApiCreatedResponse({ type: Product })
  @ApiConflictResponse({ description: 'El SKU ya existe', type: ErrorResponseDto })
  create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar un producto (reemplazo)',
    description:
      'Exige sku, name y price, igual que al crear. Si se omite stock se conserva el actual. Conservar el SKU propio no es conflicto.',
  })
  @ApiIdParam()
  @ApiOkResponse({ type: Product })
  @ApiNotFoundResponse({ description: 'El producto no existe', type: ErrorResponseDto })
  @ApiConflictResponse({
    description: 'El SKU pertenece a otro producto',
    type: ErrorResponseDto,
  })
  replace(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: CreateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un producto',
    description: 'Solo se modifican los campos enviados. Conservar el SKU propio no es conflicto.',
  })
  @ApiIdParam()
  @ApiOkResponse({ type: Product })
  @ApiNotFoundResponse({ description: 'El producto no existe', type: ErrorResponseDto })
  @ApiConflictResponse({
    description: 'El SKU pertenece a otro producto',
    type: ErrorResponseDto,
  })
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiIdParam()
  @ApiNoContentResponse({ description: 'Eliminado' })
  @ApiNotFoundResponse({ description: 'El producto no existe', type: ErrorResponseDto })
  remove(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.productsService.remove(id);
  }
}
