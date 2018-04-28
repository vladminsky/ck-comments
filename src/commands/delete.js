import Command from "@ckeditor/ckeditor5-core/src/command";
import ModelRange from "@ckeditor/ckeditor5-engine/src/model/range";
import {modelAttrName, findCommentElementById} from "./element";

export default class extends Command {

  refresh() {
    this.isEnabled = true;
  }

  execute(id) {
    const model = this.editor.model;
    const doc = model.document;
    model.change((writer) => {
      const element = findCommentElementById(doc, id);
      if (element) {
        const range = ModelRange.createOn(element);
        writer.removeAttribute(modelAttrName, range);
        writer.setSelection(range);
      }
    });
  }
}
