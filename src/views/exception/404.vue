<template>
  <div class="exception-container">
    <a-result
      status="404"
      title="404"
      sub-title="抱歉，您访问的页面不存在"
    >
      <template #extra>
        <a-button type="primary" @click="goHome">
          返回首页
        </a-button>
      </template>
    </a-result>
  </div>
</template>

<script>
export default {
  name: 'Exception404',
  methods: {
    goHome() {
      this.$router.push('/');
    }
  }
};
</script>

<style lang="less" scoped>
.exception-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}
</style> 