import type { NavigationAPI, UpdaterAPI, WindowManagementAPI } from './preload'

declare global {
    interface Window {
        windowAPI: WindowManagementAPI;
        navigationAPI: NavigationAPI;
        updaterAPI: UpdaterAPI;
    }
}