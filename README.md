# Digital Media Art Portfolio - 内容编辑指南

欢迎使用您的 3D 交互作品集！本网站已经进行了**完全的数据驱动改造**。这意味着您不需要懂得任何 React 或编程知识，只需修改一个简单的文本文件 (`data.json`) 即可完全自定义网站里的**所有内容**，包括：您的个人简介、卡片封面图片、以及点击卡片后右侧的详情页面（支持图文混排和视频播放）。

## 核心编辑文件：`public/data.json`
所有的文本和图片配置都保存在项目根目录下的 `public/data.json` 文件中。您可以使用任何文本编辑器（如 VSCode 或记事本）打开它。

---

### 一、 如何编辑首页的“个人简介”（左上角）
在 `data.json` 的最上方，您会看到 `personalInfo` 字段。您可以随意修改双引号里面的文字：

```json
"personalInfo": {
  "name": "韦舒媛",                  // 您的名字
  "title": "Media Artist",           // 头衔
  "school": "四川美术学院",           // 学校
  "major": "数字媒体艺术专业 / 大三", // 专业与年级
  "bio": "您的个人宣言或座右铭写在这里", // 一段简短的自我介绍
  "schoolEn": "Sichuan Fine Arts Institute", // 学校英文名
  "avatar": "/images/my-avatar.jpg"  // 您的个人头像图片路径！
}
```

**💡 关于头像 (`avatar`) 的说明：**
默认如果留空 `""`，系统会显示一个默认的白色人像图标。
如果您想使用自己的照片，请：
1. 将您的照片（例如 `my-avatar.jpg`）复制到项目里的 `public/images/` 文件夹中（如果没有 `images` 文件夹可以自己新建一个）。
2. 将 `avatar` 字段的值改为 `"/images/my-avatar.jpg"`。

---

### 二、 如何编辑 3D 卡片封面及右侧作品详情
在 `data.json` 的 `projects` 数组中，包含了 6 个作品卡片的数据。每一个花括号 `{}` 代表一个卡片。

#### 1. 修改卡片封面与基本信息
```json
{
  "id": "1",
  "title": "作品的大标题",
  "subtitle": "作品副标题或时间",
  "thumbnail": "/images/cover1.jpg", // ⚠️ 这就是 3D 卡片表面显示的那张图！
  "role": "交互设计师",              // 您的主要负责角色
  "techStack": "R3F / GLSL"          // 使用的技术栈
}
```
**如何替换封面图 (`thumbnail`)：** 同样地，把您的封面图片放到 `public/images/` 里，然后把路径写成 `"/images/你的封面图名字.jpg"`。您也可以直接粘贴一个网络图片的 URL 地址（比如 `https://...`）。

#### 2. 在详情页实现“无限图文、视频混排”
每个项目里面都有一个 `details` 数组。当您在网站上点击这个卡片时，右侧划出的区域就是根据这个数组**从上往下**渲染出来的。

您可以在 `details` 数组里插入无数个模块，目前支持三种类型（`text`，`image`，`video`）：

**插入一段纯文本：**
```json
{
  "type": "text",
  "content": "这里写您的项目详细介绍，长篇大论都可以写在这里。"
}
```

**插入一张详情图：**
```json
{
  "type": "image",
  "url": "/images/detail-1.jpg", 
  "caption": "这是图片的说明文字（可选，不需要可以不填）"
}
```

**插入一个自动播放的视频：**
```json
{
  "type": "video",
  "url": "/videos/demo.mp4", 
  "caption": "交互效果演示视频"
}
```

#### 完整的 `details` 示例组合
```json
"details": [
  {
    "type": "text",
    "content": "这是该项目的第一段介绍文本。"
  },
  {
    "type": "image",
    "url": "/images/sketch.png",
    "caption": "项目初期的草图"
  },
  {
    "type": "text",
    "content": "根据草图，我们进行了三维建模..."
  },
  {
    "type": "video",
    "url": "/videos/final-render.mp4",
    "caption": "最终渲染的动态视频"
  }
]
```

---

## 📸 素材存放终极规则
为了让网页能正确读取到您的图片和视频，请**务必**将它们放在 `public` 文件夹的内部：
- 推荐在 `public` 里新建 `images` 文件夹存放图片。
- 推荐在 `public` 里新建 `videos` 文件夹存放视频。
- 在 `data.json` 中引用它们时，**必须以斜杠 `/` 开头**。例如：`/images/pic.png`（不需要写 public，因为网站运行后 public 文件夹就是根目录）。

## 🚀 本地预览修改
当您修改完 `data.json` 保存后：
- 在运行着 `npm run dev` 的终端不需要重启。
- 只需要在浏览器中**刷新网页**，您刚刚修改的图片、文字和视频就会立即生效显示出来！
