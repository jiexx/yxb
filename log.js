var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Tag = /** @class */ (function () {
    function Tag(id, name) {
        this.tag = name;
        this.id = id;
        this.wrapper = new Wrapper(this);
    }
    return Tag;
}());
var Wrapper = /** @class */ (function () {
    function Wrapper(tag) {
        this.tag = tag;
    }
    Wrapper.prototype.wrap = function (input) {
        return this.tag.id + Wrapper.DELIMITER + input;
    };
    Wrapper.getId = function (input) {
        return input.split(Wrapper.DELIMITER)[0];
    };
    Wrapper.getBody = function (input) {
        return input.split(Wrapper.DELIMITER)[1];
    };
    Wrapper.unwrap = function (input) {
        return input.split(Wrapper.DELIMITER);
    };
    Wrapper.DELIMITER = ':  ';
    return Wrapper;
}());
var iTag = /** @class */ (function (_super) {
    __extends(iTag, _super);
    function iTag() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    iTag.prototype.encode = function (input) {
        console.log(this.wrapper.wrap('' + input));
    };
    iTag.prototype.decode = function (input) {
        return Wrapper.getBody(input);
    };
    return iTag;
}(Tag));
var jTag = /** @class */ (function (_super) {
    __extends(jTag, _super);
    function jTag() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    jTag.prototype.encode = function (input) {
        console.log(this.wrapper.wrap(JSON.stringify(input)));
    };
    jTag.prototype.decode = function (input) {
        return JSON.parse(Wrapper.getBody(input));
    };
    return jTag;
}(Tag));
var Logger = /** @class */ (function () {
    function Logger(tags) {
        for (var t in tags) {
            Logger.name_tags[tags[t].tag] = tags[t];
            Logger.id_tags[tags[t].id] = tags[t];
			Logger.name_id[tags[t].tag] = tags[t].id;
        }
    }
    Logger.prototype.log = function (tag, input) {
        Logger.name_tags[tag].encode(input);
    };
    Logger.prototype.parse = function (input) {
        var i = Wrapper.unwrap(input);
        return Logger.id_tags[i[0]].decode(i[1]);
    };
	Logger.prototype.isJson(input) {
        return Wrapper.getId(input) == Logger.name_id['json'];
    }
    Logger.prototype.i = function (input) {
        this.log('i', input);
    };
    Logger.prototype.json = function (input) {
        this.log('json', input);
    };
    Logger.name_tags = new Array();
    Logger.id_tags = new Array();
	Logger.name_id = new Array();
    return Logger;
}());

var LOG = new Logger([
	new iTag('$1024', 'i'), 
	new jTag('$1025', 'json')
]);

module.exports = LOG;