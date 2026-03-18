# features 总览

## 当前定位
- `features/` 现在只承载尚未迁移的功能模块。
- 它们大多仍被 `HomeScene` 使用，但不再由 `src/app/App.tsx` 直接组装。
- 后续如果确认某个模块只服务单一场景，应优先继续收拢到对应 `scenes/<scene>/` 目录。

## 现阶段模块
- `starfield`: 当前首页场景使用的星空画布渲染。
- `meteor`: 当前首页场景使用的流星效果与手势逻辑。
- `quotes`: 当前首页场景使用的文案池与轮播。
- `settings`: 当前首页场景使用的设置面板。
- `music`: 当前首页场景使用的背景音乐能力。
- `welcome`: 当前首页场景使用的欢迎区展示。

## 依赖原则
- 允许：`app -> pages/scenes`
- 允许：`scenes -> features`
- 允许：模块内部文件互相依赖
- 尽量避免：`feature A -> feature B`
- 尽量避免：新增场景继续把私有逻辑放进 `features/`

## 后续迁移建议
- 新增沉浸式场景时，优先直接落到 `src/scenes/<scene>/`
- 只有明确会跨多个场景复用的能力，才继续保留在 `features/`
- 如果一个模块既有业务状态又有展示样式，并且只属于单一场景，不要再放进 `app/`
