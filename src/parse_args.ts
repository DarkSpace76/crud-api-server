export function parseArgs() {
    const args = process.argv.slice(2);

    const dictionary = {};
    args.map((val, index, arr) => {
        if (val.startsWith('--')) {
            const [key, value] = val.split('=');
            dictionary[key.slice(2)] = value;
        }
    })
    return dictionary;
}