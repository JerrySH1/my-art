# 3D Digital Media Art Portfolio

> ✨ 这是一个极具视觉冲击力的 3D 交互式个人作品集展示网站。本项目由 **Google Gemini AI** 协助架构与开发，专为数字媒体艺术、交互设计及创意开发者量身定制。

## 🛠 技术栈与底层架构

本项目采用前沿的现代 Web 3D 技术与高度解耦的“数据驱动”架构构建：

- **核心框架**：[React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **3D 渲染引擎**：[Three.js](https://threejs.org/) + [React Three Fiber (R3F)](https://docs.pmnd.rs/react-three-fiber) + [Drei](https://github.com/pmndrs/drei)
- **流畅动画**：[GSAP](https://gsap.com/) (提供物理级平滑过渡及 3D 空间爆炸散落特效)
- **UI 样式**：[TailwindCSS](https://tailwindcss.com/) (实现极简毛玻璃质感与霓虹光效)
- **状态管理**：[Zustand](https://github.com/pmndrs/zustand)
- **架构设计 (Data-Driven)**：代码与内容完全分离。网站所有的文本、图片、视频全权由 `public/data.json` 接管。您只需修改 JSON 数据，UI 引擎会自动计算空间坐标、自动处理路径映射（完美兼容 GitHub Pages 子目录），并无限向下渲染复杂的图文多媒体混合详情页。

---

## 📝 内容编辑指南 (完全免代码)

您不需要懂得任何 React 或编程知识。只需要打开项目目录下的 `public/data.json` 文件即可开始编辑。所有的图片和视频请统一存放在 `public/images/` 或 `public/videos/` 文件夹下。

### 1. 修改左上角的“个人简历与简介”
在 `data.json` 顶部的 `personalInfo` 字段中：
```json
"personalInfo": {
  "name": "韦舒媛",                  // 您的名字
  "title": "Media Artist",           // 头衔
  "school": "四川美术学院",           // 学校
  "major": "数字媒体艺术专业 / 大三", // 专业与年级
  "bio": "您的个人宣言或座右铭写在这里", // 简短的自我介绍
  "schoolEn": "Sichuan Fine Arts Institute", // 底部英文
  "avatar": "/images/my-avatar.jpg"  // 头像文件路径！放在 public/images 文件夹下
}
```

### 2. 修改 3D 卡片与作品基本信息
在 `projects` 数组中，每一个 `{}` 代表一张悬浮的卡片。
```json
{
  "id": "1",
  "title": "作品的大标题",
  "subtitle": "副标题或时间",
  "thumbnail": "/images/cover1.jpg", // ⚠️ 3D 玻璃卡片表面显示的封面图！
  "role": "交互设计师",              // 您的主要角色
  "techStack": "R3F / GLSL"          // 使用的技术栈
}
```

### 3. 编辑详情页 (无限插入文字、图片、视频)
在每个项目的 `details` 数组里，您可以随意组合多媒体模块，系统会自动在右侧面板按照从上到下的顺序滚动排版。支持三种 `type`：

**插入文本 (`text`)：**
```json
{
  "type": "text",
  "content": "这里是您的作品描述。支持长篇大论，面板会自动适应出现滚动条。"
}
```

**插入图片 (`image`)：**
```json
{
  "type": "image",
  "url": "/images/detail-1.jpg", 
  "caption": "这是图片的说明文字（可选，不需要可以删掉该行）"
}
```

**插入自动播放视频 (`video`)：**
```json
{
  "type": "video",
  "url": "/videos/demo.mp4", 
  "caption": "实机演示视频"
}
```

---

## 💻 本地运行与开发

如果您想在自己的电脑上预览修改效果：

1. 确保电脑已安装 [Node.js](https://nodejs.org/)。
2. 在终端（Terminal）进入项目根目录。
3. 安装依赖：
   ```bash
   npm install
   ```
4. 启动本地开发服务器：
   ```bash
   npm run dev
   ```
5. 打开浏览器访问终端里显示的地址（通常是 `http://localhost:5175`）。修改 `data.json` 保存后，刷新网页即可实时看到变化。

---

## 🚀 部署到 GitHub Pages (全自动化)

本项目已完美配置了 **GitHub Actions**。当您把代码推送到 GitHub 时，服务器会自动执行构建并将网站发布到互联网，过程全自动。

### 第一步：修改仓库名称配置 (非常重要)
在发布前，请打开项目根目录的 `vite.config.js` 文件，找到 `base` 字段：
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/您的GitHub仓库名/', // 例如：如果您仓库叫 my-art，这里就填 '/my-art/'
})
```

### 第二步：推送代码到 GitHub
在终端执行以下命令将代码上传到您的仓库：
```bash
git remote add origin https://github.com/您的用户名/您的仓库名.git
git branch -M main
git push -u origin main
```
*(注意：本地代码修改保存后，需要先 `git add .` 和 `git commit -m "update"` 才能 push)*

### 第三步：在网页端开启自动部署
1. 登录 GitHub，进入您的仓库页面。
2. 点击上方的 **Settings**（设置）。
3. 确保您的仓库是公开的（在 Settings -> General 最底部的 Danger Zone，确认 Visibility 为 **Public**）。
4. 在左侧菜单栏点击 **Pages**。
5. 在 `Build and deployment` 的 `Source` 下拉菜单中，选择 **GitHub Actions**。
6. 一切就绪！现在您可以点击页面顶部的 **Actions** 标签，您会看到一个名为 `Deploy to GitHub Pages` 的任务正在运行。等待它显示绿色打钩后，您的作品集就已经成功上线！

您的专属网址将是：`https://<您的用户名>.github.io/<您的仓库名>/`
