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

const idDictionary = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "w",
    "x",
    "y",
    "z",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "J",
    "K",
    "L",
    "M",
    "N",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "V",
    "X",
    "Y",
    "Z",
    "1",
    "2",
    "3",
    "4",
    "7",
    "8",
    "9",
    "0",
];

export const unsafeID = (length: number): string => {
    let counter = 0;
    let container = "";
    while (length > counter) {
        container += idDictionary[Math.floor(Math.random() * 53)];
        counter++;
    }
    return container;
};
