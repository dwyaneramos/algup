import express from 'express';
import scrambleRouter from './routes/scramble.js';
import { requireApiSecret } from './middleware/requireApiSecret.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(requireApiSecret);
app.use('/scramble', scrambleRouter);

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
