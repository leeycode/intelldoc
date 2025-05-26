<template>
  <div class="report-edit-container">
    <a-page-header
      title="编辑报告"
      @back="() => $router.go(-1)"
    />
    
    <a-card class="form-card">
      <a-form-model
        ref="reportForm"
        :model="reportForm"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item label="报告名称" prop="name">
          <a-input 
            v-model="reportForm.name"
            placeholder="请输入报告名称"
          />
        </a-form-model-item>
        
        <a-form-model-item label="报告分类" prop="category">
          <a-select
            v-model="reportForm.category"
            placeholder="请选择报告分类"
          >
            <a-select-option value="尽调">尽调</a-select-option>
            <a-select-option value="公文">公文</a-select-option>
            <a-select-option value="研报">研报</a-select-option>
            <a-select-option value="新闻稿">新闻稿</a-select-option>
          </a-select>
        </a-form-model-item>
        
        <a-form-model-item label="模板选择" prop="templateId">
          <a-select
            v-model="reportForm.templateId"
            placeholder="请选择报告模板"
            @change="handleTemplateChange"
          >
            <a-select-option v-for="template in templates" :key="template.id" :value="template.id">
              {{ template.name }}
            </a-select-option>
          </a-select>
          <a-button 
            type="link" 
            size="small" 
            style="margin-left: 8px" 
            @click="previewTemplate"
            :disabled="!reportForm.templateId"
          >
            预览模板
          </a-button>
        </a-form-model-item>
        
        <a-form-model-item label="作者" prop="author">
          <a-input 
            v-model="reportForm.author"
            placeholder="请输入作者姓名"
          />
        </a-form-model-item>
        
        <a-form-model-item label="客户名称">
          <a-input 
            v-model="reportForm.customerName"
            placeholder="请输入客户名称"
          />
        </a-form-model-item>
        
        <a-form-model-item :wrapper-col="{ span: 16, offset: 4 }">
          <a-button type="primary" @click="handleSubmit">保存</a-button>
          <a-button style="margin-left: 10px" @click="handlePreview">预览</a-button>
          <a-button style="margin-left: 10px" @click="handleBack">取消</a-button>
        </a-form-model-item>
      </a-form-model>
    </a-card>
    
    <!-- 模板预览对话框 -->
    <a-modal
      title="模板预览"
      :visible="showTemplatePreview"
      @cancel="handleTemplatePreviewClose"
      :footer="null"
      width="800px"
      :destroyOnClose="true"
      :getContainer="getModalContainer"
      :maskClosable="false"
    >
      <div v-if="currentTemplate">
        <a-descriptions title="模板信息" bordered>
          <a-descriptions-item label="模板名称">{{ currentTemplate.name }}</a-descriptions-item>
          <a-descriptions-item label="适用分类">{{ currentTemplate.category }}</a-descriptions-item>
          <a-descriptions-item label="模板描述">{{ currentTemplate.description }}</a-descriptions-item>
        </a-descriptions>
        
        <div class="template-preview">
          <div v-if="currentTemplate.fileType === 'word'" style="height: 500px">
            <vue-office-docx
              :src="templatePreviewUrl"
              :config="getWordConfig()"
              @rendered="renderedTemplateHandler"
              @error="errorTemplateHandler"
            />
          </div>
          <div v-else-if="currentTemplate.fileType === 'excel'" style="height: 500px">
            <excel-preview
              :src="templatePreviewUrl"
              :options="excelOptions"
              @rendered="renderedTemplateHandler"
              @error="errorTemplateHandler"
            />
          </div>
        </div>
        
        <a-button-group style="margin-top: 16px; display: flex; justify-content: center;">
          <a-button @click="handleTemplatePreviewClose">关闭</a-button>
        </a-button-group>
      </div>
    </a-modal>
  </div>
</template>

<script>
// 使用异步组件
const VueOfficeDocx = () => ({
  component: import(/* webpackChunkName: "vue-office-docx" */ '@vue-office/docx'),
  loading: { template: '<div class="loading-component">加载中...</div>' },
  delay: 200
})

// 使用轻量级Excel预览组件替代Vue Office Excel
import ExcelPreview from '@/components/ExcelPreview.vue'

export default {
  name: 'ReportEdit',
  components: {
    VueOfficeDocx,
    ExcelPreview
  },
  data() {
    return {
      reportId: null,
      reportForm: {
        name: '',
        category: undefined,
        templateId: undefined,
        author: '',
        customerName: '',
        socialCreditCode: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入报告名称', trigger: 'blur' },
          { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择报告分类', trigger: 'change' }
        ],
        templateId: [
          { required: true, message: '请选择报告模板', trigger: 'change' }
        ],
        author: [
          { required: true, message: '请输入作者姓名', trigger: 'blur' }
        ]
      },
      templates: [],
      selectedTemplate: null,
      templatePreviewUrl: '',
      showTemplatePreview: false,
      excelOptions: {
        showToolbar: false,
        showGrid: true,
        showSheetTabs: false
      },
      currentTemplate: null,
      documentBody: null // 用于存储document.body的引用
    };
  },
  created() {
    const { id } = this.$route.params;
    if (id) {
      this.reportId = parseInt(id);
    }
    
    // 先获取所有模板列表
    this.fetchTemplates();
    
    // 如果有报告ID，则获取报告数据
    if (this.reportId) {
      this.fetchReportData();
    }
  },
  methods: {
    fetchTemplates() {
      // 模拟获取模板列表
      this.templates = [
        {
          id: 1,
          name: '行业研究报告模板',
          category: '研报',
          description: '适用于特定行业的深度研究分析'
        },
        {
          id: 2,
          name: '尽职调查报告模板',
          category: '尽调',
          description: '适用于企业尽职调查分析'
        },
        {
          id: 3,
          name: '新闻稿模板',
          category: '新闻稿',
          description: '适用于新产品发布等新闻通告'
        },
        {
          id: 4,
          name: '公文模板',
          category: '公文',
          description: '适用于企业内部公文'
        }
      ];
    },
    fetchReportData() {
      // 模拟获取报告数据
      const reportData = {
        id: this.reportId,
        name: '2023年度行业分析报告',
        category: '研报',
        templateId: 1, // 默认选中的模板ID
        author: '张三',
        customerName: 'XX科技有限公司',
        socialCreditCode: '91110105MA01RWXX8R',
        status: '草稿'
      };
      
      this.reportForm = reportData;
    },
    handleTemplateChange(value) {
      // 模板变更时触发
      this.selectedTemplate = this.templates.find(t => t.id === value);
      
      // 如果是新建报告且报告分类尚未设置，则根据所选模板自动设置报告分类
      if (!this.reportId && !this.reportForm.category) {
        this.reportForm.category = this.selectedTemplate.category;
      }
    },
    previewTemplate() {
      // 显示模板预览
      this.fetchTemplateDetail();
    },
    fetchTemplateDetail() {
      // 模拟获取模板详情
      setTimeout(() => {
        const template = this.templates.find(t => t.id === this.reportForm.templateId);
        
        if (template) {
          this.currentTemplate = {
            ...template,
            // 根据不同模板类型设置不同的文件类型
            fileType: template.category === '研报' || template.category === '尽调' ? 'word' : 'excel'
          };
          
          // 根据模板类型设置不同的预览URL
          if (this.currentTemplate.fileType === 'word') {
            this.templatePreviewUrl = '/static/docs/智能写作平台.docx';
          } else {
            this.templatePreviewUrl = '/static/docs/财务分析报表.xlsx';
          }
          
          // 显示预览模态框
          this.showTemplatePreview = true;
        }
      }, 300);
    },
    handlePreview() {
      // 跳转到预览页面
      this.$router.push(`/report/preview/${this.reportId || 0}`);
    },
    handleReviewReport() {
      // 内容审核
      this.showReviewModal = true;
      this.reviewing = true;
      
      // 模拟审核请求
      setTimeout(() => {
        this.reviewResult = {
          id: this.reportId,
          review: {
            status: '通过',
            score: {
              contentStandard: 4.5,
              structureCompleteness: 5,
              professionalAccuracy: 4
            },
            comments: '报告内容符合规范，结构完整，专业性强。建议在市场分析部分补充更多定量数据支持论点。',
            reviewer: '系统审核',
            reviewTime: new Date().toLocaleString()
          }
        };
        
        this.reviewing = false;
      }, 2000);
    },
    handleSubmit() {
      this.$refs.reportForm.validate(valid => {
        if (valid) {
          this.$message.success('保存成功');
          this.handleBack();
        } else {
          this.$message.error('请先完善必填信息');
        }
      });
    },
    renderedTemplateHandler() {
      console.log('模板渲染成功');
    },
    errorTemplateHandler(error) {
      console.error('模板渲染错误:', error);
      this.$message.error('模板加载失败');
    },
    // 获取模态框容器
    getModalContainer() {
      return document.body;
    },
    // 处理预览模板关闭
    handleTemplatePreviewClose() {
      this.showTemplatePreview = false;
      this.currentTemplate = null;
      this.templatePreviewUrl = '';
    },
    // 添加获取Word配置的方法
    getWordConfig() {
      return {
        defaultFont: {
          family: 'Microsoft YaHei',
          size: 12
        },
        ignoreHeight: false,
        ignoreWidth: false,
        renderHeader: true,
        renderFooter: true,
        zoom: 1,
        inert: true,
        usePieceTable: true,
        ignoreLastRenderedPageBreak: true,
        enableComments: false,
        absPositionOffset: 0,
        disableSelection: true
      };
    },
    handleBack() {
      // 返回报告列表
      this.$router.push('/report/list');
    }
  }
};
</script>

<style lang="less" scoped>
.report-edit-container {
  .form-card {
    margin-top: 24px;
  }
  
  .template-preview {
    margin-top: 16px;
    border: 1px solid #d9d9d9;
    padding: 8px;
    min-height: 500px;
    
    /deep/ .vue-office-container {
      height: 100%;
      min-height: 480px;
    }
  }
}
</style> 