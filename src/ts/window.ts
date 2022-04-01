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
    public create(entrypoint: string) {
        this.window = new BrowserWindow({
            width: 1280,
            height: 720,
            resizable: false,
            maximizable: false,
        });

        this.window.loadURL(entrypoint);
        this.window.setMenuBarVisibility(false);
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