import { BrowserWindow } from "electron";

/**
 * Used to both Create and Access the Browser Window.
 */
export class Window {
    private window: BrowserWindow;

    /**
     * Actually creates the Window for later use.
     * @param entrypoint Typically the Webpack Main entry.
     */
    public create(entrypoint: string, preloader: string): Window {
        this.window = new BrowserWindow({
            width: 1010,
            height: 680,
            resizable: false,
            maximizable: false,
            titleBarStyle: 'hidden',
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: false,
                preload: preloader,
            }
        });

        this.window.loadURL(entrypoint);
        this.window.setMenuBarVisibility(false);

        return this;
    }

    /**
     * Get the BrowserWindow instance that was created.
     */
    public get(): BrowserWindow {
        return this.window;
    }
}

/**
 * Constant instance of the Window Class.
 */
export const WindowManager = new Window();