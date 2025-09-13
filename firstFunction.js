exports.firstFunction = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Learning serverless framework.",
    }),
  };
};
