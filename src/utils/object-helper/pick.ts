type PickReturnType<T extends object, K extends (keyof T)[]> = { [K2 in K[number]]: T[K2] };

type Pick = <T extends object, K extends (keyof T)[]>(obj: T, ...keys: K) => PickReturnType<T, K>;

const pick: Pick = (obj, ...keys) => {
    if (!obj) return;
    return keys.reduce((p, c) => (obj[c] && (p[c] = obj[c]), p), {} as any);
};

export default pick;
