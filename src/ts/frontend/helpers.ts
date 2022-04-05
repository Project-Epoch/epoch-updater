export function show(element: HTMLElement) {
    element.removeAttribute('hidden');
}

export function hide(element: HTMLElement) {
    element.setAttribute('hidden', 'true');
}

// export function toggle(element: HTMLElement) {
//     if(element.style.display === 'none'){
//         element.style.display = 'block';
//     } else {
//         element.style.display = 'none';
//     }
// }