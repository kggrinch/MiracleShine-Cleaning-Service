import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Read the user previously attached to the request by an authentication guard. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<{ user?: Record<string, unknown> }>();
    return req.user;
  },
);
