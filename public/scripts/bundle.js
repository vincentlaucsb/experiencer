/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"main": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push(["./src/index.tsx","vendors~main"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/Resume.tsx":
/*!************************!*\
  !*** ./src/Resume.tsx ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_LoadComponent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/LoadComponent */ "./src/components/LoadComponent.tsx");
/* harmony import */ var file_saver__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! file-saver */ "./node_modules/file-saver/dist/FileSaver.min.js");
/* harmony import */ var file_saver__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(file_saver__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _components_SideMenu__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/SideMenu */ "./src/components/SideMenu.tsx");
/* harmony import */ var _css_index_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./css/index.css */ "./src/css/index.css");
/* harmony import */ var _css_index_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_css_index_css__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var bootstrap_dist_css_bootstrap_min_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! bootstrap/dist/css/bootstrap.min.css */ "./node_modules/bootstrap/dist/css/bootstrap.min.css");
/* harmony import */ var bootstrap_dist_css_bootstrap_min_css__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(bootstrap_dist_css_bootstrap_min_css__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/index.js");
/* harmony import */ var _components_FileLoader__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/FileLoader */ "./src/components/FileLoader.tsx");








const resumeData = [
    {
        type: 'FlexibleRow',
        children: [
            {
                type: 'Title',
                value: 'Vincent La'
            },
            {
                type: 'Paragraph',
                value: 'Email: vincela9@hotmail.com\nPhone: 123-456-7890'
            }
        ]
    },
    {
        type: 'Section',
        title: 'Objective',
        children: [
            {
                type: 'Paragraph',
                value: 'To conquer the world.'
            }
        ]
    },
    {
        type: 'Section',
        title: 'Education',
        children: [
            {
                type: 'Entry'
            }
        ]
    }
];
class Resume extends react__WEBPACK_IMPORTED_MODULE_0__["Component"] {
    constructor(props) {
        super(props);
        // Custom CSS
        const head = document.getElementsByTagName("head")[0];
        this.style = document.createElement("style");
        this.style.innerHTML = "";
        head.appendChild(this.style);
        this.state = {
            children: resumeData,
            customCss: `body {
    margin: 1em auto 1em auto;
    font-family: Tahoma, sans-serif;
    font-size: 10pt;
}

body * {
    margin: 0;
}

h1, h2, h3, h4 {
    font-family: Georgia, serif;
}

h2 { border-bottom: 1px solid; }

section {
    margin-bottom: 1.5em;
}`
        };
        this.renderStyle();
        // this.addSection = this.addSection.bind(this);
        this.addChild = this.addChild.bind(this);
        this.updateData = this.updateData.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.renderStyle = this.renderStyle.bind(this);
        this.onStyleChange = this.onStyleChange.bind(this);
        this.saveFile = this.saveFile.bind(this);
    }
    /*
    addSection() {
        this.setState({
            children: this.state.children.addChild({
                type: 'Section',
                title: 'Add title here'
            })
        });
    }
    */
    // Update custom CSS
    onStyleChange(event) {
        this.setState({
            customCss: event.target.value,
        });
    }
    // Push style changes to browser
    renderStyle() {
        this.style.innerHTML = this.state.customCss;
    }
    addChild(idx, node) {
        this.state.children[idx]['children'].push(node);
        this.setState({
            children: this.state.children
        });
    }
    deleteChild(idx) {
        let newChildren = new Array();
        for (let i = 0; i < this.state.children.length; i++) {
            if (i != idx) {
                newChildren.push(this.state.children[i]);
            }
        }
        this.setState({
            children: newChildren
        });
    }
    updateData(idx, key, data) {
        this.state.children[idx][key] = data;
        this.setState({
            children: this.state.children
        });
    }
    toggleEdit(idx) {
        console.log("Toggle edit received", idx);
        let currentValue = this.state.children[idx]['isEditing'];
        this.state.children[idx]['isEditing'] = !currentValue;
        this.setState({
            children: this.state.children
        });
    }
    loadData(data) {
        this.setState({ children: data });
    }
    // Save data to an external file
    saveFile() {
        var blob = new Blob([JSON.stringify(this.state.children)], {
            type: "text/plain;charset=utf-8"
        });
        // TODO: Allow user to change filename
        Object(file_saver__WEBPACK_IMPORTED_MODULE_2__["saveAs"])(blob, "resume.json");
    }
    render() {
        console.log(this.state.children);
        // <button style={{}} onClick={this.addSection}>Add Section</button>
        return react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", { style: {
                display: 'flex',
                flexDirection: 'row'
            } },
            react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", { id: "resume", style: { width: "100%" } }, this.state.children.map((elem, idx) => react__WEBPACK_IMPORTED_MODULE_0__["createElement"](react__WEBPACK_IMPORTED_MODULE_0__["Fragment"], { key: idx }, Object(_components_LoadComponent__WEBPACK_IMPORTED_MODULE_1__["default"])(elem, {
                addChild: this.addChild.bind(this, idx),
                deleteChild: this.deleteChild.bind(this, idx),
                toggleEdit: this.toggleEdit.bind(this, idx),
                updateData: this.updateData.bind(this, idx)
            })))),
            react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", { style: {
                    maxWidth: "500px",
                    paddingLeft: "1em"
                } },
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_components_SideMenu__WEBPACK_IMPORTED_MODULE_3__["SideMenu"], null,
                    react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_components_FileLoader__WEBPACK_IMPORTED_MODULE_7__["FileLoader"], { loadData: this.loadData }),
                    react__WEBPACK_IMPORTED_MODULE_0__["createElement"](react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["Button"], { onClick: this.saveFile }, "Save Data"),
                    react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("h2", null, "Style Editor"),
                    react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("textarea", { style: {
                            minWidth: "400px",
                            minHeight: "400px",
                            width: "100%"
                        }, onChange: this.onStyleChange, value: this.state.customCss }),
                    react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("button", { onClick: this.renderStyle }, "Update"))));
    }
}
/* harmony default export */ __webpack_exports__["default"] = (Resume);


/***/ }),

/***/ "./src/components/Buttons.tsx":
/*!************************************!*\
  !*** ./src/components/Buttons.tsx ***!
  \************************************/
/*! exports provided: AddButton, default, DeleteButton */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AddButton", function() { return AddButton; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return EditButton; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DeleteButton", function() { return DeleteButton; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _icons_add_24px_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../icons/add-24px.svg */ "./src/icons/add-24px.svg");
/* harmony import */ var _icons_add_24px_svg__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_icons_add_24px_svg__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _icons_delete_24px_svg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../icons/delete-24px.svg */ "./src/icons/delete-24px.svg");
/* harmony import */ var _icons_delete_24px_svg__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_icons_delete_24px_svg__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _icons_edit_24px_svg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../icons/edit-24px.svg */ "./src/icons/edit-24px.svg");
/* harmony import */ var _icons_edit_24px_svg__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_icons_edit_24px_svg__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _icons_done_24px_svg__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../icons/done-24px.svg */ "./src/icons/done-24px.svg");
/* harmony import */ var _icons_done_24px_svg__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_icons_done_24px_svg__WEBPACK_IMPORTED_MODULE_4__);





function AddButton(props) {
    return react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("img", { onClick: props.action, src: _icons_add_24px_svg__WEBPACK_IMPORTED_MODULE_1___default.a, alt: 'Add' });
}
function EditButton(props) {
    const editIcon = react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("img", { src: _icons_edit_24px_svg__WEBPACK_IMPORTED_MODULE_3___default.a, alt: 'Edit' });
    if (props.isEditing && props.toggleEdit) {
        return react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("img", { onClick: props.toggleEdit, src: _icons_done_24px_svg__WEBPACK_IMPORTED_MODULE_4___default.a, alt: 'Edit' });
    }
    return react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("img", { onClick: props.toggleEdit, src: _icons_edit_24px_svg__WEBPACK_IMPORTED_MODULE_3___default.a, alt: 'Edit' });
}
function DeleteButton(props) {
    return react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("img", { onClick: props.deleteChild, src: _icons_delete_24px_svg__WEBPACK_IMPORTED_MODULE_2___default.a, alt: 'Delete' });
}


/***/ }),

/***/ "./src/components/Entry.tsx":
/*!**********************************!*\
  !*** ./src/components/Entry.tsx ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Entry; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ResumeComponent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ResumeComponent */ "./src/components/ResumeComponent.tsx");
/* harmony import */ var _Buttons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Buttons */ "./src/components/Buttons.tsx");



class Entry extends _ResumeComponent__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor(props) {
        super(props);
        this.addChild = this.addChild.bind(this);
    }
    addChild() {
        if (this.props.addChild) {
            this.props.addChild({
                type: 'List'
            });
        }
    }
    render() {
        if (this.props.isEditing) {
            return react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", null,
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("input", { onChange: this.updateData.bind(this, "title"), value: this.props.title || "" }),
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("input", { onChange: this.updateData.bind(this, "subtitle"), value: this.props.subtitle || "" }),
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_Buttons__WEBPACK_IMPORTED_MODULE_2__["default"], Object.assign({}, this.props)));
        }
        return react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", null,
            react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("h3", null,
                this.props.title || "Enter a title",
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_Buttons__WEBPACK_IMPORTED_MODULE_2__["AddButton"], { action: this.addChild }),
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_Buttons__WEBPACK_IMPORTED_MODULE_2__["default"], Object.assign({}, this.props))),
            react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("p", null, this.props.subtitle || "Enter a subtitle"),
            this.renderChildren());
    }
}


/***/ }),

/***/ "./src/components/FileLoader.tsx":
/*!***************************************!*\
  !*** ./src/components/FileLoader.tsx ***!
  \***************************************/
/*! exports provided: FileLoader */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FileLoader", function() { return FileLoader; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

// Form used for reading Auto Cost Calculator saved files
class FileLoader extends react__WEBPACK_IMPORTED_MODULE_0__["Component"] {
    constructor(props) {
        super(props);
        this.state = {
            filename: ''
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.readFile = this.readFile.bind(this);
        // See: https://reactjs.org/docs/uncontrolled-components.html#the-file-input-tag
        this.fileInput = react__WEBPACK_IMPORTED_MODULE_0__["createRef"]();
    }
    readFile(file) {
        /*
         * Ref:
         * https://stackoverflow.com/questions/750032/reading-file-contents-on-the-client-side-in-javascript-in-various-browsers
         */
        const reader = new FileReader();
        reader.onload = (fileLoadedEvent) => {
            var text = reader.result;
            if (text) {
                this.props.loadData(JSON.parse(text.toString()));
            }
        };
        reader.readAsText(file, "UTF-8");
    }
    handleSubmit(event) {
        event.preventDefault(); // Prevent page refresh
        let userFile = this.fileInput.current.files[0];
        this.readFile(userFile);
    }
    render() {
        return react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("form", { onSubmit: this.handleSubmit, id: "loadFile" },
            react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", { className: "form-group" },
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("label", null,
                    "File",
                    react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("input", { className: "form-control", type: "file", ref: this.fileInput }))));
    }
}


/***/ }),

/***/ "./src/components/FlexibleRow.tsx":
/*!****************************************!*\
  !*** ./src/components/FlexibleRow.tsx ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return FlexibleRow; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ResumeComponent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ResumeComponent */ "./src/components/ResumeComponent.tsx");


class FlexibleRow extends _ResumeComponent__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor(props) {
        super(props);
    }
    render() {
        return react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", { style: {
                display: "flex",
                justifyContent: "space-between",
                flexDirection: "row",
                width: "100%"
            } }, this.renderChildren());
    }
}


/***/ }),

/***/ "./src/components/List.tsx":
/*!*********************************!*\
  !*** ./src/components/List.tsx ***!
  \*********************************/
/*! exports provided: ListItem, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ListItem", function() { return ListItem; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return List; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ResumeComponent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ResumeComponent */ "./src/components/ResumeComponent.tsx");


class ListItem extends _ResumeComponent__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor(props) {
        super(props);
    }
    render() {
        if (this.props.isEditing) {
            return react__WEBPACK_IMPORTED_MODULE_0__["createElement"](react__WEBPACK_IMPORTED_MODULE_0__["Fragment"], null,
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("input", { onChange: this.props.updateData.bind(this, "value"), value: this.props.value, type: "text" }),
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", { style: { float: "right" } },
                    react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("button", { onClick: this.toggleEdit }, "Done")));
        }
        return react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("li", null,
            this.props.value,
            react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", { style: { float: "right" } },
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("button", { onClick: this.toggleEdit }, "Edit")));
    }
}
class List extends _ResumeComponent__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor(props) {
        super(props);
        this.addChild = this.addChild.bind(this);
    }
    addChild() {
        if (this.props.addChild) {
            this.props.addChild({
                type: 'ListItem'
            });
        }
    }
    render() {
        return react__WEBPACK_IMPORTED_MODULE_0__["createElement"](react__WEBPACK_IMPORTED_MODULE_0__["Fragment"], null,
            react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", { style: { float: "right" } },
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("button", { onClick: this.addChild }, "Add")),
            react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("ul", null, this.renderChildren()));
    }
}


/***/ }),

/***/ "./src/components/LoadComponent.tsx":
/*!******************************************!*\
  !*** ./src/components/LoadComponent.tsx ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return loadComponent; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _FlexibleRow__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./FlexibleRow */ "./src/components/FlexibleRow.tsx");
/* harmony import */ var _Section__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Section */ "./src/components/Section.tsx");
/* harmony import */ var _Entry__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Entry */ "./src/components/Entry.tsx");
/* harmony import */ var _List__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./List */ "./src/components/List.tsx");
/* harmony import */ var _Paragraph__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Paragraph */ "./src/components/Paragraph.tsx");
/* harmony import */ var _Title__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Title */ "./src/components/Title.tsx");







function loadComponent(data, extraProps) {
    // Load prop data
    let props = {};
    for (let key in data) {
        if (data[key] != 'children' && data[key] != 'type') {
            props[key] = data[key];
        }
    }
    if (extraProps) {
        props['addChild'] = extraProps.addChild;
        props['deleteChild'] = extraProps.deleteChild;
        props['toggleEdit'] = extraProps.toggleEdit;
        props['updateData'] = extraProps.updateData;
    }
    props['children'] = new Array();
    // Load children
    if (data['children']) {
        props['children'] = data['children'];
    }
    switch (data['type']) {
        case 'FlexibleRow':
            return react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_FlexibleRow__WEBPACK_IMPORTED_MODULE_1__["default"], Object.assign({}, props));
        case 'Section':
            return react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_Section__WEBPACK_IMPORTED_MODULE_2__["default"], Object.assign({}, props));
        case 'Entry':
            return react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_Entry__WEBPACK_IMPORTED_MODULE_3__["default"], Object.assign({}, props));
        case 'List':
            return react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_List__WEBPACK_IMPORTED_MODULE_4__["default"], Object.assign({}, props));
        case 'ListItem':
            return react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_List__WEBPACK_IMPORTED_MODULE_4__["ListItem"], Object.assign({}, props));
        case 'Paragraph':
            return react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_Paragraph__WEBPACK_IMPORTED_MODULE_5__["default"], Object.assign({}, props));
        case 'Title':
            return react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_Title__WEBPACK_IMPORTED_MODULE_6__["default"], Object.assign({}, props));
    }
}


/***/ }),

/***/ "./src/components/Paragraph.tsx":
/*!**************************************!*\
  !*** ./src/components/Paragraph.tsx ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Paragraph; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Buttons__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Buttons */ "./src/components/Buttons.tsx");
/* harmony import */ var _ResumeComponent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ResumeComponent */ "./src/components/ResumeComponent.tsx");



class Paragraph extends _ResumeComponent__WEBPACK_IMPORTED_MODULE_2__["default"] {
    constructor(props) {
        super(props);
        this.updateData = this.updateData.bind(this);
    }
    // Convert newlines ('\n') into HTML line breaks
    processTextArea() {
        let textArea = this.props.value.split("\n");
        return react__WEBPACK_IMPORTED_MODULE_0__["createElement"](react__WEBPACK_IMPORTED_MODULE_0__["Fragment"], null, textArea.map((x, idx) => react__WEBPACK_IMPORTED_MODULE_0__["createElement"](react__WEBPACK_IMPORTED_MODULE_0__["Fragment"], { key: idx },
            x,
            react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("br", null))));
    }
    render() {
        if (this.props.isEditing) {
            return react__WEBPACK_IMPORTED_MODULE_0__["createElement"](react__WEBPACK_IMPORTED_MODULE_0__["Fragment"], null,
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("textarea", { onChange: this.updateData.bind(this, "value"), value: this.props.value }),
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_Buttons__WEBPACK_IMPORTED_MODULE_1__["default"], Object.assign({}, this.props)));
        }
        return react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("p", null,
            this.processTextArea(),
            react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("span", { style: { display: "inline-block" } },
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_Buttons__WEBPACK_IMPORTED_MODULE_1__["default"], Object.assign({}, this.props)),
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_Buttons__WEBPACK_IMPORTED_MODULE_1__["DeleteButton"], Object.assign({}, this.props))));
    }
}


/***/ }),

/***/ "./src/components/ResumeComponent.tsx":
/*!********************************************!*\
  !*** ./src/components/ResumeComponent.tsx ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ResumeComponent; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _LoadComponent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./LoadComponent */ "./src/components/LoadComponent.tsx");


// Represents a component that is part of the user's resume
class ResumeComponent extends react__WEBPACK_IMPORTED_MODULE_0__["Component"] {
    constructor(props) {
        super(props);
        this.updateData = this.updateData.bind(this);
        this.addNestedChild = this.addNestedChild.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.toggleNestedEdit = this.toggleNestedEdit.bind(this);
        this.updateNestedData = this.updateNestedData.bind(this);
    }
    addNestedChild(idx, node) {
        let newChildren = this.props.children;
        if (!newChildren[idx]['children']) {
            newChildren[idx]['children'] = new Array();
        }
        newChildren[idx]['children'].push(node);
        if (this.props.updateData) {
            this.props.updateData("children", newChildren);
        }
    }
    toggleEdit(event) {
        if (this.props.toggleEdit) {
            this.props.toggleEdit();
        }
    }
    toggleNestedEdit(idx) {
        let currentChildData = this.props.children[idx]['isEditing'];
        this.updateNestedData(idx, "isEditing", !currentChildData);
    }
    updateNestedData(idx, key, data) {
        let newChildren = this.props.children;
        newChildren[idx][key] = data;
        if (this.props.updateData) {
            this.props.updateData("children", newChildren);
        }
    }
    updateData(key, event) {
        if (this.props.updateData) {
            this.props.updateData(key, event.target.value);
        }
    }
    renderChildren() {
        if (this.props.children) {
            return react__WEBPACK_IMPORTED_MODULE_0__["createElement"](react__WEBPACK_IMPORTED_MODULE_0__["Fragment"], null, this.props.children.map((elem, idx) => react__WEBPACK_IMPORTED_MODULE_0__["createElement"](react__WEBPACK_IMPORTED_MODULE_0__["Fragment"], { key: idx }, Object(_LoadComponent__WEBPACK_IMPORTED_MODULE_1__["default"])(elem, {
                addChild: this.addNestedChild.bind(this, idx),
                toggleEdit: this.toggleNestedEdit.bind(this, idx),
                updateData: this.updateNestedData.bind(this, idx)
            }))));
        }
        return react__WEBPACK_IMPORTED_MODULE_0__["createElement"](react__WEBPACK_IMPORTED_MODULE_0__["Fragment"], null);
    }
}


/***/ }),

/***/ "./src/components/Section.tsx":
/*!************************************!*\
  !*** ./src/components/Section.tsx ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Section; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Buttons__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Buttons */ "./src/components/Buttons.tsx");
/* harmony import */ var _ResumeComponent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ResumeComponent */ "./src/components/ResumeComponent.tsx");



class Section extends _ResumeComponent__WEBPACK_IMPORTED_MODULE_2__["default"] {
    constructor(props) {
        super(props);
        this.addChild = this.addChild.bind(this);
    }
    addChild() {
        if (this.props.addChild) {
            this.props.addChild({
                type: "Paragraph",
                value: "Enter value here"
            });
        }
    }
    render() {
        let buttons = react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", { style: { float: "right" } },
            react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_Buttons__WEBPACK_IMPORTED_MODULE_1__["AddButton"], { action: this.addChild }),
            react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_Buttons__WEBPACK_IMPORTED_MODULE_1__["default"], Object.assign({}, this.props)),
            react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_Buttons__WEBPACK_IMPORTED_MODULE_1__["DeleteButton"], Object.assign({}, this.props)));
        let title = this.props.title;
        if (this.props.isEditing) {
            title = react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("input", { onChange: this.updateData.bind(this, "title"), type: "text", value: this.props.title });
        }
        return react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("section", null,
            react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("h2", null,
                title,
                buttons),
            this.renderChildren());
    }
}


/***/ }),

/***/ "./src/components/SideMenu.tsx":
/*!*************************************!*\
  !*** ./src/components/SideMenu.tsx ***!
  \*************************************/
/*! exports provided: SideMenu */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SideMenu", function() { return SideMenu; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/index.js");



function SideMenu(props) {
    const [open, setOpen] = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])(false);
    return (react__WEBPACK_IMPORTED_MODULE_0__["createElement"](react__WEBPACK_IMPORTED_MODULE_0__["Fragment"], null,
        react__WEBPACK_IMPORTED_MODULE_0__["createElement"](react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["Button"], { onClick: () => setOpen(!open), "aria-controls": "side-bar", "aria-expanded": open }, open ? "Collapse" : "Expand"),
        react__WEBPACK_IMPORTED_MODULE_0__["createElement"](react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["Collapse"], { in: open },
            react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", null, props.children))));
}


/***/ }),

/***/ "./src/components/Title.tsx":
/*!**********************************!*\
  !*** ./src/components/Title.tsx ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Title; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Buttons__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Buttons */ "./src/components/Buttons.tsx");
/* harmony import */ var _ResumeComponent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ResumeComponent */ "./src/components/ResumeComponent.tsx");



class Title extends _ResumeComponent__WEBPACK_IMPORTED_MODULE_2__["default"] {
    constructor(props) {
        super(props);
    }
    render() {
        if (this.props.isEditing) {
            return react__WEBPACK_IMPORTED_MODULE_0__["createElement"](react__WEBPACK_IMPORTED_MODULE_0__["Fragment"], null,
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("input", { onChange: this.updateData.bind(this, "value"), value: this.props.value, type: "text" }),
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_Buttons__WEBPACK_IMPORTED_MODULE_1__["default"], Object.assign({}, this.props)));
        }
        return react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("h1", null,
            this.props.value,
            react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", { style: { display: "inline-block" } },
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_Buttons__WEBPACK_IMPORTED_MODULE_1__["default"], Object.assign({}, this.props))));
    }
}


/***/ }),

/***/ "./src/css/index.css":
/*!***************************!*\
  !*** ./src/css/index.css ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../../node_modules/css-loader/lib/css-base.js */ "./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "body {\n  margin: 0;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Roboto\", \"Oxygen\",\n    \"Ubuntu\", \"Cantarell\", \"Fira Sans\", \"Droid Sans\", \"Helvetica Neue\",\n    sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\ncode {\n  font-family: source-code-pro, Menlo, Monaco, Consolas, \"Courier New\",\n    monospace;\n}\n", ""]);

// exports


/***/ }),

/***/ "./src/icons/add-24px.svg":
/*!********************************!*\
  !*** ./src/icons/add-24px.svg ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z\"></path><path d=\"M0 0h24v24H0z\" fill=\"none\"></path></svg>"

/***/ }),

/***/ "./src/icons/delete-24px.svg":
/*!***********************************!*\
  !*** ./src/icons/delete-24px.svg ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"none\" d=\"M0 0h24v24H0V0z\"></path><path d=\"M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z\"></path></svg>"

/***/ }),

/***/ "./src/icons/done-24px.svg":
/*!*********************************!*\
  !*** ./src/icons/done-24px.svg ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"none\" d=\"M0 0h24v24H0V0z\"></path><path d=\"M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z\"></path></svg>"

/***/ }),

/***/ "./src/icons/edit-24px.svg":
/*!*********************************!*\
  !*** ./src/icons/edit-24px.svg ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"none\" d=\"M0 0h24v24H0V0z\"></path><path d=\"M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z\"></path></svg>"

/***/ }),

/***/ "./src/index.tsx":
/*!***********************!*\
  !*** ./src/index.tsx ***!
  \***********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Resume__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Resume */ "./src/Resume.tsx");



// import * as serviceWorker from './serviceWorker';
react_dom__WEBPACK_IMPORTED_MODULE_1__["render"](react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_Resume__WEBPACK_IMPORTED_MODULE_2__["default"], null), document.getElementById('root'));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();


/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map