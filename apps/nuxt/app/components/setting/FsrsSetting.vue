<script setup lang="ts">

import InputNumber from "@/components/base/InputNumber.vue";
import SettingItem from "@/components/setting/SettingItem.vue";
import { useSettingStore } from "@/stores/setting.ts";
const settingStore = useSettingStore()

</script>

<template>
    <SettingItem :title="$t('enable_fsrs')" :desc="$t('enable_fsrs_desc')">
        <Switch v-model="settingStore.enableFSRS" />
    </SettingItem>

    <div class="line mt-4 mb-4"></div>

    {{ $t('fsrs_limit_desc') }}

    <div class="line mt-4 mb-4"></div>

    <SettingItem :title="$t('fsrs_easy_limit')">
        {{ $t('less_or_equals') }}
        <InputNumber :min="0" :max="settingStore.fsrsGoodLimit" v-model="settingStore.fsrsEasyLimit" />
        {{ $t('times') }}
        {{ $t('wrong') }}
    </SettingItem>
    <SettingItem :title="$t('fsrs_good_limit')">
        {{ $t('less_or_equals') }}
        <InputNumber :min="settingStore.fsrsEasyLimit" :max="settingStore.fsrsHardLimit" v-model="settingStore.fsrsGoodLimit" />
        {{ $t('times') }}
        {{ $t('wrong') }}
    </SettingItem>
    <SettingItem :title="$t('fsrs_hard_limit')">
        {{ $t('less_or_equals') }}
        <InputNumber :min="settingStore.fsrsGoodLimit" :max="10" v-model="settingStore.fsrsHardLimit" />
        {{ $t('times') }}
        {{ $t('wrong') }}
    </SettingItem>
</template>

<style scoped lang="scss"></style>
