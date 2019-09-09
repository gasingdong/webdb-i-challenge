module.exports = {
	"extends": [
		"eslint:recommended",
		"airbnb-base",
		"plugin:prettier/recommended",
	],
	"parserOptions": {
		"ecmaVersion": 2018,
		"sourceType": "module",
	},
	"env": { 
		"es6": true,
	},
	"rules": {
		"no-console": "off",
	},
	"globals": {
		"console": "readonly",
		"document": "readonly",
		"window": "readonly",
		"it": "readonly",
		"localStorage": "readonly",
	},
};