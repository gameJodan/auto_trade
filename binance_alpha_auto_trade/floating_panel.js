(function () {
  if (document.getElementById("alpha-auto-panel")) {
    return console.log("[content.js] 控制面板已存在");
  }

  const panel = document.createElement("div");
  panel.id = "alpha-auto-panel";
  panel.style = `
    font-family:Arial,sans-serif;padding:16px;background:#f8fafc;border:1px solid #ccc;
    box-shadow:0 2px 8px rgba(0,0,0,0.15);position:fixed;top:80px;left:20px;z-index:99999;
    width:260px;border-radius:8px;color:#1e293b;cursor:move;
  `;

  panel.innerHTML = `
    <div style="position:relative;">
      <div style="font-weight:bold;font-size:16px;margin-bottom:8px;">自动刷 Alpha 积分</div>
      <div id="alpha-close" style="position:absolute;top:0;right:4px;cursor:pointer;color:#888;font-weight:bold;">×</div>
    </div>
    <label style="font-size:14px;">USDT 金额:</label>
    <input id="alpha-amount" type="number" value="100"
           style="width:100%;padding:6px;border:1px solid #ccc;border-radius:4px;margin-bottom:8px;" />
    <label style="font-size:14px;">重复次数:</label>
    <input id="alpha-repeat" type="number" value="2"
           style="width:100%;padding:6px;border:1px solid #ccc;border-radius:4px;margin-bottom:12px;" />
    <button id="alpha-start"
            style="width:100%;padding:8px;background:#2563eb;color:white;border:none;
                   border-radius:4px;font-weight:bold;cursor:pointer;">
      开始执行
    </button>
    <div id="alpha-authors" style="font-size:12px;text-align:center;margin-top:12px;color:#64748b;">
      作者：<a href="https://x.com/K5EGU01" target="_blank" style="color:#2563eb;">@K5EGU01</a> &
      <a href="https://x.com/web3_888" target="_blank" style="color:#2563eb;">@web3_888</a>
    </div>
  `;

  document.body.appendChild(panel);

  // 拖动功能
  let isDragging = false;
  let offsetX, offsetY;

  panel.addEventListener("mousedown", function (e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;
    isDragging = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
  });

  document.addEventListener("mousemove", function (e) {
    if (isDragging) {
      panel.style.left = e.clientX - offsetX + "px";
      panel.style.top = e.clientY - offsetY + "px";
    }
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
  });

  // 启动逻辑
  const startBtn = document.getElementById("alpha-start");
  startBtn.addEventListener("click", () => {
    const amount = parseFloat(document.getElementById("alpha-amount").value);
    const repeat = parseInt(document.getElementById("alpha-repeat").value);
    const interval = 5;

    startBtn.disabled = true;
    startBtn.innerText = "运行中...";

    window.postMessage({
      type: "START_ALPHA_BUY",
      payload: { amount, repeat, interval }
    }, "*");
  });

  // 关闭按钮
  document.getElementById("alpha-close").addEventListener("click", () => {
    document.getElementById("alpha-auto-panel").remove();
  });

  // 恢复按钮状态：监听 ALPHA_DONE
  window.addEventListener("message", (event) => {
    if (event.data?.type === "ALPHA_DONE") {
      startBtn.disabled = false;
      startBtn.innerText = "开始执行";
    }
  });
})();