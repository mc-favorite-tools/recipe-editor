// The GPL License, Copyright (c) 2021, hans0000
import { message, Select, Spin } from 'antd';
import React, { useEffect } from 'react'
import RecipeEditor from './components/RecipeEditor'
import { AppContenxt, useAppReducer } from './store';
import { request } from './utils';
import jszip from 'jszip'

function App() {

    const [state, dispatch] = useAppReducer()

    useEffect(() => {
        dispatch({ type: 'UpdateLoading', payload: true })
        request(`https://unpkg.com/@wikijs/mc-recipes/dist/langs/${state.version}.json`)
            .then(data => {
                dispatch({ type: 'UpdateLang', payload: data })
            })
            .finally(() => {
                dispatch({ type: 'UpdateLoading', payload: false })
            })
    }, [state.version])

    useEffect(() => {
        Promise.all([
            fetch(`https://unpkg.com/@wikijs/mc-recipes/dist/recipes/${state.version}.zip`)
                .then(res => res.arrayBuffer())
                .then(data => jszip.loadAsync(data)),
            fetch(`https://unpkg.com/@wikijs/mc-tags/dist/${state.version}.zip`)
                .then(res => res.arrayBuffer())
                .then(data => jszip.loadAsync(data)),
        ]).then(([recipeZip, tagZip]) => {
            dispatch({ type: 'UpdateRecipeZip', payload: recipeZip })
            dispatch({ type: 'UpdateTagZip', payload: tagZip })
        }).catch(() => {
            message.error('资源加载失败')
        }).finally(() => {
            dispatch({ type: 'UpdateLoading', payload: false })
        })
    }, [state.version])

    return (
        <AppContenxt.Provider value={[state, dispatch]}>
            <Spin spinning={state.loading}>
                <div className="App">
                    <div className='header'>
                        <h1>MC Recipe Editor</h1>
                        <div className='right'>
                            <Select value={state.version} onChange={(v) => {
                                dispatch({
                                    type: 'UpdateVersion',
                                    payload: v,
                                })
                            }} bordered={false} style={{ width: 80, color: '#fff' }}>
                                {
                                    state.versionList.map(v => {
                                        return (
                                            <Select.Option key={v} value={v}>v{v}</Select.Option>
                                        )
                                    })
                                }
                            </Select>
                            <a href="https://github.com/hans000/mc-recipe-editor/issues" target='_blank'>问题反馈</a>
                        </div>
                    </div>
                    <RecipeEditor />
                    <div className="footer">
                        <span>Copyright © {new Date().getFullYear()} by </span>
                        <a href="https://github.com/hans000/mc-recipe-editor" target="_blank">hans000</a>
                        <span style={{ padding: 8 }}>QQ: 2112717288</span>
                    </div>
                </div>
            </Spin>
        </AppContenxt.Provider>
    )
}

export default App
