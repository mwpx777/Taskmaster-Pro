var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));  //'tasks" is storage label

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
       // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

//this is event listener to edit the task data
$('.list-group').on('click', 'p', function(){
  var text = $(this).text();
  var textInput = $('<textarea>')
  .addClass('form-control')
  .val(text);
  $(this).replaceWith(textInput);
  textInput.trigger('focus');
});

//this is event listener to save <textarea> when clicked off of 
  $('.list-group').on('blur', 'textarea', function(){
    // get the textarea's current value/text
  var text = $(this)
  .val()
  .trim();

  // get the parent ul's id attribute
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
  .closest(".list-group-item")
  .index();

  tasks[status][index].text=text;
  saveTasks()

  // recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);
  });


//duedate was clicked
$('.list-group').on('click', 'span', function(){
  //get current text
  var date = $(this)
    .text()
    .trim()

  //create new date input
  var dateInput = ('<input>')
    .attr('type', 'text')  //what is this?
    .addClass('form-control')
    .val(date);

  //swap out the elements
  $(this).replaceWith(dateInput);

  //automatically focus on new element
  dateInput.trigger('focus');
});

//value of due date was edited
$(".list-group").on("blur", "input[type='text']", function(){

  //get current text
  var date= $(this)
    .val()
    .trim()

  //get parent ul id attribute
  var status = $(this)
    .closest('list-group')
    .attr(id)
    .replace("list-", "")  //what is this?


  //get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  //update task in array and resave to local storage
  tasks[status][index].date=date;
  saveTasks();

  //recreate span element with bootstrap classes
  var taskSpan = $('<span>')
    .addClass('badge badge-primary badge-pill')
    .text(date);

  //replace input with span element
  $(this).replaceWith(taskSpan);
  


});



// modal was triggered  modal is the popup window to add the task
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();  //this will run var saveTasks function above
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


