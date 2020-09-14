
interface ClickableWithHref {
  href: string,
  click(): any,
}


declare interface Function {
  compose<A, B, C>(this: (b: B) => C, fn: (a: A) => B): (a: A) => C;
  andThen<A, B, C>(this: (a: A) => B, fn: (b: B) => C): (a: A) => C;
}

interface StringMap {
  [key: string]: any
}
