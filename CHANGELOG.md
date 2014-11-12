# C6UI

## v3.3.0 (November 12, 2014)
* The VAST service now handles vast from Adtech, which violates standards
* The ```<dailymotion-player>``` interface pause() method now returns an
  error if it is called before the video starts playing

## v3.2.0 (October 30, 2014)
* [FEATURE]: Added ```<embedded-player>``` for embedding generic video
  players

## v3.1.3 (October 24, 2014)
* Add (noop) load() method to ```<vimeo-player>```,
  ```<youtube-player>``` and ```<dailymotion-player>```.
* [FIX]: Fixed an issue where calling load() on the ```<vpaid-player>```
  would cause the ad to break
* [FEATURE]: ```<vpaid-player>``` can now find companion ads at a
  certain dimension
* ```<vpaid-player>``` and ```<vast-player>``` now have the same API for
  getting companion ads
* [FIX]: Fixed an issue that caused the ```<vast-player>``` to render to
  large
* Added a working load() method to the ```<vast-player>``` interface
* Added the ability to enable native video controls in the
  ```<vast-player>```.

## v3.1.2 (October 22, 2014)
* VAST/VPAID play method will reset/reload the player if video has completed

## v3.1.1 (October 22, 2014)
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
