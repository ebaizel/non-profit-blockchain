const register = require("./register");

module.exports.handler = async (event) => {
  try {
    var result = await register.run();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: result,
        input: event,
      }, null, 2),
    };
  } catch (error) {
    return {
      statusCode: 409,
      body: JSON.stringify({
        message: error.toString(),
        input: event,
      }, null, 2),
    };
  }
};