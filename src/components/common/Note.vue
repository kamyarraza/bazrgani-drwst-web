<template>
  <div>
    <!-- Single Note View -->
    <div v-if="!showAllNotes" class="sticky-note" :style="noteStyle">
      <div class="note-header" @mousedown="onHeaderMouseDown">
        <span class="note-timestamp">{{ timestamp }}</span>
        <q-btn icon="drag_indicator" flat dense class="drag-handle" @mousedown.stop="onHeaderMouseDown" />
        <q-btn icon="close" flat dense @click="closeNote" class="close-btn" />
      </div>
      <q-input v-model="userTypedContent" type="textarea" placeholder="Write your note..." autogrow borderless class="note-content" @update:model-value="handleContentChange" />
    </div>

    <!-- All Notes View -->
    <div v-else class="notes-list" :style="notesListStyle">
      <div class="notes-header">
        <span>All Notes</span>
        <q-btn icon="close" flat dense @click="closeAllNotes" />
      </div>
      <div class="notes-container">
        <div v-if="!meStore.me?.sticky_notes?.length" class="no-notes">
          No notes available
        </div>
        <div v-else v-for="(note, index) in meStore.me.sticky_notes" :key="note.id || `note-${index}`" class="note-item">
          <div class="note-item-content">{{ note.content }}</div>
          <div class="note-item-actions">
            <q-btn icon="edit" flat dense size="sm" @click="editNote(note)" />
            <q-btn icon="delete" flat dense size="sm" @click="deleteNote(note.id as string)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useMeStore } from 'src/stores/meStore'
import { date } from 'quasar'
import type { StickyNote } from 'src/types/auth'
import { showNotify } from 'src/composables/Notify'

const meStore = useMeStore()

const props = defineProps<{
  noteType?: 'new' | 'all';
}>();

const emit = defineEmits(['close'])
const currentNote = ref<StickyNote>({ content: '', user_id: '', created_at: new Date(), updated_at: new Date() })
const timestamp = ref(date.formatDate(new Date(), 'HH:mm:ss'))
const saveTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
// Initialize showAllNotes based on props to avoid flickering
const showAllNotes = ref(props.noteType === 'all')
const isSaving = ref(false)
const userTypedContent = ref('') // Store user's typed content separately

// Draggable state
const pos = ref({ x: window.innerWidth - 344, y: 24 }) // 320px width + 24px padding
const dragging = ref(false)
let offset = { x: 0, y: 0 }

const noteStyle = computed(() => ({
  background: '#ffffa5',
  boxShadow: '0 4px 16px 0 rgba(0,0,0,0.12)',
  borderRadius: '10px',
  minWidth: '220px',
  maxWidth: '320px',
  minHeight: '140px',
  padding: '12px',
  fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
  position: 'fixed' as const,
  top: pos.value.y + 'px',
  left: pos.value.x + 'px',
  zIndex: 9999,
  margin: '0',
  cursor: dragging.value ? 'grabbing' : 'default',
}))

const notesListStyle = computed(() => ({
  background: 'white',
  boxShadow: '0 4px 16px 0 rgba(0,0,0,0.12)',
  borderRadius: '10px',
  width: '350px',
  maxHeight: '500px',
  position: 'fixed' as const,
  top: '50px',
  right: '50px',
  zIndex: 9999,
  margin: '0',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column' as const,
}))

function onHeaderMouseDown(e: MouseEvent) {
  dragging.value = true
  offset = {
    x: e.clientX - pos.value.x,
    y: e.clientY - pos.value.y
  }
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  if (!dragging.value) return
  pos.value.x = e.clientX - offset.x
  pos.value.y = e.clientY - offset.y
}

function onMouseUp() {
  dragging.value = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

function handleContentChange() {
  // Update timestamp
  timestamp.value = date.formatDate(new Date(), 'HH:mm:ss')
  // console.log(currentNote.value,'wtf')
  // Update the current note content with user typed content
  currentNote.value.content = userTypedContent.value

  // Clear any existing timeout
  if (saveTimeout.value !== null) {
    clearTimeout(saveTimeout.value)
  }

  // Only update if we have an ID (meaning the note was already created)
  if (currentNote.value.id) {

    // Set a new timeout to save the note after 2 seconds of the user typing
    saveTimeout.value = setTimeout(() => {
      void saveNote()
    }, 2000)
  }
}

async function saveNote() {
  if (isSaving.value) return
  isSaving.value = true
  try {
    if (currentNote.value.id) {
      // Don't update with empty content
      if (!currentNote.value.content.trim()) {
        isSaving.value = false
        return
      }
      // Update existing note and refresh user data
      const updated = await meStore.updateStickyNote(currentNote.value.id, currentNote.value.content)
      if (updated && updated.content) {
        // Only update the stored note content, not the user's typed content
        // This prevents clearing what the user is currently typing
        currentNote.value.content = updated.content
        showNotify({ type: 'positive', message: 'Note updated!', position: 'top', duration: 1500 })
      }

    }
  } catch (error) {
    console.error('Error saving note:', error)
    showNotify({ type: 'negative', message: 'Failed to update note', position: 'top', duration: 2000 })
  } finally {
    isSaving.value = false
  }
}

function closeNote() {
  // If there's pending save, cancel it
  if (saveTimeout.value !== null) {
    clearTimeout(saveTimeout.value)
    saveTimeout.value = null
  }

  // Don't delete the note on close, just close the UI
  emit('close')
}

function closeAllNotes() {
  showAllNotes.value = false
  emit('close')
}

async function deleteNote(noteId: string) {
  try {
    const deleted = await meStore.deleteStickyNote(noteId)
    if (deleted) {
      // If we're currently editing this note, close it
      if (currentNote.value.id === noteId) {
        emit('close')
      }
    }
  } catch (error) {
    console.error('Error deleting note:', error)
  }
}

function editNote(note: StickyNote) {
  currentNote.value = { ...note }
  userTypedContent.value = note.content || ''
  showAllNotes.value = false
}

// Function to create an empty note immediately
async function createEmptyNote() {
  if (!showAllNotes.value && props.noteType === 'new' && !currentNote.value.id) {
    const response = await meStore.createStickyNote('')
    currentNote.value = response?.data as unknown as StickyNote
    // console.log(currentNote.value,'haere')

  }
}

onMounted(async () => {
  // Fetch user data to get the latest notes
  await meStore.fetchMe()

  // The showAllNotes is already initialized correctly based on props
  // No need to set it again here, avoiding the flicker
  if (props.noteType !== 'all') {
    // Create an empty note immediately when opening a new note
    await createEmptyNote()
  }

  // Optional: keep note in viewport on resize
  const handleResize = () => {
    pos.value.x = Math.min(pos.value.x, window.innerWidth - 220)
    pos.value.y = Math.min(pos.value.y, window.innerHeight - 100)
  }
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)

  // Clear any pending timeouts
  if (saveTimeout.value !== null) {
    clearTimeout(saveTimeout.value)
  }
})

// Watch for changes in the noteType prop
watch(() => props.noteType, async (newType) => {
  if (newType === 'all') {
    showAllNotes.value = true;
  } else {
    showAllNotes.value = false;
    // Create an empty note immediately when switching to new note type
    if (newType === 'new') {
      await createEmptyNote()
    }
  }
})
</script>

<style scoped>
.sticky-note {
  transition: box-shadow 0.2s;
  border: 1.5px solid #fbc02d;
  box-shadow: 0 2px 8px 0 rgba(251, 192, 45, 0.15);
}
.note-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  cursor: grab;
}
.note-timestamp {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
  margin-right: auto;
}
.note-content {
  font-size: 1rem;
  width: 100%;
  padding: 4px 0;
}
.note-content :deep(.q-field__control) {
  padding: 0;
}
.close-btn {
  opacity: 0.6;
}
.close-btn:hover {
  opacity: 1;
}
.drag-handle {
  cursor: grab;
  color: #bdbdbd;
  margin-right: 4px;
}

/* New styles for notes list view */
.notes-list {
  border: 1px solid #ddd;
}
.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background-color: var(--q-primary);
  color: white;
  border-bottom: 1px solid #ddd;
  font-weight: 500;
  font-size: 1rem;
  min-height: 36px;
}
.notes-container {
  padding: 12px;
  overflow-y: auto;
  max-height: 400px;
}
.note-item {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #ffffa5;
  position: relative;
}
.note-item-content {
  margin-bottom: 8px;
  white-space: pre-wrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 80px;
}
.note-item-actions {
  display: flex;
  justify-content: flex-end;
}
.no-notes {
  text-align: center;
  padding: 20px;
  color: #999;
}
</style>
