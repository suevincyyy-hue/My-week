# River · Sunday Integration 0.23

## 结论

正式版以 V0.22 的 `index.html` 为母版重新整合，而不是继续扩充已发生回归的 0.23 候选版。原版能力与本周新增能力现在共用同一份任务数据，并继续使用原来的 `myweek_v02_state` 存储键。

可直接读取并核对的基线包括：V0.22 `index.html`、原版 `manifest.webmanifest`、Week Day Navigator 最终底稿。原版 `service-worker.js` 与先前生成的 `river_weekly_build_0_23/index.html` 没有作为独立文件出现在当前工作区，因此无法做逐字节差异比较；相关回归依据来自原版注册路径、Manifest 内容、可访问的 Demo 代码以及原对话中的检查记录。本版重新生成了同名 `service-worker.js`，保留原图标路径与 PWA 范围。

## 候选版发现的遗落 / 退化

| 项目 | 候选版问题 | 正式版处理 |
|---|---|---|
| 下拉整周安排 | 被七天日期导航替代，整周鸟瞰消失 | 两者共存：日期按钮负责浏览，向下拉 / 点标题负责展开整周 |
| 每日短句 | 三页退化为固定文案 | 恢复 Today / Want / Future 三套句库与日期哈希；当天稳定、次日变化 |
| 三页横滑 | 从 300% pager 退化为 hide/show | 恢复完整 300% pager 与整页平移动画 |
| Weekly Harvest | 完成数据仍在，但入口、色阶和按日记录缺失 | 恢复入口、完成历史、日期分组与十级离散色阶 |
| PWA Manifest | 图标、maskable、portrait、scope 等配置被简化 | 原 Manifest 原样保留 |
| Service worker | 文件名从 `service-worker.js` 改成 `sw.js`，缓存范围退化 | 恢复 `service-worker.js`；缓存页面、脚本、Manifest 与原图标路径 |
| 本地数据 | 存储键被改动，升级后可能表现为任务“消失” | 继续使用 `myweek_v02_state`，并一次性兼容导入已知 Demo 键 |
| Future 示例事项 | 原版是静态 UI，无法参与改期和跨视图联动 | 首次升级时迁入统一 task 数据，之后与其他任务行为一致 |

## 正式版功能清单

### 原版功能

- [x] 下拉 / 点击展开整周安排，上滑收起
- [x] Today / Want / Future 每日短句按日期变化，当天刷新保持不变
- [x] Want ↔ Today ↔ Future 三页整屏横滑与页码联动
- [x] Weekly Harvest 入口、完成数量、按日期记录
- [x] 分类色十级离散累积色阶
- [x] 原 `myweek_v02_state` 任务与完成记录保留
- [x] 原 Manifest 的 192、512、maskable 图标、portrait、scope、standalone 保留
- [x] `service-worker.js` 注册路径与离线核心缓存恢复

### 本周新增功能

- [x] Today 与日期视图任务左滑：删除 / 改期 / 修改
- [x] Future 任务也可左滑操作
- [x] 长按任务上下拖拽排序；顺序持久化
- [x] 键盘 Alt + ↑ / ↓ 排序作为无障碍后备
- [x] 新增事项可选择 Today / Future / Want
- [x] Future 可打开日历选择具体日期，并按日期、同日顺序排序
- [x] Guided Task Refinement：识别宽泛任务、本地追问、生成可执行表述、保留原样
- [x] Week Day Navigator：点击本周任意日期只切换浏览日，不会改期
- [x] 粉色日期块作为单一 slider 在七天之间移动；真实今天在未选中时保留描边
- [x] Today 自动任务：按星期模板生成，过去日期不补生成，删除 / 改期后不重复出现
- [x] 完成任务不会丢失，而是进入 completed 与 Weekly Harvest
- [x] 任务日期为唯一真相来源；新增、改期、Future、日期视图和完成记录同步

## 数据兼容策略

1. 主存储键始终为 `myweek_v02_state`。
2. 首次升级时兼容读取 `river_task_actions_bugfix`、`river_weekly_build_0_23`、`river_weekly_023_state`、`river_weekly_v023_state`。
3. 合并时按 ID 与“标题 + 日期 + 完成时间”去重。
4. 完成记录补齐 `completedAt`、`weekKey` 与 `sourceDate`，旧 Harvest 数据继续可读。
5. 自动任务用 `generated[date]` 记录是否生成；用户删除或改期后不会被自动补回。

## 回归测试结果

- JavaScript 与 service worker 语法检查通过。
- HTML 共 67 个 ID，无重复；脚本引用的 115 个 ID 全部存在。
- 原 V0.22 浏览器数据直接升级后，三条既有 Today 任务仍在。
- Want → Today → Future 以及反向整页滑动通过。
- 整周展开、日期选择、粉色 slider 位移与“浏览不改期”通过。
- 新增未来事项默认明天通过；显式选择 9 月 2 日后 Future 日期与排序正确。
- Future 任务改回 Today 后，Future 立即消失、Today 同步出现。
- 左滑后删除 / 改期 / 修改三个操作区正确露出；修改后刷新仍保留。
- Guided Task Refinement 的识别、追问、建议生成和采用通过。
- 完成后从活动列表移除，Weekly Harvest 数量、分类色块和按日记录同步；刷新后仍保留。
- 排序写入后刷新仍保留。自动化环境无法可靠模拟 380ms 的真实手指长按，因此真实长按路径使用来自已验收拖拽 Demo 的同一套 ghost / placeholder / 最终落点逻辑，并另外通过键盘排序完整验证了顺序写回链路。
- Manifest 与 service worker 本地返回 200；MIME 类型分别为 `application/manifest+json` 与 `text/javascript`。

## GitHub Pages 更新方式

上传并覆盖仓库根目录中的：

- `index.html`
- `river-app.js`（新增文件）
- `manifest.webmanifest`
- `service-worker.js`

保留仓库现有的 `icons/` 目录和其中的 `icon-192.png`、`icon-512.png`、`icon-512-maskable.png`、`apple-touch-icon.png`。不要上传旧候选版的 `sw.js`；若仓库里已经存在候选版 `sw.js`，它不再被本版引用，可在确认线上升级成功后再清理。
