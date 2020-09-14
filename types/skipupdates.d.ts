interface SkipUpdateConfigOptions {
    urls: RegExp[],
    cb(pageIsSaved: boolean): void,
}
