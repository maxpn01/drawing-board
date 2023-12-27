import { getStroke } from 'perfect-freehand'
import getSvgPathFromStroke from "./svgPathFromStroke";
import { getPositionWithinElement } from './coordinates';
import rough from 'roughjs';

const generator = rough.generator();

export function createElement(id, x1, y1, x2, y2, type) {
    switch (type) {
        case "line":
        case "rectangle":
            const roughElement = type === "line" 
                ? generator.line(x1, y1, x2, y2)
                : generator.rectangle(x1, y1, x2-x1, y2-y1);
            return { id, x1, y1, x2, y2, type, roughElement };
        case "pencil":
            return {id, type, points: [{x: x1, y: y1}]};
        case "text":
            return {id, type, x1, y1, x2, y2, text: ""};
        default:
            throw new Error(`Type not recognized: ${type}`);
    }
}

export function drawElement(roughCanvas, context, element) {
    switch (element.type) {
        case "line":
        case "rectangle":
            roughCanvas.draw(element.roughElement);
            break;
        case "pencil":
            const pathData = getSvgPathFromStroke(getStroke(element.points, {
                size: 6,
                thinning: 0.4
            }));
            context.fill(new Path2D(pathData))
            break;
        case "text":
            context.textBaseline = "top";
            context.font = "24px sans-serif";
            context.fillText(element.text, element.x1, element.y1);
            break;
        default:
            throw new Error(`Type not recognized: ${element.type}`);
    }
}

export function getElementAtPosition(x, y, elements) {
    return elements
        .map(element => ({...element, position: getPositionWithinElement(x, y, element)}))
        .find(element => element.position !== null);
}