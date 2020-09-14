export const regexConcat = (re1: RegExp | string) => {
  const re1Str = typeof re1 === 'string' ? re1 : String(re1).slice(1, -1);
  return (re2: RegExp | string): RegExp => {
    const re2Str = typeof re2 === 'string' ? re2 : String(re2).slice(1, -1);
    return new RegExp(re1Str + re2Str);
  };
};

export const waybackify = (re: RegExp | string): RegExp => {
  const reStr = String(re).slice(1, -1);
  return regexConcat(/(?:web.archive.org\/web\/\d+\/.*)?/)(
    reStr.replace(/(?:\\\/|$)/, '(:80)?\\/'),
  );
};

export const urlWithDate = (re: RegExp | string) => regexConcat(re)(/\/20\d{2}\/\d{2}\/\d{2}/);

export const zip = <X, Y>(xs: X[], ys: Y[]): [X, Y][] => {
  const len = Math.min(xs.length, ys.length);
  return xs.slice(0, len).map((x, i) => [x, ys[i]]);
};

export const compose = <X, Y, Z>(f: (x: Y) => Z, g: (x: X) => Y) => (x: X) => f(g(x));

export const isBrowserAgentChromium = () => !window.navigator.userAgent
  .toLowerCase()
  .includes('firefox');

export const splitArrAtMid = <T>(arr: T[]): [T[], T[]] => {
  const len = arr.length;
  if (len === 0) return [[], []];
  const mid = Math.ceil(len / 2);
  return [arr.slice(0, mid), arr.slice(mid)];
};

export const identity = <T>(x: T) => x;


type Printer = (msg: any, ...rest: any[]) => void;

export const mkPrinter = (name: string): Printer => (msg: any, ...rest: any[]) => {
  console.group(name)
  console.log(msg)
  console.log(...rest)
  console.groupEnd()
}

type NonEmptyArray<T> = [T, ...T[]]

export const printBlock = <T>(printer: Printer, block: (print: (msg: any) => void) => T): T => {
  const messages: any[] = []
  const print = (msg: any) => { messages.push(msg) }
  const result  = block(print)
  messages.length > 0 && printer(...messages as NonEmptyArray<any>)
  return result

}

export const groupBy = <T>(xs: T[], f: (a: T, b: T) => boolean) => {
  if(xs.length === 0) return [];
  const lastIndex = xs.length - 1;
  const ys = [[xs[0]]];
  let groupIndex = 0
  for(let i = 0; i < lastIndex; i++){
    const next = xs[i+1]
    if(f(xs[i], next)) {
      ys[groupIndex].push(next)
    } else {
      groupIndex += 1;
      ys.push([next])
    }
  }
  return ys;
};
