/**
 * Shows a DOM Object.
 * @param element The Element we're showing.
 */
export function show(element: HTMLElement) {
    element.removeAttribute('hidden');
}

/**
 * Hides a DOM Object.
 * @param element The Element we're hiding.
 */
export function hide(element: HTMLElement) {
    element.setAttribute('hidden', 'true');
}