(function() {
    'use strict';

    define(['videos/playlist_history'], function() {
        describe('c6PlaylistHistoryService', function() {
            var c6PlaylistHistorySvc,
                $log,
                $timeout,
                playlistCtrl,
                nodes,
                branches;

            beforeEach(function() {
                module('c6.ui');
                inject(function(_c6PlaylistHistoryService_, _$timeout_, _$log_) {
                    c6PlaylistHistorySvc = _c6PlaylistHistoryService_;
                    $timeout = _$timeout_;
                    $log = _$log_;
                });

                nodes = {};
                branches = [
                    {

                    },
                    {

                    },
                    {

                    }
                ];

                playlistCtrl = {
                    start: jasmine.createSpy('playlist start'),
                    play: jasmine.createSpy('playlist play'),
                    stop: jasmine.createSpy('playlist stop'),
                    currentNodeId: function() {
                        return 'n0';
                    },
                    on: jasmine.createSpy('playlist on'),
                    getDataForNode: function(nodeId) {
                        var node = {
                            id: nodeId,
                            name: nodeId + 'Name'
                        };

                        nodes[nodeId] = node;

                        return node;
                    },
                    load: jasmine.createSpy('playlist load'),
                    getBranchesForNode: jasmine.createSpy('playlist getBranchesForNode').andReturn(branches)
                };
            });

            it('should exist', function() {
                expect(c6PlaylistHistorySvc).toBeDefined();
            });

            describe('properties', function() {
                describe('ready', function() {
                    it('should start false', function() {
                        expect(c6PlaylistHistorySvc.ready).toBe(false);
                    });
                });

                describe('playing', function() {
                    it('should start false', function() {
                        expect(c6PlaylistHistorySvc.playing).toBe(false);
                    });
                });

                describe('index', function() {
                    it('should start at -1', function() {
                        expect(c6PlaylistHistorySvc.index).toBe(-1);
                    });
                });

                describe('currentNode', function() {
                    it('should be an object', function() {
                        expect(typeof c6PlaylistHistorySvc.currentNode).toBe('object');
                    });

                    it('should have two properties: id and name which will start out null', function() {
                        expect(c6PlaylistHistorySvc.currentNode.id).toBe(null);
                        expect(c6PlaylistHistorySvc.currentNode.name).toBe(null);
                    });
                });

                describe('currentBranches', function() {
                    it('should start off empty', function() {
                        expect(c6PlaylistHistorySvc.currentBranches.length).toBe(0);
                    });
                });
            });

            describe('methods', function() {
                describe('init(playlist)', function() {
                    var pushSpy,
                        readySpy;

                    beforeEach(function() {
                        pushSpy = spyOn(c6PlaylistHistorySvc, 'push');
                        readySpy = jasmine.createSpy('ready');

                        c6PlaylistHistorySvc.on('ready', readySpy);

                        c6PlaylistHistorySvc.init(playlistCtrl);
                    });

                    it('should start the playlistCtrl', function() {
                        expect(playlistCtrl.start).toHaveBeenCalled();
                    });

                    it('should call push() with the playlistCtrl\'s currentNodeId()', function() {
                        expect(pushSpy).toHaveBeenCalled();
                        expect(pushSpy.mostRecentCall.args[0]).toBe('n0');
                    });

                    it('should listen for the playlistCtrl\'s endOfPlayListItem and endOfPlayList events', function() {
                        expect(playlistCtrl.on.argsForCall[0][0]).toBe('endOfPlayListItem');
                        expect(playlistCtrl.on.argsForCall[1][0]).toBe('endOfPlayList');
                    });

                    it('should set ready to true and emit the kvo event', function() {
                        expect(c6PlaylistHistorySvc.ready).toBe(true);
                        expect(readySpy).toHaveBeenCalledWith(true);
                    });
                });

                describe('post-init methods', function() {
                    var currentNodeIdSpy,
                        currentNodeNameSpy,
                        currentNodeSpy,
                        historyModifiedSpy,
                        indexSpy,
                        currentBranchesSpy;

                    beforeEach(function() {
                        currentNodeIdSpy = jasmine.createSpy('currentNode.id');
                        currentNodeNameSpy = jasmine.createSpy('currentNode.name');
                        currentNodeSpy = jasmine.createSpy('currentNode');
                        historyModifiedSpy = jasmine.createSpy('historyModified');
                        indexSpy = jasmine.createSpy('index');
                        currentBranchesSpy = jasmine.createSpy('currentBranches');

                        c6PlaylistHistorySvc.on('currentNode.id', currentNodeIdSpy);
                        c6PlaylistHistorySvc.on('currentNode.name', currentNodeNameSpy);
                        c6PlaylistHistorySvc.on('currentNode', currentNodeSpy);
                        c6PlaylistHistorySvc.on('historyModified', historyModifiedSpy);
                        c6PlaylistHistorySvc.on('index', indexSpy);
                        c6PlaylistHistorySvc.on('currentBranches', currentBranchesSpy);


                        c6PlaylistHistorySvc.init(playlistCtrl);
                    });

                    describe('play() and pause()', function() {
                        var playingSpy;

                        beforeEach(function() {
                            playingSpy = jasmine.createSpy('playing');
                            c6PlaylistHistorySvc.on('playing', playingSpy);
                        });

                        describe('play', function() {
                            beforeEach(function() {
                                c6PlaylistHistorySvc.play();
                            });

                            it('should call play() on the playlistCtrl', function() {
                                expect(playlistCtrl.play).toHaveBeenCalled();
                            });

                            it('should set playing to true and emit the kvo event', function() {
                                expect(c6PlaylistHistorySvc.playing).toBe(true);
                                expect(playingSpy).toHaveBeenCalledWith(true);
                            });
                        });

                        describe('stop()', function() {
                            beforeEach(function() {
                                c6PlaylistHistorySvc.stop();
                            });

                            it('should call stop() on the playlistCtrl', function() {
                                expect(playlistCtrl.stop).toHaveBeenCalled();
                            });

                            it('should set playing to false and emit the kvo event', function() {
                                expect(c6PlaylistHistorySvc.playing).toBe(false);
                                expect(playingSpy).toHaveBeenCalledWith(false);
                            });
                        });
                    });

                    describe('push(nodeId)', function() {
                        describe('pushing when at the most recent entry', function() {
                            it('should call load() on the playlistCtrl with the nodeId', function() {
                                expect(playlistCtrl.load).toHaveBeenCalledWith('n0', 0, true);
                            });

                            it('should set the currentNode.id and currentNode.name and emit the proper kvo events', function() {
                                expect(c6PlaylistHistorySvc.currentNode.id).toBe('n0');
                                expect(c6PlaylistHistorySvc.currentNode.name).toBe('n0Name');

                                expect(currentNodeIdSpy).toHaveBeenCalledWith('n0');
                                expect(currentNodeNameSpy).toHaveBeenCalledWith('n0Name');
                                expect(currentNodeSpy).toHaveBeenCalledWith(c6PlaylistHistorySvc.currentNode);
                            });

                            it('should increment the index and emit the kvo event', function() {
                                expect(c6PlaylistHistorySvc.index).toBe(0);
                                expect(indexSpy).toHaveBeenCalledWith(0);
                            });

                            it('should emit the historyModified event', function() {
                                expect(historyModifiedSpy).toHaveBeenCalled();
                                expect(historyModifiedSpy.mostRecentCall.args[0].size()).toBe(1);
                            });

                            it('should update the currentBranches and emit the kvo event', function() {
                                $timeout.flush();

                                expect(c6PlaylistHistorySvc.currentBranches).toBe(branches);
                                expect(currentBranchesSpy).toHaveBeenCalledWith(branches);
                            });
                        });

                        describe('pushing when back in time', function() {
                            beforeEach(function() {
                                c6PlaylistHistorySvc.push('n1');
                                c6PlaylistHistorySvc.push('n2');
                                c6PlaylistHistorySvc.push('n3');

                                c6PlaylistHistorySvc.moveTo('n0');
                            });

                            describe('when the node to push is already the next node', function() {
                                var moveToSpy;

                                beforeEach(function() {
                                    moveToSpy = spyOn(c6PlaylistHistorySvc, 'moveTo');

                                    c6PlaylistHistorySvc.push('n1');
                                });

                                it('should just move to the entry', function() {
                                    expect(moveToSpy).toHaveBeenCalledWith('n1');
                                });
                            });

                            describe('when the node to push is a new node', function() {
                                beforeEach(function() {
                                    c6PlaylistHistorySvc.push('n10');
                                });

                                it('should erase the old future history and replace it with the new entry', function() {
                                    expect(c6PlaylistHistorySvc.getHistory().size()).toBe(2);
                                });

                                it('should call load() on the playlistCtrl with the nodeId', function() {
                                    expect(playlistCtrl.load).toHaveBeenCalledWith('n10', 0, true);
                                });

                                it('should set the currentNode.id and currentNode.name and emit the proper kvo events', function() {
                                    expect(c6PlaylistHistorySvc.currentNode.id).toBe('n10');
                                    expect(c6PlaylistHistorySvc.currentNode.name).toBe('n10Name');

                                    expect(currentNodeIdSpy).toHaveBeenCalledWith('n10');
                                    expect(currentNodeNameSpy).toHaveBeenCalledWith('n10Name');
                                    expect(currentNodeSpy).toHaveBeenCalledWith(c6PlaylistHistorySvc.currentNode);
                                });

                                it('should increment the index and emit the kvo event', function() {
                                    expect(c6PlaylistHistorySvc.index).toBe(1);
                                    expect(indexSpy).toHaveBeenCalledWith(1);
                                });

                                it('should emit the historyModified event', function() {
                                    expect(historyModifiedSpy).toHaveBeenCalled();
                                    expect(historyModifiedSpy.mostRecentCall.args[0].size()).toBe(2);
                                });

                                it('should update the currentBranches and emit the kvo event', function() {
                                    $timeout.flush();

                                    expect(c6PlaylistHistorySvc.currentBranches).toBe(branches);
                                    expect(currentBranchesSpy).toHaveBeenCalledWith(branches);
                                });
                            });
                        });
                    });

                    describe('moveTo(nodeId, time)', function() {
                        beforeEach(function() {
                            spyOn($log, 'error');

                            c6PlaylistHistorySvc.push('n1');
                            c6PlaylistHistorySvc.push('n2');
                            c6PlaylistHistorySvc.push('n3');
                        });

                        it('should log an error if the node is not in the history', function() {
                            c6PlaylistHistorySvc.moveTo('n11');
                            expect($log.error).toHaveBeenCalledWith('You tried to move to node n11, but that node is not in the history.');
                        });

                        it('should call playlistCtrl\'s load()', function() {
                            c6PlaylistHistorySvc.moveTo('n2');

                            expect(playlistCtrl.load).toHaveBeenCalledWith('n2', 0, true);
                        });

                        it('should pass on a time to the playlistCtrl if you specify one', function() {
                            c6PlaylistHistorySvc.moveTo('n1', 20);

                            expect(playlistCtrl.load).toHaveBeenCalledWith('n1', 20, true);
                        });

                        it('should set the currentNode.id and currentNode.name and emit the proper kvo events', function() {
                            c6PlaylistHistorySvc.moveTo('n1');

                            expect(c6PlaylistHistorySvc.currentNode.id).toBe('n1');
                            expect(c6PlaylistHistorySvc.currentNode.name).toBe('n1Name');

                            expect(currentNodeIdSpy).toHaveBeenCalledWith('n1');
                            expect(currentNodeNameSpy).toHaveBeenCalledWith('n1Name');
                            expect(currentNodeSpy).toHaveBeenCalledWith(c6PlaylistHistorySvc.currentNode);
                        });

                        it('should increment the index and emit the kvo event', function() {
                            c6PlaylistHistorySvc.moveTo('n1');

                            expect(c6PlaylistHistorySvc.index).toBe(1);
                            expect(indexSpy).toHaveBeenCalledWith(1);
                        });

                        it('should update the currentBranches and emit the kvo event', function() {
                            c6PlaylistHistorySvc.moveTo('n1');
                            $timeout.flush();

                            expect(c6PlaylistHistorySvc.currentBranches).toBe(branches);
                            expect(currentBranchesSpy).toHaveBeenCalledWith(branches);
                        });
                    });

                    describe('getBranches(nodeId)', function() {
                        beforeEach(function() {
                            c6PlaylistHistorySvc.push('n1');
                            c6PlaylistHistorySvc.push('n10');
                            c6PlaylistHistorySvc.push('n5');
                        });

                        it('should get the current branches if no nodeId is supplied', function() {
                            var theseBranches = c6PlaylistHistorySvc.getBranches();

                            expect(theseBranches).toBe(branches);
                            expect(playlistCtrl.getBranchesForNode).toHaveBeenCalledWith('n5');
                        });

                        it('should get specific branches if a nodeId is supplied', function() {
                            var theseBranches = c6PlaylistHistorySvc.getBranches('n10');

                            expect(theseBranches).toBe(branches);
                            expect(playlistCtrl.getBranchesForNode).toHaveBeenCalledWith('n10');
                        });
                    });

                    describe('getHistory()', function() {
                        var history;

                        beforeEach(function() {
                            c6PlaylistHistorySvc.push('n1');
                            c6PlaylistHistorySvc.push('n10');
                            c6PlaylistHistorySvc.push('n5');

                            history = c6PlaylistHistorySvc.getHistory();
                        });

                        it('should get the history', function() {
                            expect(history.size()).toBe(4);
                        });
                    });

                    describe('reset(playlist)', function() {
                        beforeEach(function() {
                            c6PlaylistHistorySvc.push('n1');
                            c6PlaylistHistorySvc.push('n10');
                            c6PlaylistHistorySvc.push('n5');

                            spyOn(c6PlaylistHistorySvc, 'stop');
                            spyOn(c6PlaylistHistorySvc, 'init');
                        });

                        it('should call stop()', function() {
                            c6PlaylistHistorySvc.reset();

                            expect(c6PlaylistHistorySvc.stop).toHaveBeenCalled();
                        });

                        it('should set the index to -1 and emit the kvo event', function() {
                            c6PlaylistHistorySvc.reset();

                            expect(c6PlaylistHistorySvc.index).toBe(-1);
                            expect(indexSpy).toHaveBeenCalledWith(-1);
                        });

                        it('should update the currentBranches and emit the kvo event', function() {
                            c6PlaylistHistorySvc.reset();
                            $timeout.flush();

                            expect(c6PlaylistHistorySvc.currentBranches).toBe(branches);
                            expect(currentBranchesSpy).toHaveBeenCalledWith(branches);
                        });

                        it('should wipe the history', function() {
                            expect(c6PlaylistHistorySvc.getHistory().size()).toBe(4);

                            c6PlaylistHistorySvc.reset();

                            expect(c6PlaylistHistorySvc.getHistory().size()).toBe(0);
                        });

                        it('should call init() with the same playlistCtrl if none is supplied', function() {
                            c6PlaylistHistorySvc.reset();

                            expect(c6PlaylistHistorySvc.init).toHaveBeenCalledWith(playlistCtrl);
                        });

                        it('should call init() with a new playlistCtrl if you supply one', function() {
                            var newPlaylistCtrl = {};

                            c6PlaylistHistorySvc.reset(newPlaylistCtrl);

                            expect(c6PlaylistHistorySvc.init).toHaveBeenCalledWith(newPlaylistCtrl);
                        });
                    });
                });
            });
        });
    });
})();
