export const canonicalize = (name: string) => `zt-${name}`;
export const elementAccessErrorHandler = (
    id: string,
    containerName: string,
    elements: Record<string, any>
): boolean => {
    if (id in elements) {
        return true;
    } else {
        console.error(
            `No element with key ${id} was found in component ${containerName}`
        );
        return false;
    }
};
