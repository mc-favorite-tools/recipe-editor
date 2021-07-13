import { Row, Col, Select, Input, InputNumber, Divider, Button, notification, message, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { CraftMap, CraftType, CraftTypeId, getType, ICraftData, ITileData } from "../../lib";
import Recipe, { CustomRecipeItem } from "../../lib/Recipe";
import { download } from "../../utils";
import copy from "copy-to-clipboard";
import Crafting from "../RecipeViewer";
import ItemModel from "../ItemModel";
import { InfoCircleOutlined } from '@ant-design/icons'
import Axios from 'axios'

const defaultValue: ICraftData = { type: 'crafting_shaped', input: [], output: {} }
let recipe = new Recipe()
const version = '1.0.1'

let mapExperience = {}
let mapCookingtime = {}

export default function() {
    
    const [showCount, setShowCount] = useState(true)
    const [itemModalVisible, setItemModalVisible] = useState(false)
    const [data, setData] = useState<ICraftData>(defaultValue)
    const [actIndex, setActIndex] = useState<number>(0);
    const [importText, setImportText] = useState('');
    const [filename, setFilename] = useState('');
    const [modalVal, setModalVal] = useState<ITileData>();
    const [limit, setLimit] = useState(-1)

    useEffect(() => {
        const oldVersion = localStorage.getItem('version')
        if (oldVersion !== version) {
            notification.open({
                duration: 0,
                message: (
                    <div>
                        <h3>{version}-beta版本</h3>
                        <div>支持常见8种类型配方的定义</div>
                        <div>支持展示数组类型的配方</div>
                        <div>支持下载文件与复制到剪贴板</div>
                        <div>支持部分经验值和烧制时间默认值填充</div>
                        <div style={{ textAlign: 'right' }}>感谢您的支持 by hans000</div>
                    </div>
                )
            })
            localStorage.setItem('version', version)
        }
    }, [])

    useEffect(() => {
        Axios.get('./assets/default.json').then((data: any) => {
            mapCookingtime = data.cookingtime
            mapExperience = data.experience
        })
    })

    function importFile(value: string) {
        if (!value) {
            message.warning('请输入数据！')
            return
        }
        try {
            const obj = JSON.parse(value)
            recipe.import(obj)
            updateJson()
        } catch (error) {
            if (value !== '') {
                message.warning('解析失败')
                console.log(error);
            }
            setData(() => defaultValue)
        }
    }
    
    function updateJson() {
        setData(() => recipe.data)
        setModalVal(() => undefined)
        setActIndex(() => 0)
    }
    
    function clickHandle(data: ITileData, index: number) {
        setLimit(() => index === undefined ? 1 : Infinity)
        setActIndex(() => index);
        setModalVal(() => data)
        setShowCount(() => index === undefined && getType(recipe.getProps('type') as CraftTypeId) !== CraftType.Other)
        setItemModalVisible(() => true)
    }
    
    function clearHandle(_: any, index: number) {
        if (index === undefined) {
            recipe.setProps({
                result: {
                    item: undefined,
                    count: 0,
                },
            })
        } else {
            const ingredients = recipe.getProps('ingredients') as CustomRecipeItem[]
            ingredients[index] = { item: [] }
            recipe.setProps({
                ingredients
            })
        }
        updateJson()
    }

    function firstTile(item: ITileData) {
        const type = recipe.getProps('type') as string
        const hasExp = ['blasting', 'smoking', 'smelting', 'campfire_cooking'].includes(type)
        if (hasExp) {
            recipe.setProps({
                cookingtime: mapCookingtime[type]
            })
        }
        recipe.setProps({
            experience: mapExperience[item.id[0]]
        })
    }
    
    function okHandle(item: ITileData) {
        if (actIndex === undefined) {
            recipe.setProps({
                result: {
                    item: item.id[0],
                    count: item.count,
                },
            })
        } else {
            if (! actIndex) {
                firstTile(item)
            }
            const ingredients = recipe.getProps('ingredients') as CustomRecipeItem[]
            ingredients[actIndex] = { item: item.id }
            recipe.setProps({
                ingredients
            })
        }
        updateJson()
    }
    
    function typeChange(type: CraftTypeId) {
        recipe.setProps({ type })
        setShowCount(() => getType(recipe.getProps('type') as CraftTypeId) !== CraftType.Other)
        updateJson()
    }
    
    function groupChange(e: any) {
        recipe.setProps({ group: e.target.value })
        updateJson()
    }
    
    function fileHandle(filename: string) {
        const text = JSON.stringify(recipe.toJson(), null, 2)
        if (filename) {
            if (!/^[a-zA-Z\\$_][a-zA-Z\d_]*$/.test(filename)) {
                message.success('请输入合法的文件名')
                return;
            }
            download(filename + '.json', text)
        } else {
            copy(text)
            message.success('已复制到剪切板')
        }
    }
    
    function cookingtimeChange(cookingtime: number) {
        recipe.setProps({ cookingtime })
        updateJson()
    }
    
    function experienceChange(experience: number) {
        recipe.setProps({ experience })
        updateJson()
    }
    
    function reset() {
        setImportText(() => '')
        setFilename(() => '')
        recipe.reset()
        updateJson()
    }
    
    const show = React.useMemo(() => getType(data.type) === CraftType.Other, [data.type])
    
    return (
        <div>
            <Crafting
                showCount={showCount}
                data={data}
                onClick={clickHandle}
                onClear={clearHandle} />
            <ItemModel
                limit={limit}
                showCount={showCount}
                value={modalVal}
                visible={itemModalVisible}
                onCancel={() => setItemModalVisible(false)}
                onOk={okHandle} />
            <Row style={{ marginBottom: 16 }}>
                <Col span={4} style={{ textAlign: 'right', paddingRight: 8, lineHeight: '30px' }}>
                    <span>type</span>
                    <Tooltip title='配方类型'>
                        <InfoCircleOutlined style={{ color: '#aaa', paddingLeft: 4, verticalAlign: 'middle' }} />
                    </Tooltip>
                </Col>
                <Col span={16}>
                    <Select style={{ width: '100%' }} onChange={typeChange} value={data.type} defaultValue='crafting_shaped' placeholder='请选择'>
                        {
                            Object.keys(CraftMap).map((k) => {
                                const value = CraftMap[k as keyof typeof CraftMap].name
                                return (
                                    <Select.Option key={k} value={k}>{value} - {k}</Select.Option>
                                )
                            })
                        }
                    </Select>
                </Col>
            </Row>
            <Row style={{ marginBottom: `${show ? '16px' : 0}` }}>
                <Col span={4} style={{ textAlign: 'right', paddingRight: 8, lineHeight: '30px' }}>
                    <span>group</span>
                    <Tooltip title='分组标识'>
                        <InfoCircleOutlined style={{ color: '#aaa', paddingLeft: 4, verticalAlign: 'middle' }} />
                    </Tooltip>
                </Col>
                <Col span={16}>
                    <Input allowClear value={data.group} onChange={groupChange} placeholder='选填，相同标识符的配方会在配方书中被显示为一组' />
                </Col>
            </Row>
            {
                show
                    ? (
                        <>
                            <Row style={{ marginBottom: 16 }}>
                                <Col span={4} style={{ textAlign: 'right', paddingRight: 8, lineHeight: '30px' }}>
                                    <span>cookingtime</span>
                                    <Tooltip title='烧炼时间，单位tick，20tick=1s'>
                                        <InfoCircleOutlined style={{ color: '#aaa', paddingLeft: 4, verticalAlign: 'middle' }} />
                                    </Tooltip>
                                </Col>
                                <Col span={16}>
                                    <InputNumber min={0} step={20} precision={0} value={data.cookingtime} onChange={cookingtimeChange} style={{ width: '100%' }} placeholder='请输入，单位tick' />
                                </Col>
                            </Row>
                            <Row>
                                <Col span={4} style={{ textAlign: 'right', paddingRight: 8, lineHeight: '30px' }}>
                                    <span>experience</span>    
                                    <Tooltip title='经验值'>
                                        <InfoCircleOutlined style={{ color: '#aaa', paddingLeft: 4, verticalAlign: 'middle' }} />
                                    </Tooltip>
                                </Col>
                                <Col span={16}>
                                    <InputNumber min={0} step={0.1} value={data.experience} onChange={experienceChange} style={{ width: '100%' }} placeholder='请输入' />
                                </Col>
                            </Row>
                        </>
                    )
                    : null
            }
            <Row>
                <Col offset={4} span={16}>
                    <Divider />
                </Col>
            </Row>
            <Row style={{ marginBottom: 16 }}>
                <Col span={4} style={{ textAlign: 'right', paddingRight: 16, lineHeight: '30px' }}>导入</Col>
                <Col span={16}>
                    <Input.Search placeholder='请输入' enterButton='解析' value={importText} onChange={(e) => setImportText(e.target.value)} onSearch={importFile} />
                </Col>
            </Row>
            <Row style={{ marginBottom: 16 }}>
                <Col span={4} style={{ textAlign: 'right', paddingRight: 16, lineHeight: '30px' }}>文件名</Col>
                <Col span={16}>
                    <Input.Search placeholder='请输入，缺省时复制到剪切板' value={filename} onChange={(e) => setFilename(e.target.value)} onSearch={fileHandle} enterButton='导出' />
                </Col>
            </Row>
            <Row style={{ marginBottom: 16 }}>
                <Col span={4} style={{ textAlign: 'right', paddingRight: 16, lineHeight: '30px' }}>操作</Col>
                <Col span={16}>
                    <Button style={{ marginRight: 8 }} onClick={reset} type='primary'>重置</Button>
                </Col>
            </Row>
        </div>
    )
}