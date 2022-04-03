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

/** Expose to the Electron Window. Make sure to add to src\window.d.ts */
contextBridge.exposeInMainWorld('windowAPI', windowAPI);