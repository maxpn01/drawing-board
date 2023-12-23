function distance(a, b) { 
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function nearPoint(x, y, x1, y1, name) {
    return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
}

function onLine(x1, y1, x2, y2, x, y, maxDistance = 1) {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y };
    const offset = distance(a, b) - (distance(a, c) + distance(b, c))
    return Math.abs(offset) < maxDistance ? "inside" : null;
}

export function getPositionWithinElement(x, y, element) {
    const { type, x1, x2, y1, y2 } = element;

    switch (element.type) {
        case "line":
            const on = onLine(x1, y1, x2, y2, x, y);
            const start = nearPoint(x, y, x1, y1, "start");
            const end = nearPoint(x, y, x2, y2, "end");
            return start || end || on;
        case "rectangle":
            const topLeft = nearPoint(x, y, x1, y1, "tl");
            const topRight = nearPoint(x, y, x2, y1, "tr");
            const bottomLeft = nearPoint(x, y, x1, y2, "bl");
            const bottomRight = nearPoint(x, y, x2, y2, "br");
            const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
            return topLeft || topRight || bottomLeft || bottomRight || inside;
        case "pencil":
            const betweenAnyPoint = element.points.some((point, index) => {
                const nextPoint = element.points[index + 1];
                if (!nextPoint) return false;
                return onLine(point.x, point.y, nextPoint.x, nextPoint.y, x, y, 5) !== null;
            });
            return betweenAnyPoint ? "inside" : null;
        case "text":
            return x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
        default:
            throw new Error(`Type not recognized: ${element.type}`);
    }
}

export function resizeCoordinates(clientX, clientY, position, coordinates) {
    const {x1, y1, x2, y2} = coordinates;
    switch (position) {
        case "tl":
        case "start":
            return {x1: clientX, y1: clientY, x2, y2};
        case "tr":
            return {x1, y1: clientY, x2: clientX, y2};
        case "bl":
            return {x1: clientX, y1, x2, y2: clientY};
        case "br":
        case "end":
            return {x1, y1, x2: clientX, y2: clientY};
        default:
            return null;
    }
}

export function adjustElementCoordinates(element) {
    const { type, x1, y1, x2, y2 } = element;
    
    if (type === "rectangle") {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        return { x1:minX, y1:minY, x2:maxX, y2:maxY };
    } else {
        if (x1 < x2 || (x1 === x2 && y1 < y2))
            return { x1, y1, x2, y2 };
        else
            return { x1: x2, y1: y2, x2: x1, y2: y1 };
    }
}