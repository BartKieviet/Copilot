// Instances of Building represent Pardus buildings.
//
// This script is self-contained; it doesn't rely on any other source.

var Building = (function() {

// Lazily initialised by getTypeId and getTypeIdByIcon

var NAME_IDS, ICON_IDS;

// Construct a new Building instance.
//
// You can supply as many parameters as you have data for, and/or use undefined
// for missing data.  Note though: the building will not be fully usable (some
// instance methods may fail) until at least properties `loc`, `sectorId`, and
// `typeId`, have been set.
//
// `loc`, `sectorId`, `typeId`, `time`, `level`, and `ticksLeft`, if provided,
// should be integers.
//
// `owner`, if provided, should be a string.
//
// `forSale`, `toBuy`, `minimum`, and `maximum`, if provided, can be arrays or
// objects.  See makeCommodityArray below.
//
// Note that `time` is expected as a Unix timestamp in *seconds*, not
// milliseconds.  You can use Building.seconds to convert the result of
// Date.now().
//
// If you don't initialise the instance fully here, you can assign the missing
// properties to the instance later using the same names as these parameters.

function Building( loc, sectorId, typeId, time, owner, level, ticksLeft,
		   forSale, toBuy, minimum, maximum ) {
	this.loc = loc;
	this.sectorId = sectorId;
	this.typeId = typeId;
	this.time = time || Building.now();
	this.owner = owner;
	this.level = level;
	this.ticksLeft = ticksLeft;
	this.forSale = Building.makeCommodityArray( forSale );
	this.toBuy = Building.makeCommodityArray( toBuy );
	this.minimum = Building.makeCommodityArray( minimum );
	this.maximum = Building.makeCommodityArray( maximum );
}



// 1. Properties and methods of the Building object.



// All the building types we care about.
//
// Don't change the order of this array; add new types at the bottom.  The index
// of each object in the array is actually a type ID already kept in
// chrome.storage, so changing this would make a mess of current users' data.
//
// `n` is the building name, `s` is the building short name, `i` is the URL of
// the building image without the image pack prefix and the '.png' suffix.
// `u` is a list of commodity IDs that this building consumes.

Building.CATALOGUE = [
	, // id=0 is not in use
	{ n:"Alliance Command Station", s:"ACS", i:"alliance_command_station", u:[2,19] },
	{ n:"Asteroid Mine", s:"AM", i:"asteroid_mine", u:[1,2,3] },
	{ n:"Battleweapons Factory", s:"BWF", i:"battleweapons_factory", u:[1,2,3,6,7,18] },
	{ n:"Brewery", s:"Br", i:"brewery", u:[1,2,3,13] },
	{ n:"Chemical Laboratory", s:"CL", i:"chemical_laboratory", u:[1,2,3] },
	{ n:"Clod Generator", s:"CG", i:"clod_generator", u:[2,13,21] },
	{ n:"Dark Dome", s:"DD", i:"dark_dome", u:[2,50] },
	{ n:"Droid Assembly Complex", s:"DAC", i:"droid_assembly_complex", u:[1,2,3,8,19] },
	{ n:"Drug Station", s:"DS", i:"drug_station", u:[1,2,3,17,50] },
	{ n:"Electronics Facility", s:"EF", i:"electronics_facility", u:[1,2,3,6,9] },
	{ n:"Energy Well", s:"EW", i:"energy_well", u:[1,3] },
	{ n:"Fuel Collector", s:"FC", i:"fuel_collector", u:[2,13] },
	{ n:"Gas Collector", s:"GC", i:"gas_collector", u:[1,2,3] },
	{ n:"Handweapons Factory", s:"HWF", i:"handweapons_factory", u:[1,2,3,7,9,18] },
	{ n:"Leech Nursery", s:"LN", i:"leech_nursery", u:[1,2,3,19,23] },
	{ n:"Medical Laboratory", s:"ML", i:"medical_laboratory", u:[1,2,3,12] },
	{ n:"Military Outpost", s:"MO", i:"military_outpost", u:[2,16,19] },
	{ n:"Nebula Plant", s:"NP", i:"nebula_plant", u:[1,3,17] },
	{ n:"Neural Laboratory", s:"NL", i:"neural_laboratory", u:[1,2,3,4,11] },
	{ n:"Optics Research Center", s:"ORC", i:"optics_research_center", u:[1,2,3,14] },
	{ n:"Plastics Facility", s:"PF", i:"plastics_facility", u:[1,2,3,12,13] },
	{ n:"Radiation Collector", s:"RC", i:"radiation_collector", u:[1,2,3] },
	{ n:"Recyclotron", s:"Rcy", i:"recyclotron", u:[2,13,21] },
	{ n:"Robot Factory", s:"RF", i:"robot_factory", u:[1,2,3,6,7,18] },
	{ n:"Slave Camp", s:"SC", i:"slave_camp", u:[1,2,3,11,15] },
	{ n:"Smelting Facility", s:"Sm", i:"smelting_facility", u:[1,2,3,5] },
	{ n:"Space Farm", s:"SF", i:"space_farm", u:[2,4] },
	{ n:"Stim Chip Mill", s:"SCM", i:"stim_chip_mill", u:[1,3,7,17,28] }
];

// Convenience for the current time in seconds, so K's heart doesn't break that
// hard...

Building.now = function() {
	return Building.seconds( Date.now() );
}

// Convert a time in milliseconds, like Date uses, to seconds, like Building
// wants.

Building.seconds = function( millis ) {
	return Math.floor( millis / 1000 );
}

// Get the type spec object for the given typeId.  Most likely you'll want to
// use the instance's methods instead, getTypeName etc.

Building.getType = function( typeId ) {
	return Building.CATALOGUE[ typeId ];
}

// If you have the name of a building type (e.g. "Medical Laboratory"), this
// gives you the type id for it.  If the name isn't recognisable, returns
// undefined.

Building.getTypeId = function( name ) {
	if ( NAME_IDS === undefined ) {
		NAME_IDS = Building.CATALOGUE.reduce(
			function( name_ids, data, id ) {
				name_ids[ data.n ] = id;
				return name_ids;
			},
			{}
		);
	}

	return NAME_IDS[ name ];
}

// If you have the URL of the building's image, strip the prefix up to the last
// slash, and the '.png' suffix, then call this for the type id.

Building.getTypeIdByIcon = function( icon ) {
	if ( ICON_IDS === undefined ) {
		ICON_IDS = Building.CATALOGUE.reduce(
			function( icon_ids, data, id ) {
				icon_ids[ data.i ] = id;
				return icon_ids;
			},
			{}
		);
	}

	return ICON_IDS[ icon ];
}

// Get the type name from a type id.

Building.getTypeName = function( typeId ) {
	var t = Building.getType( typeId );
	return t !== undefined ? t.n : undefined;
}

// Get the type short name from a type id (e.g. ACS, DAC, etc.).

Building.getTypeShortName = function( typeId ) {
	var t = Building.getType( typeId );
	return t !== undefined ? t.s : undefined;
}

// Get an array of commodity ids that buildings of the given type consume.

Building.getUpkeepCommodities = function( typeId ) {
	var t = Building.getType( typeId );
	return t !== undefined ? t.u : undefined;
}

// Compute the storage key of a building at the given location and universe.

Building.storageKey = function( universeKey, location ) {
	return universeKey + location;
}

// Create a Building instance from data obtained from storage. `key` is the
// storage key used to retrieve the building; `a` is data retrieved from storage.
//
// Do not use building data from storage directly; always create an instance
// with this function, manipulate that, and use its toStorage method if you need
// to store it back.  This lets us change the storage format without having to
// modify the app anywhere but here.

Building.createFromStorage = function( key, a ) {
	// V2.1 format is a 3- to 10-element array.
	var loc = parseInt( key.substr(1) );
	return new Building(
		loc,
		a[0], // sectorId
		a[1], // typeId
		a[2], // timeSecs
		a[3], // owner
		a[4], // level
		a[5], // ticksLeft
		a[6], // forSale
		a[7], // toBuy
		a[8], // minimum
		a[9]  // maximum
	);
}

// The number of production ticks elapsed from Unix timestamp `time` to `now`.
// Both are given in seconds past the epoch.  If the latter is omitted, it
// defaults to the current time.

Building.ticksPassed = function( time, now ) {
	var timeToTick, timePassed, ticksPassed;

	if ( now === undefined )
		now = Building.now();

	timeToTick = 6 * 3600 - (time - 5100) % (6 * 3600);
	timePassed = now - time;
	ticksPassed = ( timePassed > timeToTick ) ? 1 : 0;
	ticksPassed += Math.floor( timePassed / (6 * 3600) );
	return ticksPassed;
}

// Building instances store lists of commodity values as sparse arrays, not
// objects, because that's faster (object keys are always strings, and our ids
// are always numbers; using objects would force conversions back and forth).
//
// Getting and setting values is straightforward:
// `var foodForSale = building.forSale[ foodId ];`
//
// However, sparse arrays are harder to enumerate, because naïve "for 0 to
// length" scans would visit all the "holes"; for..in loops can't be used, and
// for..of loops are too modern for our compatibility requirements.
//
// So, this utility converts to object any of the arrays held by the Building
// instance (`forSale`, `toBuy`, `minimum`, `maximum`).
//
// You may want to consider using things like `building.forSale.forEach()`
// instead anyway, and avoid creating objects.

Building.makeDictionary = function( array ) {
	return array.reduce(
		function( o, n, id ) {
			o[ id ] = n;
			return o;
		},
		{}
	);
}

// Converts commodity data (associative collections of commodity id to integer)
// into the sparse arrays that we hold in Building instances.  You can use it to
// set the `forSale`, `toBuy`, `minimum`, `maximum` properties of an instance:
//
// `building.toBuy = Building.makeCommodityArray( {foodId: 50, waterId: 80} );`
//
// `arg` can be one of:
//
//  * An array: we assume `arg` contains an even number of integer items: the
//    first a commodity id, the second a value, the third another commodity id,
//    and so forth.  This form is used to load objects from storage, which needs
//    to run fast (sometimes we're just constructing an instance to look at some
//    stored datum, not because we need the full Building functionality.  So no
//    checking is performed here, for speed.
//
//  * An object: we expect the enumerable keys of `arg` to be commodity ids, and
//    the associated values, integers.  Return a sparse array with the exact
//    same keys the given object had (only as integers not strings).  This
//    doesn't need to run that fast, instead we want correctness, so we do
//    validate a few things.
//
//  * null or undefined: return an empty array.
//
// Any other type will throw an error, because that's useful for debugging.

Building.makeCommodityArray = function( arg ) {
	var a, i, end, key, val;

	if ( arg === null || arg === undefined )
		return [];

	if ( arg instanceof Array ) {
		for ( a = [], i = 0, end = arg.length; i < end; i += 2 )
			a[ arg[i] ] = arg[ i + 1 ];
		return a;
	}

	if ( typeof arg !== 'object' )
		throw 'Invalid commodity map: ' + JSON.stringify(arg);

	a = [];
	for ( key in arg ) {
		key = parseInt( key );
		val = parseInt( arg[key] );
		if ( isNaN(key) || isNaN(val) ) {
			throw 'Invalid commodity map pair: ' +
				JSON.stringify( key ) + ' -> ' +
				JSON.stringify( arg[key] );
		}
		a[ key ] = val;
	}
	return a;
}

// Removes the building at location `loc` from storage.  `ukey` is the universe
// key (a single uppercase letter: A, O, P).
//
// This is an unusual function that actually updates `chrome.storage.sync`.
// Added because removing a single building is in fact a common operation.

Building.removeStorage = function( loc, ukey, callback ) {
	loc = parseInt( loc );
	if ( isNaN(loc) )
		return;

	chrome.storage.sync.get( ukey, removeBuildingListEntry );

	function removeBuildingListEntry( data ) {
		var list, index;

		list = data[ ukey ];
		index = list.indexOf( loc );
		if ( index === -1 )
			removeBuildingData();
		else {
			list.splice( index, 1 );
			chrome.storage.sync.set( data, removeBuildingData );
		}
	}

	function removeBuildingData() {
		chrome.storage.sync.remove( ukey + loc, callback )
	}
}



// 2.  Methods of Building instances.



// Get the name of buildings of this type.

Building.prototype.getTypeName = function() {
	return Building.getTypeName( this.typeId );
}

// Get the short name of buildings of this type.

Building.prototype.getTypeShortName = function() {
	return Building.getTypeShortName( this.typeId );
}

// Get an array with the ids of all the commodities that this building consumes.

Building.prototype.getUpkeepCommodities = function() {
	return Building.getUpkeepCommodities( this.typeId );
}

// Check if this building stores minimums and maximums.  That is not often the
// case: currently bookie only stores that for your own buildings, when it
// watches you set the limits in the "trade settings" page.

Building.prototype.hasMinMax = function() {
	return this.minimum.length > 0 && this.maximum.length > 0;
}

// Test if a given commodity id is consumed by this building.

Building.prototype.isUpkeep = function( commodityId ) {
	return this.getUpkeepCommodities().
		indexOf( parseInt(commodityId) ) !== -1;
}

// Compute how many ticks of upkeep remain at time `now`, which should be after
// the last time the building was updated.  If omitted, it defaults to the
// current time.  `now` is a timestamp in seconds past the epoch.
//
// If remaining ticks were unknown at the time the building was last updated,
// this function will return undefined.

Building.prototype.ticksNow = function( now ) {
	if ( this.ticksLeft === undefined )
		return undefined;

	 return Math.max(
		 0, this.ticksLeft - Building.ticksPassed(this.time, now) );
}

// Compute the storage key that you'd use to store this building in the given
// universe.

Building.prototype.storageKey = function( universeKey ) {
	return universeKey + this.loc;
}

// Create the object that gets sent to storage when we store a Building.  Do not
// store building data directly; always create a Building instance, use this
// function to obtain the data to store, and send that to storage.  This lets us
// change the storage format when needed, without having to modify the app
// anywhere but here.

Building.prototype.toStorage = function() {
	// V2.1 format is a 3 to 10-element array.
	var a = [
		this.sectorId,
		this.typeId,
		this.time,
		this.owner,
		this.level,
		this.ticksLeft,
		storageCommodityMap(this.forSale),
		storageCommodityMap(this.toBuy),
		storageCommodityMap(this.minimum),
		storageCommodityMap(this.maximum)
	];

	// Shave off the last undefined elements of this.  a.length should never
	// go below 3 here, but we'll check just in case because if we're wrong
	// thing would get ugly.
	while ( a.length > 3 && a[ a.length - 1 ] === undefined )
		a.length = a.length - 1;

	return a;
}

// Return an array of commodity ids for commodities that appear in either
// this.toBuy or this.forSale.
//
// XXX - should this be moved to overview.js?

Building.prototype.getCommoditiesInUse = function() {
	var seen = [], r = [];

	if ( this.toBuy )
		this.toBuy.forEach( pushc );
	if ( this.forSale )
		this.forSale.forEach( pushc );
	return r.sort( compare );

	function pushc( v, i ) {
		if ( !seen[ i ] ) {
			seen[ i ] = true;
			r.push( i );
		}
	}
	function compare( a, b ) { return a - b; }
}

// Remove this building from storage.  This updates `chrome.storage.sync`.

Building.prototype.removeStorage = function( ukey, callback ) {
	Building.removeStorage( this.loc, ukey, callback );
}

// Return true if the building was fully stocked at the time it was last
// updated.  This means that it won't buy any of the commodities it consumes.

Building.prototype.isFullyStocked = function() {

	// * this.getUpkeepCommodities() returns an array of commodity ids.
	// * find runs the anonymous function for each commodity, with `this`
	//   set as the the building's `toBuy`; returns a commodity id if there
	//   is one for which toBuy is greater than zero, or undefined if there
	//   are none.
	// * isFullyStocked returns true if find returns undefined.

	return this.getUpkeepCommodities().find(
		function( commId ) { return this[commId] > 0; },
		this.toBuy
	) === undefined;
}



// 3. Private functions.



function storageCommodityMap( a ) {
	if ( a.length === 0 )
		return undefined;
	return a.reduce(
		function(scm, val, id) {
			scm.push( id, val );
			return scm;
		},
		[]
	);
}

return Building;

})();
