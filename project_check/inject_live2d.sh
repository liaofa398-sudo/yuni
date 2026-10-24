# 在 </body> 前插入 Live2D 的 CDN 脚本
sed -i 's|</body>|<script src="https://fastly.jsdelivr.net/npm/oh-my-live2d@latest/dist/index.min.js"></script>\n<script>OML2D.loadOml2d({ models: [{ path: "https://fastly.jsdelivr.net/gh/guansss/pixi-live2d-display@master/test/assets/shizuku/shizuku.model3.json", scale: 0.15, position: [0, 50] }] });</script>\n</body>|' index.html
