/*
Copyright (c) 2010,2011,2012 Morgan Roderick http://roderick.dk
License: MIT - http://mrgnrdrck.mit-license.org

https://github.com/mroderick/PubSubJS
*/
/*jslint white:true, plusplus:true */
/*global
	setTimeout,
	module,
	exports,
	define
*/
(function(root){
	"use strict";
	
	var PubSub = {
			name: 'PubSubJS',
			version: '1.2.0'
		},
		messages = {},
		lastUid = -1;
	
	// Export the PubSub object for **Node.js** and **"CommonJS"**, with
	// backwards-compatibility for the old `require()` API. If we're not in
	// CommonJS, add `PubSub` to the global object via a string identifier for
	// the Closure Compiler "advanced" mode. Registration as an AMD module
	// via define() happens at the end of this file.
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			module.exports = PubSub;
		}
		exports.PubSub = PubSub;
	} else {
		root.PubSub = PubSub;
	}

	/**
	 *	Iterates the supplied namespace from most specific to least specific, applying the supplied function to each level
	 *	@param { String } name
	 *	@param { Function } func
	 *	@private
	 */
	function namespaceIterator( name, func ){
		var found = false,
			position = name.lastIndexOf( '.' );

		while( position !== -1 ){
			name = name.substr( 0, position );
			if (!func(name)){
				break;
			}
			position = name.lastIndexOf('.');
		}
	}

	function deliverMessage( originalMessage, matchedMessage, data ){
		var subscribers = messages[matchedMessage],
			throwException = function( ex ){
				return function(){
					throw ex;
				};
			},
			i, j; 

		for ( i = 0, j = subscribers.length; i < j; i++ ){
			try {
				subscribers[i].func( originalMessage, data );
			} catch( ex ){
				setTimeout( throwException( ex ), 0);
			}
		}
	}

	function createDeliveryFunction( message, data ){
		return function deliverNamespaced(){
			if ( messages.hasOwnProperty( message ) ) {
				deliverMessage(message, message, data);
			}

			namespaceIterator(message, function( name ){
				if ( messages.hasOwnProperty( name ) ){
					deliverMessage(message, name, data );
				}
				return true;
			});
		};
	}

	function messageHasSubscribers( message ){
		var found = messages.hasOwnProperty( message );
		if ( !found ){
			// check upper levels
			namespaceIterator(message, function(name){
				found = messages.hasOwnProperty( name );
				return found;
			});
		}
		return found;
	}

	function publish( message, data, sync ){
		var deliver = createDeliveryFunction( message, data ),
			hasSubscribers = messageHasSubscribers( message );

		if ( !hasSubscribers ){
			return false;
		}

		if ( sync === true ){
			deliver();
		} else {
			setTimeout( deliver, 0 );
		}
		return true;
	}

	/**
	 *	PubSub.publish( message[, data] ) -> Boolean
	 *	- message (String): The message to publish
	 *	- data: The data to pass to subscribers
	 *	Publishes the the message, passing the data to it's subscribers
	**/
	PubSub.publish = function( message, data ){
		return publish( message, data, false );
	};

	/**
	 *	PubSub.publishSync( message[, data] ) -> Boolean
	 *	- message (String): The message to publish
	 *	- data: The data to pass to subscribers
	 *	Publishes the the message synchronously, passing the data to it's subscribers
	**/
	PubSub.publishSync = function( message, data ){
		return publish( message, data, true );
	};

	/**
	 *	PubSub.subscribe( message, func ) -> String
	 *	- message (String): The message to subscribe to
	 *	- func (Function): The function to call when a new message is published
	 *	Subscribes the passed function to the passed message. Every returned token is unique and should be stored if you need to unsubscribe
	**/
	PubSub.subscribe = function( message, func ){
		// message is not registered yet
		if ( !messages.hasOwnProperty( message ) ){
			messages[message] = [];
		}

		// forcing token as String, to allow for future expansions without breaking usage
		// and allow for easy use as key names for the 'messages' object
		var token = (++lastUid).toString();
		messages[message].push( { token : token, func : func } );

		// return token for unsubscribing
		return token;
	};

	/**
	 *	PubSub.unsubscribe( tokenOrFunction ) -> String | Boolean
	 *  - tokenOrFunction (String|Function): The token of the function to unsubscribe or func passed in on subscribe
	 *  Unsubscribes a specific subscriber from a specific message using the unique token 
     *  or if using Function as argument, it will remove all subscriptions with that function	
	**/
	PubSub.unsubscribe = function( tokenOrFunction ){
		var isToken = typeof tokenOrFunction === 'string',
			key = isToken ? 'token' : 'func',
			succesfulReturnValue = isToken ? tokenOrFunction : true,

			result = false,
			m, i, j;
		
		for ( m in messages ){
			if ( messages.hasOwnProperty( m ) ){
				for ( i = messages[m].length-1 ; i >= 0; i-- ){
					if ( messages[m][i][key] === tokenOrFunction ){
						messages[m].splice( i, 1 );
						result = succesfulReturnValue;

						// tokens are unique, so we can just return here
						if ( isToken ){
							return result;
						}
					}
				}
             }
         }

         return result;
	};
	
	// AMD define happens at the end for compatibility with AMD loaders
	// that don't enforce next-turn semantics on modules.
	if (typeof define === 'function' && define.amd) {
		define('pubsub', function(){
			return PubSub;
		});
	}
}(this));