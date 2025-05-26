<template>
  <div class="report-list-container">
    <div class="table-operations">
      <a-button type="primary" @click="handleCreateReport">
        <a-icon type="plus" />创建报告
      </a-button>
    </div>
    
    <a-card>
      <div class="table-search" slot="title">
        <a-form layout="inline">
          <a-form-item label="报告名称">
            <a-input
              v-model="queryParams.name"
              placeholder="请输入"
              allowClear
              @change="handleSearch"
            />
          </a-form-item>
          <a-form-item label="报告分类">
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
          <a-form-item label="报告状态">
            <a-select
              v-model="queryParams.status"
              placeholder="请选择"
              style="width: 150px"
              allowClear
              @change="handleSearch"
            >
              <a-select-option value="草稿">草稿</a-select-option>
              <a-select-option value="审核中">审核中</a-select-option>
              <a-select-option value="已完成">已完成</a-select-option>
              <a-select-option value="生成中">生成中</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="创建时间">
            <a-range-picker
              v-model="dateRange"
              @change="handleDateRangeChange"
              style="width: 240px"
            />
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
        :data-source="reportList"
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
        
        <template slot="status" slot-scope="text">
          <a-badge v-if="text === '草稿'" status="default" text="草稿" />
          <a-badge v-else-if="text === '审核中'" status="processing" text="审核中" />
          <a-badge v-else-if="text === '已完成'" status="success" text="已完成" />
          <a-badge v-else-if="text === '生成中'" status="warning" text="生成中" />
          <a-badge v-else status="default" text={text} />
        </template>
        
        <template slot="action" slot-scope="text, record">
          <a-button type="link" size="small" @click="handlePreviewReport(record)">
            预览
          </a-button>
          <a-divider type="vertical" />
          <a-button type="link" size="small" @click="handleEditReport(record)">
            编辑
          </a-button>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除该报告吗？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleDeleteReport(record)"
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
  name: 'ReportList',
  data() {
    return {
      loading: false,
      dateRange: [],
      queryParams: {
        name: '',
        category: undefined,
        status: undefined,
        startDate: undefined,
        endDate: undefined,
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
          title: '报告名称',
          dataIndex: 'name',
          key: 'name',
          width: 150,
          ellipsis: true
        },
        {
          title: '报告描述',
          dataIndex: 'description',
          key: 'description',
          ellipsis: true,
          width: 200
        },
        {
          title: '报告分类',
          dataIndex: 'category',
          key: 'category',
          scopedSlots: { customRender: 'category' },
          width: 100
        },
        {
          title: '作者',
          dataIndex: 'author',
          key: 'author',
          width: 100
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          scopedSlots: { customRender: 'status' },
          width: 100
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          key: 'createTime',
          sorter: true,
          width: 160
        },
        {
          title: '更新时间',
          dataIndex: 'updateTime',
          key: 'updateTime',
          sorter: true,
          width: 160
        },
        {
          title: '操作',
          key: 'action',
          scopedSlots: { customRender: 'action' },
          fixed: 'right',
          width: 200
        }
      ],
      allReportList: [
        {
          id: 1,
          name: '2023年度行业分析报告',
          description: '对2023年行业发展趋势进行全面分析',
          category: '研报',
          author: '张三',
          status: '已完成',
          createTime: '2023-06-12 15:32:21',
          updateTime: '2023-06-15 09:18:33'
        },
        {
          id: 2,
          name: '客户尽职调查报告',
          description: '对目标客户的财务和运营状况进行调查',
          category: '尽调',
          author: '李四',
          status: '草稿',
          createTime: '2023-06-10 09:15:33',
          updateTime: '2023-06-10 09:15:33'
        },
        {
          id: 3,
          name: '季度经营情况分析',
          description: '第二季度公司经营数据统计与分析',
          category: '公文',
          author: '王五',
          status: '审核中',
          createTime: '2023-06-08 14:22:45',
          updateTime: '2023-06-09 16:35:22'
        },
        {
          id: 4,
          name: '新产品上市通告',
          description: '关于新产品上市的官方公告',
          category: '新闻稿',
          author: '赵六',
          status: '已完成',
          createTime: '2023-06-05 11:05:17',
          updateTime: '2023-06-06 14:28:51'
        },
        {
          id: 5,
          name: '技术创新产业发展研究',
          description: '技术创新对产业发展影响的研究报告',
          category: '研报',
          author: '张三',
          status: '已完成',
          createTime: '2023-06-03 10:45:33',
          updateTime: '2023-06-05 11:22:47'
        }
      ],
      reportList: []
    };
  },
  mounted() {
    this.fetchReportList();
    
    // 监听从创建页面跳转回来的情况
    this.checkPendingReports();
  },
  methods: {
    checkPendingReports() {
      // 检查是否从报告创建页面返回
      const { from, reportData } = this.$route.query;
      
      if (from === 'create' && reportData) {
        try {
          // 解析报告数据
          const parsedData = JSON.parse(reportData);
          
          // 在实际应用中，这里应该是向后端查询创建的报告状态
          // 这里模拟刚创建的报告
          const newReport = {
            id: this.allReportList.length + 1,
            name: parsedData.name || '新生成的报告',
            description: '该报告正在后台生成中，请稍候...',
            category: parsedData.category || '研报',
            author: '当前用户',
            status: '生成中',
            createTime: new Date().toLocaleString(),
            updateTime: new Date().toLocaleString()
          };
          
          // 添加到列表中
          this.allReportList.unshift(newReport);
          this.fetchReportList();
          
          // 模拟后台处理完成
          setTimeout(() => {
            // 找到该报告并更新状态
            const report = this.allReportList.find(r => r.id === newReport.id);
            if (report) {
              report.status = '已完成';
              report.description = parsedData.name ? `${parsedData.name}的完整报告` : '报告已生成完毕';
              report.updateTime = new Date().toLocaleString();
              this.fetchReportList();
              this.$message.success('报告 "' + report.name + '" 已生成完成！');
            }
          }, 8000); // 8秒后完成
        } catch (e) {
          console.error('处理报告数据出错', e);
        }
      }
    },
    fetchReportList() {
      this.loading = true;
      
      // 模拟异步请求
      setTimeout(() => {
        // 添加筛选逻辑
        const filteredList = this.allReportList.filter(item => {
          // 按报告名称筛选
          const nameMatch = !this.queryParams.name || 
            item.name.toLowerCase().includes(this.queryParams.name.toLowerCase());
          
          // 按报告分类筛选
          const categoryMatch = !this.queryParams.category || 
            item.category === this.queryParams.category;
          
          // 按报告状态筛选
          const statusMatch = !this.queryParams.status || 
            item.status === this.queryParams.status;
          
          // 按创建时间范围筛选
          const startDateMatch = !this.queryParams.startDate || 
            new Date(item.createTime) >= new Date(this.queryParams.startDate);
          const endDateMatch = !this.queryParams.endDate || 
            new Date(item.createTime) <= new Date(this.queryParams.endDate + ' 23:59:59');
          
          return nameMatch && categoryMatch && statusMatch && startDateMatch && endDateMatch;
        });
        
        // 更新表格数据
        const { current, pageSize } = this.pagination;
        const startIndex = (current - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageData = filteredList.slice(startIndex, endIndex);
        
        // 更新数据源和分页信息
        this.reportList = pageData;
        this.pagination.total = filteredList.length;
        this.loading = false;
      }, 500);
    },
    handleSearch() {
      this.pagination.current = 1;
      this.fetchReportList();
    },
    handleDateRangeChange(dates, dateStrings) {
      this.queryParams.startDate = dateStrings[0] || undefined;
      this.queryParams.endDate = dateStrings[1] || undefined;
      this.handleSearch();
    },
    handleReset() {
      this.queryParams = {
        name: '',
        category: undefined,
        status: undefined,
        startDate: undefined,
        endDate: undefined,
        page: 1,
        pageSize: 10
      };
      this.dateRange = [];
      this.fetchReportList();
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
      
      this.fetchReportList();
    },
    handleCreateReport() {
      this.$router.push('/report/create');
    },
    handleEditReport(record) {
      this.$router.push(`/report/edit/${record.id}`);
    },
    handlePreviewReport(record) {
      this.$router.push(`/report/preview/${record.id}`);
    },
    handleDeleteReport(record) {
      // 模拟删除操作
      this.$message.success(`删除成功：${record.name}`);
      this.allReportList = this.allReportList.filter(item => item.id !== record.id);
      this.fetchReportList();
    }
  }
};
</script>

<style lang="less" scoped>
.report-list-container {
  .table-operations {
    margin-bottom: 16px;
  }
  
  .table-search {
    margin-bottom: 16px;
  }
}
</style> 