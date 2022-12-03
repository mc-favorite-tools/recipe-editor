// The GPL License, Copyright (c) 2021, hans0000
import React, { useContext } from "react";
import { ITileData } from "../../lib";
import { CloseCircleOutlined } from '@ant-design/icons'
import { AppContenxt } from "../../store";

interface IProps {
    data: ITileData;
    showCount?: boolean
    onClick?: (data: ITileData) => void;
    onClear?: (data: ITileData) => void;
    offset?: number
}

export default function Tile(props: IProps) {
    const [state] = useContext(AppContenxt)

    const ids = React.useMemo(() => {
        return props?.data?.id?.length ? props.data.id : []
    }, [props.data])

    function closeHandle(e: React.MouseEvent<any>) {
        e.stopPropagation()
        props?.onClear(props.data)
    }

    const offset = React.useMemo(() => {
        if (ids.length) {
            return (props.offset + 1) % ids.length
        }
        return 0
    }, [props.offset])

    const cls = React.useMemo(() => {
        const v = state.version.split('.')[1]
        const id = ids[offset]
        const name = (id === 'error' || !state.lang[id]) ? 'error' : `${id}-${v}`
        return id ? `icon-${v} ${name}` : 'undefined'
    }, [ids, state.version, offset, state.lang])

    const title = React.useMemo(() => {
        const id = ids[offset]
        return id === 'error' ? '' : state.lang[id] + '-' + id
    }, [ids, offset, state.lang])

    return (
        <div className="tile" onClick={props?.onClick?.bind(null, props.data)}>
            <i title={title} style={{ display: 'inline-block' }} className={cls}>
                { props.showCount && props.data?.count ? <span>{props.data.count}</span> : null }
                { props.data?.id?.length ? <CloseCircleOutlined onClick={closeHandle} className='close' /> : null}
            </i>
        </div>
    )
}