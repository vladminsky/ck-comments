import Command from "@ckeditor/ckeditor5-core/src/command";
import {findCommentRange, modelAttrName} from "./element";

export default class extends Command {

  refresh() {
    const model = this.editor.model;
    const doc = model.document;
    const sel = doc.selection;

    this.value = sel.getAttribute(modelAttrName);
    this.isEnabled = model.schema.checkAttributeInSelection(sel, modelAttrName);
  }

  execute(commentBody) {
    const model = this.editor.model;
    const doc = model.document;
    const selection = doc.selection;

    model.change((writer) => {
      if (selection.isCollapsed) {
        const position = selection.getFirstPosition();
        // When selection is inside text with target attribute.
        if (selection.hasAttribute(modelAttrName)) {
          const targetRange = findCommentRange(position, selection.getAttribute(modelAttrName));
          writer.setAttribute(modelAttrName, commentBody, targetRange);
          writer.setSelection(targetRange);
        } else {
          // ignore this path
        }
      } else {
        // If selection has non-collapsed ranges,
        // we change attribute on nodes inside those ranges
        // omitting nodes where target attribute is disallowed.
        model
          .schema
          .getValidRanges(selection.getRanges(), modelAttrName)
          .forEach((range) => writer.setAttribute(modelAttrName, commentBody, range));
      }
    });
  }
}
