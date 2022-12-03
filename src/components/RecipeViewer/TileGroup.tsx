// The GPL License, Copyright (c) 2021, hans0000
import React from "react";
import { ITileData } from "../../lib";

interface IProps {
    data: ITileData[]
}
export default function TileGroup(props: IProps) {
    const result = React.useMemo(() => props.data || [], [props.data])
    return (
        <div className='tile-group' style={{ display: 'flex' }}>
            {
                result.map((item, index) => {
                    return (
                        <i key={index} style={{ display: 'inline-block' }} className={`icon-${item.id}`}></i>
                    )
                })
            }
        </div>
    )
}