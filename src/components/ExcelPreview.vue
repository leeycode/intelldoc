<template>
  <div class="excel-preview" style="height:600px;">
    <div class="loading-overlay" v-if="loading">
      <div class="loading-content">
        <a-spin tip="正在加载Excel文件..." />
      </div>
    </div>
    <div ref="xspreadsheet" class="x-spreadsheet-container" style="height:100%;"></div>
  </div>
</template>

<script>
import XLSX from 'xlsx';
import Spreadsheet from 'x-data-spreadsheet';
import zhCN from 'x-data-spreadsheet/dist/locale/zh-cn';
import 'x-data-spreadsheet/dist/xspreadsheet.css';

// 设置中文本地化
Spreadsheet.locale('zh-cn', zhCN);

export default {
  name: 'ExcelPreview',
  props: {
    src: {
      type: [String, ArrayBuffer],
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: true,
      spreadsheet: null,
      isDestroyed: false
    };
  },
  watch: {
    src: {
      immediate: true,
      handler: 'handleSrcChange'
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.isDestroyed) {
        this.initSpreadsheet();
      }
    });
  },
  beforeDestroy() {
    this.isDestroyed = true;
    this.cleanup();
  },
  methods: {
    cleanup() {
      if (this.spreadsheet) {
        try {
          // 清理spreadsheet实例
          if (typeof this.spreadsheet.destroy === 'function') {
            this.spreadsheet.destroy();
          }
        } catch (error) {
          console.warn('清理spreadsheet时出错:', error);
        }
        this.spreadsheet = null;
      }
      
      // 清理DOM
      if (this.$refs.xspreadsheet) {
        this.$refs.xspreadsheet.innerHTML = '';
      }
    },

    handleSrcChange() {
      if (this.src && !this.isDestroyed) {
        this.loadExcel();
      }
    },

    initSpreadsheet() {
      if (this.isDestroyed) return;

      try {
        // 清理之前的实例
        this.cleanup();

        // 确保DOM元素存在
        if (!this.$refs.xspreadsheet) {
          console.error('spreadsheet容器元素不存在');
          return;
        }

        // 创建新的spreadsheet实例
        const options = {
          mode: 'read', // 只读模式
          showToolbar: false,
          showGrid: true,
          showContextmenu: false,
          showBottomBar: true, // 显示底部工作表标签
          view: {
            height: () => this.$refs.xspreadsheet?.clientHeight || 500,
            width: () => this.$refs.xspreadsheet?.clientWidth || 800,
          },
          row: {
            len: 1000, // 增加行数
            height: 25,
          },
          col: {
            len: 26,
            width: 100,
            indexWidth: 60,
            minWidth: 60,
          },
          ...this.options
        };

        this.spreadsheet = new Spreadsheet(this.$refs.xspreadsheet, options);

        // 如果有数据源就加载
        if (this.src) {
          this.loadExcel();
        } else {
          this.loading = false;
        }

      } catch (error) {
        console.error('初始化spreadsheet失败:', error);
        this.loading = false;
        this.$emit('error', error);
      }
    },

    async loadExcel() {
      if (!this.src || this.isDestroyed) return;
      
      this.loading = true;
      
      try {
        let arrayBuffer;
        
        if (typeof this.src === 'string') {
          // 处理URL或文件路径
          console.log('正在读取文件:', this.src);
          
          // 如果是相对路径，尝试多种方式读取
          if (this.src.startsWith('/') || this.src.includes('public/')) {
            try {
              // 尝试直接使用文件名
              const fileName = this.src.split('/').pop();
              console.log('尝试读取文件名:', fileName);
              const fileData = await window.fs.readFile(fileName);
              arrayBuffer = fileData.buffer ? fileData.buffer : fileData;
            } catch (fsError) {
              console.log('文件系统读取失败，尝试HTTP方式:', fsError.message);
              // 回退到HTTP方式
              const response = await fetch(this.src);
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }
              arrayBuffer = await response.arrayBuffer();
            }
          } else {
            // HTTP URL
            const response = await fetch(this.src);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            arrayBuffer = await response.arrayBuffer();
          }
        } else if (this.src instanceof ArrayBuffer) {
          arrayBuffer = this.src;
        } else if (this.src instanceof File || this.src instanceof Blob) {
          arrayBuffer = await this.src.arrayBuffer();
        } else {
          throw new Error('不支持的数据源类型');
        }

        console.log('文件读取成功，大小:', arrayBuffer.byteLength, 'bytes');

        // 读取Excel文件 - 使用最兼容的方式
        let workbook;
        try {
          // 尝试最基础的读取方式
          workbook = XLSX.read(new Uint8Array(arrayBuffer), { 
            type: 'array'
          });
          console.log('XLSX读取成功');
        } catch (xlsxError) {
          console.error('XLSX基础读取失败:', xlsxError);
          throw new Error(`Excel文件解析失败: ${xlsxError.message}`);
        }

        // 验证工作簿结构
        console.log('工作簿结构:', {
          sheetNames: workbook.SheetNames,
          sheetCount: workbook.SheetNames ? workbook.SheetNames.length : 0,
          hasSheets: !!workbook.Sheets,
          sheetsType: typeof workbook.Sheets
        });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('Excel文件中没有找到工作表');
        }
        
        // 检查Sheets对象
        if (!workbook.Sheets) {
          console.error('工作簿详细信息:', workbook);
          throw new Error('Excel文件格式不正确，无法读取工作表数据');
        }

        // 验证第一个工作表是否可访问
        const firstSheetName = workbook.SheetNames[0];
        const firstSheet = workbook.Sheets[firstSheetName];
        if (!firstSheet) {
          console.error('第一个工作表访问失败:', firstSheetName);
          console.error('可用的工作表keys:', Object.keys(workbook.Sheets));
          throw new Error(`无法访问工作表 "${firstSheetName}"`);
        }

        console.log('工作表验证成功，开始数据转换');

        // 转换数据格式
        const spreadsheetData = this.convertWorkbookToXSpreadsheet(workbook);
        
        // 确保spreadsheet已经初始化
        if (!this.spreadsheet && !this.isDestroyed) {
          await this.$nextTick();
          this.initSpreadsheet();
        }

        if (this.spreadsheet && !this.isDestroyed) {
          // 加载数据 - 修复这里的数据格式
          console.log('加载数据到spreadsheet');
          this.spreadsheet.loadData(spreadsheetData);
          
          // 强制重新渲染
          this.$nextTick(() => {
            if (this.spreadsheet && !this.isDestroyed) {
              try {
                this.spreadsheet.reRender();
                console.log('渲染完成');
              } catch (error) {
                console.warn('重新渲染时出错:', error);
              }
            }
          });
        }
        
        this.loading = false;
        this.$emit('rendered', spreadsheetData);
        
      } catch (error) {
        console.error('Excel加载失败:', error);
        this.$emit('error', error);
        this.loading = false;
      }
    },

    convertWorkbookToXSpreadsheet(workbook) {
      try {
        // x-data-spreadsheet 需要特定的数据格式
        const sheets = [];
        
        console.log('开始转换工作簿，工作表数量:', workbook.SheetNames.length);
        
        // 处理所有工作表
        workbook.SheetNames.forEach((sheetName, index) => {
          console.log(`正在处理工作表 ${index + 1}/${workbook.SheetNames.length}: ${sheetName}`);
          
          // 安全访问工作表
          const worksheet = workbook.Sheets[sheetName];
          
          if (!worksheet) {
            console.warn(`工作表 ${sheetName} 不存在或无法访问`);
            return;
          }

          const sheetData = {
            name: sheetName,
            freeze: 'A1',
            styles: [],
            merges: [],
            rows: {},
            cols: {}
          };

          // 获取工作表范围
          const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : null;
          
          if (!range) {
            console.warn(`工作表 ${sheetName} 没有数据范围，创建空工作表`);
            sheets.push(sheetData);
            return;
          }

          console.log(`工作表 ${sheetName} 数据范围: ${worksheet['!ref']}`);

          // 设置默认列宽
          for (let c = range.s.c; c <= range.e.c; c++) {
            sheetData.cols[c] = { width: 100 };
          }

          // 处理合并单元格
          if (worksheet['!merges']) {
            worksheet['!merges'].forEach(merge => {
              sheetData.merges.push([
                merge.s.r, merge.s.c, merge.e.r, merge.e.c
              ]);
            });
          }

          // 转换单元格数据
          let cellCount = 0;
          for (let r = range.s.r; r <= range.e.r; r++) {
            // 初始化行数据
            if (!sheetData.rows[r]) {
              sheetData.rows[r] = {
                cells: {}
              };
            }

            for (let c = range.s.c; c <= range.e.c; c++) {
              const cellAddress = XLSX.utils.encode_cell({ r, c });
              const cell = worksheet[cellAddress];
              
              if (cell && (cell.v !== undefined || cell.w !== undefined)) {
                const cellData = this.convertCell(cell);
                if (cellData !== null) {
                  sheetData.rows[r].cells[c] = cellData;
                  cellCount++;
                }
              }
            }
          }

          console.log(`工作表 ${sheetName} 转换完成，单元格数量: ${cellCount}`);
          sheets.push(sheetData);
        });

        console.log('所有工作表转换完成，工作表数量:', sheets.length);
        
        // 返回符合 x-data-spreadsheet 格式的数据
        return sheets.length === 1 ? sheets[0] : sheets;
        
      } catch (error) {
        console.error('数据转换失败:', error);
        throw new Error(`数据转换失败: ${error.message}`);
      }
    },

    convertCell(cell) {
      if (!cell || (cell.v === undefined && cell.w === undefined && cell.f === undefined)) {
        return null;
      }

      const cellData = {};
      
      // 处理单元格值 - 简化处理逻辑
      if (cell.f) {
        // 公式
        cellData.text = cell.w || String(cell.v || '');
      } else if (cell.w !== undefined) {
        // 格式化后的值
        cellData.text = String(cell.w);
      } else if (cell.v !== undefined) {
        // 原始值
        if (cell.t === 'n') {
          // 数字
          cellData.text = String(cell.v);
        } else if (cell.t === 'd') {
          // 日期
          cellData.text = cell.v instanceof Date ? 
            cell.v.toLocaleDateString('zh-CN') : String(cell.v);
        } else if (cell.t === 'b') {
          // 布尔值
          cellData.text = cell.v ? 'TRUE' : 'FALSE';
        } else {
          // 字符串或其他
          cellData.text = String(cell.v);
        }
      } else {
        cellData.text = '';
      }

      // 确保文本不为空
      if (!cellData.text && cellData.text !== '0') {
        cellData.text = '';
      }

      return cellData;
    }
  }
};
</script>

<style scoped>
.excel-preview {
  width: 100%;
  height: 100%;
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.x-spreadsheet-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
}

/* 确保x-spreadsheet正确显示 */
.x-spreadsheet-container :deep(.x-spreadsheet) {
  height: 100% !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.x-spreadsheet-container :deep(.x-spreadsheet-sheet) {
  height: calc(100% - 40px) !important;
}

.x-spreadsheet-container :deep(.x-spreadsheet-bottombar) {
  border-top: 1px solid #e0e0e0;
  background-color: #fafafa;
}

/* 修复可能的样式冲突 */
.x-spreadsheet-container :deep(.x-spreadsheet-table) {
  font-size: 13px;
}

.x-spreadsheet-container :deep(.x-spreadsheet-cell) {
  border-color: #e0e0e0;
}

/* 确保单元格内容可见 */
.x-spreadsheet-container :deep(.x-spreadsheet-cell-text) {
  color: #333;
  line-height: 1.4;
}
</style>