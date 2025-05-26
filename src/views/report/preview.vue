<template>
  <div class="report-preview-container">
    <a-page-header
      title="报告预览"
      sub-title="查看并导出生成的报告"
      @back="() => $router.go(-1)"
    >
      <template slot="extra">
        <a-button style="margin-left: 8px" @click="downloadReport">
          <a-icon type="download" />导出
        </a-button>
        <a-button style="margin-left: 8px" @click="reviewReport">
          <a-icon type="safety" />内容审核
        </a-button>
      </template>
    </a-page-header>
    
    <div class="preview-content">
      <a-tabs defaultActiveKey="preview" class="preview-tabs">
        <a-tab-pane key="preview" tab="预览">
          <div class="document-preview">
            <div v-if="reportType === 'word'" class="document-word">
              <div class="document-page">
                <div class="document-header">
                  <h1 class="document-title">{{ reportData.title }}</h1>
                  <div class="document-meta">
                    <p><strong>作者：</strong>{{ reportData.author }}</p>
                    <p><strong>日期：</strong>{{ reportData.date }}</p>
                  </div>
                </div>
                
                <div class="document-body">
                  <h2>1. 摘要</h2>
                  <p>{{ reportData.summary }}</p>
                  
                  <h2>2. 行业运行情况</h2>
                  <h3>2.1. 行业定义</h3>
                  <p>{{ reportData.industryDefinition }}</p>
                  
                  <h3>2.2. 行业的市场需求趋势</h3>
                  <p>{{ reportData.marketTrend }}</p>
                  
                  <div class="chart-placeholder">
                    <div class="chart-caption">图1：市场规模趋势图</div>
                  </div>
                  
                  <h3>2.3. 行业的盈利能力</h3>
                  <p>{{ reportData.profitability }}</p>
                  
                  <div class="chart-placeholder">
                    <div class="chart-caption">图2：行业利润率分析</div>
                  </div>
                  
                  <h2>3. 行业运行特点</h2>
                  <h3>3.1. 主要产品或服务</h3>
                  <p>{{ reportData.mainProducts }}</p>
                  
                  <h3>3.2. 行业的主要驱动因素</h3>
                  <p>{{ reportData.drivingFactors }}</p>
                  
                  <h2>4. 行业周期性</h2>
                  <p>{{ reportData.cyclicality }}</p>
                  
                  <h2>5. 行业政策</h2>
                  <p>{{ reportData.policies }}</p>
                  
                  <h2>6. 未来发展前景</h2>
                  <p>{{ reportData.future }}</p>
                </div>
              </div>
            </div>
            
            <div v-else-if="reportType === 'excel'" class="document-excel">
              <div class="excel-sheet">
                <a-table
                  :columns="excelColumns"
                  :data-source="excelData"
                  :pagination="false"
                  size="small"
                  bordered
                />
              </div>
            </div>
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="audit" tab="审核信息">
          <div class="audit-container">
            <a-result
              status="success"
              title="内容审核已通过"
              sub-title="报告内容符合规范，未发现问题"
            >
              <template #extra>
                <a-button type="primary" @click="checkAgain">
                  重新检查
                </a-button>
              </template>
            </a-result>
            
            <a-divider />
            
            <h3>审核详情</h3>
            <a-descriptions bordered>
              <a-descriptions-item label="审核时间">
                2023-06-15 09:18:33
              </a-descriptions-item>
              <a-descriptions-item label="审核人">
                系统自动
              </a-descriptions-item>
              <a-descriptions-item label="审核状态">
                <a-badge status="success" text="通过" />
              </a-descriptions-item>
              <a-descriptions-item label="内容规范性">
                <a-rate :value="4.5" :disabled="true" allowHalf />
              </a-descriptions-item>
              <a-descriptions-item label="结构完整性">
                <a-rate :value="5" :disabled="true" />
              </a-descriptions-item>
              <a-descriptions-item label="专业准确性">
                <a-rate :value="4" :disabled="true" />
              </a-descriptions-item>
            </a-descriptions>
            
            <h3 style="margin-top: 24px">审核检查项</h3>
            <a-table
              :columns="auditColumns"
              :data-source="auditItems"
              :pagination="false"
            />
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportPreview',
  data() {
    return {
      reportType: 'word', // 'word' 或 'excel'
      reportData: {
        title: '2023年度行业分析报告',
        author: '张三',
        date: '2023-06-15',
        summary: '本报告对行业现状和未来发展趋势进行了深入分析，为企业战略制定提供参考依据。',
        industryDefinition: '本行业主要从事......的研发、生产和销售，是国民经济的重要组成部分。',
        marketTrend: '近年来，市场规模持续扩大，年均增长率保持在15%以上，预计未来5年将保持稳定增长态势。',
        profitability: '行业整体利润率呈现上升趋势，龙头企业毛利率普遍在30%以上，中小企业受原材料价格波动影响较大。',
        mainProducts: '行业主要产品包括......，服务对象主要为大型企业和政府机构。',
        drivingFactors: '技术创新、政策支持和消费升级是推动行业发展的三大关键因素。',
        cyclicality: '行业呈现一定的周期性特征，与宏观经济走势相关性较强，但受季节性因素影响较小。',
        policies: '近年来，国家出台了一系列支持政策，包括税收优惠、研发补贴等，为行业发展创造了良好的政策环境。',
        future: '随着技术进步和应用场景拓展，行业将迎来新一轮增长机遇，预计到2025年市场规模将达到X亿元。'
      },
      excelColumns: [
        { title: '指标', dataIndex: 'metric', key: 'metric', width: 200 },
        { title: '2020年', dataIndex: 'year2020', key: 'year2020' },
        { title: '2021年', dataIndex: 'year2021', key: 'year2021' },
        { title: '2022年', dataIndex: 'year2022', key: 'year2022' },
        { title: '2023年(预测)', dataIndex: 'year2023', key: 'year2023' },
        { title: '年复合增长率', dataIndex: 'cagr', key: 'cagr' }
      ],
      excelData: [
        {
          key: '1',
          metric: '市场规模(亿元)',
          year2020: '356.8',
          year2021: '415.2',
          year2022: '478.5',
          year2023: '550.3',
          cagr: '15.6%'
        },
        {
          key: '2',
          metric: '企业数量(家)',
          year2020: '1,256',
          year2021: '1,358',
          year2022: '1,452',
          year2023: '1,550',
          cagr: '7.3%'
        },
        {
          key: '3',
          metric: '从业人数(万人)',
          year2020: '28.5',
          year2021: '32.1',
          year2022: '35.6',
          year2023: '39.2',
          cagr: '11.2%'
        },
        {
          key: '4',
          metric: '研发投入(亿元)',
          year2020: '42.3',
          year2021: '53.8',
          year2022: '67.2',
          year2023: '82.5',
          cagr: '24.9%'
        },
        {
          key: '5',
          metric: '平均利润率(%)',
          year2020: '12.5',
          year2021: '15.2',
          year2022: '16.8',
          year2023: '17.5',
          cagr: '11.9%'
        }
      ],
      auditColumns: [
        { title: '检查项', dataIndex: 'item', key: 'item' },
        { title: '状态', dataIndex: 'status', key: 'status', 
          scopedSlots: { customRender: 'status' },
          width: 120
        },
        { title: '说明', dataIndex: 'description', key: 'description' }
      ],
      auditItems: [
        {
          key: '1',
          item: '行业定义准确性',
          status: 'success',
          description: '行业定义清晰准确，符合行业规范'
        },
        {
          key: '2',
          item: '数据来源可靠性',
          status: 'success',
          description: '数据来源可靠，引用规范'
        },
        {
          key: '3',
          item: '内容结构完整性',
          status: 'success',
          description: '报告结构完整，各部分衔接自然'
        },
        {
          key: '4',
          item: '文字表述规范性',
          status: 'success',
          description: '文字表述规范，无明显错误'
        },
        {
          key: '5',
          item: '观点论证充分性',
          status: 'warning',
          description: '部分观点论证可以更加充分'
        }
      ]
    };
  },
  created() {
    // 根据路由参数确定报告类型
    const { id } = this.$route.params;
    if (id === 'excel-demo') {
      this.reportType = 'excel';
    }
  },
  methods: {
    downloadReport() {
      this.$message.success('报告下载已开始');
    },
    reviewReport() {
      this.$message.info('正在重新审核内容...');
      setTimeout(() => {
        this.$message.success('内容审核通过，未发现问题');
      }, 2000);
    },
    checkAgain() {
      this.$message.loading({ content: '正在重新检查...', key: 'checking' });
      
      setTimeout(() => {
        this.$message.success({ content: '检查完成，报告内容符合规范', key: 'checking' });
      }, 2000);
    }
  }
};
</script>

<style lang="less" scoped>
.report-preview-container {
  .preview-content {
    margin-top: 24px;
  }
  
  .preview-tabs {
    background-color: #fff;
    padding: 24px;
  }
  
  .document-preview {
    max-width: 100%;
    overflow-x: auto;
  }
  
  .document-word {
    .document-page {
      width: 794px; // A4 width in px
      min-height: 1123px; // A4 height in px
      margin: 0 auto;
      padding: 72px;
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      
      .document-header {
        margin-bottom: 48px;
        text-align: center;
        
        .document-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 24px;
        }
        
        .document-meta {
          color: rgba(0, 0, 0, 0.65);
        }
      }
      
      .document-body {
        h2 {
          font-size: 18px;
          font-weight: bold;
          margin: 24px 0 16px;
        }
        
        h3 {
          font-size: 16px;
          font-weight: bold;
          margin: 16px 0 12px;
        }
        
        p {
          margin-bottom: 16px;
          line-height: 1.7;
        }
        
        .chart-placeholder {
          height: 200px;
          background-color: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 16px 0;
          border: 1px dashed #d9d9d9;
          
          .chart-caption {
            color: rgba(0, 0, 0, 0.45);
          }
        }
      }
    }
  }
  
  .document-excel {
    padding: 24px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .audit-container {
    padding: 24px;
  }
}
</style> 