export const createProxy = (target: any, update: Function, prefix = '') => {
  const store: any = {};
  return [
    store,
    new Proxy(target, {
      get: (t, key) => {
        if (!store.hasOwnProperty(key)) {
          if (typeof target[key] === 'object') {
            store[key] = createProxy(
              target[key],
              update,
              prefix + <string>key + '.'
            )[1];
            store[key].__prefix = prefix;
          } else {
            store[key] = target[key];
          }
        }
        return store[key];
      },
      set: (t, key, v) => {
        if (typeof v === 'object') {
          store[key] = createProxy(v, update, prefix + <string>key + '.')[1];
          store[key].__prefix = prefix;
        } else {
          store[key] = v;
        }
        update(prefix + <string>key);
        return true;
      }
    })
  ];
};
