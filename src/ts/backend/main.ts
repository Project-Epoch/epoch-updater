import { app, ipcMain, shell } from "electron";
import { ClientManager } from "./client";
import { UpdateManager, UpdateState } from "./updater";
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
        this.registerIPC();

        /** Electron App Events. */
        app.on('ready', this.onReady);
        app.on('window-all-closed', this.onAllWindowClosed);
        app.on('before-quit', () => { this.onAppQuit(); });
    }

    /**
     * Registers our Inter Process Communications.
     */
    registerIPC() {
        ipcMain.on('window-rendered', this.onWindowRendered);
        ipcMain.on('window-close', () => { app.quit() });
        ipcMain.on('window-minimize', () => { WindowManager.get().minimize() });
        ipcMain.on('link-clicked', (event, args) => { shell.openExternal(args); });
        ipcMain.on('choose-install-directory', () => { 
            ClientManager.chooseDirectory(() => {
                setTimeout(() => {
                    UpdateManager.setState(UpdateState.GET_MANIFEST);
                    UpdateManager.getManifest();
                }, 1000);
            });
        });
        ipcMain.on('refresh-update-state', () => { UpdateManager.refresh(); });
        ipcMain.on('update-button-click', () => { UpdateManager.downloadUpdates(); });
        ipcMain.on('on-cancel-button-clicked', () => { UpdateManager.cancel(); });
        ipcMain.on('play-game', () => { 
            ClientManager.open();

            setTimeout(() => {
                app.quit();
            }, 1000);
        });
    }

    /**
     * Fires when the app is quitting.
     */
    onAppQuit() {
        if (UpdateManager.getState() === UpdateState.DOWNLOADING) {
            UpdateManager.cancel();
        }
    }

    /**
     * When the DOM Content has been loaded we start setting 
     * up our initial updater state.
     */
    onWindowRendered() {
        WindowManager.get().show();

        WindowManager.get().webContents.send('launcher-version-received', app.getVersion());

        /** User has either not set directory yet or has moved their client. */
        if (! ClientManager.hasClientDirectory() || ! ClientManager.isWarcraftDirectory(ClientManager.getClientDirectory())) {
            UpdateManager.setState(UpdateState.SETUP);
            return;
        }

        /** Otherwise - Go to patching. */
        UpdateManager.setState(UpdateState.GET_MANIFEST);
        UpdateManager.getManifest();
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