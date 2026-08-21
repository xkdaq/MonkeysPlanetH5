# 项目长期约定（MonkeysPlanetH5）

## 构建与数据维护
- 数据是静态 JSON 时，**只改 `public/` 下的源文件**（如 `public/data/donations.json`）。`dist/` 是 vite 构建产物，每次 build 会被 public 覆盖，**不要手动改 dist/**，否则一构建就丢失。
- 赞赏名单（感谢墙）走静态 JSON 方案；数据多到难维护时，把 `src/api/donations.js` 的 fetchDonations 改成后端接口即可，组件不用动。
- 抽题大转盘数据走 MySQL 独立表 `t_wheel_bank` / `t_wheel_question`，通过 `/h5/wheel/*` 接口读取，与刷题 `exam_*` 表完全隔离。后续改题/扩题库直接改库，不改动 HTML。
