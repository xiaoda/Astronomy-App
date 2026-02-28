# starfield

## 职责
- 负责星空画布的渲染与生命周期管理。
- 负责星点数量、闪烁、漂移、性能分层等纯渲染逻辑。

## 当前入口
- `index.ts`
- `StarfieldCanvas.tsx`
- `starfieldEngine.ts`
- `StarfieldCanvas.css`

## 协作边界
- 可以修改：星空绘制算法、性能策略、画布样式。
- 尽量不要修改：`src/app/App.tsx`、欢迎文案、设置面板、音乐逻辑。
- 如果需要新增开关项，先在本模块完成能力，再由设置模块接线。
