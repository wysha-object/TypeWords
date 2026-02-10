<script setup lang="ts">
import { usePracticeStore } from '~/stores/practice'
import { useSettingStore } from '~/stores/setting'
import type { PracticeData } from '~/types/types'
import BaseIcon from '~/components/BaseIcon.vue'
import SettingDialog from '~/components/setting/SettingDialog.vue'
import BaseButton from '~/components/BaseButton.vue'
import VolumeSettingMiniDialog from '~/components/word/VolumeSettingMiniDialog.vue'
import StageProgress from '~/components/StageProgress.vue'
import { ShortcutKey, WordPracticeMode, WordPracticeStage } from '~/types/enum'
import { WordPracticeModeNameMap, WordPracticeStageNameMap } from '~/config/env'
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()

const statStore = usePracticeStore()
const settingStore = useSettingStore()

defineProps<{
  showEdit?: boolean
  isCollect: boolean
  isSimple: boolean
}>()

const emit = defineEmits<{
  toggleCollect: []
  toggleSimple: []
  edit: []
  skip: []
  skipStep: []
}>()

let practiceData = inject<PracticeData>('practiceData')

function format(val: number, suffix: string = '', check: number = -1) {
  return val === check ? '-' : val + suffix
}

const status = $computed(() => {
  if (settingStore.wordPracticeMode === WordPracticeMode.Free) return $t('free_practice')
  if (practiceData.isTypingWrongWord) return $t('review_wrong_words')
  return statStore.getStageName
})

const stages = $computed(() => {
  let DEFAULT_BAR = {
    name: '',
    ratio: 100,
    percentage: (practiceData.index / practiceData.words.length) * 100,
    active: true,
  }
  if ([WordPracticeMode.Shuffle, WordPracticeMode.Free].includes(settingStore.wordPracticeMode)) {
    return [DEFAULT_BAR]
  } else {
    // 阶段映射：将 WordPracticeStage 映射到 stageIndex 和 childIndex
    const stageMap: Partial<Record<WordPracticeStage, { stageIndex: number; childIndex: number }>> = {
      [WordPracticeStage.FollowWriteNewWord]: { stageIndex: 0, childIndex: 0 },
      [WordPracticeStage.IdentifyNewWord]: { stageIndex: 0, childIndex: 0 },
      [WordPracticeStage.ListenNewWord]: { stageIndex: 0, childIndex: 1 },
      [WordPracticeStage.DictationNewWord]: { stageIndex: 0, childIndex: 2 },
      [WordPracticeStage.IdentifyReview]: { stageIndex: 1, childIndex: 0 },
      [WordPracticeStage.ListenReview]: { stageIndex: 1, childIndex: 1 },
      [WordPracticeStage.DictationReview]: { stageIndex: 1, childIndex: 2 },
      [WordPracticeStage.IdentifyReviewAll]: { stageIndex: 2, childIndex: 0 },
      [WordPracticeStage.ListenReviewAll]: { stageIndex: 2, childIndex: 1 },
      [WordPracticeStage.DictationReviewAll]: { stageIndex: 2, childIndex: 2 },
    }

    // 获取当前阶段的配置
    const currentStageConfig = stageMap[statStore.stage]
    if (!currentStageConfig) {
      return stages
    }

    const { stageIndex, childIndex } = currentStageConfig
    const currentProgress = (practiceData.index / practiceData.words.length) * 100

    if (
      [WordPracticeMode.IdentifyOnly, WordPracticeMode.DictationOnly, WordPracticeMode.ListenOnly].includes(
        settingStore.wordPracticeMode
      )
    ) {
      const stages = [
        {
          name: `新词：${WordPracticeModeNameMap[settingStore.wordPracticeMode]}`,
          ratio: 33,
          percentage: 0,
          active: false,
        },
        {
          name: `上次学习：${WordPracticeModeNameMap[settingStore.wordPracticeMode]}`,
          ratio: 33,
          percentage: 0,
          active: false,
        },
        {
          name: `之前学习：${WordPracticeModeNameMap[settingStore.wordPracticeMode]}`,
          ratio: 33,
          percentage: 0,
          active: false,
        },
      ]

      // 设置已完成阶段的百分比和比例
      for (let i = 0; i < stageIndex; i++) {
        stages[i].percentage = 100
        stages[i].ratio = 33
      }

      // 设置当前激活的阶段
      stages[stageIndex].active = true
      stages[stageIndex].percentage = (practiceData.index / practiceData.words.length) * 100

      return stages
    } else {
      // 阶段配置：定义每个阶段组的基础信息
      const stageConfigs = [
        {
          name: '新词',
          ratio: 70,
          children: [{ name: '新词：跟写' }, { name: '新词：听写' }, { name: '新词：默写' }],
        },
        {
          name: '上次学习：复习',
          ratio: 15,
          children: [{ name: '上次学习：自测' }, { name: '上次学习：听写' }, { name: '上次学习：默写' }],
        },
        {
          name: '之前学习：复习',
          ratio: 15,
          children: [{ name: '之前学习：自测' }, { name: '之前学习：听写' }, { name: '之前学习：默写' }],
        },
      ]

      // 初始化 stages
      const stages = stageConfigs.map(config => ({
        name: config.name,
        percentage: 0,
        ratio: config.ratio,
        active: false,
        children: config.children.map(child => ({
          name: child.name,
          percentage: 0,
          ratio: 33,
          active: false,
        })),
      }))

      // 设置已完成阶段的百分比和比例
      for (let i = 0; i < stageIndex; i++) {
        stages[i].percentage = 100
        stages[i].ratio = 15
      }

      // 设置当前激活的阶段
      stages[stageIndex].ratio = 70
      stages[stageIndex].active = true

      // 根据类型设置子阶段的进度
      const currentStageChildren = stages[stageIndex].children

      if (childIndex === 0) {
        // 跟写/自测：只激活第一个子阶段
        currentStageChildren[0].active = true
        currentStageChildren[0].percentage = currentProgress
      } else if (childIndex === 1) {
        // 听写：第一个完成，第三个未开始，第二个进行中
        currentStageChildren[0].active = false
        currentStageChildren[1].active = true
        currentStageChildren[2].active = false
        currentStageChildren[0].percentage = 100
        currentStageChildren[1].percentage = currentProgress
        currentStageChildren[2].percentage = 0
      } else if (childIndex === 2) {
        // 默写：前两个完成，第三个进行中
        currentStageChildren[0].active = false
        currentStageChildren[1].active = false
        currentStageChildren[2].active = true
        currentStageChildren[0].percentage = 100
        currentStageChildren[1].percentage = 100
        currentStageChildren[2].percentage = currentProgress
      }

      if (settingStore.wordPracticeMode === WordPracticeMode.System) {
        return stages
      }
      if (settingStore.wordPracticeMode === WordPracticeMode.Review) {
        stages.shift()
        if (stageIndex === 1) stages[1].ratio = 30
        if (stageIndex === 2) stages[0].ratio = 30

        console.log('stages', stages, childIndex)

        return stages
      }
    }
  }
  return [DEFAULT_BAR]
})
</script>

<template>
  <div class="footer">
    <div class="bottom">
      <StageProgress :stages="stages" />

      <div class="flex justify-between items-center">
        <div class="stat">
          <div class="row">
            <div class="num">{{ `${practiceData.index + 1}/${practiceData.words.length}` }}</div>
            <div class="line"></div>
            <div class="name">{{ status }}</div>
          </div>
          <div class="row">
            <!--            <div class="num">{{ statStore.spend }}分钟</div>-->
            <div class="num">{{ Math.floor(statStore.spend / 1000 / 60) }}{{ $t('minutes') }}</div>
            <div class="line"></div>
            <div class="name">{{ $t('time') }}</div>
          </div>
          <div class="row">
            <div class="num">{{ statStore.total }}</div>
            <div class="line"></div>
            <div class="name">{{ $t('total_words') }}</div>
          </div>
          <div class="row">
            <div class="num">{{ format(statStore.wrong, '', 0) }}</div>
            <div class="line"></div>
            <div class="name">{{ $t('errors') }}</div>
          </div>
        </div>
        <div class="flex gap-2 justify-center items-center" id="toolbar-icons">
          <SettingDialog type="word" />

          <VolumeSettingMiniDialog />

          <BaseIcon
            v-if="settingStore.wordPracticeMode !== WordPracticeMode.Free"
            @click="emit('skipStep')"
            :title="`${$t('skip_to_next_stage')}:${WordPracticeStageNameMap[statStore.nextStage]}`"
          >
            <IconFluentArrowRight16Regular />
          </BaseIcon>

          <div class="relative z-999 group">
            <div
              class="space-y-2 btn-no-margin pb-2 left-1/2 -transform-translate-x-1/2 absolute z-999 bottom-full scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto"
            >
              <BaseButton size="normal" type="info" class="w-full" @click="$emit('toggleSimple')">
                <div class="flex items-center gap-2">
                  <IconFluentCheckmarkCircle16Regular v-if="!isSimple" />
                  <IconFluentCheckmarkCircle16Filled v-else />
                  <span>
                    {{
                      (!isSimple ? $t('mark_mastered') : $t('unmark_mastered')) +
                      `(${settingStore.shortcutKeyMap[ShortcutKey.ToggleSimple]})`
                    }}</span
                  >
                </div>
              </BaseButton>
              <BaseButton size="normal" type="info" class="w-full" @click="$emit('toggleCollect')">
                <div class="flex items-center gap-2">
                  <IconFluentStarAdd16Regular v-if="!isCollect" />
                  <IconFluentStar16Filled v-else />
                  <span>
                    {{
                      (!isCollect ? $t('collect') : $t('uncollect')) +
                      `(${settingStore.shortcutKeyMap[ShortcutKey.ToggleCollect]})`
                    }}</span
                  >
                </div>
              </BaseButton>
              <BaseButton size="normal" type="info" class="w-full" @click="$emit('skip')">
                <div class="flex items-center gap-2">
                  <IconFluentArrowBounce20Regular class="transform-rotate-180" />
                  <span> {{ $t('skip_word') }}({{ settingStore.shortcutKeyMap[ShortcutKey.Next] }})</span>
                </div>
              </BaseButton>
            </div>

            <BaseIcon>
              <IconPhMicrosoftWordLogoLight />
            </BaseIcon>
          </div>

          <BaseIcon
            @click="settingStore.dictation = !settingStore.dictation"
            :title="`${$t('toggle_dictation_mode')}(${settingStore.shortcutKeyMap[ShortcutKey.ToggleDictation]})`"
          >
            <IconFluentEyeOff16Regular v-if="settingStore.dictation" />
            <IconFluentEye16Regular v-else />
          </BaseIcon>

          <BaseIcon
            :title="`${$t('toggle_translation')}(${settingStore.shortcutKeyMap[ShortcutKey.ToggleShowTranslate]})`"
            @click="settingStore.translate = !settingStore.translate"
          >
            <IconPhTranslate v-if="settingStore.translate" />
            <IconFluentTranslateOff16Regular v-else />
          </BaseIcon>

          <BaseIcon
            @click="settingStore.showPanel = !settingStore.showPanel"
            :title="`${$t('word_list')}(${settingStore.shortcutKeyMap[ShortcutKey.TogglePanel]})`"
          >
            <IconFluentTextListAbcUppercaseLtr20Regular />
          </BaseIcon>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.footer {
  flex-shrink: 0;
  width: var(--toolbar-width);
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 20; // 提高z-index确保在最上方

  &.hide {
    margin-bottom: -6rem;
    margin-top: 3rem;

    .progress-wrap {
      bottom: calc(100% + 1.8rem);
    }
  }

  .bottom {
    @apply relative w-full box-border rounded-lg bg-second shadow-lg z-10 mb-3;
    padding: 0.2rem var(--space) calc(0.4rem + env(safe-area-inset-bottom, 0px)) var(--space);

    .stat {
      @apply flex justify-around gap-[var(--stat-gap)] mt-2;

      .row {
        @apply flex flex-col items-center gap-1 text-gray;

        .line {
          height: 1px;
          width: 100%;
          background: var(--color-sub-gray);
        }
      }
    }
  }

  .progress-wrap {
    width: var(--toolbar-width);
    transition: all 0.3s;
    padding: 0 0.6rem;
    box-sizing: border-box;
    position: fixed;
    bottom: 1rem;
    z-index: 1; // 确保进度条也在最上方
  }

  .arrow {
    position: absolute;
    top: -40%;
    left: 50%;
    cursor: pointer;
    transition: all 0.5s;
    transform: rotate(-90deg);
    padding: 0.5rem;
    font-size: 1.2rem;

    &.down {
      top: -90%;
      transform: rotate(90deg);
    }
  }
}
</style>
