<script setup lang="ts">
import  WechatLogin from "./components/Wechat-login.vue"; 
</script>

<template>
  <WechatLogin v-slot="{wxLoginHandle}">
    <Button
      @click="wxLoginHandle"
      class="w-full text-lg mt-4 bg-[#07c160] hover:bg-op-80 rounded-2xl disabled:bg-op-20 border-none center transition-all">
      微信登录
    </Button>
  </WechatLogin>
</template>

<style scoped>

</style>
