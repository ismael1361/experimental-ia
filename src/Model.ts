import { Matrix } from "./Matrix";

type ActivationFunction = "relu" | "sigmoid" | "softmax" | "tanh" | "linear";

interface LayerDenseOptions {
    units: number;
    activation: ActivationFunction;
    useBias?: boolean;
    trainable?: boolean;
    inputShape?: number[];
    weights?: Matrix;
    biases?: Matrix;
}

interface LayerProps {
    type: string;
}

interface LayerDense extends LayerProps, LayerDenseOptions {
    type: "dense";
}

type Layer = LayerDense;

interface CompileOptions {
    optimizer: "sgd" | "adam" | "rmsprop";
    loss: "meanSquaredError" | "crossEntropy";
}

export class Model {
    static layers = {
        dense(options: LayerDenseOptions): LayerDense {
            return {
                type: "dense",
                ...options,
                useBias: options.useBias ?? true,
                trainable: options.trainable ?? true,
            };
        },
    };

    layers: Layer[] = [];
    compileOptions: CompileOptions | undefined;

    add(layer: Layer) {
        if (!this.compileOptions) this.layers.push(layer);
    }

    compile(options: CompileOptions) {
        this.compileOptions = options;

        this.layers.forEach((layer, index) => {
            if (index === 0) {
                if (layer.type === "dense" && layer.inputShape) {
                    const flatness = layer.inputShape.reduce((acc, val) => acc * val, 1);
                    layer.weights = layer.weights ?? Matrix.random(layer.units, flatness);
                    if (layer.useBias) layer.biases = Matrix.random(layer.units, 1);
                }
            } else {
                const previousLayer = this.layers[index - 1];
                if (layer.type === "dense") {
                    const flatness = previousLayer.units;
                    layer.weights = layer.weights ?? Matrix.random(layer.units, flatness);
                    if (layer.useBias) layer.biases = Matrix.random(layer.units, 1);
                }
            }
        });
    }

    static sequential() {
        return new Model();
    }

    toJSON() {
        return {
            layers: this.layers.map((layer) => {
                return {
                    ...layer,
                    weights: layer.weights?.toJSON(),
                    biases: layer.biases?.toJSON(),
                };
            }),
            compileOptions: this.compileOptions,
        };
    }

    static fromJSON(json: any) {
        const model = new Model();
        model.layers = json.layers.map((layer: any) => {
            return {
                ...layer,
                weights: layer.weights ? Matrix.fromJSON(layer.weights) : undefined,
                biases: layer.biases ? Matrix.fromJSON(layer.biases) : undefined,
            };
        });
        model.compileOptions = json.compileOptions;
        return model;
    }
}
