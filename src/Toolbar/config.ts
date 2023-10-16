type ConfigItem<T> = {
  label: string;
  value: T;
}

function defineConfigs<T extends string>(configs: Array<ConfigItem<T>>) {
  return configs;
}

export const fontFamilyList = defineConfigs([
  {
    label: '微软雅黑',
    value: 'Yahei'
  },
  {
    label: '宋体',
    value: '宋体'
  },
  {
    label: '黑体',
    value: '黑体'
  },
  {
    label: '仿宋',
    value: '仿宋'
  },
  {
    label: '楷体',
    value: '楷体'
  },
  {
    label: '华文琥珀',
    value: '华文琥珀'
  },
  {
    label: '华文楷体',
    value: '华文楷体'
  },
  {
    label: '华文隶书',
    value: '华文隶书'
  },
  {
    label: '华文新魏',
    value: '华文新魏'
  },
  {
    label: '华文行楷',
    value: '华文行楷'
  },
  {
    label: '华文中宋',
    value: '华文中宋'
  },
  {
    label: '华文彩云',
    value: '华文彩云'
  },
  {
    label: 'Arial',
    value: 'Arial'
  },
  {
    label: 'Segoe UI',
    value: 'Segoe UI'
  },
  {
    label: 'Ink Free',
    value: 'Ink Free'
  },
  {
    label: 'Fantasy',
    value: 'Fantasy'
  }
])

export type FontFamilyType = typeof fontFamilyList[number]['value']