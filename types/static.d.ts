/**
 * @fileoverview Type declarations for various file extensions
 * Cut down from the default list to just the ones we're likely to use
 */

/* CSS MODULES */
declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
}

/* CSS */
declare module '*.css';

/* IMAGES */
declare module '*.svg' {
    const ref: string;
    export default ref;
}
declare module '*.jpg' {
    const ref: string;
    export default ref;
}
declare module '*.jpeg' {
    const ref: string;
    export default ref;
}
declare module '*.png' {
    const ref: string;
    export default ref;
}