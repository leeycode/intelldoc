<template>
  <div class="material-list-container">
    <div class="table-operations">
      <a-button type="primary" @click="handleUploadMaterial">
        <a-icon type="upload" />上传素材
      </a-button>
    </div>
    
    <a-card>
      <div class="table-search" slot="title">
        <a-form layout="inline">
          <a-form-item label="素材名称">
            <a-input
              v-model="queryParams.name"
              placeholder="请输入"
              allowClear
              @change="handleSearch"
            />
          </a-form-item>
          <a-form-item label="素材分类">
            <a-select
              v-model="queryParams.category"
              placeholder="请选择"
              style="width: 150px"
              allowClear
              @change="handleSearch"
            >
              <a-select-option value="图表">图表</a-select-option>
              <a-select-option value="图片">图片</a-select-option>
              <a-select-option value="数据">数据</a-select-option>
              <a-select-option value="文档">文档</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="标签">
            <a-select
              v-model="queryParams.tags"
              placeholder="请选择"
              style="width: 150px"
              allowClear
              mode="multiple"
              @change="handleSearch"
            >
              <a-select-option value="财务">财务</a-select-option>
              <a-select-option value="市场">市场</a-select-option>
              <a-select-option value="产品">产品</a-select-option>
              <a-select-option value="研发">研发</a-select-option>
              <a-select-option value="重要">重要</a-select-option>
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
      
      <div class="material-tabs">
        <a-tabs default-active-key="my" @change="handleTabChange">
          <a-tab-pane key="my" tab="我的素材">
            <a-spin :spinning="loading">
              <div class="material-grid">
                <a-row :gutter="16">
                  <a-col :span="6" v-for="item in materialList" :key="item.id">
                    <a-card hoverable class="material-card">
                      <div class="material-card-content">
                        <div class="material-image" v-if="item.type === 'image'">
                          <img :src="item.url" alt="素材图片" />
                        </div>
                        <div class="material-file" v-else>
                          <a-icon 
                            :type="getFileIconType(item.type)" 
                            :style="{ color: getFileIconColor(item.type) }" 
                            class="file-icon" 
                          />
                        </div>
                        <div class="material-info">
                          <h4 class="material-name">{{ item.name }}</h4>
                          <div class="material-meta">
                            <a-tag>{{ item.category }}</a-tag>
                            <span class="file-size">{{ item.fileSize }}</span>
                          </div>
                          <div class="material-tags" v-if="item.tags && item.tags.length">
                            <a-tag v-for="tag in item.tags" :key="tag" size="small" color="blue">{{ tag }}</a-tag>
                          </div>
                        </div>
                      </div>
                      <div class="material-actions">
                        <a-button type="link" size="small" @click="handlePreviewMaterial(item)">
                          <a-icon type="eye" />预览
                        </a-button>
                        <a-button type="link" size="small" @click="handleDownloadMaterial(item)">
                          <a-icon type="download" />下载
                        </a-button>
                        <a-popconfirm
                          title="确定要删除该素材吗？"
                          ok-text="确定"
                          cancel-text="取消"
                          @confirm="handleDeleteMaterial(item)"
                        >
                          <a-button type="link" size="small" style="color: #ff4d4f">
                            <a-icon type="delete" />删除
                          </a-button>
                        </a-popconfirm>
                      </div>
                    </a-card>
                  </a-col>
                </a-row>
              </div>
              
              <div class="pagination">
                <a-pagination
                  v-model="pagination.current"
                  :total="pagination.total"
                  :page-size="pagination.pageSize"
                  :show-total="total => `共 ${total} 个素材`"
                  @change="handlePageChange"
                />
              </div>
            </a-spin>
          </a-tab-pane>
          <a-tab-pane key="public" tab="公共素材">
            <a-spin :spinning="loading">
              <div class="material-grid">
                <a-row :gutter="16">
                  <a-col :span="6" v-for="item in publicMaterialList" :key="item.id">
                    <a-card hoverable class="material-card">
                      <div class="material-card-content">
                        <div class="material-image" v-if="item.type === 'image'">
                          <img :src="item.url" alt="素材图片" />
                        </div>
                        <div class="material-file" v-else>
                          <a-icon 
                            :type="getFileIconType(item.type)" 
                            :style="{ color: getFileIconColor(item.type) }" 
                            class="file-icon" 
                          />
                        </div>
                        <div class="material-info">
                          <h4 class="material-name">{{ item.name }}</h4>
                          <div class="material-meta">
                            <a-tag>{{ item.category }}</a-tag>
                            <span class="file-size">{{ item.fileSize }}</span>
                          </div>
                          <div class="material-tags" v-if="item.tags && item.tags.length">
                            <a-tag v-for="tag in item.tags" :key="tag" size="small" color="blue">{{ tag }}</a-tag>
                          </div>
                        </div>
                      </div>
                      <div class="material-actions">
                        <a-button type="link" size="small" @click="handlePreviewMaterial(item)">
                          <a-icon type="eye" />预览
                        </a-button>
                        <a-button type="link" size="small" @click="handleDownloadMaterial(item)">
                          <a-icon type="download" />下载
                        </a-button>
                      </div>
                    </a-card>
                  </a-col>
                </a-row>
              </div>
              
              <div class="pagination">
                <a-pagination
                  v-model="publicPagination.current"
                  :total="publicPagination.total"
                  :page-size="publicPagination.pageSize"
                  :show-total="total => `共 ${total} 个素材`"
                  @change="handlePublicPageChange"
                />
              </div>
            </a-spin>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-card>
    
    <!-- 上传素材对话框 -->
    <a-modal
      title="上传素材"
      :visible="showUploadModal"
      :footer="null"
      @cancel="showUploadModal = false"
      width="600px"
    >
      <a-form-model
        ref="uploadForm"
        :model="uploadForm"
        :rules="uploadRules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 20 }"
      >
        <a-form-model-item label="素材名称" prop="name">
          <a-input 
            v-model="uploadForm.name"
            placeholder="请输入素材名称"
          />
        </a-form-model-item>
        
        <a-form-model-item label="素材分类" prop="category">
          <a-select
            v-model="uploadForm.category"
            placeholder="请选择素材分类"
          >
            <a-select-option value="图表">图表</a-select-option>
            <a-select-option value="图片">图片</a-select-option>
            <a-select-option value="数据">数据</a-select-option>
            <a-select-option value="文档">文档</a-select-option>
          </a-select>
        </a-form-model-item>
        
        <a-form-model-item label="素材标签">
          <a-select
            v-model="uploadForm.tags"
            placeholder="请选择标签"
            mode="multiple"
            :maxTagCount="3"
            :maxTagTextLength="4"
          >
            <a-select-option value="财务">财务</a-select-option>
            <a-select-option value="市场">市场</a-select-option>
            <a-select-option value="产品">产品</a-select-option>
            <a-select-option value="研发">研发</a-select-option>
            <a-select-option value="重要">重要</a-select-option>
            <a-select-option value="参考">参考</a-select-option>
          </a-select>
        </a-form-model-item>
        
        <a-form-model-item label="素材描述">
          <a-textarea
            v-model="uploadForm.description"
            :rows="2"
            placeholder="请输入素材描述"
          />
        </a-form-model-item>
        
        <a-form-model-item label="上传文件" prop="file">
          <a-upload
            :file-list="fileList"
            :before-upload="beforeUpload"
            :remove="handleRemove"
            name="file"
            :multiple="false"
            action=""
            :customRequest="dummyRequest"
          >
            <a-button>
              <a-icon type="upload" /> 选择文件
            </a-button>
            <div class="upload-hint">
              支持上传jpg、png、pdf、xls、xlsx等格式文件，单个文件不超过10MB
            </div>
          </a-upload>
        </a-form-model-item>
        
        <a-form-model-item :wrapper-col="{ span: 20, offset: 4 }">
          <a-button type="primary" :loading="uploading" @click="handleSubmitUpload">
            {{ uploading ? '上传中...' : '上传' }}
          </a-button>
          <a-button style="margin-left: 10px" @click="showUploadModal = false">
            取消
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
    
    <!-- 预览素材对话框 -->
    <a-modal
      :title="previewMaterial.name"
      :visible="showPreviewModal"
      :footer="null"
      @cancel="showPreviewModal = false"
      width="800px"
    >
      <div class="preview-container">
        <div v-if="previewMaterial.type === 'image'" class="image-preview">
          <img :src="previewMaterial.url" alt="素材预览" />
        </div>
        <div v-else-if="previewMaterial.type === 'pdf'" class="pdf-preview">
          <div class="pdf-embed">
            <a-empty description="PDF预览不可用，请下载后查看" />
          </div>
        </div>
        <div v-else class="file-preview">
          <a-empty :description="`${getFileTypeName(previewMaterial.type)}预览不可用，请下载后查看`" />
        </div>
      </div>
      <div class="preview-footer">
        <a-button type="primary" @click="handleDownloadMaterial(previewMaterial)">
          <a-icon type="download" />下载
        </a-button>
        <a-button style="margin-left: 10px" @click="showPreviewModal = false">
          关闭
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<script>
export default {
  name: 'MaterialList',
  data() {
    return {
      loading: false,
      uploading: false,
      activeTab: 'my',
      queryParams: {
        name: '',
        type: undefined,
        category: undefined,
        tags: [],
        page: 1,
        pageSize: 12
      },
      pagination: {
        current: 1,
        pageSize: 12,
        total: 0
      },
      publicPagination: {
        current: 1,
        pageSize: 12,
        total: 0
      },
      materialList: [],
      publicMaterialList: [],
      showUploadModal: false,
      showPreviewModal: false,
      uploadForm: {
        name: '',
        category: undefined,
        description: '',
        tags: [],
        file: null
      },
      uploadRules: {
        name: [
          { required: true, message: '请输入素材名称', trigger: 'blur' },
          { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择素材分类', trigger: 'change' }
        ],
        file: [
          { required: true, message: '请上传文件', trigger: 'change' }
        ]
      },
      fileList: [],
      previewMaterial: {
        id: null,
        name: '',
        type: '',
        url: ''
      }
    };
  },
  mounted() {
    this.fetchMaterialList();
  },
  methods: {
    fetchMaterialList() {
      this.loading = true;
      
      // 模拟获取素材列表数据
      setTimeout(() => {
        // 我的素材
        this.materialList = [
          {
            id: 1,
            name: '企业发展历程图',
            type: 'image',
            category: '图表',
            fileSize: '256KB',
            url: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
            createTime: '2023-05-15 14:27:38',
            tags: ['产品', '重要']
          },
          {
            id: 2,
            name: '行业研究数据集',
            type: 'excel',
            category: '数据',
            fileSize: '1.2MB',
            url: '/uploads/materials/industry_data.xlsx',
            createTime: '2023-05-20 09:33:54',
            tags: ['市场', '研发']
          },
          {
            id: 3,
            name: '产品宣传图集',
            type: 'image',
            category: '图片',
            fileSize: '3.5MB',
            url: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
            createTime: '2023-06-01 11:22:33',
            tags: ['产品']
          },
          {
            id: 4,
            name: '市场分析报告参考',
            type: 'pdf',
            category: '文档',
            fileSize: '2.8MB',
            url: '/uploads/materials/market_analysis_ref.pdf',
            createTime: '2023-06-05 16:42:15',
            tags: ['市场', '财务', '重要']
          }
        ];
        
        // 公共素材
        this.publicMaterialList = [
          {
            id: 101,
            name: '行业通用图表集',
            type: 'image',
            category: '图表',
            fileSize: '5.6MB',
            url: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
            createTime: '2023-04-10 09:12:34',
            tags: ['市场', '参考']
          },
          {
            id: 102,
            name: '专业术语词典',
            type: 'pdf',
            category: '文档',
            fileSize: '1.8MB',
            url: '/uploads/public/terminology.pdf',
            createTime: '2023-04-12 14:25:16',
            tags: ['参考']
          }
        ];
        
        this.pagination.total = this.materialList.length;
        this.publicPagination.total = this.publicMaterialList.length;
        this.loading = false;
      }, 500);
    },
    handleSearch() {
      this.pagination.current = 1;
      this.fetchMaterialList();
    },
    handleReset() {
      this.queryParams = {
        name: '',
        type: undefined,
        category: undefined,
        tags: [],
        page: 1,
        pageSize: 12
      };
      this.fetchMaterialList();
    },
    handleTabChange(activeKey) {
      this.activeTab = activeKey;
    },
    handlePageChange(page) {
      this.pagination.current = page;
      this.queryParams.page = page;
      this.fetchMaterialList();
    },
    handlePublicPageChange(page) {
      this.publicPagination.current = page;
      this.fetchMaterialList();
    },
    handleUploadMaterial() {
      this.showUploadModal = true;
      this.uploadForm = {
        name: '',
        category: undefined,
        description: '',
        tags: [],
        file: null
      };
      this.fileList = [];
    },
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                      file.type === 'application/vnd.ms-excel';
      
      const isValidType = isImage || isPdf || isExcel;
      
      if (!isValidType) {
        this.$message.error('只能上传图片、PDF或Excel文件!');
        return false;
      }
      
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        this.$message.error('文件大小不能超过10MB!');
        return false;
      }
      
      this.fileList = [file];
      this.uploadForm.file = file;
      
      // 自动设置素材类型
      if (isImage) {
        if(!this.uploadForm.category) {
          this.uploadForm.category = '图片';
        }
      } else if (isExcel) {
        if(!this.uploadForm.category) {
          this.uploadForm.category = '数据';
        }
      } else if (isPdf) {
        if(!this.uploadForm.category) {
          this.uploadForm.category = '文档';
        }
      }
      
      // 如果没有填写名称，使用文件名
      if (!this.uploadForm.name) {
        this.uploadForm.name = file.name.split('.')[0];
      }
      
      return false;
    },
    handleRemove() {
      this.fileList = [];
      this.uploadForm.file = null;
      return true;
    },
    dummyRequest({ file, onSuccess }) {
      setTimeout(() => {
        onSuccess('ok');
      }, 0);
    },
    handleSubmitUpload() {
      this.$refs.uploadForm.validate(valid => {
        if (valid) {
          this.uploading = true;
          
          // 模拟上传请求
          setTimeout(() => {
            // 添加到列表
            const fileType = this.getFileType(this.uploadForm.file);
            const newMaterial = {
              id: Math.floor(Math.random() * 1000) + 10,
              name: this.uploadForm.name,
              type: fileType,
              category: this.uploadForm.category,
              fileSize: this.formatFileSize(this.uploadForm.file.size),
              url: URL.createObjectURL(this.uploadForm.file),
              createTime: new Date().toLocaleString(),
              tags: this.uploadForm.tags || []
            };
            
            this.materialList.unshift(newMaterial);
            this.pagination.total = this.materialList.length;
            
            this.uploading = false;
            this.showUploadModal = false;
            this.$message.success('上传成功!');
          }, 1500);
        }
      });
    },
    handlePreviewMaterial(material) {
      this.previewMaterial = material;
      this.showPreviewModal = true;
    },
    handleDownloadMaterial(material) {
      // 模拟下载操作
      this.$message.success(`开始下载: ${material.name}`);
    },
    handleDeleteMaterial(material) {
      // 模拟删除操作
      this.materialList = this.materialList.filter(item => item.id !== material.id);
      this.pagination.total = this.materialList.length;
      this.$message.success(`删除成功: ${material.name}`);
    },
    getFileType(file) {
      const type = file.type;
      if (type.startsWith('image/')) {
        return 'image';
      } else if (type === 'application/pdf') {
        return 'pdf';
      } else if (type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                type === 'application/vnd.ms-excel') {
        return 'excel';
      }
      return 'file';
    },
    getFileIconType(type) {
      switch (type) {
        case 'excel':
          return 'file-excel';
        case 'pdf':
          return 'file-pdf';
        default:
          return 'file';
      }
    },
    getFileIconColor(type) {
      switch (type) {
        case 'excel':
          return '#52c41a';
        case 'pdf':
          return '#f5222d';
        default:
          return '#1890ff';
      }
    },
    getFileTypeName(type) {
      switch (type) {
        case 'excel':
          return 'Excel文件';
        case 'pdf':
          return 'PDF文件';
        case 'image':
          return '图片';
        default:
          return '文件';
      }
    },
    formatFileSize(bytes) {
      if (bytes < 1024) {
        return bytes + 'B';
      } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(0) + 'KB';
      } else {
        return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
      }
    }
  }
};
</script>

<style lang="less" scoped>
.material-list-container {
  .table-operations {
    margin-bottom: 16px;
  }
  
  .table-search {
    margin-bottom: 16px;
  }
  
  .material-tabs {
    margin-top: 16px;
  }
  
  .material-grid {
    margin-bottom: 16px;
  }
  
  .material-card {
    margin-bottom: 16px;
    
    .material-card-content {
      height: 160px;
      display: flex;
      flex-direction: column;
      
      .material-image {
        height: 110px;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .material-file {
        height: 110px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f9f9f9;
        
        .file-icon {
          font-size: 48px;
        }
      }
      
      .material-info {
        padding: 8px 0;
        
        .material-name {
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .material-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .file-size {
            color: rgba(0, 0, 0, 0.45);
            font-size: 12px;
          }
        }
        
        .material-tags {
          margin-top: 4px;
          display: flex;
          flex-wrap: wrap;
          
          .ant-tag {
            margin-right: 4px;
            margin-bottom: 4px;
            font-size: 11px;
            line-height: 16px;
            height: 18px;
          }
        }
      }
    }
    
    .material-actions {
      border-top: 1px solid #f0f0f0;
      padding-top: 8px;
      display: flex;
      justify-content: space-around;
    }
  }
  
  .pagination {
    text-align: right;
    margin-top: 16px;
  }
  
  .upload-hint {
    color: rgba(0, 0, 0, 0.45);
    margin-top: 8px;
  }
  
  .preview-container {
    max-height: 500px;
    overflow: auto;
    
    .image-preview {
      text-align: center;
      
      img {
        max-width: 100%;
        max-height: 450px;
      }
    }
    
    .pdf-preview {
      height: 450px;
      
      .pdf-embed {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
    
    .file-preview {
      height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  
  .preview-footer {
    margin-top: 16px;
    text-align: center;
  }
}
</style> 