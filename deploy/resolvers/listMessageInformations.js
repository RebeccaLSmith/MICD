import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
  const { limit = 1000, nextToken } = ctx.arguments;
  return ddb.scan({ limit, nextToken });
}

export function response(ctx) {
  const { items: items = [], nextToken } = ctx.result;
  return { items, nextToken };
}