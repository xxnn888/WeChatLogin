<template>
  <slot :wxLoginHandle="WeChatLoginHandle"></slot>
  <Dialog v-model:visible="weChatVisible" modal :header='微信登录'
          :pt="{ root: { class: 'dialog-animation' } }">
    <div class="flex flex-column justify-center items-center">
      <h2 >使用微信扫一扫登录</h2>
      <div id="login_container" class="w300px h400px relative"></div>
      <div v-if="isLoading" class="absolute top-[30%] left-[50%] translate-x-[-50%] w280px h280px
      bg-[#f0f0f0] rounded-xl overflow-hidden">
        <div class="w100% h100%  bg-[linear-gradient(90deg,#f0f0f0_25%,#e0e0e0_50%,#f0f0f0_75%)] bg-[length:200%_100%]
                    animate-[shimmer_1.5s_infinite]
                    [animation-name:shimmer]
                    [@keyframes_shimmer]{
                    0%{background-position:-200%_0}
                    100%{background-position:200%_0}
             }"></div>
      </div>
    </div>
  </Dialog>
</template>
<script  setup>
import { onMounted, ref } from "vue";


const weChatVisible = ref(false);
const isLoading = ref(true);

const WeChatLoginHandle = () => {
  weChatVisible.value = true;
  isLoading.value = true;
  // 加入延迟动画效果
  setTimeout(async () => {
    try {
      await initWxLogin(); // 确保 initWxLogin 是异步的
      isLoading.value = false;
    } catch (error) {
      console.error("微信登录初始化失败:", error);
      isLoading.value = false;
    }
  }, 1000);
};
const loadWxLoginScript = () => {
  // 动态加载微信登录脚本
  return new Promise((resolve) => {
    if (document.getElementById("wxLoginJs")) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "wxLoginJs";
    script.src = "https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js";
    script.onload = resolve;
    document.body.appendChild(script);
  });
};
const handleMessage = async (code) => {
  if (code) {
    try {
  const response = await fetch("/auth/api/wechat/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: code,
    }),
  });
  const res = await response.json();

  // 处理微信登录成功逻辑
  if (res.success) {
    localStorage.setItem("userToken", res.result);
    // 路由跳转
  } else {
    // 用户未绑定，请先绑定账号
    alert("用户未绑定，请先绑定账号");
  }
} catch (error) {
  console.error("获取用户信息失败:", error);
}
  }
};

onMounted(async () => {
  await loadWxLoginScript();
  // Check if there's a code parameter in the URL for WeChat login callback
  await checkLoginStatus();

});
const state = ref(Math.random().toString(36).substring(2));

const initWxLogin = async () => {
  try {
    const redirectUri = encodeURIComponent("http://localhost:5173/Auth");
    new window.WxLogin({
      self_redirect: false,
      id: "login_container",
      appid: "",
      scope: "snsapi_login",
      redirect_uri: redirectUri,
      state: state.value,
      style: "black",
      href: "",
    });

  } catch (error) {
    console.error("初始化微信登录失败:", error);
  }
};
const checkLoginStatus = async () => {
  //获取路由参数，code,有则调用handleMessage
  const code = route.query.code;
  if (code) {
    // Create a mock event object with the same structure expected by handleMessage
    await handleMessage(code);
  }
};
</script>
<style scoped>


</style>