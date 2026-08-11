import js from "@eslint/js";
import globals from "globals";

export default [
    {
        ignores: [
            "node_modules/**",
            "uploads/**",
            "coverage/**",
            "dist/**",
            "build/**"
        ]
    },

    js.configs.recommended,

    {
        files: ["**/*.js"],

        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",

            globals: {
                ...globals.node
            }
        },

        rules: {
            /*
            |--------------------------------------------------------------------------
            | Possible Errors
            |--------------------------------------------------------------------------
            */

            "no-undef": "error",
            "no-unreachable": "error",
            "no-unexpected-multiline": "error",
            "valid-typeof": "error",

            /*
            |--------------------------------------------------------------------------
            | Best Practices
            |--------------------------------------------------------------------------
            */

            "curly": ["error", "all"],
            "eqeqeq": ["error", "always"],
            "no-eval": "error",
            "no-implied-eval": "error",
            "no-return-await": "error",
            "no-useless-return": "warn",

            /*
            |--------------------------------------------------------------------------
            | Variables
            |--------------------------------------------------------------------------
            */

            "no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    ignoreRestSiblings: true
                }
            ],

            "prefer-const": "warn",
            "no-var": "error",

            /*
            |--------------------------------------------------------------------------
            | Imports
            |--------------------------------------------------------------------------
            */

            "no-duplicate-imports": "error",

            /*
            |--------------------------------------------------------------------------
            | Style
            |--------------------------------------------------------------------------
            */

            "no-console": "off",
            "no-debugger": "warn",

            /*
            |--------------------------------------------------------------------------
            | Modern JavaScript
            |--------------------------------------------------------------------------
            */

            "object-shorthand": "warn",
            "prefer-template": "warn"
        }
    }
];