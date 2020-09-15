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

export function setOnDataReceivedCallback(callback: Function) {
  //   const onMessage = function (evt: any) {
  //     if (evt && evt.data && evt.data.hasOwnProperty('data')) {
  //       callback(evt.data)
  //     }
  //   }
  window.addEventListener(
    'message',
    (event) => {
      if (event && event.data && event.data.hasOwnProperty('data')) {
        callback(event.data)
      }
    },
    false
  )
}

type SelectionArray = Array<{ row: number }>

interface MessageToVA {
  resultName: string
  selections?: SelectionArray
  message?: string
}

// Examples of valid selectedRows:
// [0, 3, 4]
// [{row: 0}, {row: 3}, {row: 4}]
export function postSelectionMessage(resultName: string, selectedRows: Array<number> | SelectionArray) {
  let selections: SelectionArray = []
  if (selectedRows && selectedRows.length > 0 && selectedRows[0].hasOwnProperty('row')) {
    selections = selectedRows as SelectionArray
  } else {
    selectedRows.forEach(function (selRow: any) {
      selections.push({ row: selRow })
    })
  }

  var message = {
    resultName: resultName,
    selections: selections,
  }
  postMessage(message)
}

export function postInstructionalMessage(resultName: string, body: string) {
  var message = {
    resultName: resultName,
    message: body,
  }
  postMessage(message)
}

export function postMessage(objMessage: MessageToVA) {
  var url = window.location != window.parent.location ? document.referrer : document.location.href

  window.parent.postMessage(objMessage, url)
}

export function getUrlParams(): Record<string, string> {
  let params: Record<string, string> = {}

  const search = window.location.search.slice(window.location.search.indexOf('?') + 1)
  search.split('&').forEach((pair) => {
    if (!pair.includes('=')) {
      params[pair] = ''
    } else {
      params[decodeURIComponent(pair.substr(0, pair.indexOf('=')))] = decodeURIComponent(
        pair.substr(pair.indexOf('=') + 1)
      )
    }
  })

  return params
}

export function getUrlParam(name: string): string | null {
  const params = getUrlParams()

  return name in params ? params[name] : null
}
