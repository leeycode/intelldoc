<template>
  <div class="datasource-list-container">
    <div class="table-operations">
      <a-button type="primary" @click="handleCreateDataSource">
        <a-icon type="plus" />添加数据源
      </a-button>
    </div>
    
    <a-card>
      <div class="table-search" slot="title">
        <a-form layout="inline">
          <a-form-item label="数据源名称">
            <a-input
              v-model="queryParams.name"
              placeholder="请输入"
              allowClear
              @change="handleSearch"
            />
          </a-form-item>
          <a-form-item label="数据来源">
            <a-input
              v-model="queryParams.source"
              placeholder="请输入"
              allowClear
              @change="handleSearch"
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
        :data-source="dataSourceList"
        :pagination="pagination"
        :loading="loading"
        :rowKey="record => record.id"
        @change="handleTableChange"
      >
        <template slot="type" slot-scope="type">
          <a-tag :color="type === 'datasource' ? 'blue' : 'green'">
            {{ type }}
          </a-tag>
        </template>
        
        <template slot="action" slot-scope="text, record">
          <a-button type="link" size="small" @click="handleViewDataSource(record)">
            查看详情
          </a-button>
          <a-divider type="vertical" />
          <a-button type="link" size="small" @click="handleEditDataSource(record)">
            编辑
          </a-button>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除该数据源吗？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleDeleteDataSource(record)"
          >
            <a-button type="link" size="small" style="color: #ff4d4f">
              删除
            </a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </a-card>
    
    <!-- 数据源表单对话框 -->
    <a-modal
      :title="formTitle"
      :visible="showFormModal"
      :confirmLoading="submitting"
      @ok="handleSubmitForm"
      @cancel="handleCancelForm"
      width="700px"
    >
      <a-form-model
        ref="dataSourceForm"
        :model="dataSourceForm"
        :rules="rules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-model-item label="数据元类型" prop="type">
          <a-select
            v-model="dataSourceForm.type"
            placeholder="请选择数据元类型"
          >
            <a-select-option value="datasource">datasource</a-select-option>
            <a-select-option value="agent">agent</a-select-option>
          </a-select>
        </a-form-model-item>
        
        <a-form-model-item label="数据源名称" prop="name">
          <a-input 
            v-model="dataSourceForm.name"
            placeholder="请输入数据源名称"
          />
        </a-form-model-item>
        
        <a-form-model-item label="API名称" prop="apiName">
          <a-input 
            v-model="dataSourceForm.apiName"
            placeholder="请输入API名称"
          />
        </a-form-model-item>
        
        <a-form-model-item label="接口地址" prop="url">
          <a-input 
            v-model="dataSourceForm.url"
            placeholder="请输入接口地址"
          />
        </a-form-model-item>
        
        <a-form-model-item label="数据来源" prop="source">
          <a-input 
            v-model="dataSourceForm.source"
            placeholder="请输入数据来源"
          />
        </a-form-model-item>
        
        <a-form-model-item label="请求方法" prop="requestMethod">
          <a-select
            v-model="dataSourceForm.requestMethod"
            placeholder="请选择请求方法"
          >
            <a-select-option value="GET">GET</a-select-option>
            <a-select-option value="POST">POST</a-select-option>
            <a-select-option value="PUT">PUT</a-select-option>
            <a-select-option value="DELETE">DELETE</a-select-option>
          </a-select>
        </a-form-model-item>
        
        <a-form-model-item label="接口描述">
          <a-textarea
            v-model="dataSourceForm.description"
            :rows="2"
            placeholder="请输入接口描述"
          />
        </a-form-model-item>
        
        <a-divider orientation="left">请求参数</a-divider>
        
        <div v-for="(param, index) in dataSourceForm.parameters" :key="'param-' + index" class="param-item">
          <a-row :gutter="16">
            <a-col :span="7">
              <a-form-model-item 
                :prop="'parameters.' + index + '.name'"
                :rules="[{ required: true, message: '参数名不能为空', trigger: 'blur' }]"
                label="参数名"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
              >
                <a-input v-model="param.name" placeholder="参数名" />
              </a-form-model-item>
            </a-col>
            <a-col :span="6">
              <a-form-model-item 
                :prop="'parameters.' + index + '.type'"
                label="类型"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
              >
                <a-select v-model="param.type" placeholder="类型">
                  <a-select-option value="string">字符串</a-select-option>
                  <a-select-option value="number">数字</a-select-option>
                  <a-select-option value="boolean">布尔值</a-select-option>
                  <a-select-option value="array">数组</a-select-option>
                  <a-select-option value="object">对象</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item 
                label="描述"
                :label-col="{ span: 6 }"
                :wrapper-col="{ span: 18 }"
              >
                <a-input v-model="param.description" placeholder="描述" />
              </a-form-model-item>
            </a-col>
            <a-col :span="2">
              <a-checkbox v-model="param.required">必填</a-checkbox>
            </a-col>
            <a-col :span="1">
              <a-button 
                type="link" 
                icon="delete" 
                @click="removeParameter(index)"
                style="color: #ff4d4f"
              />
            </a-col>
          </a-row>
        </div>
        
        <a-form-model-item :wrapper-col="{ span: 18, offset: 5 }">
          <a-button type="dashed" block @click="addParameter">
            <a-icon type="plus" />添加请求参数
          </a-button>
        </a-form-model-item>
        
        <a-divider orientation="left">响应字段</a-divider>
        
        <div v-for="(field, index) in dataSourceForm.responseFields" :key="'field-' + index" class="param-item">
          <a-row :gutter="16">
            <a-col :span="7">
              <a-form-model-item 
                :prop="'responseFields.' + index + '.name'"
                :rules="[{ required: true, message: '字段名不能为空', trigger: 'blur' }]"
                label="字段名"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
              >
                <a-input v-model="field.name" placeholder="字段名" />
              </a-form-model-item>
            </a-col>
            <a-col :span="6">
              <a-form-model-item 
                :prop="'responseFields.' + index + '.type'"
                label="类型"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
              >
                <a-select v-model="field.type" placeholder="类型">
                  <a-select-option value="string">字符串</a-select-option>
                  <a-select-option value="number">数字</a-select-option>
                  <a-select-option value="boolean">布尔值</a-select-option>
                  <a-select-option value="array">数组</a-select-option>
                  <a-select-option value="object">对象</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="10">
              <a-form-model-item 
                label="描述"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <a-input v-model="field.description" placeholder="描述" />
              </a-form-model-item>
            </a-col>
            <a-col :span="1">
              <a-button 
                type="link" 
                icon="delete" 
                @click="removeResponseField(index)"
                style="color: #ff4d4f"
              />
            </a-col>
          </a-row>
        </div>
        
        <a-form-model-item :wrapper-col="{ span: 18, offset: 5 }">
          <a-button type="dashed" block @click="addResponseField">
            <a-icon type="plus" />添加响应字段
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
    
  </div>
</template>

<script>
export default {
  name: 'DataSourceList',
  data() {
    return {
      loading: false,
      submitting: false,
      testing: false,
      queryParams: {
        name: '',
        source: '',
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
          title: '数据源类型',
          dataIndex: 'type',
          key: 'type',
          width: 120,
          scopedSlots: { customRender: 'type' }
        },
        {
          title: '数据源名称',
          dataIndex: 'name',
          key: 'name',
          ellipsis: true
        },
        {
          title: 'API名称',
          dataIndex: 'apiName',
          key: 'apiName',
          ellipsis: true
        },
        {
          title: '接口地址',
          dataIndex: 'url',
          key: 'url',
          ellipsis: true
        },
        {
          title: '数据来源',
          dataIndex: 'source',
          key: 'source',
          ellipsis: true
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
          width: 280
        }
      ],
      dataSourceList: [],
      showFormModal: false,
      formTitle: '添加数据源',
      dataSourceForm: {
        id: null,
        type: 'datasource',
        name: '',
        apiName: '',
        url: '',
        source: '',
        description: '',
        requestMethod: 'GET',
        parameters: [],
        responseFields: []
      },
      rules: {
        type: [
          { required: true, message: '请选择数据元类型', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入数据源名称', trigger: 'blur' },
          { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
        ],
        apiName: [
          { required: true, message: '请输入API名称', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '请输入接口地址', trigger: 'blur' }
        ],
        source: [
          { required: true, message: '请输入数据来源', trigger: 'blur' }
        ],
        requestMethod: [
          { required: true, message: '请选择请求方法', trigger: 'change' }
        ]
      },
      showTestConnectionModal: false,
      testResult: null
    };
  },
  mounted() {
    this.fetchDataSourceList();
  },
  methods: {
    fetchDataSourceList() {
      this.loading = true;
      
      // 模拟获取数据源列表数据
      setTimeout(() => {
        this.dataSourceList = [
          {
            id: 1,
            type: 'datasource',
            name: '客户信息',
            apiName: 'getCustomerInfo',
            url: 'http://api.example.com/customers',
            source: '客户管理系统',
            createTime: '2023-05-10 14:23:15',
            updateTime: '2023-05-28 10:42:15'
          },
          {
            id: 2,
            type: 'datasource',
            name: '行业数据',
            apiName: 'getIndustryData',
            url: 'http://api.example.com/industry',
            source: '行业分析平台',
            createTime: '2023-04-15 09:35:47',
            updateTime: '2023-05-25 16:18:09'
          },
          {
            id: 3,
            type: 'agent',
            name: '财务指标',
            apiName: 'getFinancialMetrics',
            url: 'http://api.example.com/finance',
            source: '财务报表系统',
            createTime: '2023-03-22 11:52:36',
            updateTime: '2023-05-20 09:33:54'
          }
        ];
        
        this.pagination.total = this.dataSourceList.length;
        this.loading = false;
      }, 500);
    },
    handleSearch() {
      this.pagination.current = 1;
      this.fetchDataSourceList();
    },
    handleReset() {
      this.queryParams = {
        name: '',
        source: '',
        page: 1,
        pageSize: 10
      };
      this.fetchDataSourceList();
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
      
      this.fetchDataSourceList();
    },
    handleCreateDataSource() {
      this.formTitle = '添加数据源';
      this.dataSourceForm = {
        id: null,
        type: 'datasource',
        name: '',
        apiName: '',
        url: '',
        source: '',
        description: '',
        requestMethod: 'GET',
        parameters: [],
        responseFields: []
      };
      this.showFormModal = true;
    },
    handleEditDataSource(record) {
      this.formTitle = '编辑数据源';
      
      // 模拟获取数据源详情
      setTimeout(() => {
        const dataSource = {
          id: record.id,
          type: record.type || 'datasource',
          name: record.name,
          apiName: record.apiName,
          url: record.url,
          source: record.source,
          description: '获取客户基础信息接口',
          requestMethod: 'GET',
          parameters: [
            {
              name: 'customerId',
              type: 'string',
              required: true,
              description: '客户ID'
            },
            {
              name: 'fields',
              type: 'array',
              required: false,
              description: '需要返回的字段'
            }
          ],
          responseFields: [
            {
              name: 'cust_name',
              type: 'string',
              description: '客户名称'
            },
            {
              name: 'cust_id',
              type: 'string',
              description: '客户编号'
            },
            {
              name: 'social_credit_code',
              type: 'string',
              description: '统一社会信用代码'
            },
            {
              name: 'industry',
              type: 'string',
              description: '所属行业'
            },
            {
              name: 'address',
              type: 'string',
              description: '地址'
            }
          ]
        };
        
        this.dataSourceForm = dataSource;
        this.showFormModal = true;
      }, 300);
    },
    handleViewDataSource(record) {
      this.$router.push(`/datasource/detail/${record.id}`);
    },
    handleSubmitForm() {
      this.$refs.dataSourceForm.validate(valid => {
        if (valid) {
          this.submitting = true;
          
          // 模拟提交请求
          setTimeout(() => {
            let message = '';
            
            if (this.dataSourceForm.id) {
              // 更新已有数据源
              const index = this.dataSourceList.findIndex(item => item.id === this.dataSourceForm.id);
              if (index !== -1) {
                this.dataSourceList[index] = {
                  ...this.dataSourceForm,
                  updateTime: new Date().toLocaleString()
                };
              }
              message = '更新成功';
            } else {
              // 添加新数据源
              const newDataSource = {
                ...this.dataSourceForm,
                id: Math.floor(Math.random() * 1000) + 10,
                createTime: new Date().toLocaleString(),
                updateTime: new Date().toLocaleString()
              };
              this.dataSourceList.unshift(newDataSource);
              this.pagination.total = this.dataSourceList.length;
              message = '添加成功';
            }
            
            this.submitting = false;
            this.showFormModal = false;
            this.$message.success(message);
          }, 1000);
        }
      });
    },
    handleCancelForm() {
      this.showFormModal = false;
    },
    handleTestConnection(record) {
      this.showTestConnectionModal = true;
      this.testing = true;
      this.testResult = null;
      
      // 模拟测试连接请求
      setTimeout(() => {
        this.testResult = {
          id: record.id,
          connectionStatus: 'success',
          responseTime: '125ms',
          testTime: new Date().toLocaleString()
        };
        this.testing = false;
      }, 1500);
    },
    handleDeleteDataSource(record) {
      // 模拟删除操作
      this.dataSourceList = this.dataSourceList.filter(item => item.id !== record.id);
      this.pagination.total = this.dataSourceList.length;
      this.$message.success(`删除成功：${record.name}`);
    },
    addParameter() {
      this.dataSourceForm.parameters.push({
        name: '',
        type: 'string',
        required: false,
        description: ''
      });
    },
    removeParameter(index) {
      this.dataSourceForm.parameters.splice(index, 1);
    },
    addResponseField() {
      this.dataSourceForm.responseFields.push({
        name: '',
        type: 'string',
        description: ''
      });
    },
    removeResponseField(index) {
      this.dataSourceForm.responseFields.splice(index, 1);
    }
  }
};
</script>

<style lang="less" scoped>
.datasource-list-container {
  .table-operations {
    margin-bottom: 16px;
  }
  
  .table-search {
    margin-bottom: 16px;
  }
  
  .param-item {
    margin-bottom: 8px;
    padding: 8px;
    background-color: #fafafa;
    border-radius: 4px;
    
    &:hover {
      background-color: #f0f0f0;
    }
  }
}
</style> 