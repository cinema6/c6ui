# C6UI

## v3.6.3 (December 30, 2014)
* [FIX]: Fix for an issue that caused videos not to autoplay in
  UIWebViews on iOS 7

## v3.6.2 (December 23, 2014)
* [FIX]: Added checks which may make VAST playback more reliable

## v3.6.1 (December 22, 2014)
* [FEATURE]: Added more robust error reporting to the VAST player

## v3.6.0 (December 22, 2014)
* [FEATURE]: Added support for the ```controls``` attribute to Vimeo and
  YouTube videos

## v3.5.6 (December 20, 2014)
* [FEATURE]: Use VAST video with smallest resolution on mobile

## v3.5.5 (December 19, 2014)
* [FEATURE]: Add support for "disable-clickthrough" attribute in VAST
  player

## v3.5.4 (December 19, 2014)
* [FIX]: Destroy VPAID player if ad times out

## v3.5.3 (December 18, 2014)
* [FEATURE]: Allow the VAST player to play back inline if possible on
  mobile
* [FIX]: Moved the VPAID flash object template from the directive
  to the VPAID service

## v3.5.2 (December 16, 2014)
* [FIX]: Changed the default VPAID timer to 5 seconds
* [FIX]: Trust that we have an ad if the time elapsed has changed or
  the AdStarted or AdVideoStart event is fired

## v3.5.1 (December 11, 2014)
* [FIX]: Fix for an issue that caused a VAST video to start playing if
  it had been told to play but couldn't, even if pause() was called
  before it started playing

## v3.5.0 (December 11, 2014)
* The VAST player now makes no ad requests until its load() method is
  called
* [FIX]: Fix for an issue that caused rumble videos to log errors to the
  console

## v3.4.3 (December 4, 2014)
* [FIX]: VAST player no longer fires the complete pixel and ended event
  when the player is reloaded
* [FEATURE]: All players now have a ```minimize()``` method to exit
  fullscreen mode if possible
* [FIX]: VAST click through is only disabled if controls are enabled
* The VAST player now fires the "complete" pixel one second from the end
  of the video

## v3.4.2 (December 3, 2014)
* [FIX]: Temporarily disable the click through link on all vast players

## v3.4.1 (December 3, 2014)
* [FIX]: Only use mp4 or webm videos in vast player

## v3.4.0 (November 26, 2014)
* [FEATURE]: Added ```<rumble-player>```

## v3.3.3 (November 19, 2014)
* Fire Ready event from vast/vpaid player before any other events are sent
* Ensure that Error events are properly sent from vast/vpaid player

## v3.3.2 (November 17, 2014)
* Ensure that when play or pause is called on a <vast-player> it is
  executed when the video player is ready
* [FIX]: Fix for an issue that could cause a YouTube video to play
  automatically if a start time was specified
* [FIX]: Fix for an issue that caused the 'play' event not to be emitted
  the first time the video played (YouTube, vimeo)
* [FIX]: (YouTube) fix for an issue that could cause the 'play' or
  'pause' event to be emitted twice in a row

## v3.3.1 (November 13, 2014)
* The <vast-player> directive will not have a click through if the
  click through url is null.com

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
