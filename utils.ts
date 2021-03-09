export const resourceExists = (repository:Array<any>, searchValue, id) => {
    return repository.find(resource => resource[id] === searchValue);
}