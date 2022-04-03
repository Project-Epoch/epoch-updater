import type { WindowManagementAPI } from './preload'

declare global {
    interface Window {
        windowAPI: WindowManagementAPI;
    }
}