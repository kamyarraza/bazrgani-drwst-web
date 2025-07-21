# Translation Additions for Image Upload Functionality

## Overview
This document summarizes the image-related translations that have been added to the Arabic (ar) and Kurdish (ckb) language files to support the consistent image upload functionality across item and admin components.

## Translations Added

### Arabic (ar) Translations

#### Admin Section (`src/i18n/ar/index.ts`)
```javascript
admin: {
  // ... existing translations ...
  selectImage: 'اختر صورة',
  imagePreview: 'معاينة الصورة',
  newImagePreview: 'معاينة الصورة الجديدة',
  currentImage: 'الصورة الحالية'
}
```

#### Item Section (`src/i18n/ar/index.ts`)
```javascript
item: {
  // ... existing translations ...
  selectImage: 'اختر صورة'
}
```

### Kurdish (ckb) Translations

#### Admin Section (`src/i18n/ckb/index.ts`)
```javascript
admin: {
  // ... existing translations ...
  selectImage: 'هەڵبژاردنی وێنە',
  imagePreview: 'پێشبینینی وێنە',
  newImagePreview: 'پێشبینینی وێنەی نوێ',
  currentImage: 'وێنەی ئێستا'
}
```

#### Item Section (`src/i18n/ckb/index.ts`)
```javascript
item: {
  // ... existing translations ...
  selectImage: 'هەڵبژاردنی وێنە'
}
```

## Translation Details

### English → Arabic → Kurdish

| English | Arabic | Kurdish |
|---------|--------|---------|
| Select Image | اختر صورة | هەڵبژاردنی وێنە |
| Image Preview | معاينة الصورة | پێشبینینی وێنە |
| New Image Preview | معاينة الصورة الجديدة | پێشبینینی وێنەی نوێ |
| Current Image | الصورة الحالية | وێنەی ئێستا |

## Usage in Components

These translations are used in the following components:

1. **Admin Add Component** (`src/components/admin/Add.vue`)
   - `t('admin.selectImage')` - File input label
   - `t('admin.imagePreview')` - Image preview section title

2. **Admin Update Component** (`src/components/admin/Update.vue`)
   - `t('admin.selectImage')` - File input label
   - `t('admin.newImagePreview')` - New image preview title
   - `t('admin.currentImage')` - Current image title

3. **Item Add Component** (`src/components/item/Add.vue`)
   - `t('item.selectImage')` - File input label

4. **Item Update Component** (`src/components/item/Update.vue`)
   - `t('item.selectImage')` - File input label
   - `t('item.currentImage')` - Current image display

## Verification

To verify these translations are working correctly:

1. **Test Language Switching**: Switch between English, Arabic, and Kurdish to ensure the image upload labels change appropriately.

2. **Test All Components**: Verify that all Add/Update components for both items and admins display the correct translations.

3. **Test Image Preview**: Ensure the image preview sections show the correct translated labels.

## Notes

- All translations maintain consistency with the existing translation style and terminology used in each language.
- The Kurdish translations use the appropriate Kurdish script and terminology.
- The Arabic translations use proper Arabic grammar and terminology.
- These translations support the unified image upload functionality implemented across all components.

## Files Modified

1. `src/i18n/ar/index.ts` - Added Arabic translations
2. `src/i18n/ckb/index.ts` - Added Kurdish translations

The English translations were already present in `src/i18n/en-US/index.ts`. 