/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.
THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

/*
 * https://github.com/microsoft/tslib/blob/master/tslib.js
 */

// @ts-ignore
var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) {
        // @ts-ignore
        d[p] = b[p];
    } };

// @ts-ignore
export const _extends = function (d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { // @ts-ignore
        this.constructor = d; }
    // @ts-ignore
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};


// @ts-ignore
var createBinding = Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o: any, m: any, k: any, k2: any) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});

// @ts-ignore
export const _exportStar = function(m, o) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) { // @ts-ignore
        createBinding(o, m, p);
    }
};
