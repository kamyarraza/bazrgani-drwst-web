<template>
	<component :is="QComp" v-bind="$attrs">
		<template v-for="(_, name) in $slots" v-slot:[name]="slotProps">
			<slot :name="name" v-bind="slotProps" />
		</template>
	</component>
</template>

<script setup lang="ts">
import QtableOptimized from './Qtable/index.vue';

const QComp = QtableOptimized as any;

defineOptions({
	inheritAttrs: true
});
</script>
