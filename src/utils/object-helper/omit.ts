type OmitReturnType<T extends object, K extends (keyof T)[]> = { [K2 in Exclude<keyof T, K[number]>]: T[K2] };

type Omit = <T extends object, K extends (keyof T)[]>(obj: T, ...keys: K) => OmitReturnType<T, K>;

const omit: Omit = (obj, ...keys) => {
    return (Object.keys(obj) as (keyof typeof obj)[])
        .filter((k) => !keys.includes(k))
        .reduce((p, c) => ((p[c] = obj[c]), p), {} as any);
};

export default omit;
