import React from "react";
import Tile from "./Tile";
import { ITileData } from "../../lib";

interface IProps {
    rows: number;
    cols: number;
    data: ITileData[];
    onClick?: (data: ITileData, index: number) => void;
    onClear?: (data: ITileData, index: number) => void;
    offset?: number
}
export default function Grid(props: IProps) {
    return (
        <div className='grid' style={{ width: props.cols * 42 }}>
            {
                Array.from({ length: props.cols * props.rows }).map((_, i) => {
                    const item = props.data[i]
                    return (
                        <Tile key={i} data={item} offset={props.offset}
                        onClear={props.onClear && props.onClear.bind(null, item, i)}
                        onClick={props.onClick && props.onClick.bind(null, item, i)} />
                    )
                })
            }
        </div>
    )
}