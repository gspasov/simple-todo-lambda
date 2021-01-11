//@ts-check
const {
  createTodo,
  getTodo,
  updateTodo,
  deleteTodo,
  FIELD_TITLE,
  FIELD_DESCRIPTION,
  FIELD_DUE,
  FIELD_PRIORITY,
  FIELD_STATE,
} = require("./todo");

const PATH_CREATE_TODO = "[/]todos[/]?$";
const PATH_GET_TODO = "[/]todos[/][0-9a-f-]{36}[/]?$";
const PATH_UPDATE_TODO = PATH_GET_TODO;
const PATH_DELETE_TODO = PATH_GET_TODO;

exports.handler = async (event) => {
  console.log("Event", event)
  try {
    const fnToExec = router(event, event.path, event.httpMethod);
    const response = await fnToExec(event);
    return sendResponse(response);
  } catch (error) {
    console.error(error);
    return sendResponse({ error: error.error || error }, error.code || 400);
  }
};

const sendResponse = (response, statusCode = 200) => ({
  body: JSON.stringify(response),
  statusCode,
});

const getBody = (event) => JSON.parse(event.body);

const router = (event, path, method) => {
  const routes = [
    {
      method: "POST",
      path: PATH_CREATE_TODO,
      func: funcCreateTodo,
    },
    {
      method: "GET",
      path: PATH_GET_TODO,
      func: funcGetTodo,
    },
    {
      method: "PUT",
      path: PATH_UPDATE_TODO,
      func: funcUpdateTodo,
    },
    {
      method: "DELETE",
      path: PATH_DELETE_TODO,
      func: funcDeleteTodo,
    },
  ];

  const routeToExecute = routes.find(
    (route) => method === route.method && path.match(new RegExp(route.path))
  );

  if (routeToExecute) {
    return routeToExecute.func;
  } else {
    throw {
      error: { message: "Undefined path or method", data: { path, method } },
    };
  }
};

const funcCreateTodo = (event) => {
  const todo = getBody(event);
  return createTodo(todo);
};

const funcGetTodo = (event) => {
  if (event.pathParameters) {
    return getTodo(event.pathParameters.id).then(({ Item }) => Item);
  } else {
    throw {
      error: { message: "Path parameters were not provided" },
      code: 422,
    };
  }
};

const funcUpdateTodo = (event) => {
  const fieldsToUpdate = getBody(event);
  if (event.pathParameters) {
    return updateTodo(event.pathParameters.id, fieldsToUpdate).then(
      ({ Attributes }) => Attributes
    );
  } else {
    throw {
      error: { message: "Path parameters were not provided" },
      code: 422,
    };
  }
};

const funcDeleteTodo = (event) => {
  if (event.pathParameters) {
    return deleteTodo(event.pathParameters.id);
  } else {
    throw {
      error: { message: "Path parameters were not provided" },
      code: 422,
    };
  }
};
