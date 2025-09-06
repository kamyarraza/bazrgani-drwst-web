<template>
    <q-page class="q-pa-md">
        <!-- Item Dashboard Header Card -->
        <Header :title="t('item.dashboardTitle')" :subtitle="t('item.chartTitle')" icon="bar_chart" icon-size="3rem"
            icon-color="amber">

        </Header>

        <q-card class="chart-card q-mt-md" style="max-width: 1048px; margin: auto;">
            <!-- Header & title -->
            <q-card-section class="chart-header">
                <div class="row items-center justify-between full-width">
                    <div class="col">
                        <div class="text-h6 text-weight-bold text-primary">
                            <q-icon name="bar_chart" size="sm" class="q-mr-sm" />
                            {{ t('item.topSold.chartTitle') }}
                        </div>
                        <div class="text-caption text-grey-6">
                            {{ t('item.topSold.chartSubtitle', { count: topSoldItems.length }) }}
                        </div>
                    </div>
                    <div class="col-auto">
                        <q-btn
                            color="positive"
                            icon="download"
                            :label="t('common.export')"
                            rounded
                            outline
                            dense
                            @click="exportChart"
                            :disable="!topSoldChartInstance || itemStore.loading"
                            class="q-px-md"
                        >
                            <q-tooltip>{{ t('report.chart.exportTooltip') }}</q-tooltip>
                        </q-btn>
                    </div>
                </div>
            </q-card-section>

            <!-- Filteration -->
            <q-card-section class="chart-filterations">
                <!-- Chart Type Selection -->
                <q-select v-model="selectedChartType" :options="chartTypesOptions" :label="t('report.chart.ChartType')"
                    outlined dense emit-value map-options option-value="id" option-label="name" class="q-mb-md"
                    style="max-width: 160px; width: 100%;">
                    <template v-slot:prepend>
                        <q-icon
                            :name="chartTypesOptions.find(option => option.id === selectedChartType)?.icon || 'bar_chart'"
                            size="sm" />
                    </template>
                </q-select>

                <!-- Item Count Selection -->
                <q-select v-model="selectedItemCount" :options="itemCountOptions" :label="t('report.chart.ItemCount')"
                    outlined dense emit-value map-options option-value="value" option-label="label" class="q-mb-md"
                    style="max-width: 130px; width: 100%;">
                    <template v-slot:prepend>
                        <q-icon name="format_list_numbered" size="sm" />
                    </template>
                </q-select>

                <!-- Category Selection -->
                <q-select v-model="selectedCategoryId" :options="categoryOptions" :label="t('report.chart.ItemType')"
                    outlined dense clearable emit-value map-options option-value="id" option-label="name"
                    class="q-mb-md" style="max-width: 250px; width: 100%;">
                    <template v-slot:prepend>
                        <q-icon name="category" size="sm" />
                    </template>
                </q-select>

                <!-- Keywords Exclusion Input with Search Button -->
                <div class="row q-gutter-sm q-mb-md" style="width: 100%;">
                    <q-select v-model="excludeKeywords" :options="filteredKeywords" use-input use-chips multiple
                        hide-dropdown-icon input-debounce="300" new-value-mode="add-unique"
                        :new-value-mode-options="{ pushValue: true, createValue: true }"
                        :label="t('report.chart.ExcludeKeywords')" :hint="t('report.chart.ExcludeKeywordsHint')"
                        outlined dense clearable class="col" @filter="filterKeywords" @clear="getTopSoldItems"
                        option-label="name" option-value="sku">

                        <template v-slot:prepend>
                            <q-icon name="search_off" size="sm" />
                        </template>

                        <template v-slot:no-option>
                            <q-item>
                                <q-item-section class="text-grey">
                                    {{ t('report.chart.TypeToAddKeyword') }}
                                </q-item-section>
                            </q-item>
                        </template>

                        <template v-slot:selected-item="scope">
                            <q-chip removable dense color="negative" text-color="white" :tabindex="scope.tabindex"
                                @remove="scope.removeAtIndex(scope.index)">
                                <q-icon name="block" size="xs" class="q-mr-xs" />
                                {{ scope.opt.name || scope.opt }}
                            </q-chip>
                        </template>
                    </q-select>

                    <q-btn color="primary" icon="search" :label="t('common.search')" outlined dense
                        @click="getTopSoldItems" :loading="itemStore.loading" class="col-auto"
                        :disable="(excludeKeywords?.length || 0) === 0" style="height: 40px;">
                    </q-btn>
                </div>
            </q-card-section>

            <hr>

            <q-card-section class="chart-container">
                <!-- Loading State -->
                <div v-if="reportStore.loading" class="q-mt-md clear-card" style="max-width: 1048px; margin: auto;">
                    <q-card class="clear-card">
                        <q-card-section class="text-center q-py-xl clear-card">
                            <q-spinner-bars color="primary" size="3em" class="q-mb-md" />
                            <div class="text-subtitle1 text-grey-6">
                                {{ t('common.loading') }}
                            </div>
                        </q-card-section>
                    </q-card>
                </div>

                <canvas v-else ref="canvas" class="chart-canvas"></canvas>
            </q-card-section>
        </q-card>

    </q-page>
</template>

<script setup lang="ts">
import Header from 'src/components/common/Header.vue'
import { ref, onMounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
    Chart,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    BarController,
    ArcElement,
    DoughnutController,
    RadialLinearScale,
    PolarAreaController,
} from 'chart.js'
import { useItemStore } from 'src/stores/itemStore'
import { useItemCategoryStore } from 'src/stores/itemCategoryStore'
import { useReportStore } from 'src/stores/reportStore'

// Register components globally
Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, BarController, ArcElement, DoughnutController, RadialLinearScale, PolarAreaController);

const canvas = ref(null)

// declarations
const { t } = useI18n()
const itemStore = useItemStore()
const reportStore = useReportStore()
const categoryStore = useItemCategoryStore()

// variables
const cuteChartColors = [
  "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF",
  "#E6CCFF", "#FFD6E0", "#FFF5BA", "#C9E4DE", "#F6DFEB",
  "#D4F0F0", "#FDE2E4", "#E2F0CB", "#B5EAD7", "#C7CEEA",
  "#F1C0E8", "#FFABAB", "#FFC3A0", "#D5AAFF", "#85E3FF",
  "#ACE7FF", "#AFF8DB", "#FFFFD1", "#FF9CEE", "#FFCCF9",
  "#FCC2FF", "#F6A6FF", "#B28DFF", "#C5A3FF", "#A79AFF",
  "#7BCBFF", "#AFCBFF", "#FFEBAF", "#FBFFB9", "#FFDEB4",
  "#FFD6A5", "#FDFFB6", "#CAFFBF", "#9BF6FF", "#A0C4FF",
  "#BDB2FF", "#FFC6FF", "#FFADAD", "#FFDAC1", "#E2F0CB",
  "#C7CEEA", "#FEE1E8", "#FFDFD3", "#E0BBE4", "#957DAD"
];
const topSoldChartInstance = ref<Chart | null>(null);
const selectedCategoryId = ref<number | null>(null);
const selectedChartType = ref<any>('bar');
const selectedItemCount = ref<number>(5);
const excludeKeywords = ref<{ name: string; sku: string; }[]>([]);

/* 
* Computed properties
*/
const topSoldItems = computed(() => reportStore.topSoldItems);
// Category options for the select dropdown
const categoryOptions = computed(() => {
    return categoryStore.itemCategories
});
// Chart type options
const chartTypesOptions = [
    { id: 'bar', name: t('report.chart.Bar'), icon: 'bar_chart' },
    { id: 'doughnut', name: t('report.chart.Doughnut'), icon: 'pie_chart' },
    { id: 'polarArea', name: t('report.chart.PolarArea'), icon: 'radar' },
];
// Item count options
const itemCountOptions = [
    { label: '3', value: 3 },
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '15', value: 15 },
    { label: '20', value: 20 },
    { label: '25', value: 25 },
    { label: '30', value: 30 },
    // { label: '35', value: 35 },
    { label: '40', value: 40 },
    // { label: '45', value: 45 },
    { label: '50', value: 50 },
];
// Set keywords model and update allKeywords to exclude from chart
const allKeywords = computed(() => itemStore.itemNames);

// Functions
const getTopSoldItems = async () => {
    // Join excludeKeywords handling both objects and strings
    const keywordsToExclude = excludeKeywords.value?.map(keyword =>
        typeof keyword === 'string' ? keyword : keyword.name || keyword.sku
    ).join(',') || '';

    // Fetch top sold items from the store
    await reportStore.fetchTopSoldItems(selectedCategoryId.value || null, selectedItemCount.value, keywordsToExclude);

    // Create or update the chart
    createChart();
};

// Generate a filename with current date
const getExportableImageName = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `کاڵاکانی زۆرترین فرۆشتن#${year}-${month}-${day}.png`
}

// Export chart as an image
const exportChart = async () => {
    // Create a temporary link element to trigger download
    const link = document.createElement('a')
    // generate the link
    link.href = topSoldChartInstance.value?.toBase64Image() || '' // convert chart to base64 image
    // set the download attribute with a filename
    link.download = getExportableImageName()
    // Automatically click the link to trigger the download
    await link.click()
    // Clean up the link element
    link.remove()
}

// Allowed types: 'bar', 'doughnut', 'polarArea'
const createChart = () => {
    topSoldChartInstance.value?.destroy();

    topSoldChartInstance.value = new Chart(canvas.value as any, {
        type: selectedChartType.value,
        data: {
            labels: topSoldItems.value.map(i => i.name),
            datasets: [
                {
                    label: t('item.topSold.unitSold'),
                    data: topSoldItems.value.map(i => i.total_sold_quantity),
                    backgroundColor: cuteChartColors,
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                // legend: {
                //     position: 'top'
                // },
                // title: {
                //     display: false,
                //     text: 'Monthly Sales'
                // }
            }
        }
    })
}

// Watch
watch([selectedCategoryId, selectedItemCount], async () => {
    // Fetch top sold items from the store
    await getTopSoldItems();
});
//...
watch(selectedChartType, () => {
    createChart();
});

// filtered options shown in dropdown
const filteredKeywords = ref([...allKeywords.value])

// triggered when typing in the input (search/filter)
const filterKeywords = (val, update) => {
    if (val === '') {
        update(() => {
            filteredKeywords.value = [...allKeywords.value]
        })
        return
    }

    update(() => {
        const needle = val.toLowerCase()
        filteredKeywords.value = allKeywords.value.filter(k =>
            k.name.toLowerCase().includes(needle) || k.sku.toLowerCase().includes(needle)
        )
    })
}

// Fetch data when component is mounted
onMounted(async () => {
    // Fetch all item names for keyword suggestions
    itemStore.fetchItemNames();

    // Load categories for filtering
    if (categoryStore.itemCategories) {
        categoryStore.fetchItemCategories();
    }

    // Fetch top sold items from the store
    await getTopSoldItems();
})
</script>

<style lang="scss" scoped>
.chart-card {
    padding: 40px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 10px;
    box-shadow: -4px 4px 12px rgba(0, 0, 0, 0.2);
    border: 2px solid transparent;
    transition: all 0.4s ease;

    &:hover {
        background: linear-gradient(200deg, #e3f2fd 0%, #f8fafc 30%);
        box-shadow: -6px 6px 18px rgba(0, 0, 0, 0.3);
        transform: translate(-2px, 2px);
        border: 2px solid #63a3ec42;
    }
}

.clear-card {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

.chart-filterations {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
}

.chart-container {
    display: flex;
    justify-content: center;
}
</style>
