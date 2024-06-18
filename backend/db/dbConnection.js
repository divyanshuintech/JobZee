import mongoose from "mongoose";

export const dbConnection = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      dbName: "MERN_STACK_EMPLOYMENT_WEBSITE",
    })
    .then(() => {
      console.log("Database connected successfully!");
    })
    .catch((err) => {
      console.log(
        `Some error occurred while connecting to the database: ${err}`
      );
    });
};
