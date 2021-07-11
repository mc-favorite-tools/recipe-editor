import { Tooltip } from 'antd';
import 'antd/dist/antd.css';
import React from 'react'
import RecipeEditor from './components/RecipeEditor'

function App() {
  return (
    <div className="App">
      <h1>
          MC Recipe Editor
          <div className='right'>
              <a href="https://github.com/hans000/mc-recipe-editor/issues" target='_blank'>问题反馈</a>
          </div>
      </h1>
      <RecipeEditor />
      <div className="footer">
        <span>by </span>
        <a href="https://github.com/hans000/mc-recipe-editor" target="_blank">hans000</a>
        <span style={{ padding: 8 }}>交流群916625813</span>
        <Tooltip
          title={
            <>
            <img width={110} height={160} src='./assets/wx.jpg'></img>
            <img width={110} height={160} src='./assets/al.jpg'></img>
            </>
          }>
          <a>赞助作者</a>
        </Tooltip>
      </div>
    </div>
  )
}

export default App
