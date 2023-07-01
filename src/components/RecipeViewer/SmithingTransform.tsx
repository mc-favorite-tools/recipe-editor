/*
 * The AGPL License (AGPL)
 * Copyright (c) 2023 hans000
 */
import React from "react";
import { ITileData } from "../../lib";
import Tile from "./Tile";

interface IProps {
    data: ITileData[];
    offset: number;
    onClick?: (data: ITileData, index: number) => void;
    onClear?: (data: ITileData, index: number) => void;
}

export default function SmithingTransform(props: IProps) {
    return (
        <div className='smithing'>
            <Tile offset={props.offset} data={props.data[0]} onClick={props.onClick && props.onClick.bind(null, props.data[0], 0)} />
            <Tile offset={props.offset} data={props.data[1]} onClick={props.onClick && props.onClick.bind(null, props.data[1], 1)} />
            <Tile offset={props.offset} data={props.data[2]} onClick={props.onClick && props.onClick.bind(null, props.data[2], 2)} />
        </div>
    )
}