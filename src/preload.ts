import { contextBridge, ipcRenderer } from 'electron';

/** Declare an API with functions. */
export type WindowManagementAPI = {
    rendered: () => void;
    close: () => void;
    minimize: () => void;
}

/** Implement those functions, basically just pass to IPC. */
const windowAPI: WindowManagementAPI = {
    rendered: () => { ipcRenderer.send('window-rendered'); },
    close: () => { ipcRenderer.send('window-close'); },
    minimize: () => { ipcRenderer.send('window-minimize'); }
}

/** Used to open Navigation Links in Browser. */
export type NavigationAPI = {
    open: (link: string) => void;
}

const navigationAPI: NavigationAPI = {
    open: (link: string) => { ipcRenderer.send('link-clicked', link); },
}

/** Updater API */
export type UpdaterAPI = {
    onStateChanged: (callback: (state: string) => void) => void;
}

const updaterAPI: UpdaterAPI = {
    onStateChanged: (callback: Function) => ipcRenderer.on('update-state-changed', (event, state) => { callback(state); }),
}

/** Expose to the Electron Window. Make sure to add to src\window.d.ts */
contextBridge.exposeInMainWorld('windowAPI', windowAPI);
contextBridge.exposeInMainWorld('navigationAPI', navigationAPI);
contextBridge.exposeInMainWorld('updaterAPI', updaterAPI);