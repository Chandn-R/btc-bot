export function getNearestLevels(price, step = 1000) {
    const up = Math.ceil(price / step) * step;
    const down = Math.floor(price / step) * step;
    return { up, down };
}

export function nowSec() {
    return Math.floor(Date.now() / 1000);
}
