import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';

export const User = createParamDecorator(
  (filter: string, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: Record<string, unknown> }>();
    const { user } = request;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (filter) {
      // Se um filtro for fornecido, retorna apenas a propriedade específica do usuário
      if (!user[filter]) {
        throw new NotFoundException(`User ${filter} not found`);
      }
      return user[filter];
    }

    return user;
  },
);
