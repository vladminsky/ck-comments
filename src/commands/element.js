import Range from "@ckeditor/ckeditor5-engine/src/model/range";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";

const commentElementSymbol = Symbol("commentElement");

export function createCommentElement(data, writer) {
  const element = writer.createAttributeElement(
    "span",
    {
      [viewAttrName]: data,
      class: "comment",
    },
    {priority: 5});
  writer.setCustomProperty(commentElementSymbol, true, element);
  return element;
}

export function isCommentElement(node) {
  return node.is("attributeElement") && Boolean(node.getCustomProperty(commentElementSymbol));
}

export const viewAttrName = "data-fibery-comment-id";

export const modelAttrName = "fiberyCommentId";

const walkModel = (root, iterator) => {
  iterator(root);
  if (!root.is("element")) {
    return;
  }
  const childIterator = root.getChildren();
  for (let c of childIterator) {
    walkModel(c, iterator);
  }
};

const getVirtualModelCommentElements = (doc) => {
  const items = [];
  walkModel(doc.getRoot(), (c) => {
    if (c.hasAttribute(modelAttrName)) {
      items.push(c);
    }
  });
  return items;
};

export function findCommentElementById(doc, id) {
  const nodes = getVirtualModelCommentElements(doc)
    .filter((c) => c.getAttribute(modelAttrName) === id);

  return nodes.length > 0 ? nodes[0] : null;
}

export function findCommentRange(position, value) {
  return new Range(
    _findBound(position, value, true),
    _findBound(position, value, false));
}

function _findBound(position, value, lookBack) {
  // Get node before or after position (depends on `lookBack` flag).
  // When position is inside text node then start searching from text node.
  let node = position.textNode || (lookBack ? position.nodeBefore : position.nodeAfter);

  let lastNode = null;

  while (node && node.getAttribute(modelAttrName) === value) {
    lastNode = node;
    node = lookBack ? node.previousSibling : node.nextSibling;
  }

  return (lastNode
    ? Position.createAt(lastNode, lookBack ? "before" : "after")
    : position);
}
