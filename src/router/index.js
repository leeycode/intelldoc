import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/BasicLayout'),
    redirect: '/template/list',
    children: [
      {
        path: 'template',
        component: { render: h => h('router-view') },
        children: [
          {
            path: 'list',
            name: 'TemplateList',
            component: () => import('@/views/template/list'),
            meta: { title: '模板管理', icon: 'file-text' }
          },
          {
            path: 'excel',
            name: 'TemplateExcel',
            component: () => import('@/components/demo'),
            meta: { title: 'excel预览', icon: 'file-text' }
          },
          {
            path: 'edit/:id',
            name: 'TemplateEdit',
            component: () => import('@/views/template/edit'),
            meta: { title: '编辑模板', hideInMenu: true }
          },
          {
            path: 'create',
            name: 'TemplateCreate',
            component: () => import('@/views/template/edit'),
            meta: { title: '创建模板', hideInMenu: true }
          }
        ]
      },
      {
        path: 'report',
        component: { render: h => h('router-view') },
        children: [
          {
            path: 'list',
            name: 'ReportList',
            component: () => import('@/views/report/list'),
            meta: { title: '报告管理', icon: 'book' }
          },
          {
            path: 'create',
            name: 'ReportCreate',
            component: () => import('@/views/report/create'),
            meta: { title: '创建报告', hideInMenu: true }
          },
          {
            path: 'edit/:id',
            name: 'ReportEdit',
            component: () => import('@/views/report/edit'),
            meta: { title: '编辑报告', hideInMenu: true }
          },
          {
            path: 'preview/:id',
            name: 'ReportPreview',
            component: () => import('@/views/report/preview'),
            meta: { title: '预览报告', hideInMenu: true }
          }
        ]
      },
      {
        path: 'material',
        component: { render: h => h('router-view') },
        children: [
          {
            path: 'list',
            name: 'MaterialList',
            component: () => import('@/views/material/list'),
            meta: { title: '素材管理', icon: 'picture' }
          }
        ]
      },
      {
        path: 'datasource',
        component: { render: h => h('router-view') },
        children: [
          {
            path: 'list',
            name: 'DataSourceList',
            component: () => import('@/views/datasource/list'),
            meta: { title: '数据源管理', icon: 'database' }
          },
          {
            path: 'detail/:id',
            name: 'DataSourceDetail',
            component: () => import('@/views/datasource/detail'),
            meta: { title: '数据源详情', hideInMenu: true }
          }
        ]
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/exception/404'),
    hidden: true
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router; 