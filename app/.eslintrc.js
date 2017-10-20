module.exports = {
    'env': {
        'node': true,
        'es6': true,
        'mocha': true
    },
    'extends': 'airbnb',
    'rules': {
        'import/no-extraneous-dependencies': ['error', {
            'devDependencies': ['**/*.test.js', '**/*.spec.js']
        }],
        "no-console": ["error", {
             allow: ["warn", "error", "info"] 
        }],
        "no-restricted-syntax": ["warn", "WithStatement"]        
    }
};
