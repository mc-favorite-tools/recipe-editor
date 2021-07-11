import React, { useState, useEffect } from "react";
import { ITileData } from "../../lib";
import { CloseCircleOutlined } from '@ant-design/icons'

interface IProps {
    data: ITileData;
    showCount?: boolean
    onClick?: (data: ITileData) => void;
    onClear?: (data: ITileData) => void;
    offset?: number
}

export default function Tile(props: IProps) {
    // const [offset, setOffset] = useState(0)

    const id = React.useMemo(() => {
        return props?.data?.id?.length ? props.data.id : []
    }, [props.data])

    function closeHandle(e: React.MouseEvent<any>) {
        e.stopPropagation()
        props?.onClear(props.data)
    }

    const offset = React.useMemo(() => {
        if (id.length) {
            return (props.offset + 1) % id.length
        }
        return 0
    }, [props.offset])

    return (
        <div className="tile" onClick={props?.onClick?.bind(null, props.data)}>
            <i style={{ display: 'inline-block' }} className={`icon-${id[offset]}`}>
                { props.showCount && props.data?.count ? <span>{props.data.count}</span> : null }
                { props.data?.id?.length ? <CloseCircleOutlined onClick={closeHandle} className='close' /> : null}
            </i>
        </div>
    )
}