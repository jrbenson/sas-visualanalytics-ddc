var ddc = (function (exports) {
    'use strict';

    /*
    Copyright 2018 SAS Institute Inc.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        https://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    var _timeoutID;
    function setupResizeListener(callback) {
        const resizeEndEvent = document.createEvent('Event');
        resizeEndEvent.initEvent('resizeEndEvent', false, true);
        //redraw graph when window resize is completed
        window.addEventListener('resizeEndEvent', function () {
            callback();
        });
        //create trigger to resizeEnd event
        window.addEventListener('resize', function () {
            if (_timeoutID) {
                clearTimeout(_timeoutID);
            }
            _timeoutID = setTimeout(function () {
                window.dispatchEvent(resizeEndEvent);
            }, 25);
        });
    }
    /**
     * A function to help validate whether the message object from VA contains the data types and order expected.
     *
     * @param resultData - The message object from the VA data-driven content object.
     * @param expectedTypes - List of required types in string form in their expected order. For example: `["string", "number", "date"]`
     * @param optionalTypes - Optional list of optional types. For example: `["string", "number", "date"]` or `"string"` or `"number"` or `"date"`
     */
    function validateRoles(resultData, expectedTypes, optionalTypes = null) {
        const columnsInfo = resultData.columns;
        const numCols = columnsInfo.length;
        // Check the required columns
        if (numCols < expectedTypes.length) {
            return false;
        }
        for (let c = 0; c < expectedTypes.length; c++) {
            if (columnsInfo[c].type !== expectedTypes[c]) {
                return false;
            }
        }
        // Check the optional columns (if any).
        if (numCols > expectedTypes.length) {
            if (optionalTypes === null) {
                return false;
            }
            if (typeof optionalTypes === 'object') {
                // It's an array: (match each type in sequence or until one of the arrays end)
                for (let c = expectedTypes.length, i = 0; c < numCols && i < optionalTypes.length; c++, i++) {
                    if (columnsInfo[c].type !== optionalTypes[i]) {
                        return false;
                    }
                }
            }
            else {
                // It's one single type: all remaining types must match that single type
                for (let c = expectedTypes.length; c < numCols; c++) {
                    if (columnsInfo[c].type !== optionalTypes) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    /**
     *
     * @param resultData
     */
    function initializeSelections(resultData) {
        if (!resultData)
            return null;
        var columnsInfo = resultData.columns;
        var arrayData = resultData.data;
        var selections = [];
        if (columnsInfo && arrayData) {
            for (var c = 0; c < columnsInfo.length; c++) {
                if (columnsInfo[c].usage && columnsInfo[c].usage === 'brush') {
                    // brush column: remove the column info
                    columnsInfo.splice(c, 1);
                    // for each row of data, check the bush column for indication of row selection
                    for (var r = 0; r < arrayData.length; r++) {
                        if (arrayData[r][c] !== 0) {
                            // row r has been selected
                            selections.push({ row: r });
                        }
                        // remove the value of the brush column from the row being processed
                        arrayData[r].splice(c, 1);
                    }
                }
            }
        }
        return selections;
    }
    function convertDateColumns(resultData) {
        if (!resultData)
            return;
        var columnsInfo = resultData.columns;
        var arrayData = resultData.data;
        for (var c = 0; c < columnsInfo.length; c++) {
            var colInfo = columnsInfo[c];
            if (colInfo) {
                // <--- just to be safe
                if (colInfo.type == 'date') {
                    for (var r = 0; r < arrayData.length; r++) {
                        var dateStr = arrayData[r][c].trim();
                        // One of the Date() constructors accept dates as strings in ISO format as input, such as:
                        // "02/12/2012", "Feb/12/2012", "February 12, 2012", "12Feb2012", "Sunday, February 12, 2012", "2012/02/12"
                        // (support for some of those formats may be browser vendor and version dependent).
                        // It does NOT accept Julian neither DD/MM/YYYY formats. In those cases, a transformation is necessary
                        // to put the date string in a supported format.
                        // There is room for a lot of improvement here.
                        if (colInfo.format && colInfo.format.formatString == 'DDMMYY8') {
                            dateStr = dateStr.substr(6) + '-' + dateStr.substr(3, 2) + '-' + dateStr.substr(0, 2); // = YYYY-MM-DD (international standard)
                        }
                        else if (colInfo.format && colInfo.format.formatString == 'JULIAN7') ;
                        else if (colInfo.format && colInfo.format.formatString == 'DATE9') {
                            //DDMMMYY
                            dateStr = dateStr.substr(0, 2) + ' ' + dateStr.substr(2, 3) + ' ' + dateStr.substr(5); // = DD MMM YY
                        }
                        // Other transformations should be added here as needed.
                        arrayData[r][c] = new Date(dateStr);
                    }
                }
            }
        }
    }
    // Returns the object: {<param_label_1>:<param_value_1>, ... , <param_label_n>:<param_value_n>}
    // If <parameter_label> has multiple values, <param_value> is an array
    function getVAParameters(resultData) {
        var parameters = {};
        if (resultData.parameters) {
            resultData.parameters.forEach(function (parameter) {
                parameters[parameter.label] = parameter.value;
            });
        }
        return parameters;
    }

    /*
    Copyright 2018 SAS Institute Inc.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        https://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    function setOnDataReceivedCallback(callback) {
        //   const onMessage = function (evt: any) {
        //     if (evt && evt.data && evt.data.hasOwnProperty('data')) {
        //       callback(evt.data)
        //     }
        //   }
        window.addEventListener('message', (event) => {
            if (event && event.data && event.data.hasOwnProperty('data')) {
                callback(event.data);
            }
        }, false);
    }
    // Examples of valid selectedRows:
    // [0, 3, 4]
    // [{row: 0}, {row: 3}, {row: 4}]
    function postSelectionMessage(resultName, selectedRows) {
        let selections = [];
        if (selectedRows && selectedRows.length > 0 && selectedRows[0].hasOwnProperty('row')) {
            selections = selectedRows;
        }
        else {
            selectedRows.forEach(function (selRow) {
                selections.push({ row: selRow });
            });
        }
        var message = {
            resultName: resultName,
            selections: selections,
        };
        postMessage(message);
    }
    function postInstructionalMessage(resultName, body) {
        var message = {
            resultName: resultName,
            message: body,
        };
        postMessage(message);
    }
    function postMessage(objMessage) {
        var url = window.location != window.parent.location ? document.referrer : document.location.href;
        window.parent.postMessage(objMessage, url);
    }
    function getUrlParams() {
        let params = {};
        const search = window.location.search.slice(window.location.search.indexOf('?') + 2);
        search.split('&').forEach((pair) => {
            if (!pair.includes('=')) {
                params[pair] = '';
            }
            else {
                params[decodeURIComponent(pair.substr(0, pair.indexOf('=')))] = decodeURIComponent(pair.substr(pair.indexOf('=') + 1));
            }
        });
        return params;
    }
    function getUrlParam(name) {
        const params = getUrlParams();
        return name in params ? params[name] : null;
    }

    exports.convertDateColumns = convertDateColumns;
    exports.getUrlParam = getUrlParam;
    exports.getUrlParams = getUrlParams;
    exports.getVAParameters = getVAParameters;
    exports.initializeSelections = initializeSelections;
    exports.postInstructionalMessage = postInstructionalMessage;
    exports.postMessage = postMessage;
    exports.postSelectionMessage = postSelectionMessage;
    exports.setOnDataReceivedCallback = setOnDataReceivedCallback;
    exports.setupResizeListener = setupResizeListener;
    exports.validateRoles = validateRoles;

    return exports;

}({}));
