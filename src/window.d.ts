import type { NavigationAPI, WindowManagementAPI } from './preload'

declare global {
    interface Window {
        windowAPI: WindowManagementAPI;
        navigationAPI: NavigationAPI;
    }
}