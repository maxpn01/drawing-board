import { useState, useEffect } from "react";

export default function usePressedKeys() {
    const [pressedKeys, setPressedKeys] = useState(new Set());

    useEffect(() => {
        const handleKeyDown = event => {
        setPressedKeys(prevKeys => new Set(prevKeys).add(event.key));
        };

        const handleKeyUp = event => {
        setPressedKeys(prevKeys => {
            const updatedKeys = new Set(prevKeys);
            updatedKeys.delete(event.key);
            return updatedKeys;
        });
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    return pressedKeys;
};