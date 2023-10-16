import { Select } from 'antd'
import { useState } from 'react'

import { boldIcon, italicIcon, sizeAddIcon, sizeMinusIcon, strikeoutIcon, underlineIcon } from '../assets/icon'
import { fontFamilyList, FontFamilyType } from './config'

import './index.less'


const Toolbar = () => {
  const [fontFamily, setFontFamily] = useState<FontFamilyType>('Yahei')
  return (
    <div className="toolbar">
      <Select
        options={fontFamilyList}
        value={fontFamily}
        onChange={setFontFamily}
      />
      <div className="btn sizeAdd">
        <i />
      </div>
      <div className="btn sizeMinus">
        <i />
      </div>
      <div className="btn bold">
        <i />
      </div>
      <div className="btn italic">
        <i />
      </div>
      <div className="btn underline">
        <i />
      </div>
      <div className="btn linethrough">
        <i />
      </div>
    </div>  
  )
}

export default Toolbar