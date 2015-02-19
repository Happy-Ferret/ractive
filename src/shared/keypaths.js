import { isArray, isNumeric } from 'utils/is';
import getPotentialWildcardMatches from 'utils/getPotentialWildcardMatches';

var refPattern, keypathCache, Keypath;

refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;

keypathCache = {};

Keypath = function ( str, viewmodel ) {
	var parent, keys = str.split( '.' );

	this.str = str;

	if ( str[0] === '@' ) {
		this.isSpecial = true;
		this._value = decodeKeypath( str );
	}	else {
		this._value = void 0;
		this.hasCachedValue = false;
	}

	this.wrapper = null;

	this.firstKey = keys[0];
	this.lastKey = keys.pop();

	this.viewmodel = viewmodel;
	this.children = null;

	this.parent = parent = str === '' ? null : viewmodel.getKeypath( keys.join( '.' ) );
	if ( parent ) {
		parent.addChild( this );
	}

	this.isRoot = !str;
};

Keypath.prototype = {

	getValue () {
		return this._value;
	},

	addChild ( child ) {
		this.children ? this.children.push( child ) : this.children = [ child ];
	},

	setValue ( value ) {
		this.hasCachedValue = true;
		this._value = value;
	},

	clearValue ( keepExistingWrapper ) {
		var wrapper, children;

		this.hasCachedValue = false;
		this._value = void 0;

		if ( !keepExistingWrapper ) {
			// Is there a wrapped property at this keypath?
			if ( wrapper = this.wrapper ) {
				// Did we unwrap it?
				if ( wrapper.teardown() !== false ) {
					this.wrapper = null;
				}
				// else
				// Could there be a GC ramification if this is a "real" ractive.teardown()?
			}
		}

		if ( children = this.children ) {
			children.forEach( child => child.clearValue( /*keepExistingWrapper*/ ) );
		}
	},

	/* string manipulation: */

	equalsOrStartsWith ( keypath ) {
		return ( keypath && ( keypath.str === this.str ) ) || this.startsWith( keypath );
	},

	join ( str ) {
		return this.viewmodel.getKeypath( this.isRoot ? String( str ) : this.str + '.' + str );
	},

	replace ( oldKeypath, newKeypath ) {
		// changed to ".str === .str" to transition to multiple keypathCaches
		if ( oldKeypath && ( this.str === oldKeypath.str ) ) {
			return newKeypath;
		}

		if ( this.startsWith( oldKeypath ) ) {
			return newKeypath === null ? newKeypath : newKeypath.viewmodel.getKeypath( this.str.replace( oldKeypath.str + '.', newKeypath.str + '.' ) );
		}
	},

	startsWith ( keypath ) {
		if ( !keypath ) {
			// TODO under what circumstances does this happen?
			return false;
		}

		return keypath && this.str.substr( 0, keypath.str.length + 1 ) === keypath.str + '.';
	},

	toString () {
		throw new Error( 'Bad coercion' );
	},

	valueOf () {
		throw new Error( 'Bad coercion' );
	},

	wildcardMatches () {
		return this._wildcardMatches || ( this._wildcardMatches = getPotentialWildcardMatches( this.str ) );
	}
};

export function assignNewKeypath ( target, property, oldKeypath, newKeypath ) {
	var existingKeypath = target[ property ];

	if ( existingKeypath && ( existingKeypath.equalsOrStartsWith( newKeypath ) || !existingKeypath.equalsOrStartsWith( oldKeypath ) ) ) {
		return;
	}

	target[ property ] = existingKeypath ? existingKeypath.replace( oldKeypath, newKeypath ) : newKeypath;
	return true;
}

export function decodeKeypath ( keypath ) {
	var value = keypath.slice( 2 );

	if ( keypath[1] === 'i' ) {
		return isNumeric( value ) ? +value : value;
	} else {
		return value;
	}
}

export function getMatchingKeypaths ( ractive, pattern ) {
	var keys, key, matchingKeypaths;

	keys = pattern.split( '.' );
	matchingKeypaths = [ ractive.viewmodel.rootKeypath ];

	while ( key = keys.shift() ) {
		if ( key === '*' ) {
			// expand to find all valid child keypaths
			matchingKeypaths = matchingKeypaths.reduce( expand, [] );
		}

		else {
			if ( matchingKeypaths[0] === ractive.viewmodel.rootKeypath ) { // first key
				matchingKeypaths[0] = ractive.viewmodel.getKeypath( key );
			} else {
				matchingKeypaths = matchingKeypaths.map( concatenate( key ) );
			}
		}
	}

	return matchingKeypaths;

	function expand ( matchingKeypaths, keypath ) {
		var wrapper, value, key;

		wrapper = keypath.wrapper;
		value = wrapper ? wrapper.get() : ractive.viewmodel.get( keypath );

		for ( key in value ) {
			if ( value.hasOwnProperty( key ) && ( key !== '_ractive' || !isArray( value ) ) ) { // for benefit of IE8
				matchingKeypaths.push( keypath.join( key ) );
			}
		}

		return matchingKeypaths;
	}
}

function concatenate ( key ) {
	return function ( keypath ) {
		return keypath.join( key );
	};
}

export function normalise ( ref ) {
	return ref ? ref.replace( refPattern, '.$1' ) : '';
}

export { Keypath };
