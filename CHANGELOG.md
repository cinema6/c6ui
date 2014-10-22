# C6UI

* Ensure that VAST and VPAID interfaces have defaults before ad tags
  are provided, and make sure players are ready before accessing
  properties and methods

## v3.1.0 (October 21, 2014)
* Added ```<youtube-player>```, ```<vimeo-player>```
  and ```<dailymotion-player>```
* Add VPAID player directive
* Add VAST player directive
* [FIX]: Fix for an issue that broke c6.log

## v3.0.0 (August 29, 2014)
* Removed ```<c6-controls></c6-controls>```, ```c6Journal```,
   ```c6-mouse-activity=""```, ```c6-resize=""```, ```c6Sfx```,
   ```c6-playlist=""```, ```c6PlaylistHistoryService```

## v2.7.0 (August 20, 2014)
* cinema6.db: Added support for including meta data with results

## v2.6.6 (July 29, 2014)
* cinema6.db: Adapters can now list the cinema6 service as a dependency
* cinema6.db: When creating cinema6.db models, properties are now
  shallow-copied from the adapter's result

## v2.6.5 (July 28, 2014)
* [FIX]: c6Sfx: Improve performance of easing volume in/out
* [FEATURE]: cinema6.db: JavaScript objects can now be "pushed" into
  the record cache

## v2.6.4 (May 8, 2014)
* [FIX]: c6UrlParser: Include leading slash in pathname, even on
  browsers (IE) that don't include it like they should

## v2.6.3 (May 7, 2014)
* [FEATURE]: cinema6.db: Prevent an erased record from being saved

## v2.6.2
* Add Changelog

## v2.6.1 (April 29, 2014)
* Fix c6EventEmitter issue with removing a handler for a given event in a handler that was added for that event before the handler being removed was added
