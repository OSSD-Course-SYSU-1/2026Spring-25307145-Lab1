pdfkit_-sample-code-_arkts-master/
├── .hvigor/                     # 构建工具hvigor的配置缓存目录
├── .idea/                       # IDE（DevEco Studio）配置目录
├── AppScope/                    # 应用作用域目录（全局配置）
│   ├── resources/               # 应用级资源文件根目录
│   └── app.json5                # 应用的全局配置文件（包名、版本、签名等）
├── entry/                       # 应用的工程入口模块
│   ├── build/                   # 编译输出目录（存放编译产物）
│   ├── src/
│   │   └── main/
│   │       ├── ets/             # 入口模块的ArkTS代码根目录
│   │       │   └── (业务逻辑代码) # 页面、Ability、工具类等源码文件
│   │       ├── resources/       # 模块级资源文件根目录
│   │       │   ├── base/        # 基础资源目录
│   │       │   │   ├── element/ # 元素资源目录（字符串、颜色、尺寸等）
│   │       │   │   └── media/   # 媒体资源目录（图片、音视频等）
│   │       │   └── profile/     # 模块的配置目录（页面路由、备份配置等）
│   │       └── module.json5     # 模块的配置文件（声明模块信息、设备支持、组件权限等）
│   ├── .gitignore               # Git忽略配置文件
│   ├── build-profile.json5      # 模块级构建配置文件
│   ├── hvigorfile.ts            # 模块级hvigor构建脚本
│   ├── obfuscation-rules.txt    # 代码混淆规则文件
│   └── oh-package.json5         # 模块级依赖配置文件（声明依赖包）
├── hvigor/                      # 工程级构建配置目录
│   └── hvigorfile.ts            # 工程级hvigor构建脚本
├── images/                      # 项目图片资源目录（文档或示例用）
├── oh_modules/                  # 鸿蒙依赖包缓存目录（存放下载的三方库）
├── build-profile.json5          # 工程级构建配置文件
├── oh-package.json5             # 工程级依赖配置文件
├── oh-package-lock.json5        # 依赖锁文件（固定依赖版本）
├── LICENSE                      # 项目开源协议文件
├── readme_cn.md                 # 项目中文说明文档
└── readme_en.md                 # 项目英文说明文档