import { contextBridge, ipcRenderer } from 'electron';

/** Declare an API with functions. */
export type WindowManagementAPI = {
    close: () => void;
    minimize: () => void;
}

/** Implement those functions, basically just pass to IPC. */
const windowAPI: WindowManagementAPI = {
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

/** Expose to the Electron Window. Make sure to add to src\window.d.ts */
contextBridge.exposeInMainWorld('windowAPI', windowAPI);
contextBridge.exposeInMainWorld('navigationAPI', navigationAPI);