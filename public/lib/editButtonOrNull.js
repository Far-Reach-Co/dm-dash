import state from "./state.js";
import createElement from "./createElement.js";

const editButtonOrNull = (title, toggleEdit) => {
  const renderEditButtonOrNull = (toggleEdit) => {
    if (state.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else {
      return createElement("div", { class: "edit-btn" }, "[Edit]", {
        type: "click",
        event: toggleEdit,
      });
    }
  };

  return createElement("div", { class: "title-edit" }, [
    title,
    renderEditButtonOrNull(),
  ]);
};

export { editButtonOrNull };
