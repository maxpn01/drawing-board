import Tool from "./Tool";
import { FiMousePointer } from "react-icons/fi";
import { FaRegHandPaper } from "react-icons/fa";
import { RiSubtractLine, RiRectangleLine, RiText  } from "react-icons/ri";
import { GoPencil } from "react-icons/go";

const Toolbar = (props) => {
    return (
        <div className="fixed flex bg-zinc-100 rounded-xl m-3" style={{zIndex: 2}}>
            <Tool setTool={props.setTool} toolType="selection" icon={<FiMousePointer />} />
            <Tool setTool={props.setTool} toolType="panning" icon={<FaRegHandPaper />} />
            <Tool setTool={props.setTool} toolType="line" icon={<RiSubtractLine />} />
            <Tool setTool={props.setTool} toolType="rectangle" icon={<RiRectangleLine />} />
            <Tool setTool={props.setTool} toolType="pencil" icon={<GoPencil />} />
            <Tool setTool={props.setTool} toolType="text" icon={<RiText />} />
        </div>
    )
}

export default Toolbar;