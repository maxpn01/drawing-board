const BottomPanel = (props) => {
    return (
        <div className="fixed bottom-0 p-2" style={{zIndex: 2}}>
            <button className="button p-1" onClick={() => props.onZoom(-0.1)}>-</button>
            <span className="button p-1" onClick={() => props.setScale(1)}>
                {new Intl.NumberFormat("en-GB", {style: "percent"}).format(props.scale)}
            </span>
            <button className="button p-1" onClick={() => props.onZoom(0.1)}>+</button>

            <button className="button p-1" onClick={props.undo}>Undo</button>
            <button className="button p-1" onClick={props.redo}>Redo</button>
        </div>
    )
}

export default BottomPanel;