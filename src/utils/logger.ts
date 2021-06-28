import environment from "./environment";

const Log = (...args): void => {
    if (environment.isDev) {
        console.log(...args);
    }
};

export default Log;
