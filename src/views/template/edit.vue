<template>
  <div class="template-edit-container">
    <a-page-header
      :title="isEdit ? '编辑模板' : '创建模板'"
      @back="() => $router.go(-1)"
    />
    
    <a-card class="form-card">
      <a-form-model
        ref="templateForm"
        :model="templateForm"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 14 }"
      >
        <a-form-model-item label="模板名称" prop="name">
          <a-input 
            v-model="templateForm.name"
            placeholder="请输入模板名称"
          />
        </a-form-model-item>
        
        <a-form-model-item label="报告分类" prop="category">
          <a-select
            v-model="templateForm.category"
            placeholder="请选择报告分类"
          >
            <a-select-option value="尽调">尽调</a-select-option>
            <a-select-option value="公文">公文</a-select-option>
            <a-select-option value="研报">研报</a-select-option>
            <a-select-option value="新闻稿">新闻稿</a-select-option>
          </a-select>
        </a-form-model-item>
        
        <a-form-model-item label="模板描述">
          <a-textarea
            v-model="templateForm.description"
            :rows="4"
            placeholder="请输入模板描述"
          />
        </a-form-model-item>
        
        <a-form-model-item label="基本信息字段">
          <a-checkbox-group v-model="templateForm.basicInfoFields">
            <a-row>
              <a-col :span="8">
                <a-checkbox value="报告名称">报告名称</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="报告描述">报告描述</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="客户名称">客户名称</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="客户号">客户号</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="统一社会信用代码">统一社会信用代码</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="所属行业">所属行业</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="用户姓名">用户姓名</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="用户UM">用户UM</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="部门">部门</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="创建日期">创建日期</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-form-model-item>
        
        <a-form-model-item label="模板类型" prop="fileType">
          <a-radio-group v-model="templateForm.fileType" @change="handleFileTypeChange">
            <a-radio value="word">Word模板</a-radio>
            <a-radio value="excel">Excel模板</a-radio>
            <a-radio value="ppt">PPT模板</a-radio>
          </a-radio-group>
        </a-form-model-item>
        
        <a-form-model-item label="上传模板" prop="templateFile">
          <a-upload
            :file-list="fileList"
            :before-upload="beforeUpload"
            :remove="handleRemove"
            :accept="acceptFileType"
          >
            <a-button>
              <a-icon type="upload" /> 点击上传
            </a-button>
            <div class="upload-hint"  v-pre>
              请上传包含变量标记的模板文件，变量使用双大括号标记，如 {{客户信息.getCustomerInfo.cust_name}}等
            </div>
          </a-upload>
        </a-form-model-item>
        
        <a-form-model-item label="模板预览" v-if="previewUrl">
          <a-alert
            message="请注意，模板中的变量将在报告生成时被替换"
            type="info"
            show-icon
            style="margin-bottom: 16px"
          />
          
          <div class="template-preview">
            <div v-if="templateForm.fileType === 'word'">
              <vue-office-docx
                :src="previewUrl"
                style="height: 500px"
                :config="docxOptions"
                @rendered="renderedHandler"
                @error="errorHandler"
              />
            </div>
            <div v-else-if="templateForm.fileType === 'excel'" style="height: 500px">
              <excel-preview
                :src="previewUrl"
              />
            </div>
            <div v-else-if="templateForm.fileType === 'ppt'">
              <div class="ppt-placeholder">
                <a-empty description="PPT预览功能已移除，请下载查看" />
                <a-button type="primary" style="margin-top: 16px" @click="downloadFile">
                  下载查看
                </a-button>
              </div>
            </div>
          </div>
        </a-form-model-item>
        
        <a-form-model-item :wrapper-col="{ span: 14, offset: 4 }">
          <a-button type="primary" @click="handleSubmit">保存</a-button>
          <a-button style="margin-left: 10px" @click="() => $router.go(-1)">取消</a-button>
        </a-form-model-item>
      </a-form-model>
    </a-card>
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
  name: 'TemplateEdit',
  components: {
    VueOfficeDocx,
    ExcelPreview
  },
  data() {
    return {
      isEdit: false,
      templateId: null,
      docxOptions: {
        defaultFont: {
          family: 'Microsoft YaHei',
          size: 12
        },
        ignoreHeight: false,
        ignoreWidth: false,
        renderHeader: true,
        renderFooter: true,
        zoom: 1
      },
      excelOptions: {
        mode: 'read',          // 只读模式
        showToolbar: false,    // 不显示工具栏
        showGrid: true,        // 显示网格
        showContextmenu: false, // 不显示右键菜单
        view: {
          height: () => 500,   // 固定高度
          width: () => '100%', // 宽度自适应
        },
        row: {
          len: 100,            // 默认行数
          height: 25,          // 默认行高
        },
        col: {
          len: 26,             // 默认列数
          width: 100,          // 默认列宽
          indexWidth: 60,      // 索引列宽
          minWidth: 60,        // 最小列宽
        },
        style: {
          fontSizeRatio: 0.9,  // 字体大小比例
          bgcolor: '#ffffff',  // 背景色
          color: '#333333'     // 文字颜色
        }
      },
      templateForm: {
        name: '',
        category: undefined,
        description: '',
        basicInfoFields: ['报告名称', '报告描述', '客户名称', '客户号', '统一社会信用代码', '所属行业', '用户姓名', '部门'],
        fileType: 'word',
        templateFile: null
      },
      rules: {
        name: [
          { required: true, message: '请输入模板名称', trigger: 'blur' },
          { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择报告分类', trigger: 'change' }
        ],
        fileType: [
          { required: true, message: '请选择模板类型', trigger: 'change' }
        ],
        templateFile: [
          { required: true, message: '请上传模板文件', trigger: 'change' }
        ]
      },
      fileList: [],
      previewUrl: ''
    };
  },
  computed: {
    acceptFileType() {
      if (this.templateForm.fileType === 'word') {
        return '.doc,.docx';
      } else if (this.templateForm.fileType === 'excel') {
        return '.xls,.xlsx';
      } else if (this.templateForm.fileType === 'ppt') {
        return '.ppt,.pptx';
      }
      return '';
    }
  },
  created() {
    const { id } = this.$route.params;
    if (id && id !== 'new') {
      this.isEdit = true;
      this.templateId = parseInt(id);
      this.fetchTemplateData();
    }
  },
  methods: {
    fetchTemplateData() {
      // 模拟获取模板数据
      const templateData = {
        id: this.templateId,
        name: '行业研究报告',
        category: '研报',
        description: '适用于特定行业的深度研究分析',
        basicInfoFields: ['报告名称', '报告描述', '客户名称', '客户号', '统一社会信用代码', '所属行业', '用户姓名', '部门'],
        fileType: 'excel',
        templateFile: 'template.docx'
      };
      
      this.templateForm = templateData;
      
      // 模拟文件列表
      this.fileList = [
        {
          uid: '-1',
          name: templateData.templateFile,
          status: 'done'
        }
      ];
      
      // 加载示例文档预览
      this.loadTemplatePreview();
    },
    
    // 加载模板预览
    loadTemplatePreview() {
      try {
        // 设置示例文档预览URL，使用public/static/docs目录下的文件
        if (this.templateForm.fileType === 'word') {
          // 使用绝对路径加载静态资源
          this.previewUrl = '/static/docs/智能写作平台.docx';
          this.$message.info('正在加载Word模板文件...');
        } else if (this.templateForm.fileType === 'excel') {
          // 确保路径正确
          this.previewUrl = '/static/docs/财务分析报表.xlsx';
          // 添加详细日志帮助调试
          console.log('Excel文件路径:', this.previewUrl);
          this.$message.info('正在加载Excel模板文件...');
          
          // 检查文件是否存在
          fetch(this.previewUrl)
            .then(response => {
              if (!response.ok) {
                throw new Error('Excel文件不存在');
              }
              console.log('Excel文件存在，状态:', response.status);
              return response;
            })
            .catch(error => {
              console.error('Excel文件检查失败:', error);
              this.$message.error('Excel文件不存在或无法访问');
            });
        } else if (this.templateForm.fileType === 'ppt') {
          this.previewUrl = '/static/docs/行业分析模板.pptx';
          this.$message.info('正在加载PPT模板文件...');
        }
      } catch (err) {
        console.error('加载模板失败:', err);
        this.$message.error('加载模板失败，请检查文件是否存在');
      }
    },
    
    handleFileTypeChange() {
      this.fileList = [];
      this.previewUrl = '';
      this.templateForm.templateFile = null;
    },
    beforeUpload(file) {
      const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const isDoc = file.type === 'application/msword';
      const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const isXls = file.type === 'application/vnd.ms-excel';
      const isPptx = file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      const isPpt = file.type === 'application/vnd.ms-powerpoint';
      
      const isWordFile = isDoc || isDocx;
      const isExcelFile = isXls || isXlsx;
      const isPptFile = isPpt || isPptx;
      
      if (this.templateForm.fileType === 'word' && !isWordFile) {
        this.$message.error('请上传Word文档模板文件!');
        return false;
      }
      
      if (this.templateForm.fileType === 'excel' && !isExcelFile) {
        this.$message.error('请上传Excel表格模板文件!');
        return false;
      }
      
      if (this.templateForm.fileType === 'ppt' && !isPptFile) {
        this.$message.error('请上传PPT演示文稿模板文件!');
        return false;
      }
      
      // 模拟检查文件大小
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        this.$message.error('模板文件大小不能超过10MB!');
        return false;
      }
      
      // 更新文件列表
      this.fileList = [file];
      this.templateForm.templateFile = file;
      
      // 读取文件内容为ArrayBuffer用于预览
      this.safelyReadFile(file);
      
      return false;
    },
    handleRemove() {
      this.fileList = [];
      this.previewUrl = '';
      this.templateForm.templateFile = null;
      return true;
    },
    handleSubmit() {
      this.$refs.templateForm.validate(valid => {
        if (valid) {
          this.$message.loading({ content: '正在保存...', key: 'saving' });
          
          // 模拟保存请求
          setTimeout(() => {
            this.$message.success({ content: '保存成功!', key: 'saving', duration: 2 });
            this.$router.push('/template/list');
          }, 1500);
        }
      });
    },
    renderedHandler() {
      console.log('文档渲染完成');
      this.$message.success('文档预览加载完成');
    },
    errorHandler(error) {
      console.error('文档渲染失败', error);
      this.$message.error('文档预览加载失败，请检查文件格式是否正确');
      // 重置预览URL，避免继续尝试加载错误文档
      this.previewUrl = '';
    },
    
    // 在读取文件时捕获可能的异常
    safelyReadFile(file) {
      // 按照Vue Office文档示例处理文件
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      
      reader.onload = (loadEvent) => {
        // 获取ArrayBuffer数据直接传给预览组件
        this.previewUrl = loadEvent.target.result;
        console.log('文件已读取为ArrayBuffer');
        
        this.$message.info('文件已上传，正在加载预览...');
      };
      
      reader.onerror = () => {
        this.$message.error('读取文件失败，请重试');
      };
    },
    
    downloadFile() {
      // 模拟下载功能
      if (this.previewUrl) {
        window.open(this.previewUrl, '_blank');
      } else {
        this.$message.warning('文件不存在，无法下载');
      }
    }
  }
};
</script>

<style lang="less" scoped>
.template-edit-container {
  .form-card {
    margin-top: 24px;
  }
  
  .upload-hint {
    color: rgba(0, 0, 0, 0.45);
    margin-top: 8px;
  }
  
  .template-preview {
    border: 1px solid #d9d9d9;
    padding: 8px;
    min-height: 500px;
    
    /deep/ .vue-office-container,
    /deep/ .x-spreadsheet-container {
      height: 100%;
      min-height: 480px;
    }
  }
}
</style> 