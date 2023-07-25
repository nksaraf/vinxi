/**
 * @license React
 * react-server-dom-vite-plugin.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

'use strict';var v=require("acorn-loose"),y=require("fs");
module.exports=function(){var l=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},n=l.hash;let w=void 0===n?p=>p:n;n=l.onClientReference;let z=void 0===n?()=>{}:n;l=l.onServerReference;let A=void 0===l?()=>{}:l,t;return{name:"react-server",enforce:"pre",configResolved(p){t="build"===p.command},transform(p,B,C){async function D(b,a){const d=[];z(a);await x(b,d,a);b="import { createClientReference } from 'react-server-dom-vite/runtime';\n";for(let c=0;c<d.length;c++){const f=d[c];b="default"===
f?b+"export default createClientReference(":b+("export const "+f+" = createClientReference(");b+='"'+(t?w(a):a)+'", "'+f+'");\n'}return b}function E(b,a,d){A(d);const c=new Map,f=new Map;for(let q=0;q<a.length;q++){var e=a[q];switch(e.type){case "ExportDefaultDeclaration":"Identifier"===e.declaration.type?c.set(e.declaration.name,"default"):"FunctionDeclaration"===e.declaration.type&&e.declaration.id&&(c.set(e.declaration.id.name,"default"),f.set(e.declaration.id.name,"function"));continue;case "ExportNamedDeclaration":if(e.declaration)if("VariableDeclaration"===
e.declaration.type){var g=e.declaration.declarations;for(var m=0;m<g.length;m++)k(c,g[m].id)}else g=e.declaration.id.name,c.set(g,g),"FunctionDeclaration"===e.declaration.type&&f.set(g,"function");if(e.specifiers)for(e=e.specifiers,g=0;g<e.length;g++)m=e[g],c.set(m.local.name,m.exported.name)}}let r="import { createServerReference } from 'react-server-dom-vite/runtime';\n"+b+"\n\n;";c.forEach(function(q,u){"function"!==f.get(u)&&(r+="if (typeof "+u+' === "function") ');r+="createServerReference("+
u+",";r+='"'+(t?w(d):d)+'", "'+q+'");\n'});return r}async function x(b,a,d){for(let e=0;e<b.length;e++){var c=b[e];switch(c.type){case "ExportAllDeclaration":if(c.exported)h(a,c.exported);else{c=(await F(c.source.value,d)).url;var f=y.readFileSync(c,"utf8");f=v.parse(f??"",{ecmaVersion:"2024",sourceType:"module"}).body;await x(f,a,c)}continue;case "ExportDefaultDeclaration":a.push("default");continue;case "ExportNamedDeclaration":if(c.declaration)if("VariableDeclaration"===c.declaration.type){f=c.declaration.declarations;
for(let g=0;g<f.length;g++)h(a,f[g].id)}else h(a,c.declaration.id);if(c.specifiers)for(c=c.specifiers,f=0;f<c.length;f++)h(a,c[f].exported)}}}function k(b,a){switch(a.type){case "Identifier":b.set(a.name,a.name);break;case "ObjectPattern":for(var d=0;d<a.properties.length;d++)k(b,a.properties[d]);break;case "ArrayPattern":for(d=0;d<a.elements.length;d++){const c=a.elements[d];c&&k(b,c)}break;case "Property":k(b,a.value);break;case "AssignmentPattern":k(b,a.left);break;case "RestElement":k(b,a.argument);
break;case "ParenthesizedExpression":k(b,a.expression)}}function h(b,a){switch(a.type){case "Identifier":b.push(a.name);break;case "ObjectPattern":for(var d=0;d<a.properties.length;d++)h(b,a.properties[d]);break;case "ArrayPattern":for(d=0;d<a.elements.length;d++){const c=a.elements[d];c&&h(b,c)}break;case "Property":h(b,a.value);break;case "AssignmentPattern":h(b,a.left);break;case "RestElement":h(b,a.argument);break;case "ParenthesizedExpression":h(b,a.expression)}}async function F(b,a){const d=
await G.resolve(b,a,{skipSelf:!0});if(!d)throw Error("Could not resolve "+b+" from "+a);return{url:d.id}}if(C?.ssr){var G=this;return async function(b,a){if(-1===b.indexOf("use client")&&-1===b.indexOf("use server"))return b;const d=v.parse(b,{ecmaVersion:"2024",sourceType:"module"}).body;let c=!1,f=!1;for(let e=0;e<d.length;e++){const g=d[e];if("ExpressionStatement"!==g.type||!g.directive)break;"use client"===g.directive&&(c=!0);"use server"===g.directive&&(f=!0)}if(!c&&!f)return b;if(c&&f)throw Error('Cannot have both "use client" and "use server" directives in the same file.');
return c?D(d,a):E(b,d,a)}(p,B)}}}};
