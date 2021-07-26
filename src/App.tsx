import { Select, Spin } from 'antd';
import 'antd/dist/antd.css';
import React, { useEffect } from 'react'
import RecipeEditor from './components/RecipeEditor'
import { AppContenxt, useAppReducer } from './store';
import { request } from './utils';

function App() {

  const [state, dispatch] = useAppReducer()

  useEffect(() => {
    request(`https://unpkg.com/@wikijs/mc-recipes/dist/langs/${state.version}.json`)
      .then(data => {
        dispatch({
          type: 'UpdateLang',
          payload: data,
        })
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
            <span>by </span>
            <a href="https://github.com/hans000/mc-recipe-editor" target="_blank">hans000</a>
            <span style={{ padding: 8 }}>交流群916625813</span>
          </div>
        </div>
      </Spin>
    </AppContenxt.Provider>
  )
}

export default App
