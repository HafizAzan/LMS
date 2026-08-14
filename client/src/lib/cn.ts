export function cn(...classes: Array<string | number | boolean | null | undefined>) {
  return classes.filter((value): value is string => typeof value === 'string' && value.length > 0).join(' ');
}

export function getErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === 'object' && 'response' in err) {
    const message = (err as { response?: { data?: { message?: string } } }).response
      ?.data?.message;
    if (message) return message;
  }
  return fallback;
}
