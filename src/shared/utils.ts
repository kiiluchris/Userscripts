export const regexConcat = (re1: RegExp | string) => {
    const re1Str = typeof re1 === "string" ? re1 : String(re1).slice(1, -1);
    return (re2: RegExp | string): RegExp => {
        const re2Str = typeof re2 === "string" ? re2 : String(re2).slice(1, -1)
        return new RegExp(re1Str + re2Str)
    }
};

export const waybackify = (re: RegExp): RegExp => {
    const reStr = String(re).slice(1, -1)
    return regexConcat(/(?:web.archive.org\/web\/\d+\/.*)?/)(reStr.replace(/(?:\\\/|$)/, "(:80)?\\\/"))
};

export const zip = <X, Y>(xs: X[], ys: Y[]): [X, Y][] => {
    const len = Math.min(xs.length, ys.length);
    return xs.slice(0, len).map((x, i) => [x, ys[i]])
};

export const compose = <Z>(...fns: ((x: any) => any)[]) => {
    return (x: any): Z => fns.reduceRight(
        (acc, fn) => fn(acc), x
    )
}

export const isBrowserAgentChromium = () => {
    return !window.navigator.userAgent
        .toLowerCase()
        .includes("firefox")
}