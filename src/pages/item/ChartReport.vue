<template>
    <q-page class="q-pa-md">
        <!-- Item Dashboard Header Card -->
        <Header :title="t('item.dashboardTitle')" :subtitle="t('item.chartTitle')" icon="bar_chart" icon-size="3rem"
            icon-color="amber">

        </Header>

        <q-card class="chart-card q-mt-md" style="max-width: 962px; margin: auto;">
            <q-card-section class="chart-header">
                <div class="text-h6 text-weight-bold text-primary">
                    <q-icon name="bar_chart" size="sm" class="q-mr-sm" />
                    {{ t('item.topSold.chartTitle') }}
                </div>
                <div class="text-caption text-grey-6">
                    {{ t('item.topSold.chartSubtitle', { count: topSoldItems.length }) }}
                </div>
            </q-card-section>

            <q-card-section class="chart-container">
                <!-- Loading State -->
                <div v-if="itemStore.loading" class="q-mt-md clear-card" style="max-width: 962px; margin: auto;">
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
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
    Chart,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    BarController
} from 'chart.js'
import { useItemStore } from 'src/stores/itemStore'

// Register components globally
Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, BarController)

const canvas = ref(null)

// declarations
const { t } = useI18n()
const itemStore = useItemStore()

// variables

// Computed properties
const topSoldItems = computed(() => itemStore.topSoldItems)

// Fetch data when component is mounted
onMounted(async () => {
    // Fetch top sold items from the store
    await itemStore.fetchTopSoldItems()

    new Chart(canvas.value as any, {
        type: 'bar',
        data: {
            labels: topSoldItems.value.map(i => i.name),
            datasets: [
                {
                    label: t('item.topSold.unitSold'),
                    data: topSoldItems.value.map(i => i.total_sold_quantity),
                    backgroundColor: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E6BAFF', '#FFB3E6', '#FFE5CC', '#D4F1F4', '#F8BBD9']
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                // legend: {
                //     position: 'top'
                // },
                title: {
                    display: false,
                    text: 'Monthly Sales'
                }
            }
        }
    })
})
</script>

<style lang="scss" scoped>
.chart-card {
    padding: 20px;
    background: #eaeaea;
    border-radius: 10px;
    box-shadow: -4px 4px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    border: 2px solid transparent;
    transition: all 0.3s ease;

    &:hover {
        box-shadow: -6px 6px 18px rgba(0, 0, 0, 0.3);
        transform: translate(-2px, 2px);
        border: 2px solid #63a3ec85;
    }
}

.clear-card {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}
</style>
