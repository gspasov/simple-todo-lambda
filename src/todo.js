//@ts-check
const { uuid } = require("uuidv4");
const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

const TODO_TABLE = "todos";

const FIELD_ID = "id";
const FIELD_TITLE = "title";
const FIELD_DESCRIPTION = "description";
const FIELD_DUE = "due";
const FIELD_PRIORITY = "priority";
const FIELD_STATE = "state";
const FIELD_CREATED_AT = "createdAt";
const FIELD_UPDATED_AT = "updatedAt";

const STATE_TODO = "TODO";
const STATE_IN_PROGRESS = "IN_PROGRESS";
const STATE_DONE = "DONE";
const STATE_WONT_DO = "WONT_DO";

const VALID_PRIORITIES = [1, 2, 3, 4, 5];
const VALID_STATES = [STATE_TODO, STATE_IN_PROGRESS, STATE_DONE, STATE_WONT_DO];
const UPDATABLE_FIELDS = [FIELD_TITLE, FIELD_DESCRIPTION, FIELD_PRIORITY];

const createTodo = ({
  [FIELD_TITLE]: title,
  [FIELD_DESCRIPTION]: description,
  [FIELD_DUE]: due,
  [FIELD_PRIORITY]: priority,
}) => {
  const currentTime = Date.now();
  const params = {
    TableName: TODO_TABLE,
    Item: {
      [FIELD_ID]: uuid(),
      [FIELD_TITLE]: title,
      [FIELD_DESCRIPTION]: description,
      [FIELD_DUE]: due,
      [FIELD_PRIORITY]: priority,
      [FIELD_STATE]: STATE_TODO,
      [FIELD_CREATED_AT]: currentTime,
      [FIELD_UPDATED_AT]: currentTime,
    },
  };
  return dynamo.put(params).promise();
};

const getTodo = (id) => {
  const params = {
    TableName: TODO_TABLE,
    Key: { [FIELD_ID]: id },
  };
  return dynamo.get(params).promise();
};

const updateTodo = (id, updates) => {
  const updateableAttributes = Object.fromEntries(
    Object.entries(updates).filter(([field, _]) =>
      UPDATABLE_FIELDS.includes(field)
    )
  );
  const updatedTodo = { ...updateableAttributes, updatedAt: Date.now() };
  const params = {
    TableName: TODO_TABLE,
    Key: { [FIELD_ID]: id },
    ConditionExpression: "attribute_exists(id)",
    UpdateExpression: updateExpression(updatedTodo),
    ExpressionAttributeNames: expressionAttributeNames(updatedTodo),
    ExpressionAttributeValues: expressionAttributeValues(updatedTodo),
    ReturnValues: "ALL_NEW",
  };
  return dynamo.update(params).promise();
};

const updateExpression = (todo) => {
  return "set ".concat(
    Object.keys(todo)
      .map((key, index) => `#${key}${index} = :v${index}`)
      .join(",")
  );
};

const expressionAttributeNames = (entity) => {
  return Object.fromEntries(
    Object.entries(entity).map(([key, _], index) => [`#${key}${index}`, key])
  );
};

const expressionAttributeValues = (entity) => {
  return Object.fromEntries(
    Object.entries(entity).map(([_, value], index) => [`:v${index}`, value])
  );
};

const deleteTodo = (id) => {
  const params = {
    TableName: TODO_TABLE,
    Key: { [FIELD_ID]: id },
  };
  return dynamo.delete(params).promise();
};

module.exports.createTodo = createTodo;
module.exports.getTodo = getTodo;
module.exports.updateTodo = updateTodo;
module.exports.deleteTodo = deleteTodo;

module.exports.FIELD_TITLE = FIELD_TITLE;
module.exports.FIELD_DESCRIPTION = FIELD_DESCRIPTION;
module.exports.FIELD_DUE = FIELD_DUE;
module.exports.FIELD_PRIORITY = FIELD_PRIORITY;
module.exports.FIELD_STATE = FIELD_STATE;
