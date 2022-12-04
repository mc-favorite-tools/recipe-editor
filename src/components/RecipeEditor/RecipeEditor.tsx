// The GPL License, Copyright (c) 2021, hans0000
import { Row, Col, Select, Input, InputNumber, Divider, Button, message, Tooltip } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { CraftMap, CraftType, CraftTypeId, getType, ICraftData, ITileData } from "../../lib";
import Recipe, { CustomRecipeItem } from "../../lib/Recipe";
import { download, request, trimPrefix } from "../../utils";
import Crafting from "../RecipeViewer";
import ItemModel from "../ItemModel";
import { InfoCircleOutlined } from '@ant-design/icons'
import { AppContenxt } from "../../store";

const defaultValue: ICraftData = { type: 'crafting_shaped', input: [], output: {} }
let recipe = new Recipe()

let mapExperience = {}
let mapCookingtime = {}

export default function(props: {
}) {
    const [state, dispatch] = useContext(AppContenxt)
    const [showCount, setShowCount] = useState(true)
    const [itemModalVisible, setItemModalVisible] = useState(false)
    const [data, setData] = useState<ICraftData>(defaultValue)
    const [actIndex, setActIndex] = useState<number>(0)
    const [importText, setImportText] = useState('')
    const [filename, setFilename] = useState('')
    const [recipeName, setRecipeName] = useState(undefined)
    const [modalVal, setModalVal] = useState<ITileData>()
    const [limit, setLimit] = useState(-1)
    const [importType, setImportType] = useState(1)
    const [recipeMeta, setRecipeMeta] = useState<Array<{ file: string; id: string; type: string }>>([])
    
    useEffect(() => {
        dispatch({
            type: 'UpdateLoading',
            payload: true
        })
        request('./assets/default.json').then(data => {
            mapCookingtime = data.cookingtime
            mapExperience = data.experience
        }).catch(() => {
            message.error('资源加载失败')
        }).finally(() => {
            dispatch({
                type: 'UpdateLoading',
                payload: false
            })
        })
    }, [])

    useEffect(() => {
        dispatch({
            type: 'UpdateLoading',
            payload: true
        })
        request(`https://unpkg.com/@wikijs/mc-recipes@1.0.5/dist/${state.version}.json`).then(data => {
            setRecipeMeta(data)
        }).catch(() => {
            message.error('资源加载失败')
        }).finally(() => {
            dispatch({
                type: 'UpdateLoading',
                payload: false
            })
        })
    }, [state.version])

    function fetchIdsByTag(tag: string) {
        return state.tagZip.file(`items/${tag}.json`).async('string').then(data => {
            return JSON.parse(data).values.map(item => ({ item }))
        })
    }

    function parseTag(obj: any) {
        // 解析tags - 无序
        if (obj.ingredients?.length) {
            return Promise.all(obj.ingredients.map(item => {
                if (item.tag) {
                    return fetchIdsByTag(trimPrefix(item.tag)).then(data => data)
                }
                return item
            })).then(data => {
                obj.ingredients = data
                return obj
            })
        }

        if (obj.key) {
            return Promise.all(Object.keys(obj.key).map(char => {
                const tag = obj.key[char].tag
                if (tag) {
                    return fetchIdsByTag(trimPrefix(tag)).then(data => ({ [char]: data }))
                }
                return { [char]: obj.key[char] }
            })).then(data => {
                obj.key = Object.assign({}, ...data)
                return obj
            })
        }
        return Promise.resolve(obj)
    }

    function importFile(value: string) {
        if (! value) {
            message.warn('请输入数据！')
            return Promise.reject()
        }
        try {
            const obj = JSON.parse(value)
            return parseTag(obj).then(data => {
                recipe.import(data)
                updateJson()
            })
        } catch (error) {
            if (value !== '') {
                message.warning('解析失败')
                console.log(error);
            }
            setData(() => defaultValue)
            return Promise.reject()
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
            navigator.clipboard.writeText(text)
            message.success('已复制到剪贴板')
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
        setImportText('')
        setFilename('')
        setRecipeName(undefined)
        recipe.reset()
        updateJson()
    }

    function handleImport(value: string) {
        setRecipeName(value)
        dispatch({ type: 'UpdateLoading', payload: true })
        state.recipeZip.file(`${value}.json`).async('string').then(text => {
            setImportText(text)
            return importFile(text)
        }).finally(() => {
            dispatch({ type: 'UpdateLoading', payload: false })
        })
    }
    
    const show = React.useMemo(() => getType(data.type) === CraftType.Other, [data.type])
    const version = React.useMemo(() => state.version.split('.')[1], [state.version])
    
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
                            Object.keys(CraftMap).filter(key => !CraftMap[key].disabled.includes(state.version)).map((k) => {
                                const value = CraftMap[k as keyof typeof CraftMap].name
                                return (
                                    <Select.Option key={k} value={k}>
                                        <div className='select-item'>
                                            <i className={`icon-${version} ${CraftMap[k].icon}-${version}`}></i>
                                            <span>{value} - {k}</span>
                                        </div>
                                    </Select.Option>
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
                    <Input.Group compact>
                        <Select value={importType} onChange={(val) => setImportType(val)} style={{ width: '25%' }}>
                            <Select.Option value={1}>原版配方</Select.Option>
                            <Select.Option value={2}>自定义配方</Select.Option>
                        </Select>
                        {
                            importType === 1
                                ? (
                                    <Select value={recipeName} showSearch filterOption={(input, option) => {
                                        return (option.name + option.value).includes(input)
                                    }} optionLabelProp="value" style={{ width: '75%' }} placeholder='配方列表，请选择' onChange={handleImport}>
                                        {
                                            recipeMeta.map(v => <Select.Option key={v.file} name={state.lang[v.id]} value={v.file}>
                                                <div className='select-item'>
                                                    <i className={`icon-${version} ${v.id}-${version}`}></i>
                                                    <span>{state.lang[v.id]} - {v.id}</span>
                                                    <i className={`crafing icon-${version} ${CraftMap[v.type].icon}-${version}`}></i>
                                                </div>
                                            </Select.Option>)
                                        }
                                    </Select>
                                )
                                : (
                                    <Input.Search style={{ width: '75%' }} placeholder='请输入' enterButton='解析' value={importText} onChange={(e) => setImportText(e.target.value)} onSearch={importFile} />
                                )
                        }
                    </Input.Group>
                    {/*  */}
                </Col>
            </Row>
            <Row style={{ marginBottom: 16 }}>
                <Col span={4} style={{ textAlign: 'right', paddingRight: 16, lineHeight: '30px' }}>文件名</Col>
                <Col span={16}>
                    <Input.Search placeholder='请输入，缺省时复制到剪贴板' value={filename} onChange={(e) => setFilename(e.target.value)} onSearch={fileHandle} enterButton='导出' />
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