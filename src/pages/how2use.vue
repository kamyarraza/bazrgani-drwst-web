<template>
    <q-page class="q-pa-md">
        <!-- Admin Dashboard Header Card -->
        <Header :title="t('how2use.title')" :subtitle="t('how2use.subtitle')" icon="help_outline" icon-size="3rem"
            icon-color="yellow" background-color="linear-gradient(135deg, #4a90e2 0%, #357abd 100%)" />

        <br>

        <!-- Main Content Area -->
        <div class="q-gutter-y-md" style="max-width: 768px; width: 100%">

            <!-- Step 1 -->
            <q-card v-for="(content, index) in contents" :key="index" flat bordered class="q-pa-md card-container">
                <div class="row items-center no-wrap box-card">
                    <q-icon :name="content.icon" :color="content.iconColor" size="md" class="q-mr-md" />
                    <div>
                        <div class="text-subtitle1 text-weight-bold">{{ content.question }}</div>
                        <div class="text-body2 text-grey-7">
                            {{ content.answer }}
                        </div>
                    </div>
                </div>
            </q-card>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import Header from 'src/components/common/Header.vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
// decleration
const { t } = useI18n()

const contents = ref<Record<string, string>[]>([
    {
        question: 'دەتوانم قەرزی سیستەمە کۆنەکە لێرە تۆماربکەم ؟!',
        answer: 'بەڵێ، دەتوانیت کڕیارەکان قەرزار بکەیت بەو بڕەی کە قەرزارن لە سیستەمە کۆنەکەدا. ئاگاداربە، هەر کڕیارێك یەك جار دەتوانیت قەرزاری بکەیت و دواتر ئەو دەسەڵاتەت نامێنێت، بۆیە تکایە بە درووستی ژمارەکان بنووسە.',
        icon: 'account_balance_wallet',
        iconColor: 'purple'
    },
    {
        question: 'دەتوانم تەواوی قەرزی کڕیار لەگەڵ پسوڵەی کڕینێکی نوێ وەربگرم ؟!',
        answer: 'نەخێر، ناتوانیت تەواوی قەرزی کڕیارەکە لەسەر ئەو وەسڵە نوێیە وەربگریت کە بۆی درووست دەکەیت چونکە پارەدانی پسوڵە نابێت زیاتر وەربگیرێت لە کۆی گشتی پسوڵەکە.',
        icon: 'receipt_long',
        iconColor: 'indigo'
    },
    {
        question: 'چۆن دەتوانم قەرزی کڕیار لەسەر پسوڵەیەك وەربگرم ؟!',
        answer: 'پسوڵە نوێیەکە بە قەرز بۆ کڕیار درووست بکە، پاشان بچۆرە سەر بەشی کڕیارەکان و لەسەر ناوی کڕیارەکە دەتوانیت تەواوی قەرزەکەی وەربگریت و پسوڵەی پارەدانیشی بۆ درووست بکەیت.',
        icon: 'receipt_long',
        iconColor: 'orange'
    },
    {
        question: 'دەتوانم پسوڵەکان نوێ بکەمەوە ؟!',
        answer: 'بەڵێ، هەر پسوڵەیەکی کڕین یاخود فرۆشتنت ئەنجامدا هەتا چوار کاتژمێر دوای درووستکردنی پسوڵەکە یاخود هەتا درووستکردنی پسوڵەیەکی نوێ بۆ هەمان کڕیار دەتوانیت دەستکاری بکەیت. ئەو دوو مەرجە هەر کامێکیان زووتر جێبەجێ بوون پسووڵەکە قوفڵ دەبێت.',
        icon: 'receipt_long',
        iconColor: 'grey'
    },
    {
        question: 'کاڵای کۆگاکەم پێویستی بە ڕێکخستنەوە هەیە !',
        answer: 'پەیوەندی بە یەکێك لە بەرپرسانی سیستەمەکەوە بکە بۆ ئەوەی دەسەڵاتی ڕێکخستنی کۆگاکەت بداتێ، کە دەسەڵاتەکەت وەرگرت کاڵاکانت ڕێك بخەرەوە و هۆکارەکەی بە دیاریکراوی بنووسە بۆچی ئەو جیاوازییە ڕوویداوە.',
        icon: 'inventory_2',
        iconColor: 'pink'
    },
    {
        question: 'دەتوانم داتاکان بسڕمەوە ؟!',
        answer: 'نەخێر، بە هیچ جۆرێك کرداری سڕینەوە لە دەسەڵاتەکانتدا بوونی نییە، بۆیە تکایە بە ووریایی داتاکانت تۆماربکە و هەوڵبدە هەڵەت ئەنجام مەدە.',
        icon: 'inventory_2',
        iconColor: 'yellow-10'
    },
    {
        question: 'چی بکەم ئەگەر هەڵەتێكم ئەنجامدا ؟!',
        answer: 'دەستبەجێ بەرپرسانی سیستەمەکە ئاگادار بکەرەوە بۆ ڕاستکردنەوەی هەڵەتەکەت و وەرگرتنی ڕێککاری تایبەت بە ڕاستکردنەوەی هەڵەتەکە.',
        icon: 'error_outline',
        iconColor: 'red'
    },
    {
        question: 'ئایا ئاگادارییەکان (نۆتیفیکەیشنەکان) گرنگن ؟!',
        answer: 'بەڵێ بە دڵنیاییەوە، زۆر گرنگن و پێویستە بەردەوام تەماشایان بکەیت چونکە دەکرێت هەر ئاگادارییەکی گرنگی تێدابێت سەبارەت بە: کەمبوونەوەی کاڵاکانت، گۆڕانی نرخی دۆلار و یۆرۆ یان ئاگادارکردنەوەیەکی گرنگ لەلایەن بەرپرسانی سیستەمەکەوە.',
        icon: 'notifications',
        iconColor: 'orange'
    },
    {
        question: 'ئایا چاودێریم لەسەرە ؟!',
        answer: 'بەڵێ بە دڵنیاییەوە، هەر کردارێك ئەنجام بدەیت لە سیستەمەکەدا تۆماردەکرێت و دواتر دەتوانرێت تەماشا بکرێت کە چی ئەنجامدراوە و کێ بەرپرسە لێی.',
        icon: 'visibility',
        iconColor: 'brown'
    },
])

</script>

<style lang="scss" scoped>
.card-container, .box-card {
    background: #e9e9e9;
    border-radius: 8px;
    border-width: 2px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.card-container {
    box-shadow: -2px 2px 8px rgba(0, 0, 0, 0.2) !important;

    &:hover {
        background: "#fff";
        box-shadow: -4px 4px 12px rgba(0, 0, 0, 0.3) !important;
        transform: translateY(-2px);
        border-color: #b0b0b0;
    }
}
</style>
