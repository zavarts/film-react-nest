import { Body, Controller, Post } from '@nestjs/common';
import { OrderDto, OrderResponseDto } from './dto/order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  createOrder(@Body() order: OrderDto): Promise<OrderResponseDto> {
    return this.orderService.createOrder(order);
  }
}
