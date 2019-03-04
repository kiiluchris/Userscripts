
export const regexConcat = re1 => {
    const re1Str = typeof re1 === "string" ? re1 : String(re1).slice(1,-1);
    return re2 => {
        const re2Str = typeof re2 === "string" ? re2 : String(re2).slice(1,-1)
        return new RegExp(re1Str + re2Str)
    }
};

export const waybackify = re => {
    const reStr = String(re).slice(1,-1)
    return regexConcat(/(?:web.archive.org\/web\/\d+\/.*)?/)(reStr.replace(/(?:\\\/|$)/, "(:80)?\\\/"))
};
  
export const zip = (xs, ys) => {
  const len = Math.min(xs.length, ys.length);
  return xs.slice(0, len).map((x,i) => [x, ys[i]])
};
