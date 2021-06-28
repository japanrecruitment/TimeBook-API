/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/functions/login/handler.ts":
/*!****************************************!*\
  !*** ./src/functions/login/handler.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"main\": () => (/* binding */ main)\n/* harmony export */ });\n/* harmony import */ var _middlewares__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../middlewares */ \"./src/middlewares/index.ts\");\n/* harmony import */ var _utils_message__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @utils/message */ \"./src/utils/message.ts\");\n\n\nconst login = async (event) => {\n    const { email, password } = event.body;\n    try {\n        return _utils_message__WEBPACK_IMPORTED_MODULE_1__.MessageUtil.success({\n            email,\n            password,\n        });\n    }\n    catch (error) {\n        console.log(error);\n    }\n};\nconst main = (0,_middlewares__WEBPACK_IMPORTED_MODULE_0__.middyfy)(login);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvZnVuY3Rpb25zL2xvZ2luL2hhbmRsZXIudHMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90aW1lYm9vay1hcGkvLi9zcmMvZnVuY3Rpb25zL2xvZ2luL2hhbmRsZXIudHM/NDBjMCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWYWxpZGF0ZWRFdmVudEFQSUdhdGV3YXlQcm94eUV2ZW50IH0gZnJvbSBcIi4uLy4uL2xpYnMvYXBpR2F0ZXdheVwiO1xuaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5UmVzdWx0IH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcbmltcG9ydCB7IG1pZGR5ZnkgfSBmcm9tIFwiLi4vLi4vbWlkZGxld2FyZXNcIjtcbmltcG9ydCBzY2hlbWEgZnJvbSBcIi4vc2NoZW1hXCI7XG5pbXBvcnQgeyBNZXNzYWdlVXRpbCB9IGZyb20gXCJAdXRpbHMvbWVzc2FnZVwiO1xuXG5pbXBvcnQgYmNyeXB0IGZyb20gXCJiY3J5cHRqc1wiO1xuaW1wb3J0IHsgTG9naW5SZXNwb25zZSB9IGZyb20gXCIuL3NjaGVtYVwiO1xuXG5jb25zdCBsb2dpbjogVmFsaWRhdGVkRXZlbnRBUElHYXRld2F5UHJveHlFdmVudDx0eXBlb2Ygc2NoZW1hPiA9IGFzeW5jIChcbiAgICBldmVudFxuKTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcbiAgICBjb25zdCB7IGVtYWlsLCBwYXNzd29yZCB9OiB7IGVtYWlsOiBzdHJpbmc7IHBhc3N3b3JkOiBzdHJpbmcgfSA9IGV2ZW50LmJvZHk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIE1lc3NhZ2VVdGlsLnN1Y2Nlc3M8TG9naW5SZXNwb25zZT4oe1xuICAgICAgICAgICAgZW1haWwsXG4gICAgICAgICAgICBwYXNzd29yZCxcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBtYWluID0gbWlkZHlmeShsb2dpbik7XG4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVBO0FBRUE7QUFLQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTsiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/functions/login/handler.ts\n");

/***/ }),

/***/ "./src/middlewares/index.ts":
/*!**********************************!*\
  !*** ./src/middlewares/index.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"middyfy\": () => (/* reexport safe */ _middyfy__WEBPACK_IMPORTED_MODULE_2__.default),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _middy_http_json_body_parser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @middy/http-json-body-parser */ \"@middy/http-json-body-parser\");\n/* harmony import */ var _middy_http_json_body_parser__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_middy_http_json_body_parser__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _middy_do_not_wait_for_empty_event_loop__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @middy/do-not-wait-for-empty-event-loop */ \"@middy/do-not-wait-for-empty-event-loop\");\n/* harmony import */ var _middy_do_not_wait_for_empty_event_loop__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_middy_do_not_wait_for_empty_event_loop__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _middyfy__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./middyfy */ \"./src/middlewares/middyfy.ts\");\n\n\n\nconst middlewares = [_middy_http_json_body_parser__WEBPACK_IMPORTED_MODULE_0___default()(), _middy_do_not_wait_for_empty_event_loop__WEBPACK_IMPORTED_MODULE_1___default()()];\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (middlewares);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvbWlkZGxld2FyZXMvaW5kZXgudHMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90aW1lYm9vay1hcGkvLi9zcmMvbWlkZGxld2FyZXMvaW5kZXgudHM/MTE4YyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaHR0cEpzb25Cb2R5UGFyc2VzIGZyb20gXCJAbWlkZHkvaHR0cC1qc29uLWJvZHktcGFyc2VyXCI7XG5pbXBvcnQgZG9Ob3RXYWl0Rm9yRW1wdHlFdmVudExvb3AgZnJvbSBcIkBtaWRkeS9kby1ub3Qtd2FpdC1mb3ItZW1wdHktZXZlbnQtbG9vcFwiO1xuXG5leHBvcnQgeyBkZWZhdWx0IGFzIG1pZGR5ZnkgfSBmcm9tIFwiLi9taWRkeWZ5XCI7XG5cbmNvbnN0IG1pZGRsZXdhcmVzID0gW2h0dHBKc29uQm9keVBhcnNlcygpLCBkb05vdFdhaXRGb3JFbXB0eUV2ZW50TG9vcCgpXTtcbmV4cG9ydCBkZWZhdWx0IG1pZGRsZXdhcmVzO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUVBO0FBRUE7QUFDQTsiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/middlewares/index.ts\n");

/***/ }),

/***/ "./src/middlewares/middyfy.ts":
/*!************************************!*\
  !*** ./src/middlewares/middyfy.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _middy_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @middy/core */ \"@middy/core\");\n/* harmony import */ var _middy_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_middy_core__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _middy_do_not_wait_for_empty_event_loop__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @middy/do-not-wait-for-empty-event-loop */ \"@middy/do-not-wait-for-empty-event-loop\");\n/* harmony import */ var _middy_do_not_wait_for_empty_event_loop__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_middy_do_not_wait_for_empty_event_loop__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _middy_http_json_body_parser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @middy/http-json-body-parser */ \"@middy/http-json-body-parser\");\n/* harmony import */ var _middy_http_json_body_parser__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_middy_http_json_body_parser__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nconst middyfy = (handler, preventTimeoout = false) => {\n    const middlewares = [_middy_http_json_body_parser__WEBPACK_IMPORTED_MODULE_2___default()()];\n    preventTimeoout && middlewares.push(_middy_do_not_wait_for_empty_event_loop__WEBPACK_IMPORTED_MODULE_1___default()());\n    return _middy_core__WEBPACK_IMPORTED_MODULE_0___default()(handler).use(middlewares);\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (middyfy);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvbWlkZGxld2FyZXMvbWlkZHlmeS50cy5qcyIsInNvdXJjZXMiOlsid2VicGFjazovL3RpbWVib29rLWFwaS8uL3NyYy9taWRkbGV3YXJlcy9taWRkeWZ5LnRzPzg4ODUiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSGFuZGxlciB9IGZyb20gXCJhd3MtbGFtYmRhXCI7XG5pbXBvcnQgbWlkZHkgZnJvbSBcIkBtaWRkeS9jb3JlXCI7XG5pbXBvcnQgZG9Ob3RXYWl0Rm9yRW1wdHlFdmVudExvb3AgZnJvbSBcIkBtaWRkeS9kby1ub3Qtd2FpdC1mb3ItZW1wdHktZXZlbnQtbG9vcFwiO1xuaW1wb3J0IGh0dHBKc29uQm9keVBhcnNlcyBmcm9tIFwiQG1pZGR5L2h0dHAtanNvbi1ib2R5LXBhcnNlclwiO1xuXG5jb25zdCBtaWRkeWZ5ID0gKGhhbmRsZXI6IEhhbmRsZXIsIHByZXZlbnRUaW1lb291dDogYm9vbGVhbiA9IGZhbHNlKSA9PiB7XG4gICAgY29uc3QgbWlkZGxld2FyZXMgPSBbaHR0cEpzb25Cb2R5UGFyc2VzKCldO1xuXG4gICAgLy8gaWYgcHJldmVudFRpbWVvdXQgaXMgdHJ1ZSBhZGQgZG9Ob3RXYWl0Rm9yRW1wdHlFdmVudExvb3AgbWlkZGxld2FyZS5cbiAgICAvLyBUaGlzIG1pZGRsZXdhcmUgc2V0cyBjb250ZXh0LmNhbGxiYWNrV2FpdHNGb3JFbXB0eUV2ZW50TG9vcCBwcm9wZXJ0eSB0byBmYWxzZVxuICAgIC8vIFRoaXMgd2lsbCBwcmV2ZW50IExhbWJkYSBmcm9tIHRpbWluZyBvdXQgYmVjYXVzZSBvZiBvcGVuIGRhdGFiYXNlIGNvbm5lY3Rpb25zLCBldGMuXG4gICAgcHJldmVudFRpbWVvb3V0ICYmIG1pZGRsZXdhcmVzLnB1c2goZG9Ob3RXYWl0Rm9yRW1wdHlFdmVudExvb3AoKSk7XG5cbiAgICByZXR1cm4gbWlkZHkoaGFuZGxlcikudXNlKG1pZGRsZXdhcmVzKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1pZGR5Znk7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBS0E7QUFFQTtBQUNBO0FBRUE7Iiwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/middlewares/middyfy.ts\n");

/***/ }),

/***/ "./src/utils/message.ts":
/*!******************************!*\
  !*** ./src/utils/message.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"MessageUtil\": () => (/* binding */ MessageUtil)\n/* harmony export */ });\nvar StatusCode;\n(function (StatusCode) {\n    StatusCode[StatusCode[\"success\"] = 200] = \"success\";\n    StatusCode[StatusCode[\"serverError\"] = 500] = \"serverError\";\n    StatusCode[StatusCode[\"clientError\"] = 400] = \"clientError\";\n    StatusCode[StatusCode[\"notFound\"] = 404] = \"notFound\";\n    StatusCode[StatusCode[\"forbidden\"] = 403] = \"forbidden\";\n    StatusCode[StatusCode[\"unauthorized\"] = 401] = \"unauthorized\";\n    StatusCode[StatusCode[\"tooManyRequests\"] = 429] = \"tooManyRequests\";\n})(StatusCode || (StatusCode = {}));\nclass Result {\n    constructor(result, statusCode, code, message, data) {\n        this.result = result;\n        this.statusCode = statusCode;\n        this.code = code;\n        this.message = message;\n        this.data = data;\n    }\n    bodyToString() {\n        const responseBody = {\n            result: this.result,\n            code: this.code,\n            message: this.message,\n            data: this.data,\n        };\n        if (this.result === true) {\n            delete responseBody.code;\n        }\n        return {\n            statusCode: this.statusCode,\n            headers: {\n                \"Access-Control-Allow-Origin\": \"*\",\n                \"Access-Control-Allow-Credentials\": true,\n            },\n            body: JSON.stringify(responseBody),\n        };\n    }\n}\nclass MessageUtil {\n    static success(data) {\n        const result = new Result(true, StatusCode.success, 0, \"success\", data);\n        return result.bodyToString();\n    }\n    static error(statusCode = StatusCode.serverError, code = 1000, message, data = null) {\n        const result = new Result(false, statusCode, code, message, data);\n        return result.bodyToString();\n    }\n}\nMessageUtil.errorCode = StatusCode;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvdXRpbHMvbWVzc2FnZS50cy5qcyIsInNvdXJjZXMiOlsid2VicGFjazovL3RpbWVib29rLWFwaS8uL3NyYy91dGlscy9tZXNzYWdlLnRzP2VlOGIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5UmVzdWx0IH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcblxudHlwZSBSZXNwb25zZUJvZHk8VD4gPSB7XG4gICAgcmVzdWx0OiBib29sZWFuO1xuICAgIGNvZGU/OiBudW1iZXI7XG4gICAgbWVzc2FnZTogc3RyaW5nO1xuICAgIGRhdGE/OiBUIHwgbnVsbDtcbn07XG5cbmVudW0gU3RhdHVzQ29kZSB7XG4gICAgc3VjY2VzcyA9IDIwMCxcbiAgICBzZXJ2ZXJFcnJvciA9IDUwMCxcbiAgICBjbGllbnRFcnJvciA9IDQwMCxcbiAgICBub3RGb3VuZCA9IDQwNCxcbiAgICBmb3JiaWRkZW4gPSA0MDMsXG4gICAgdW5hdXRob3JpemVkID0gNDAxLFxuICAgIHRvb01hbnlSZXF1ZXN0cyA9IDQyOSxcbn1cblxuY2xhc3MgUmVzdWx0PFQ+IHtcbiAgICBwcml2YXRlIHJlc3VsdDogYm9vbGVhbjtcbiAgICBwcml2YXRlIHN0YXR1c0NvZGU6IFN0YXR1c0NvZGU7XG4gICAgcHJpdmF0ZSBjb2RlOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBtZXNzYWdlOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBkYXRhPzogVCB8IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcmVzdWx0OiBib29sZWFuLFxuICAgICAgICBzdGF0dXNDb2RlOiBTdGF0dXNDb2RlLFxuICAgICAgICBjb2RlOiBudW1iZXIsXG4gICAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgICAgZGF0YT86IFQgfCBudWxsXG4gICAgKSB7XG4gICAgICAgIHRoaXMucmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICB0aGlzLnN0YXR1c0NvZGUgPSBzdGF0dXNDb2RlO1xuICAgICAgICB0aGlzLmNvZGUgPSBjb2RlO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlcnZlcmxlc3M6IEFjY29yZGluZyB0byB0aGUgQVBJIEdhdGV3YXkgc3BlY3MsIHRoZSBib2R5IGNvbnRlbnQgbXVzdCBiZSBzdHJpbmdpZmllZFxuICAgICAqL1xuICAgIGJvZHlUb1N0cmluZygpOiBBUElHYXRld2F5UHJveHlSZXN1bHQge1xuICAgICAgICBjb25zdCByZXNwb25zZUJvZHk6IFJlc3BvbnNlQm9keTxUPiA9IHtcbiAgICAgICAgICAgIHJlc3VsdDogdGhpcy5yZXN1bHQsXG4gICAgICAgICAgICBjb2RlOiB0aGlzLmNvZGUsXG4gICAgICAgICAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgICAgICAgICBkYXRhOiB0aGlzLmRhdGEsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMucmVzdWx0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBkZWxldGUgcmVzcG9uc2VCb2R5LmNvZGU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogdGhpcy5zdGF0dXNDb2RlLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IFwiKlwiLFxuICAgICAgICAgICAgICAgIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIjogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShyZXNwb25zZUJvZHkpLFxuICAgICAgICB9O1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VVdGlsIHtcbiAgICBzdGF0aWMgc3VjY2VzczxUPihkYXRhOiBUIHwgbnVsbCk6IEFQSUdhdGV3YXlQcm94eVJlc3VsdCB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBSZXN1bHQ8VD4oXG4gICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgU3RhdHVzQ29kZS5zdWNjZXNzLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIFwic3VjY2Vzc1wiLFxuICAgICAgICAgICAgZGF0YVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LmJvZHlUb1N0cmluZygpO1xuICAgIH1cblxuICAgIHN0YXRpYyBlcnJvcjxUPihcbiAgICAgICAgc3RhdHVzQ29kZTogU3RhdHVzQ29kZSA9IFN0YXR1c0NvZGUuc2VydmVyRXJyb3IsXG4gICAgICAgIGNvZGU6IG51bWJlciA9IDEwMDAsXG4gICAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgICAgZGF0YTogVCB8IG51bGwgPSBudWxsXG4gICAgKTogQVBJR2F0ZXdheVByb3h5UmVzdWx0IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IFJlc3VsdDxUPihmYWxzZSwgc3RhdHVzQ29kZSwgY29kZSwgbWVzc2FnZSwgZGF0YSk7XG4gICAgICAgIHJldHVybiByZXN1bHQuYm9keVRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGVycm9yQ29kZSA9IFN0YXR1c0NvZGU7XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7QUFTQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBT0E7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBT0E7QUFDQTtBQUVBO0FBTUE7QUFDQTtBQUNBOztBQUVBOyIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/utils/message.ts\n");

/***/ }),

/***/ "@middy/core":
/*!******************************!*\
  !*** external "@middy/core" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("@middy/core");;

/***/ }),

/***/ "@middy/do-not-wait-for-empty-event-loop":
/*!**********************************************************!*\
  !*** external "@middy/do-not-wait-for-empty-event-loop" ***!
  \**********************************************************/
/***/ ((module) => {

module.exports = require("@middy/do-not-wait-for-empty-event-loop");;

/***/ }),

/***/ "@middy/http-json-body-parser":
/*!***********************************************!*\
  !*** external "@middy/http-json-body-parser" ***!
  \***********************************************/
/***/ ((module) => {

module.exports = require("@middy/http-json-body-parser");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/functions/login/handler.ts");
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;