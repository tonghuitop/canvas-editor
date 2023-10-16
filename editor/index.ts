// import { MouseEvent } from 'react'
import { drwaPagePaddingIndicators, getFontConfig } from './utils'

class Editor {
  private container: HTMLDivElement
  private options: Required<EditorPageOptions>
  /** 页面canvas列表 */
  private pageCanvasList: Array<HTMLCanvasElement>
  private pageCanvasCtxList: Array<CanvasRenderingContext2D>
  private data: Array<DataItem>
  /** 渲染的行数据 */
  private rows: Array<any>
  /** 定位元素的列表 */
  private positionList: Array<any>
  /** 光标 */
  private cursorEl: HTMLDivElement | null

  
  constructor(container: HTMLDivElement, data: Array<any> = [], options: EditorPageOptions = {}) {
    this.container = container
    this.data = data // 数据
    this.options = Object.assign({
      pageWidth: 794,
      pageHeight: 1123,
      pagePadding: [100, 120, 100, 120],
      pageMargin: 20,
      pagePaddingIndicatorSize: 35,
      pagePaddingIndicatorColor: '#BABABA',
      color: '#333',
      fontSize: 16,
      fontFamily: 'Yahei',
      /** 行高 */
      lineHeight: 1.5,
    }, options)
    this.pageCanvasList = []
    this.pageCanvasCtxList = []
    // 渲染的行数据
    this.rows = []
    // 定位元素列表
    this.positionList = []
    this.createPage(0)

    this.render()

    // 渲染光标
    this.cursorEl = null
  }

  /**
   * 渲染
   */
  private render() {
    this.clear()
    this.rows = []
    this.positionList = []
    this.computeRows()
    this.renderPage()
  }

  /**
   * 渲染页面
   */
  private renderPage() {
    const { contentHeight } = this.getPageConfig()
    // 从第一页开始绘制
    let pageIndex = 0
    let ctx = this.pageCanvasCtxList[pageIndex]
    // 当前页绘制到的高度
    let renderHeight = 0
    // 绘制四个角
    this.renderPagePaddingIndicators(pageIndex)
    this.rows.forEach((row, index) => {
      if (renderHeight + row.height > contentHeight) {
        // 当前页面已满，创建下一页
        pageIndex++
        // 下一页没有创建则先创建
        let page = this.pageCanvasList[pageIndex]
        if (!page) {
          this.createPage(page)
        }
        this.renderPagePaddingIndicators(pageIndex)
        ctx = this.pageCanvasCtxList[pageIndex]
        renderHeight = 0
      }

      // 绘制当前行
      this.renderRow(ctx, renderHeight, row, pageIndex, index)
      // 更新当前页绘制到的高度
      renderHeight += row.height
    })
  }

  /**
   * 渲染 行
   */
  renderRow(ctx: CanvasRenderingContext2D, renderHeight: number, row: any,  pageIndex: number, rowIndex: number) {
    const { color, pagePadding } = this.options
    // 内边距
    const offsetX = pagePadding[3]
    const offsetY = pagePadding[0]
    // 当前行绘制到的宽度
    let renderWidth = offsetX
    renderHeight += offsetY

    // eg: 绘制文字的高度，行内最大高度，文本的最大高度的
    const textHeight = renderHeight + row.height - (row.height - row.originHeight) / 2 - row.descent
    
    row.elementList.forEach((item: any) => {
      // 收集positionList
      this.positionList.push({
        ...item,
        pageIndex, // 所在页
        rowIndex,  // 所在行
        /** 包围框 */
        rect: {
          leftTop: [renderWidth, renderHeight],
          leftBottom: [renderWidth, renderHeight + row.height],
          rightTop: [renderWidth + item.info.width, renderHeight],
          rightBottom: [
            renderWidth + item.info.width,
            renderHeight + row.height
          ]
        }
      })


      // 跳过换行符
      if (item.value === '\n') {
        return
      }

      // 渲染背景
      if (item.background) {
        ctx.save()
        ctx.beginPath()
        ctx.fillStyle = item.background
        ctx.fillRect(
          renderWidth,
          renderHeight,
          item.info.width,
          row.height
        )
        ctx.restore()
      }

      // 渲染下划线
      if (item.underline) {
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(renderWidth, renderHeight + row.height)
        ctx.lineTo(renderWidth + item.info.width, renderHeight + row.height)
        ctx.stroke()
        ctx.restore()
      }

      // 渲染删除线
      if (item.linethrough) {
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(renderWidth, renderHeight + row.height / 2)
        ctx.lineTo(renderWidth + item.info.width, renderHeight + row.height / 2)
        ctx.stroke()
        ctx.restore()
      }

      // 渲染文字
      ctx.save()
      ctx.font = item.font
      ctx.fillStyle = item.color || color
      ctx.fillText(item.value, renderWidth, textHeight)
      // 更新当前行绘制的宽度

      renderWidth += item.info.width
      ctx.restore()
    })

    
    // 辅助线
    // ctx.beginPath()
    // ctx.moveTo(pagePadding[3], renderHeight + row.height)
    // ctx.lineTo(673, renderHeight + row.height)
    // ctx.stroke()
  }

  /**
   * 创建页面
   */
  private createPage(pageIndex: number) {
    let { pageWidth, pageHeight, pageMargin } = this.options
    let canvas = document.createElement('canvas')
    canvas.width = pageWidth
    canvas.height = pageHeight
    canvas.style.cursor = 'text'
    canvas.style.backgroundColor = '#fff'
    canvas.style.boxShadow = "#9ea1a566 0 2px 12px"
    canvas.style.marginBottom = pageMargin + 'px'
    this.container.appendChild(canvas)
    let ctx = canvas.getContext('2d')!
    this.pageCanvasList.push(canvas)
    this.pageCanvasCtxList.push(ctx)

    canvas.addEventListener('mousedown', (e: MouseEvent) => {
      this.onMousedown(e, pageIndex)
    })
  }

  /**
   * 页面鼠标按下事件
   */
  private onMousedown(e: MouseEvent, pageIndex: number) {
    /** 鼠标按下位置相对于页面canvas的坐标 */
    const { x, y } = this.windowToCanvas(e, this.pageCanvasList[pageIndex])
    /** 计算该光标对应的元素索引 */
    const positionIndex = this.getPositionByPos(x, y, pageIndex)
    /** 根据元素索引计算出光标位置和高度信息 */
    const cursorInfo = this.getCursorInfo(positionIndex)
    /** 渲染光标 */
    const cursorPos = this.canvasToContainer(
      cursorInfo.x,
      cursorInfo.y,
      this.pageCanvasList[pageIndex]
    )
    this.setCursor(cursorPos.x, cursorPos.y, cursorInfo.height)
  }

  /**
   * 获取某个坐标所在的元素
   */
  private getPositionByPos(x: number, y: number, pageIndex: number) {
    // 是否点击某个元素内
    for (let i = 0; i < this.positionList.length; i++) {
      let cur = this.positionList[i]
      if (cur.pageIndex !== pageIndex) {
        continue
      }

      if (
        x >= cur.rect.leftTop[0] &&
        x <= cur.rect.rightTop[0] &&
        y >= cur.rect.leftTop[1] &&
        y <= cur.rect.leftBottom[1]
      ) {
        // 如果是当前元素的前半部分则点击元素为前一个元素
        if (x < cur.rect.leftTop[0] + cur.info.width / 2) {
          return i - 1
        }
        return i
      }
    }
    // 是否点击在某一行
    let index = -1
    for (let i = 0; i < this.positionList.length; i++) {
      let cur = this.positionList[i]
      if (cur.pageIndex !== pageIndex) {
        continue
      }
      if (y >= cur.rect.leftTop[1] && y <= cur.rect.leftBottom[1]) {
        index = i
      }
    }
    if (index !== -1) {
      return index
    }

    // 返回当前页的最后一个元素
    for (let i = 0; i < this.positionList.length; i++) {
      let cur = this.positionList[i]
      if (cur.pageIndex !== pageIndex) {
        continue
      }
      index = i
    }
    return index
  }

  /** 获取光标信息 */
  private getCursorInfo(positionIndex: number) {
    const position = this.positionList[positionIndex]
    const { fontSize } = this.options
    // 光标高度在字号的基础上再高一点
    const height = position?.size || fontSize
    const plusHeight = height / 2
    const actHeight = height + plusHeight

    if (!position) {
      /** 当前光标位置处没有元素 */
      const next = this.posi
    }

    // 元素所在行
    const row = this.rows[position.rowIndex]
    const y =
      position.rect.rightTop[1]
      + row.height
      - (row.height - row.originHeight) / 2
      - actHeight
      + (actHeight - Math.max(height, position.info.height)) / 2

    return {
      x: position.rect.rightTop[0],
      y,
      height: actHeight
    }
  }

  /** 渲染光标 */
  private setCursor(left: number, top: number, height: number) {
    if (!this.cursorEl) {
      this.cursorEl = document.createElement('div')
      this.cursorEl.style.position = 'absolute'
      this.cursorEl.style.width = '1px'
      this.cursorEl.style.backgroundColor = '#000'
      this.container.appendChild(this.cursorEl)
    }

    this.cursorEl.style.left = `${left}px`
    this.cursorEl.style.top = `${top}px`
    this.cursorEl.style.height = `${height}px`
  }

  /**
   * 将相对于页面 canvas 的坐标转换成相对于容器元素的
   */
  private canvasToContainer(x: number, y: number, canvas: HTMLCanvasElement) {
    return {
      x: x + canvas.offsetLeft,
      y: y + canvas.offsetTop,
    }
  }

  /**
   * 将相对于浏览器窗口的坐标转换成相对于页面 canvas
   */
  private windowToCanvas(e: MouseEvent, canvas: HTMLCanvasElement) {
    const { left, top } = canvas.getBoundingClientRect()
    return {
      x: e.clientX - left,
      y: e.clientY - top,
    }
  }

  /**
   * 绘制页面四个直角指示器
   */
  private renderPagePaddingIndicators(pageNo: number) {
    let ctx = this.pageCanvasCtxList[pageNo]
    if (!ctx) {
      return
    }
    drwaPagePaddingIndicators(ctx, this.options)
  }

  /**
   * 获取文档的高度和宽度
   */
  private getPageConfig = () => {
    const { pageWidth, pageHeight, pagePadding } = this.options
    const contentWidth = pageWidth - pagePadding[1] - pagePadding[3]
    const contentHeight = pageHeight - pagePadding[0] - pagePadding[2]

    return {
      contentWidth,
      contentHeight,
    }
  }

  /**
   * 计算行渲染的数据
   * 1. 创建一个临时的 canvas 来测量文本字符的宽高
   * 2. 遍历所有数据，如果当前行已满，或者遇到换行符，则新创建一行
   * 3. 行高由这一行中最高的文的高度和行高倍数相乘得到。
   */
  private computeRows() {
    const { lineHeight } = this.options
    // 实际内容可用宽度
    const { contentWidth } = this.getPageConfig()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    // 行数据
    const rows: any[] = []
    rows.push({
      width: 0,
      height: 0,       // 行的最大高度
      descent: 0,      // 行内元素最大的descent
      originHeight: 0, // 应用行高度的原始高度
      elementList: []
    })

    this.data.forEach((item) => {
      const { value, lineheight } = item
      const actLineHeight = lineheight || lineHeight
      // 获取文本宽高
      const fontConfig = getFontConfig(item, this.options)
      ctx.font = fontConfig
      const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(value)
      // 尺寸信息
      const info = {
        width,
        height: actualBoundingBoxAscent + actualBoundingBoxDescent,
        ascent: actualBoundingBoxAscent,
        descent: actualBoundingBoxDescent,
      }
      const element = {
        ...item,
        info,
        font: fontConfig,
      }
      // 判断当前行是否能容纳
      let curRow = rows[rows.length - 1]
      if (curRow.width + info.width <= contentWidth && value !== '\n') {
        curRow.elementList.push(element)
        curRow.width += info.width
        /** 保存当前行实际最高的文本高度 */
        curRow.height = Math.max(curRow.height, info.height * actLineHeight)
        /** 保存当前行原始最高的文本高度 */
        curRow.originHeight = Math.max(curRow.originHeight, info.height)
        curRow.descent = Math.max(curRow.descent, info.descent)
      } else {
        rows.push({
          width: info.width,
          height: info.height * actLineHeight,
          originHeight: info.height,
          descent: info.descent,
          elementList: [element],
        })
      }
    })
    this.rows = rows
  }

  clear() {
    const { pageWidth, pageHeight } = this.options
    this.pageCanvasCtxList.forEach(item => {
      item.clearRect(0, 0, pageWidth, pageHeight)
    })
  }

  /**
   * 卸载
   */
  public unmount() {
    this.pageCanvasList.forEach((item) => {
      item.remove()
    })
    this.pageCanvasCtxList = []
  }
}

export default Editor