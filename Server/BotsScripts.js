﻿exports.newBotScripts = function newBotScripts() {

    let thisObject = {
        loadBotScripts: loadBotScripts,
        initialize: initialize
    }

    const GITHUB = require('../Server/Github');
    let github = GITHUB.newGithub();

    const STORAGE = require('../Server/Storage');
    let storage = STORAGE.newStorage();

    let serverConfig;
    let storageData;
    let fileSystemData;
    let ecosystem;
    let ecosystemObject;

    return thisObject;

    function initialize(pEcosystem, pEcosystemObject, pServerConfig, pStorageData, pFileSystemData, callBackFunction) {

        serverConfig = pServerConfig;
        fileSystemData = pFileSystemData;
        storageData = pStorageData;
        ecosystem = pEcosystem;
        ecosystemObject = pEcosystemObject;

        storage.initialize(storageData, serverConfig);

        callBackFunction();
    }

    function loadBotScripts(callBackfunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] BotScripts -> retrieveScripts -> Entering function."); }

            /*
        
            Here we go through the webModules Array and bring them all.
        
            */

            let modulesToBeRetrieved = 0;
            let modulesRetrieved = 0;

            for (let i = 0; i < ecosystemObject.devTeams.length; i++) {

                let devTeam = ecosystemObject.devTeams[i];

                for (let j = 0; j < devTeam.bots.length; j++) {

                    let bot = devTeam.bots[j];

                    getCommons(devTeam.codeName, bot.repo, onCommons);

                    function onCommons() {

                        for (let k = 0; k < bot.processes.length; k++) {

                            let process = bot.processes[k];

                            modulesToBeRetrieved++;
                            getUserBot(devTeam.codeName, bot.repo, process.name, onUserBot);

                            function onUserBot() {

                                modulesRetrieved++;

                                if (modulesRetrieved === modulesToBeRetrieved) {

                                    callBackfunction();
                                }
                            }
                        }
                    }
                }
            }

            function getCommons(pDevTeam, pRepo, callBack) {

                let moduleName = "Commons.js";
                let key = pDevTeam + "." + pRepo;
                let path = pDevTeam + "/" + pRepo;

                storage.getStorageData(pDevTeam + "/" + "bots", pRepo, moduleName, onDataArrived);

                function onDataArrived(pData) {

                    try {

                        if (CONSOLE_LOG === true) { console.log("[INFO] BotScripts -> retrieveScripts -> Cloud -> onDataArrived -> Entering function."); }

                        if (pData !== undefined) {

                            let data = pData.toString();
                            data = data.trim(); // remove first byte with some encoding.

                            data = browserify(data);

                            storageData.set(key, data);

                        }

                        callBack();

                    }
                    catch (err) {
                        console.log("[ERROR] BotScripts -> retrieveScripts -> Cloud -> onDataArrived -> Error = " + err);
                    }
                }
            }

            function getUserBot(pDevTeam, pRepo, pProcess, callBack) {

                let moduleName = "User.Bot.js";
                let key = pDevTeam + "." + pRepo + "." + pProcess + "/" + moduleName;
                let path = pProcess + "/" + moduleName;

                storage.getStorageData(pDevTeam + "/" + "bots", pRepo, path, onDataArrived);

                function onDataArrived(pData) {

                    try {

                        if (CONSOLE_LOG === true) { console.log("[INFO] BotScripts -> retrieveScripts -> Cloud -> onDataArrived -> Entering function."); }

                        if (pData !== undefined) {

                            let data = pData.toString();
                            data = data.trim(); // remove first byte with some encoding.

                            data = browserify(data);

                            storageData.set(key, data);

                        }

                        callBack();

                    }
                    catch (err) {
                        console.log("[ERROR] BotScripts -> retrieveScripts -> Cloud -> onDataArrived -> Error = " + err);
                    }
                }
            }

            function browserify(pData) {

                let result = pData.substring(pData.indexOf('=') + 2);

                result = replaceAll(result, "require", "webRequire");
                result = replaceAll(result, "global", "window");

                return result;

                function replaceAll(text, search, replacement) {
                    return text.replace(new RegExp(search, 'g'), replacement);
                }
            }

        }
        catch (err) {
            console.log("[ERROR] BotScripts -> retrieveScripts -> Error = " + err);
        }
    }
}