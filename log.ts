abstract class Tag {
    constructor(id:string, name: string) {
        this.tag = name;
        this.id = id;
        this.wrapper = new Wrapper(this);
    }
    id: string;
    tag: string;
    wrapper: Wrapper;
    abstract encode(input: object);
    abstract decode(input: string): any;
}
class Wrapper {
    constructor(tag: Tag) {
        this.tag = tag;
    }
    tag: Tag;
    static DELIMITER: string = ':  ';
    wrap( input: string): string {
        return this.tag.id + Wrapper.DELIMITER + input;
    }
    static getId(input: string): string {
        return input.split(Wrapper.DELIMITER)[0];
    }
    static getBody(input: string): any{
        return input.split(Wrapper.DELIMITER)[1];
    }
    static unwrap(input: string): any{
        return input.split(Wrapper.DELIMITER);
    }
}

class iTag extends Tag{
    encode(input: object) {
        console.log(this.wrapper.wrap(''+input));
    }
    decode(input: string): any {
        return Wrapper.getBody(input);
    }
}
class jTag extends Tag{
    encode(input: object) {
        console.log(this.wrapper.wrap(JSON.stringify(input)));
    }
    decode(input: string): any {
        return JSON.parse(Wrapper.getBody(input));
    }
}

class Logger {
    static name_tags: Array<Tag> = new Array<Tag>();
    static id_tags: Array<Tag> = new Array<Tag>();
    static name_id: Array<Tag> = new Array<Tag>();
    constructor(tags: Tag[]) {
        for (var t in tags) {
            Logger.name_tags[tags[t].tag] = tags[t];
            Logger.id_tags[tags[t].id] = tags[t];
            Logger.name_id[tags[t].tag] = tags[t].id;
        }
    }
    log(tag: string, input: string) {
        Logger.name_tags[tag].encode(input);
    }
    parse(input: string): any {
        var i = Wrapper.unwrap(input);
        return Logger.id_tags[i[0]].decode(i[1]);
    }
    isJson(input: string): boolean {
        return Wrapper.getId(input) == Logger.name_id['json'];
    }
    i(input: string) {
        Logger.log('i', input);
    }
    json(input: string) {
        Logger.log('json', input);
    }
}
var log: Logger;
log = new Logger([new iTag('$1024', 'i'), new jTag('$1025', 'json')])
log.i('test')
