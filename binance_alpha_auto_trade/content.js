console.log("[content.js] ✅ 已注入 content 脚本");

function clickTab(tabName) {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const target = tabs.find(el => el.innerText.trim() === tabName);
  if (target) {
    const isSelected = target.getAttribute("aria-selected") === "true";
    if (!isSelected) {
      target.click();
      console.log(`[content.js] ✅ 切换到标签：${tabName}`);
    } else {
      console.log(`[content.js] 已在标签：${tabName}，无需切换`);
    }
  } else {
    console.warn(`[content.js] ❌ 未找到标签：${tabName}`);
  }
}

function clickInstantTab() {
  const instant = document.querySelector('[data-tab-key="INSTANT"]');
  if (instant && instant.getAttribute("aria-selected") !== "true") {
    instant.click();
    console.log("[content.js] ✅ 切换到即时交易Tab");
  } else {
    console.log("[content.js] 已处于即时交易Tab");
  }
}

function inputBuyAmount(amount) {
  const input = document.querySelector('#fromCoinAmount');
  if (input) {
    input.value = amount;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    console.log("[content.js] ✅ 填写买入金额：", amount);
  } else {
    console.warn("[content.js] ❌ 未找到买入金额输入框");
  }
}

function getSellBalance() {
  const el = [...document.querySelectorAll('.text-PrimaryText.truncate')]
    .find(e => e.innerText.includes("ZKJ") || e.innerText.match(/\d/));
  if (!el) return null;
  const match = el.innerText.trim().match(/[\d,.]+/);
  if (!match) return null;
  // Remove commas from the matched string
  return match[0].replace(/,/g, '');
}

function inputSellAmount(amount) {
  const input = document.querySelector('#fromCoinAmount');
  if (input) {
    input.value = amount;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    console.log("[content.js] ✅ 填写卖出金额：", amount);
  } else {
    console.warn("[content.js] ❌ 未找到卖出输入框");
  }
}

function clickBuyConfirm() {
  const btns = [...document.querySelectorAll("button")];
  console.log("[content.js] ✅ 所有按钮内容：", btns.map(b => b.innerText));
  const confirm = btns.find(b => b.innerText.replace(/\s+/g, " ").startsWith("买入 "));
  if (confirm) {
    confirm.click();
    console.log("[content.js] ✅ 点击买入按钮");
  } else {
    console.warn("[content.js] ❌ 未找到买入按钮");
  }
}

function clickSellConfirm() {
  const btns = [...document.querySelectorAll("button")];
  const confirm = btns.find(b =>
    b.innerText.replace(/\s+/g, " ").startsWith("卖出 ") &&
    b.className.includes("bn-button__sell")
  );
  if (confirm) {
    confirm.click();
    console.log("[content.js] ✅ 点击卖出按钮");
  } else {
    console.warn("[content.js] ❌ 未找到卖出按钮");
  }
}

function clickPopupContinue() {
  const confirm = [...document.querySelectorAll("button")]
    .find(b => b.innerText.trim() === "确认");
  if (confirm) {
    confirm.click();
    console.log("[content.js] ✅ 点击确认弹窗按钮");
  } else {
    console.warn("[content.js] ❌ 没有找到确认弹窗按钮");
  }
}

async function runTradeCycle(amount, repeat, interval) {
  let count = 0;
  async function delay(sec) {
    return new Promise(res => setTimeout(res, sec * 1000));
  }

  while (count < repeat) {
    console.log(`🔁 第 ${count + 1} 次交易开始`);
    try {
      clickInstantTab();
      await delay(1);

      clickTab('买入');
      await delay(1);

      inputBuyAmount(amount);
      await delay(3);

      clickBuyConfirm();
      await delay(1);

      clickPopupContinue(); // 买入确认弹窗
      await delay(interval);
      await delay(3);

      clickTab('卖出');
      await delay(1);

      const balance = getSellBalance();
      if (balance) {
        inputSellAmount(balance);
      } else {
        console.warn("❌ 未能获取可用余额");
        break;
      }

      await delay(3);

      clickSellConfirm();
      await delay(1);
      clickPopupContinue(); // 卖出确认弹窗
      await delay(interval);

      count++;
    } catch (err) {
      console.warn("❌ 第", count + 1, "轮交易出错：", err);
    }
  }

  console.log("🎉 所有交易完成");
  window.postMessage({ type: "ALPHA_DONE" }, "*");
}

window.addEventListener("message", (event) => {
  console.log("[content.js] 收到消息：", event.data);
  if (event.data?.type === "START_ALPHA_BUY") {
    const { amount, repeat, interval } = event.data.payload;
    console.log("[content.js] ✅ 开始自动交易", { amount, repeat, interval });
    runTradeCycle(amount, repeat, interval);
  }
});