/**
 * Re-Code Plugin Parser V4
 * parses Re-Code plugin syntax into executable logic
 * Supports: Nested Blocks, Control Flow, Advanced Commands, Math Operations, String Interpolation, Logical Expressions
 */

class ExprEvaluator {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }
    peek() { return this.tokens[this.pos]; }
    consume() { return this.tokens[this.pos++]; }

    parse() {
        if (!this.tokens || this.tokens.length === 0) return undefined;
        return this.parseOr();
    }

    parseOr() {
        let left = this.parseAnd();
        while (this.peek() && this.peek().value === '||') {
            this.consume();
            let right = this.parseAnd();
            left = left || right;
        }
        return left;
    }

    parseAnd() {
        let left = this.parseEquality();
        while (this.peek() && this.peek().value === '&&') {
            this.consume();
            let right = this.parseEquality();
            left = left && right;
        }
        return left;
    }

    parseEquality() {
        let left = this.parseRelational();
        while (this.peek() && (this.peek().value === '==' || this.peek().value === '!=')) {
            let op = this.consume().value;
            let right = this.parseRelational();
            if (op === '==') left = left == right;
            if (op === '!=') left = left != right;
        }
        return left;
    }

    parseRelational() {
        let left = this.parseAddSub();
        while (this.peek() && ['<', '>', '<=', '>='].includes(this.peek().value)) {
            let op = this.consume().value;
            let right = this.parseAddSub();
            if (op === '<') left = left < right;
            if (op === '>') left = left > right;
            if (op === '<=') left = left <= right;
            if (op === '>=') left = left >= right;
        }
        return left;
    }

    parseAddSub() {
        let left = this.parseMulDiv();
        while (this.peek() && ['+', '-'].includes(this.peek().value)) {
            let op = this.consume().value;
            let right = this.parseMulDiv();
            if (op === '+') left = left + right;
            if (op === '-') left = left - right;
        }
        return left;
    }

    parseMulDiv() {
        let left = this.parseUnary();
        while (this.peek() && ['*', '/'].includes(this.peek().value)) {
            let op = this.consume().value;
            let right = this.parseUnary();
            if (op === '*') left = left * right;
            if (op === '/') left = left / right;
        }
        return left;
    }

    parseUnary() {
        if (this.peek() && this.peek().value === '!') {
            this.consume();
            return !this.parseUnary();
        }
        if (this.peek() && this.peek().value === '-') {
            this.consume();
            return -this.parseUnary();
        }
        return this.parsePrimary();
    }

    parsePrimary() {
        let t = this.consume();
        if (!t) return undefined;
        if (t.type === 'VALUE') return t.value;
        if (t.value === '(') {
            let expr = this.parseOr();
            if (this.peek() && this.peek().value === ')') this.consume();
            return expr;
        }
        return t.value;
    }
}

class ReCodePluginParser {
    execute(code, post, userContext = {}, blockKey = null) {
        const result = {
            score: 0,
            logs: [],
            events: [],
            filtered: false,
            data: {}
        };
        try {
            const tokens = this.tokenize(code);
            const ast = this.parse(tokens);
            return this.interpret(ast, post, userContext, result, blockKey);
        } catch (error) {
            console.error('Re-Code execution error:', error.message);
            result.logs.push(`Error: ${error.message}`);
            return result;
        }
    }

    tokenize(code) {
        code = code.replace(/\/\*[\s\S]*?\*\//g, '');
        code = code.replace(/\/\/.*$/gm, '');

        const tokens = [];
        let cursor = 0;
        const keywords = [
            'plugin', 'block', 'name', 'description', 'icon', 'set', 'if', 'else', 'loop', 'parallel', 'chain',
            'stream', 'boost', 'penalty', 'filter_out', 'log', 'emit', 'return', 'use'
        ];

        while (cursor < code.length) {
            const char = code[cursor];
            if (/\s/.test(char)) { cursor++; continue; }

            if (char === '"' || char === "'") {
                let value = '';
                const quote = char;
                cursor++;
                while (cursor < code.length && code[cursor] !== quote) {
                    if (code[cursor] === '\\' && code[cursor + 1] === quote) {
                        value += quote;
                        cursor += 2;
                    } else {
                        value += code[cursor];
                        cursor++;
                    }
                }
                cursor++;
                tokens.push({ type: 'STRING', value });
                continue;
            }

            if (/[0-9]/.test(char)) {
                let value = char;
                cursor++;
                while (cursor < code.length && /[0-9.]/.test(code[cursor])) {
                    value += code[cursor];
                    cursor++;
                }
                tokens.push({ type: 'NUMBER', value: parseFloat(value) });
                continue;
            }

            if (/[{}(),;.]/.test(char)) {
                tokens.push({ type: 'PUNCTUATION', value: char });
                cursor++;
                continue;
            }

            if (/[><=!&|+\-*/]/.test(char)) {
                let value = char;
                cursor++;
                while (cursor < code.length && /[><=!&|]/.test(code[cursor])) {
                    if (['+', '-', '*', '/'].includes(value)) break;
                    if (/[><=!&|]/.test(code[cursor])) {
                        value += code[cursor];
                        cursor++;
                    } else break;
                }
                tokens.push({ type: 'OPERATOR', value });
                continue;
            }

            if (/[a-zA-Z_$]/.test(char)) {
                let value = '';
                while (cursor < code.length && /[a-zA-Z0-9_$]/.test(code[cursor])) {
                    value += code[cursor];
                    cursor++;
                }
                if (keywords.includes(value)) {
                    tokens.push({ type: 'KEYWORD', value });
                } else {
                    tokens.push({ type: 'IDENTIFIER', value });
                }
                continue;
            }

            cursor++;
        }
        return tokens;
    }

    parse(tokens) {
        let current = 0;

        const walk = () => {
            let token = tokens[current];
            if (!token) return null;

            if (token.type === 'KEYWORD' && token.value === 'plugin') {
                current++;
                const name = tokens[current].value;
                current++;
                if (tokens[current].value !== '{') throw new Error("Expected '{' after plugin name");
                current++;
                const body = [];
                while (tokens[current] && tokens[current].value !== '}') {
                    body.push(walk());
                }
                current++;
                return { type: 'Plugin', name, body };
            }

            if (token.type === 'KEYWORD' && ['description', 'name', 'icon'].includes(token.value)) {
                const keyword = token.value;
                current++;
                const val = tokens[current].value;
                current++;
                return { type: keyword === 'name' ? 'Name' : keyword === 'icon' ? 'Icon' : 'Description', value: val };
            }

            if (token.type === 'KEYWORD' && token.value === 'set') {
                current++;
                if (!tokens[current] || tokens[current].type !== 'IDENTIFIER') throw new Error("Expected variable name");
                const varName = tokens[current].value;
                current++;
                if (!tokens[current] || tokens[current].value !== '=') throw new Error("Expected '='");
                current++;
                const valueTokens = [];
                while (tokens[current] && tokens[current].type !== 'KEYWORD' && tokens[current].value !== '}') {
                    if (tokens[current].type === 'PUNCTUATION' && tokens[current].value === ';') break;
                    valueTokens.push(tokens[current]);
                    current++;
                }
                return { type: 'SetStatement', varName, valueTokens };
            }

            if (token.type === 'KEYWORD' && token.value === 'block') {
                current++;
                const key = tokens[current].value;
                current++;
                if (tokens[current].value !== '{') throw new Error(`Expected '{'`);
                current++;
                const body = [];
                while (tokens[current] && tokens[current].value !== '}') {
                    body.push(walk());
                }
                current++;
                return { type: 'Block', key, body };
            }

            if (token.type === 'KEYWORD' && token.value === 'if') {
                current++;
                const condition = [];
                while (tokens[current] && tokens[current].value !== '{') {
                    condition.push(tokens[current]);
                    current++;
                }
                if (tokens[current].value !== '{') throw new Error("Expected '{'");
                current++;
                const consequent = [];
                while (tokens[current] && tokens[current].value !== '}') {
                    consequent.push(walk());
                }
                current++;

                let alternate = null;
                if (tokens[current] && tokens[current].type === 'KEYWORD' && tokens[current].value === 'else') {
                    current++;
                    if (tokens[current].value !== '{') throw new Error("Expected '{'");
                    current++;
                    alternate = [];
                    while (tokens[current] && tokens[current].value !== '}') {
                        alternate.push(walk());
                    }
                    current++;
                }
                return { type: 'IfStatement', condition, consequent, alternate };
            }

            if (token.type === 'KEYWORD' && token.value === 'loop') {
                current++;
                const count = tokens[current].value;
                current++;
                if (tokens[current].value !== '{') throw new Error("Expected '{'");
                current++;
                const body = [];
                while (tokens[current] && tokens[current].value !== '}') {
                    body.push(walk());
                }
                current++;
                return { type: 'LoopStatement', count, body };
            }

            if (token.type === 'KEYWORD') {
                const action = token.value;
                current++;

                if (['parallel', 'chain', 'stream'].includes(action)) {
                    if (tokens[current].value !== '{') throw new Error(`Expected '{'`);
                    current++;
                    const body = [];
                    while (tokens[current] && tokens[current].value !== '}') body.push(walk());
                    current++;
                    return { type: 'BlockCommand', command: action, body };
                }

                if (action === 'use') {
                    const blockName = tokens[current].value;
                    current++;
                    const params = {};
                    if (tokens[current] && tokens[current].value === '(') {
                        current++;
                        while (tokens[current] && tokens[current].value !== ')') {
                            const paramName = tokens[current].value;
                            current++;
                            if (tokens[current].value === ':') current++;
                            params[paramName] = tokens[current].value;
                            current++;
                            if (tokens[current].value === ',') current++;
                        }
                        current++;
                    }
                    if (tokens[current] && tokens[current].value === ';') current++;
                    return { type: 'UseStatement', blockName, params };
                }

                let args = [];
                while (tokens[current] && tokens[current].type !== 'KEYWORD' && tokens[current].value !== '}') {
                    if (tokens[current].type === 'PUNCTUATION' && tokens[current].value === ';') { current++; break; }
                    args.push(tokens[current].value);
                    current++;
                }
                return { type: 'Command', command: action, args };
            }

            throw new Error(`Unknown token: ${token.value}`);
        };

        const ast = [];
        while (current < tokens.length) {
            const node = walk();
            if (node) ast.push(node);
        }
        return ast;
    }

    constructor() {
        this.registry = {};
        this.setupDefaultBlocks();
    }

    registerBlock(name, logicFn) {
        this.registry[name] = logicFn;
    }

    setupDefaultBlocks() {
        this.registerBlock('SentimentPenalty', (params, post, result) => {
            const threshold = parseFloat(params.threshold) || -0.5;
            const negativeWords = ['bad', 'hate', 'awful', 'terrible', 'scam'];
            const content = (post.content || "").toLowerCase();
            const score = negativeWords.reduce((acc, word) => content.includes(word) ? acc - 0.2 : acc, 0);
            if (score <= threshold) {
                result.score += score;
                result.logs.push(`[AdvancedBlock] SentimentPenalty applied: ${score}`);
            }
        });

        this.registerBlock('ScoringTemplate', (params, post, result) => {
            const multiplier = parseFloat(params.multiplier) || 1.0;
            if (post.likes > 100) {
                result.score += 10 * multiplier;
                result.logs.push(`[AdvancedBlock] ScoringTemplate applied boost.`);
            }
        });
    }

    interpret(node, post, userContext, result, blockKey = null) {
        if (!node) return result;

        if (Array.isArray(node)) {
            for (const child of node) {
                if (result.returned || result.filtered) return result;
                if (blockKey && child.type === 'Block' && child.key !== blockKey) continue;
                this.interpret(child, post, userContext, result, blockKey);
            }
            return result;
        }

        switch (node.type) {
            case 'Plugin':
            case 'Block':
                this.interpret(node.body, post, userContext, result, null);
                break;
            case 'UseStatement':
                const blockLogic = this.registry[node.blockName];
                if (blockLogic) {
                    result.logs.push(`[System] Executing Advanced Block: ${node.blockName}`);
                    blockLogic(node.params, post, result, userContext);
                } else {
                    result.logs.push(`[Error] Advanced Block not found: ${node.blockName}`);
                }
                break;
            case 'IfStatement':
                const conditionMet = this.evaluateExpression(node.condition, post, userContext, result);
                if (conditionMet) this.interpret(node.consequent, post, userContext, result);
                else if (node.alternate) this.interpret(node.alternate, post, userContext, result);
                break;
            case 'SetStatement':
                const setValue = this.evaluateExpression(node.valueTokens, post, userContext, result, false);
                result.data[node.varName] = setValue;
                result.logs.push(`[System] Set variable ${node.varName} = ${setValue}`);
                break;
            case 'LoopStatement':
                const count = typeof node.count === 'string' ? parseInt(node.count) : node.count;
                for (let i = 0; i < count; i++) {
                    if (result.returned || result.filtered) break;
                    this.interpret(node.body, post, userContext, result);
                }
                break;
            case 'BlockCommand':
                result.logs.push(`[System] Executing ${node.command.toUpperCase()} Block...`);
                this.interpret(node.body, post, userContext, result);
                break;
            case 'Command':
                this.executeCommand(node.command, node.args, result, post, userContext);
                break;
        }
        return result;
    }

    resolveValuesToTokens(tokens, post, userContext, result) {
        let i = 0;
        let newTokens = [];
        while (i < tokens.length) {
            let t = tokens[i];
            if (t.type === 'IDENTIFIER') {
                let rootName = t.value;
                let currentVal = undefined;

                if (result.data && result.data[rootName] !== undefined) {
                    currentVal = result.data[rootName];
                } else if (rootName === 'post') {
                    currentVal = post;
                } else if (rootName === 'user') {
                    currentVal = userContext;
                } else {
                    if (rootName === 'true') currentVal = true;
                    else if (rootName === 'false') currentVal = false;
                    else if (rootName === 'null') currentVal = null;
                    else currentVal = rootName;
                }

                i++;
                while (i < tokens.length && tokens[i].value === '.') {
                    i++;
                    if (i < tokens.length && tokens[i].type === 'IDENTIFIER') {
                        let prop = tokens[i].value;
                        i++;
                        if (i < tokens.length && tokens[i].value === '(') {
                            i++;
                            let args = [];
                            while (i < tokens.length && tokens[i].value !== ')') {
                                let argToken = tokens[i];
                                if (argToken.value === ',') { i++; continue; }
                                if (argToken.type === 'STRING' || argToken.type === 'NUMBER') {
                                    args.push(argToken.value);
                                } else if (argToken.type === 'IDENTIFIER') {
                                    if (result.data && result.data[argToken.value] !== undefined) {
                                        args.push(result.data[argToken.value]);
                                    } else {
                                        args.push(argToken.value);
                                    }
                                }
                                i++;
                            }
                            i++;
                            if (currentVal !== undefined && currentVal !== null) {
                                if (prop === 'contains') {
                                    const strVal = String(currentVal).toLowerCase();
                                    currentVal = args.some(arg => strVal.includes(String(arg).toLowerCase()));
                                } else if (prop === 'match') {
                                    currentVal = new RegExp(args[0], 'i').test(String(currentVal));
                                } else if (typeof currentVal[prop] === 'function') {
                                    currentVal = currentVal[prop](...args);
                                } else {
                                    currentVal = undefined;
                                }
                            }
                        } else {
                            if (currentVal !== undefined && currentVal !== null) {
                                currentVal = currentVal[prop];
                            } else {
                                currentVal = undefined;
                            }
                        }
                    } else break;
                }
                newTokens.push({ type: 'VALUE', value: currentVal });
                continue;
            } else if (t.type === 'STRING' || t.type === 'NUMBER') {
                newTokens.push({ type: 'VALUE', value: t.value });
            } else if (t.type === 'OPERATOR' || t.type === 'PUNCTUATION') {
                newTokens.push(t);
            }
            i++;
        }
        return newTokens;
    }

    evaluateExpression(tokens, post, userContext, result = { data: {} }, forceBoolean = true) {
        if (!tokens || tokens.length === 0) return forceBoolean ? false : null;
        try {
            const resolvedTokens = this.resolveValuesToTokens(tokens, post, userContext, result);
            const evaluator = new ExprEvaluator(resolvedTokens);
            let val = evaluator.parse();
            return forceBoolean ? !!val : val;
        } catch (e) {
            console.error("Expression evaluation error:", e.message, "Tokens:", tokens);
            return forceBoolean ? false : null;
        }
    }

    interpolateString(str, post, userContext, result) {
        if (typeof str !== 'string') return str;
        return str.replace(/\$\{([^}]+)\}/g, (match, expr) => {
            try {
                const tokens = this.tokenize(expr);
                const resolved = this.resolveValuesToTokens(tokens, post, userContext, result);
                const evalResult = new ExprEvaluator(resolved).parse();
                return evalResult !== undefined ? evalResult : match;
            } catch (e) {
                return match;
            }
        });
    }

    executeCommand(command, args, result, post, userContext) {
        if (result.returned || result.filtered) return;

        const finalArgs = args.map(arg => {
            let resolvedArg = arg;
            if (typeof arg === 'string' && result.data && result.data[arg] !== undefined && !arg.includes("${")) {
                resolvedArg = result.data[arg];
            }
            return this.interpolateString(resolvedArg, post, userContext, result);
        });

        let val = finalArgs[0];

        switch (command) {
            case 'boost':
                result.score += parseFloat(val) || 0;
                result.logs.push(`Boosted score by ${val}`);
                break;
            case 'penalty':
                result.score -= parseFloat(val) || 0;
                result.logs.push(`Applied penalty of ${val}`);
                break;
            case 'filter_out':
                result.filtered = true;
                result.logs.push(`Post filtered out.`);
                break;
            case 'log':
                result.logs.push(`[Log] ${finalArgs.join(' ')}`);
                break;
            case 'emit':
                result.events.push(finalArgs.join(' '));
                result.logs.push(`[Event] Emitted: ${finalArgs.join(' ')}`);
                break;
            case 'return':
                result.score = parseFloat(val) || result.score;
                result.returned = true;
                result.logs.push(`Returned with score: ${result.score}`);
                break;
        }
    }
}

module.exports = { ReCodePluginParser };
