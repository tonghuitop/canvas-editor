const drwaPagePaddingIndicators = (ctx: CanvasRenderingContext2D, pageConfig: SinglePageConfigType) => {
  const { pagePadding, pageWidth, pageHeight, pagePaddingIndicatorColor, pagePaddingIndicatorSize } = pageConfig
  /** 保存当前 canvas 状态 */
  ctx.save()
  ctx.strokeStyle = pagePaddingIndicatorColor
  let list: Array<[Point, Point, Point]> = [
    // 左上
    [
      [pagePadding[3], pagePadding[0] - pagePaddingIndicatorSize],
      [pagePadding[3], pagePadding[0]],
      [pagePadding[3] - pagePaddingIndicatorSize, pagePadding[0]],
    ],
    // 右上
    [
      [pageWidth - pagePadding[1], pagePadding[0] - pagePaddingIndicatorSize],
      [pageWidth - pagePadding[1], pagePadding[0]],
      [pageWidth - pagePadding[1] + pagePaddingIndicatorSize, pagePadding[0]],
    ],
    // 左下
    [
      [pagePadding[3], pageHeight - pagePadding[2] + pagePaddingIndicatorSize],
      [pagePadding[3], pageHeight - pagePadding[2]],
      [pagePadding[3] - pagePaddingIndicatorSize, pageHeight - pagePadding[2]]
    ],
    // 右下
    [
      [pageWidth - pagePadding[1], pageHeight - pagePadding[2] + pagePaddingIndicatorSize],
      [pageWidth - pagePadding[1], pageHeight - pagePadding[2]],
      [pageWidth - pagePadding[1] + pagePaddingIndicatorSize, pageHeight - pagePadding[2]]
    ]
  ]

  list.forEach((item) => {
    item.forEach((point, index) => {
      if (index === 0) {
          ctx.beginPath()
          ctx.moveTo(...point)
      } else {
          ctx.lineTo(...point)
      }
      if (index >= item.length - 1) {
          ctx.stroke()
      }
    })
  })
  ctx.restore()
}

/**
 * 
 * @param element 
 * @param fontConfig 
 * @returns `font-style font-weight font-size font-family`
 */
const getFontConfig = (element: DataItem, fontConfig: FontConfig) => {
  const { fontSize, fontFamily } = fontConfig
  const { italic, bold, size, fontFamily: elFontFamily } = element
  const italicStr = italic ? 'italic' : ''
  const boldStr = bold ? 'bold' : ''
  const curFontSize = size || fontSize
  const curFontfamily = elFontFamily || fontFamily
  return `${italicStr} ${boldStr} ${curFontSize}px ${curFontfamily}`
}

// const getTextAttributes = (text: string) => {
//   const canvas = document.createElement('canvas')
//   const ctx = canvas.getContext('2d')!
//   return ctx.measureText(text)
// }

export { drwaPagePaddingIndicators, getFontConfig }