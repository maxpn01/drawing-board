const Tool = (props) => {
    return (
        <div className="p-1">
            <input type="radio" id={props.toolType}
                checked={props.tool === props.toolType}
                onChange={() => props.setTool(props.toolType)}
            />
            <label htmlFor={props.toolType}>{props.toolType}</label>
        </div>
    )
}

export default Tool;