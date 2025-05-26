<template>
  <div class="datasource-detail-container">
    <a-page-header
      title="数据源详情"
      @back="() => $router.go(-1)"
    >
      <template slot="extra">
        <a-button type="primary" @click="handleEdit">
          <a-icon type="edit" />编辑
        </a-button>
        <a-button style="margin-left: 10px" @click="handleTestConnection">
          <a-icon type="api" />测试连接
        </a-button>
      </template>
    </a-page-header>
    
    <a-card class="detail-card" :loading="loading">
      <a-spin :spinning="loading">
        <a-divider orientation="left">基本信息</a-divider>
        
        <a-descriptions bordered size="middle" :column="2">
          <a-descriptions-item label="数据源名称">
            {{ dataSource.name }}
          </a-descriptions-item>
          <a-descriptions-item label="API名称">
            {{ dataSource.apiName }}
          </a-descriptions-item>
          <a-descriptions-item label="接口地址">
            {{ dataSource.url }}
          </a-descriptions-item>
          <a-descriptions-item label="数据来源">
            {{ dataSource.source }}
          </a-descriptions-item>
          <a-descriptions-item label="请求方法">
            {{ dataSource.requestMethod }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ dataSource.createTime }}
          </a-descriptions-item>
          <a-descriptions-item label="更新时间">
            {{ dataSource.updateTime }}
          </a-descriptions-item>
          <a-descriptions-item label="描述" :span="2">
            {{ dataSource.description || '暂无描述' }}
          </a-descriptions-item>
        </a-descriptions>
        
        <a-divider orientation="left">请求参数</a-divider>
        
        <a-table
          :columns="paramColumns"
          :data-source="dataSource.parameters"
          :pagination="false"
          rowKey="name"
          size="middle"
        >
          <template slot="required" slot-scope="text">
            <a-tag :color="text ? '#f50' : '#87d068'">{{ text ? '是' : '否' }}</a-tag>
          </template>
        </a-table>
        
        <a-divider orientation="left">响应字段</a-divider>
        
        <a-table
          :columns="fieldColumns"
          :data-source="dataSource.responseFields"
          :pagination="false"
          rowKey="name"
          size="middle"
        >
        </a-table>
        
        <a-divider orientation="left">调试工具</a-divider>
        
        <div class="debug-tool">
          <a-alert
            message="使用此工具可以测试数据源接口，填写参数后点击发送请求按钮"
            type="info"
            show-icon
            style="margin-bottom: 16px"
          />
          
          <a-form-model
            ref="testForm"
            :model="testForm"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 18 }"
          >
            <div v-for="param in dataSource.parameters" :key="param.name">
              <a-form-model-item 
                :label="param.name" 
                :required="param.required"
                :prop="'params.' + param.name"
                :rules="param.required ? [{ required: true, message: '此字段为必填项', trigger: 'blur' }] : []"
              >
                <a-input 
                  v-model="testForm.params[param.name]" 
                  :placeholder="'请输入' + param.name + (param.description ? ' (' + param.description + ')' : '')"
                />
              </a-form-model-item>
            </div>
            
            <a-form-model-item :wrapper-col="{ span: 18, offset: 4 }">
              <a-button type="primary" :loading="testing" @click="handleSendRequest">
                <a-icon type="play-circle" />发送请求
              </a-button>
              <a-button style="margin-left: 10px" @click="resetTestForm">
                <a-icon type="redo" />重置
              </a-button>
            </a-form-model-item>
          </a-form-model>
          
          <a-divider dashed />
          
          <a-collapse v-if="testResponse">
            <a-collapse-panel key="1" header="响应结果">
              <div class="response-container">
                <a-tabs default-active-key="1">
                  <a-tab-pane key="1" tab="预览">
                    <div class="response-preview">
                      <pre>{{ prettyTestResponse }}</pre>
                    </div>
                  </a-tab-pane>
                  <a-tab-pane key="2" tab="响应头">
                    <div class="response-headers">
                      <a-descriptions bordered size="small">
                        <a-descriptions-item label="状态码" :span="3">
                          <a-tag :color="testResponse.status >= 400 ? 'red' : 'green'">
                            {{ testResponse.status }}
                          </a-tag>
                        </a-descriptions-item>
                        <a-descriptions-item v-for="(value, key) in testResponse.headers" :key="key" :label="key" :span="3">
                          {{ value }}
                        </a-descriptions-item>
                      </a-descriptions>
                    </div>
                  </a-tab-pane>
                </a-tabs>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </a-spin>
    </a-card>
    
    <!-- 测试连接对话框 -->
    <a-modal
      title="测试连接"
      :visible="showTestConnectionModal"
      :footer="null"
      @cancel="showTestConnectionModal = false"
      width="500px"
    >
      <a-spin :spinning="testingConnection">
        <div v-if="testConnectionResult">
          <a-result
            :status="testConnectionResult.connectionStatus === 'success' ? 'success' : 'error'"
            :title="testConnectionResult.connectionStatus === 'success' ? '连接测试成功' : '连接测试失败'"
            :sub-title="testConnectionResult.connectionStatus === 'success' ? `响应时间: ${testConnectionResult.responseTime}` : '请检查连接参数'"
          >
            <template #extra>
              <a-button type="primary" @click="showTestConnectionModal = false">
                确定
              </a-button>
            </template>
          </a-result>
        </div>
      </a-spin>
    </a-modal>
  </div>
</template>

<script>
export default {
  name: 'DataSourceDetail',
  data() {
    return {
      loading: true,
      dataSourceId: null,
      dataSource: {
        id: null,
        name: '',
        apiName: '',
        url: '',
        source: '',
        description: '',
        requestMethod: 'GET',
        parameters: [],
        responseFields: [],
        createTime: '',
        updateTime: ''
      },
      paramColumns: [
        {
          title: '参数名',
          dataIndex: 'name',
          key: 'name',
          width: '20%'
        },
        {
          title: '类型',
          dataIndex: 'type',
          key: 'type',
          width: '15%'
        },
        {
          title: '是否必填',
          dataIndex: 'required',
          scopedSlots: { customRender: 'required' },
          width: '15%'
        },
        {
          title: '描述',
          dataIndex: 'description',
          key: 'description'
        }
      ],
      fieldColumns: [
        {
          title: '字段名',
          dataIndex: 'name',
          key: 'name',
          width: '20%'
        },
        {
          title: '类型',
          dataIndex: 'type',
          key: 'type',
          width: '15%'
        },
        {
          title: '描述',
          dataIndex: 'description',
          key: 'description'
        }
      ],
      testForm: {
        params: {}
      },
      testing: false,
      testResponse: null,
      showTestConnectionModal: false,
      testingConnection: false,
      testConnectionResult: null
    };
  },
  computed: {
    prettyTestResponse() {
      if (!this.testResponse || !this.testResponse.data) {
        return '';
      }
      
      try {
        return JSON.stringify(this.testResponse.data, null, 2);
      } catch (err) {
        return String(this.testResponse.data);
      }
    }
  },
  created() {
    this.dataSourceId = this.$route.params.id;
    this.fetchDataSourceDetail();
  },
  methods: {
    fetchDataSourceDetail() {
      this.loading = true;
      
      // 模拟获取数据源详情
      setTimeout(() => {
        this.dataSource = {
          id: parseInt(this.dataSourceId),
          name: '客户信息',
          apiName: 'getCustomerInfo',
          url: 'http://api.example.com/customers',
          source: '客户管理系统',
          createTime: '2023-05-10 14:23:15',
          updateTime: '2023-05-28 10:42:15',
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
              type: 'string',
              required: false,
              description: '需要返回的字段，多个字段用逗号分隔'
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
        
        // 初始化测试表单
        this.resetTestForm();
        
        this.loading = false;
      }, 500);
    },
    handleEdit() {
      this.$router.push(`/datasource/edit/${this.dataSourceId}`);
    },
    resetTestForm() {
      const params = {};
      
      if (this.dataSource && this.dataSource.parameters) {
        this.dataSource.parameters.forEach(param => {
          params[param.name] = '';
        });
      }
      
      this.testForm = {
        params
      };
      this.testResponse = null;
    },
    handleSendRequest() {
      this.$refs.testForm.validate(valid => {
        if (!valid) {
          return;
        }
        
        this.testing = true;
        
        // 模拟发送请求
        setTimeout(() => {
          this.testResponse = {
            status: 200,
            headers: {
              'content-type': 'application/json',
              'access-control-allow-origin': '*',
              'cache-control': 'no-cache'
            },
            data: {
              code: 200,
              data: {
                cust_name: '测试客户公司',
                cust_id: 'CUST_001',
                social_credit_code: '91110105MA01RWXX8R',
                industry: '科技',
                address: '北京市朝阳区',
                // 其他字段...
                last_update: '2023-06-01'
              },
              message: '获取成功'
            }
          };
          
          this.testing = false;
        }, 1000);
      });
    },
    handleTestConnection() {
      this.showTestConnectionModal = true;
      this.testingConnection = true;
      this.testConnectionResult = null;
      
      // 模拟测试连接请求
      setTimeout(() => {
        this.testConnectionResult = {
          id: this.dataSourceId,
          connectionStatus: 'success',
          responseTime: '125ms',
          testTime: new Date().toLocaleString()
        };
        this.testingConnection = false;
      }, 1500);
    }
  }
};
</script>

<style lang="less" scoped>
.datasource-detail-container {
  .detail-card {
    margin-top: 16px;
  }
  
  .debug-tool {
    margin-top: 16px;
    
    .response-container {
      margin-top: 16px;
      
      .response-preview {
        background-color: #f5f5f5;
        padding: 16px;
        border-radius: 4px;
        max-height: 400px;
        overflow: auto;
        
        pre {
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      }
      
      .response-headers {
        margin-top: 16px;
      }
    }
  }
}
</style> 