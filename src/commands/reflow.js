import Command from "@ckeditor/ckeditor5-core/src/command";
import ViewRange from "@ckeditor/ckeditor5-engine/src/view/range";
import ContainerElement from "@ckeditor/ckeditor5-engine/src/view/containerelement";
import {isCommentElement, viewAttrName} from "./element";

const walk = (root, iterator) => {
  iterator(root);
  if (!(root instanceof ContainerElement)) {
    return;
  }
  const childIterator = root.getChildren();
  for (let c of childIterator) {
    walk(c, iterator);
  }
};

function findCommentElementByPosition(position) {
  return position.getAncestors().find(isCommentElement);
}

export default class extends Command {

  getVirtualViewCommentElements() {
    const editor = this.editor;
    const view = editor.editing.view;
    const items = [];
    walk(view.document.getRoot(), (c) => {
      if (isCommentElement(c)) {
        items.push(c);
      }
    });
    return items;
  }

  execute() {
    const selectedComment = this._getSelectedCommentElement();
    const editor = this.editor;
    const view = editor.editing.view;
    const duplicates = {};
    const items = this
      .getVirtualViewCommentElements()
      .map((c, i) => {
        const commentId = c.getAttribute(viewAttrName);
        const elem = view.domConverter.mapViewToDom(c);
        const {top} = elem.getBoundingClientRect();
        const isActive = (selectedComment === c);

        if (!duplicates.hasOwnProperty(commentId)) {
          duplicates[commentId] = i;
        }

        duplicates[commentId] = isActive ? i : duplicates[commentId];

        return {
          id: commentId,
          rect: {top: top + window.scrollY},
          isActive,
        };
      })
      .filter(({id}, i) => duplicates[id] === i);

    const selection = view.document.selection;
    let cursor = null;
    if (!selection.isCollapsed && !selectedComment) {
      // selection for new comment?
      const range = view.domConverter.viewRangeToDom(selection.getFirstRange());
      const {top} = range.getBoundingClientRect();
      cursor = {
        top: top + window.scrollY,
      };
    }

    editor.model.document.fire("comments:did-reflow", {items, cursor});
  }

  _getSelectedCommentElement() {
    const selection = this.editor.editing.view.document.selection;

    if (selection.isCollapsed) {
      return findCommentElementByPosition(selection.getFirstPosition());
    } else {
      const range = selection.getFirstRange().getTrimmed();
      const startLink = findCommentElementByPosition(range.start);
      const endLink = findCommentElementByPosition(range.end);

      if (!startLink || startLink !== endLink) {
        return null;
      }

      if (ViewRange.createIn(startLink).getTrimmed().isEqual(range)) {
        return startLink;
      } else {
        return null;
      }
    }
  }
}
