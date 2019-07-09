const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/users');
const noteRouter = require('./routers/notes');
const feedbackRouter = require('./routers/feedback');
const cors = require('cors');





const app = express();
const port = process.env.PORT;
app.use(express.json());
app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(userRouter);
app.use(noteRouter);
app.use(feedbackRouter);


app.listen(port , ()=>{
    console.log('Server is running in port ' + port);
})