(function() {
    'use strict';

    define(['videos/playlist'], function() {
        describe('the controller', function() {
            var C6PlaylistCtrl,
                $log,
                $scope,
                $httpBackend,
                playlistData;

            beforeEach(function() {
                var n0 = {
                        id: 'n0',
                        name: 'howard'
                    },
                    n1 = {
                        id: 'n1',
                        name: 'jason',
                        branches: []
                    },
                    n2 = {
                        id: 'n2',
                        name: 'josh',
                        parent: n1
                    },
                    n3 = {
                        id: 'n3',
                        name: 'evan',
                        parent: n1
                    },
                    n4 = {
                        id: 'n4',
                        name: 'steph',
                        parent: n1
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
                            src: 'video1'
                        },
                        video2: {
                            duration: 14.2,
                            src: 'video2'
                        },
                        video3: {
                            duration: 10,
                            src: 'video3'
                        }
                    }
                };

                $httpBackend.when('GET', 'playlist.json').respond(playlistData);
                $httpBackend.when('GET', 'playlist.jso').respond(function() {
                    return [404];
                });

                n1.branches.push(n2, n3, n4);

                $scope.model.playListDict = {
                    n0: n0,
                    n1: n1,
                    n2: n2,
                    n3: n3,
                    n4: n4
                };

                $scope.model.playListData = {
                    howard: {
                        duration: 100,
                        label: 'the boss man'
                    },
                    josh: {
                        duration: 20,
                        label: 'he loves JS...'
                    }
                };

                $scope.model.clients = [
                    {
                        node: $scope.model.playListDict.n0
                    },
                    {
                        node: $scope.model.playListDict.n1
                    },
                    {
                        node: $scope.model.playListDict.n2
                    },
                    {
                        node: null
                    },
                    {
                        node: null
                    },
                    {
                        node: null
                    }
                ];
            });

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
                    describe('setReady()', function() {
                        var spy;

                        beforeEach(function() {
                            spy = jasmine.createSpy('c6PlayListReady spy');

                            $scope.$on('c6PlayListReady', spy);

                            $scope.setReady();
                        });

                        it('should set the model\'s ready flag', function() {
                            expect($scope.model.ready).toBe(true);
                        });

                        it('should emit the c6PlayListReady event and pass along itself', function() {
                            expect(spy).toHaveBeenCalled();
                            expect(spy.mostRecentCall.args[1]).toBe(C6PlaylistCtrl);
                        });
                    });

                    describe('loadPlayList(id, rqsUrl, callback)', function() {
                        var spy;

                        beforeEach(function() {
                            spy = jasmine.createSpy('loadPlayList callback');
                        });

                        describe('failure', function() {
                            beforeEach(function() {
                                $scope.loadPlayList('teamHappy', 'playlist.jso', spy);

                                $httpBackend.flush();
                            });

                            it('should respond with an error object with error info', function() {
                                var error = spy.mostRecentCall.args[0];

                                expect(error.message).toBe('Failed with: 404');
                                expect(error.statusCode).toBe(404);
                            });
                        });

                        describe('success', function() {
                            beforeEach(function() {
                                spyOn(C6PlaylistCtrl, '_compilePlayList');
                                $scope.loadPlayList('teamHappy', 'playlist.json', spy);

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

                            describe('getChildNodeByName(name)', function() {
                                var node;

                                beforeEach(function() {
                                    node = {
                                        branches: [
                                            {
                                                name: 'node1'
                                            },
                                            {
                                                name: 'node2'
                                            },
                                            {
                                                name: 'node3'
                                            }
                                        ]
                                    };
                                });

                                it('should be null if the client has no node', function() {
                                    expect(client.getChildNodeByName('node2')).toBe(null);
                                });

                                it('should get the node with the provided name from the branches array of the client\'s node', function() {
                                    client.node = node;
                                    expect(client.getChildNodeByName('node2')).toBe(node.branches[1]);
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
                        $scope.loadPlayList('myID', 'playlist.json', function() {});
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
                            branches: [
                                {
                                    id: 'n1',
                                    name: 'josh'
                                },
                                {
                                    id: 'n2',
                                    name: 'steph'
                                },
                                {
                                    id: 'n3',
                                    name: 'evan'
                                }
                            ]
                        };

                        currentBranches = C6PlaylistCtrl.getCurrentBranches();
                    });

                    it('should return an array of objects with an id and a name for every branch on the current node.', function() {
                        expect(currentBranches.length).toBe(3);

                        currentBranches.forEach(function(branch, index) {
                            expect(branch.id).toBe($scope.model.currentNode.branches[index].id);
                            expect(branch.name).toBe($scope.model.currentNode.branches[index].name);
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
                            expect(branch.id).toBe($scope.model.playListDict.n1.branches[index].id);
                            expect(branch.name).toBe($scope.model.playListDict.n1.branches[index].name);
                        });
                    });
                });

                describe('getDataForNode(nodeId)', function() {
                    beforeEach(function() {
                    });

                    it('should return an object with information from the video data and the node', function() {
                        var data = C6PlaylistCtrl.getDataForNode('n0');

                        expect(data.id).toBe('n0');
                        expect(data.name).toBe('howard');
                        expect(data.label).toBe('the boss man');
                        expect(data.duration).toBe(100);
                        expect(data.siblings.length).toBe(0);
                    });

                    it('should contain data about its siblings if it has them', function() {
                        var data = C6PlaylistCtrl.getDataForNode('n2');

                        expect(data.id).toBe('n2');
                        expect(data.name).toBe('josh');
                        expect(data.label).toBe('he loves JS...');
                        expect(data.duration).toBe(20);
                        expect(data.siblings.length).toBe(2);

                        data.siblings.forEach(function(branch, index) {
                            expect(branch.id).toBe($scope.model.playListDict['n' + (index + 3)].id);
                            expect(branch.name).toBe($scope.model.playListDict['n' + (index + 3)].name);
                        });
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
                        $scope.model.playList = $scope.model.playListDict.n0;
                        $scope.model.clients = [];

                        C6PlaylistCtrl.start();

                        expect($log.error).toHaveBeenCalled();
                        expect($log.error.mostRecentCall.args[0]).toBe('Must load at least one client before starting');
                    });

                    describe('when it should succeed', function() {
                        beforeEach(function() {
                            $scope.model.playList = $scope.model.playListDict.n0;

                            C6PlaylistCtrl.start();
                        });

                        it('should set the currentNode to the playList', function() {
                            expect($scope.model.currentNode).toBe($scope.model.playList);
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

                        expect(client.data).toBe($scope.model.playListData.howard);
                    });

                    it('should set the client\'s data to an object if the node has no name', function() {
                        $scope.model.playListDict.n4.name = null;
                        C6PlaylistCtrl._setClientWithNode(client, $scope.model.playListDict.n4);

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
                        var playlist = result.playList;

                        expect(playlist.id).toBe('n0');
                        expect(playlist.name).toBe('video1');
                        expect(playlist.parent).toBe(null);
                        expect(playlist.branches.length).toBe(2);
                    });

                    it('should create nodes for the children of a branch', function() {
                        var child = result.playList.branches[0],
                            grandchild = child.branches[0];

                        expect(child.id).toBe('n1');
                        expect(child.name).toBe('video2');
                        expect(child.parent).toBe(result.playList);
                        expect(child.branches.length).toBe(1);

                        expect(grandchild.id).toBe('n2');
                        expect(grandchild.name).toBe('video3');
                        expect(grandchild.parent).toBe(child);
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
                        expect(result.playListData).toBe(playlistData.data);
                    });
                });
            });
        });
    });
})();