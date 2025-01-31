import { Model } from "./Model";
import { ANN } from "./NeuralNetwork";
import fs from "fs";

const model = Model.sequential();
model.add(Model.layers.dense({ units: 100, activation: "relu", inputShape: [10, 10] }));
model.add(Model.layers.dense({ units: 1, activation: "linear" }));
model.compile({ optimizer: "sgd", loss: "meanSquaredError" });

fs.writeFileSync("model.json", JSON.stringify(model.toJSON()));
