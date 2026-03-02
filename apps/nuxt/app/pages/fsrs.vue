<script setup lang="tsx">
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'

const baseStore = useBaseStore()
const { fsrsData } = storeToRefs(baseStore)

// 将 fsrsData 转换为数组
const fsrsList = computed(() => {
  return Object.entries(fsrsData.value).map(([word, card]: [string, any]) => ({
    word,
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review,
  }))
})
</script>

<template>
  <div class="fsrs-page">
    <h2>FSRS 数据</h2>
    <p>共 {{ fsrsList.length }} 条记录</p>
    
    <div class="table-container">
      <table v-if="fsrsList.length > 0">
        <thead>
          <tr>
            <th>单词</th>
            <th>到期日期</th>
            <th>记忆稳定性</th>
            <th>难度</th>
            <th>经过天数</th>
            <th>计划间隔</th>
            <th>学习步骤</th>
            <th>复习次数</th>
            <th>遗忘次数</th>
            <th>状态</th>
            <th>最近复习</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in fsrsList" :key="item.word">
            <td>{{ item.word }}</td>
            <td>{{ item.due ? dayjs(item.due).format('YYYY-MM-DD HH:mm') : '-' }}</td>
            <td>{{ item.stability }}</td>
            <td>{{ item.difficulty }}</td>
            <td>{{ item.elapsed_days }}</td>
            <td>{{ item.scheduled_days }}</td>
            <td>{{ item.learning_steps }}</td>
            <td>{{ item.reps }}</td>
            <td>{{ item.lapses }}</td>
            <td>{{ item.state }}</td>
            <td>{{ item.last_review ? dayjs(item.last_review).format('YYYY-MM-DD HH:mm') : '-' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty">暂无数据</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fsrs-page {
  padding: 20px;
  
  h2 {
    margin-bottom: 10px;
  }
  
  p {
    margin-bottom: 20px;
    color: #666;
  }
}

.table-container {
  overflow-x: auto;
  
  table {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
      white-space: nowrap;
    }
    
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    
    tr:hover {
      background-color: #f9f9f9;
    }
  }
}

.empty {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>
