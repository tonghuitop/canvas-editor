type SinglePageConfigType = {
  /** 页面宽度 */
  pageWidth: number
  /** 页面高度 */
  pageHeight: number
  /** 页面内边距 */
  pagePadding: [number, number, number, number]
  /** 纸张内边距指示器的大小，也就是四个直角的边长 */
  pagePaddingIndicatorSize: number
  /** 纸张内边距指示器的颜色，也就是四个直角的边颜色 */
  pagePaddingIndicatorColor: string
}

type FontConfig = {
  color: string
  fontSize: number
  fontFamily: string
  lineHeight: number
}

type DataItem = {
  italic?: boolean
  bold?: boolean
  size?: number
  fontFamily?: string
  lineheight?: number
  value: string
}

type EditorPageOptions = Partial<SinglePageConfigType> & Partial<FontConfig> & {
  /** 页面之间的间隔 */
  pageMargin?: number
}

type Point = [number, number]