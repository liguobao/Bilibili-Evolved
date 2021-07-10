import { styledComponentEntry } from '@/components/styled-component'
import { ComponentEntry, ComponentMetadata } from '@/components/types'
import { cheeseUrls, mediaListUrls, videoAndBangumiUrls } from '@/core/utils/urls'
import { addComponentListener } from '@/core/settings'
import { actions } from './actions'
import { KeyBinding, KeyBindingConfig, loadKeyBindings } from './bindings'
import { presetBase, presets } from './presets'

let config: KeyBindingConfig = null
const parseBindings = (bindings: Record<string, string>) => (
  Object.entries(bindings).map(([actionName, keyString]) => {
    const keys = keyString.split(' ').filter(it => it !== '')
    return {
      keys,
      action: actions[actionName] || none,
    } as KeyBinding
  })
)
const entry: ComponentEntry = styledComponentEntry(() => import('./playback-tip.scss'), async ({ settings }) => {
  const update = () => {
    const presetName = settings.options.preset
    const preset = presets[presetName] || {}
    const bindings = parseBindings(
      { ...presetBase, ...preset, ...settings.options.customKeyBindings },
    )
    console.log('update keymap', bindings, presetBase, preset, settings.options.customKeyBindings)
    if (config) {
      config.bindings = bindings
    } else {
      config = loadKeyBindings(bindings)
    }
  }

  addComponentListener('keymap.preset', update, true)
  addComponentListener('keymap.customKeyBindings', update)
  // createProxy(actions, () => update())
  // createProxy(presets, () => update())
  // createProxy(presetBase, () => update())
})
export const component: ComponentMetadata = {
  name: 'keymap',
  displayName: '快捷键扩展',
  tags: [
    componentsTags.video,
    componentsTags.utils,
  ],
  urlInclude: [
    ...videoAndBangumiUrls,
    ...cheeseUrls,
    ...mediaListUrls,
  ],
  entry,
  unload: () => { config && (config.enable = false) },
  reload: () => { config && (config.enable = true) },
  enabledByDefault: true,
  description: {
    'zh-CN': '为视频播放器启用更多的快捷键, 快捷键列表可在`快捷键设置`中查看和配置.',
  },
  extraOptions: () => import('./settings/ExtraOptions.vue').then(m => m.default),
  options: {
    longJumpSeconds: {
      defaultValue: 85,
      displayName: '长跳跃秒数',
    },
    customKeyBindings: {
      defaultValue: {},
      displayName: '自定义键位',
      hidden: true,
    },
    preset: {
      defaultValue: 'Default',
      displayName: '预设',
      hidden: true,
    },
  },
}