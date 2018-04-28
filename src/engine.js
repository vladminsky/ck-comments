import _ from "lodash";
// import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import {modelAttrName, createCommentElement, viewAttrName} from "./commands/element";
import CreateCommand from "./commands/create";
import DeleteCommand from "./commands/delete";
import ReflowCommand from "./commands/reflow";
import UnselectCommand from "./commands/unselect";
import ActivateCommand from "./commands/activate";
import {downcastAttributeToElement} from "@ckeditor/ckeditor5-engine/src/conversion/downcast-converters";
import {upcastElementToAttribute} from "@ckeditor/ckeditor5-engine/src/conversion/upcast-converters";
// import bindTwoStepCaretToAttribute from "@ckeditor/ckeditor5-engine/src/utils/bindtwostepcarettoattribute";

export default function CommentsEngine (editor) {

  console.log("from kit!");

  editor.model.schema.extend("$text", {allowAttributes: modelAttrName});

  editor.conversion
    .for("downcast")
    .add(downcastAttributeToElement({model: modelAttrName, view: createCommentElement}));

  editor.conversion
    .for("upcast")
    .add(upcastElementToAttribute({
      view: {
        name: "span",
        attributes: {
          [viewAttrName]: true,
        },
      },
      model: {
        key: modelAttrName,
        value: viewElement => viewElement.getAttribute(viewAttrName),
      },
    }));

  // bindTwoStepCaretToAttribute(editor.editing.view, editor.model, this, modelAttrName);

  // Create linking commands.
  editor.commands.add("comments:create", new CreateCommand(editor));
  editor.commands.add("comments:delete", new DeleteCommand(editor));
  editor.commands.add("comments:activate", new ActivateCommand(editor));
  editor.commands.add("comments:unselect", new UnselectCommand(editor));

  const cmdReflow = new ReflowCommand(editor);
  editor.commands.add("comments:reflow", cmdReflow);
  editor.editing.view.on("render", _.throttle(() => cmdReflow.execute(), 300));
}
