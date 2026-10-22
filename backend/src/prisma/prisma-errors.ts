export function isPrismaUniqueConstraintError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const code: unknown = Reflect.get(error, 'code');
  return code === 'P2002';
}
