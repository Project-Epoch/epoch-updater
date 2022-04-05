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
    refreshState: () => void;
    onStateChanged: (callback: (state: string) => void) => void;
    onOpenDirectoryPicker: () => void;
    onValidDirectoryChosen: (callback: () => void) => void;
    onInvalidDirectoryChosen: (callback: (message: string) => void) => void;
}

const updaterAPI: UpdaterAPI = {
    refreshState: () => { ipcRenderer.send('refresh-update-state'); },
    onStateChanged: (callback: Function) => ipcRenderer.on('update-state-changed', (event, state) => { callback(state); }),
    onOpenDirectoryPicker: () => { ipcRenderer.send('choose-install-directory'); },
    onValidDirectoryChosen: (callback: Function) => ipcRenderer.on('valid-install-directory-chosen', () => { callback(); }),
    onInvalidDirectoryChosen: (callback: Function) => ipcRenderer.on('invalid-install-directory-chosen', (event, message) => { callback(message); }),
}

/** Expose to the Electron Window. Make sure to add to src\window.d.ts */
contextBridge.exposeInMainWorld('windowAPI', windowAPI);
contextBridge.exposeInMainWorld('navigationAPI', navigationAPI);
contextBridge.exposeInMainWorld('updaterAPI', updaterAPI);