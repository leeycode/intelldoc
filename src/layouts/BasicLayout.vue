<template>
  <a-layout class="layout full-height">
    <a-layout-sider
      v-model="collapsed"
      :trigger="null"
      collapsible
      width="256"
      class="sider"
    >
      <div class="logo">
        <router-link to="/">
          <img src="@/assets/logo.png" alt="logo" />
          <h1 v-if="!collapsed">智能写作助手</h1>
        </router-link>
      </div>
      <a-menu
        :default-selected-keys="[selectedKeys]"
        :default-open-keys="openKeys"
        mode="inline"
        :theme="theme"
      >
        <template v-for="route in menuItems">
          <a-menu-item
            v-if="route.meta && route.meta.icon && (!route.children || route.children.length === 0)"
            :key="route.fullPath"
            @click="() => handleMenuClick(route)"
          >
            <a-icon :type="route.meta.icon" />
            <span>{{ route.meta.title }}</span>
          </a-menu-item>
          
          <a-sub-menu
            v-if="route.children && route.children.length > 0 && route.meta"
            :key="route.path"
          >
            <span slot="title">
              <a-icon v-if="route.meta.icon" :type="route.meta.icon" />
              <span>{{ route.meta.title }}</span>
            </span>
            <template v-for="child in route.children">
              <a-menu-item
                v-if="!child.hidden && (!child.meta || !child.meta.hideInMenu)"
                :key="route.path + '/' + child.path"
                @click="() => handleMenuClick({ fullPath: '/' + route.path + '/' + child.path })"
              >
                {{ child.meta && child.meta.title }}
              </a-menu-item>
            </template>
          </a-sub-menu>
        </template>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">
        智能写作助手 ©{{ new Date().getFullYear() }}
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script>
export default {
  name: 'BasicLayout',
  data() {
    return {
      collapsed: false,
      theme: 'dark'
    };
  },
  computed: {
    routes() {
      return this.$router.options.routes[0].children;
    },
    menuItems() {
      // 获取需要显示在菜单中的项目
      const items = [];
      
      this.routes.forEach(route => {
        // 查找所有路由的列表页面
        const listRoute = route.children.find(child => child.path === 'list');
        if (listRoute && listRoute.meta) {
          items.push({
            ...listRoute,
            path: route.path + '/list',
            fullPath: '/' + route.path + '/list'
          });
        }
      });
      
      return items;
    },
    selectedKeys() {
      const path = this.$route.path;
      return path;
    },
    openKeys() {
      const matched = this.$route.matched;
      if (matched.length >= 2) {
        return [matched[1].path];
      }
      return [];
    }
  },
  methods: {
    handleMenuClick(route) {
      if (route.fullPath) {
        this.$router.push(route.fullPath);
      } else {
        this.$router.push('/' + route.path);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.layout {
  min-height: 100vh;
}

.logo {
  height: 64px;
  line-height: 64px;
  padding-left: 24px;
  overflow: hidden;
  background: #001529;
  
  img {
    height: 32px;
    margin-right: 12px;
    vertical-align: middle;
  }
  
  h1 {
    display: inline-block;
    margin: 0;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    vertical-align: middle;
  }
  
  a {
    display: inline-block;
  }
}

.sider {
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
  position: relative;
  z-index: 10;
}

.content {
  margin: 24px;
  padding: 24px;
  background: #fff;
  min-height: 280px;
}

.footer {
  text-align: center;
  padding: 20px;
}
</style> 