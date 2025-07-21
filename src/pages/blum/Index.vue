<template>
  <q-page class="q-pa-md">
    <!-- Header Card -->
    <Header
      title="Blum Components"
      subtitle="Manage Blum items and sets"
      icon="view_in_ar"
      icon-size="3rem"
      icon-color="white"
      :show-waves="true"
      background-color="linear-gradient(135deg, var(--q-primary) 0%, #1976d2 100%)"
    />

    <!-- Quick Navigation Cards -->
    <div class="row q-col-gutter-md q-py-lg">
      <div class="col-12 col-md-6">
        <q-card class="blum-card cursor-pointer" v-ripple @click="navigateTo('/blum-section/items')">
          <q-card-section horizontal>
            <q-card-section class="q-pa-md col-8">
              <div class="text-h5">Blum Items</div>
              <div class="text-subtitle2 q-mt-sm">Manage individual Blum components</div>
              <div class="q-mt-md">
                <q-btn outline rounded color="primary" label="View Items" icon="inventory_2" size="sm" />
              </div>
            </q-card-section>
            <q-card-section class="col-4 flex flex-center">
              <q-icon name="inventory_2" color="primary" size="5rem" />
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card class="blum-card cursor-pointer" v-ripple @click="navigateTo('/blum-section/sets')">
          <q-card-section horizontal>
            <q-card-section class="q-pa-md col-8">
              <div class="text-h5">Blum Sets</div>
              <div class="text-subtitle2 q-mt-sm">Manage sets of Blum components</div>
              <div class="q-mt-md">
                <q-btn outline rounded color="accent" label="View Sets" icon="category" size="sm" />
              </div>
            </q-card-section>
            <q-card-section class="col-4 flex flex-center">
              <q-icon name="category" color="accent" size="5rem" />
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Overview Section -->
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Overview</div>
            <q-separator class="q-my-md" />

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-list bordered separator>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon color="primary" name="info" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Blum Items</q-item-label>
                      <q-item-label caption>Individual components with unique codes and part numbers</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-icon color="primary" name="assignment" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Blum Sets</q-item-label>
                      <q-item-label caption>Collections of items bundled together</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
              <div class="col-12 col-md-6">
                <q-card flat class="bg-grey-2">
                  <q-card-section>
                    <div class="text-subtitle1">Getting Started</div>
                    <div class="q-mt-sm">
                      <ol>
                        <li>First, create Blum items with their details</li>
                        <li>Then, create sets by selecting items and specifying quantities</li>
                        <li>Use the items and sets in transactions</li>
                      </ol>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Header from 'src/components/common/Header.vue';
import { useBlumStore } from 'src/stores/blumStore';

const router = useRouter();
const blumStore = useBlumStore();

async function navigateTo(path: string) {
  await router.push(path);
}

onMounted(async () => {
  // Preload data for better UX
  await blumStore.fetchBlumItems();
  await blumStore.fetchBlumSets();
});
</script>

<style lang="scss" scoped>
.blum-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}
</style>
