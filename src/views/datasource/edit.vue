<template>
  <div class="datasource-edit-container">
    <a-page-header
      :title="isEdit ? '编辑数据源' : '新建数据源'"
      @back="() => $router.go(-1)"
    >
      <template slot="extra">
        <a-button @click="() => $router.go(-1)">
          取消
        </a-button>
        <a-button type="primary" style="margin-left: 10px" @click="handleSubmit" :loading="submitting">
          保存
        </a-button>
      </template>
    </a-page-header>
    
    <a-card class="edit-card">
      <a-spin :spinning="loading">
        <a-form-model
          ref="form"
          :model="formData"
          :rules="rules"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-divider orientation="left">基本信息</a-divider>
          
          <a-form-model-item label="数据源名称" prop="name">
            <a-input v-model="formData.name" placeholder="请输入数据源名称" />
          </a-form-model-item>
          
          <a-form-model-item label="API名称" prop="apiName">
            <a-input v-model="formData.apiName" placeholder="请输入API名称" />
          </a-form-model-item>
          
          <a-form-model-item label="接口地址" prop="url">
            <a-input v-model="formData.url" placeholder="请输入接口地址" />
          </a-form-model-item>
          
          <a-form-model-item label="数据来源" prop="source">
            <a-input v-model="formData.source" placeholder="请输入数据来源" />
          </a-form-model-item>
          
          <a-form-model-item label="请求方法" prop="requestMethod">
            <a-select v-model="formData.requestMethod">
              <a-select-option value="GET">GET</a-select-option>
              <a-select-option value="POST">POST</a-select-option>
              <a-select-option value="PUT">PUT</a-select-option>
              <a-select-option value="DELETE">DELETE</a-select-option>
            </a-select>
          </a-form-model-item>
          
          <a-form-model-item label="描述" prop="description">
            <a-textarea 
              v-model="formData.description" 
              placeholder="请输入数据源描述" 
              :auto-size="{ minRows: 3, maxRows: 5 }" 
            />
          </a-form-model-item>
          
          <a-divider orientation="left">请求参数</a-divider>
          
          <div class="table-operations">
            <a-button type="primary" size="small" @click="handleAddParameter">
              <a-icon type="plus" />新增参数
            </a-button>
          </div>
          
          <a-table
            :columns="paramColumns"
            :data-source="formData.parameters"
            :pagination="false"
            rowKey="id"
            size="middle"
          >
            <template slot="name" slot-scope="text, record, index">
              <a-input 
                v-model="formData.parameters[index].name" 
                placeholder="参数名" 
                @change="() => validateParameters()" 
              />
            </template>
            
            <template slot="type" slot-scope="text, record, index">
              <a-select 
                v-model="formData.parameters[index].type" 
                style="width: 100%"
              >
                <a-select-option value="string">字符串</a-select-option>
                <a-select-option value="number">数字</a-select-option>
                <a-select-option value="boolean">布尔值</a-select-option>
                <a-select-option value="object">对象</a-select-option>
                <a-select-option value="array">数组</a-select-option>
              </a-select>
            </template>
            
            <template slot="required" slot-scope="text, record, index">
              <a-switch 
                v-model="formData.parameters[index].required" 
                checked-children="是" 
                un-checked-children="否" 
              />
            </template>
            
            <template slot="description" slot-scope="text, record, index">
              <a-input 
                v-model="formData.parameters[index].description" 
                placeholder="参数描述" 
              />
            </template>
            
            <template slot="action" slot-scope="text, record, index">
              <a-button 
                type="danger" 
                size="small" 
                @click="() => handleRemoveParameter(index)"
              >
                删除
              </a-button>
            </template>
          </a-table>
          
          <div v-if="paramErrors.length > 0" class="param-errors">
            <a-alert 
              v-for="(error, index) in paramErrors" 
              :key="index" 
              type="error" 
              :message="error" 
              banner 
              style="margin-bottom: 8px;"
            />
          </div>
          
          <a-divider orientation="left">响应字段</a-divider>
          
          <div class="table-operations">
            <a-button type="primary" size="small" @click="handleAddResponseField">
              <a-icon type="plus" />新增字段
            </a-button>
          </div>
          
          <a-table
            :columns="fieldColumns"
            :data-source="formData.responseFields"
            :pagination="false"
            rowKey="id"
            size="middle"
          >
            <template slot="name" slot-scope="text, record, index">
              <a-input 
                v-model="formData.responseFields[index].name" 
                placeholder="字段名" 
                @change="() => validateResponseFields()" 
              />
            </template>
            
            <template slot="type" slot-scope="text, record, index">
              <a-select 
                v-model="formData.responseFields[index].type" 
                style="width: 100%"
              >
                <a-select-option value="string">字符串</a-select-option>
                <a-select-option value="number">数字</a-select-option>
                <a-select-option value="boolean">布尔值</a-select-option>
                <a-select-option value="object">对象</a-select-option>
                <a-select-option value="array">数组</a-select-option>
              </a-select>
            </template>
            
            <template slot="description" slot-scope="text, record, index">
              <a-input 
                v-model="formData.responseFields[index].description" 
                placeholder="字段描述" 
              />
            </template>
            
            <template slot="action" slot-scope="text, record, index">
              <a-button 
                type="danger" 
                size="small" 
                @click="() => handleRemoveResponseField(index)"
              >
                删除
              </a-button>
            </template>
          </a-table>
          
          <div v-if="fieldErrors.length > 0" class="field-errors">
            <a-alert 
              v-for="(error, index) in fieldErrors" 
              :key="index" 
              type="error" 
              :message="error" 
              banner 
              style="margin-bottom: 8px;"
            />
          </div>
        </a-form-model>
      </a-spin>
    </a-card>
  </div>
</template>

<script>
export default {
  name: 'DataSourceEdit',
  data() {
    return {
      isEdit: false,
      dataSourceId: null,
      loading: false,
      submitting: false,
      formData: {
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
        name: [
          { required: true, message: '请输入数据源名称', trigger: 'blur' },
          { max: 50, message: '名称不能超过50个字符', trigger: 'blur' }
        ],
        apiName: [
          { required: true, message: '请输入API名称', trigger: 'blur' },
          { max: 50, message: 'API名称不能超过50个字符', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '请输入接口地址', trigger: 'blur' },
          { max: 200, message: '接口地址不能超过200个字符', trigger: 'blur' }
        ],
        source: [
          { required: true, message: '请输入数据来源', trigger: 'blur' },
          { max: 50, message: '数据来源不能超过50个字符', trigger: 'blur' }
        ],
        requestMethod: [
          { required: true, message: '请选择请求方法', trigger: 'change' }
        ],
        description: [
          { max: 500, message: '描述不能超过500个字符', trigger: 'blur' }
        ]
      },
      paramColumns: [
        {
          title: '参数名',
          dataIndex: 'name',
          key: 'name',
          scopedSlots: { customRender: 'name' },
          width: '20%'
        },
        {
          title: '类型',
          dataIndex: 'type',
          key: 'type',
          scopedSlots: { customRender: 'type' },
          width: '15%'
        },
        {
          title: '是否必填',
          dataIndex: 'required',
          key: 'required',
          scopedSlots: { customRender: 'required' },
          width: '15%'
        },
        {
          title: '描述',
          dataIndex: 'description',
          key: 'description',
          scopedSlots: { customRender: 'description' },
          width: '30%'
        },
        {
          title: '操作',
          key: 'action',
          scopedSlots: { customRender: 'action' },
          width: '10%'
        }
      ],
      fieldColumns: [
        {
          title: '字段名',
          dataIndex: 'name',
          key: 'name',
          scopedSlots: { customRender: 'name' },
          width: '25%'
        },
        {
          title: '类型',
          dataIndex: 'type',
          key: 'type',
          scopedSlots: { customRender: 'type' },
          width: '15%'
        },
        {
          title: '描述',
          dataIndex: 'description',
          key: 'description',
          scopedSlots: { customRender: 'description' },
          width: '40%'
        },
        {
          title: '操作',
          key: 'action',
          scopedSlots: { customRender: 'action' },
          width: '10%'
        }
      ],
      paramErrors: [],
      fieldErrors: []
    };
  },
  created() {
    const id = this.$route.params.id;
    
    if (id) {
      this.isEdit = true;
      this.dataSourceId = id;
      this.fetchDataSourceDetail();
    }
  },
  methods: {
    fetchDataSourceDetail() {
      if (!this.isEdit) {
        return;
      }
      
      this.loading = true;
      
      // 模拟获取数据源详情
      setTimeout(() => {
        this.formData = {
          name: '客户信息',
          apiName: 'getCustomerInfo',
          url: 'http://api.example.com/customers',
          source: '客户管理系统',
          description: '获取客户基础信息接口',
          requestMethod: 'GET',
          parameters: [
            {
              id: 1,
              name: 'customerId',
              type: 'string',
              required: true,
              description: '客户ID'
            },
            {
              id: 2,
              name: 'fields',
              type: 'string',
              required: false,
              description: '需要返回的字段，多个字段用逗号分隔'
            }
          ],
          responseFields: [
            {
              id: 1,
              name: 'cust_name',
              type: 'string',
              description: '客户名称'
            },
            {
              id: 2,
              name: 'cust_id',
              type: 'string',
              description: '客户编号'
            },
            {
              id: 3,
              name: 'social_credit_code',
              type: 'string',
              description: '统一社会信用代码'
            },
            {
              id: 4,
              name: 'industry',
              type: 'string',
              description: '所属行业'
            },
            {
              id: 5,
              name: 'address',
              type: 'string',
              description: '地址'
            }
          ]
        };
        
        this.loading = false;
      }, 500);
    },
    handleAddParameter() {
      const newId = this.formData.parameters.length > 0 
        ? Math.max(...this.formData.parameters.map(item => item.id)) + 1 
        : 1;
        
      this.formData.parameters.push({
        id: newId,
        name: '',
        type: 'string',
        required: false,
        description: ''
      });
      
      this.validateParameters();
    },
    handleRemoveParameter(index) {
      this.formData.parameters.splice(index, 1);
      this.validateParameters();
    },
    handleAddResponseField() {
      const newId = this.formData.responseFields.length > 0 
        ? Math.max(...this.formData.responseFields.map(item => item.id)) + 1 
        : 1;
        
      this.formData.responseFields.push({
        id: newId,
        name: '',
        type: 'string',
        description: ''
      });
      
      this.validateResponseFields();
    },
    handleRemoveResponseField(index) {
      this.formData.responseFields.splice(index, 1);
      this.validateResponseFields();
    },
    validateParameters() {
      this.paramErrors = [];
      
      // 检查参数名是否为空
      this.formData.parameters.forEach((param, index) => {
        if (!param.name.trim()) {
          this.paramErrors.push(`参数${index + 1}：参数名不能为空`);
        }
      });
      
      // 检查参数名是否重复
      const paramNames = this.formData.parameters.map(param => param.name);
      const duplicateNames = paramNames.filter((name, index) => 
        paramNames.indexOf(name) !== index && name.trim() !== ''
      );
      
      duplicateNames.forEach(name => {
        this.paramErrors.push(`参数名"${name}"重复`);
      });
      
      return this.paramErrors.length === 0;
    },
    validateResponseFields() {
      this.fieldErrors = [];
      
      // 检查字段名是否为空
      this.formData.responseFields.forEach((field, index) => {
        if (!field.name.trim()) {
          this.fieldErrors.push(`字段${index + 1}：字段名不能为空`);
        }
      });
      
      // 检查字段名是否重复
      const fieldNames = this.formData.responseFields.map(field => field.name);
      const duplicateNames = fieldNames.filter((name, index) => 
        fieldNames.indexOf(name) !== index && name.trim() !== ''
      );
      
      duplicateNames.forEach(name => {
        this.fieldErrors.push(`字段名"${name}"重复`);
      });
      
      return this.fieldErrors.length === 0;
    },
    validateAll() {
      const paramValid = this.validateParameters();
      const fieldValid = this.validateResponseFields();
      
      return paramValid && fieldValid;
    },
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return;
        }
        
        if (!this.validateAll()) {
          this.$message.error('表单验证失败，请检查参数和字段设置');
          return;
        }
        
        this.submitting = true;
        
        // 模拟提交保存
        setTimeout(() => {
          this.submitting = false;
          
          this.$message.success(this.isEdit ? '保存数据源成功！' : '创建数据源成功！');
          
          // 跳转回列表页
          this.$router.push('/datasource/list');
        }, 1000);
      });
    }
  }
};
</script>

<style lang="less" scoped>
.datasource-edit-container {
  .edit-card {
    margin-top: 16px;
  }
  
  .table-operations {
    margin-bottom: 16px;
  }
  
  .param-errors, .field-errors {
    margin-top: 16px;
    margin-bottom: 16px;
  }
}
</style> 