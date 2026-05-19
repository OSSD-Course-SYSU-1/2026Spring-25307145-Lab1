/**
 * 已实现功能<br>
 * 1. 自定义画幅<br>
 * 新增 PreviewAspectRatio.ets：自动 / 4:3 / 16:9 / 1:1 / 全屏<br>
 * 右侧功能栏裁剪按钮（bindMenu）切换画幅并重启相机会话<br>
 * AspectRatioMask 在非全屏/非自动模式下显示取景边框<br>
 * <br>
 * 2. 直方图 & 对焦峰值<br>
 * PreviewFrameProcessor：节流（约10fps）、缩略采样、NV21/RGBA 兼容<br>
 * HistogramOverlay、FocusPeakingOverlay 图层实现<br>
 * 右侧功能栏可开关，效果叠加在 PreviewScreenView<br>
 * <br>
 * 3. 滤镜 & 美颜<br>
 * FilterProcessor：基于 effectKit（复古/黑白/暖/冷/鲜艳+磨皮/美白）<br>
 * 顶部设置栏滤镜菜单（SettingButtonsView）<br>
 * 底部 FilterBeautyPanel：磨皮/美白滑条调节<br>
 * 开启滤镜或美颜时，用 Image 叠层显示处理后预览，所见即所得<br>
 * <br>
 * 4. 性能优化<br>
 * ImageReceiverManager.isActive 默认 false，仅功能启用时开启<br>
 * 适用场景：双路预览/直方图/对焦峰值/滤镜美颜<br>
 * 通过 PreviewViewModel.updateImageReceiverActive() 与会话重启联动<br>
 * <br>
 * 5. 拍照管线<br>
 * PhotoManager 增加 setPreviewEnhanceGetter<br>
 * 保存成片自动应用与预览一致的滤镜、美颜效果<br>
 * <br>
 * 6. 国际化<br>
 * 已补齐 base / zh_CN / en_US 多语言字符串资源
 */