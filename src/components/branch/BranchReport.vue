<template>
    <div class="branch-report-container">
        <!-- Access Denied for Non-Admins -->
        <div v-if="!isAdmin" class="access-denied">
            <q-card class="text-center q-pa-lg">
                <q-card-section>
                    <q-icon name="lock" size="4rem" color="negative" />
                    <div class="text-h5 q-mt-md text-negative">
                        {{ t('common.accessDenied', 'Access Denied') }}
                    </div>
                    <div class="text-body1 q-mt-sm text-grey-6">
                        {{ t('branchReport.adminOnly', 'Only administrators can view branch reports') }}
                    </div>
                </q-card-section>
            </q-card>
        </div>

        <!-- Report Content for Admins -->
        <div v-else>
            <!-- Report Summary Cards -->
            <div v-if="summary" class="summary-cards q-mb-md">
                <q-card class="summary-card">
                    <q-card-section class="text-center">
                        <q-icon name="inventory_2" size="2rem" color="primary" />
                        <div class="text-h6 q-mt-sm">{{ summary.total_items }}</div>
                        <div class="text-caption text-grey-6">{{ t('branchReport.totalItems') }}</div>
                    </q-card-section>
                </q-card>

                <q-card class="summary-card">
                    <q-card-section class="text-center">
                        <q-icon name="trending_up" size="2rem" color="positive" />
                        <div class="text-h6 q-mt-sm">{{ formatNumber(summary.total_quantity) }}</div>
                        <div class="text-caption text-grey-6">{{ t('branchReport.totalQuantity') }}</div>
                    </q-card-section>
                </q-card>

                <q-card class="summary-card">
                    <q-card-section class="text-center">
                        <q-icon name="attach_money" size="2rem" color="warning" />
                        <div class="text-h6 q-mt-sm">{{ formatCurrency(summary.total_value) }}</div>
                        <div class="text-caption text-grey-6">{{ t('branchReport.totalValue') }}</div>
                    </q-card-section>
                </q-card>

                <q-card class="summary-card">
                    <q-card-section class="text-center">
                        <q-icon name="bookmark" size="2rem" color="info" />
                        <div class="text-h6 q-mt-sm">{{ formatNumber(summary.total_reservations) }}</div>
                        <div class="text-caption text-grey-6">{{ t('branchReport.totalReservations') }}</div>
                    </q-card-section>
                </q-card>
            </div>

            <!-- Data Table -->
            <QtableB :columns="columns" :rows="reportItems" :loading="loading" :menuItems="getMenuItems"
                :hasExpandableRows="false" show-bottom :pagination="pagination" @page-change="handlePageChange"
                @menu-action="handleAction" :top-right-title="t('branchReport.exportCSV')"
                :top-right-icon="'file_download'" @top-right-action="exportReportAsCSV"
                :top-right-secondary-title="t('branchReport.exportPDF')" :top-right-secondary-icon="'picture_as_pdf'"
                @top-right-secondary-action="exportReportAsPDF">
                <!-- Custom slot for quantity with progress bar -->
                <template #body-cell-total_quantity="props">
                    <q-td :props="props">
                        <div class="quantity-cell">
                            <span class="quantity-text">{{ formatNumber(parseInt(props.value || '0')) }}</span>
                            <q-linear-progress v-if="maxQuantity > 0"
                                :value="parseInt(props.value || '0') / maxQuantity" color="primary" track-color="grey-3"
                                size="4px" class="quantity-progress q-mt-xs" />
                        </div>
                    </q-td>
                </template>

                <!-- Custom slot for reservations -->
                <template #body-cell-total_reservations="props">
                    <q-td :props="props">
                        <q-badge :color="parseInt(props.value || '0') > 0 ? 'warning' : 'grey-5'"
                            :label="formatNumber(parseInt(props.value || '0'))" />
                    </q-td>
                </template>

                <!-- Custom slot for unit cost -->
                <template #body-cell-unit_cost="props">
                    <q-td :props="props">
                        <div class="text-weight-medium">
                            {{ formatCurrency(props.value) }}
                        </div>
                    </q-td>
                </template>

                <!-- Custom slot for solo unit price -->
                <template #body-cell-solo_unit_price="props">
                    <q-td :props="props">
                        <div class="text-weight-medium text-positive">
                            {{ formatCurrency(props.value) }}
                        </div>
                    </q-td>
                </template>

                <!-- Custom slot for bulk unit price -->
                <template #body-cell-bulk_unit_price="props">
                    <q-td :props="props">
                        <div class="text-weight-medium text-secondary">
                            {{ formatCurrency(props.value) }}
                        </div>
                    </q-td>
                </template>
            </QtableB>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBranchReportStore } from 'src/stores/branchReportStore';
import { useMeStore } from 'src/stores/meStore';
import QtableB from 'src/components/common/Qtable.vue';
import { formatCurrency } from 'src/composables/useFormat';
import type { MenuItem } from 'src/types';
import type { Branch } from 'src/types/branch';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
    branch: Branch | null;
}

const props = defineProps<Props>();
const { t } = useI18n();
const branchReportStore = useBranchReportStore();
const meStore = useMeStore();

// Admin check - only admins can access reports
const isAdmin = computed(() => meStore.me?.type === 'admin');

// Computed properties
const reportItems = computed(() => branchReportStore.reportItems);
const summary = computed(() => branchReportStore.summary);
const loading = computed(() => branchReportStore.loading);
const pagination = computed(() => branchReportStore.pagination);

// Helper function to format numbers
const formatNumber = (value: any): string => {
    if (value === undefined || value === null) return '0';

    if (typeof value === "string") {
        value = value.replace(/[^\d.-]/g, "");
        value = parseFloat(value);
    }
    if (isNaN(value)) return "";

    const num = value.toLocaleString();

    return num
};

// Calculate max quantity for progress bars
const maxQuantity = computed(() => {
    if (!reportItems.value.length) return 0;
    return Math.max(...reportItems.value.map(item => parseInt(item.total_quantity || '0')));
});

// Table columns
const columns = computed(() => [
    {
        name: 'index',
        label: '#',
        field: (_row: any, index: number) => index + 1,
        align: 'center' as const,
        sortable: false,
        style: 'width: 50px'
    },
    {
        name: 'name',
        label: t('branchReport.columns.itemName'),
        field: 'name',
        align: 'left' as const,
        sortable: true
    },
    {
        name: 'total_quantity',
        label: t('branchReport.columns.quantity'),
        field: 'total_quantity',
        align: 'center' as const,
        sortable: true,
        format: (val: any) => formatNumber(val)
    },
    {
        name: 'total_reservations',
        label: t('branchReport.columns.reservations'),
        field: 'total_reservations',
        align: 'center' as const,
        sortable: true,
        format: (val: string) => formatNumber(parseInt(val || '0'))
    },
    {
        name: 'unit_cost',
        label: t('branchReport.columns.unitCost'),
        field: 'unit_cost',
        align: 'center' as const,
        sortable: true,
        format: (val: number) => formatCurrency(val || 0)
    },
    {
        name: 'solo_unit_price',
        label: t('branchReport.columns.soloPrice'),
        field: 'solo_unit_price',
        align: 'center' as const,
        sortable: true,
        format: (val: number) => formatCurrency(val || 0)
    },
    {
        name: 'bulk_unit_price',
        label: t('branchReport.columns.bulkPrice'),
        field: 'bulk_unit_price',
        align: 'center' as const,
        sortable: true,
        format: (val: number) => formatCurrency(val || 0)
    },
    // {
    //     name: 'packet_units',
    //     label: t('branchReport.columns.packetUnits'),
    //     field: 'packet_units',
    //     align: 'center' as const,
    //     sortable: true,
    //     format: (val: number) => formatNumber(val || 0)
    // },
    // {
    //     name: 'package_units',
    //     label: t('branchReport.columns.packageUnits'),
    //     field: 'package_units',
    //     align: 'center' as const,
    //     sortable: true,
    //     format: (val: number) => formatNumber(val || 0)
    // },
    {
        name: 'actions',
        label: t('common.actions'),
        field: 'actions',
        align: 'center' as const,
        sortable: false
    }
]);

// Menu items for actions
const getMenuItems = (): MenuItem[] => [
    {
        label: t('branchReport.actions.viewDetails'),
        icon: 'visibility',
        value: 'view'
    },
    {
        label: t('branchReport.actions.exportItem'),
        icon: 'file_download',
        value: 'export'
    }
];

// Event handlers
const handlePageChange = async (page: number) => {
    if (props.branch?.id) {
        await branchReportStore.fetchBranchReport(props.branch.id, page);
    }
};

const handleAction = (payload: { item: MenuItem; rowId: string | number }) => {
    const item = reportItems.value.find(report => report.item_id === Number(payload.rowId));
    if (!item) return;

    switch (payload.item.value) {
        case 'view':
            // Handle view details
            console.log('View item details:', item);
            break;
        case 'export':
            // Handle export single item
            console.log('Export item:', item);
            break;
    }
};

const exportReportAsCSV = () => {
    // Handle full report export as CSV
    const rows = reportItems?.value;

    if (!rows || !rows.length) return;

    const separator = ",";
    const keys = Object.keys(rows[0] || {});

    const csvContent =
        keys.join(separator) +
        "\n" +
        rows
            .map(row =>
                keys
                    .map(k => {
                        let cell = row[k] === null || row[k] === undefined ? "" : row[k];
                        cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
                        return `"${cell}"`;
                    })
                    .join(separator)
            )
            .join("\n");

    // Add UTF-8 BOM
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `ڕاپۆرتی کاڵاکان لە کۆگاکانی لقی ${props.branch?.name || 'branch_report'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Helper functions for RTL text processing
const cleanTextForPDF = (text: string): string => {
    return text.replace(/[\u200E\u200F\u202A-\u202E]/g, '');
};

const prepareRTLText = (text: string): string => {
    // Simple text reversal for RTL - works for basic Arabic text
    return text.split('').reverse().join('');
};

// Use built-in fonts with Unicode support
const setupPDFForArabic = (doc: jsPDF) => {
    // Use helvetica which has better Unicode support
    doc.setFont("helvetica", "normal");
};

// Not wupporting Arabic Characters. I must be fixed later
const exportReportAsPDF = () => {
    const rows = reportItems?.value;
    if (!rows || !rows.length) return;

    try {
        const doc = new jsPDF();

        // Setup PDF for Arabic text with built-in fonts
        setupPDFForArabic(doc);
        doc.setFontSize(16);

        // Title
        const title = cleanTextForPDF(`${t('branchReport.title')} - ${props.branch?.name || ''}`);
        const rtlTitle = prepareRTLText(title);
        doc.text(rtlTitle, 200, 20, { align: "right" });

        // Summary
        let startY = 40;
        if (summary.value) {
            doc.setFontSize(12);

            const summaryItems = [
                cleanTextForPDF(`${t('branchReport.totalItems')}: ${summary.value.total_items}`),
                cleanTextForPDF(`${t('branchReport.totalQuantity')}: ${formatNumber(summary.value.total_quantity)}`),
                cleanTextForPDF(`${t('branchReport.totalValue')}: ${formatCurrency(summary.value.total_value)}`),
                cleanTextForPDF(`${t('branchReport.totalReservations')}: ${formatNumber(summary.value.total_reservations)}`)
            ];

            summaryItems.forEach((item, index) => {
                const rtlItem = prepareRTLText(item);
                doc.text(rtlItem, 200, startY + (index * 10), { align: "right" });
            });

            startY = 90;
        }

        // Table headers
        const tableHeaders = [
            t('branchReport.columns.itemName'),
            t('branchReport.columns.quantity'),
            t('branchReport.columns.reservations'),
            t('branchReport.columns.unitCost'),
            t('branchReport.columns.soloPrice'),
            t('branchReport.columns.bulkPrice'),
            t('branchReport.columns.packetUnits'),
            t('branchReport.columns.packageUnits')
        ].map(header => prepareRTLText(cleanTextForPDF(header)));

        // Table rows
        const tableData = rows.map(row => [
            prepareRTLText(cleanTextForPDF(row.name || "")),
            formatNumber(parseInt(row.total_quantity || "0")),
            formatNumber(parseInt(row.total_reservations || "0")),
            formatCurrency(row.unit_cost || 0),
            formatCurrency(row.solo_unit_price || 0),
            formatCurrency(row.bulk_unit_price || 0),
            row.packet_units || "",
            row.package_units || ""
        ]);

        // AutoTable with helvetica font
        autoTable(doc, {
            head: [tableHeaders],
            body: tableData,
            startY: startY,
            styles: {
                font: "helvetica",
                fontSize: 9,
                cellPadding: 3,
                halign: "right", // RTL alignment for body cells
                textColor: [0, 0, 0],
                fillColor: [255, 255, 255]
            },
            headStyles: {
                font: "helvetica",
                fontStyle: "bold",
                fontSize: 10,
                halign: "center",
                fillColor: [63, 81, 181],
                textColor: [255, 255, 255]
            },
            columnStyles: {
                0: { cellWidth: 45, halign: "right" }, // Item name
                1: { cellWidth: 20, halign: "center" },
                2: { cellWidth: 20, halign: "center" },
                3: { cellWidth: 25, halign: "right" },
                4: { cellWidth: 25, halign: "right" },
                5: { cellWidth: 25, halign: "right" },
                6: { cellWidth: 20, halign: "center" },
                7: { cellWidth: 20, halign: "center" }
            },
            tableWidth: "auto",
            margin: { top: 20, right: 14, bottom: 20, left: 14 },
            theme: "striped",
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        });

        // Safe filename
        const safeBranchName = props.branch?.name?.replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '') || 'branch_report';
        const filename = `branch-report-${safeBranchName}-${new Date().toISOString().split('T')[0]}.pdf`;

        doc.save(filename);

    } catch (error) {
        console.error("Error generating PDF:", error);
        alert(t("branchReport.pdfError", "Error generating PDF. Please try again or use CSV export."));
    }
};

// Watchers
watch(() => props.branch?.id, async (newBranchId) => {
    if (newBranchId && isAdmin.value) {
        await branchReportStore.fetchBranchReport(newBranchId);
    } else {
        branchReportStore.clearReport();
    }
}, { immediate: true });

// Lifecycle
onMounted(async () => {
    if (props.branch?.id && isAdmin.value) {
        await branchReportStore.fetchBranchReport(props.branch.id);
    }
});
</script>

<style lang="scss" scoped>
.branch-report-container {
    .access-denied {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;

        .q-card {
            max-width: 400px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
    }

    .summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;

        .summary-card {
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
            transition: all 0.3s ease;
            background: #b3c2e677;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
            background: #b3c2e655;
            }
        }
    }

    .quantity-cell {
        min-width: 80px;

        .quantity-text {
            font-weight: 500;
        }

        .quantity-progress {
            margin-top: 4px;
        }
    }
}

@media (max-width: 768px) {
    .summary-cards {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
