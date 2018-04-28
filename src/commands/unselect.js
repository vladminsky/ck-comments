import Command from "@ckeditor/ckeditor5-core/src/command";
import ModelRange from "@ckeditor/ckeditor5-engine/src/model/range";

export default class extends Command {

  execute() {
    const editor = this.editor;
    const model = editor.model;
    const doc = model.document;

    model.change((writer) => {
      const sel = doc.selection;
      const range = sel.getFirstRange();
      writer.setSelection(new ModelRange(range.start));
      editor.editing.view.focus();
    });
  }
}
