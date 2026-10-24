import { loadOml2d } from 'oh-my-live2d';

export const initLive2D = () => {
  // 使用官方示例模型 Shizuku，通过 jsdelivr 国内加速节点加载
  loadOml2d({
    models: [
      {
        path: 'https://fastly.jsdelivr.net/gh/guansss/pixi-live2d-display@master/test/assets/shizuku/shizuku.model3.json',
        scale: 0.15,
        position: [0, 50],
        mobileScene: true,
      }
    ],
    // 隐藏状态栏和菜单，保持纯净
    menus: { items: [] },
    tips: { style: { width: '200px' } }
  });
};
