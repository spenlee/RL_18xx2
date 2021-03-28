import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import router from './routes/api';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

const port = process.env.PORT || 8080;

const db: string = process.env.DB || 'invalidDb';

//connect to the database
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log('Database connected successfully'))
  .catch((err: any) => console.log(err));

//since mongoose promise is deprecated, we override it with node's promise
mongoose.Promise = global.Promise;

app.use((req: any, res: any, next: any) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());

app.use('/api', router);

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({"statusCode": 500, "message": "InternalServerError"});
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
});
