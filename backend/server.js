const app = require("./src/app");
const connectDb = require("./src/db/db");

require("dotenv").config();
connectDb();

app.listen(3000, () => {
  console.log(`Server is running on port http://localhost:3000`);
});
