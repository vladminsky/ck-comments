import Command from "@ckeditor/ckeditor5-core/src/command";
import ModelRange from "@ckeditor/ckeditor5-engine/src/model/range";
import {findCommentElementById} from "./element";

export default class extends Command {

  execute(id) {
    const editor = this.editor;
    const model = editor.model;
    model.change((writer) => {
      const element = findCommentElementById(model.document, id);
      if (element) {
        const range = ModelRange.createOn(element);
        writer.setSelection(new ModelRange(range.end));
        editor.editing.view.focus();
      }
    });
  }
}
