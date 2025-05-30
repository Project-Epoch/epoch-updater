import type { NavigationAPI, UpdaterAPI, WindowManagementAPI, SettingsAPI } from './preload'

declare global {
    interface Window {
        windowAPI: WindowManagementAPI;
        navigationAPI: NavigationAPI;
        updaterAPI: UpdaterAPI;
        settingsAPI: SettingsAPI;
    }
}