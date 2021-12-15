import { Schema, model } from 'mongoose';

const summoner_schema = new Schema({
  _id: { type: String, required: true },
  summoner: { type: String, required: true },
  region: { type: String, required: true },
});

export default model('summoners', summoner_schema);
