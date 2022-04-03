import { app } from "electron";
import { WindowManager } from "./window";

/**
 * This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack 
 * plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on 
 * whether you're running in development or production).
 */
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

class Main {
    constructor() {
        app.on('ready', this.onReady);
        app.on('window-all-closed', this.onAllWindowClosed);
    }

    /**
     * This method will be called when Electron has finished 
     * initialization and is ready to create browser windows. 
     * Some APIs can only be used after this event occurs.
     */
    onReady() {
        WindowManager.create(MAIN_WINDOW_WEBPACK_ENTRY, MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY);
    }

    /**
     * Fired when all windows are closed.
     */
    onAllWindowClosed() {
        app.quit();
    }
}

export default Main;