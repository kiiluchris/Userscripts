import { compose } from './utils';

Function.prototype.compose = function <A, B, C> (
  this: (b: B) => C, fn: (a: A) => B,
) {
  return compose(this, fn);
};


Function.prototype.andThen = function <A, B, C> (
  this: (a: A) => B, fn: (b: B) => C,
) {
  return compose(fn, this);
};
