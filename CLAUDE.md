# 打卡日历（原：跳舞打卡日历）

一个可自定义的打卡日历 PWA（静态 HTML/CSS/JS，无构建步骤）。最初是给 mumuxi 记录跳舞打卡（Jazz/Hip-Hop/全能/游泳）用的，后来做成了通用打卡工具——标题、打卡类型（名称+颜色）都可以点击编辑/增删，方便朋友们改造成骑车、健身、学习等其他打卡场景。

## 仓库 & 部署

- **GitHub 仓库**：https://github.com/mumuxi777/dance-checkin-calendar （public）
- **本地工作目录**：就是这个文件夹（已从 `Documents\dance-checkin-calendar` 搬到这里）
- **线上地址**：https://mumuxi777.github.io/dance-checkin-calendar/ （GitHub Pages，从 `master` 分支根目录部署，每次 push 自动重新构建）
- 协作者 CLOSUR1 已于 2026-07-17 被设为 admin

## 架构

- 单文件 `index.html`，无框架无构建。打卡类型是用户自定义的（`localStorage.danceCheckinCategories` 里的 id/label/color 数组），不是写死的，通过弹出编辑器增删改。
- 标题/副标题（kicker）支持点击编辑（`makeEditableText`）。
- 六套配色皮肤，通过 `<html data-skin="...">` 切换，入口是卡片右上角一个不起眼的小图标（`.theme-fab`），点击弹出菜单（`.theme-menu`）——模仿微信"···"弹出点赞评论那种交互，**不要**做成常驻显示的一排选项。
- `.theme-fab` 定位是 `position: absolute; top: -6px; right: 4px;`，锚定在 `.app` 上（不是 `.card`），故意浮在卡片右上角外面、贴近顶部大标题——这个位置是反复对比用户截图确认过的，**不要改成角落跨界的负偏移位置**，之前明确被否决过。
- 打卡格子颜色用 `color-mix()` 基于用户选的类别颜色和 `--surface` 派生，所以自定义颜色能自动适配任意皮肤，不用每套皮肤单独写。
- 数据全部存在 `localStorage`（不跨设备同步），换设备/清缓存会丢失打卡记录。

## 已知坑（踩过的坑，改代码前务必看）

1. **Service Worker 只做安装资格，不做缓存**：`sw.js` 现在是"极简直通版"——每个请求都直接转发给网络，不缓存任何东西。之前的缓存版本（network-first 但没传 `{cache:'no-store'}`）会导致浏览器悄悄用陈旧 HTTP 缓存响应 fetch，改了代码用户刷新也看不到效果，排查了很久。Chrome/Android 要求有一个带 fetch handler 的 active SW 才会弹"添加到主屏幕"，所以 SW 不能删掉，但**不要重新加缓存逻辑**，除非确实需要，且一定要用 `{cache:'no-store'}`。
2. **Claude Artifact 预览是沙盒 iframe，会静默拦截 `confirm()`/`alert()`/`prompt()`**：不会报错，只是啥都不做，非常难排查。所以代码里所有确认/提示都用自定义的 `customConfirm()` / `showToast()`，不要用原生弹窗。
3. **CSS containing-block 陷阱**：任何非 `none` 的 `transform`（哪怕是 `translateZ(0)`）都会像 `position:relative` 一样给绝对定位的子元素创建新的包含块。之前给 `.card`/`.day-cell` 加了 `translateZ(0)` 想解决一个移动端撕裂问题，结果把 `.theme-fab` 的定位搞错位了，查了很久才发现。现在这两个元素上都没有 `transform`，改动时留意别加回去。
4. **Grid 溢出**：`<button>` 在 grid 里默认 `min-width:auto`，内容不会收缩，窄屏会溢出。修复方式是 `.grid`/`.weekdays` 用 `grid-template-columns: repeat(7, minmax(0,1fr))`，格子加 `min-width:0`。

## 工作流约定

- **每改完一个功能/修一个 bug，立刻 commit + push**，不要攒着一起提交——这样出问题能随时回退。这是 mumuxi 明确要求过的。
- 如果需要快速视觉预览可以先做成 Claude Artifact 迭代，但最终一定要同步回这个仓库的 `index.html` 并 push。
