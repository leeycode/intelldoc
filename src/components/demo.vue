<template>
  <div>
    <ExcelPreview 
      :src="excelUrl" 

    />
  </div>
</template>

<script>
import ExcelPreview from './ExcelPreview.vue'

export default {
  name: 'Demo',
  components: {
    ExcelPreview
  },
  data() {
    return {
      // 可替换为实际的Excel文件URL或base64
      excelUrl: '/static/docs/财务分析报表.xlsx'
    }
  }
}
</script>