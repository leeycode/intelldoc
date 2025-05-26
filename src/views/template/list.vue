<template>
  <div class="template-list-container">
    <div class="table-operations">
      <a-button type="primary" @click="handleCreateTemplate">
        <a-icon type="plus" />添加模板
      </a-button>
    </div>
    
    <a-card>
      <div class="table-search" slot="title">
        <a-form layout="inline">
          <a-form-item label="模板名称">
            <a-input
              v-model="queryParams.name"
              placeholder="请输入"
              allowClear
              @change="handleSearch"
            />
          </a-form-item>
          <a-form-item label="模板分类">
            <a-select
              v-model="queryParams.category"
              placeholder="请选择"
              style="width: 150px"
              allowClear
              @change="handleSearch"
            >
              <a-select-option value="尽调">尽调</a-select-option>
              <a-select-option value="公文">公文</a-select-option>
              <a-select-option value="研报">研报</a-select-option>
              <a-select-option value="新闻稿">新闻稿</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">
              <a-icon type="search" />查询
            </a-button>
            <a-button style="margin-left: 8px" @click="handleReset">
              <a-icon type="redo" />重置
            </a-button>
          </a-form-item>
        </a-form>
      </div>
      
      <a-table
        :columns="columns"
        :data-source="templateList"
        :pagination="pagination"
        :loading="loading"
        :rowKey="record => record.id"
        @change="handleTableChange"
      >
        <template slot="category" slot-scope="text">
          <a-tag v-if="text === '尽调'" color="blue">{{ text }}</a-tag>
          <a-tag v-else-if="text === '公文'" color="green">{{ text }}</a-tag>
          <a-tag v-else-if="text === '研报'" color="purple">{{ text }}</a-tag>
          <a-tag v-else-if="text === '新闻稿'" color="orange">{{ text }}</a-tag>
          <a-tag v-else>{{ text }}</a-tag>
        </template>
        
        <template slot="fileType" slot-scope="text">
          <span v-if="text === 'word'">Word文档</span>
          <span v-else-if="text === 'excel'">Excel表格</span>
          <span v-else>{{ text }}</span>
        </template>
        
        <template slot="action" slot-scope="text, record">
          <a-button type="link" size="small" @click="handleEditTemplate(record)">
            编辑
          </a-button>
          <!-- <a-divider type="vertical" /> -->
          <!-- <a-button type="link" size="small" @click="handleUseTemplate(record)">
            使用
          </a-button> -->
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除该模板吗？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleDeleteTemplate(record)"
          >
            <a-button type="link" size="small" style="color: #ff4d4f">
              删除
            </a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script>
export default {
  name: 'TemplateList',
  data() {
    return {
      loading: false,
      queryParams: {
        name: '',
        category: undefined,
        page: 1,
        pageSize: 10
      },
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showTotal: total => `共 ${total} 条记录`
      },
      columns: [
        {
          title: '模板名称',
          dataIndex: 'name',
          key: 'name',
          ellipsis: true
        },
        {
          title: '模板分类',
          dataIndex: 'category',
          key: 'category',
          scopedSlots: { customRender: 'category' }
        },
        {
          title: '文件类型',
          dataIndex: 'fileType',
          key: 'fileType',
          scopedSlots: { customRender: 'fileType' }
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          key: 'createTime',
          sorter: true
        },
        {
          title: '更新时间',
          dataIndex: 'updateTime',
          key: 'updateTime',
          sorter: true
        },
        {
          title: '操作',
          key: 'action',
          scopedSlots: { customRender: 'action' },
          width: 200
        }
      ],
      templateList: [
        {
          id: 1,
          name: '季度经营情况分析报告',
          category: '公文',
          fileType: 'word',
          createTime: '2023-05-10 14:23:15',
          updateTime: '2023-05-28 10:42:15',
          description: '适用于公司内部季度经营情况分析'
        },
        {
          id: 2,
          name: '尽职调查报告标准模板',
          category: '尽调',
          fileType: 'word',
          createTime: '2023-04-15 09:35:47',
          updateTime: '2023-05-25 16:18:09',
          description: '适用于企业并购前的尽职调查报告'
        },
        {
          id: 3,
          name: '行业研究报告',
          category: '研报',
          fileType: 'word',
          createTime: '2023-03-22 11:52:36',
          updateTime: '2023-05-20 09:33:54',
          description: '适用于特定行业的深度研究分析'
        },
        {
          id: 4,
          name: '产品发布新闻稿',
          category: '新闻稿',
          fileType: 'word',
          createTime: '2023-03-08 16:42:19',
          updateTime: '2023-05-15 14:27:38',
          description: '适用于新产品发布的媒体宣传'
        },
        {
          id: 5,
          name: '财务分析报表',
          category: '研报',
          fileType: 'excel',
          createTime: '2023-02-28 10:15:33',
          updateTime: '2023-05-12 11:05:23',
          description: '适用于财务数据分析与图表展示'
        }
      ]
    };
  },
  mounted() {
    this.fetchTemplateList();
  },
  methods: {
    fetchTemplateList() {
      this.loading = true;
      
      // 模拟异步请求
      setTimeout(() => {
        this.pagination.total = this.templateList.length;
        this.loading = false;
      }, 500);
    },
    handleSearch() {
      this.pagination.current = 1;
      this.fetchTemplateList();
    },
    handleReset() {
      this.queryParams = {
        name: '',
        category: undefined,
        page: 1,
        pageSize: 10
      };
      this.fetchTemplateList();
    },
    handleTableChange(pagination, filters, sorter) {
      this.pagination.current = pagination.current;
      this.pagination.pageSize = pagination.pageSize;
      this.queryParams.page = pagination.current;
      this.queryParams.pageSize = pagination.pageSize;
      
      if (sorter && sorter.field) {
        this.queryParams.sortField = sorter.field;
        this.queryParams.sortOrder = sorter.order;
      } else {
        this.queryParams.sortField = undefined;
        this.queryParams.sortOrder = undefined;
      }
      
      this.fetchTemplateList();
    },
    handleCreateTemplate() {
      this.$router.push('/template/create');
    },
    handleEditTemplate(record) {
      this.$router.push(`/template/edit/${record.id}`);
    },
    handleUseTemplate(record) {
      this.$router.push({
        path: '/report/create',
        query: { templateId: record.id }
      });
    },
    handleDeleteTemplate(record) {
      // 模拟删除操作
      this.$message.success(`删除成功：${record.name}`);
      this.templateList = this.templateList.filter(item => item.id !== record.id);
      this.pagination.total = this.templateList.length;
    }
  }
};
</script>

<style lang="less" scoped>
.template-list-container {
  .table-operations {
    margin-bottom: 16px;
  }
  
  .table-search {
    margin-bottom: 16px;
  }
}
</style> 