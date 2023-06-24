// The GPL License, Copyright (c) 2021, hans0000
import React, { useEffect, useState } from "react";
import Tile from "./Tile";
import Grid from "./Grid";
import { ICraftData, ITileData } from "../../lib";
import Smithing from "./Smithing";
import SmithingTransform from "./SmithingTransform";

/**
 * 工作台
 */
export default function Crafting(props: {
    data: ICraftData;
    onClick?: (data: ITileData, index: number) => void;
    onClear?: (data: ITileData, index: number) => void;
    showCount?: boolean
}) {
    const [offset, setOffset] = useState(0)
    
    useEffect(() => {
        let timer: number;
        timer = window.setInterval(() => {
            setOffset((o) => o + 1)
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className='craft'>
            <div className="input">
                {
                    props.data.type === 'crafting_shaped' || 
                    props.data.type === 'crafting_shapeless'
                        ? <Grid rows={3} cols={3}
                            offset={offset}
                            data={props.data.input}
                            onClick={props.onClick}
                            onClear={props.onClear}  />
                        : props.data.type === 'smithing'
                        ? <Smithing offset={offset}
                            data={props.data.input}
                            onClear={props.onClear}
                            onClick={props.onClick}/>
                        : props.data.type === 'smithing_transform'
                        ? <SmithingTransform offset={offset}
                            data={props.data.input}
                            onClear={props.onClear}
                            onClick={props.onClick}/>
                        : <Tile offset={offset} data={props.data.input[0]}
                            onClear={props.onClear && props.onClear.bind(null, props.data.input[0], 0)}
                            onClick={props.onClick && props.onClick.bind(null, props.data.input[0], 0)}  />
                }
            </div>
            <div className='arrow'></div>
            <div className="output">
                <Tile data={props.data.output} showCount={props.showCount} offset={offset}
                    onClear={props.onClear && props.onClear.bind(null, props.data.output, undefined)}
                    onClick={props.onClick && props.onClick.bind(null, props.data.output, undefined)}
                    />
            </div>
        </div>
    )
}