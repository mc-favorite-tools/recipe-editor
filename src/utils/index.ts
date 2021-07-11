export function trimPrefix(text: string) {
    return !!text && typeof text === 'string' ? (text.startsWith('minecraft:') ? text.slice(10) : text) : 'error'
}

export function addPrefix(text: string) {
    return 'minecraft:' + text
}

export function download(filename: string, text: string) {
    const a = document.createElement('a')
    a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    a.setAttribute('download', filename);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}