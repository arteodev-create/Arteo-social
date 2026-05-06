/**
 * Smartly merges new rules into the existing Re-Code DSL code.
 * Ensures the logic is inserted inside the plugin block and properly indented.
 */
export const smartMergeCode = (currentCode: string, newRules: string[], categoryName: string): string => {
    let code = currentCode.trim();

    // Helper to indent all lines of a multiline string
    const indent = (text: string, spaces: number = 4) => {
        const padding = ' '.repeat(spaces);
        return text.split('\n').map(line => padding + line).join('\n');
    };

    // List of valid Re-Code DSL keywords/starts
    const VALID_DSL_STARTS = [
        'if', 'plugin', 'description', 'boost', 'penalty',
        'log', 'emit', 'return', 'loop', 'parallel',
        'chain', 'stream', '//', '}', '{', 'const', 'var'
    ];

    // Helper to strip plugin "Name" { ... } wrappers if present
    const stripPluginWrapper = (text: string): string => {
        const trimmed = text.trim();
        // Regex to match plugin "..." { <content> }
        const pluginMatch = trimmed.match(/^plugin\s+".*?"\s*\{([\s\S]*)\}$/i);
        if (pluginMatch) {
            return pluginMatch[1].trim();
        }
        return trimmed;
    };

    // Filter and clean rules
    const filteredRules = newRules.map(r => stripPluginWrapper(r)).filter(rule => {
        const trimmed = rule.trim().toLowerCase();
        if (!trimmed) return false;

        const startsWithKeyword = VALID_DSL_STARTS.some(k => trimmed.startsWith(k));
        const hasEmoji = /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(rule);
        const hasCodePunctuation = /[{};=()/*]/.test(rule);

        if (hasEmoji && !hasCodePunctuation && !trimmed.startsWith('//')) {
            return false;
        }

        return startsWithKeyword;
    });

    if (filteredRules.length === 0) return currentCode;

    const formattedRules = filteredRules.map(r => indent(r)).join('\n\n');

    // 1. If code is empty or doesn't have a plugin block, create a new one
    if (!code || !code.includes('plugin')) {
        return `plugin "${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Module" {\n    description "Universal Oracle composite logic"\n\n${formattedRules}\n}`;
    }

    // 2. Try to find the LAST closing brace of the plugin block
    const lastBraceIdx = code.lastIndexOf('}');

    if (lastBraceIdx !== -1) {
        const before = code.substring(0, lastBraceIdx).trimEnd();
        const after = code.substring(lastBraceIdx);

        return `${before}\n\n    // Optimized by Aether RAM Engine: ${categoryName}\n${formattedRules}\n${after}`;
    }

    return code + `\n\n// Universal Rules\n${formattedRules}`;
};

/**
 * Surgically replaces a block's body in the Re-Code source.
 */
export const replaceBlockInCode = (code: string, blockKey: string, newBody: string): string => {
    // Escaping blockKey for regex safety
    const escapedKey = blockKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const blockRegex = new RegExp(`(block\\s+"${escapedKey}"\\s*\\{[\\s\\S]*?)(name\\s+".*?"|description\\s+".*?"|if|boost|penalty|log|[^{}]+)*?(\\})`, 'g');

    const match = blockRegex.exec(code);
    if (!match) return code;

    const fullMatch = match[0];

    // Look for the "logic start" - usually an 'if', 'boost', 'penalty', or 'log'
    // We want to keep name and description if they are at the top
    const metadataRegex = /(block\s+".*?"\s*\{[\s\S]*?)(?=\n\s+(if|boost|penalty|log|return|loop|parallel|chain|stream))/i;
    const headerMatch = fullMatch.match(metadataRegex);

    if (headerMatch) {
        const newBlock = `${headerMatch[1].trimEnd()}\n    ${newBody.trim()}\n}`;
        return code.replace(fullMatch, newBlock);
    }

    // Fallback: replace entire body content if header detection fails
    // But try to keep name/description if they exist anywhere
    const nameMatch = fullMatch.match(/name\s+"([^"]+)"/);
    const descMatch = fullMatch.match(/description\s+"([^"]+)"/);

    let reconstruction = `block "${blockKey}" {`;
    if (nameMatch) reconstruction += `\n    name "${nameMatch[1]}"`;
    if (descMatch) reconstruction += `\n    description "${descMatch[1]}"`;
    reconstruction += `\n    ${newBody.trim()}\n}`;

    return code.replace(fullMatch, reconstruction);
};

/**
 * Updates a specific field (name/description/icon) of a block in the Re-Code source.
 */
export const updateBlockFieldInCode = (code: string, blockKey: string, field: 'name' | 'description' | 'icon', newVal: string): string => {
    const blockRegex = new RegExp(`block\\s+"${blockKey}"\\s*\\{([\\s\\S]*?)\\}`, 'g');
    const match = blockRegex.exec(code);
    if (!match) return code;

    const blockContent = match[0];
    const fieldRegex = new RegExp(`(${field}\\s+")([^"]+)(")`);

    if (fieldRegex.test(blockContent)) {
        const newBlockContent = blockContent.replace(fieldRegex, `$1${newVal}$3`);
        return code.replace(blockContent, newBlockContent);
    } else {
        // If field doesn't exist, inject it after the block opening
        const injection = `\n    ${field} "${newVal}"`;
        const newBlockContent = blockContent.replace(/\{/, `{${injection}`);
        return code.replace(blockContent, newBlockContent);
    }
};

