


const IMAGE_SELECTOR = 'img'
const IMAGE_ATTRIBUTE = 'data-src'
const IMAGE_LOAD_CB = (img: HTMLImageElement) => {

};

const changeImageSrc = (img: HTMLImageElement, value?: string | null) => {
    if(value){
        img.src = value;
    }
};

((selector: string, attribute: string, onLoad?: (img: HTMLImageElement) => void) => {
    [...document.querySelectorAll<HTMLImageElement>(selector)].forEach(img => {
        changeImageSrc(img, img.getAttribute(attribute))
        onLoad && img.addEventListener('load', () => onLoad(img));
    })
})(IMAGE_SELECTOR, IMAGE_ATTRIBUTE, IMAGE_LOAD_CB);

