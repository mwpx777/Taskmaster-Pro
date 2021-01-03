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

  // append span and p element to parent var taskLi
  taskLi.append(taskSpan, taskP);

  //check due date by running auditTask function and passing it taskLi argument
  auditTask(taskLi);


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
  console.log(list, arr);
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


//drag and drop function tasks  takes class=Card and class=list-group from HTML
//sortable allows the card item to be sorted into a new group with list-group element
$(".card .list-group").sortable({
  // enable dragging across lists
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event, ui) {
    console.log(ui);
  },
  deactivate: function(event, ui) {
    console.log(ui);
  },
  over: function(event) {
    console.log(event);
  },
  out: function(event) {
    console.log(event);
  },
  update: function() {
    var tempArr = [];

    // loop over current set of children in sortable list
    //var tempArr above will get these values passed into its array
    $(this)
      .children()
      .each(function() {
        // this will take the tempArr values and push them into var tempArr array above
        tempArr.push({
          //will find <p> and take text entered in 
          text: $(this)
            .find("p")
            .text()
            .trim(),
          //will find <span> and take text entered in 
          date: $(this)
            .find("span")
            .text()
            .trim()
        });
      });

    // trim down list's ID to match object property   //EXPLAIN THIS
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  },
  stop: function(event) {
    $(this).removeClass("dropover");
  }
});

// this function will allow task to be deleted by dragging to delete dropzone
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",

  //event is the task, ui is the draggable element
  drop: function(event, ui) {
    // remove dragged element from the dom
    ui.draggable.remove();

  },
  over: function(event, ui) {
    console.log(ui);
  },
  out: function(event, ui) {
    console.log(ui);
  }
});

//duedate was clicked
//this is the event listener, if 'list-group' 'span' was clicked, run the function
$('.list-group').on('click', 'span', function(){
  //get current text
  var date = $(this)
    .text()
    .trim()

  //create new date input
  var dateInput = $('<input>')
    .attr('type', 'text')                       //what is this?
    .addClass('form-control')
    .val(date);

  //swap out the elements
  $(this).replaceWith(dateInput);

  //enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose:function(){
      //when calendar is closed, this will force a 'change' event on the 'dateInput'
      //this will change dateInput to whatever was selected when window is closed
      $(this).trigger('change');
    }
  });

  //automatically focus on new element
  dateInput.trigger('focus');
});

//value of due date was edited
$(".list-group").on("change", "input[type='text']", function(){

  //get current text
  var date= $(this)
    .val()
    .trim()

 // get the parent ul's id attribute
  var status = $(this)
  .closest(".list-group")
  .attr("id")             //what is this?
  .replace("list-", "");  //what is this?

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

  //pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest('.list-group-item'));
  
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

//modal due date calendar
$('#modalDueDate').datepicker({
  minDate: 1
});


//this function will change background color based on task due date
//taskEl is the argument that was passed to this function from auditTasks(taskLi)
var auditTask = function(taskEl){
  //get date from task element
  //this is looking at the auditTask(taskLi) info that was passed to taskEl
  //it will find the 'span' .text info which is the date
  var date= $(taskEl).find('span').text().trim();
  //check to see if this worked
  console.log(date);

  //convert to moment object at 5:00pm
  var time = moment(date, 'L').set('hour', 17);
  //this should print out an object for the value of the date variable
  console.log(time);

  //remove any existing classes from the element
  $(taskEl).removeClass('list-group-item-warning list-group-item danger');

  //apply new class based on due date
  //this if statement is a query method in Moment.js it is a true/false statement
  //moment() will get current time and compare it to (time)
  if(moment().isAfter(time)){
    $(taskEl).addClass('list-group-item-danger')
  }
  //Math.abs will check if the moment is .diff than time, days by 2 days
  //this will compare negative number to <=2
  //this is a negative number because we are counting up to an event, so the event is zero and the numbers we are counting up to the event are negative numbers
  else if(Math.abs(moment().diff(time, 'days')) <= 2) {
    $(taskEl).addClass('list-group-item-warning')
  }
};

//this function will run auditTask(el)every 30 min to update task due date background color
setInterval(function () {
  $(".card .list-group-item").each(function(index, el) {
    auditTask(el);
    console.log(taskEl);
  });
}, 1800000);

// load tasks for the first time
loadTasks();


