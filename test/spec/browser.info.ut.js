(function() {
    'use strict';

    define(['browser/info'], function() {
        describe('c6BrowserInfo', function() {
            var c6BrowserInfo,
                c6UserAgent;

            beforeEach(function() {
                c6UserAgent = {
                    app: {
                        name: null,
                        version: null
                    },
                    device: {
                        isIPhone: function() { return false; },
                        isIPod: function() { return false; },
                        isIPad: function() { return false; },
                        isIOS: function() { return this.isIPhone() || this.isIPod() || this.isIPad(); }
                    }
                };

                module('c6.ui', function($provide) {
                    $provide.value('c6UserAgent', c6UserAgent);
                });

                inject(function(_c6BrowserInfo_) {
                    c6BrowserInfo = _c6BrowserInfo_;
                });
            });

            it('should exist', function() {
                expect(c6BrowserInfo).toBeDefined();
            });

            describe('methods', function() {
                describe('generateProfile()', function() {
                    var profile;

                    describe('on an iphone', function() {
                        beforeEach(function() {
                            c6UserAgent.app.name = 'safari';
                            c6UserAgent.app.version = '6';
                            c6UserAgent.device.isIPhone = function() { return true; };

                            profile = c6BrowserInfo.generateProfile();
                        });

                        describe('inlineVid', function() {
                            it('should be false', function() {
                                expect(profile.inlineVid).toBe(false);
                            });
                        });

                        describe('multiPlayer', function() {
                            it('should be false', function() {
                                expect(profile.multiPlayer).toBe(false);
                            });
                        });

                        describe('canvasVideo', function() {
                            it('should be false', function() {
                                expect(profile.canvasVideo).toBe(false);
                            });
                        });
                    });

                    describe('on an ipod', function() {
                        beforeEach(function() {
                            c6UserAgent.app.name = 'safari';
                            c6UserAgent.app.version = '6';
                            c6UserAgent.device.isIPod = function() { return true; };

                            profile = c6BrowserInfo.generateProfile();
                        });

                        describe('inlineVid', function() {
                            it('should be false', function() {
                                expect(profile.inlineVid).toBe(false);
                            });
                        });

                        describe('multiPlayer', function() {
                            it('should be false', function() {
                                expect(profile.multiPlayer).toBe(false);
                            });
                        });

                        describe('canvasVideo', function() {
                            it('should be false', function() {
                                expect(profile.canvasVideo).toBe(false);
                            });
                        });
                    });

                    describe('on an iPad', function() {
                        beforeEach(function() {
                            c6UserAgent.app.name = 'safari';
                            c6UserAgent.app.version = '6';
                            c6UserAgent.device.isIPad = function() { return true; };

                            profile = c6BrowserInfo.generateProfile();
                        });

                        describe('inlineVid', function() {
                            it('should be true', function() {
                                expect(profile.inlineVid).toBe(true);
                            });
                        });

                        describe('multiPlayer', function() {
                            it('should be false', function() {
                                expect(profile.multiPlayer).toBe(false);
                            });
                        });

                        describe('canvasVideo', function() {
                            it('should be false', function() {
                                expect(profile.canvasVideo).toBe(false);
                            });
                        });
                    });

                    describe('on a Kindle Fire', function() {
                        beforeEach(function() {
                            c6UserAgent.app.name = 'silk';

                            profile = c6BrowserInfo.generateProfile();
                        });

                        describe('inlineVid', function() {
                            it('should be false', function() {
                                expect(profile.inlineVid).toBe(false);
                            });
                        });

                        describe('multiPlayer', function() {
                            it('should be false', function() {
                                expect(profile.multiPlayer).toBe(false);
                            });
                        });

                        describe('canvasVideo', function() {
                            it('should be false', function() {
                                expect(profile.canvasVideo).toBe(false);
                            });
                        });
                    });

                    describe('on desktop safari', function() {
                        beforeEach(function() {
                            c6UserAgent.app.name = 'safari';
                            c6UserAgent.app.version = '7';

                            profile = c6BrowserInfo.generateProfile();
                        });

                        describe('inlineVid', function() {
                            it('should be true', function() {
                                expect(profile.inlineVid).toBe(true);
                            });
                        });

                        describe('multiPlayer', function() {
                            it('should be true', function() {
                                expect(profile.multiPlayer).toBe(true);
                            });
                        });
                    });
                });
            });
        });
    });
})();
