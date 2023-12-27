import { RiArrowLeftLine, RiArrowRightLine, RiAddLine, RiSubtractLine  } from "react-icons/ri";
import { FaRegTrashAlt } from "react-icons/fa";
import { Tooltip } from 'react-tooltip'

const BottomPanel = (props) => {
    return (
        <div className="fixed flex items-center bottom-0 p-3 z-[2]">
            <div className="flex items-center bg-zinc-200 rounded-lg p-1">
                <button 
                    data-tooltip-id="zoom-out"
                    data-tooltip-content="zoom out"
                    data-tooltip-delay-show="700"
                    data-tooltip-delay-hide="10"
                    className="button text-base text-zinc-900 color p-1 hover:opacity-75" 
                    onClick={() => props.onZoom(-0.1)}
                >
                    <RiSubtractLine />
                    <Tooltip id="zoom-out" />
                </button>

                <button 
                    data-tooltip-id="reset-scale"
                    data-tooltip-content="reset scale"
                    data-tooltip-delay-show="700"
                    data-tooltip-delay-hide="10"
                    className="button text-base text-zinc-900 p-1 hover:opacity-75 noselect" 
                    onClick={() => props.setScale(1)}
                >
                    {new Intl.NumberFormat("en-GB", {style: "percent"}).format(props.scale)}
                    <Tooltip id="reset-scale" />
                </button>

                <button 
                    data-tooltip-id="zoom-in"
                    data-tooltip-content="zoom in"
                    data-tooltip-delay-show="700"
                    data-tooltip-delay-hide="10"
                    className="button text-base text-zinc-900 p-1 hover:opacity-75" 
                    onClick={() => props.onZoom(0.1)}
                >
                    <RiAddLine />
                    <Tooltip id="zoom-in" />
                </button>
            </div>

            <div className="flex items-center bg-zinc-200 rounded-lg ml-3 p-1">
                <button 
                    data-tooltip-id="undo"
                    data-tooltip-content="undo"
                    data-tooltip-delay-show="700"
                    data-tooltip-delay-hide="10"
                    className="button text-base text-zinc-900 p-2 hover:opacity-75" 
                    onClick={props.undo}
                >
                    <RiArrowLeftLine />
                    <Tooltip id="undo" />
                </button>
                <button 
                    data-tooltip-id="redo"
                    data-tooltip-content="redo"
                    data-tooltip-delay-show="700"
                    data-tooltip-delay-hide="10"
                    className="button text-base text-zinc-900 p-2 hover:opacity-75" 
                    onClick={props.redo}
                >
                    <RiArrowRightLine />
                    <Tooltip id="redo" />
                </button>
            </div>

            <button 
                data-tooltip-id="clear"
                data-tooltip-content="clear board"
                data-tooltip-delay-show="700"
                data-tooltip-delay-hide="10"
                className="button text-base text-zinc-900 bg-zinc-200 hover:opacity-75 rounded-lg ml-3 p-3"
                onClick={props.clear}
            >
                <FaRegTrashAlt />
                <Tooltip id="clear" />
            </button>
        </div>
    )
}

export default BottomPanel;