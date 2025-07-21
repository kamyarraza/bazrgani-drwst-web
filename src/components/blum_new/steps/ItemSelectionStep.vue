<template>
  <div class="item-selection-step">
    <div class="step-container">
      <!-- Step Header -->
      <div class="step-header">
        <div class="step-title">
          <q-icon name="inventory_2" size="md" class="q-mr-sm text-primary" />
          <span>{{ t('blumTransaction.steps.itemSelection') }}</span>
        </div>
        <div class="step-description">
          {{ t('blumTransaction.steps.itemSelectionDesc') }}
        </div>
      </div>

      <!-- Search Section -->
      <div class="search-section">
        <!-- Item/Set Tabs for Sell Transactions -->
        <div v-if="transactionType === 'sell'" class="search-tabs q-mb-md">
          <q-tabs
            v-model="activeSearchTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
          >
            <q-tab name="items" :label="t('blumTransaction.items')" icon="inventory_2" />
            <q-tab name="sets" :label="t('blumTransaction.sets')" icon="folder" />
          </q-tabs>
        </div>

        <!-- Item Search -->
        <div v-if="activeSearchTab === 'items'" class="item-search">
          <q-card flat bordered class="search-card">
            <q-card-section>
              <div class="section-title">
                <q-icon name="search" class="q-mr-sm" />
                {{ t('blumTransaction.searchItems') }}
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-8">
                  <q-input
                    v-model="itemSearchQuery"
                    :label="t('blumTransaction.searchItem')"
                    outlined
                    @keyup.enter="onSearchItems"
                    @input="onItemSearchInputDebounced(itemSearchQuery)"
                    clearable
                    :loading="itemSearchLoading"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" />
                    </template>
                    <template v-slot:append v-if="itemSearchResults.length > 0">
                      <q-btn
                        flat
                        round
                        dense
                        icon="clear"
                        @click="clearItemSearchResults"
                        size="sm"
                      >
                        <q-tooltip>{{ t('common.clear') }}</q-tooltip>
                      </q-btn>
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4">
                  <q-btn
                    @click="onSearchItems"
                    :label="t('common.search')"
                    color="primary"
                    icon="search"
                    no-caps
                    class="full-width search-btn"
                    :loading="itemSearchLoading"
                    size="md"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Set Search -->
        <div v-if="activeSearchTab === 'sets' && transactionType === 'sell'" class="set-search">
          <q-card flat bordered class="search-card">
            <q-card-section>
              <div class="section-title">
                <q-icon name="search" class="q-mr-sm" />
                {{ t('blumTransaction.searchSets') }}
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-8">
                  <q-input
                    v-model="setSearchQuery"
                    :label="t('blumTransaction.searchSet')"
                    outlined
                    @keyup.enter="onSearchSets"
                    @input="onSetSearchInputDebounced(setSearchQuery)"
                    clearable
                    :loading="setSearchLoading"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" />
                    </template>
                    <template v-slot:append v-if="setSearchResults.length > 0">
                      <q-btn
                        flat
                        round
                        dense
                        icon="clear"
                        @click="clearSetSearchResults"
                        size="sm"
                      >
                        <q-tooltip>{{ t('common.clear') }}</q-tooltip>
                      </q-btn>
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4">
                  <q-btn
                    @click="onSearchSets"
                    :label="t('common.search')"
                    color="secondary"
                    icon="search"
                    no-caps
                    class="full-width search-btn"
                    :loading="setSearchLoading"
                    size="md"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="currentSearchResults.length > 0" class="search-results q-mt-lg">
        <div class="text-subtitle2 q-mb-sm flex items-center">
          <q-icon name="search" class="q-mr-sm" />
          {{ t('blumTransaction.searchResults') }}
          <span v-if="activeSearchTab === 'items'">({{ itemSearchResults.length }} {{ t('blumTransaction.items') }})</span>
          <span v-if="activeSearchTab === 'sets'">({{ setSearchResults.length }} {{ t('blumTransaction.sets') }})</span>
          <q-space />
          <q-btn
            flat
            dense
            round
            icon="clear"
            size="sm"
            @click="clearCurrentSearchResults"
            class="text-grey-6"
          >
            <q-tooltip>{{ t('common.clearAll') }}</q-tooltip>
          </q-btn>
        </div>

        <!-- Items Results -->
        <div v-if="activeSearchTab === 'items' && itemSearchResults.length > 0">
          <div class="text-caption text-weight-bold text-primary q-mb-sm">
            <q-icon name="inventory" size="xs" class="q-mr-xs" />
            {{ t('blumTransaction.items') }} ({{ itemSearchResults.length }})
          </div>

          <div class="search-results-container">
            <q-list separator class="rounded-borders item-search-list">
              <q-item
                v-for="item in itemSearchResults"
                :key="`item-${item.id}`"
                clickable
                v-ripple
                @click="addItemToTransaction(item)"
                class="item-list-item"
                :class="{
                  'item-selected': isItemSelected(item.id)
                }"
              >
                <q-item-section avatar>
                  <q-avatar size="56px" rounded class="">
                    <img
                      v-if="item.image || item.image"
                      :src="item.image || item.image"
                      :alt="item.name"
                      style="object-fit: cover;"
                    />
                    <q-icon v-else name="inventory_2" size="28px" color="blue-grey-5" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="item-name">
                    {{ item.name }}
                    <q-chip
                      v-if="isItemSelected(item.id)"
                      size="sm"
                      color="positive"
                      text-color="white"
                      icon="check"
                      class="q-ml-sm"
                    >
                      {{ t('blumTransaction.added') }}
                    </q-chip>
                  </q-item-label>

                  <q-item-label caption class="item-details">
                    <div class="item-codes">
                      <span v-if="item.code && item.code !== 'N/A'" class="item-code-chip">
                        <q-icon name="qr_code" size="xs" />
                        {{ item.code }}
                      </span>
                      <span v-if="item.part_no && item.part_no !== 'N/A'" class="item-part-chip">
                        <q-icon name="tag" size="xs" />
                        {{ item.part_no }}
                      </span>
                      <span v-if="getAvailableQuantity(item)" class="item-info-chip">
                        <q-icon name="inventory" size="xs" />
                        {{ t('blumTransaction.totalQuantity') }}: {{ getAvailableQuantity(item) }}
                      </span>
                      <span v-if="item.unit_cost" class="item-info-chip">
                        <q-icon name="attach_money" size="xs" />
                        {{ t('blumTransaction.unitCost') }}: ${{ item.unit_cost }}
                      </span>
                    </div>
                  </q-item-label>

                  <q-item-label caption class="item-pricing">
                    <span v-if="item.unit_price" class="price-display">
                      €{{ Number(item.unit_price).toFixed(2) }}
                    </span>
                    <span v-else-if="item.price" class="price-display">
                      €{{ Number(item.price).toFixed(2) }}
                    </span>
                  </q-item-label>
                </q-item-section>

                <q-item-section side class="item-action-section">
                  <q-btn
                    round
                    :color="isItemSelected(item.id) ? 'positive' : 'primary'"
                    :icon="isItemSelected(item.id) ? 'check' : 'add'"
                    size="sm"
                    @click.stop="addItemToTransaction(item)"
                    :disable="isItemSelected(item.id)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>

        <!-- Sets Results -->
        <div v-if="activeSearchTab === 'sets' && setSearchResults.length > 0" class="q-mt-md">
          <div class="text-caption text-weight-bold text-secondary q-mb-sm">
            <q-icon name="category" size="xs" class="q-mr-xs" />
            {{ t('blumTransaction.sets') }} ({{ setSearchResults.length }})
          </div>

          <div class="search-results-container">
            <q-list separator class="rounded-borders set-search-list">
              <q-item
                v-for="set in setSearchResults"
                :key="`set-${set.id}`"
                clickable
                v-ripple
                @click="addSetToTransaction(set)"
                class="set-list-item"
                :class="{
                  'item-selected': isSetSelected(set.id)
                }"
              >
                <q-item-section avatar>
                  <q-avatar size="56px" rounded class="set-avatar-enhanced">
                    <img
                      v-if="set.image"
                      :src="set.image"
                      :alt="set.title || set.name"
                      style="object-fit: cover;"
                    />
                    <q-icon v-else name="category" size="28px" color="blue-grey-5" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="set-name">
                    {{ set.title || set.name }}
                    <q-chip
                      v-if="isSetSelected(set.id)"
                      size="sm"
                      color="positive"
                      text-color="white"
                      icon="check"
                      class="q-ml-sm"
                    >
                      {{ t('blumTransaction.added') }}
                    </q-chip>
                  </q-item-label>

                  <q-item-label caption class="set-details">
                    <div class="set-info-row">
                      <span class="set-id-chip">
                        <q-icon name="fingerprint" size="xs" />
                        ID: {{ set.id }}
                      </span>
                      <span v-if="set.items" class="items-count-chip">
                        <q-icon name="inventory" size="xs" />
                        {{ set.items.length }} {{ t('blumTransaction.items') }}
                      </span>
                    </div>
                  </q-item-label>

                  <q-item-label caption class="set-pricing">
                    <span v-if="set.unit_price" class="price-display">
                      €{{ Number(set.unit_price).toFixed(2) }}
                    </span>
                    <span v-else-if="set.price" class="price-display">
                      €{{ Number(set.price).toFixed(2) }}
                    </span>
                  </q-item-label>

                  <!-- Set Items Preview -->
                  <q-item-label v-if="set.items && set.items.length > 0" caption class="set-items-preview">
                    <div class="items-preview-chips">
                      <q-chip
                        v-for="item in set.items.slice(0, 3)"
                        :key="item.id"
                        size="xs"
                        color="blue-grey-1"
                        text-color="blue-grey-8"
                        class="preview-chip"
                      >
                        {{ item.name }}
                        <span class="item-quantity">×{{ item.quantity || 1 }}</span>
                      </q-chip>
                      <q-chip
                        v-if="set.items.length > 3"
                        size="xs"
                        color="grey-3"
                        text-color="grey-7"
                        class="more-chip"
                      >
                        +{{ set.items.length - 3 }} {{ t('blumTransaction.moreItems') }}
                      </q-chip>
                    </div>
                  </q-item-label>
                </q-item-section>

                <q-item-section side class="set-action-section">
                  <q-btn
                    round
                    :color="isSetSelected(set.id) ? 'positive' : 'secondary'"
                    :icon="isSetSelected(set.id) ? 'check' : 'add'"
                    size="sm"
                    @click.stop="addSetToTransaction(set)"
                    :disable="isSetSelected(set.id)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </div>

      <!-- Selected Items/Sets Section -->
      <div v-if="formData.details.length > 0" class="selected-items q-mt-lg">
        <div class="section-title">
          <q-icon name="shopping_cart" class="q-mr-sm" />
          {{ t('blumTransaction.selectedItems') }}
          <q-chip
            :label="`${formData.details.length} ${formData.details.length === 1 ? t('blumTransaction.itemSingular') : t('blumTransaction.itemPlural')}`"
            color="primary"
            text-color="white"
            size="sm"
            dense
            class="q-ml-sm"
          />
        </div>

        <!-- Individual Items Row -->
        <div v-if="individualItems.length > 0" class="individual-items-section q-mb-lg">
          <div class="subsection-title">
            <q-icon name="inventory_2" class="q-mr-sm" />
            {{ t('blumTransaction.individualItems') }} ({{ individualItems.length }})
          </div>
          <div class="individual-items-list">
            <q-card
              v-for="(detail, originalIndex) in individualItems"
              :key="`item-${originalIndex}`"
              flat
              bordered
              class="individual-item-card-fullwidth q-mb-md"
            >
              <q-card-section class="item-content-horizontal">
                <!-- Left: Item Info -->
                <div class="item-info-section">
                  <div class="item-avatar">
                    <q-avatar size="48px" rounded>
                      <img
                        v-if="detail.item?.image"
                        :src="detail.item.image"
                        :alt="detail.item.name"
                        style="object-fit: cover;"
                      />
                      <q-icon v-else name="inventory_2" size="24px" color="blue-grey-5" />
                    </q-avatar>
                  </div>
                  <div class="item-details">
                    <div class="item-name">{{ detail.item?.name }}</div>
                    <div class="item-meta">
                      <span v-if="detail.item?.code" class="item-code">{{ detail.item.code }}</span>
                      <span v-if="detail.item?.part_no" class="item-part">{{ detail.item.part_no }}</span>
                      <span v-if="getAvailableQuantity(detail.item) && transactionType === 'sell'" class="item-stock">
                        {{ t('blumTransaction.available') }}: {{ getAvailableQuantity(detail.item) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Center: Controls -->
                <div class="item-controls-section">
                  <!-- Price Inputs -->
                  <div class="price-inputs-section">
                    <!-- Unit Price -->
                    <div class="price-input">
                      <q-input
                        v-model.number="detail.unit_price"
                        :label="t('blumTransaction.unitPriceUSD')"
                        type="number"
                        min="0"
                        step="0.01"
                        dense
                        outlined
                        @update:model-value="updateItemTotal(getOriginalIndex(detail))"
                        class="price-field"
                      >
                        <template v-slot:prepend>
                          <q-icon name="attach_money" />
                        </template>
                      </q-input>
                    </div>

                    <!-- Solo Unit Price -->
                    <div class="price-input">
                      <q-input
                        v-model.number="detail.solo_unit_price"
                        :label="t('blumTransaction.soloUnitPriceUSD')"
                        type="number"
                        min="0"
                        step="0.01"
                        dense
                        outlined
                        @update:model-value="updateItemTotal(getOriginalIndex(detail))"
                        class="price-field"
                      >
                        <template v-slot:prepend>
                          <q-icon name="monetization_on" />
                        </template>
                      </q-input>
                    </div>
                  </div>

                  <!-- Quantity Controls -->
                  <div class="quantity-controls">
                    <div class="quantity-buttons">
                      <q-btn
                        flat
                        size="sm"
                        icon="remove"
                        @click="decreaseQuantity(getOriginalIndex(detail))"
                        :disable="detail.quantity <= 1"
                        color="negative"
                        class="quantity-btn"
                      />
                      <q-input
                        v-model.number="detail.quantity"
                        type="number"
                        :min="1"
                        :max="transactionType === 'sell' ? getAvailableQuantity(detail.item) : undefined"
                        dense
                        outlined
                        @update:model-value="onQuantityManualChange(getOriginalIndex(detail), detail.quantity)"
                        class="quantity-input"
                        input-class="text-center"
                      />
                      <q-btn
                        flat
                        size="sm"
                        icon="add"
                        @click="increaseQuantity(getOriginalIndex(detail))"
                        :disable="transactionType === 'sell' && detail.quantity >= getAvailableQuantity(detail.item)"
                        color="positive"
                        class="quantity-btn"
                      />
                    </div>
                    <div v-if="transactionType === 'sell' && getAvailableQuantity(detail.item)" class="quantity-progress">
                      <q-linear-progress
                        :value="detail.quantity / getAvailableQuantity(detail.item)"
                        :color="getQuantityProgressColor(detail.quantity, getAvailableQuantity(detail.item))"
                        size="4px"
                        rounded
                        class="q-mt-xs"
                      />
                      <div class="progress-text">
                        {{ detail.quantity }} / {{ getAvailableQuantity(detail.item) }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right: Total & Actions -->
                <div class="item-actions-section">
                  <div class="item-total">
                    <div class="total-label">{{ t('blumTransaction.totalUSD') }}</div>
                    <div class="total-value">${{ formatCurrency(detail.quantity * detail.unit_price) }}</div>
                  </div>
                  <q-btn
                    @click="removeDetail(getOriginalIndex(detail))"
                    icon="close"
                    flat
                    round
                    color="negative"
                    size="sm"
                    class="remove-btn"
                  >
                    <q-tooltip>{{ t('common.remove') }}</q-tooltip>
                  </q-btn>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Sets Column -->
        <div v-if="setItems.length > 0" class="sets-section">
          <div class="subsection-title">
            <q-icon name="folder" class="q-mr-sm" />
            {{ t('blumTransaction.sets') }} ({{ setItems.length }})
          </div>
          <div class="sets-column">
            <q-card
              v-for="(detail, originalIndex) in setItems"
              :key="`set-${originalIndex}`"
              flat
              bordered
              class="set-item-card q-mb-md"
            >
              <q-card-section class="set-content">
                <!-- Set Header -->
                <div class="set-header">
                  <div class="set-main-info">
                    <div class="set-avatar">
                      <q-avatar size="64px" rounded class="set-avatar-enhanced">
                        <img
                          v-if="detail.set?.image"
                          :src="detail.set.image"
                          :alt="detail.set.title || detail.set.name"
                          style="object-fit: cover;"
                        />
                        <q-icon v-else name="folder" size="32px" color="grey-6" />
                      </q-avatar>
                    </div>
                    <div class="set-info">
                      <div class="set-name">{{ detail.set?.title || detail.set?.name }}</div>
                      <div class="set-code">{{ t('blumTransaction.setId') }}: {{ detail.set?.id }}</div>
                      <div class="set-meta">
                        <q-chip size="sm" color="grey-4" text-color="dark" icon="inventory">
                          {{ detail.set_items?.length || 0 }} {{ t('blumTransaction.components') }}
                        </q-chip>
                        <q-chip v-if="detail.set?.description" size="sm" color="blue-grey-4" text-color="white" icon="description">
                          {{ detail.set.description }}
                        </q-chip>
                      </div>
                      <div v-if="detail.set?.created_at" class="set-created">
                        <q-icon name="schedule" size="xs" class="q-mr-xs" />
                        {{ t('blumTransaction.created') }}: {{ formatDate(detail.set.created_at) }}
                      </div>
                    </div>
                  </div>
                  <div class="set-actions">
                    <q-btn
                      @click="removeDetail(getOriginalIndex(detail))"
                      icon="close"
                      flat
                      round
                      color="negative"
                      size="sm"
                      class="remove-btn"
                    >
                      <q-tooltip>{{ t('common.remove') }}</q-tooltip>
                    </q-btn>
                  </div>
                </div>

                <!-- Set Quantity Control (moved below header) -->
                <div class="set-quantity-section">
                  <div class="set-quantity-control">
                    <span class="quantity-label">{{ t('blumTransaction.setQuantity') }}:</span>
                    <div class="quantity-controls-buttons">
                      <q-btn
                        flat
                        size="sm"
                        icon="remove"
                        @click="decreaseQuantity(getOriginalIndex(detail))"
                        :disable="detail.quantity <= 1"
                        color="negative"
                        class="quantity-btn"
                      />
                      <span class="quantity-display">{{ detail.quantity }}</span>
                      <q-btn
                        flat
                        size="sm"
                        icon="add"
                        @click="increaseQuantity(getOriginalIndex(detail))"
                        color="positive"
                        class="quantity-btn"
                      />
                    </div>
                  </div>
                </div>

                <!-- Set Pricing -->
                <div class="set-pricing q-mt-md">
                  <div class="pricing-row">
                    <div class="set-cost-display">
                      <span class="cost-label">{{ t('blumTransaction.setCost') }}:</span>
                      <span class="cost-value">{{ formatCurrency(detail.set?.set_cost || 0) }}</span>
                    </div>
                    <div class="set-price-inputs">
                      <div class="set-price-input">
                        <q-input
                          v-model.number="detail.unit_price"
                          :label="t('blumTransaction.setPriceUSD')"
                          type="number"
                          min="0"
                          step="0.01"
                          outlined
                          dense
                          @update:model-value="updateItemTotal(getOriginalIndex(detail))"
                        >
                          <template v-slot:prepend>
                            <q-icon name="attach_money" />
                          </template>
                        </q-input>
                      </div>
                      <div class="set-price-input">
                        <q-input
                          v-model.number="detail.solo_unit_price"
                          :label="t('blumTransaction.soloSetPriceUSD')"
                          type="number"
                          min="0"
                          step="0.01"
                          outlined
                          dense
                          @update:model-value="updateItemTotal(getOriginalIndex(detail))"
                        >
                          <template v-slot:prepend>
                            <q-icon name="monetization_on" />
                          </template>
                        </q-input>
                      </div>
                    </div>
                  </div>
                  <div class="set-total">
                    <span class="total-label">{{ t('blumTransaction.setTotal') }}:</span>
                    <span class="total-value">{{ formatCurrency(detail.quantity * detail.unit_price) }}</span>
                  </div>
                </div>

                <!-- Set Items with Individual Quantities -->
                <div v-if="detail.set_items?.length" class="set-items-config q-mt-lg">
                  <div class="set-items-title">
                    <q-icon name="settings" class="q-mr-sm" />
                    {{ t('blumTransaction.configureSetItems') }}
                    <q-chip size="sm" color="info" text-color="white" class="q-ml-sm">
                      {{ detail.set_items.length }} {{ t('blumTransaction.items') }}
                    </q-chip>
                  </div>
                  <div class="set-items-grid">
                    <q-card
                      v-for="(setItem, itemIndex) in detail.set_items"
                      :key="`set-item-${itemIndex}`"
                      flat
                      bordered
                      class="set-item-config-card"
                      :class="{
                        'item-at-limit': setItem.quantity >= getOriginalSetItemQuantity(detail.set, setItem.id),
                        'item-warning': setItem.quantity > getOriginalSetItemQuantity(detail.set, setItem.id) * 0.8
                      }"
                    >
                      <q-card-section class="set-item-config-content">
                        <div class="set-item-header">
                          <div class="set-item-info">
                            <div class="set-item-name">{{ setItem.name }}</div>
                            <div class="set-item-code">
                              <span class="item-code-chip">
                                <q-icon name="qr_code" size="xs" class="q-mr-xs" />
                                {{ setItem.code }}
                              </span>
                              <span class="item-part-chip">
                                <q-icon name="tag" size="xs" class="q-mr-xs" />
                                {{ setItem.part_no }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div class="set-item-availability">
                          <div class="availability-info">
                            <span class="available-label">{{ t('blumTransaction.available') }}:</span>
                            <span class="available-value">{{ getOriginalSetItemQuantity(detail.set, setItem.id) }}</span>
                          </div>
                          <div class="usage-bar">
                            <q-linear-progress
                              :value="setItem.quantity / getOriginalSetItemQuantity(detail.set, setItem.id)"
                              :color="getQuantityProgressColor(setItem.quantity, getOriginalSetItemQuantity(detail.set, setItem.id))"
                              size="4px"
                              rounded
                            />
                          </div>
                        </div>

                        <div class="set-item-quantity-control">
                          <span class="quantity-label">{{ t('blumTransaction.using') }}:</span>
                          <div class="quantity-controls-buttons">
                            <q-btn
                              flat
                              size="xs"
                              icon="remove"
                              @click="decreaseSetItemQuantity(getOriginalIndex(detail), itemIndex)"
                              :disable="setItem.quantity <= 1"
                              color="negative"
                            />
                            <span class="quantity-display" :class="{
                              'quantity-warning': setItem.quantity > getOriginalSetItemQuantity(detail.set, setItem.id) * 0.8,
                              'quantity-error': setItem.quantity > getOriginalSetItemQuantity(detail.set, setItem.id)
                            }">
                              {{ setItem.quantity }}
                            </span>
                            <q-btn
                              flat
                              size="xs"
                              icon="add"
                              @click="increaseSetItemQuantity(getOriginalIndex(detail), itemIndex)"
                              :disable="setItem.quantity >= getOriginalSetItemQuantity(detail.set, setItem.id)"
                              color="positive"
                            />
                          </div>
                        </div>

                        <!-- Quantity Warning -->
                        <div v-if="setItem.quantity > getOriginalSetItemQuantity(detail.set, setItem.id)" class="quantity-warning-message">
                          <q-icon name="warning" size="xs" class="q-mr-xs" />
                          {{ t('blumTransaction.quantityExceedsAvailable') }}
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!itemSearchLoading && !setSearchLoading && currentSearchResults.length === 0 && !hasSearchQuery" class="empty-state q-mt-lg">
        <q-card flat bordered class="empty-state-card">
          <q-card-section class="text-center q-py-xl">
            <q-icon name="inventory" size="80px" class="text-grey-4 q-mb-md" />
            <div class="text-h6 text-grey-6 q-mb-sm">{{ t('blumTransaction.searchToBegin') }}</div>
            <div class="text-body2 text-grey-5 q-mb-lg">
              {{ t('blumTransaction.searchHint') }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBlumStore } from 'src/stores/blumStore';
import { useWarehouseStore } from 'src/stores/warehouseStore';
import { debounce } from 'quasar';
import { showNotify } from 'src/composables/Notify';

// Props & Emits
interface Props {
  formData: any;
  transactionType: 'sell' | 'purchase';
  validationErrors: Record<string, string>;
}

interface Emits {
  (_e: 'update:formData', _value: any): void;
  (_e: 'validate', _stepNumber: number, _isValid: boolean): void;
  (_e: 'next'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();
const blumStore = useBlumStore();
const warehouseStore = useWarehouseStore();

// Local state
const activeSearchTab = ref(props.transactionType === 'sell' ? 'items' : 'items');
const itemSearchQuery = ref('');
const setSearchQuery = ref('');
const itemSearchResults = ref<any[]>([]);
const setSearchResults = ref<any[]>([]);
const itemSearchLoading = ref(false);
const setSearchLoading = ref(false);

// Computed properties
const formData = computed({
  get: () => props.formData,
  set: (value: any) => emit('update:formData', value)
});

const currentSearchResults = computed(() => {
  return activeSearchTab.value === 'items' ? itemSearchResults.value : setSearchResults.value;
});

const hasSearchQuery = computed(() => {
  return itemSearchQuery.value.trim() || setSearchQuery.value.trim();
});

const isStepValid = computed(() => {
  return formData.value.details.length > 0;
});

// Separate individual items and sets for different layouts
const individualItems = computed(() => {
  return formData.value.details.filter((detail: any) => detail.type === 'item');
});

const setItems = computed(() => {
  return formData.value.details.filter((detail: any) => detail.type === 'set');
});

// Helper methods
const isItemSelected = (itemId: number): boolean => {
  return formData.value.details.some((detail: any) => detail.type === 'item' && detail.item_id === itemId);
};

const isSetSelected = (setId: number): boolean => {
  return formData.value.details.some((detail: any) => detail.type === 'set' && detail.set_id === setId);
};

// Get available quantity for an item (handles both field names)
const getAvailableQuantity = (item: any): number => {
  return item?.total_quantity || item?.quantity || 0;
};

// Get original index for items/sets in filtered arrays
const getOriginalIndex = (detail: any): number => {
  return formData.value.details.findIndex((d: any) =>
    d === detail ||
    (d.type === detail.type &&
     ((d.type === 'item' && d.item_id === detail.item_id) ||
      (d.type === 'set' && d.set_id === detail.set_id)))
  );
};

// Get original available quantity for a set item
const getOriginalSetItemQuantity = (set: any, itemId: number): number => {
  const originalItem = set?.items?.find((item: any) => item.id === itemId);
  return originalItem?.quantity || 0;
};

// Get progress color based on quantity usage
const getQuantityProgressColor = (current: number, available: number): string => {
  const ratio = current / available;
  if (ratio > 1) return 'negative';
  if (ratio > 0.8) return 'warning';
  if (ratio > 0.6) return 'orange';
  return 'positive';
};

// Debounced search functions
const onItemSearchInputDebounced = debounce((value: string) => {
  // For purchase transactions, allow search even with empty value
  // For sell transactions, only search if there's a value and warehouse is selected
  if (props.transactionType === 'purchase' || value.trim()) {
     void onSearchItems();
  } else {
    itemSearchResults.value = [];
  }
}, 500);

const onSetSearchInputDebounced = debounce((_value: string) => {
  // Always allow set search (even with empty value to fetch all sets)
  void onSearchSets();
}, 500);

// Methods
async function onSearchItems() {
  itemSearchLoading.value = true;
  try {
    if (props.transactionType === 'purchase') {
      // For purchase transactions, search all blum items or fetch all if empty query
      if (!itemSearchQuery.value || !itemSearchQuery.value.trim()) {
        // Fetch all Blum items when search is empty for purchase
        await blumStore.fetchBlumItems();
        itemSearchResults.value = [...blumStore.blumItems];
      } else {
        // Search with query for purchase
        await blumStore.searchBlumItems(itemSearchQuery.value.trim());
        itemSearchResults.value = [...blumStore.blumItems];
      }
    } else {
      // For sell transactions, search warehouse blum items
      if (!formData.value.warehouse_id) {
        showNotify({
          type: 'warning',
          message: t('blumTransaction.selectWarehouseFirst', 'Please select a warehouse first'),
          position: 'top',
          duration: 3000,
        });
        return;
      }

      const query = itemSearchQuery.value?.trim() || '';
      const warehouseData = await warehouseStore.searchWarehouseBlumItems(formData.value.warehouse_id, query);
      if (warehouseData && warehouseData.blum_items) {
        itemSearchResults.value = [...warehouseData.blum_items];
      } else {
        itemSearchResults.value = [];
      }
    }
  } catch (error) {
    console.error('Error searching items:', error);
    itemSearchResults.value = [];
    showNotify({
      type: 'negative',
      message: t('blumTransaction.searchError', 'Error searching items'),
      position: 'top',
      duration: 3000,
    });
  } finally {
    itemSearchLoading.value = false;
  }
}

async function onSearchSets() {
  setSearchLoading.value = true;
  try {
    if (!setSearchQuery.value || !setSearchQuery.value.trim()) {
      // Fetch all sets when search is empty
      await blumStore.fetchBlumSets();
      setSearchResults.value = [...blumStore.blumSets];
    } else {
      // Search with query
      await blumStore.searchBlumSets(setSearchQuery.value.trim());
      setSearchResults.value = [...blumStore.blumSets];
    }
  } catch (error) {
    console.error('Error searching sets:', error);
    setSearchResults.value = [];
    showNotify({
      type: 'negative',
      message: t('blumTransaction.searchError', 'Error searching sets'),
      position: 'top',
      duration: 3000,
    });
  } finally {
    setSearchLoading.value = false;
  }
}

function clearItemSearchResults() {
  itemSearchQuery.value = '';
  itemSearchResults.value = [];
}

function clearSetSearchResults() {
  setSearchQuery.value = '';
  setSearchResults.value = [];
}

function clearCurrentSearchResults() {
  if (activeSearchTab.value === 'items') {
    clearItemSearchResults();
  } else {
    clearSetSearchResults();
  }
}

function addItemToTransaction(item: any) {
  if (isItemSelected(item.id)) {
    return; // Already selected
  }

  // For sell transactions, check if item has available quantity
  const availableQuantity = getAvailableQuantity(item);
  if (props.transactionType === 'sell' && availableQuantity <= 0) {
    showNotify({
      type: 'warning',
      message: t('blumTransaction.noAvailableQuantity', 'This item has no available quantity'),
      position: 'top',
      duration: 3000,
    });
    return;
  }

  const detail: any = {
    quantity: 1,
    unit_price: item.unit_price || item.price || 0,
    solo_unit_price: item.solo_unit_price || item.price || 0,
    type: 'item',
    item_id: item.id,
    item: item
  };

  formData.value.details.push(detail);
  calculateTotals();
  validateStep();
}

function addSetToTransaction(set: any) {
  if (isSetSelected(set.id)) {
    return; // Already selected
  }

  const detail: any = {
    quantity: 1,
    unit_price: set.set_price || 0, // Use set_price from the set data
    solo_unit_price: set.solo_set_price || set.set_price || 0,
    type: 'set',
    set_id: set.id,
    set: set,
    set_items: set.items ? set.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      part_no: item.part_no,
      quantity: item.quantity || 1
    })) : []
  };

  formData.value.details.push(detail);
  calculateTotals();
  validateStep();
}

function increaseQuantity(index: number) {
  const detail = formData.value.details[index];

  // For sell transactions, check available quantity limit
  if (props.transactionType === 'sell' && detail.type === 'item') {
    const availableQuantity = getAvailableQuantity(detail.item);
    if (detail.quantity >= availableQuantity) {
      showNotify({
        type: 'warning',
        message: t('blumTransaction.quantityExceedsAvailable', { quantity: availableQuantity }),
        position: 'top',
        duration: 3000,
      });
      return;
    }
  }

  detail.quantity++;
  updateItemTotal(index);
}

function decreaseQuantity(index: number) {
  const detail = formData.value.details[index];
  if (detail.quantity > 1) {
    detail.quantity--;
    updateItemTotal(index);
  }
}

function onQuantityManualChange(index: number, newQuantity: number) {
  const detail = formData.value.details[index];

  // Validate quantity
  if (!newQuantity || newQuantity < 1) {
    detail.quantity = 1;
    showNotify({
      type: 'warning',
      message: t('blumTransaction.quantityMinimum', 'Quantity must be at least 1'),
      position: 'top',
      duration: 2000,
    });
    updateItemTotal(index);
    return;
  }

  // For sell transactions, check available quantity limit
  if (props.transactionType === 'sell' && detail.type === 'item') {
    const availableQuantity = getAvailableQuantity(detail.item);
    if (newQuantity > availableQuantity) {
      detail.quantity = availableQuantity;
      showNotify({
        type: 'warning',
        message: t('blumTransaction.quantityExceedsAvailable', { quantity: availableQuantity }),
        position: 'top',
        duration: 3000,
      });
      updateItemTotal(index);
      return;
    }
  }

  detail.quantity = Math.floor(newQuantity); // Ensure integer
  updateItemTotal(index);
}

function updateItemTotal(_index: number) {
  calculateTotals();
  validateStep();
}

function removeDetail(index: number) {
  formData.value.details.splice(index, 1);
  calculateTotals();
  validateStep();
}

function increaseSetItemQuantity(detailIndex: number, itemIndex: number) {
  const detail = formData.value.details[detailIndex];
  if (detail.type === 'set' && detail.set_items && detail.set_items[itemIndex]) {
    detail.set_items[itemIndex].quantity++;
    // Optionally recalculate totals if set pricing depends on item quantities
    calculateTotals();
    validateStep();
  }
}

function decreaseSetItemQuantity(detailIndex: number, itemIndex: number) {
  const detail = formData.value.details[detailIndex];
  if (detail.type === 'set' && detail.set_items && detail.set_items[itemIndex]) {
    if (detail.set_items[itemIndex].quantity > 1) {
      detail.set_items[itemIndex].quantity--;
      // Optionally recalculate totals if set pricing depends on item quantities
      calculateTotals();
      validateStep();
    }
  }
}

function calculateTotals() {
  const totals = formData.value.details.reduce((acc: any, detail: any) => {
    // unit_price is entered in USD, so calculate USD total first
    const itemTotalUSD = detail.quantity * detail.unit_price;
    acc.total_usd += itemTotalUSD;
    return acc;
  }, { total_usd: 0 });

  // Calculate IQD and EUR totals based on exchange rates
  const iqd_total = totals.total_usd * (formData.value.usd_iqd_rate || 1500);
  const eur_total = totals.total_usd / (formData.value.eur_usd_rate || 1.1);

  formData.value.total_usd = totals.total_usd;
  formData.value.total_price = iqd_total; // IQD total
  formData.value.total_eur = eur_total;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount || 0);
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

function validateStep() {
  emit('validate', 2, isStepValid.value);
}

// Watchers
watch(isStepValid, (newValue) => {
  emit('validate', 2, newValue);
}, { immediate: true });

watch(() => formData.value.details, () => {
  calculateTotals();
  validateStep();
}, { deep: true });

// Lifecycle
onMounted(() => {
  validateStep();
});
</script>

<style scoped lang="scss">
@import "src/css/quasar.variables.scss";

.item-selection-step {
  .step-container {
    max-width: 1000px;
    margin: 0 auto;
  }

  .step-header {
    text-align: center;
    margin-bottom: 2rem;

    .step-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: $grey-8;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .step-description {
      color: $grey-6;
      font-size: 0.95rem;
      line-height: 1.4;
    }
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: $primary;
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }

  .search-section {
    .search-card {
      border-radius: 12px;
      border: 2px solid $blue-3;
      background: $blue-1;
    }

    .search-tabs {
      .q-tabs {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }

    .search-btn {
      height: 56px;
      border-radius: 8px;
    }
  }

  .search-results {
    .text-subtitle2 {
      font-weight: 600;
      color: $primary;
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
    }

    .search-results-container {
      max-height: 500px;
      overflow-y: auto;
      border-radius: 8px;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: $grey-2;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: $grey-5;
        border-radius: 3px;

        &:hover {
          background: $grey-6;
        }
      }
    }

    .item-search-list {
      border-radius: 12px;
      overflow: hidden;

      .item-list-item {
        padding: 16px;
        border-bottom: 1px solid $grey-3;
        transition: all 0.2s ease;
        border-left: 4px solid transparent;

        &:hover {
          background-color: rgba(25, 118, 210, 0.04);
          border-left-color: $primary;
        }

        &:last-child {
          border-bottom: none;
        }

        .item-avatar-enhanced {
          border: 3px solid $blue-2;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        &:hover .item-avatar-enhanced {
          border-color: $primary;
          transform: scale(1.05);
        }

        .item-name {
          font-size: 16px;
          font-weight: 600;
          color: $primary;
          margin-bottom: 4px;
          line-height: 1.3;
        }

        .item-details {
          margin: 6px 0;

          .item-codes {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .item-code-chip, .item-part-chip, .item-info-chip {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(25, 118, 210, 0.1);
            color: $primary;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            gap: 4px;
            white-space: nowrap;
            vertical-align: middle;
            line-height: 1.2;
          }

          .item-info-chip {
            background-color: rgba(76, 175, 80, 0.1);
            color: #2e7d32;

            .q-icon {
              font-size: 12px;
            }
          }
        }

        .item-pricing {
          margin-top: 8px;

          .price-display {
            color: $primary;
            font-weight: 700;
            font-size: 14px;
          }
        }
      }
    }

    .set-search-list {
      border-radius: 12px;
      overflow: hidden;

      .set-list-item {
        padding: 16px;
        border-bottom: 1px solid $grey-3;
        transition: all 0.2s ease;
        border-left: 4px solid transparent;

        &:hover {
          background-color: rgba(81, 45, 168, 0.04);
          border-left-color: $secondary;
        }

        &:last-child {
          border-bottom: none;
        }

        .set-avatar-enhanced {
          border: 3px solid #f3e5f5;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        &:hover .set-avatar-enhanced {
          border-color: $secondary;
          transform: scale(1.05);
        }

        .set-name {
          font-size: 16px;
          font-weight: 600;
          color: $secondary;
          margin-bottom: 4px;
          line-height: 1.3;
        }

        .set-details {
          margin: 6px 0;

          .set-info-row {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .set-id-chip, .items-count-chip {
            background-color: rgba(81, 45, 168, 0.1);
            color: $secondary;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
        }

        .set-pricing {
          margin-top: 8px;

          .price-display {
            color: $secondary;
            font-weight: 700;
            font-size: 14px;
          }
        }

        .set-items-preview {
          margin-top: 8px;

          .items-preview-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            align-items: center;

            .preview-chip, .more-chip {
              display: inline-flex;
              align-items: center;
              vertical-align: middle;

              .item-quantity {
                margin-left: 4px;
                font-weight: 600;
              }
            }
          }
        }
      }
    }
  }

  .item-preview-section {
    .item-preview-card {
      border: 2px solid $primary;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%);

      .preview-content {
        .preview-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid $grey-3;

          .preview-avatar {
            border: 3px solid $primary;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .preview-info {
            flex: 1;

            .preview-name {
              font-size: 1.25rem;
              font-weight: 700;
              color: $primary;
              margin-bottom: 0.5rem;
            }

            .preview-codes {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;

              .code-chip, .part-chip {
                background-color: rgba(25, 118, 210, 0.1);
                color: $primary;
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 4px;
              }
            }
          }

          .preview-price {
            text-align: center;
            padding: 1rem;
            background: $blue-1;
            border-radius: 8px;
            border: 1px solid $blue-3;

            .price-label {
              font-size: 0.85rem;
              color: $grey-6;
              margin-bottom: 0.25rem;
            }

            .price-value {
              font-size: 1.5rem;
              font-weight: 700;
              color: $primary;
            }
          }
        }

        .preview-actions {
          display: flex;
          justify-content: center;

          .add-to-transaction-btn {
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
          }
        }
      }
    }
  }

  .selected-items {
    .section-title {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;

      .q-chip {
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
      }
    }

    .subsection-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: $primary;
      display: flex;
      align-items: center;
      margin-bottom: 0.75rem;
      padding: 0.5rem 0;
      border-bottom: 2px solid $grey-3;
    }

    // Individual Items Row Layout
    .individual-items-section {
      .subsection-title {
        font-size: 1rem;
        font-weight: 600;
        color: $primary;
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
      }

      // New full-width list layout
      .individual-items-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .individual-item-card-fullwidth {
          border-radius: 12px;
          border: 2px solid $grey-3;
          transition: all 0.2s ease;
          background: white;

          &:hover {
            border-color: $primary;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .item-content-horizontal {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            padding: 1rem;

            .item-info-section {
              display: flex;
              align-items: center;
              gap: 1rem;
              flex: 1;
              min-width: 0;

              .item-avatar {
                flex-shrink: 0;
              }

              .item-details {
                flex: 1;
                min-width: 0;

                .item-name {
                  font-weight: 600;
                  color: $grey-8;
                  font-size: 1rem;
                  margin-bottom: 4px;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }

                .item-meta {
                  display: flex;
                  gap: 8px;
                  flex-wrap: wrap;

                  .item-code, .item-part, .item-stock {
                    background-color: $grey-2;
                    color: $grey-7;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    white-space: nowrap;
                  }

                  .item-stock {
                    background-color: rgba(76, 175, 80, 0.1);
                    color: $positive;
                    border: 1px solid rgba(76, 175, 80, 0.3);
                  }
                }
              }
            }

            .item-controls-section {
              display: flex;
              align-items: center;
              gap: 1.5rem;
              flex-shrink: 0;

              .price-inputs-section {
                display: flex;
                flex-direction: column;
                gap: 8px;
                min-width: 140px;

                .price-input {
                  .price-field {
                    min-width: 140px;
                  }
                }
              }

              .price-input {
                .price-field {
                  min-width: 140px;
                }
              }

              .quantity-controls {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                min-width: 120px;

                .quantity-buttons {
                  display: flex;
                  align-items: center;
                  gap: 8px;

                  .quantity-btn {
                    border-radius: 6px;
                    min-width: 32px;
                    height: 32px;
                  }

                  .quantity-input {
                    width: 60px;

                    .q-field__control {
                      height: 32px;
                    }
                  }
                }

                .quantity-progress {
                  width: 100%;

                  .progress-text {
                    font-size: 0.7rem;
                    color: $grey-6;
                    text-align: center;
                    margin-top: 2px;
                  }
                }
              }
            }

            .item-actions-section {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 8px;
              flex-shrink: 0;

              .item-total {
                text-align: center;

                .total-label {
                  font-size: 0.75rem;
                  color: $grey-6;
                  font-weight: 500;
                  display: block;
                  margin-bottom: 2px;
                }

                .total-value {
                  font-weight: 600;
                  color: $primary;
                  font-size: 1rem;
                }
              }

              .remove-btn {
                margin-top: 4px;
              }
            }
          }
        }
      }

      // Legacy row layout (kept for backward compatibility)
      .individual-items-row {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        padding: 8px 0;

        &::-webkit-scrollbar {
          height: 6px;
        }

        &::-webkit-scrollbar-track {
          background: $grey-2;
          border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb {
          background: $grey-5;
          border-radius: 3px;

          &:hover {
            background: $grey-6;
          }
        }
      }

      .individual-item-card {
        min-width: 240px;
        max-width: 280px;
        flex-shrink: 0;
        border-radius: 12px;
        border: 2px solid $grey-3;
        transition: all 0.2s ease;

        &:hover {
          border-color: $primary;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .item-content {
          padding: 12px;

          .item-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;

            .item-avatar {
              flex-shrink: 0;
            }

            .item-info {
              flex: 1;
              min-width: 0;

              .item-name {
                font-weight: 600;
                color: $grey-8;
                font-size: 0.85rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .item-code {
                font-size: 0.75rem;
                color: $grey-6;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }

            .remove-btn {
              flex-shrink: 0;
            }
          }

          .item-controls {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 12px;

            .price-section {
              .q-field {
                font-size: 0.8rem;
              }
            }

            .quantity-section {
              display: flex;
              justify-content: space-between;
              align-items: center;

              .quantity-label {
                font-size: 0.75rem;
                color: $grey-6;
                font-weight: 500;
              }

              .quantity-controls-buttons {
                display: flex;
                align-items: center;
                gap: 0.5rem;

                .quantity-display {
                  font-weight: 600;
                  color: $primary;
                  font-size: 0.9rem;
                  min-width: 1.5rem;
                  text-align: center;
                }
              }
            }
          }

          .item-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 8px;
            border-top: 1px solid $grey-3;

            .total-label {
              font-size: 0.75rem;
              color: $grey-6;
            }

            .total-value {
              font-weight: 600;
              color: $primary;
              font-size: 0.85rem;
            }
          }
        }
      }
    }

    // Sets Column Layout
    .sets-section {
      .sets-column {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .set-item-card {
        border-radius: 12px;
        border: 1px solid $grey-3;
        background: white;
        transition: all 0.2s ease;

        &:hover {
          border-color: $grey-4;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .set-content {
          padding: 1rem;

          .set-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;

            .set-main-info {
              display: flex;
              gap: 1rem;
              flex: 1;

              .set-avatar {
                flex-shrink: 0;

                .set-avatar-enhanced {
                  border: 1px solid $grey-3;
                  box-shadow: none;
                  transition: none;
                }
              }

              .set-info {
                flex: 1;

                .set-name {
                  font-weight: 600;
                  color: $grey-8;
                  font-size: 1.25rem;
                  margin-bottom: 0.5rem;
                  line-height: 1.3;
                }

                .set-code {
                  font-size: 0.85rem;
                  color: $grey-6;
                  margin-bottom: 0.75rem;
                  font-weight: 500;
                }

                .set-meta {
                  display: flex;
                  gap: 8px;
                  align-items: center;
                  flex-wrap: wrap;
                  margin-bottom: 0.5rem;
                }

                .set-created {
                  font-size: 0.75rem;
                  color: $grey-5;
                  display: flex;
                  align-items: center;
                }
              }
            }

            .set-actions {
              display: flex;
              justify-content: flex-end;
              align-items: flex-start;

              .remove-btn {
                background: rgba(244, 67, 54, 0.1);
                border: 1px solid rgba(244, 67, 54, 0.2);

                &:hover {
                  background: rgba(244, 67, 54, 0.15);
                }
              }
            }
          }

          .set-quantity-section {
            margin-bottom: 1rem;
            padding: 0.75rem;
            background: $grey-1;
            border-radius: 8px;
            border: 1px solid $grey-3;

            .set-quantity-control {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 1rem;

              .quantity-label {
                font-size: 0.9rem;
                color: $grey-6;
                font-weight: 500;
                white-space: nowrap;
              }

              .quantity-controls-buttons {
                display: flex;
                align-items: center;
                gap: 0.75rem;

                .quantity-display {
                  font-weight: 600;
                  color: $grey-8;
                  font-size: 1.1rem;
                  min-width: 2.5rem;
                  text-align: center;
                  background: white;
                  padding: 4px 8px;
                  border-radius: 6px;
                  border: 1px solid $grey-3;
                }

                .quantity-btn {
                  border-radius: 6px;
                  min-width: 32px;
                  height: 32px;
                }
              }
            }
          }

          .set-pricing {
            background: $grey-1;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid $grey-3;

            .pricing-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 1rem;
              margin-bottom: 1rem;

              .set-cost-display {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 8px 12px;
                background: rgba(76, 175, 80, 0.1);
                border-radius: 6px;
                border: 1px solid rgba(76, 175, 80, 0.3);

                .cost-label {
                  font-size: 0.8rem;
                  color: $positive;
                  font-weight: 500;
                }

                .cost-value {
                  font-weight: 600;
                  color: $positive;
                  font-size: 0.9rem;
                }
              }

              .set-price-inputs {
                display: flex;
                flex-direction: column;
                gap: 8px;
                flex: 1;
                max-width: 200px;

                .set-price-input {
                  width: 100%;
                }
              }

              .set-price-input {
                flex: 1;
                max-width: 200px;
              }
            }

            .set-total {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 16px;
              background: white;
              border-radius: 6px;
              border: 1px solid $grey-3;

              .total-label {
                font-size: 0.85rem;
                color: $grey-6;
                font-weight: 500;
              }

              .total-value {
                font-weight: 600;
                color: $primary;
                font-size: 1rem;
              }
            }
          }

          .set-items-config {
            .set-items-title {
              font-size: 1rem;
              font-weight: 700;
              color: $grey-7;
              display: flex;
              align-items: center;
              margin-bottom: 1rem;
              padding: 0.75rem 0;
              border-bottom: 2px solid $grey-3;
            }

            .set-items-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
              gap: 12px;
            }

            .set-item-config-card {
              border-radius: 8px;
              border: 1px solid $grey-3;
              background: white;
              transition: all 0.2s ease;

              &.item-at-limit {
                border-color: $negative;
                background: rgba(244, 67, 54, 0.05);
              }

              &.item-warning {
                border-color: $warning;
                background: rgba(255, 152, 0, 0.05);
              }

              &:hover {
                border-color: $grey-4;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
              }

              .set-item-config-content {
                padding: 12px;

                .set-item-header {
                  margin-bottom: 12px;

                  .set-item-info {
                    .set-item-name {
                      font-weight: 500;
                      color: $grey-8;
                      font-size: 0.9rem;
                      margin-bottom: 4px;
                      line-height: 1.3;
                    }

                    .set-item-code {
                      display: flex;
                      gap: 4px;
                      flex-wrap: wrap;

                      .item-code-chip, .item-part-chip {
                        background-color: $grey-2;
                        color: $grey-7;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-size: 0.7rem;
                        font-weight: 500;
                        display: inline-flex;
                        align-items: center;
                        gap: 2px;
                      }
                    }
                  }
                }

                .set-item-availability {
                  margin-bottom: 12px;

                  .availability-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;

                    .available-label {
                      font-size: 0.75rem;
                      color: $grey-6;
                      font-weight: 500;
                    }

                    .available-value {
                      font-weight: 600;
                      color: $grey-8;
                      font-size: 0.85rem;
                    }
                  }

                  .usage-bar {
                    height: 4px;
                    background: $grey-3;
                    border-radius: 2px;
                    overflow: hidden;

                    .usage-fill {
                      height: 100%;
                      background: $primary;
                      transition: width 0.3s ease;
                    }
                  }
                }

                .set-item-quantity-control {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;

                  .quantity-label {
                    font-size: 0.75rem;
                    color: $grey-6;
                    font-weight: 500;
                  }

                  .quantity-controls-buttons {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .quantity-display {
                      font-weight: 600;
                      color: $grey-8;
                      font-size: 0.9rem;
                      min-width: 2rem;
                      text-align: center;
                      background: $grey-1;
                      padding: 4px 8px;
                      border-radius: 4px;
                      border: 1px solid $grey-3;

                      &.quantity-warning {
                        color: $warning;
                        border-color: $warning;
                        background: rgba(255, 152, 0, 0.1);
                      }

                      &.quantity-error {
                        color: $negative;
                        border-color: $negative;
                        background: rgba(244, 67, 54, 0.1);
                      }
                    }
                  }
                }

                .quantity-warning-message {
                  margin-top: 8px;
                  padding: 6px 8px;
                  background: rgba(244, 67, 54, 0.1);
                  border: 1px solid rgba(244, 67, 54, 0.3);
                  border-radius: 4px;
                  color: $negative;
                  font-size: 0.75rem;
                  font-weight: 500;
                  display: flex;
                  align-items: center;
                }
              }
            }
          }
        }
      }
    }

    // Legacy grid layout (kept for backward compatibility)
    .selected-items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    .selected-item-card {
      border-radius: 12px;
      border: 2px solid $grey-3;
      transition: all 0.2s ease;

      &:hover {
        border-color: $primary;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        .item-name {
          font-weight: 600;
          color: $grey-8;
        }

        .item-code {
          font-size: 0.8rem;
          color: $grey-6;
        }
      }

      .basic-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 1rem;

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;

          .label {
            font-size: 0.85rem;
            color: $grey-6;
          }

          .value {
            font-weight: 500;
            color: $grey-8;

            &.total-value {
              color: $primary;
              font-weight: 600;
            }
          }
        }
      }

      .quantity-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid $grey-3;

        .quantity-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .quantity-label {
            font-size: 0.85rem;
            color: $grey-6;
            font-weight: 500;
          }

          .quantity-controls-buttons {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            .quantity-display {
              font-weight: 600;
              color: $primary;
              font-size: 1rem;
              min-width: 2rem;
              text-align: center;
            }
          }
        }

        .price-section {
          flex-shrink: 0;
        }
      }

      .set-items-list {
        max-height: 100px;
        overflow-y: auto;
      }
    }

    // Add item-selected class styling
    .item-selected {
      background-color: rgba(76, 175, 80, 0.08) !important;
      border-left-color: $positive !important;

      .item-name {
        color: $positive !important;
        font-weight: 600;
      }
    }

    .empty-state-card {
      border: 2px dashed $grey-4;
      border-radius: 12px;
      background: $grey-1;
    }
  }

  .set-items-config {
    .set-items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 8px;
    }
  }
}

// Dark mode support
.body--dark {
  .item-selection-step {
    .step-header {
      .step-title {
        color: $grey-1;
      }
    }

    .search-section {
      .search-card {
        background: rgba(33, 150, 243, 0.1);
        border-color: rgba(33, 150, 243, 0.3);
      }
    }

    .search-results {
      .search-results-container {
        .item-search-list {
          .item-list-item {
            border-bottom-color: #424242;

            &:hover {
              background-color: rgba(25, 118, 210, 0.08);
            }

            &.item-selected {
              background-color: rgba(76, 175, 80, 0.12);
            }
          }

          .item-name {
            color: #64b5f6;
          }

          .item-avatar-enhanced {
            border-color: #424242;
          }
        }
      }
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .item-selection-step {
    .step-header {
      margin-bottom: 1.5rem;

      .step-title {
        font-size: 1.25rem;
      }

      .step-description {
        font-size: 0.9rem;
      }
    }

    .item-preview-section {
      .item-preview-card {
        .preview-content {
          .preview-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;

            .preview-info {
              text-align: center;
            }

            .preview-price {
              margin: 0;
            }
          }
        }
      }
    }

    .search-results {
      .search-results-container {
        .item-search-list {
          .item-list-item {
            padding: 16px 12px;
          }

          .item-avatar-enhanced {
            width: 48px !important;
            height: 48px !important;
          }

          .item-action-section {
            .q-btn {
              padding: 8px;
            }
          }
        }
      }
    }

    .selected-items {
      .individual-items-section {
        .individual-items-row {
          flex-direction: column;
          gap: 8px;
        }

        .individual-item-card {
          min-width: unset;
          max-width: unset;

          .item-content {
            .item-controls {
              .quantity-section {
                flex-direction: column;
                align-items: stretch;
                gap: 8px;

                .quantity-controls-buttons {
                  justify-content: center;
                }
              }
            }
          }
        }
      }

      .sets-section {
        .set-item-card {
          .set-content {
            .set-header {
              flex-direction: column;
              align-items: stretch;
              gap: 1rem;

              .set-main-info {
                flex-direction: column;
                align-items: center;
                text-align: center;
                gap: 0.5rem;
              }

              .set-actions {
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
              }
            }

            .set-items-config {
              .set-items-grid {
                grid-template-columns: 1fr;
              }
            }
          }
        }
      }

      .selected-items-grid {
        grid-template-columns: 1fr;
      }

      .selected-item-card {
        .basic-info {
          grid-template-columns: 1fr;
        }

        .quantity-controls {
          flex-direction: column;
          align-items: stretch;
          gap: 1rem;

          .quantity-section {
            justify-content: space-between;
          }

          .price-section {
            width: 100%;

            .q-input {
              width: 100% !important;
            }
          }
        }
      }
    }
  }
}

// Global chip styling improvements
.q-chip {
  display: inline-flex !important;
  align-items: center !important;
  vertical-align: middle !important;

  .q-icon {
    vertical-align: middle !important;
  }
}

// Improve general text and icon alignment
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .q-icon {
    vertical-align: middle;
  }
}
</style>
