(() => {
  "use strict";
  const { $, element, status } = Mini;

  const columns = ["To Do", "In Progress", "Done"];
  const tasks = [
    { id: "card-1", text: "Wash dishes", column: 0 },
    { id: "card-2", text: "Buy groceries", column: 0 },
    { id: "card-3", text: "Learn to code", column: 1 },
  ];
  function move(task, index) {
    task.column = index;
    $("column-" + index).append($(task.id));
    $(task.id).querySelector("select").value = index;
    status(task.text + " moved to " + columns[index] + ".");
  }
  for (const task of tasks) {
    const card = element("div", undefined, "result-card");
    card.id = task.id;
    card.draggable = true;
    card.append(element("p", task.text));
    const label = element("label", "Move to");
    const select = element("select");
    select.setAttribute("aria-label", "Move " + task.text + " to");
    columns.forEach((name, i) => select.add(new Option(name, i)));
    select.value = task.column;
    select.addEventListener("change", () => move(task, Number(select.value)));
    label.append(select);
    card.append(label);
    card.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", task.id);
    });
    $("column-" + task.column).append(card);
  }
  columns.forEach((name, i) => {
    const column = $("column-" + i);
    column.addEventListener("dragover", (event) => event.preventDefault());
    column.addEventListener("drop", (event) => {
      event.preventDefault();
      const task = tasks.find(
        (t) => t.id === event.dataTransfer.getData("text/plain"),
      );
      if (task) move(task, i);
    });
  });
})();
