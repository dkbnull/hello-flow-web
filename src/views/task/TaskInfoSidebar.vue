<template>
  <SectionCard title="任务信息" :icon="InfoFilled">
    <div class="info-list">
      <div class="info-row">
        <div class="info-label">
          <el-icon>
            <User />
          </el-icon>
          创建人
        </div>
        <div class="info-value">{{ task.reporterName || '-' }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">
          <el-icon>
            <Cpu />
          </el-icon>
          开发工程师
        </div>
        <div class="info-value">{{ task.developerName || '-' }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">
          <el-icon>
            <Monitor />
          </el-icon>
          测试工程师
        </div>
        <div class="info-value">{{ task.testerName || '-' }}</div>
      </div>
      <el-divider style="margin: 8px 0" />
      <div class="info-row">
        <div class="info-label">
          <el-icon>
            <PriceTag />
          </el-icon>
          类型
        </div>
        <div class="info-value">
          <el-tag :type="TASK_TYPE_MAP[task.type]?.tagType || 'info'" size="small">
            {{ TASK_TYPE_MAP[task.type]?.label || '未知' }}
          </el-tag>
        </div>
      </div>
      <div class="info-row">
        <div class="info-label">
          <el-icon>
            <Flag />
          </el-icon>
          优先级
        </div>
        <div class="info-value">
          <span :style="{ color: TASK_PRIORITY_MAP[task.priority]?.color, fontWeight: 500 }">
            {{ TASK_PRIORITY_MAP[task.priority]?.label || '未知' }}
          </span>
        </div>
      </div>
      <div class="info-row">
        <div class="info-label">
          <el-icon>
            <Collection />
          </el-icon>
          所属迭代
        </div>
        <div class="info-value">{{ task.sprintName || '-' }}</div>
      </div>
      <div v-if="task.moduleName" class="info-row">
        <div class="info-label">
          <el-icon>
            <Grid />
          </el-icon>
          模块
        </div>
        <div class="info-value">{{ task.moduleName }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">
          <el-icon>
            <Timer />
          </el-icon>
          开始日期
        </div>
        <div class="info-value">{{ task.startDate || '-' }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">
          <el-icon>
            <Calendar />
          </el-icon>
          截止日期
        </div>
        <div class="info-value" :class="{ overdue: isOverdue }">{{ task.dueDate || '-' }}</div>
      </div>
      <div v-if="task.tags?.length" class="info-row">
        <div class="info-label">
          <el-icon>
            <PriceTag />
          </el-icon>
          标签
        </div>
        <div class="info-value">
          <el-tag v-for="tag in task.tags" :key="tag.id" size="small" class="tag-item">{{ tag.name }}</el-tag>
        </div>
      </div>
      <!-- 缺陷特有字段 -->
      <template v-if="isBug">
        <el-divider style="margin: 8px 0" />
        <div v-if="task.defectType != null" class="info-row">
          <div class="info-label">
            <el-icon>
              <Warning />
            </el-icon>
            缺陷类型
          </div>
          <div class="info-value">
            <el-tag :type="DEFECT_TYPE_MAP[task.defectType]?.tagType || 'info'" size="small">
              {{ DEFECT_TYPE_MAP[task.defectType]?.label || '未知' }}
            </el-tag>
          </div>
        </div>
        <div v-if="task.reproductionProbability != null" class="info-row">
          <div class="info-label">
            <el-icon>
              <Refresh />
            </el-icon>
            复现概率
          </div>
          <div class="info-value">
            {{ REPRODUCTION_PROBABILITY_MAP[task.reproductionProbability]?.label || '未知' }}
          </div>
        </div>
        <div v-if="affectedVersionNames.length" class="info-row">
          <div class="info-label">
            <el-icon>
              <Document />
            </el-icon>
            影响版本
          </div>
          <div class="info-value">
            <el-tag v-for="name in affectedVersionNames" :key="name" size="small" class="tag-item">{{ name }}</el-tag>
          </div>
        </div>
      </template>
      <el-divider style="margin: 8px 0" />
      <div class="info-row">
        <div class="info-label">
          <el-icon>
            <Clock />
          </el-icon>
          创建时间
        </div>
        <div class="info-value">{{ task.createdAt }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">
          <el-icon>
            <RefreshRight />
          </el-icon>
          更新时间
        </div>
        <div class="info-value">{{ task.updatedAt }}</div>
      </div>
    </div>
  </SectionCard>
</template>

<script setup>
import { computed } from 'vue'
import {
  DEFECT_TYPE_MAP,
  REPRODUCTION_PROBABILITY_MAP,
  TASK_PRIORITY_MAP,
  TASK_TYPE,
  TASK_TYPE_MAP
} from '@/utils/constants'
import { useTaskStatus } from '@/composables/useTaskStatus'
import {
  Calendar,
  Clock,
  Collection,
  Cpu,
  Document,
  Flag,
  Grid,
  InfoFilled,
  Monitor,
  PriceTag,
  Refresh,
  RefreshRight,
  Timer,
  User,
  Warning
} from '@element-plus/icons-vue'
import SectionCard from '@/components/common/SectionCard.vue'

const props = defineProps({
  task: { type: Object, required: true }
})

const { isOverdue: checkOverdue } = useTaskStatus()

const isOverdue = computed(() => checkOverdue(props.task))
const isBug = computed(() => props.task.type === TASK_TYPE.BUG)

// 影响版本名称列表
const affectedVersionNames = computed(() => {
  if (!props.task.affectedVersions?.length) return []
  return props.task.affectedVersions.map(v => v.name).filter(Boolean)
})
</script>

<style scoped>
.info-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--hf-text-secondary);
  flex-shrink: 0;
}

.info-label .el-icon {
  font-size: 14px;
}

.info-value {
  font-size: 14px;
  color: var(--hf-text-primary);
  text-align: right;
  word-break: break-all;
}

.info-value.overdue {
  color: var(--hf-danger);
  font-weight: 500;
}

.tag-item {
  margin-right: 4px;
  margin-bottom: 2px;
}
</style>
