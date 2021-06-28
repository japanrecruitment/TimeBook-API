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

/***/ "./src/functions/authorizers/admin-authorizer/handler.ts":
/*!***************************************************************!*\
  !*** ./src/functions/authorizers/admin-authorizer/handler.ts ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"main\": () => (/* binding */ main)\n/* harmony export */ });\n/* harmony import */ var _libs_authorizer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @libs/authorizer */ \"./src/libs/authorizer/index.ts\");\n\nconst main = async (event, context) => {\n    context.callbackWaitsForEmptyEventLoop = false;\n    return (0,_libs_authorizer__WEBPACK_IMPORTED_MODULE_0__.authorizer)(event, _libs_authorizer__WEBPACK_IMPORTED_MODULE_0__.UserRole.ADMIN);\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvZnVuY3Rpb25zL2F1dGhvcml6ZXJzL2FkbWluLWF1dGhvcml6ZXIvaGFuZGxlci50cy5qcyIsInNvdXJjZXMiOlsid2VicGFjazovL3RpbWVib29rLWFwaS8uL3NyYy9mdW5jdGlvbnMvYXV0aG9yaXplcnMvYWRtaW4tYXV0aG9yaXplci9oYW5kbGVyLnRzP2VmNDkiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYXV0aG9yaXplciwgVXNlclJvbGUgfSBmcm9tIFwiQGxpYnMvYXV0aG9yaXplclwiO1xuaW1wb3J0IHsgSGFuZGxlciB9IGZyb20gXCJhd3MtbGFtYmRhXCI7XG5cbmV4cG9ydCBjb25zdCBtYWluOiBIYW5kbGVyID0gYXN5bmMgKGV2ZW50LCBjb250ZXh0KSA9PiB7XG4gICAgY29udGV4dC5jYWxsYmFja1dhaXRzRm9yRW1wdHlFdmVudExvb3AgPSBmYWxzZTtcbiAgICByZXR1cm4gYXV0aG9yaXplcihldmVudCwgVXNlclJvbGUuQURNSU4pO1xufTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUdBO0FBQ0E7QUFDQTtBQUNBOyIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/functions/authorizers/admin-authorizer/handler.ts\n");

/***/ }),

/***/ "./src/libs/authorizer/AuthTokenHandler.ts":
/*!*************************************************!*\
  !*** ./src/libs/authorizer/AuthTokenHandler.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"decodeAuthToken\": () => (/* binding */ decodeAuthToken),\n/* harmony export */   \"encodeAuthToken\": () => (/* binding */ encodeAuthToken)\n/* harmony export */ });\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jsonwebtoken */ \"jsonwebtoken\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__);\n\nconst encodeAuthToken = (payload) => {\n    return jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default().sign(payload, process.env.TOKEN_SECRET, { expiresIn: \"12h\" });\n};\nconst decodeAuthToken = (bearerToken) => {\n    if (!bearerToken)\n        return;\n    const token = bearerToken.split(\" \")[1];\n    if (!token)\n        return;\n    return jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default().verify(token, process.env.TOKEN_SECRET);\n};\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvbGlicy9hdXRob3JpemVyL0F1dGhUb2tlbkhhbmRsZXIudHMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90aW1lYm9vay1hcGkvLi9zcmMvbGlicy9hdXRob3JpemVyL0F1dGhUb2tlbkhhbmRsZXIudHM/Nzc0MSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgand0IGZyb20gXCJqc29ud2VidG9rZW5cIjtcbmltcG9ydCB7IFVzZXJSb2xlIH0gZnJvbSBcIi4vVXNlclJvbGVcIjtcblxudHlwZSBBdXRoVG9rZW5QYXlsb2FkID0ge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgcm9sZTogVXNlclJvbGU7XG4gICAgY291bnRyeUNvZGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBjb3VudHJ5TmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xufTtcblxudHlwZSBBdXRoVG9rZW5FbmNvZGVyID0gKHBheWxvYWQ6IEF1dGhUb2tlblBheWxvYWQpID0+IHN0cmluZztcblxudHlwZSBBdXRoVG9rZW5EZWNvZGVyID0gKGJlYXJlclRva2VuOiBzdHJpbmcgfCB1bmRlZmluZWQpID0+IEF1dGhUb2tlblBheWxvYWQgfCB1bmRlZmluZWQ7XG5cbmNvbnN0IGVuY29kZUF1dGhUb2tlbjogQXV0aFRva2VuRW5jb2RlciA9IChwYXlsb2FkKSA9PiB7XG4gICAgcmV0dXJuIGp3dC5zaWduKHBheWxvYWQsIHByb2Nlc3MuZW52LlRPS0VOX1NFQ1JFVCwgeyBleHBpcmVzSW46IFwiMTJoXCIgfSk7XG59O1xuXG5jb25zdCBkZWNvZGVBdXRoVG9rZW46IEF1dGhUb2tlbkRlY29kZXIgPSAoYmVhcmVyVG9rZW4pID0+IHtcbiAgICBpZiAoIWJlYXJlclRva2VuKSByZXR1cm47XG4gICAgY29uc3QgdG9rZW4gPSBiZWFyZXJUb2tlbi5zcGxpdChcIiBcIilbMV07XG4gICAgaWYgKCF0b2tlbikgcmV0dXJuO1xuICAgIHJldHVybiBqd3QudmVyaWZ5KHRva2VuLCBwcm9jZXNzLmVudi5UT0tFTl9TRUNSRVQpO1xufTtcblxuZXhwb3J0IHsgZGVjb2RlQXV0aFRva2VuLCBlbmNvZGVBdXRoVG9rZW4sIEF1dGhUb2tlblBheWxvYWQgfTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBO0FBY0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUVBOyIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/libs/authorizer/AuthTokenHandler.ts\n");

/***/ }),

/***/ "./src/libs/authorizer/AuthenticatedUser.ts":
/*!**************************************************!*\
  !*** ./src/libs/authorizer/AuthenticatedUser.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"AuthenticatedUser\": () => (/* binding */ AuthenticatedUser)\n/* harmony export */ });\nclass AuthenticatedUser {\n    constructor(event) {\n        this.authorizer = event.requestContext.authorizer;\n    }\n    get id() {\n        var _a;\n        return (_a = this.authorizer) === null || _a === void 0 ? void 0 : _a.principalId;\n    }\n    get role() {\n        var _a, _b;\n        return (_b = (_a = this.authorizer) === null || _a === void 0 ? void 0 : _a.claims) === null || _b === void 0 ? void 0 : _b.role;\n    }\n    get claims() {\n        var _a;\n        return (_a = this.authorizer) === null || _a === void 0 ? void 0 : _a.claims;\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvbGlicy9hdXRob3JpemVyL0F1dGhlbnRpY2F0ZWRVc2VyLnRzLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdGltZWJvb2stYXBpLy4vc3JjL2xpYnMvYXV0aG9yaXplci9BdXRoZW50aWNhdGVkVXNlci50cz82YTEzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF1dGhUb2tlblBheWxvYWQgfSBmcm9tIFwiLi9BdXRoVG9rZW5IYW5kbGVyXCI7XG5pbXBvcnQgeyBVc2VyUm9sZSB9IGZyb20gXCIuL1VzZXJSb2xlXCI7XG5cbmV4cG9ydCBjbGFzcyBBdXRoZW50aWNhdGVkVXNlciB7XG4gICAgcHJpdmF0ZSBhdXRob3JpemVyO1xuICAgIGNvbnN0cnVjdG9yKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuYXV0aG9yaXplciA9IGV2ZW50LnJlcXVlc3RDb250ZXh0LmF1dGhvcml6ZXI7XG4gICAgfVxuICAgIGdldCBpZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRob3JpemVyPy5wcmluY2lwYWxJZDtcbiAgICB9XG4gICAgZ2V0IHJvbGUoKTogVXNlclJvbGUge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRob3JpemVyPy5jbGFpbXM/LnJvbGU7XG4gICAgfVxuICAgIGdldCBjbGFpbXMoKTogQXV0aFRva2VuUGF5bG9hZCB7XG4gICAgICAgIHJldHVybiB0aGlzLmF1dGhvcml6ZXI/LmNsYWltcztcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7QUFHQTtBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUNBO0FBQ0E7QUFDQTs7QUFDQTtBQUNBO0FBQ0E7O0FBQ0E7QUFDQTtBQUNBOyIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/libs/authorizer/AuthenticatedUser.ts\n");

/***/ }),

/***/ "./src/libs/authorizer/UserRole.ts":
/*!*****************************************!*\
  !*** ./src/libs/authorizer/UserRole.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"UserRole\": () => (/* binding */ UserRole)\n/* harmony export */ });\nvar UserRole;\n(function (UserRole) {\n    UserRole[\"USER\"] = \"user\";\n    UserRole[\"ADMIN\"] = \"admin\";\n    UserRole[\"UNKNOWN\"] = \"unknown\";\n})(UserRole || (UserRole = {}));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvbGlicy9hdXRob3JpemVyL1VzZXJSb2xlLnRzLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdGltZWJvb2stYXBpLy4vc3JjL2xpYnMvYXV0aG9yaXplci9Vc2VyUm9sZS50cz81Njk0Il0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBlbnVtIFVzZXJSb2xlIHtcbiAgICBVU0VSID0gXCJ1c2VyXCIsXG4gICAgQURNSU4gPSBcImFkbWluXCIsXG4gICAgVU5LTk9XTiA9IFwidW5rbm93blwiLFxufVxuIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOyIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/libs/authorizer/UserRole.ts\n");

/***/ }),

/***/ "./src/libs/authorizer/authStrategies.ts":
/*!***********************************************!*\
  !*** ./src/libs/authorizer/authStrategies.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"authStrategies\": () => (/* binding */ authStrategies)\n/* harmony export */ });\n/* harmony import */ var _UserRole__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./UserRole */ \"./src/libs/authorizer/UserRole.ts\");\n\nconst adminStrategy = (authData) => {\n    const { role } = authData;\n    return role !== undefined && role === _UserRole__WEBPACK_IMPORTED_MODULE_0__.UserRole.ADMIN;\n};\nconst userStrategy = (authData) => {\n    const isAdmin = adminStrategy(authData);\n    if (isAdmin)\n        return true;\n    const { role } = authData;\n    return role !== undefined && role === _UserRole__WEBPACK_IMPORTED_MODULE_0__.UserRole.USER;\n};\nconst unknownStrategy = () => false;\nconst authStrategies = {\n    admin: adminStrategy,\n    user: userStrategy,\n    unknown: unknownStrategy,\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvbGlicy9hdXRob3JpemVyL2F1dGhTdHJhdGVnaWVzLnRzLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdGltZWJvb2stYXBpLy4vc3JjL2xpYnMvYXV0aG9yaXplci9hdXRoU3RyYXRlZ2llcy50cz80NGIyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFVzZXJSb2xlIH0gZnJvbSBcIi4vVXNlclJvbGVcIjtcblxudHlwZSBBdXRoRGF0YSA9IHsgcm9sZTogc3RyaW5nIHwgdW5kZWZpbmVkIH07XG5cbnR5cGUgQXV0aFN0cmF0ZWd5ID0gKGF1dGhEYXRhOiBBdXRoRGF0YSkgPT4gYm9vbGVhbjtcblxudHlwZSBBdXRoU3RyYXRlZ2llcyA9IHtcbiAgICBbUCBpbiBVc2VyUm9sZV06IEF1dGhTdHJhdGVneTtcbn07XG5cbmNvbnN0IGFkbWluU3RyYXRlZ3k6IEF1dGhTdHJhdGVneSA9IChhdXRoRGF0YSkgPT4ge1xuICAgIGNvbnN0IHsgcm9sZSB9ID0gYXV0aERhdGE7XG4gICAgcmV0dXJuIHJvbGUgIT09IHVuZGVmaW5lZCAmJiByb2xlID09PSBVc2VyUm9sZS5BRE1JTjtcbn07XG5cbmNvbnN0IHVzZXJTdHJhdGVneTogQXV0aFN0cmF0ZWd5ID0gKGF1dGhEYXRhKSA9PiB7XG4gICAgY29uc3QgaXNBZG1pbiA9IGFkbWluU3RyYXRlZ3koYXV0aERhdGEpO1xuICAgIGlmIChpc0FkbWluKSByZXR1cm4gdHJ1ZTtcblxuICAgIGNvbnN0IHsgcm9sZSB9ID0gYXV0aERhdGE7XG4gICAgcmV0dXJuIHJvbGUgIT09IHVuZGVmaW5lZCAmJiByb2xlID09PSBVc2VyUm9sZS5VU0VSO1xufTtcblxuY29uc3QgdW5rbm93blN0cmF0ZWd5OiBBdXRoU3RyYXRlZ3kgPSAoKSA9PiBmYWxzZTtcblxuZXhwb3J0IGNvbnN0IGF1dGhTdHJhdGVnaWVzOiBBdXRoU3RyYXRlZ2llcyA9IHtcbiAgICBhZG1pbjogYWRtaW5TdHJhdGVneSxcbiAgICB1c2VyOiB1c2VyU3RyYXRlZ3ksXG4gICAgdW5rbm93bjogdW5rbm93blN0cmF0ZWd5LFxufTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQVVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQUE7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Iiwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/libs/authorizer/authStrategies.ts\n");

/***/ }),

/***/ "./src/libs/authorizer/authorizer.ts":
/*!*******************************************!*\
  !*** ./src/libs/authorizer/authorizer.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"authorizer\": () => (/* binding */ authorizer)\n/* harmony export */ });\n/* harmony import */ var _utils_message__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/message */ \"./src/utils/message.ts\");\n/* harmony import */ var _AuthTokenHandler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AuthTokenHandler */ \"./src/libs/authorizer/AuthTokenHandler.ts\");\n/* harmony import */ var _authStrategies__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./authStrategies */ \"./src/libs/authorizer/authStrategies.ts\");\n/* harmony import */ var _generatePolicy__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./generatePolicy */ \"./src/libs/authorizer/generatePolicy.ts\");\n\n\n\n\nconst authorizer = (event, requiredRole) => {\n    try {\n        const decodedData = (0,_AuthTokenHandler__WEBPACK_IMPORTED_MODULE_1__.decodeAuthToken)(event.authorizationToken);\n        if (!decodedData)\n            return _utils_message__WEBPACK_IMPORTED_MODULE_0__.MessageUtil.error(_utils_message__WEBPACK_IMPORTED_MODULE_0__.MessageUtil.errorCode.unauthorized, 10000, \"Unauthorized\");\n        if (_authStrategies__WEBPACK_IMPORTED_MODULE_2__.authStrategies[requiredRole](decodedData))\n            return (0,_generatePolicy__WEBPACK_IMPORTED_MODULE_3__.generatePolicy)(decodedData.id, \"Allow\", event.methodArn, decodedData);\n        return (0,_generatePolicy__WEBPACK_IMPORTED_MODULE_3__.generatePolicy)(null, \"Deny\", event.methodArn, { error: \"unauthorized\", action: null });\n    }\n    catch (error) {\n        if (error.name === \"TokenExpiredError\")\n            return (0,_generatePolicy__WEBPACK_IMPORTED_MODULE_3__.generatePolicy)(null, \"Deny\", event.methodArn, {\n                error: \"token-expired\",\n                message: error.message,\n                action: \"login\",\n            });\n        return (0,_generatePolicy__WEBPACK_IMPORTED_MODULE_3__.generatePolicy)(null, \"Deny\", event.methodArn, {\n            error: \"invalid-token\",\n            message: error.message,\n            action: \"login\",\n        });\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvbGlicy9hdXRob3JpemVyL2F1dGhvcml6ZXIudHMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90aW1lYm9vay1hcGkvLi9zcmMvbGlicy9hdXRob3JpemVyL2F1dGhvcml6ZXIudHM/NDk5MyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNZXNzYWdlVXRpbCB9IGZyb20gXCIuLi8uLi91dGlscy9tZXNzYWdlXCI7XG5pbXBvcnQgeyBVc2VyUm9sZSB9IGZyb20gXCIuL1VzZXJSb2xlXCI7XG5pbXBvcnQgeyBkZWNvZGVBdXRoVG9rZW4gfSBmcm9tIFwiLi9BdXRoVG9rZW5IYW5kbGVyXCI7XG5pbXBvcnQgeyBhdXRoU3RyYXRlZ2llcyB9IGZyb20gXCIuL2F1dGhTdHJhdGVnaWVzXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZVBvbGljeSB9IGZyb20gXCIuL2dlbmVyYXRlUG9saWN5XCI7XG5cbnR5cGUgQXBpR2F0ZXdheUV2ZW50ID0geyBhdXRob3JpemF0aW9uVG9rZW46IHN0cmluZyB8IHVuZGVmaW5lZDsgbWV0aG9kQXJuOiBhbnkgfTtcblxudHlwZSBBdXRob3JpemVyID0gKGV2ZW50OiBBcGlHYXRld2F5RXZlbnQsIHJlcXVpcmVkUm9sZTogVXNlclJvbGUpID0+IHZvaWQ7XG5cbmV4cG9ydCBjb25zdCBhdXRob3JpemVyOiBBdXRob3JpemVyID0gKGV2ZW50LCByZXF1aXJlZFJvbGUpID0+IHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBkZWNvZGVkRGF0YSA9IGRlY29kZUF1dGhUb2tlbihldmVudC5hdXRob3JpemF0aW9uVG9rZW4pO1xuICAgICAgICBpZiAoIWRlY29kZWREYXRhKSByZXR1cm4gTWVzc2FnZVV0aWwuZXJyb3IoTWVzc2FnZVV0aWwuZXJyb3JDb2RlLnVuYXV0aG9yaXplZCwgMTAwMDAsIFwiVW5hdXRob3JpemVkXCIpO1xuICAgICAgICBpZiAoYXV0aFN0cmF0ZWdpZXNbcmVxdWlyZWRSb2xlXShkZWNvZGVkRGF0YSkpXG4gICAgICAgICAgICByZXR1cm4gZ2VuZXJhdGVQb2xpY3koZGVjb2RlZERhdGEuaWQsIFwiQWxsb3dcIiwgZXZlbnQubWV0aG9kQXJuLCBkZWNvZGVkRGF0YSk7XG4gICAgICAgIHJldHVybiBnZW5lcmF0ZVBvbGljeShudWxsLCBcIkRlbnlcIiwgZXZlbnQubWV0aG9kQXJuLCB7IGVycm9yOiBcInVuYXV0aG9yaXplZFwiLCBhY3Rpb246IG51bGwgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKGVycm9yLm5hbWUgPT09IFwiVG9rZW5FeHBpcmVkRXJyb3JcIilcbiAgICAgICAgICAgIHJldHVybiBnZW5lcmF0ZVBvbGljeShudWxsLCBcIkRlbnlcIiwgZXZlbnQubWV0aG9kQXJuLCB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IFwidG9rZW4tZXhwaXJlZFwiLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBcImxvZ2luXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGdlbmVyYXRlUG9saWN5KG51bGwsIFwiRGVueVwiLCBldmVudC5tZXRob2RBcm4sIHtcbiAgICAgICAgICAgIGVycm9yOiBcImludmFsaWQtdG9rZW5cIixcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgICBhY3Rpb246IFwibG9naW5cIixcbiAgICAgICAgfSk7XG4gICAgfVxufTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTtBQUVBO0FBQ0E7QUFDQTtBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Iiwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/libs/authorizer/authorizer.ts\n");

/***/ }),

/***/ "./src/libs/authorizer/generatePolicy.ts":
/*!***********************************************!*\
  !*** ./src/libs/authorizer/generatePolicy.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"generatePolicy\": () => (/* binding */ generatePolicy)\n/* harmony export */ });\nconst generatePolicy = (principalId, effect, resource, data) => {\n    const statementOne = { Action: \"execute-api:Invoke\", Effect: effect, Resource: resource };\n    const policyDocument = { Version: \"2012-10-17\", Statement: [statementOne] };\n    const context = data || {};\n    return { principalId, policyDocument, context };\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvbGlicy9hdXRob3JpemVyL2dlbmVyYXRlUG9saWN5LnRzLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdGltZWJvb2stYXBpLy4vc3JjL2xpYnMvYXV0aG9yaXplci9nZW5lcmF0ZVBvbGljeS50cz83MjE0Il0sInNvdXJjZXNDb250ZW50IjpbInR5cGUgUHJpbmNpcGFsSWQgPSBzdHJpbmcgfCBudWxsO1xuXG50eXBlIFBvbGljeUVmZmVjdCA9IFwiQWxsb3dcIiB8IFwiRGVueVwiO1xuXG50eXBlIEV4ZWN1dGlvblBvbGljeSA9IHtcbiAgICBwcmluY2lwYWxJZDogUHJpbmNpcGFsSWQ7XG4gICAgcG9saWN5RG9jdW1lbnQ6IGFueTtcbiAgICBjb250ZXh0OiBhbnk7XG59O1xuXG50eXBlIFBvbGljeUdlbmVyYXRvciA9IChwcmluY2lwYWxJZDogUHJpbmNpcGFsSWQsIGVmZmVjdDogUG9saWN5RWZmZWN0LCByZXNvdXJjZTogYW55LCBkYXRhOiBhbnkpID0+IEV4ZWN1dGlvblBvbGljeTtcblxuZXhwb3J0IGNvbnN0IGdlbmVyYXRlUG9saWN5OiBQb2xpY3lHZW5lcmF0b3IgPSAocHJpbmNpcGFsSWQsIGVmZmVjdCwgcmVzb3VyY2UsIGRhdGEpID0+IHtcbiAgICBjb25zdCBzdGF0ZW1lbnRPbmUgPSB7IEFjdGlvbjogXCJleGVjdXRlLWFwaTpJbnZva2VcIiwgRWZmZWN0OiBlZmZlY3QsIFJlc291cmNlOiByZXNvdXJjZSB9O1xuICAgIGNvbnN0IHBvbGljeURvY3VtZW50ID0geyBWZXJzaW9uOiBcIjIwMTItMTAtMTdcIiwgU3RhdGVtZW50OiBbc3RhdGVtZW50T25lXSB9O1xuICAgIGNvbnN0IGNvbnRleHQgPSBkYXRhIHx8IHt9O1xuICAgIHJldHVybiB7IHByaW5jaXBhbElkLCBwb2xpY3lEb2N1bWVudCwgY29udGV4dCB9O1xufTtcbiJdLCJtYXBwaW5ncyI6Ijs7OztBQVlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTsiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/libs/authorizer/generatePolicy.ts\n");

/***/ }),

/***/ "./src/libs/authorizer/index.ts":
/*!**************************************!*\
  !*** ./src/libs/authorizer/index.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"UserRole\": () => (/* reexport safe */ _UserRole__WEBPACK_IMPORTED_MODULE_0__.UserRole),\n/* harmony export */   \"authStrategies\": () => (/* reexport safe */ _authStrategies__WEBPACK_IMPORTED_MODULE_1__.authStrategies),\n/* harmony export */   \"authorizer\": () => (/* reexport safe */ _authorizer__WEBPACK_IMPORTED_MODULE_2__.authorizer),\n/* harmony export */   \"generatePolicy\": () => (/* reexport safe */ _generatePolicy__WEBPACK_IMPORTED_MODULE_3__.generatePolicy),\n/* harmony export */   \"decodeAuthToken\": () => (/* reexport safe */ _AuthTokenHandler__WEBPACK_IMPORTED_MODULE_4__.decodeAuthToken),\n/* harmony export */   \"encodeAuthToken\": () => (/* reexport safe */ _AuthTokenHandler__WEBPACK_IMPORTED_MODULE_4__.encodeAuthToken),\n/* harmony export */   \"AuthenticatedUser\": () => (/* reexport safe */ _AuthenticatedUser__WEBPACK_IMPORTED_MODULE_5__.AuthenticatedUser)\n/* harmony export */ });\n/* harmony import */ var _UserRole__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./UserRole */ \"./src/libs/authorizer/UserRole.ts\");\n/* harmony import */ var _authStrategies__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./authStrategies */ \"./src/libs/authorizer/authStrategies.ts\");\n/* harmony import */ var _authorizer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./authorizer */ \"./src/libs/authorizer/authorizer.ts\");\n/* harmony import */ var _generatePolicy__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./generatePolicy */ \"./src/libs/authorizer/generatePolicy.ts\");\n/* harmony import */ var _AuthTokenHandler__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./AuthTokenHandler */ \"./src/libs/authorizer/AuthTokenHandler.ts\");\n/* harmony import */ var _AuthenticatedUser__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./AuthenticatedUser */ \"./src/libs/authorizer/AuthenticatedUser.ts\");\n\n\n\n\n\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvbGlicy9hdXRob3JpemVyL2luZGV4LnRzLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdGltZWJvb2stYXBpLy4vc3JjL2xpYnMvYXV0aG9yaXplci9pbmRleC50cz83MTg3Il0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCAqIGZyb20gXCIuL1VzZXJSb2xlXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9hdXRoU3RyYXRlZ2llc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vYXV0aG9yaXplclwiO1xuZXhwb3J0ICogZnJvbSBcIi4vZ2VuZXJhdGVQb2xpY3lcIjtcbmV4cG9ydCAqIGZyb20gXCIuL0F1dGhUb2tlbkhhbmRsZXJcIjtcbmV4cG9ydCAqIGZyb20gXCIuL0F1dGhlbnRpY2F0ZWRVc2VyXCI7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Iiwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/libs/authorizer/index.ts\n");

/***/ }),

/***/ "./src/utils/message.ts":
/*!******************************!*\
  !*** ./src/utils/message.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"MessageUtil\": () => (/* binding */ MessageUtil)\n/* harmony export */ });\nvar StatusCode;\n(function (StatusCode) {\n    StatusCode[StatusCode[\"success\"] = 200] = \"success\";\n    StatusCode[StatusCode[\"serverError\"] = 500] = \"serverError\";\n    StatusCode[StatusCode[\"clientError\"] = 400] = \"clientError\";\n    StatusCode[StatusCode[\"notFound\"] = 404] = \"notFound\";\n    StatusCode[StatusCode[\"forbidden\"] = 403] = \"forbidden\";\n    StatusCode[StatusCode[\"unauthorized\"] = 401] = \"unauthorized\";\n    StatusCode[StatusCode[\"tooManyRequests\"] = 429] = \"tooManyRequests\";\n})(StatusCode || (StatusCode = {}));\nclass Result {\n    constructor(result, statusCode, code, message, data) {\n        this.result = result;\n        this.statusCode = statusCode;\n        this.code = code;\n        this.message = message;\n        this.data = data;\n    }\n    bodyToString() {\n        const responseBody = {\n            result: this.result,\n            code: this.code,\n            message: this.message,\n            data: this.data,\n        };\n        if (this.result === true) {\n            delete responseBody.code;\n        }\n        return {\n            statusCode: this.statusCode,\n            headers: {\n                \"Access-Control-Allow-Origin\": \"*\",\n                \"Access-Control-Allow-Credentials\": true,\n            },\n            body: JSON.stringify(responseBody),\n        };\n    }\n}\nclass MessageUtil {\n    static success(data) {\n        const result = new Result(true, StatusCode.success, 0, \"success\", data);\n        return result.bodyToString();\n    }\n    static error(statusCode = StatusCode.serverError, code = 1000, message, data = null) {\n        const result = new Result(false, statusCode, code, message, data);\n        return result.bodyToString();\n    }\n}\nMessageUtil.errorCode = StatusCode;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvdXRpbHMvbWVzc2FnZS50cy5qcyIsInNvdXJjZXMiOlsid2VicGFjazovL3RpbWVib29rLWFwaS8uL3NyYy91dGlscy9tZXNzYWdlLnRzP2VlOGIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5UmVzdWx0IH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcblxudHlwZSBSZXNwb25zZUJvZHk8VD4gPSB7XG4gICAgcmVzdWx0OiBib29sZWFuO1xuICAgIGNvZGU/OiBudW1iZXI7XG4gICAgbWVzc2FnZTogc3RyaW5nO1xuICAgIGRhdGE/OiBUIHwgbnVsbDtcbn07XG5cbmVudW0gU3RhdHVzQ29kZSB7XG4gICAgc3VjY2VzcyA9IDIwMCxcbiAgICBzZXJ2ZXJFcnJvciA9IDUwMCxcbiAgICBjbGllbnRFcnJvciA9IDQwMCxcbiAgICBub3RGb3VuZCA9IDQwNCxcbiAgICBmb3JiaWRkZW4gPSA0MDMsXG4gICAgdW5hdXRob3JpemVkID0gNDAxLFxuICAgIHRvb01hbnlSZXF1ZXN0cyA9IDQyOSxcbn1cblxuY2xhc3MgUmVzdWx0PFQ+IHtcbiAgICBwcml2YXRlIHJlc3VsdDogYm9vbGVhbjtcbiAgICBwcml2YXRlIHN0YXR1c0NvZGU6IFN0YXR1c0NvZGU7XG4gICAgcHJpdmF0ZSBjb2RlOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBtZXNzYWdlOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBkYXRhPzogVCB8IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcmVzdWx0OiBib29sZWFuLFxuICAgICAgICBzdGF0dXNDb2RlOiBTdGF0dXNDb2RlLFxuICAgICAgICBjb2RlOiBudW1iZXIsXG4gICAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgICAgZGF0YT86IFQgfCBudWxsXG4gICAgKSB7XG4gICAgICAgIHRoaXMucmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICB0aGlzLnN0YXR1c0NvZGUgPSBzdGF0dXNDb2RlO1xuICAgICAgICB0aGlzLmNvZGUgPSBjb2RlO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlcnZlcmxlc3M6IEFjY29yZGluZyB0byB0aGUgQVBJIEdhdGV3YXkgc3BlY3MsIHRoZSBib2R5IGNvbnRlbnQgbXVzdCBiZSBzdHJpbmdpZmllZFxuICAgICAqL1xuICAgIGJvZHlUb1N0cmluZygpOiBBUElHYXRld2F5UHJveHlSZXN1bHQge1xuICAgICAgICBjb25zdCByZXNwb25zZUJvZHk6IFJlc3BvbnNlQm9keTxUPiA9IHtcbiAgICAgICAgICAgIHJlc3VsdDogdGhpcy5yZXN1bHQsXG4gICAgICAgICAgICBjb2RlOiB0aGlzLmNvZGUsXG4gICAgICAgICAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgICAgICAgICBkYXRhOiB0aGlzLmRhdGEsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMucmVzdWx0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBkZWxldGUgcmVzcG9uc2VCb2R5LmNvZGU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogdGhpcy5zdGF0dXNDb2RlLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IFwiKlwiLFxuICAgICAgICAgICAgICAgIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIjogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShyZXNwb25zZUJvZHkpLFxuICAgICAgICB9O1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VVdGlsIHtcbiAgICBzdGF0aWMgc3VjY2VzczxUPihkYXRhOiBUIHwgbnVsbCk6IEFQSUdhdGV3YXlQcm94eVJlc3VsdCB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBSZXN1bHQ8VD4oXG4gICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgU3RhdHVzQ29kZS5zdWNjZXNzLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIFwic3VjY2Vzc1wiLFxuICAgICAgICAgICAgZGF0YVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0LmJvZHlUb1N0cmluZygpO1xuICAgIH1cblxuICAgIHN0YXRpYyBlcnJvcjxUPihcbiAgICAgICAgc3RhdHVzQ29kZTogU3RhdHVzQ29kZSA9IFN0YXR1c0NvZGUuc2VydmVyRXJyb3IsXG4gICAgICAgIGNvZGU6IG51bWJlciA9IDEwMDAsXG4gICAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgICAgZGF0YTogVCB8IG51bGwgPSBudWxsXG4gICAgKTogQVBJR2F0ZXdheVByb3h5UmVzdWx0IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IFJlc3VsdDxUPihmYWxzZSwgc3RhdHVzQ29kZSwgY29kZSwgbWVzc2FnZSwgZGF0YSk7XG4gICAgICAgIHJldHVybiByZXN1bHQuYm9keVRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGVycm9yQ29kZSA9IFN0YXR1c0NvZGU7XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7QUFTQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBT0E7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBT0E7QUFDQTtBQUVBO0FBTUE7QUFDQTtBQUNBOztBQUVBOyIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/utils/message.ts\n");

/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("jsonwebtoken");;

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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/functions/authorizers/admin-authorizer/handler.ts");
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;