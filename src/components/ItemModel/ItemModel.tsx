/*
 * The AGPL License (AGPL)
 * Copyright (c) 2023 hans000
 */
import { Modal, Row, Col, Select, InputNumber, message } from "antd";
import React, { useState, useEffect, useContext } from "react";
import { ITileData } from "../../lib";
import { AppContenxt } from "../../store";
import { request } from "../../utils";
import Tile from "../RecipeViewer/Tile";

interface IProps {
    visible: boolean;
    value: ITileData;
    showCount: boolean;
    onOk: (item: ITileData) => void;
    onCancel: () => void
    limit: number
}
/**
 * 物品选择框
 */
export default function ItemModal(props: IProps) {
    const [count, setCount] = useState(1)
    const [value, setValue] = useState<string[]>([])
    const [options, setOptions] = useState<Array<{ id: string, name: string }>>([])
    const [state] = useContext(AppContenxt)

    useEffect(() => {
        const result = Object.entries(state.lang).map(([id, name]: [string, string]) => {
            return { id, name }
        })
        setOptions(result)
    }, [state.lang])

    useEffect(() => {
        setValue(() => props.value?.id || [])
        setCount(() => props.value?.count || 1)
    }, [props.visible])
    
    function handleOk() {
        props?.onOk({ id: value, count })
        props?.onCancel()
    }
    
    function handleChange(value: string[]) {
        if (value.length > props.limit) {
            message.warning(`仅能选择 ${props.limit} 项`)
            return
        }
        setValue(() => value)
    }
    
    function handleClear(data: ITileData) {
        setValue(val => {
            const [id] = data.id
            const cache = [...val]
            cache.splice(val.findIndex(v => v === id), 1)
            return cache
        })
    }
    
    function tagRender(props) {
        return (
            <Tile offset={0} onClear={handleClear} data={{ id: [props.value] }} />
        )
    }
    const version = React.useMemo(() => state.version.split('.')[1], [state.version])

    return (
        <Modal
            className='item-modal'
            okText='确定'
            cancelText='取消'
            title='物品选择框'
            maskClosable={false}
            width={690}
            onOk={handleOk}
            onCancel={props.onCancel}
            visible={props.visible}>
            <Row style={{ marginBottom: 16 }}>
                <Col span={4} style={{ textAlign: 'right', paddingRight: 20, lineHeight: '30px' }}>物品</Col>
                <Col span={17}>
                    <Select
                        showSearch
                        allowClear
                        mode={'multiple'}
                        value={value}
                        tagRender={tagRender}
                        onChange={handleChange}
                        style={{ width: '100%' }}
                        filterOption={(keyword, { name, value }) => (value + name).includes(keyword)}
                        notFoundContent='暂无内容'
                        placeholder='请选择，可搜索'>
                        {
                            options.map(({ id, name }) => (
                                <Select.Option key={id} value={id} name={name}>
                                    <div className='select-item'>
                                        <i className={`icon-${version} ${id}-${version}`}></i>
                                        <span>{name} - {id}</span>
                                    </div>
                                </Select.Option>
                            ))
                        }
                    </Select>
                </Col>
            </Row>
            {
                props.showCount ? (
                    <Row style={{ marginBottom: 16 }}>
                        <Col span={4} style={{ textAlign: 'right', paddingRight: 20, lineHeight: '30px' }}>数量</Col>
                        <Col span={17}>
                            <InputNumber step={1} max={64} min={1} style={{ width: '100%' }} value={count} onChange={(value) => setCount(() => value)} />
                        </Col>
                    </Row>
                ) : null
            }
        </Modal>
    )
}