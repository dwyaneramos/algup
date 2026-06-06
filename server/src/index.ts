import express from 'express';
import scrambleRouter from './routes/scramble.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/scramble', scrambleRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
