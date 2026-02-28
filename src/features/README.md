# features 总览

## 目标
- `features/` 用来承载按功能拆分的业务模块。
- 每个模块尽量自包含：组件、样式、hook、数据、模块说明放在同一目录。
- `src/app/App.tsx` 只负责组装，不承载具体功能细节。

## 当前模块
- `starfield`: 星空画布渲染与性能控制。
- `meteor`: 手势识别与流星效果。
- `quotes`: 文案池与文案轮播策略。
- `settings`: 设置面板与用户开关。
- `music`: 背景音乐播放与曲目切换。
- `welcome`: 首页欢迎区展示。

## 依赖原则
- 允许：`app -> features`
- 允许：`settings -> 外部传入的状态与回调`
- 允许：模块内部文件互相依赖
- 尽量避免：`feature A -> feature B`
- 禁止优先级最高的坏味道：多个 feature 互相交叉引用，最后只能同时修改多个目录才能完成一个小改动

## 推荐边界
- `starfield` 应保持纯渲染模块，不依赖 `music`、`quotes`、`welcome`、`settings`
- `meteor` 应只暴露流星状态和手势能力，不直接控制欢迎区展示
- `quotes` 应只提供文案数据和切换逻辑，不负责 UI
- `music` 应只提供播放能力和曲目数据，不负责 UI
- `welcome` 只负责展示，不直接决定文案切换策略
- `settings` 只负责开关展示与交互，不直接实现业务细节

## 当前实际依赖关系
- `app -> starfield`
- `app -> meteor`
- `app -> quotes`
- `app -> settings`
- `app -> music`
- `app -> welcome`
- `meteor -> meteor`
- `quotes -> quotes`
- `music -> music`
- `starfield -> starfield`
- `settings -> settings`
- `welcome -> welcome`

## 当前组装方式
- `App.tsx` 从各模块入口导入能力：
  - `meteor`: `MeteorTrail`、`useMeteorGestures`
  - `quotes`: `useQuoteRotation`
  - `music`: `useBackgroundMusic`
  - `settings`: `SettingsPanel`
  - `starfield`: `StarfieldCanvas`
  - `welcome`: `WelcomePanel`

## 多代理协作建议
- 改渲染性能：只进 `starfield/`
- 改手势或流星：只进 `meteor/`
- 改文案数据或轮播：只进 `quotes/`
- 改音乐播放：只进 `music/`
- 改设置项 UI：只进 `settings/`
- 改首屏排版和提示语：只进 `welcome/`
- 只有在新增模块接线时，才需要改 `src/app/App.tsx`

## 新增功能时的落点建议
- 新功能如果有独立状态、独立展示、独立交互，优先新建一个 feature 目录
- 新功能如果只是多个模块共享的小工具，再考虑放进 `src/shared/`
- 如果一个功能既有业务状态又有展示样式，不要拆到 `app/`，优先留在自己的 feature 目录
