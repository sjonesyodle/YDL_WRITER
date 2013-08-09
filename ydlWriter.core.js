;(function ( $, window, undefined ){
		var 
		_CID_ = typeof window.ydlCID !== "undefined" ? $.trim( window.ydlCID ) : false,

		YW = {
			definitions : {},

			CID : {},

			util : function(){
				var self = this;

				this.util = {

				 	basename : function () {
					 	return window.location.href.replace(/^.*[\/\\]/g, '').toLowerCase();
					},

					isPage : function ( name ) {
						var 
						pageName = this.basename(),
						i, len, sep = ",",
						name = name.toLowerCase().split(sep);

						i   = 0;
						len = name.length;
						for ( ; i < len; i += 1 ) {
							name[i] = $.trim( name[i] );

							if ( pageName.length < 1 && name[i].indexOf("index") > -1 ) return true;
							if ( pageName.indexOf(name[i]) > -1 ) return true;
						}

						return false;
					},

					pageSpecific : function ( Record ) {
						return Record.hasOwnProperty("page") && Record["page"];
					},

					addDefinition : function ( o ) {
						self.definitions[$.trim(o.name)] = o;
					},

					matchCIDwithDef : function (CID, _CID_) {
						return CID.hasOwnProperty(_CID_) ? CID[_CID_] : false;
					},

					buildRecord : function (Record) {
						var 
						util = self.util,
						prop, tmp;

						if (!(Record = util.mergeRecordWithDef(Record))) return false;
						if (!(Record = util.applyDefBuilds(Record))) return false;

						return Record;
					},

					mergeRecordWithDef : function (Record) {
						var 
						prop, prop2
						Defs = self.definitions;

						for (prop in Record) {
							if (Record.hasOwnProperty(prop) && Defs.hasOwnProperty(prop)) {
								tmp = Record[prop];
								Record[prop] = Defs[prop];
								Record[prop].content = tmp;
							}
						}

						return Record;
					},

					applyDefBuilds : function (Record) {
						self.definitionSettings.build( Record );
						self.types.build( Record );
						return Record;
					},	

					OverwriteExists : function (Record) {
						var i = 0, l = Record.length, promo;
					
						for (; i < l; i += 1) {
							if (!self.definitions.hasOwnProperty($.trim(Record[i]))) return false;
						}

						return true;
					},

					implement : function ( Record ) {
						self.types.apply( Record );
						return this;
					},

					isString : function (str) {
						str = $.trim(str);
						return typeof str === "string" && str.length > 0;
					},

					isjNode : function (jNode) {
						return jNode && jNode.length > 0;
					},

					generateView : ( function () {
			            var
			            getStrPos = function ( str, substr ) {
			                var pos = str.indexOf(substr), positions = [];
			                
			                while(pos > -1) {
			                    positions.push(pos);
			                    pos = str.indexOf(substr, pos+1);
			                }
			            
			                return positions;
			            },

			            chars = function(str) {
			              if (str == null) return [];
			              return str.split('');
			            },
			            
			            strSplice = function (start, length, word, str) {
			              var arr = chars(str);
			              arr.splice(start, length, word);
			              return arr.join('');  
			            },
			            
			            getVars = function ( template ) {
			                var 
			                varLocs = {},
			                openVar  = "{{",
			                closeVar = "}}";
			            
			                varLocs.startIdxs = getStrPos( template, openVar );
			                varLocs.closeIdxs = getStrPos( template, closeVar );
			                
			                return varLocs;    
			            },
			            
			            getObjVal = function (objStr, data) {
			                var 
			                objStr = objStr.split("."),
			                nextLevel,
			                i = 0, l = objStr.length,
			                value = data;

			                if (!value || $.isEmptyObject(value)) return;

			                while ( i < l ) {
			                    nextLevel = objStr[i];
			                    value = value[ nextLevel ] ? value[ nextLevel ] : false;
			                    if ( !value ) return;
			                    i += 1;
			                }
			                
			                return $.trim( value );
			            },
			            
			            extractVarVals = function (valArr, data) {
			                var
			                i = 0,
			                l = valArr.length;
			                
			                for ( ; i < l; i += 1) {
			                    if ( !(valArr[i].value = getObjVal(valArr[i].objStr , data)) ) {
			                    	valArr.splice(i,1);
			                    	i--;
			                    	l--;
			                    }
			                }

			                return valArr;
			            },
			            
			            injectVarVals = function ( varList, template ) {
			                var 
			                i = 0,
			                l = varList.length,
			                start, stop, range, valLen, value, adjust = 0;
			                
			                for ( ; i < l ; i += 1 ) {
			                    
			                    value  = $.trim( varList[i].value );
			                    valLen = varList[i].value.length;  
			                    
			                    start = varList[i].range[0];
			                    stop  = varList[i].range[1];    
			                    range = stop - start;
			                    
			                   
			                    if (i > 0) {
			                        start = varList[i].range[0] + adjust;
			                        stop  = varList[i].range[1] + adjust;    
			                        range = stop - start;
			                    }
			                        
			                    template = strSplice( start, range, value , template  );
			                    
			                    adjust += valLen - range;
			                }
			                
			                return template;
			            },
			            
			            getVarValues = function ( template ) {
			                var 
			                varLocs   = getVars( template ),
			                startLocs = varLocs.startIdxs,
			                endLocs   = varLocs.closeIdxs,
			                
			                len_sl = startLocs.length,
			                len_el = endLocs.length,
			                i, pos1, pos2, range,
			                
			                varList = [], varItem;
			            
			                
			                if (len_sl !== len_el) return false; // un-even var braces!
			                
			                i = 0;
			                for ( ; i < len_sl; i += 1 ) {
			                    pos1  = startLocs[i];
			                    pos2  = endLocs[i];
			                    
			                    varList.push({
			                        range  : [pos1, pos2 + 2],
			                        objStr : $.trim( template.slice(pos1 + 2, pos2) ) 
			                    });
			                    
			                }
			                
			                return varList;
			            };
			            
			            return function ( template, data ) {
			                var varList;

			                if ( typeof template !== "string" || typeof data !== "object" ) return;

			                varList = getVarValues( template );

							extractVarVals( varList, data );

			                return injectVarVals( varList, template );
			            };
			            
			        }()),

					generateViews : function ( template, data ) {
						var i, l, res = "";
						if ( typeof template !== "string" || typeof data !== "object" ) return;

						data = [].concat(data);

						i = 0;
						l = data.length;
						for ( ; i < l; i += 1 ) {
							res += this.generateView( template, data[i] );
						}

						return res;
					},

					complileTMPL : function ( arr ) {
						return arr.join("");
					}

				};

				return this;
			},

			definitionSettings : function () {
				var self = this;

				this.definitionSettings = {
					name : {
						build : function (str) {
							return self.util.isString(str) ? $.trim(str) : false;
						}
					},

					htmlNode : {
						build : function (jNode) {
							jNode = $(jNode);
							return self.util.isjNode(jNode) ? jNode : false;
						}	
					}

				};

				this.definitionSettings.check = function ( o ) {
					var prop;

					for (prop in this) {
						if (typeof this[prop] === "function") continue;
						if ( !o.hasOwnProperty(prop) ) return false;
					}
					return true;
				};

				this.definitionSettings.build = function ( Record ) {
					var defProp, recProp, currRec;

					for ( recProp in Record ) {
						for ( defProp in this ) {
							if ( !Record[recProp].hasOwnProperty( defProp ) ) continue;
							Record[recProp][defProp] = this[defProp].build( Record[recProp][defProp] );

							if ( !Record[recProp][defProp] ) {
								delete Record[recProp];
								break;
							} 
						}
					}

				};

				return this;
			},

			types : function(){
				var self = this;

				this.types = {

					html : {
						apply : function () {
							var fn;

							if ( typeof this.content[0] === "function" ) {
								fn = this.content.shift();
								this.content = fn.apply(null, this.content);
							}

							this.htmlNode.html( this.content );
						}
					},

					attr : {
						apply : function () {
							this.htmlNode.attr( this.prop, this.content );
						}
					},

					css : {
						apply : function () {
							this.htmlNode.css( this.prop, this.content );
						}
					},

					script : {
						apply : function () {
							var
							elem, src, content;

							if(typeof this.content === "string"){
								content = $.trim( this.content );
								elem = document.createElement("script");
								elem.src = content;
								elem.type = "text/javascript";
								elem.language = "JavaScript";
								$( this.htmlNode ).append( elem );
							} 
							else if(typeof this.content === "function"){
								this.content();
							}
						}
					},

					template : {
						apply : function () {
							var
							data = this.content,
							tmpl = this.prop,
							Util = self.util,
							View = Util.generateViews;

							if ( typeof data !== "object" || !( tmpl && tmpl.length && tmpl.length > 0 ) ) return;

							tmpl = tmpl.join("");
							data = [].concat(data);

							this.htmlNode.html( View.apply( Util, [ tmpl, data ]) );
						}
					}
				};

				this.types.check = function ( o ) {
					return o.type && this.hasOwnProperty($.trim(o.type).toLowerCase());
				};

				this.types.build = function ( Record ) {
					var prop;
					for ( prop in Record ) {
						Record[prop].type = $.trim( Record[prop].type ).toLowerCase();
					}
				};

				this.types.apply = function ( Record ) {
					var prop, U = self.util;

					for ( prop in Record ) {
						if ( this.hasOwnProperty(Record[prop].type) ) {

							if ( U.pageSpecific( Record[prop] ) ) {

								if ( U.isPage( Record[prop].page ) ) {
									this[Record[prop].type].apply.call( Record[prop] );
								}

							}
							else {
								this[Record[prop].type].apply.call( Record[prop] );
							}
						}
					}
				};

				return this;
			},

			define : function ( o ){
				var U = this.util;

				// check if user supplied correct settings
				if ( !this.definitionSettings.check( o ) ) return false;

				// check if user supplied existing types
				if ( !this.types.check( o ) ) return false;

				U.addDefinition( o );
			},

			init : function ( CID ){
				var 
				U  = this.util,
				Record,
				Success = true;

				if (!_CID_ || typeof _CID_ !== "string" || !CID || typeof CID !== "object") Success = false;
				if (!( Record = U.matchCIDwithDef( CID, _CID_ ))) Success = false;

				if ( Success ) {
					if (Record = U.buildRecord( Record )) U.implement( Record );
					else Success = false;
				}

				return Success;
			}
		};

		//.......
		window.ydlWriter = YW.util().definitionSettings().types();
	}( jQuery, window ));