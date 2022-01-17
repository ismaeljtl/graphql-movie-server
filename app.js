const express = require("express");
const { graphqlHTTP } = require("express-graphql"); // library to enable graphql to work with express
const schema = require("./schema/schema");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());

const CONNECTION_URL =
  "mongodb+srv://admin:admin@cluster0.err6f.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(CONNECTION_URL).catch((e) => console.log(e));
mongoose.connection.once("open", () => {
  console.log("Connected to the Database");
});

// middleware setup for route of graphql
// receives an schema
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(process.env.PORT || 8000, () => {
  console.log("GraphQL server is running on http://localhost:8000/graphql");
});
