const dotenv = require('dotenv');
const fs = require('fs');

/**
 * Reads requested env variables from process.env (global env variables)
 * and reads the missing ones from the list of provided .env files.
 * Note that if a variable existed in more that one source, the first encountered value will be used
 * so provide the files that you want to give more priority to first.
 * Also remember, if the variable existed in process.env, its value will be used from there.
 * @param keys array of strings, representing the names of the env variables you want to read
 * @param pathToEnvFiles a string or a list of strings representing the path to the .env files you want to read,
 * ordered from the more prioritised files to the less ones (fall-backs in the end)
 * @param skipMissingFiles set to true to silently skip missing files, useful if you want to run this code in multiple environments
 * where in some you want to just provide the values from process.env (like, docker containers)
 * @param ignoreMissingKeys set to true to silently ignore any non-resolvable keys. If it's false, an exception will be thrown.
 * @returns {} an object with keys (from the parameter keys) mapped to the found env variables, or undef.
 */
function readEnv(keys, pathToEnvFiles, skipMissingFiles = false, ignoreMissingKeys = false) {

    let map = {};

    // First, read from environment variables
    keys.forEach( key => {
        if(process.env[key] !== undefined)
            map[key] = process.env[key];
    });

    // Now read the missing keys from the provided .env files
    let missingKeys = arrayDiff(keys, Object.keys(map));

    if(typeof pathToEnvFiles === 'string'){
        pathToEnvFiles = [pathToEnvFiles];
    }

    if(Array.isArray(pathToEnvFiles)){
        pathToEnvFiles.forEach( path => {
            if( typeof path !== 'string' ){
                throw new Error('pathToEnvFiles should be a string or an array of strings');
            }

            // Check if the file exists
            if(fs.existsSync(path)) {
                const dotEvnConfig = readDotEnvFile(path);
                if (dotEvnConfig.error) {
                    throw new Error(`Error while loading .env file ${path}.`);
                }

                missingKeys.forEach(key => {
                    if (dotEvnConfig.parsed[key] !== undefined)
                        map[key] = dotEvnConfig.parsed[key];
                });

                missingKeys = arrayDiff(missingKeys, Object.keys(map));
            }
            else {
                if (skipMissingFiles){
                    console.info(`Skipping non-existing .env file ${path}`);
                }
                else{
                    throw new Error(`Could not find .env file ${path}`);
                }
            }

        });
    }

    if(missingKeys.length){
        if(ignoreMissingKeys)
            missingKeys.forEach(key => map[key] = undefined);
        else
            throw new Error('envReader could not find values for following keys in the provided files: ' +
                missingKeys.join(",")
            );
    }

    return map;
}

function readDotEnvFile(filePath) {
    return dotenv.config({path: filePath});
}


function arrayDiff(a, b){
    const existsInB = b.reduce((map, item) => {
        map[item] = 1;
        return map;
    }, {});

    return a.filter(item => !existsInB[item]);
}

exports.readEnv = readEnv;