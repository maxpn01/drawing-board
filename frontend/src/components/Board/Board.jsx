import { useState, useRef, useEffect, useLayoutEffect } from "react";
import useHistory from "./hooks/useHistory";
import usePressedKeys from "./hooks/usePressedKeys";
import { resizeCoordinates, adjustElementCoordinates } from "./utils/coordinates";
import { createElement, drawElement, getElementAtPosition } from "./utils/element";
import Toolbar from "./components/Toolbar/Toolbar";
import BottomPanel from "./components/BottomPanel";
import rough from 'roughjs';

function getCursorForPosition(position) {
    switch (position) {
        case "tl":
        case "br":
        case "start":
        case "end":
            return "nwse-resize";
        case "tr":
        case "bl":
            return "nesw-resize";
        default:
            return "move";
    }
}

const Board = () => {
    const canvasRef = useRef(null);
    const textAreaRef = useRef();

    const [elements, setElements, undo, redo] = useHistory([]);
    const [action, setAction] = useState("none");
    const [tool, setTool] = useState("line");
    const [selectedElement, setSelectedElement] = useState(null);
    const [panOffset, setPanOffset] = useState({x: 50, y: 50});
    const [startPanMousePosition, setStartPanMousePosition] = useState({x: 0, y: 0});
    const [scale, setScale] = useState(1)
    const [scaleOffset, setScaleOffset] = useState({x: 0, y: 0});

    const pressedKeys = usePressedKeys();
    
    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const roughCanvas = rough.canvas(canvas);

        context.clearRect(0, 0, canvas.width, canvas.height);

        const scaledWidth = canvas.width * scale;
        const scaledHeight = canvas.height * scale;

        const scaleOffsetX = (scaledWidth - canvas.width) / 2;
        const scaleOffsetY = (scaledHeight - canvas.height) / 2;
        setScaleOffset({x: scaleOffsetX, y: scaleOffsetY});

        context.save();
        context.translate(panOffset.x * scale - scaleOffsetX, panOffset.y * scale - scaleOffsetY);
        context.scale(scale, scale);

        elements.forEach(element => {
            if (action === "writing" && selectedElement.id === element.id) return;
            drawElement(roughCanvas, context, element)
        });

        context.restore();
    }, [elements, action, selectedElement, panOffset, scale]);

    useEffect(() => {
        const undoRedoFunction = event => {
            if ((event.metaKey || event.ctrlKey) && event.key === "z") {
                if (event.shiftKey) redo();
                else undo();
            }
        }

        document.addEventListener("keydown", undoRedoFunction);

        return () => {
            document.removeEventListener("keydown", undoRedoFunction);
        }
    }, [undo, redo]);

    useEffect(() => {
        const panOrZoomFunction = event => {
            if (pressedKeys.has("Meta") || pressedKeys.has("Control"))
                onZoom(event.deltaY * -0.001);
            else setPanOffset(prevState => ({
                x: prevState.x - event.deltaX,
                y: prevState.y - event.deltaY,
            }));
        };

        document.addEventListener("wheel", panOrZoomFunction);
        return () => {
            document.removeEventListener("wheel", panOrZoomFunction);
        };
    }, [pressedKeys]);

    useEffect(() => {
        const textArea = textAreaRef.current;
        if (action === "writing") {
            setTimeout(() => {
                textArea.focus();
                textArea.value = selectedElement.text;
            }, 0);
        }
    }, [action, selectedElement]);

    const updateElement = (id, x1, y1, x2, y2, type, options) => {
        const elementsCopy = [...elements];

        switch (type) {
        case "line":
        case "rectangle":
            elementsCopy[id] = createElement(id, x1, y1, x2, y2, type);
            break;
        case "pencil":
            elementsCopy[id].points = [...elementsCopy[id].points, { x: x2, y: y2 }];
            break;
        case "text":
            const textWidth = canvasRef.current
                .getContext("2d")
                .measureText(options.text).width;
            const textHeight = 24;
            elementsCopy[id] = {
                ...createElement(id, x1, y1, x1 + textWidth, y1 + textHeight, type),
                text: options.text,
            };
            break;
        default:
            throw new Error(`Type not recognised: ${type}`);
        }

        setElements(elementsCopy, true);
    };

    const getMouseCoordinates = event => {
        const clientX = (event.clientX - panOffset.x * scale + scaleOffset.x) / scale;
        const clientY = (event.clientY - panOffset.y * scale + scaleOffset.y) / scale;
        return { clientX, clientY };
    };

    const handleMouseDown = event => {
        if (action === "writing") return;

        const {clientX, clientY} = getMouseCoordinates(event);

        if (tool === "panning") {
            setAction("panning");
            setStartPanMousePosition({x: clientX, y: clientY});
            return;
        }

        if (tool === "selection") {
            const element = getElementAtPosition(clientX, clientY, elements);
            if (element) {
                if (element.type === "pencil") {
                    const xOffsets = element.points.map(point => clientX - point.x);
                    const yOffsets = element.points.map(point => clientY - point.y);
                    setSelectedElement({...element, xOffsets, yOffsets});
                } else {
                    const offsetX = clientX - element.x1;
                    const offsetY = clientY - element.y1;
                    setSelectedElement({...element, offsetX, offsetY});
                }

                setElements(prevState => prevState);

                if (element.position === "inside")
                    setAction("moving");
                else setAction("resizing");
            }
        } else {
            const id = elements.length;
            const element = createElement(id, clientX, clientY, clientX, clientY, tool);
            setElements(prevState => [...prevState, element]);
            setSelectedElement(element);

            setAction(tool === "text" ? "writing" : "drawing");
        }
    };

    const handleMouseMove = event => {
        const {clientX, clientY} = getMouseCoordinates(event);

        if (action === "panning") {
            const deltaX = clientX - startPanMousePosition.x;
            const deltaY = clientY - startPanMousePosition.y;
            setPanOffset(prevState => ({
                x: panOffset.x + deltaX,
                y: panOffset.y + deltaY
            }));
            return;
        }

        if (tool === "selection")  {
            const element = getElementAtPosition(clientX, clientY, elements);
            event.target.style.cursor = element
                ? getCursorForPosition(element.position) 
                : "default";
        }

        if (action === "drawing") {
            const lastElementIndex = elements.length - 1;
            const { x1, y1 } = elements[lastElementIndex];
            updateElement(lastElementIndex, x1, y1, clientX, clientY, tool);
        } else if (action === "moving") {
            if (selectedElement.type === "pencil") {
                const newPoints = selectedElement.points.map((_, index) => ({
                    x: clientX - selectedElement.xOffsets[index],
                    y: clientY - selectedElement.yOffsets[index]
                }));
                const elementsCopy = [...elements];
                elementsCopy[selectedElement.id] = {
                    ...elementsCopy[selectedElement.id],
                    points: newPoints,
                };
                setElements(elementsCopy, true);
            } else {
                const { id, x1, x2, y1, y2, type, offsetX, offsetY} = selectedElement;
                const width = x2 - x1;
                const height = y2 - y1;
                const newX1 = clientX - offsetX;
                const newY1 = clientY - offsetY;
                const options = type === "text" ? {text: selectedElement.text} : {};
                updateElement(id, newX1, newY1, newX1 + width, newY1 + height, type, options);
            }
        } else if (action === "resizing") {
            const { id, type, position, ...coordinates } = selectedElement;
            const {x1, y1, x2, y2} = resizeCoordinates(clientX, clientY, position, coordinates);
            updateElement(id, x1, y1, x2, y2, type);
        }
    };

    const handleMouseUp = event => {
        const { clientX, clientY } = getMouseCoordinates(event);

        if (selectedElement) {
            if (selectedElement.type === "text" && 
                clientX - selectedElement.offsetX === selectedElement.x1 &&
                clientY - selectedElement.offsetY === selectedElement.y1) {
                setAction("writing");
                return;
            }

            const index = selectedElement.id;
            const { id, type } = elements[index];

            if ((action === "drawing" || action === "resizing") && ["line", "rectangle"].includes(type)) {
                const {x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
                updateElement(id, x1, y1, x2, y2, type);
            }
        }

        if (action === "writing") return;

        setAction("none");
        setSelectedElement(null);
    } 

    const handleBlur = event => {
        const {id, x1, y1, type} = selectedElement;
        setAction("none");
        setSelectedElement(null);
        updateElement(id, x1, y1, null, null, type, {text: event.target.value});
    }

    const onZoom = delta => {
        setScale(prevState => Math.min(Math.max(prevState + delta, 0.1), 20));
    };

    const clear = () => setElements([]);

    return (
        <div className="w-screen h-screen fixed z-[2]">
            <div className="flex justify-center">
                <Toolbar tool={tool} setTool={setTool}/>
            </div>
            <BottomPanel onZoom={onZoom} setScale={setScale} scale={scale} undo={undo} redo={redo} clear={clear}/>
            {action === "writing" && (
                <textarea 
                    ref={textAreaRef}
                    onBlur={handleBlur}
                    name="text"
                    className="fixed z-[2] m-0 p-0 b-0 outline-none resize-[auto] overflow-hidden whitespace-pre bg-transparent"
                    style={{
                        top: 
                            (selectedElement.y1 - 3) * scale + 
                            panOffset.y * scale - scaleOffset.y, 
                        left: 
                            selectedElement.x1 * scale + 
                            panOffset.x * scale - scaleOffset.x,
                        font: `${24 * scale}px sans-serif`,
                    }}
                />
            )}
            <canvas 
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="absolute z-[1]"
            />       
        </div>
    )
}

export default Board;