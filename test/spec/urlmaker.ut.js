define(['url/urlmaker'], function(urlUrlmaker) {
    'use strict';

    var c6UrlMakerProvider, c6UrlMaker;
    describe('c6UrlMakerProvider',function(){
        // Note: The c6UrlMakerProvider module will not be invoked until
        // the c6UrlMaker is injected
        beforeEach(function() {
            module(urlUrlmaker.name);

            module(['c6UrlMakerProvider', function(_c6UrlMakerProvider){
                c6UrlMakerProvider = _c6UrlMakerProvider;
            }]);
        });
                    
        describe('interface',function(){
            // Need to inject the service to make the provider available
            beforeEach( inject(['c6UrlMaker', function(_c6UrlMaker){ }]));
        
            it('has location',function(){
                expect(c6UrlMakerProvider.location).toBeDefined();
            });
            it('has config',function(){
                expect(c6UrlMakerProvider.config).toBeDefined();
            });
            it('has makeUrl',function(){
                expect(c6UrlMakerProvider.makeUrl).toBeDefined();
            });
        });

        describe('config method', function(){
            beforeEach( inject(['c6UrlMaker', function(_c6UrlMaker){ }]));

            it('will return a references to the providers config',function(){
                expect(c6UrlMakerProvider.config()).toBeDefined();
                expect(c6UrlMakerProvider.config()).not.toBeNull();
            });

            it('allows the config to be modified from the outside', function(){
                var c1,c2;
                c1 = c6UrlMakerProvider.config();
                c1.foo = 'bar';
                c2 = c6UrlMakerProvider.config();
                expect(c2).toBe(c1);
                expect(c2.foo).toEqual('bar');
            });

        });

        describe('location method', function(){
            beforeEach( inject(['c6UrlMaker', function(_c6UrlMaker){ }]));

            it('will return a reference to the provider',function(){
                expect(c6UrlMakerProvider.location('test')).toBe(c6UrlMakerProvider); 
            });

            it('will set type to default if none passed',function(){
                var cfg = c6UrlMakerProvider.config();
                c6UrlMakerProvider.location('assets/','default');
                expect(cfg.default).toEqual('assets/');
                c6UrlMakerProvider.location('otherdir/');
                expect(cfg.default).toEqual('otherdir/');
            });

            it('will hold locations for multiple types',function(){
                c6UrlMakerProvider
                .location('assets/','default')
                .location('assets/media','video')
                .location('assets/imgs','img');
                var cfg = c6UrlMakerProvider.config();
                expect(cfg).toEqual({
                    default : 'assets/',
                    video   : 'assets/media',
                    img     : 'assets/imgs'
                });
            });
        });

        describe('makeUrl method', function(){
            beforeEach( inject(['c6UrlMaker', function(_c6UrlMaker){ }]));
            beforeEach(function(){
                c6UrlMakerProvider
                .location('assets','default')
                .location('assets/video','video');
            });
            it('will use default if no type is passed',function(){
                expect(c6UrlMakerProvider.makeUrl('foo1')).toEqual('assets/foo1');
            });
            
            it('will use type if type is passed',function(){
                expect(c6UrlMakerProvider.makeUrl('foo1','video')).toEqual('assets/video/foo1');
            });

            it('will throw an exception if a bad type is passed',function(){
                expect(function(){
                    c6UrlMakerProvider.makeUrl('foo1','bad')
                }).toThrow('unable to find location for type: bad');
            });
        });
    });
    describe('c6UrlMaker service',function(){
        beforeEach(function() {
            module(urlUrlmaker.name);
        });

        describe('initialization',function(){
            it('defaults to /',function(){
                inject(['c6UrlMaker', function(c6UrlMaker){ 
                    expect(c6UrlMaker('index.html')).toEqual('/index.html');
                }]);
            });

        });

        describe('configuration', function(){
            it('will override default', function(){
                module(urlUrlmaker.name, ['c6UrlMakerProvider', function(provider){
                    provider
                        .location('assets','default')
                        .location('assets/video','video');
                }]);
                inject(['c6UrlMaker', function(c6UrlMaker){ 
                    expect(c6UrlMaker('index.html')).toEqual('assets/index.html');
                }]);
            });

            it('can be obtained from the service', function(){
                module(urlUrlmaker.name, ['c6UrlMakerProvider', function(provider){
                    provider
                        .location('assets','default')
                        .location('assets/video','video');
                }]);
                inject(['c6UrlMaker', function(c6UrlMaker){ 
                    expect(c6UrlMaker.getConfig()).toEqual({
                        default : 'assets',
                        video   : 'assets/video'
                    });
                }]);
            });
        });
    });
});
