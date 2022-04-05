/**
 * A centralised place to handle the Frontend aspect of Window Management.
 */
export class Window {
    constructor() {
        /** Window Loaded. */
        document.addEventListener('DOMContentLoaded', () => { window.windowAPI.rendered(); });

        /** Close Button. */
        const closeButton = document.getElementById('window-close');
        closeButton.addEventListener('click', () => {
            window.windowAPI.close();
        });

        /** Minimize Button. */
        const minimizeButton = document.getElementById('window-minimize');
        minimizeButton.addEventListener('click', () => {
            window.windowAPI.minimize();
        });
    }
}