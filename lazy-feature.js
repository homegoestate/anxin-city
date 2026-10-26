// A feature is constructed once. Failed attempts can be retried without
// duplicating the navigation or trapping the rest of the experience.
export function lazyFeature(load, construct) {
  let pending;
  return function getFeature() {
    if (!pending) pending = Promise.resolve().then(load).then(construct).catch(error => {
      pending = undefined;
      throw error;
    });
    return pending;
  };
}
