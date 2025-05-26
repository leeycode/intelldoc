<template>
  <div class="report-create-container">
    <a-page-header
      title="创建报告"
      @back="() => $router.go(-1)"
    />
    
    <a-steps :current="currentStep" class="steps">
      <a-step title="选择模板" />
      <a-step title="填写信息" />
      <a-step title="生成报告" />
    </a-steps>
    
    <!-- 步骤一：选择模板 -->
    <a-card v-if="currentStep === 0" class="step-card">
      <div class="template-search">
        <a-input-search
          placeholder="搜索模板"
          v-model="searchValue"
          @search="handleSearch"
          style="width: 300px; margin-bottom: 16px"
        />
        <a-select
          v-model="selectedCategory"
          placeholder="按分类筛选"
          style="width: 150px; margin-left: 8px"
          @change="handleCategoryChange"
          allowClear
        >
          <a-select-option value="尽调">尽调</a-select-option>
          <a-select-option value="公文">公文</a-select-option>
          <a-select-option value="研报">研报</a-select-option>
          <a-select-option value="新闻稿">新闻稿</a-select-option>
        </a-select>
      </div>
      
      <a-row :gutter="16">
        <a-col
          v-for="item in filteredTemplates"
          :key="item.id"
          :span="8"
          style="margin-bottom: 16px"
        >
          <a-card
            :class="['template-card', selectedTemplate && selectedTemplate.id === item.id ? 'selected' : '']"
            hoverable
            @click="() => selectTemplate(item)"
          >
            <div class="template-icon">
              <a-icon v-if="item.fileType === 'word'" type="file-word" />
              <a-icon v-else-if="item.fileType === 'excel'" type="file-excel" />
            </div>
            <div class="template-info">
              <h3>{{ item.name }}</h3>
              <div>
                <a-tag :color="getCategoryColor(item.category)">{{ item.category }}</a-tag>
                <span class="update-time">{{ item.updateTime }}</span>
              </div>
              <p class="template-desc">{{ item.description }}</p>
            </div>
          </a-card>
        </a-col>
      </a-row>
      
      <div class="step-actions">
        <a-button @click="() => $router.go(-1)">取消</a-button>
        <a-button
          type="primary"
          :disabled="!selectedTemplate"
          @click="nextStep"
        >
          下一步
        </a-button>
      </div>
    </a-card>
    
    <!-- 步骤二：填写信息 -->
    <a-card v-if="currentStep === 1" class="step-card">
      <a-form-model
        ref="reportForm"
        :model="reportForm"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 14 }"
      >
        <a-form-model-item label="报告名称" prop="name">
          <a-input v-model="reportForm.name" placeholder="请输入报告名称" />
        </a-form-model-item>
        
        <a-form-model-item label="报告分类" prop="category">
          <a-select v-model="reportForm.category" placeholder="请选择报告分类">
            <a-select-option value="尽调">尽调</a-select-option>
            <a-select-option value="公文">公文</a-select-option>
            <a-select-option value="研报">研报</a-select-option>
            <a-select-option value="新闻稿">新闻稿</a-select-option>
          </a-select>
        </a-form-model-item>
        
        <template v-if="selectedTemplate">
          <a-form-model-item
            v-for="field in selectedTemplate.basicInfoFields"
            :key="field"
            :label="field"
            :prop="`basicInfo.${getFieldKey(field)}`"
          >
            <a-date-picker
              v-if="field === '写作日期'"
              v-model="reportForm.basicInfo[getFieldKey(field)]"
              style="width: 100%"
              :format="dateFormat"
            />
            <a-input
              v-else
              v-model="reportForm.basicInfo[getFieldKey(field)]"
              :placeholder="`请输入${field}`"
            />
          </a-form-model-item>
        </template>
        
        <a-form-model-item label="报告描述">
          <a-textarea
            v-model="reportForm.description"
            :rows="4"
            placeholder="请输入报告描述"
          />
        </a-form-model-item>
        
        <a-form-model-item label="数据源">
          <a-select
            v-model="reportForm.dataSources"
            mode="multiple"
            placeholder="请选择数据源"
            style="width: 100%"
          >
            <a-select-option v-for="source in dataSources" :key="source.id" :value="source.id">
              {{ source.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
      
      <div class="step-actions">
        <a-button @click="prevStep">上一步</a-button>
        <a-button type="primary" @click="validateAndNext">下一步</a-button>
      </div>
    </a-card>
    
    <!-- 步骤三：生成报告 -->
    <a-card v-if="currentStep === 2" class="step-card">
      <div v-if="generating" class="generating-status">
        <a-spin tip="正在生成报告，请稍候...">
          <div class="generate-progress">
            <a-progress :percent="generateProgress" status="active" />
            <p>{{ generateMessage }}</p>
          </div>
        </a-spin>
      </div>
      
      <div v-else-if="generated" class="generated-result">
        <a-result
          status="success"
          title="报告已生成"
          sub-title="您的报告已成功生成，可以预览或下载"
        >
          <template #extra>
            <a-button type="primary" @click="previewReport">
              预览
            </a-button>
            <a-button style="margin-left: 8px" @click="downloadReport">
              下载
            </a-button>
            <a-button style="margin-left: 8px" @click="reviewReport">
              进行内容审核
            </a-button>
          </template>
          
          <div class="report-info">
            <a-descriptions title="报告信息" bordered>
              <a-descriptions-item label="报告名称">{{ reportForm.name }}</a-descriptions-item>
              <a-descriptions-item label="报告分类">{{ reportForm.category }}</a-descriptions-item>
              <a-descriptions-item label="创建时间">{{ new Date().toLocaleString() }}</a-descriptions-item>
              <a-descriptions-item label="使用模板">{{ selectedTemplate.name }}</a-descriptions-item>
              <a-descriptions-item label="作者">{{ reportForm.basicInfo.author || '未指定' }}</a-descriptions-item>
              <a-descriptions-item label="文件大小">2.5 MB</a-descriptions-item>
            </a-descriptions>
          </div>
        </a-result>
      </div>
      
      <div v-else class="generate-options">
        <a-alert
          v-if="selectedTemplate"
          message="生成确认"
          :description="`您将基于「${selectedTemplate.name}」模板生成报告，请确认信息无误后点击生成按钮。`"
          type="info"
          show-icon
          style="margin-bottom: 16px"
        />
      </div>
      
      <div class="step-actions">
        <a-button v-if="!generated" @click="prevStep">上一步</a-button>
        <a-button
          v-if="!generating && !generated"
          type="primary"
          @click="generateReport"
        >
          生成报告
        </a-button>
        <a-button v-if="generated" type="primary" @click="finishProcess">
          完成
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script>
export default {
  name: 'ReportCreate',
  data() {
    return {
      currentStep: 0,
      searchValue: '',
      selectedCategory: undefined,
      selectedTemplate: null,
      dateFormat: 'YYYY-MM-DD',
      reportForm: {
        name: '',
        category: undefined,
        description: '',
        basicInfo: {},
        dataSources: []
      },
      rules: {
        name: [
          { required: true, message: '请输入报告名称', trigger: 'blur' },
          { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择报告分类', trigger: 'change' }
        ]
      },
      templates: [
        {
          id: 1,
          name: '季度经营情况分析报告',
          category: '公文',
          fileType: 'word',
          updateTime: '2023-05-28',
          description: '适用于公司内部季度经营情况分析',
          basicInfoFields: ['报告名称', '客户名称', '部门', '作者', '写作日期']
        },
        {
          id: 2,
          name: '尽职调查报告标准模板',
          category: '尽调',
          fileType: 'word',
          updateTime: '2023-05-25',
          description: '适用于企业并购前的尽职调查报告',
          basicInfoFields: ['报告名称', '客户名称', '统一社会信用代码', '作者', '写作日期']
        },
        {
          id: 3,
          name: '行业研究报告',
          category: '研报',
          fileType: 'word',
          updateTime: '2023-05-20',
          description: '适用于特定行业的深度研究分析',
          basicInfoFields: ['报告名称', '行业名称', '作者', '写作日期', '部门']
        },
        {
          id: 4,
          name: '产品发布新闻稿',
          category: '新闻稿',
          fileType: 'word',
          updateTime: '2023-05-15',
          description: '适用于新产品发布的媒体宣传',
          basicInfoFields: ['报告名称', '产品名称', '作者', '写作日期']
        },
        {
          id: 5,
          name: '财务分析报表',
          category: '研报',
          fileType: 'excel',
          updateTime: '2023-05-12',
          description: '适用于财务数据分析与图表展示',
          basicInfoFields: ['报告名称', '客户名称', '统一社会信用代码', '报告期间', '作者']
        }
      ],
      dataSources: [
        { id: 1, name: '客户信息数据源' },
        { id: 2, name: '财务数据源' },
        { id: 3, name: '行业数据源' },
        { id: 4, name: '市场数据源' }
      ],
      generating: false,
      generated: false,
      generateProgress: 0,
      generateMessage: '',
      generateOptions: {
        outputFormat: 'docx',
        watermark: false,
        postActions: ['preview']
      }
    };
  },
  computed: {
    filteredTemplates() {
      let result = this.templates;
      
      if (this.searchValue) {
        const lowerSearch = this.searchValue.toLowerCase();
        result = result.filter(item => 
          item.name.toLowerCase().includes(lowerSearch) || 
          item.description.toLowerCase().includes(lowerSearch)
        );
      }
      
      if (this.selectedCategory) {
        result = result.filter(item => item.category === this.selectedCategory);
      }
      
      return result;
    }
  },
  created() {
    // 检查是否从其他页面带了模板ID
    const { templateId } = this.$route.query;
    if (templateId) {
      const template = this.templates.find(t => t.id === parseInt(templateId));
      if (template) {
        this.selectedTemplate = template;
        this.nextStep();
      }
    }
  },
  methods: {
    handleSearch() {
      // 搜索已经在computed属性中处理
    },
    handleCategoryChange() {
      // 分类筛选已经在computed属性中处理
    },
    selectTemplate(template) {
      this.selectedTemplate = template;
      
      // 预填充报告表单的一些信息
      this.reportForm.category = template.category;
      
      // 初始化basicInfo对象
      this.reportForm.basicInfo = {};
      template.basicInfoFields.forEach(field => {
        this.reportForm.basicInfo[this.getFieldKey(field)] = '';
      });
    },
    getCategoryColor(category) {
      const colorMap = {
        '尽调': 'blue',
        '公文': 'green',
        '研报': 'purple',
        '新闻稿': 'orange'
      };
      return colorMap[category] || 'cyan';
    },
    getFieldKey(field) {
      // 将中文字段名称转换为英文key
      const keyMap = {
        '报告名称': 'reportName',
        '客户名称': 'customerName',
        '统一社会信用代码': 'creditCode',
        '报告描述': 'description',
        '作者': 'author',
        '写作日期': 'writeDate',
        '部门': 'department',
        '标签': 'tags',
        '行业名称': 'industryName',
        '产品名称': 'productName',
        '报告期间': 'reportPeriod'
      };
      return keyMap[field] || field;
    },
    nextStep() {
      this.currentStep += 1;
    },
    prevStep() {
      this.currentStep -= 1;
    },
    validateAndNext() {
      this.$refs.reportForm.validate(valid => {
        if (valid) {
          this.nextStep();
        }
      });
    },
    generateReport() {
      this.generating = true;
      this.generateProgress = 0;
      this.generateMessage = '正在准备数据...';
      
      // 模拟生成过程
      const steps = [
        { progress: 20, message: '正在填充模板变量...' },
        { progress: 40, message: '正在处理数据源...' },
        { progress: 60, message: '正在生成内容...' },
        { progress: 80, message: '正在格式化文档...' },
        { progress: 100, message: '报告生成完成!' }
      ];
      
      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          const step = steps[currentStep];
          this.generateProgress = step.progress;
          this.generateMessage = step.message;
          currentStep++;
        } else {
          clearInterval(interval);
          // 在真实环境中，这里应该是向后端API提交数据
          this.submitReportToBackend();
        }
      }, 1000);
    },
    
    submitReportToBackend() {
      // 模拟向后端提交报告
      const reportData = {
        name: this.reportForm.name,
        category: this.reportForm.category,
        description: this.reportForm.description,
        templateId: this.selectedTemplate.id,
        basicInfo: this.reportForm.basicInfo,
        dataSources: this.reportForm.dataSources,
        status: '生成中' // 初始状态为生成中
      };
      
      // 在实际应用中，这里应该是向后端API提交数据
      // this.$axios.post('/api/reports', reportData).then(res => { ... })
      
      // 提示用户
      this.$message.success('报告已提交到后台生成，完成后将在报告列表中显示');
      
      // 跳转到报告列表页
      setTimeout(() => {
        this.$router.push({
          path: '/report/list',
          query: {
            from: 'create',
            reportData: JSON.stringify({
              name: this.reportForm.name,
              templateId: this.selectedTemplate.id,
              category: this.reportForm.category
            })
          }
        });
      }, 1500);
    },
    previewReport() {
      this.$router.push(`/report/preview/preview-demo`);
    },
    downloadReport() {
      this.$message.success('报告下载已开始');
    },
    reviewReport() {
      this.$message.info('正在进行内容审核...');
      setTimeout(() => {
        this.$message.success('内容审核通过，未发现问题');
      }, 2000);
    },
    finishProcess() {
      this.$router.push('/report/list');
    }
  }
};
</script>

<style lang="less" scoped>
.report-create-container {
  .steps {
    margin: 24px 0;
  }
  
  .step-card {
    margin-bottom: 24px;
  }
  
  .step-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
    
    button + button {
      margin-left: 8px;
    }
  }
  
  .template-search {
    margin-bottom: 24px;
  }
  
  .template-card {
    height: 200px;
    display: flex;
    flex-direction: column;
    transition: all 0.3s;
    
    &.selected {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
    
    .template-icon {
      font-size: 36px;
      margin-bottom: 16px;
      color: #1890ff;
    }
    
    .template-info {
      flex: 1;
      
      h3 {
        margin-bottom: 8px;
        font-size: 16px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .update-time {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
        margin-left: 8px;
      }
      
      .template-desc {
        margin-top: 8px;
        color: rgba(0, 0, 0, 0.65);
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }
    }
  }
  
  .generating-status {
    padding: 40px 0;
    text-align: center;
    
    .generate-progress {
      width: 80%;
      max-width: 600px;
      margin: 0 auto;
      margin-top: 24px;
      
      p {
        margin-top: 16px;
        color: rgba(0, 0, 0, 0.65);
      }
    }
  }
  
  .generated-result {
    .report-info {
      margin-top: 24px;
      text-align: left;
    }
  }
  
  .generate-options {
    max-width: 600px;
    margin: 0 auto;
    
    h3 {
      margin-bottom: 24px;
    }
  }
}
</style> 