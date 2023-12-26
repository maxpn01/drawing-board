import { Tooltip } from 'react-tooltip'

const Tool = (props) => {
    return (
        <button 
            data-tooltip-id={props.toolType}
            data-tooltip-content={props.toolType}
            data-tooltip-delay-show="1000"
            data-tooltip-delay-hide="10"
            className="text-base text-zinc-900 p-4 hover:opacity-75" 
            onClick={() => props.setTool(props.toolType)}>
            {props.icon}
            <Tooltip id={props.toolType} />
        </button>
    )
}

export default Tool;