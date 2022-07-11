type Nil = null | undefined;

type Nullable<T> = T | null;

type Nilable<T> = Nullable<T> | undefined;

export function isNil<T>(value: Nilable<T>): value is Nil {
  return value == null;
}

export function hasPositiveLength(value: { length: number }) {
  return value.length > 0;
}

export function isEmptyStringOrNil(value: unknown): value is Nil | '' {
  return isNil(value) || (typeof value === 'string' && !hasPositiveLength(value));
}
