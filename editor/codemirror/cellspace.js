// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// LUA mode. Ported to CodeMirror 2 from Franciszek Wawrzak's
// CodeMirror 1 mode.
// highlights keywords, strings, comments (no leveling supported! ("[==[")), tokens, basic indenting

(function(mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
		mod(require("../../lib/codemirror"));
	else if (typeof define == "function" && define.amd) // AMD
		define(["../../lib/codemirror"], mod);
	else // Plain browser env
		mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("cellspace", function(config, parserConfig) {
	var indentUnit = config.indentUnit;

	function prefixRE(words) {
		return new RegExp("^(?:" + words.join("|") + ")", "i");
	}
	function wordRE(words) {
		return new RegExp("^(?:" + words.join("|") + ")$", "i");
	}
	var gamekw = wordRE([
		"gametitle:","gamedesc:","gamebackground:","empty:","cell:",
		"group:","cellanim:","cellstate:","display:","tilemap:",
		"config:","globals:",
	]);

	var rulekw = wordRE([
		"rule:", "andmask:", "conddir:", "outdir:", "animdir:",
		"priority:", "probability:", "delay:", "transform:",
		"condfunc:", "outfunc:", "condstate:", "outstate:",
		"anim:", "mouse:",
	]);
	var levelkw = wordRE([
		"level:","background:","init:","tick:","win:","lose:",
		"title:","desc:",
	]);
	function string(quote) {
		return function(stream, state) {
			var escaped = false, ch;
			while ((ch = stream.next()) != null) {
				if (ch == quote && !escaped) break;
				escaped = !escaped && ch == "\\";
			}
			if (!escaped) state.cur = normal;
			return "string";
		};
	}

	function normaltoken(stream, state) {
		var ch = stream.next();
		//if (ch == "-" && stream.eat("-")) {
		//	if (stream.eat("[") && stream.eat("["))
		//		return (state.cur = bracketed(readBracket(stream), "comment"))(stream, state);
		//	stream.skipToEnd();
		//	return "comment";
		//}
		//if (ch == "\"" || ch == "'")
		//	return (state.cur = string(ch))(stream, state);
		//if (ch == "[" && /[\[=]/.test(stream.peek()))
		//	return (state.cur = bracketed(readBracket(stream), "string"))(stream, state);
		if (state.incomment) {
			stream.backUp(1);
			while (true) {
				if (stream.eat(/[*]/) && stream.eat(/\//)) {
					state.incomment = false;
					break;
				}
				ch = stream.next();
				if (!ch) break;
			}
			return "comment";
		} else if (/\d/.test(ch)) {
			stream.eatWhile(/[\w.%]/);
			return "number";
		} else if (/[\w_]/.test(ch)) {
			stream.eatWhile(/[\w\\\-_.]/);
			stream.eatSpace();
			if (stream.eat(":")) {
				return "keyword";
			} else {
				return "variable";
			}
		} else if (ch=="/") {
			if (stream.eat(/[*]/)) {
				state.incomment=true;
				while (true) {
					if (stream.eat(/[*]/) && stream.eat(/\//)) {
						state.incomment = false;
						break;
					}
					ch = stream.next();
					if (!ch) break;
				}
				return "comment";
			}
		}
		return null;
	}


	return {
		startState: function(basecol) {
			return {basecol: basecol || 0, incomment:false};
		},

		token: function(stream, state) {
			if (stream.eatSpace()) return null;
			var style = normaltoken(stream,state);
			var word = stream.current();
			//var word = stream.next();
			if (gamekw.test(word)) {
				style = "keyword";
			} else if (rulekw.test(word)) {
				style = "builtin";
			} else if (levelkw.test(word)) {
				style = "string";
			} else {
				if (style!="comment") style = null;
			}
			return style;
		},

		/*indent: function(state, textAfter) {
			var closing = dedentPartial.test(textAfter);
			return state.basecol + indentUnit * (state.indentDepth - (closing ? 1 : 0));
		},*/

		//lineComment: "--",
		blockCommentStart: "/*",
		blockCommentEnd: "*/"
	};
});

CodeMirror.defineMIME("text/x-lua", "lua");

});
