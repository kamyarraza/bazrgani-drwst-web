<template>
  <div class="warehouse-items-container" v-if="selectedWarehouse">
    <!-- Simple Header Section -->
    <div class="q-mb-md">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="text-h6 text-weight-medium">
            <q-icon name="inventory_2" class="q-mr-sm" />
            {{ t('warehouseItem.title', 'Warehouse Items') }}
          </div>
          <div class="text-subtitle2 text-grey-6">
            <b>{{ t('warehouseItem.warehouseName', 'Warehouse') }}: </b>
            <strong>{{ selectedWarehouse.name }}</strong>
            <q-chip color="primary" text-color="white" size="sm" class="q-ml-sm" icon="inventory">
              {{ selectedWarehouse.code || 'N/A' }}
            </q-chip>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="row items-center q-mt-md">
        <div class="col-auto">
          <div class="filter-buttons">
            <q-btn :label="t('warehouseItem.regularItems', 'Regular Items')"
              :color="selectedRelationType === 'items' ? 'primary' : 'grey-5'" :flat="selectedRelationType !== 'items'"
              :icon="selectedRelationType === 'items' ? 'inventory' : 'inventory'" no-caps class="q-mr-sm filter-btn"
              @click="handleRelationTypeChange('items')" />
            <q-btn :label="t('warehouseItem.blumItems', 'Blum Items')"
              :color="selectedRelationType === 'blum_items' ? 'primary' : 'grey-5'"
              :flat="selectedRelationType !== 'blum_items'"
              :icon="selectedRelationType === 'blum_items' ? 'inventory_2' : 'inventory_2'" no-caps class="filter-btn"
              @click="handleRelationTypeChange('blum_items')" />
          </div>
        </div>
        <div class="col">
          <div class="text-caption text-grey-6 q-ml-md">
            {{ t('warehouseItem.filterDescription', 'Switch between regular items and blum items') }}
          </div>
        </div>
      </div>
    </div> <!-- Data Table -->
    <div class="warehouse-items-content">
      <QtableB v-if="hasCurrentItems" show-bottom :columns="currentColumns" :rows="currentItems"
        :loading="warehouseStore.loading" :top-right="false" :menuItems="menuItems"
        :pagination="warehouseStore.pagination" @page-change="handlePageChange" @menu-action="handleAction"
        class="warehouse-items-table" flat bordered>
        <template #body-cell-id="props">
          <q-td :props="props" class="text-center">
            <q-chip color="grey-6" text-color="white" size="sm" square class="id-chip">
              #{{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-name="props">
          <q-td :props="props">
            <div class="item-name-cell">
              <q-icon name="inventory_2" color="primary" size="20px" class="item-icon" />
              <span class="item-name">{{ props.value }}</span>
            </div>
          </q-td>
        </template>

        <template #body-cell-code="props">
          <q-td :props="props">
            <q-chip color="blue-grey" text-color="white" size="sm" class="code-chip">
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-part_no="props">
          <q-td :props="props">
            <q-chip color="indigo" text-color="white" size="sm" class="part-no-chip">
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-unit_cost="props">
          <q-td :props="props" class="text-right">
            <q-badge color="positive" text-color="white" :label="`$${parseFloat(props.value || '0').toFixed(2)}`"
              class="price-badge" />
          </q-td>
        </template>

        <template #body-cell-unit_price="props">
          <q-td :props="props" class="text-right">
            <q-badge color="primary" text-color="white" :label="`$${parseFloat(props.value || '0').toFixed(2)}`"
              class="price-badge" />
          </q-td>
        </template>

        <template #body-cell-solo_unit_price="props">
          <q-td :props="props" class="text-right">
            <q-badge color="primary" text-color="white" :label="`$${parseFloat(props.value || '0').toFixed(2)}`"
              class="price-badge" />
          </q-td>
        </template>

        <template #body-cell-bulk_unit_price="props">
          <q-td :props="props" class="text-right">
            <q-badge color="orange" text-color="white" :label="`$${parseFloat(props.value || '0').toFixed(2)}`"
              class="price-badge" />
          </q-td>
        </template>

        <template #body-cell-quantity="props">
          <q-td :props="props" class="text-center">
            <q-badge :color="props.value > 100 ? 'positive' : props.value > 50 ? 'warning' : 'negative'"
              :label="formatQuantity(props.value)" class="quantity-badge" />
          </q-td>
        </template>

        <template #body-cell-pieces="props">
          <q-td :props="props" class="text-center">
            <q-chip color="teal" text-color="white" size="sm" icon="inventory" class="pieces-chip">
              {{ props.value || 0 }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-reservations="props">
          <q-td :props="props" class="text-center">
            <q-badge color="info" text-color="white" :label="String(props.value || 0)" class="reservations-badge" />
          </q-td>
        </template>

        <template #body-cell-position="props">
          <q-td :props="props" class="text-center">
            <q-chip color="purple" text-color="white" size="sm" icon="place" class="position-chip">
              {{ props.value || 'N/A' }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-volume="props">
          <q-td :props="props" class="text-center">
            <q-chip color="teal" text-color="white" size="sm" icon="straighten" class="volume-chip">
              {{ parseFloat(props.value || 0).toFixed(2) }}%
            </q-chip>
          </q-td>
        </template>

      </QtableB>

      <!-- Loading State -->
      <div class="warehouse-items-loading text-center q-pa-xl" v-else-if="warehouseStore.loading">
        <q-spinner color="primary" size="3rem" />
        <div class="text-subtitle1 q-mt-md">{{ t('common.loading', 'Loading...') }}</div>
      </div>

      <!-- Empty State -->
      <q-card v-else-if="warehouseStore.warehouseItems && !hasCurrentItems" class="no-items-card text-center q-pa-xl">
        <q-icon name="inventory_2" size="5rem" color="grey-4" />
        <div class="text-h6 q-mt-md">{{ t('warehouseItem.noItemsFound', 'No Items Found') }}</div>
        <div class="text-subtitle1 q-mt-sm">
          {{
            selectedRelationType === 'items'
              ? t('warehouseItem.noRegularItems', 'No regular items found in this warehouse')
              : t('warehouseItem.noBlumItems', 'No blum items found in this warehouse')
          }}
        </div>
      </q-card>

      <!-- Fallback Empty State (when warehouseItems is null) -->
      <q-card v-else class="no-items-card text-center q-pa-xl">
        <q-icon name="inventory_2" size="5rem" color="grey-4" />
        <div class="text-h6 q-mt-md">{{ t('warehouseItem.noData', 'No Data Available') }}</div>
        <div class="text-subtitle1 q-mt-sm">
          {{ t('warehouseItem.loadDataFirst', 'Please wait while we load the warehouse items') }}
        </div>
        <q-btn color="primary" icon="refresh" :label="t('common.refresh', 'Refresh')"
          @click="props.selectedWarehouse && loadWarehouseItems(props.selectedWarehouse.id)" class="q-mt-md" />
      </q-card>
    </div>
  </div>
  <div class="warehouse-select-prompt text-center q-pa-xl" v-else>
    <q-icon name="inventory" size="5rem" color="grey-4" />
    <div class="text-h6 q-mt-md">{{ t('warehouseItem.selectWarehouse', 'Select a Warehouse First') }}</div>
    <div class="text-subtitle1 q-mt-sm">
      {{ t('warehouseItem.selectWarehouseDesc', 'Please select a warehouse to view its items') }}
    </div>
    <q-btn color="primary" class="q-mt-md" :icon="goBackIcon" :label="t('common.back', 'Go Back')" @click="goBack" />
  </div>

  <!-- Add Item Modal (placeholder) -->
  <!-- <AddWarehouseItem v-model="showAddItemModal" :warehouse-id="selectedWarehouse?.id" @submit="handleAddSubmit" /> -->

  <!-- View Item Modal -->
  <q-dialog v-model="showViewModal" persistent :maximized="$q.screen.xs" transition-show="slide-up"
    transition-hide="slide-down">
    <q-card class="item-details-modal" :class="{ 'full-screen-mobile': $q.screen.xs }">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          <q-icon name="visibility" class="q-mr-sm" />
          {{ t('warehouseItem.viewItemDetails', 'View Item Details') }}
        </div>
      </q-card-section>

      <q-card-section class="q-pa-none modal-scroll-area">
        <template v-if="selectedItemForView">
          <div class="modal-content-padding">
            <!-- Item Header -->
            <div class="item-header">
              <div class="item-title">{{ selectedItemForView.name }}</div>
              <div class="item-chips">
                <q-chip color="grey-6" text-color="white" size="md" square class="id-chip">
                  <q-icon name="tag" class="q-mr-xs" size="xs" />
                  ID: {{ selectedItemForView.id }}
                </q-chip>
                <q-chip v-if="'code' in selectedItemForView && selectedItemForView.code" color="blue-grey"
                  text-color="white" size="md">
                  <q-icon name="qr_code" class="q-mr-xs" size="xs" />
                  {{ selectedItemForView.code }}
                </q-chip>
                <q-chip v-if="'part_no' in selectedItemForView && selectedItemForView.part_no" color="indigo"
                  text-color="white" size="md">
                  <q-icon name="settings" class="q-mr-xs" size="xs" />
                  {{ selectedItemForView.part_no }}
                </q-chip>
                <q-chip v-if="'position' in selectedItemForView && selectedItemForView.position" color="purple"
                  text-color="white" size="md">
                  <q-icon name="place" class="q-mr-xs" size="xs" />
                  {{ selectedItemForView.position }}
                </q-chip>
              </div>
            </div>

            <!-- Main Content Grid -->
            <div class="main-content-grid">

              <!-- Pricing Information Card -->
              <div class="content-card">
                <q-card flat bordered class="h-full responsive-card">
                  <q-card-section class="bg-positive text-white card-header">
                    <div class="card-title">
                      <q-icon name="attach_money" class="q-mr-sm" />
                      {{ t('warehouseItem.pricingInfo', 'Pricing Information') }}
                    </div>
                  </q-card-section>
                  <q-card-section>
                    <div class="pricing-grid">
                      <!-- Unit Cost -->
                      <div class="pricing-item">
                        <div class="pricing-label">
                          <q-icon name="account_balance_wallet" color="positive" size="sm" />
                          {{ t('warehouseItem.unitCost', 'Unit Cost') }}
                        </div>
                        <div class="pricing-value cost">
                          ${{ parseFloat(selectedItemForView.unit_cost || '0').toFixed(2) }}
                        </div>
                        <div class="pricing-desc">{{ t('warehouseItem.costPerUnit', 'Cost per unit (wholesale)') }}
                        </div>
                      </div>

                      <!-- Solo Unit Price -->
                      <div class="pricing-item" v-if="'solo_unit_price' in selectedItemForView">
                        <div class="pricing-label">
                          <q-icon name="person" color="primary" size="sm" />
                          {{ t('warehouseItem.soloPrice', 'Solo Unit Price') }}
                        </div>
                        <div class="pricing-value solo">
                          ${{ parseFloat(selectedItemForView.solo_unit_price || '0').toFixed(2) }}
                        </div>
                        <div class="pricing-desc">{{ t('warehouseItem.singleUnitPrice', 'Price per single unit') }}
                        </div>
                      </div>

                      <!-- Bulk Unit Price -->
                      <div class="pricing-item" v-if="'bulk_unit_price' in selectedItemForView">
                        <div class="pricing-label">
                          <q-icon name="inventory" color="orange" size="sm" />
                          {{ t('warehouseItem.bulkPrice', 'Bulk Unit Price') }}
                        </div>
                        <div class="pricing-value bulk">
                          ${{ parseFloat(selectedItemForView.bulk_unit_price || '0').toFixed(2) }}
                        </div>
                        <div class="pricing-desc">{{ t('warehouseItem.bulkUnitPrice', 'Price per unit in bulk') }}</div>
                      </div>

                      <!-- Unit Price (for blum items) -->
                      <div class="pricing-item" v-if="'unit_price' in selectedItemForView">
                        <div class="pricing-label">
                          <q-icon name="sell" color="secondary" size="sm" />
                          {{ t('warehouseItem.unitPrice', 'Unit Price') }}
                        </div>
                        <div class="pricing-value unit">
                          ${{ parseFloat(selectedItemForView.unit_price || '0').toFixed(2) }}
                        </div>
                        <div class="pricing-desc">{{ t('warehouseItem.standardPrice', 'Standard selling price') }}</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Stock Overview Card -->
              <div class="content-card">
                <q-card flat bordered class="h-full responsive-card">
                  <q-card-section class="bg-info text-white card-header">
                    <div class="card-title">
                      <q-icon name="inventory_2" class="q-mr-sm" />
                      {{ t('warehouseItem.stockOverview', 'Stock Overview') }}
                    </div>
                  </q-card-section>
                  <q-card-section>
                    <div class="stock-overview">
                      <!-- Total Quantity -->
                      <div class="stock-metric-large">
                        <div class="metric-icon">
                          <q-icon name="inventory" size="2rem" color="primary" />
                        </div>
                        <div class="metric-content">
                          <div class="metric-label">{{ t('warehouseItem.totalUnits', 'Total Units in Stock') }}</div>
                          <div class="metric-value total">{{ (selectedItemForView.quantity || 0).toLocaleString() }}
                          </div>
                          <div class="metric-desc">{{ t('warehouseItem.totalUnitsDesc', 'Base unit quantity') }}</div>
                        </div>
                      </div>

                      <!-- Reserved Units -->
                      <div class="stock-metric" v-if="'reservations' in selectedItemForView">
                        <div class="metric-row">
                          <div class="metric-info">
                            <q-icon name="bookmark" color="warning" size="sm" />
                            <span>{{ t('warehouseItem.reservedUnits', 'Reserved Units') }}</span>
                          </div>
                          <q-badge color="warning" :label="String(selectedItemForView.reservations || 0)" />
                        </div>
                      </div>

                      <!-- Available Units -->
                      <div class="stock-metric">
                        <div class="metric-row highlight">
                          <div class="metric-info">
                            <q-icon name="check_circle" color="positive" size="sm" />
                            <span>{{ t('warehouseItem.availableUnits', 'Available for Sale') }}</span>
                          </div>
                          <q-badge color="positive"
                            :label="String((selectedItemForView.quantity || 0) - ('reservations' in selectedItemForView ? selectedItemForView.reservations || 0 : 0))" />
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Package Configuration Section -->
            <div class="section-spacing"
              v-if="'package_units' in selectedItemForView || 'packet_units' in selectedItemForView">
              <q-card flat bordered>
                <q-card-section class="bg-teal text-white card-header">
                  <div class="card-title">
                    <q-icon name="inventory" class="q-mr-sm" />
                    {{ t('warehouseItem.packageConfiguration', 'Package Configuration') }}
                  </div>
                  <div class="card-subtitle">
                    {{ t('warehouseItem.packageDesc', 'How units are organized into packages and packets') }}
                  </div>
                </q-card-section>
                <q-card-section>
                  <div class="config-grid">
                    <!-- Package Units Configuration -->
                    <div class="config-item" v-if="'package_units' in selectedItemForView">
                      <div class="config-header">
                        <q-icon name="inventory" color="teal" size="lg" />
                        <div>
                          <div class="config-title">{{ t('warehouseItem.packageUnits', 'Package Units') }}</div>
                          <div class="config-value">{{ selectedItemForView.package_units || 0 }}</div>
                        </div>
                      </div>
                      <div class="config-desc">
                        {{ t('warehouseItem.packageUnitsDesc', 'Units per package') }}
                      </div>
                    </div>

                    <!-- Packet Units Configuration -->
                    <div class="config-item" v-if="'packet_units' in selectedItemForView">
                      <div class="config-header">
                        <q-icon name="inventory_2" color="teal" size="lg" />
                        <div>
                          <div class="config-title">{{ t('warehouseItem.packetUnits', 'Packet Units') }}</div>
                          <div class="config-value">{{ selectedItemForView.packet_units || 0 }}</div>
                        </div>
                      </div>
                      <div class="config-desc">
                        {{ t('warehouseItem.packetUnitsDesc', 'Units per packet') }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Current Package Breakdown -->
            <div class="section-spacing"
              v-if="'packages' in selectedItemForView || 'packets' in selectedItemForView || 'pieces' in selectedItemForView">
              <q-card flat bordered>
                <q-card-section class="bg-orange text-white card-header">
                  <div class="card-title">
                    <q-icon name="view_module" class="q-mr-sm" />
                    {{ t('warehouseItem.currentBreakdown', 'Current Stock Breakdown') }}
                  </div>
                  <div class="card-subtitle">
                    {{ t('warehouseItem.breakdownDesc', 'How your total units are currently organized') }}
                  </div>
                </q-card-section>
                <q-card-section>
                  <div class="breakdown-grid">
                    <!-- Packages -->
                    <div class="breakdown-item" v-if="'packages' in selectedItemForView">
                      <div class="breakdown-icon">
                        <q-icon name="inventory" size="2rem" color="orange" />
                      </div>
                      <div class="breakdown-content">
                        <div class="breakdown-value">{{ selectedItemForView.packages || 0 }}</div>
                        <div class="breakdown-label">{{ t('warehouseItem.completePackages', 'Complete Packages') }}
                        </div>
                        <!-- <div class="breakdown-calculation"
                          v-if="'package_units' in selectedItemForView && selectedItemForView.package_units">
                          {{ (selectedItemForView.package_units || 0) }} × {{ Number(selectedItemForView.packet_units) }} =
                          {{ ((selectedItemForView.packages || 0) * Number(selectedItemForView.package_units ||
                            0)).toLocaleString() }} {{ t('warehouseItem.units', 'units') }}
                        </div> -->
                      </div>
                    </div>

                    <!-- Packets -->
                    <div class="breakdown-item" v-if="'packets' in selectedItemForView">
                      <div class="breakdown-icon">
                        <q-icon name="inventory_2" size="2rem" color="orange" />
                      </div>
                      <div class="breakdown-content">
                        <div class="breakdown-value">{{ selectedItemForView.packets || 0 }}</div>
                        <div class="breakdown-label">{{ t('warehouseItem.completePackets', 'Complete Packets') }}</div>
                        <!-- <div class="breakdown-calculation"
                          v-if="'packet_units' in selectedItemForView && selectedItemForView.packet_units">
                          {{ (selectedItemForView.packets || 0) }} × {{ Number(selectedItemForView.packet_units) }} =
                          {{ ((selectedItemForView.packets || 0) * Number(selectedItemForView.packet_units ||
                            0)).toLocaleString() }} {{ t('warehouseItem.units', 'units') }}
                        </div> -->
                      </div>
                    </div>

                    <!-- Pieces (loose units) -->
                    <div class="breakdown-item" v-if="'pieces' in selectedItemForView">
                      <div class="breakdown-icon">
                        <q-icon name="scatter_plot" size="2rem" color="orange" />
                      </div>
                      <div class="breakdown-content">
                        <div class="breakdown-value">{{ selectedItemForView.pieces || 0 }}</div>
                        <div class="breakdown-label">{{ t('warehouseItem.loosePieces', 'Loose Pieces') }}</div>
                        <!-- <div class="breakdown-calculation">
                          {{ t('warehouseItem.individualUnits', 'Individual units not in complete packages/packets') }}
                        </div> -->
                      </div>
                    </div>
                  </div>

                  <!-- Verification Formula -->
                  <!-- <div class="verification-formula"
                    v-if="'packages' in selectedItemForView && 'packets' in selectedItemForView && 'pieces' in selectedItemForView">
                    <q-separator class="q-mb-md" />
                    <div class="formula-header">
                      <q-icon name="calculate" color="primary" />
                      <span class="text-weight-medium">{{ t('warehouseItem.verification', 'Verification') }}</span>
                    </div>
                    <div class="formula-content">
                      <div class="formula-line">
                        <span class="formula-part packages">{{ selectedItemForView.packages || 0 }} packages × {{
                          ('package_units' in selectedItemForView ? Number(selectedItemForView.package_units) : 0)
                        }}</span>
                        <span class="formula-operator">+</span>
                        <span class="formula-part packets">{{ selectedItemForView.packets || 0 }} packets × {{
                          ('packet_units' in selectedItemForView ? Number(selectedItemForView.packet_units) : 0)
                        }}</span>
                        <span class="formula-operator">+</span>
                        <span class="formula-part pieces">{{ selectedItemForView.pieces || 0 }} pieces</span>
                        <span class="formula-operator">=</span>
                        <span class="formula-result">{{ selectedItemForView.quantity || 0 }} total units</span>
                      </div>
                    </div>
                  </div> -->
                </q-card-section>
              </q-card>
            </div>

            <!-- Stock Status Summary -->
            <div class="section-spacing">
              <q-card flat bordered class="status-summary">
                <q-card-section>
                  <div class="status-summary-content">
                    <div class="status-avatar">
                      <q-avatar size="48px" :color="getStockStatusColor(selectedItemForView)" text-color="white">
                        <q-icon :name="getStockStatusIcon(selectedItemForView)" />
                      </q-avatar>
                    </div>
                    <div class="status-text">
                      <div class="status-title">{{ getStockStatusText(selectedItemForView) }}</div>
                      <div class="status-subtitle">
                        {{ t('warehouseItem.lastUpdated', 'Stock levels as of now') }}
                      </div>
                    </div>
                    <div class="status-badge"
                      v-if="'reservations' in selectedItemForView && selectedItemForView.reservations">
                      <q-chip color="warning" text-color="white" icon="bookmark">
                        {{ selectedItemForView.reservations }} {{ t('warehouseItem.reserved', 'Reserved') }}
                      </q-chip>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </template>
      </q-card-section>

      <q-card-actions align="right" class="modal-actions">
        <q-btn :label="t('common.close', 'Close')" v-close-popup flat icon="close" color="primary" size="md"
          class="close-btn" :class="{ 'mobile-close-btn': $q.screen.xs }" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Stock Adjustment Dialog -->
  <q-dialog v-model="showAdjustDialog">
    <q-card class="q-pa-md" style="min-width: 400px;">
      <div class="text-h6 q-mb-md">
        <q-icon name="tune" class="q-mr-sm" />
        {{ t('warehouseItem.adjustStock', 'Adjust Stock') }}
      </div>

      <div class="q-mb-md" v-if="adjustItem">
        <div class="text-subtitle1">{{ adjustItem.name }}</div>
        <div class="text-caption text-grey-6">
          {{ t('warehouseItem.currentQuantity', 'Current Quantity') }}:
          <strong>{{ adjustItem.quantity || 0 }}</strong>
        </div>
      </div>

      <div class="q-mb-md">
        <q-input v-model.number="adjustQuantity" type="number" min="1" :label="t('warehouseItem.quantity', 'Quantity')"
          outlined dense />
      </div>

      <div class="q-mb-md">
        <q-option-group v-model="adjustAction" :options="[
          { label: t('warehouseItem.add', 'Add to Stock'), value: 'add', color: 'positive' },
          { label: t('warehouseItem.remove', 'Remove from Stock'), value: 'remove', color: 'negative' }
        ]" color="primary" inline />
      </div>

      <q-card-actions align="right">
        <q-btn flat :label="t('common.cancel', 'Cancel')" v-close-popup />
        <q-btn color="primary" :label="t('warehouseItem.addToQueue', 'Add to Queue')" @click="addAdjustment"
          :disable="!adjustQuantity || adjustQuantity <= 0" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Confirmation Dialog for Batch Adjustments -->
  <q-dialog v-model="showConfirmDialog">
    <q-card class="q-pa-md" style="min-width: 500px;">
      <div class="text-h6 q-mb-md">
        <q-icon name="warning" class="q-mr-sm" color="warning" />
        {{ t('warehouseItem.confirmAdjustments', 'Confirm Stock Adjustments') }}
      </div>

      <div class="q-mb-md">
        {{ t('warehouseItem.aboutToAdjust', 'You are about to adjust stock for the following items:') }}
      </div>

      <q-list bordered separator class="q-mb-md">
        <q-item v-for="(adjustment, itemId) in adjustedItems" :key="itemId">
          <q-item-section>
            <q-item-label>
              {{currentItems.find(item => item.id === Number(itemId))?.name || `Item #${itemId}`}}
            </q-item-label>
            <q-item-label caption>
              <q-badge :color="adjustment.action === 'add' ? 'positive' : 'negative'"
                :label="`${adjustment.action === 'add' ? '+' : '-'}${adjustment.quantity}`" />
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat round dense icon="close" @click="removeAdjustment(Number(itemId))" color="grey" />
          </q-item-section>
        </q-item>
      </q-list>

      <div class="q-mb-md">
        <q-input v-model="adjustmentReason" type="textarea"
          :label="t('warehouseItem.adjustmentReason', 'Reason for adjustment')"
          :placeholder="t('warehouseItem.reasonPlaceholder', 'Please provide a reason for these stock adjustments...')"
          outlined rows="3" counter maxlength="500" />
      </div>

      <q-card-actions align="right">
        <q-btn flat :label="t('common.cancel', 'Cancel')" v-close-popup />
        <q-btn color="primary" :label="t('warehouseItem.confirmSubmit', 'Confirm & Submit')"
          @click="submitAllAdjustments" :loading="isSubmitting" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Floating Action Button for Pending Adjustments -->
  <q-fab v-if="Object.keys(adjustedItems).length > 0" color="orange" icon="inventory" direction="up"
    class="fixed-bottom-center" @click="showConfirmDialog = true">
    <q-badge color="red" floating>
      {{ Object.keys(adjustedItems).length }}
    </q-badge>
    <q-fab-action color="deep-orange" icon="send" :label="t('warehouseItem.submitAdjustments', 'Submit All')"
      @click="showConfirmDialog = true" />
  </q-fab>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useWarehouseStore } from 'src/stores/warehouseStore';
import { useRTL } from 'src/composables/useRTL';
import type { Warehouse } from 'src/types/warehouse';
import type { AnyItem } from 'src/types/warehouse_item';
import QtableB from 'src/components/common/Qtable.vue';
import type { MenuItem } from 'src/types';
import { api } from 'boot/axios';
import { showNotify } from 'src/composables/Notify';
import { formatCurrency } from 'src/composables/useFormat';
import { useMeStore } from 'src/stores/meStore';

const props = defineProps<{
  selectedWarehouse: Warehouse | null;
  showItemsTab: boolean;
}>();

const emit = defineEmits(['back', 'update:showItemsTab']);

const { t } = useI18n();
const { isRTL } = useRTL();
const warehouseStore = useWarehouseStore();

const meStore = useMeStore();

const canAdjustStock = computed(() => {
  // Only admins or users with 'adjustments' permission can adjust stock
  if (meStore.me?.type === 'admin') return true;
  //...
  return meStore.me?.permissions?.includes('adjustments');
});

// RTL-aware back icon
const goBackIcon = computed(() => isRTL.value ? 'arrow_forward' : 'arrow_back');

// Relation type filter state
const selectedRelationType = ref<'items' | 'blum_items'>('items');

// Modal state
const showViewModal = ref(false);
const selectedItemForView = ref<AnyItem | null>(null);

// Computed property to get current items based on selected type
const currentItems = computed(() => {
  if (!warehouseStore.warehouseItems) return [];

  if (selectedRelationType.value === 'items') {
    return warehouseStore.warehouseItems.items || [];
  } else {
    return warehouseStore.warehouseItems.blum_items || [];
  }
});

// Check if we have any data for the current selection
const hasCurrentItems = computed(() => {
  return currentItems.value && currentItems.value.length > 0;
});

// Get current columns based on selected type
const currentColumns = computed(() => {
  if (selectedRelationType.value === 'items') {
    return itemColumns;
  } else {
    return blumItemColumns;
  }
});

// --- Stock Adjustment State ---
const adjustments = ref<Record<number, { quantity: number, action: 'add' | 'remove' }>>({});
const showAdjustDialog = ref(false);
const adjustItem = ref<AnyItem | null>(null);
const adjustQuantity = ref(1);
const adjustAction = ref<'add' | 'remove'>('add');
const isSubmitting = ref(false);
const showConfirmDialog = ref(false);
const adjustmentReason = ref('');

// Computed to get items with pending adjustments
const adjustedItems = computed(() => {
  return Object.fromEntries(
    Object.entries(adjustments.value).filter(([_, adj]) => adj.quantity > 0)
  );
});

// Menu items for row actions - now includes adjust stock
const menuItems: MenuItem[] = [
  { label: t('common.details', 'View Item'), icon: 'visibility', value: 'view' },
  // { label: t('warehouseItem.adjust', 'Adjust Stock'), icon: 'tune', value: 'adjust' }
];

if (canAdjustStock.value) {
  menuItems.push({ label: t('warehouseItem.adjust', 'Adjust Stock'), icon: 'tune', value: 'adjust' });
}

// Handle menu actions
function handleAction(payload: { item: { value: string }, rowId: number }) {
  const item = currentItems.value.find(item => item.id === payload.rowId);
  if (!item) return;

  if (payload.item.value === 'view') {
    viewItem(item);
  } else if (payload.item.value === 'edit') {
    editItem(item);
  } else if (payload.item.value === 'delete') {
    removeItem(payload.rowId);
  } else if (payload.item.value === 'adjust') {
    openAdjustDialog(item);
  }
}

// Open adjustment dialog for a single item
function openAdjustDialog(item: AnyItem) {
  if (!canAdjustStock.value) {
    showNotify({
      type: 'negative',
      message: t('warehouseItem.noPermissionAdjust', 'You do not have permission to adjust stock'),
      position: 'top',
      duration: 3000
    });
    return;
  }
  adjustItem.value = item;
  adjustQuantity.value = 1;
  adjustAction.value = 'add';
  showAdjustDialog.value = true;
}

// Add adjustment to pending list
function addAdjustment() {
  if (!canAdjustStock.value) {
    showNotify({
      type: 'negative',
      message: t('warehouseItem.noPermissionAdjust', 'You do not have permission to adjust stock'),
      position: 'top',
      duration: 3000
    });
    return;
  }

  if (!adjustItem.value || adjustQuantity.value <= 0) return;

  adjustments.value[adjustItem.value.id] = {
    quantity: adjustQuantity.value,
    action: adjustAction.value
  };

  showAdjustDialog.value = false;

  showNotify({
    type: 'positive',
    message: t('warehouseItem.adjustmentAdded', 'Adjustment added to queue'),
    position: 'top',
    duration: 2000
  });
}

// Submit all pending adjustments
async function submitAllAdjustments() {
  // Permission check
  if (!canAdjustStock.value) {
    showNotify({
      type: 'negative',
      message: t('warehouseItem.noPermissionAdjust', 'You do not have permission to adjust stock'),
      position: 'top',
      duration: 3000
    });
    return;
  }

  // Reason validation
  if (adjustmentReason.value.trim().length === 0) {
    showNotify({
      type: 'negative',
      message: t('warehouseItem.reasonRequired', 'Please provide a reason for the adjustments'),
      position: 'top',
      duration: 3000
    });
    return;
  }

  if (!props.selectedWarehouse || Object.keys(adjustedItems.value).length === 0) return;

  isSubmitting.value = true;
  try {
    const payload = {
      _method: 'put',
      items: Object.entries(adjustedItems.value).map(([itemId, adjustment]) => ({
        item_id: Number(itemId),
        quantity: adjustment.quantity,
        action: adjustment.action
      })),
      reason: adjustmentReason.value.trim() || 'No reason provided'
    };

    await api.post(`/warehouses-items/adjust/quantity/${props.selectedWarehouse.id}`, payload);

    showNotify({
      type: 'positive',
      message: t('warehouseItem.adjustmentSuccess', 'Stock adjustments applied successfully'),
      position: 'top',
      duration: 3000
    });

    // Clear adjustments and refresh data
    adjustments.value = {};
    showConfirmDialog.value = false;
    await warehouseStore.fetchWarehouseItems(props.selectedWarehouse.id);

  } catch (error) {
    console.error('Error adjusting stock:', error);
    showNotify({
      type: 'negative',
      message: t('warehouseItem.adjustmentError', 'Failed to adjust stock'),
      position: 'top',
      duration: 3000
    });
  } finally {
    isSubmitting.value = false;
  }
}

// Remove adjustment from queue
function removeAdjustment(itemId: number) {
  delete adjustments.value[itemId];
}

// Combined watcher for warehouse selection and tab visibility changes
watch(() => [props.selectedWarehouse, props.showItemsTab] as const, ([newWarehouse, showItems]) => {
  if (newWarehouse && showItems && typeof newWarehouse === 'object') {
    void loadWarehouseItems(newWarehouse.id);
  }
}, { immediate: true });

// Handle relation type change
async function handleRelationTypeChange(newRelationType: 'items' | 'blum_items') {
  selectedRelationType.value = newRelationType;
  if (props.selectedWarehouse) {
    await loadWarehouseItems(props.selectedWarehouse.id);
  }
}

// Load items for the selected warehouse
async function loadWarehouseItems(warehouseId: number) {
  try {
    await warehouseStore.fetchWarehouseItems(warehouseId, 1);   // , 10, selectedRelationType.value
  } catch (error) {
    console.error('Error loading warehouse items:', error);
  }
}

// Navigate back to previous screen
function goBack() {
  emit('back');
  emit('update:showItemsTab', false);
}

// View item details
function viewItem(item: AnyItem) {
  selectedItemForView.value = item;
  showViewModal.value = true;
}

// Handle page change for pagination
async function handlePageChange(page: number) {
  if (props.selectedWarehouse) {
    try {
      await warehouseStore.fetchWarehouseItems(props.selectedWarehouse.id, page);   // , 10, selectedRelationType.value
    } catch (error) {
      console.error('Error loading warehouse items:', error);
    }
  }
}

// Edit warehouse item
function editItem(item: AnyItem) {
  console.log('Edit item:', item);
  // Implement edit functionality
}

// Remove item from warehouse
function removeItem(itemId: number) {
  console.log('Remove item:', itemId);
  // Implement remove functionality
}

// Table columns for warehouse items
const itemColumns = [

  {
    name: 'name',
    label: t('warehouseItem.name', 'Item Name'),
    align: 'left' as const,
    field: 'name',
    sortable: true,
  },
  {
    name: 'unit_cost',
    label: t('warehouseItem.unitCost', 'Unit Cost'),
    align: 'right' as const,
    field: 'unit_cost',
    sortable: true,
    format: (val: any) => formatCurrency(val),
  },
  {
    name: 'solo_unit_price',
    label: t('warehouseItem.soloPrice', 'Solo Price'),
    align: 'right' as const,
    field: 'solo_unit_price',
    sortable: true,
    format: (val: any) => formatCurrency(val),
  },
  {
    name: 'bulk_unit_price',
    label: t('warehouseItem.bulkPrice', 'Bulk Price'),
    align: 'right' as const,
    field: 'bulk_unit_price',
    sortable: true,
    format: (val: any) => formatCurrency(val),
  },
  {
    name: 'quantity',
    label: t('warehouseItem.quantity', 'Quantity'),
    align: 'center' as const,
    field: 'quantity',
    sortable: true,
    format: (val: unknown) => formatQuantity(val),
  },
  // {
  //   name: 'pieces',
  //   label: t('warehouseItem.pieces', 'Pieces'),
  //   align: 'center' as const,
  //   field: 'pieces',
  //   sortable: true,
  // },
  // {
  //   name: 'reservations',
  //   label: t('warehouseItem.reservations', 'Reserved'),
  //   align: 'center' as const,
  //   field: 'reservations',
  //   sortable: true,
  // },
  {
    name: 'actions',
    label: t('common.actions', 'Actions'),
    align: 'center' as const,
    field: 'actions',
    sortable: false,
  },
];

// Table columns for blum items
const blumItemColumns = [

  {
    name: 'code',
    label: t('warehouseItem.code', 'Code'),
    align: 'left' as const,
    field: 'code',
    sortable: true,
  },
  {
    name: 'part_no',
    label: t('warehouseItem.partNo', 'Part No'),
    align: 'left' as const,
    field: 'part_no',
    sortable: true,
  },
  {
    name: 'name',
    label: t('warehouseItem.name', 'Item Name'),
    align: 'left' as const,
    field: 'name',
    sortable: true,
  },
  {
    name: 'unit_cost',
    label: t('warehouseItem.unitCost', 'Unit Cost'),
    align: 'right' as const,
    field: 'unit_cost',
    sortable: true,
    format: (val: unknown) => {
      const num = typeof val === 'string' || typeof val === 'number' ? parseFloat(String(val)) : 0;
      return `$${(isNaN(num) ? 0 : num).toFixed(2)}`;
    },
  },
  {
    name: 'unit_price',
    label: t('warehouseItem.unitPrice', 'Unit Price'),
    align: 'right' as const,
    field: 'unit_price',
    sortable: true,
    format: (val: unknown) => {
      const num = typeof val === 'string' || typeof val === 'number' ? parseFloat(String(val)) : 0;
      return `$${(isNaN(num) ? 0 : num).toFixed(2)}`;
    },
  },
  {
    name: 'quantity',
    label: t('warehouseItem.quantity', 'Quantity'),
    align: 'center' as const,
    field: 'quantity',
    sortable: true,
    format: (val: unknown) => {
      const num = typeof val === 'string' || typeof val === 'number' ? Number(val) : 0;
      return (isNaN(num) ? 0 : num).toLocaleString();
    },
  },
  {
    name: 'position',
    label: t('warehouseItem.position', 'Position'),
    align: 'center' as const,
    field: 'position',
    sortable: true,
  },
  {
    name: 'actions',
    label: t('common.actions', 'Actions'),
    align: 'center' as const,
    field: 'actions',
    sortable: false,
  },
];

// Helper functions for stock status
function getStockStatusColor(item: AnyItem): string {
  const quantity = item.quantity || 0;
  if (quantity > 100) return 'positive';
  if (quantity > 50) return 'warning';
  if (quantity > 0) return 'orange';
  return 'negative';
}

function getStockStatusIcon(item: AnyItem): string {
  const quantity = item.quantity || 0;
  if (quantity > 100) return 'check_circle';
  if (quantity > 50) return 'warning';
  if (quantity > 0) return 'error';
  return 'cancel';
}

function getStockStatusText(item: AnyItem): string {
  const quantity = item.quantity || 0;
  if (quantity > 100) return t('warehouseItem.stockHigh', 'Stock Level: High');
  if (quantity > 50) return t('warehouseItem.stockMedium', 'Stock Level: Medium');
  if (quantity > 0) return t('warehouseItem.stockLow', 'Stock Level: Low');
  return t('warehouseItem.stockOut', 'Out of Stock');
}

function formatQuantity(value: any): string {
  // const num = typeof val === 'string' || typeof val === 'number' ? Number(val) : 0;
  if (typeof value === "string") {
    value = value.replace(/[^\d.-]/g, "");
    value = parseFloat(value);
  }
  return (isNaN(value) ? 0 : value).toLocaleString();
}
</script>

<style lang="scss" scoped>
.warehouse-items-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 100%;
}

// Enhanced content styling
.warehouse-items-content {
  display: flex;
  flex-direction: column;
}

.warehouse-items-table {
  border-radius: 8px;
  overflow: hidden;

  :deep(.q-table th) {
    font-weight: 600;
    background: rgba(0, 0, 0, 0.03);
  }

  :deep(.q-table tr:hover) {
    background: rgba(0, 0, 0, 0.02);
  }
}

// Item table cell styling
.item-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .item-name {
    font-weight: 500;
    color: #333;
  }
}

.price-badge {
  font-weight: 600;
  min-width: 80px;
}

.quantity-badge {
  font-weight: 600;
  min-width: 60px;
}

.pieces-chip {
  font-weight: 500;
}

.reservations-badge {
  font-weight: 500;
  min-width: 50px;
}

.position-chip {
  font-weight: 500;
}

.code-chip,
.part-no-chip {
  font-weight: 500;
  font-family: monospace;
}

.id-chip {
  font-weight: 600;
  font-family: monospace;
}

// Modal badge styling
.quantity-badge-small,
.reservations-badge-small {
  font-weight: 600;
  font-size: 12px;
  padding: 4px 8px;
  min-width: 35px;
  text-align: center;
}

// Loading and empty states
.warehouse-items-loading {
  text-align: center;
  padding: 60px 40px;
}

.no-items-card {
  text-align: center;
  padding: 60px 40px;
}

// Warehouse select prompt (when no warehouse selected)
.warehouse-select-prompt {
  text-align: center;
  padding: 60px 40px;
}

// Relation type toggle styling
.relation-type-toggle {
  border-radius: 8px;
  overflow: hidden;
}

// Filter buttons styling
.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-btn {
  min-width: 120px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:not(.q-btn--flat) {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

// Floating Action Button styling
.fixed-bottom-center {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

// Stock adjustment dialog styling
.q-dialog .q-card {
  border-radius: 12px;
}

// Responsive design
@media (max-width: 768px) {
  .warehouse-items-container {
    gap: 16px;
  }

  .filter-buttons {
    width: 100%;

    .filter-btn {
      min-width: auto;
      flex: 1;
    }
  }

  .fixed-bottom-center {
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
  }
}

// Enhanced Modal Styles - Item Details Modal
.item-details-modal {
  max-width: 95vw;
  max-height: 95vh;
  width: 1200px;
  border-radius: 12px;
  overflow: hidden;

  &.full-screen-mobile {
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
    margin: 0 !important;
  }
}

.modal-scroll-area {
  max-height: calc(95vh - 140px);
  overflow-y: auto;
}

.modal-content-padding {
  padding: 24px;
}

.item-header {
  margin-bottom: 32px;
}

.item-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
  line-height: 1.2;
}

.item-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.id-chip {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.main-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.content-card {
  min-height: 200px;
}

.responsive-card {
  transition: all 0.2s ease;
  border-radius: 8px;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.section-spacing {
  margin-bottom: 24px;
}

.card-header {
  padding: 16px 20px;
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 0.85rem;
  opacity: 0.9;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.status-summary-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.status-avatar {
  flex-shrink: 0;
}

.status-text {
  flex: 1;
}

.status-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.status-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 2px;
}

.status-badge {
  flex-shrink: 0;
}

.modal-actions {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;

  .close-btn {
    min-width: 100px;

    &.mobile-close-btn {
      width: 100%;
      min-height: 48px;
      font-size: 1rem;
      font-weight: 600;
    }
  }
}

.pricing-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pricing-item {
  padding: 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.pricing-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #555;
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.pricing-value {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 4px;

  &.cost {
    color: #10b981;
  }

  &.solo {
    color: #3b82f6;
  }

  &.bulk {
    color: #f59e0b;
  }

  &.unit {
    color: #8b5cf6;
  }
}

.pricing-desc {
  font-size: 0.8rem;
  color: #6b7280;
  font-style: italic;
}

.stock-overview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stock-metric-large {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 12px;
  border: 2px solid #3b82f6;
}

.metric-icon {
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
}

.metric-label {
  font-size: 0.9rem;
  color: #374151;
  font-weight: 500;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 4px;

  &.total {
    color: #1d4ed8;
  }
}

.metric-desc {
  font-size: 0.8rem;
  color: #6b7280;
}

.stock-metric {
  padding: 8px 0;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;

  &.highlight {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
  }
}

.metric-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.config-item {
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.config-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.config-title {
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
}

.config-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0d9488;
}

.config-desc {
  font-size: 0.85rem;
  color: #6b7280;
  font-style: italic;
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.breakdown-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(251, 146, 60, 0.05);
  border: 1px solid rgba(251, 146, 60, 0.2);
  border-radius: 8px;
}

.breakdown-icon {
  flex-shrink: 0;
}

.breakdown-content {
  flex: 1;
}

.breakdown-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #ea580c;
  line-height: 1;
  margin-bottom: 4px;
}

.breakdown-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.breakdown-calculation {
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.3;
}

.verification-formula {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  padding: 16px;
}

.formula-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 0.9rem;
  color: #1d4ed8;
}

.formula-content {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.formula-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.formula-part {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;

  &.packages {
    background: rgba(16, 185, 129, 0.1);
    color: #065f46;
  }

  &.packets {
    background: rgba(59, 130, 246, 0.1);
    color: #1e3a8a;
  }

  &.pieces {
    background: rgba(251, 146, 60, 0.1);
    color: #9a3412;
  }
}

.formula-operator {
  font-weight: 600;
  color: #374151;
}

.formula-result {
  padding: 4px 8px;
  background: rgba(16, 185, 129, 0.2);
  color: #065f46;
  border-radius: 4px;
  font-weight: 700;
}

.status-summary {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 2px solid #d1d5db;
}

// Additional utility classes for better responsiveness
.h-full {
  height: 100%;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Accessibility improvements
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// High contrast mode support
@media (prefers-contrast: high) {

  .pricing-item,
  .config-item,
  .breakdown-item {
    border-width: 2px;
    border-color: currentColor;
  }

  .status-summary {
    border-width: 3px;
  }
}

// Print styles
@media print {
  .item-details-modal {
    width: 100% !important;
    max-width: none !important;
    max-height: none !important;
    box-shadow: none !important;
  }

  .modal-actions {
    display: none !important;
  }

  .card-header {
    background: #f3f4f6 !important;
    color: #000 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .main-content-grid {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }
}

// Focus management for better keyboard navigation
.q-btn:focus,
.q-chip:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

// Scrollbar styling for webkit browsers
.modal-scroll-area::-webkit-scrollbar {
  width: 8px;
}

.modal-scroll-area::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.modal-scroll-area::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.modal-scroll-area::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

// Mobile landscape orientation adjustments
@media (max-width: 767px) and (orientation: landscape) {
  .item-details-modal {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
  }

  .modal-scroll-area {
    max-height: calc(100vh - 100px);
  }

  .modal-content-padding {
    padding: 8px 16px;
  }

  .main-content-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .item-header {
    margin-bottom: 12px;
  }

  .item-title {
    font-size: 1.1rem;
    margin-bottom: 6px;
  }

  .section-spacing {
    margin-bottom: 8px;
  }

  .breakdown-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .breakdown-item {
    padding: 6px;
  }

  .stock-metric-large {
    padding: 8px;
    flex-direction: row;
    text-align: left;
  }
}

// Comprehensive Responsive Design

// Large Desktop (1200px+)
@media (min-width: 1200px) {
  .item-details-modal {
    width: 1200px;
  }

  .main-content-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .breakdown-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .config-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

// Desktop (992px - 1199px)
@media (max-width: 1199px) and (min-width: 992px) {
  .item-details-modal {
    width: 95vw;
    max-width: 1000px;
  }

  .main-content-grid {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .breakdown-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

// Tablet (768px - 991px)
@media (max-width: 991px) and (min-width: 768px) {
  .item-details-modal {
    width: 95vw;
    max-width: 900px;
  }

  .modal-content-padding {
    padding: 20px;
  }

  .main-content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .item-title {
    font-size: 1.6rem;
  }

  .item-chips {
    justify-content: center;
  }

  .breakdown-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .config-grid {
    grid-template-columns: 1fr;
  }

  .stock-metric-large {
    padding: 12px;
  }

  .status-summary-content {
    gap: 12px;
  }

  .formula-line {
    justify-content: center;
    text-align: center;
  }
}

// Mobile Large (576px - 767px)
@media (max-width: 767px) and (min-width: 576px) {
  .item-details-modal {
    width: 98vw;
    max-height: 98vh;
  }

  .modal-scroll-area {
    max-height: calc(98vh - 120px);
  }

  .modal-content-padding {
    padding: 16px;
  }

  .main-content-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  .item-header {
    margin-bottom: 20px;
    text-align: center;
  }

  .item-title {
    font-size: 1.4rem;
    margin-bottom: 12px;
  }

  .item-chips {
    justify-content: center;
    gap: 6px;
  }

  .breakdown-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .breakdown-item {
    padding: 12px;
  }

  .breakdown-value {
    font-size: 1.5rem;
  }

  .config-grid {
    grid-template-columns: 1fr;
  }

  .config-item {
    padding: 12px;
  }

  .stock-metric-large {
    flex-direction: column;
    text-align: center;
    gap: 8px;
    padding: 12px;
  }

  .metric-value {
    font-size: 1.6rem;
  }

  .status-summary-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .formula-line {
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
  }

  .formula-part,
  .formula-operator,
  .formula-result {
    margin: 2px 0;
  }

  .pricing-grid {
    gap: 12px;
  }

  .pricing-item {
    padding: 10px;
  }

  .pricing-value {
    font-size: 1.2rem;
  }

  .verification-formula {
    padding: 12px;
  }

  .section-spacing {
    margin-bottom: 16px;
  }
}

// Mobile Small (up to 575px)
@media (max-width: 575px) {
  .item-details-modal {
    width: 100vw;
    max-height: 100vh;
    border-radius: 0;
    margin: 0;
  }

  .modal-scroll-area {
    max-height: calc(100vh - 110px);
  }

  .modal-content-padding {
    padding: 12px;
  }

  .main-content-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  .item-header {
    margin-bottom: 16px;
    text-align: center;
  }

  .item-title {
    font-size: 1.2rem;
    margin-bottom: 8px;
    line-height: 1.3;
  }

  .item-chips {
    justify-content: center;
    gap: 4px;
  }

  .item-chips .q-chip {
    font-size: 0.7rem;
    padding: 4px 8px;
  }

  .card-title {
    font-size: 1rem;
  }

  .breakdown-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .breakdown-item {
    padding: 8px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .breakdown-icon {
    align-self: center;
  }

  .breakdown-value {
    font-size: 1.3rem;
  }

  .breakdown-label {
    font-size: 0.85rem;
  }

  .breakdown-calculation {
    font-size: 0.75rem;
  }

  .config-grid {
    grid-template-columns: 1fr;
  }

  .config-item {
    padding: 8px;
    text-align: center;
  }

  .config-header {
    flex-direction: column;
    gap: 4px;
    margin-bottom: 6px;
  }

  .config-value {
    font-size: 1.2rem;
  }

  .stock-metric-large {
    flex-direction: column;
    text-align: center;
    gap: 6px;
    padding: 8px;
  }

  .metric-value {
    font-size: 1.4rem;
  }

  .metric-label {
    font-size: 0.8rem;
  }

  .status-summary-content {
    flex-direction: column;
    text-align: center;
    gap: 8px;
    padding: 12px;
  }

  .status-avatar {
    align-self: center;
  }

  .status-title {
    font-size: 1rem;
  }

  .status-subtitle {
    font-size: 0.8rem;
  }

  .formula-line {
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
  }

  .formula-part,
  .formula-operator,
  .formula-result {
    margin: 1px 0;
    font-size: 0.8rem;
    padding: 3px 6px;
  }

  .pricing-grid {
    gap: 8px;
  }

  .pricing-item {
    padding: 8px;
    text-align: center;
  }

  .pricing-label {
    justify-content: center;
    font-size: 0.8rem;
  }

  .pricing-value {
    font-size: 1.1rem;
  }

  .pricing-desc {
    font-size: 0.75rem;
  }

  .verification-formula {
    padding: 8px;
  }

  .formula-header {
    justify-content: center;
    font-size: 0.8rem;
  }

  .section-spacing {
    margin-bottom: 12px;
  }

  .modal-actions {
    padding: 12px;
  }

  .warehouse-items-container {
    gap: 12px;
  }

  .filter-buttons {
    width: 100%;
    flex-direction: column;
    gap: 6px;

    .filter-btn {
      min-width: auto;
      width: 100%;
      font-size: 0.9rem;
    }
  }

  .fixed-bottom-center {
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
  }
}

// Legacy responsive adjustments (keeping for compatibility)
@media (max-width: 768px) {
  .warehouse-items-container {
    gap: 16px;
  }

  .filter-buttons {
    width: 100%;

    .filter-btn {
      min-width: auto;
      flex: 1;
    }
  }

  .fixed-bottom-center {
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
