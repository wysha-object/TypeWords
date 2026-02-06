<script setup lang="ts">
import BaseIcon from '~/components/BaseIcon.vue'
import Switch from '~/components/base/Switch.vue'
import Select from '~/components/base/select/Select.vue'
import Option from '~/components/base/select/Option.vue'
import MiniDialog from '~/components/dialog/MiniDialog.vue'
import VolumeIcon from '~/components/icon/VolumeIcon.vue'
import { SoundFileOptions } from '~/config/env.ts'
import { useWindowClick } from '~/hooks/event.ts'
import { getAudioFileUrl, usePlayAudio } from '~/hooks/sound.ts'
import { useSettingStore } from '~/stores/setting.ts'
import { emitter, EventKey } from '~/utils/eventBus.ts'

const settingStore = useSettingStore()
let timer = 0
//停止切换事件，因为hover到select时会跳出mini-dialog
let selectIsOpen = false
let show = $ref(false)

useWindowClick(() => {
  if (selectIsOpen) {
    selectIsOpen = false
  } else {
    show = false
  }
})

function toggle(val: boolean) {
  if (selectIsOpen) return
  clearTimeout(timer)
  if (val) {
    emitter.emit(EventKey.closeOther)
    show = val
  } else {
    timer = setTimeout(() => {
      show = val
    }, 100)
  }
}

function selectToggle(e: boolean) {
  //这里要延时设置，因为关闭的时候，如果太早设置了false了，useWindowClick的事件就会把弹框关闭
  setTimeout(() => (selectIsOpen = e))
}

function eventCheck(e) {
  const isSelfOrChild = e.currentTarget.contains(e.target)
  if (isSelfOrChild) {
    //如果下拉框打开的情况就不拦截
    if (selectIsOpen) return
    e.stopPropagation()
  }
}
</script>

<template>
  <div class="setting" @click="eventCheck">
    <BaseIcon @click="toggle(true)">
      <IconFluentMoreHorizontal20Regular class="color-gray-600" />
    </BaseIcon>
    <MiniDialog width="14rem" v-model="show">
      <div class="mini-row">
        <NuxtLink to="/words" class="item-title">单词</NuxtLink>
      </div>
      <div class="mini-row">
        <NuxtLink to="/articles" class="item-title">文章</NuxtLink>
      </div>
      <div class="mini-row">
        <NuxtLink to="/setting" class="item-title">设置</NuxtLink>
      </div>
    </MiniDialog>
  </div>
</template>

<style scoped lang="scss">
.setting {
  position: relative;
}
</style>
