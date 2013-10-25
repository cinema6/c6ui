(function() {
    'use strict';

    define(['videos/playlist'], function() {
        describe('playlist',function(){
            var C6PlaylistCtrl,
                $log,
                $scope,
                $httpBackend,
                playlistData,
                playlistData2,
                playlistData3,
                clientClearSpy = jasmine.createSpy('client clear spy');

            beforeEach(function() {
                var n0 = {
                        id: 'n0',
                        name: 'howard',
                        data: 'd0'
                    },
                    n1 = {
                        id: 'n1',
                        name: 'jason',
                        data: 'd1',
                        branches: []
                    },
                    n2 = {
                        id: 'n2',
                        name: 'josh',
                        data: 'd2'
                    },
                    n3 = {
                        id: 'n3',
                        name: 'evan',
                        data: 'd3'
                    },
                    n4 = {
                        id: 'n4',
                        name: 'steph',
                        data: 'd4'
                    };

                module('c6.ui');
                inject(function($controller, $rootScope, _$log_, _$httpBackend_) {
                    $scope = $rootScope.$new();
                    $httpBackend = _$httpBackend_;
                    $log = _$log_;

                    C6PlaylistCtrl = $controller('C6PlaylistController', {
                        $scope: $scope,
                        $log: _$log_
                    });
                });

                playlistData = {
                    tree: {
                        name: 'video1',
                        branches: [
                            {
                                name: 'video2',
                                branches: [
                                    {
                                        name: 'video3',
                                        branches: []
                                    }
                                ]
                            },
                            {
                                name: 'video3',
                                branches: []
                            }
                        ]
                    },
                    data: {
                        video1: {
                            duration: 30,
                            src: 'video1file'
                        },
                        video2: {
                            duration: 14.2,
                            src: 'video2file'
                        },
                        video3: {
                            duration: 10,
                            src: 'video3file'
                        }
                    }
                };

                playlistData2 = {
                    version : '2.0',
                    data: [
                        {
                            id      : 'd0',
                            name    : 'video1',
                            duration: 30,
                            src     : 'video1file'
                        },
                        {
                            id      : 'd1',
                            name    : 'video2',
                            duration: 14.2,
                            src     : 'video2file'
                        },
                        {
                            id      : 'd2',
                            name    : 'video3',
                            duration: 10,
                            src     : 'video3file'
                        }
                    ],
                    nodes : [
                        {
                            id      : 'n0',
                            data    : 'd0',
                            name    : 'video1',
                            parents : [],
                            children: ['n1','n3']
                        },
                        {
                            id      : 'n1',
                            data    : 'd1',
                            name    : 'video2',
                            parents : ['n0'],
                            children: ['n2']
                        },
                        {
                            id      : 'n2',
                            data    : 'd2',
                            name    : 'video3',
                            parents : ['n1'],
                            children: []
                        },
                        {
                            id      : 'n3',
                            data    : 'd2',
                            name    : 'video3',
                            parents : ['n0'],
                            children: []
                        }
                    ]
                };

                playlistData3 = {
                    version : '2.0',
                    data: [
                        {
                            id      : 'pl3_d0',
                            name    : 'pl3_video1',
                            duration: 30,
                            src     : 'video1file'
                        },
                        {
                            id      : 'pl3_d1',
                            name    : 'pl3_video2',
                            duration: 14.2,
                            src     : 'video2file'
                        },
                        {
                            id      : 'pl3_d2',
                            name    : 'pl3_video3',
                            duration: 10,
                            src     : 'video3file'
                        }
                    ],
                    nodes : [
                        {
                            id      : 'pl3_n0',
                            data    : 'pl3_d0',
                            name    : 'pl3_video1',
                            parents : [],
                            children: ['pl3_n1','pl3_n3']
                        },
                        {
                            id      : 'pl3_n1',
                            data    : 'pl3_d1',
                            name    : 'pl3_video2',
                            parents : ['pl3_n0'],
                            children: ['pl3_n2']
                        },
                        {
                            id      : 'pl3_n2',
                            data    : 'pl3_d2',
                            name    : 'pl3_video3',
                            parents : ['pl3_n1'],
                            children: []
                        },
                        {
                            id      : 'pl3_n3',
                            data    : 'pl3_d2',
                            name    : 'pl3_video3',
                            parents : ['pl3_n0'],
                            children: []
                        }
                    ]
                };

                $httpBackend.when('GET', 'playlist.json').respond(playlistData);
                $httpBackend.when('GET', 'playlist2.json').respond(playlistData2);
                $httpBackend.when('GET', 'playlist3.json').respond(playlistData3);
                $httpBackend.when('GET', 'playlist.jso').respond(function() {
                    return [404];
                });

                n1.branches.push('n2', 'n3', 'n4');

                $scope.model.playListDict = {
                    n0: n0,
                    n1: n1,
                    n2: n2,
                    n3: n3,
                    n4: n4
                };

                $scope.model.playListData = {
                    d0: {
                        id   : 'd0',
                        name : 'howard',
                        duration: 100,
                        label: 'the boss man',
                        hitpoints: 'infinite'
                    },
                    d1: {
                        id   : 'd1',
                        name : 'jason',
                        duration: 100,
                        label: 'hockey fanatic'
                    },
                    d2: {
                        id : 'd2',
                        name: 'josh',
                        duration: 20,
                        label: 'he loves JS...'
                    }
                };

                $scope.model.clients = [
                    {
                        node: $scope.model.playListDict.n0,
                        clear : jasmine.createSpy('client0 clear spy')
                    },
                    {
                        node: $scope.model.playListDict.n1,
                        clear : clientClearSpy
                    },
                    {
                        node: $scope.model.playListDict.n2,
                        clear : clientClearSpy
                    },
                    {
                        node: {},
                        clear : clientClearSpy
                    },
                    {
                        node: {},
                        clear : clientClearSpy
                    },
                    {
                        node: {},
                        clear : clientClearSpy
                    }
                ];
            });

            describe('controller', function() {
                it('should exist', function() {
                    expect(C6PlaylistCtrl).toBeDefined();
                });

                describe('scope decoration', function() {
                    describe('properties', function() {
                        it('should setup the scope with a model', function() {
                            expect($scope.model).toBeDefined();
                        });
                    });

                    describe('methods', function() {
                        describe('loadPlayList(params, callback)', function() {
                            var spySuccess,spyError ;

                            beforeEach(function() {
                                spyError   = jasmine.createSpy('loadPlayList error');
                                spySuccess = jasmine.createSpy('loadPlayList success');
                            });

                            describe('failure', function() {
                                beforeEach(function() {
                                    $scope.loadPlayList({ id : 'teamHappy', rqsUrl : 'playlist.jso'}).then(spySuccess,spyError);

                                    $httpBackend.flush();
                                });

                                it('should respond with an error object with error info', function() {
                                    var error = spyError.mostRecentCall.args[0];

                                    expect(error.message).toBe('Failed with: 404');
                                    expect(error.statusCode).toBe(404);
                                });
                            });

                            describe('success', function() {
                                beforeEach(function() {
                                    spyOn(C6PlaylistCtrl, '_compilePlayList');
                                    $scope.loadPlayList({ id : 'teamHappy', rqsUrl : 'playlist.json'}).then(spySuccess,spyError);

                                    $httpBackend.flush();
                                });

                                it('should set the model id to the provided id', function() {
                                    expect($scope.model.id).toBe('teamHappy');
                                });

                                it('should compile the playlist with the server data and the model', function() {
                                    var args = C6PlaylistCtrl._compilePlayList.mostRecentCall.args;

                                    expect(C6PlaylistCtrl._compilePlayList).toHaveBeenCalled();
                                    expect(args[0]).toBe(playlistData);
                                    expect(args[1]).toBe($scope.model);
                                });
                            });
                        });

                        describe('addNodeClient(clientId)', function() {
                            var client;

                            beforeEach(function() {
                                client = $scope.addNodeClient('player1');
                            });

                            it('should return a client', function() {
                                expect(client).toBeDefined();
                            });

                            it('should setup the client with defaults', function() {
                                expect(client.id).toBe('player1');
                                expect(client.active).toBe(false);
                                expect(client.startTime).toBe(0);
                            });

                            it('should add the client to the model\'s clients array', function() {
                                expect($scope.model.clients[6]).toBe(client);
                            });

                            it('should add the client to the model\'s cli object', function() {
                                expect($scope.model.cli.player1).toBe(client);
                            });

                            describe('client methods', function() {
                                describe('clear()', function() {
                                    var testObject;

                                    beforeEach(function() {
                                        testObject = {
                                            test: 'foo'
                                        };

                                        client.active = true;
                                        client.startTime = 24;
                                        client.node = testObject;
                                        client.data = testObject;

                                        expect(client.active).toBe(true);
                                        expect(client.startTime).toBe(24);
                                        expect(client.node).toBe(testObject);
                                        expect(client.data).toBe(testObject);

                                        client.clear();
                                    });

                                    it('should reset data and properties', function() {
                                        expect(client.active).toBe(false);
                                        expect(client.startTime).toBe(0);
                                        expect(client.node).not.toBe(testObject);
                                        expect(client.data).not.toBe(testObject);
                                    });
                                });

                                describe('isTerminal()', function() {
                                    var node;

                                    beforeEach(function() {
                                        node = {
                                            branches: []
                                        };
                                    });

                                    it('should be true if there is no node', function() {
                                        expect(client.isTerminal()).toBe(true);
                                    });

                                    it('should be true if the branches array is empty', function() {
                                        client.node = node;
                                        expect(client.isTerminal()).toBe(true);
                                    });

                                    it('should be false if there is at least one branch in the node', function() {
                                        node.branches.push({});
                                        client.node = node;
                                        expect(client.isTerminal()).toBe(false);
                                    });
                                });
                            });
                        });
                    });
                });

                describe('public interface', function() {
                    beforeEach(function() {
                    });

                    describe('id()', function() {
                        it('should be null when there is no playlist loaded', function() {
                            expect(C6PlaylistCtrl.id()).toBe(null);
                        });

                        it('should be set when a playlist is loaded', function() {
                            $scope.loadPlayList({ id : 'myID', rqsUrl : 'playlist.json'}, function() {});
                            $httpBackend.flush();
                            expect(C6PlaylistCtrl.id()).toBe('myID');
                        });
                    });

                    describe('currentNodeName()', function() {
                        it('should be null if there is no current node', function() {
                            expect(C6PlaylistCtrl.currentNodeName()).toBe(null);
                        });

                        it('should be the name of the model\'s currentNode', function() {
                            $scope.model.currentNode = {
                                name: 'hello!'
                            };

                            expect(C6PlaylistCtrl.currentNodeName()).toBe('hello!');
                        });
                    });
                    
                    describe('rootNodeId()', function() {
                        it('should be null if there is no current node', function() {
                            expect(C6PlaylistCtrl.rootNodeId()).toBe(null);
                        });

                        it('should be the name of the model\'s currentNode', function() {
                            $scope.model.rootNode = {
                                name: 'hello!',
                                id: 'n0'
                            };

                            expect(C6PlaylistCtrl.rootNodeId()).toBe('n0');
                        });
                    });


                    describe('currentNodeId()', function() {
                        it('should be null if there is no current node', function() {
                            expect(C6PlaylistCtrl.currentNodeId()).toBe(null);
                        });

                        it('should be the name of the model\'s currentNode', function() {
                            $scope.model.currentNode = {
                                name: 'hello!',
                                id: 'n0'
                            };

                            expect(C6PlaylistCtrl.currentNodeId()).toBe('n0');
                        });
                    });

                    describe('getCurrentBranches()', function() {
                        var currentBranches;

                        beforeEach(function() {
                            $scope.model.currentNode = {
                                branches: [ 'n1', 'n2', 'n3' ]
                            };

                            currentBranches = C6PlaylistCtrl.getCurrentBranches();
                        });

                        it('should return an array of objects with an id and a name for every branch on the current node.', function() {
                            expect(currentBranches.length).toBe(3);

                            currentBranches.forEach(function(branch, index) {
                                expect(branch.id).toBe($scope.model.currentNode.branches[index]);
                            });
                        });
                    });

                    describe('getBranchesForNode(nodeId)', function() {
                        it('should throw an error if it can\'t find the node', function() {
                            expect(function() {
                                C6PlaylistCtrl.getBranchesForNode('n6');
                            }).toThrow();
                        });

                        it('should return an array of objects with an id and a name for every branch on the node with the given name', function() {
                            var branches = C6PlaylistCtrl.getBranchesForNode('n1');

                            expect(branches.length).toBe(3);

                            branches.forEach(function(branch, index) {
                                expect(branch.id).toBe($scope.model.playListDict.n1.branches[index]);
                            });
                        });
                    });

                    describe('getDataForNode(nodeId)', function() {
                        beforeEach(function() {
                        });

                        it('should return an object with information from the video data and the node', function() {
                            var data = C6PlaylistCtrl.getDataForNode('n1');

                            expect(data.id).toBe('n1');
                            expect(data.name).toBe('jason');
                            expect(data.label).toBe('hockey fanatic');
                            expect(data.duration).toBe(100);
                            expect(data.branches).toEqual(['n2','n3','n4']);
                        });

                    });

                    describe('load(nextNodeId, startTime, andComplete)', function() {
                        var model,
                            loadStartedSpy;

                        beforeEach(function() {
                            model = $scope.model;
                            loadStartedSpy = jasmine.createSpy('loadStarted spy');

                            spyOn(C6PlaylistCtrl, 'completeLoad');
                            spyOn(C6PlaylistCtrl, '_setClientWithNode');

                            $scope.$on('loadStarted', loadStartedSpy);

                            model.currentClient = model.clients[0];
                        });

                        it('should set the model\'s inTrans flag to true', function() {
                            C6PlaylistCtrl.load('n0');
                            expect($scope.model.inTrans).toBe(true);
                        });

                        describe('loading a node that is already mapped to a client', function() {
                            it('should make the client the currentClient', function() {
                                C6PlaylistCtrl.load('n2');

                                expect(model.currentClient).toBe($scope.model.clients[2]);
                            });

                            it('should set the start time to 0 if none is provided', function() {
                                C6PlaylistCtrl.load('n2');

                                expect(model.currentClient.startTime).toBe(0);
                            });

                            it('should set the start time to the provided value', function() {
                                C6PlaylistCtrl.load('n2', 24);

                                expect(model.currentClient.startTime).toBe(24);
                            });

                            it('should $emit the loadStarted event and pass along the currentClient', function() {
                                C6PlaylistCtrl.load('n2');

                                expect(loadStartedSpy).toHaveBeenCalled();
                                expect(loadStartedSpy.mostRecentCall.args[1]).toBe(model.currentClient);
                            });

                            it('should call completeLoad() if the third parameter is true', function() {
                                C6PlaylistCtrl.load('n2', 0, true);

                                expect(C6PlaylistCtrl.completeLoad).toHaveBeenCalled();
                            });
                        });

                        describe('loading a node that isn\'t already mapped to a client', function() {
                            it('should call _setClientWithNode() with the current client and the node', function() {
                                var spy = C6PlaylistCtrl._setClientWithNode;

                                C6PlaylistCtrl.load('n4');

                                expect(spy).toHaveBeenCalled();
                                expect(spy.mostRecentCall.args[0]).toBe(model.currentClient);
                                expect(spy.mostRecentCall.args[1]).toBe(model.playListDict.n4);
                            });

                            it('should set the start time to 0 if none is provided', function() {
                                C6PlaylistCtrl.load('n4');

                                expect(model.currentClient.startTime).toBe(0);
                            });

                            it('should set the start time to the provided value', function() {
                                C6PlaylistCtrl.load('n4', 24);

                                expect(model.currentClient.startTime).toBe(24);
                            });

                            it('should $emit the loadStarted event and pass along the currentClient', function() {
                                C6PlaylistCtrl.load('n4');

                                expect(loadStartedSpy).toHaveBeenCalled();
                                expect(loadStartedSpy.mostRecentCall.args[1]).toBe(model.currentClient);
                            });

                            it('should call completeLoad() if the third parameter is true', function() {
                                C6PlaylistCtrl.load('n4', 0, true);

                                expect(C6PlaylistCtrl.completeLoad).toHaveBeenCalled();
                            });
                        });
                    });

                    describe('completeLoad()', function() {
                        beforeEach(function() {
                            $scope.model.inTrans = true;
                            $scope.model.currentClient = $scope.model.clients[0];

                            spyOn(C6PlaylistCtrl, '_mapNodesToClients');

                            C6PlaylistCtrl.completeLoad();
                        });

                        it('should set the inTrans flag to false', function() {
                            expect($scope.model.inTrans).toBe(false);
                        });

                        it('should set the currentNode to the currentClient\'s node', function() {
                            expect($scope.model.currentNode).toBe($scope.model.currentClient.node);
                        });

                        it('should call _mapNodesToClients() with the current client', function() {
                            expect(C6PlaylistCtrl._mapNodesToClients).toHaveBeenCalled();
                            expect(C6PlaylistCtrl._mapNodesToClients.mostRecentCall.args[0]).toBe($scope.model.currentClient);
                        });
                    });

                    describe('play()', function() {
                        var spy;
                        beforeEach(function() {
                            spy = jasmine.createSpy('play spy');

                            spyOn(C6PlaylistCtrl, 'completeLoad');
                            $scope.$on('play', spy);

                            C6PlaylistCtrl.play();
                        });

                        it('should call completeLoad()', function() {
                            expect(C6PlaylistCtrl.completeLoad).toHaveBeenCalled();
                        });

                        it('should emit the play event', function() {
                            expect(spy).toHaveBeenCalled();
                        });
                    });

                    describe('start()', function() {
                        beforeEach(function() {
                            spyOn($log, 'error');
                            spyOn(C6PlaylistCtrl, 'load');
                        });

                        it('should log an error if there is no playList', function() {
                            C6PlaylistCtrl.start();

                            expect($log.error).toHaveBeenCalled();
                            expect($log.error.mostRecentCall.args[0]).toBe('Must load a playList before starting');
                        });

                        it('should log an error if there are no clients', function() {
                            $scope.model.rootNode = $scope.model.playListDict.n0;
                            $scope.model.clients = [];

                            C6PlaylistCtrl.start();

                            expect($log.error).toHaveBeenCalled();
                            expect($log.error.mostRecentCall.args[0]).toBe('Must load at least one client before starting');
                        });

                        describe('when it should succeed', function() {
                            beforeEach(function() {
                                $scope.model.rootNode = $scope.model.playListDict.n0;

                                C6PlaylistCtrl.start();
                            });

                            it('should set the currentNode to the playList', function() {
                                expect($scope.model.currentNode).toBe($scope.model.rootNode);
                            });

                            it('should set the currentClient to the first client', function() {
                                expect($scope.model.currentClient).toBe($scope.model.clients[0]);
                            });

                            it('should load the first node in the playlist', function() {
                                var args = C6PlaylistCtrl.load.mostRecentCall.args;

                                expect(C6PlaylistCtrl.load).toHaveBeenCalled();
                                expect(args[0]).toBe('n0');
                                expect(args[1]).toBe(0);
                                expect(args[2]).toBe(true);
                            });
                        });
                    });

                    describe('stop()', function() {
                        var spy;

                        beforeEach(function() {
                            spy = jasmine.createSpy('stop event');
                            $scope.$on('stop', spy);

                            C6PlaylistCtrl.stop();
                        });

                        it('should emit the stop event', function() {
                            expect(spy).toHaveBeenCalled();
                        });
                    });
                });

                describe('private interface', function() {
                    describe('_mapNodesToClients()', function() {
                        var spy;

                        beforeEach(function() {
                            spy = spyOn(C6PlaylistCtrl, '_setClientWithNode');

                            $scope.model.currentClient = $scope.model.clients[1];

                            C6PlaylistCtrl._mapNodesToClients();
                        });

                        it('should set the clients\' nodes to the nodes of the currentNode\'s branches', function() {
                            expect(spy.argsForCall[0][0]).toBe($scope.model.clients[0]);
                            expect(spy.argsForCall[0][1]).toBe($scope.model.playListDict.n3);
                            expect(spy.argsForCall[1][0]).toBe($scope.model.clients[3]);
                            expect(spy.argsForCall[1][1]).toBe($scope.model.playListDict.n4);
                            expect(spy.argsForCall[2][0]).toBe($scope.model.clients[4]);
                            expect(spy.argsForCall[2][1]).toBe(null);
                            expect(spy.argsForCall[3][0]).toBe($scope.model.clients[5]);
                            expect(spy.argsForCall[3][1]).toBe(null);
                        });
                    });

                    describe('_setClientWithNode(client, node)', function() {
                        var client;

                        beforeEach(function() {
                            client = $scope.model.clients[0];

                            client.node = undefined;
                            client.clear = jasmine.createSpy('clear spy');
                        });

                        it('should clear the client', function() {
                            C6PlaylistCtrl._setClientWithNode(client, null);

                            expect(client.clear).toHaveBeenCalled();
                        });

                        it('should make the node an object if none is passed in', function() {
                            C6PlaylistCtrl._setClientWithNode(client, null);

                            expect(client.node).toBeDefined();
                        });

                        it('should set the client\'s node to the provided node', function() {
                            C6PlaylistCtrl._setClientWithNode(client, $scope.model.playListDict.n2);

                            expect(client.node).toBe($scope.model.playListDict.n2);
                        });

                        it('should set the client\'s data to the corresponding data for the node if data is found', function() {
                            C6PlaylistCtrl._setClientWithNode(client, $scope.model.playListDict.n0);

                            expect(client.data).toBe($scope.model.playListData.d0);
                        });

                        it('should set the client\'s data to an object if the node has no name', function() {
                            $scope.model.playListDict.n0.name = null;
                            C6PlaylistCtrl._setClientWithNode(client, $scope.model.playListDict.n0);

                            expect(client.data).toBeDefined();
                        });
                    });

                    describe('_compilePlayList(playList, output)', function() {
                        var result = {},
                            resultOfFunction;

                        beforeEach(function() {
                            resultOfFunction = C6PlaylistCtrl._compilePlayList(playlistData, result);
                        });

                        it('should return the provided object to decorate', function() {
                            expect(result).toBe(resultOfFunction);
                        });

                        it('should setup the max number of branches', function() {
                            expect(result.maxBranches).toBe(2);
                        });

                        it('should set the playList property to be the root node', function() {
                            var playlist = result.rootNode;

                            expect(playlist.id).toBe('n0');
                            expect(playlist.name).toBe('video1');
                            expect(playlist.branches.length).toBe(2);
                        });

                        it('should create nodes for the children of a branch', function() {
                            var child = result.playListDict[result.rootNode.branches[0]],
                                grandchild = result.playListDict[child.branches[0]];

                            expect(child.id).toBe('n1');
                            expect(child.name).toBe('video2');
                            expect(child.branches.length).toBe(1);

                            expect(grandchild.id).toBe('n2');
                            expect(grandchild.name).toBe('video3');
                            expect(grandchild.branches.length).toBe(0);
                        });

                        it('should create a playListDict property with a reference to every node by id', function() {
                            var dict = result.playListDict;

                            expect(dict.n0).toBeDefined();
                            expect(dict.n1).toBeDefined();
                            expect(dict.n2).toBeDefined();
                            expect(dict.n3).toBeDefined();
                        });

                        it('should attach the playlist.data to the result', function() {
                            expect(result.playListData.d0).toBeDefined();
                            expect(result.playListData.d1).toBeDefined();
                            expect(result.playListData.d2).toBeDefined();
                            expect(result.playListData.d0.src).toEqual("video1file");
                        });
                    });
                    

                    describe('_compilePlayList(playList, output, urlFunc)', function() {
                        var urlFunc = function(name){
                                return 'http://cdn.example.com/' + name; 
                            },
                            result = {},
                            resultOfFunction;

                        beforeEach(function() {
                            playlistData.data.video1.label = 'awesome';
                            playlistData.data.video1.foo = 'bar';
                            playlistData.data.video1.src = 
                                [ { "type": "video/webm", "src": "video1file.webm" },
                                  { "src": "video1file.mp4"  } ];
                            resultOfFunction = C6PlaylistCtrl._compilePlayList(playlistData, result,urlFunc);
                        });

                        it('should attach the playlist.data to the result', function() {
                            expect(result.playListData).not.toBe(playlistData.data);
                            expect(result.playListData.d0.label).toEqual('awesome');
                            expect(result.playListData.d0.foo).toEqual('bar');
                            expect(result.playListData.d0.duration).toEqual(30);
                            expect(result.playListData.d0.src[0].type).toEqual("video/webm");
                            expect(result.playListData.d0.src[0].src).toEqual("http://cdn.example.com/video1file.webm");
                            expect(result.playListData.d0.src[1].type).not.toBeDefined();
                            expect(result.playListData.d0.src[1].src).toEqual("http://cdn.example.com/video1file.mp4");
                            expect(result.playListData.d1.duration).toEqual(14.2);
                            expect(result.playListData.d1.src).toEqual("http://cdn.example.com/video2file");
                            expect(result.playListData.d2.duration).toEqual(10);
                            expect(result.playListData.d2.src).toEqual("http://cdn.example.com/video3file");
                        });
                    });
                    
                    describe('_compilePlayList2(playList, output)', function() {
                        var result = {},
                            resultOfFunction;

                        beforeEach(function() {
                            resultOfFunction = C6PlaylistCtrl._compilePlayList2(playlistData2, result);
                        });

                        it('should return the provided object to decorate', function() {
                            expect(result).toBe(resultOfFunction);
                        });

                        it('should setup the max number of branches', function() {
                            expect(result.maxBranches).toBe(2);
                        });

                        it('should set the playList property to be the root node', function() {
                            var playlist = result.rootNode;

                            expect(playlist.id).toBe('n0');
                            expect(playlist.name).toBe('video1');
                            expect(playlist.branches.length).toBe(2);
                        });

                        it('should create nodes for the children of a branch', function() {
                            var child = result.playListDict[result.rootNode.branches[0]],
                                grandchild = result.playListDict[child.branches[0]];

                            expect(child.id).toBe('n1');
                            expect(child.name).toBe('video2');
                            expect(child.branches.length).toBe(1);

                            expect(grandchild.id).toBe('n2');
                            expect(grandchild.name).toBe('video3');
                            expect(grandchild.branches.length).toBe(0);
                        });

                        it('should create a playListDict property with a reference to every node by id', function() {
                            var dict = result.playListDict;

                            expect(dict.n0).toBeDefined();
                            expect(dict.n1).toBeDefined();
                            expect(dict.n2).toBeDefined();
                            expect(dict.n3).toBeDefined();
                        });

                        it('should attach the playlist.data to the result', function() {
                            expect(result.playListData.d0).toBeDefined();
                            expect(result.playListData.d1).toBeDefined();
                            expect(result.playListData.d2).toBeDefined();
                            expect(result.playListData.d0.src).toEqual("video1file");
                        });
                    });

                    describe('_compilePlayList2(playList, output, urlFunc)', function() {
                        var urlFunc = function(name){
                                return 'http://cdn.example.com/' + name; 
                            },
                            result = {},
                            resultOfFunction;

                        beforeEach(function() {
                            playlistData2.data[0].label = 'awesome';
                            playlistData2.data[0].foo = 'bar';
                            playlistData2.data[0].src = 
                                [ { "type": "video/webm", "src": "video1file.webm" },
                                  { "src": "video1file.mp4"  } ];
                            resultOfFunction = C6PlaylistCtrl._compilePlayList2(playlistData2, result,urlFunc);
                        });

                        it('should attach the playlist.data to the result', function() {
                            expect(result.playListData.d0.label).toEqual('awesome');
                            expect(result.playListData.d0.foo).toEqual('bar');
                            expect(result.playListData.d0.duration).toEqual(30);
                            expect(result.playListData.d0.src[0].type).toEqual("video/webm");
                            expect(result.playListData.d0.src[0].src).toEqual("http://cdn.example.com/video1file.webm");
                            expect(result.playListData.d0.src[1].type).not.toBeDefined();
                            expect(result.playListData.d0.src[1].src).toEqual("http://cdn.example.com/video1file.mp4");
                            expect(result.playListData.d1.duration).toEqual(14.2);
                            expect(result.playListData.d1.src).toEqual("http://cdn.example.com/video2file");
                            expect(result.playListData.d2.duration).toEqual(10);
                            expect(result.playListData.d2.src).toEqual("http://cdn.example.com/video3file");
                        });
                    });
                });
                describe('loadPlayList(integration)', function() {
                    var loadSuccessSpy, loadErrorSpy, client1,client2,client3;

                    beforeEach(function() {
                        loadSuccessSpy = jasmine.createSpy('loadPlayList success');
                        loadErrorSpy = jasmine.createSpy('loadPlayList error');
                        $scope.model.id               = null;
                        $scope.model.rootNode         = null;
                        $scope.model.playListData     = null;
                        $scope.model.playListDict     = null;
                        $scope.model.currentNode      = null;
                        $scope.model.currentClient    = null;
                        $scope.model.clients          = [];
                        $scope.model.cli              = {};
                        $scope.model.inTrans          = false;
                        $scope.model.ready            = false;
                    });

                    describe('loadPlaylist2', function() {
                        beforeEach(function() {
                            client1 = $scope.addNodeClient('client1');
                            client2 = $scope.addNodeClient('client2');
                            client3 = $scope.addNodeClient('client3');
                            C6PlaylistCtrl.loadPlayList({   id     : 'teamHappy',
                                                            rqsUrl : 'playlist2.json'})
                                .then(loadSuccessSpy,loadErrorSpy);
                            $httpBackend.flush();
                        });

                        it('should correctly setup the model', function() {
                            expect(loadSuccessSpy.callCount).toEqual(1);
                            expect(loadSuccessSpy.argsForCall[0][0]).toEqual('teamHappy');
                            expect(loadErrorSpy.callCount).toEqual(0);
                            expect($scope.model.id).toBe('teamHappy');
                            expect($scope.model.rootNode.id).toEqual('n0');
                            expect($scope.model.playListData).not.toBeNull();
                            expect(Object.keys($scope.model.playListData).length)
                                .toEqual(3);
                            expect($scope.model.playListDict).not.toBeNull();
                            expect(Object.keys($scope.model.playListDict).length)
                                .toEqual(4);
                            expect($scope.model.currentClient).toBeNull();
                            expect($scope.model.currentNode).toBeNull();
                            expect($scope.model.clients.length).toEqual(3);
                            expect(Object.keys($scope.model.cli).length).toEqual(3);
                            expect(client1.node).toEqual({});
                            expect(client2.node).toEqual({});
                            expect(client3.node).toEqual({});
                            expect($scope.model.inTrans).toEqual(false);
                        });

                        it('should populated correctly when started',function(){
                            C6PlaylistCtrl.start();
                            expect($scope.model.currentNode).toBe($scope.model.rootNode);
                            expect($scope.model.currentClient).toBe($scope.model.clients[0]);
                            expect($scope.model.currentClient.node)
                                .toBe($scope.model.rootNode);
                            expect(client1.node.id).toEqual('n0');
                            expect(client2.node.id).toEqual('n1');
                            expect(client3.node.id).toEqual('n3');
                        });

                        describe('and then loadPlaylist3', function(){

                            beforeEach(function(){
                                C6PlaylistCtrl.start();
                                C6PlaylistCtrl.loadPlayList({   id     : 'teamSad',
                                                        rqsUrl : 'playlist3.json'}).then(
                                                        loadSuccessSpy,loadErrorSpy);
                                $httpBackend.flush();
                            });

                            describe('emits',function(){
                                it('loadPlayListPromise is resolved', function() {
                                    expect(loadSuccessSpy.callCount).toEqual(2);
                                    expect(loadSuccessSpy
                                        .argsForCall[1][0]).toEqual('teamSad');
                                } );
                            });

                            describe('initialization',function(){
                                it('should update the model id', function() {
                                    expect($scope.model.id).toBe('teamSad');
                                });

                                it('should update the root node',function(){
                                    expect($scope.model.rootNode.id).toEqual('pl3_n0');
                                });

                                it('should update the playListData',function(){
                                    expect($scope.model.playListData).not.toBeNull();
                                    expect(Object.keys($scope.model.playListData).length)
                                        .toEqual(3);
                                    expect($scope.model.playListData.pl3_d0).toBeDefined();
                                    expect($scope.model.playListData.d0).not.toBeDefined();
                                });

                                it('should update the playListDict',function(){
                                    expect($scope.model.playListDict).not.toBeNull();
                                    expect(Object.keys($scope.model.playListDict).length)
                                        .toEqual(4);
                                    expect($scope.model.playListDict.pl3_n0).toBeDefined();
                                    expect($scope.model.playListDict.n0).not.toBeDefined();
                                });

                                it('should set currentClient to null', function(){
                                    expect($scope.model.currentClient).toBeNull();
                                });

                                it('should set the current node back to null', function(){
                                    expect($scope.model.currentNode).toBeNull();
                                });

                                it('should have the same clients', function(){
                                    expect($scope.model.clients.length).toEqual(3);
                                    expect($scope.model.clients.length).toEqual(3);
                                    expect(Object.keys($scope.model.cli).length).toEqual(3);
                                });

                                it('should set he client nodes to {}', function(){
                                    expect(client1.node).toEqual({});
                                    expect(client2.node).toEqual({});
                                    expect(client3.node).toEqual({});
                                });
                            });
                        });

                    });
                });
            });
            describe('the directive',function(){
                var $compile, $rootScope, $scope, $element, readySpy;

                beforeEach(function(){
                    inject(function(_$compile_,_$rootScope_){
                        $compile    = _$compile_;
                        $rootScope  = _$rootScope_;
                        $scope      = $rootScope.$new();
                        readySpy    = jasmine.createSpy('c6PlayListReady spy');
                        $scope.$on('c6PlayListReady', readySpy);
                    });
                });

                describe('linkage',function(){
                    describe('buffers attribute',function(){
                        it('should default to 1 not set',function(){
                            $element = angular.element(
                                '<div c6-playlist id="main" ' +
                                'x-url="playlist.json">'+
                                '&nbsp;'+
                                '</div>');
                            $compile($element)($scope);
                            $httpBackend.flush();
                            expect($element.find('li').length).toEqual(1);
                            expect(readySpy).toHaveBeenCalled();
                        });
                        it('will use value set',function(){
                            $scope.bufferCount = 3;
                            $element = angular.element(
                                '<div c6-playlist id="main" ' +
                                'x-url="playlist.json"'+
                                'x-buffers="{{bufferCount}}">'+
                                '&nbsp;'+
                                '</div>');
                            $compile($element)($scope);
                            $scope.$digest();
                            $httpBackend.flush();
                            expect($element.find('li').length).toEqual(3);
                            expect(readySpy).toHaveBeenCalled();
                        });
                        it('will cause an exception if NaN value set',function(){
                            $scope.bufferCount = 'tree';
                            $element = angular.element(
                                '<div c6-playlist id="main" ' +
                                'x-url="playlist.json"'+
                                'x-buffers="{{bufferCount}}">'+
                                '&nbsp;'+
                                '</div>');
                            expect(function(){
                                $compile($element)($scope);
                            }).toThrow('buffers property must be passed a number');
                            expect(readySpy).not.toHaveBeenCalled();
                        });
                    });
                    describe('urlFormatter attribute',function(){
                        it('works when used',function(){
                            $scope.urlFunc = jasmine.createSpy('urlFunc Spy');
                            $element = angular.element(
                                '<div c6-playlist id="main" ' +
                                'x-url="playlist.json"'+
                                'x-url-formatter="urlFunc">'  +
                                '&nbsp;'+
                                '</div>');
                            $compile($element)($scope);
                            $scope.$digest();
                            $httpBackend.flush();
                            expect(readySpy).toHaveBeenCalled();
                            expect($scope.urlFunc).toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
})();
