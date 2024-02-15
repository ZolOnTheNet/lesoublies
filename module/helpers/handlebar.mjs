
export function RegisterHelperHandlebar() {
    /**
     * vrai si arg1 et égal à arg2
     * usage :
     * {{#ifEq arg1 agr2}} ... {{/ifEq}}
     */
    Handlebars.registerHelper('ifEq', function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    /** parce que j'ai pas me prendre la tête
     * vrai si arg1 et égal à arg2
     * usage :
     * {{#ifeq arg1 agr2}} ... {{/ifeq}}
     */
    Handlebars.registerHelper('ifeq', function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('ifin', function(arg1, arg2, options) {
        const sep = ";"
        const vrailst = sep+arg2+sep
        return (vrailst.includes(sep+arg1+sep)) ? options.fn(this) : options.inverse(this);
    });

}