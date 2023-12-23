import Tool from "./Tool";

const Toolbar = (props) => {
    return (
        <div className="fixed p-2 flex" style={{zIndex: 2}}>
            <Tool tool={props.tool} setTool={props.setTool} toolType="selection" />
            <Tool tool={props.tool} setTool={props.setTool} toolType="panning" />
            <Tool tool={props.tool} setTool={props.setTool} toolType="line" />
            <Tool tool={props.tool} setTool={props.setTool} toolType="rectangle" />
            <Tool tool={props.tool} setTool={props.setTool} toolType="pencil" />
            <Tool tool={props.tool} setTool={props.setTool} toolType="text" />
        </div>
    )
}

export default Toolbar;