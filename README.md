<p align="center">
  <img src="src/assets/logo.png" alt="HelloFlow" width="120">
</p>

<h1 align="center">Hello Flow</h1>

<p align="center"><strong>软件研发项目管理工具 - WEB 端</strong></p>

<p align="center">
  <a href="https://github.com/dkbnull/hello-flow-web">
    <img src="https://img.shields.io/badge/GitHub-WEB 端-blue?logo=github">
  </a>
  <a href="https://gitee.com/dkbnull/hello-flow-web">
    <img src="https://img.shields.io/badge/Gitee-WEB 端-red?logo=gitee">
  </a>
  <a href="https://github.com/dkbnull/hello-flow-server">
    <img src="https://img.shields.io/badge/GitHub-服务端-blue?logo=github">
  </a>
  <a href="https://gitee.com/dkbnull/hello-flow-server">
    <img src="https://img.shields.io/badge/Gitee-服务端-red?logo=gitee">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3-42b883?logo=vue.js">
  <img src="https://img.shields.io/badge/Vite-8-646cff?logo=vite">
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue">
</p>

---

## 项目简介

Hello Flow 是一款面向软件研发团队的项目管理工具，支持需求管理、任务流转、缺陷跟踪、迭代管理，提供看板视图和统计报表。

本项目为 **Web 端**，提供交互页面。服务端项目请访问 [hello-flow-server](https://github.com/dkbnull/hello-flow-server)。

## 功能特性

### 工作台

一页纵览全局，快速掌握工作状态：

- **统计卡片**：待处理任务、待我评审、待测试、我的缺陷，点击直达对应列表
- **我的任务**：最近更新的分配给我的任务，显示任务 ID、标题、状态、所属项目
- **通知动态**：实时消息流，跟踪项目内操作动态
- **项目进度**：参与项目的完成率概览，进度条可视化

### 项目管理

以项目为核心组织研发工作：

- **项目列表**：卡片式展示，显示名称、状态、任务进度、项目经理、成员数、当前 Sprint
- **项目概览**：统计卡片 + 当前 Sprint 进度 + 任务状态分布图 + 最近活动
- **项目设置**：编辑基本信息、指定项目经理/开发主责/测试主责、归档/删除项目
- **成员管理**：添加/移除成员，按职位筛选，主责角色不可直接移除

### 任务管理

覆盖任务全生命周期的流转与跟踪：

- **多类型任务**：需求、完善、缺陷三种类型，自动生成任务编码（如 `HELLO-0001`）
- **状态流转**：未开始 → 进行中 → 待评审 → 待测试 → 已完成 → 已关闭，支持取消和重新打开
- **评审机制**：开发主责/开发工程师评审，评审不通过打回开发工程师
- **缺陷跟踪**：测试阶段提交缺陷自动创建子任务，指派开发工程师
- **延期标记**：标记延期任务并记录原因
- **多维筛选**：按状态、类型、优先级、处理人、Sprint、关键词筛选，支持快捷筛选（我的任务/我创建的/我处理的）
- **任务关联**：支持父子任务和关联任务（关联/依赖/重复）

### 看板视图

拖拽式任务流转，直观掌控项目进度：

- 按状态分列展示任务卡片，列头显示状态名称和数量
- 拖拽卡片到相邻状态列触发状态变更，自动校验流转规则和权限
- 顶部 Sprint 筛选，切换查看不同迭代
- 卡片按优先级从高到低排序

### 迭代管理

Sprint 驱动的迭代交付：

- **Sprint 列表**：卡片式展示，显示名称、状态、时间范围、目标、任务统计、进度条
- **状态管理**：计划中 → 进行中 → 已完成，一键开始/完成 Sprint
- **燃尽图**：理想线 vs 实际线，跟踪迭代进度

### 通知中心

实时感知项目动态，不错过关键信息：

- **消息分类**：任务分配、状态变更、评论/@我、缺陷关联、Sprint 通知
- **未读标记**：蓝色圆点标识未读消息，支持"全部标记已读"
- **顶栏预览**：铃铛 Badge 显示未读数，弹出最近 5 条通知
- **通知设置**：按类型自定义站内信/邮件通知开关

### 用户与权限

基于 RBAC + 职位的精细化权限控制：

- **系统角色**：管理员（系统管理）、普通用户（参与项目）
- **全局职位**：项目经理（PM）、开发工程师（DEV）、测试工程师（QA），一人一职
- **项目主责**：每个项目设开发主责和测试主责，待测试任务自动指派测试主责
- **路由守卫**：未登录跳转登录页，非管理员禁止访问管理后台

### 管理后台

管理员专属的系统管理功能：

- **用户管理**：创建/编辑/启用/禁用用户，分配角色和职位
- **项目管理**：全局项目管理，创建/编辑/归档/删除
- **字典管理**：管理任务类型、优先级、状态等枚举数据

### 个人设置

- **个人信息**：修改头像、昵称、邮箱、手机号
- **通知偏好**：按通知类型配置站内信和邮件开关

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 构建 | Vite |
| 状态管理 | Pinia |
| 路由 | Vue Router |
| UI 组件库 | Element Plus |
| 图表 | ECharts |
| HTTP 客户端 | Axios |
| 认证 | JWT Token |

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装

```bash
npm install
```

### 运行

```bash
npm run dev
```

启动后访问 `http://localhost:5173`，开发服务器自动将 `/api` 请求代理至 `http://localhost:8080`。

### 构建

```bash
npm run build
```

### 预览构建产物

```bash
npm run preview
```

## 用户与角色

### 系统角色（RBAC）

| 角色 | 编码 | 说明 |
|------|------|------|
| 管理员 | ADMIN | 系统级管理，不参与项目内任务流转 |
| 普通用户 | USER | 参与项目的用户，权限由职位决定 |

### 职位

| 职位 | 编码 | 职责 |
|------|------|------|
| 项目经理 | PM | 统筹项目、管理需求、分配任务、评审 |
| 开发工程师 | DEV | 执行开发任务、提交评审、可担任开发主责 |
| 测试工程师 | QA | 测试任务、提交缺陷、可担任测试主责 |

## 开发说明

### API 代理

开发环境下，Vite 将 `/api` 前缀的请求代理至后端服务 `http://localhost:8080`，配置见 [vite.config.js](vite.config.js)。

### 路由守卫

- 未登录用户访问需认证页面 → 跳转登录页
- 已登录用户访问登录页 → 跳转工作台
- 非管理员访问管理后台 → 跳转工作台

## 许可证

[Apache License 2.0](LICENSE)
