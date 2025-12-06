import { Extension } from '@tiptap/react';

// ----------------------------------------------------------------------

export const ClearFormat = Extension.create({
  name: 'clearFormat',
  /********/
  addKeyboardShortcuts() {
    return {
      'Mod-Shift-X': ({ editor }) => editor.chain().focus().clearNodes().unsetAllMarks().run(),
    };
  },
});
