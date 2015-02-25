(function(window) {

    //
    // StateTreeNode
    //

    function StateTreeNode() {
        this._children = [];
    }

    StateTreeNode.prototype.hasMatchingChildWithKeySequence = function(keySequence) {
        return this.getMatchingChildIndexWithKeySequence(keySequence) !== -1;
    };

    StateTreeNode.prototype.getMatchingChildIndexWithKeySequence = function(keySequence) {
        var matchingIndex = -1;

        this._children.forEach(function(child, index) {
            if (child.doesMatchKeySequence(keySequence)) {
                matchingIndex = index;
            }
        });

        return matchingIndex;
    };

    StateTreeNode.prototype.getMatchingChildWithKeySequence = function(keySequence) {
        return this._children[this.getMatchingChildIndexWithKeySequence(keySequence)];
    };

    StateTreeNode.prototype.addChild = function(state) {
        this._children.push(state);
    };

    StateTreeNode.prototype.getChildren = function() {
        return this._children;
    };


    //
    // State
    //

    function State(keyCodes) {
        this._children = [];
        this._keyCodes = keyCodes;
        this._callback = null;
    }

    State.prototype.doesMatchKeySequence = function(keySequence) {
        return this._keyCodes.every(function(keyCode, index) {
            return keySequence.indexOf(keyCode) === index;
        });
    };

    State.prototype.hasMatchingChildWithKeySequence = function(keySequence) {
        return this.getMatchingChildIndexWithKeySequence(keySequence) !== -1;
    };

    State.prototype.getMatchingChildIndexWithKeySequence = function(keySequence) {
        var matchingIndex = -1;

        this._children.forEach(function(child, index) {
            if (child.doesMatchKeySequence(keySequence)) {
                matchingIndex = index;
            }
        });

        return matchingIndex;
    };

    State.prototype.getMatchingChildWithKeySequence = function(keySequence) {
        return this._children[this.getMatchingChildIndexWithKeySequence(keySequence)];
    };

    State.prototype.addChild = function(state) {
        this._children.push(state);
    };

    State.prototype.getKeyCodes = function() {
        return this._keyCodes;
    };

    State.prototype.getChildren = function() {
        return this._children;
    };

    State.prototype.setCallback = function(callback) {
        this._callback = callback;
    };

    State.prototype.getCallback = function() {
        return this._callback;
    };

    State.prototype.hasCallback = function() {
        return this._callback !== null
    };

    //
    // StateTree
    //

    function StateTree() {
        this._rootNode = new StateTreeNode();
    }

    StateTree.prototype.addStateAtIndexPath = function(state, indexPath) {
        if (indexPath.length === 0) {
            this._rootNode.addChild(state);
        } else {
            this.getStateAtIndexPath(indexPath).addChild(state);
        }
    };

    StateTree.prototype.getStateAtIndexPath = function(indexPath) {
        if (indexPath.length === 0) {
            return this._rootNode;
        } else {
            var state = this._rootNode.getChildren()[indexPath[0]];
            for (var i = 1; i < indexPath.length; i++) {
                state = state.getChildren()[indexPath[i]];
            }

            return state;
        }
    };

    var keyCodeMap = {
        "space": 32,
        "enter": 13,
        "return": 13,
        "tab": 9,
        "esc": 27,
        "escape": 27,
        "backspace": 8,
        "shift": 16,
        "control": 17,
        "ctrl": 17,
        "alt": 18,
        "0": 48,
        "1": 49,
        "2": 50,
        "3": 51,
        "4": 52,
        "5": 53,
        "6": 54,
        "7": 55,
        "8": 56,
        "9": 57,
        "left": 37,
        "up": 38,
        "right": 39,
        "down": 40,
        "a": 65,
        "b": 66,
        "c": 67,
        "d": 68,
        "e": 69,
        "f": 70,
        "g": 71,
        "h": 72,
        "i": 73,
        "j": 74,
        "k": 75,
        "l": 76,
        "m": 77,
        "n": 78,
        "o": 79,
        "p": 80,
        "q": 81,
        "r": 82,
        "s": 83,
        "t": 84,
        "u": 85,
        "v": 86,
        "w": 87,
        "x": 88,
        "y": 89,
        "z": 90
    };

    var timeThreshold = 500; //milliseconds
    var timeOfLastPress;
    var cancelEndCurrentDecree;

    var matchingDecreeIndexPath = [];

    var shouldListenForKeys = true;
    var currentInputKeys = [];

    var decreeTree = new StateTree();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    function onKeyDown(keyEvent) {
        currentInputKeys.push(keyEvent.keyCode);

        allowKeySequenceToEndIfNoKeyPressWithinTimeThreshold();
    }

    function allowKeySequenceToEndIfNoKeyPressWithinTimeThreshold() {
        var currentTime = (new Date()).getTime();
        if (currentTime - timeOfLastPress < timeThreshold) {
            clearTimeout(cancelEndCurrentDecree);
        }
        timeOfLastPress = currentTime;

        cancelEndCurrentDecree = setTimeout(listenForNextDecree, timeThreshold);
    }

    function onKeyUp() {
        var lastMatchingState = getLastMatchingState();

        if (shouldListenForKeys && lastMatchingState.hasMatchingChildWithKeySequence(currentInputKeys)) {
            matchingDecreeIndexPath.push(lastMatchingState.getMatchingChildIndexWithKeySequence(currentInputKeys));

            if (getLastMatchingState().hasCallback()) {
                getLastMatchingState().getCallback().call(null);
                listenForNextDecree();
            }
        } else {
            shouldListenForKeys = false;
        }

        currentInputKeys = [];
    }

    function getLastMatchingState() {
        return decreeTree.getStateAtIndexPath(matchingDecreeIndexPath);
    }

    function listenForNextDecree() {
        matchingDecreeIndexPath = [];
        shouldListenForKeys = true;
    }

    function when(key) {
        var newDecreeStateKeySequence = [];
        var newDecreeIndexPath = [];

        newDecreeStateKeySequence.push(keyCodeMap[key]);

        return {
            then: then,
            withModifier: withModifier,
            perform: perform
        };

        function then(key) {
            if (decreeTree.getStateAtIndexPath(newDecreeIndexPath).hasMatchingChildWithKeySequence(newDecreeStateKeySequence)) {
                newDecreeIndexPath.push(decreeTree.getStateAtIndexPath(newDecreeIndexPath).getMatchingChildIndexWithKeySequence(newDecreeStateKeySequence))
            } else {
                decreeTree.getStateAtIndexPath(newDecreeIndexPath).addChild(new State(newDecreeStateKeySequence));
                newDecreeIndexPath.push(decreeTree.getStateAtIndexPath(newDecreeIndexPath).getChildren().length - 1);
            }

            newDecreeStateKeySequence = [keyCodeMap[key]];

            return {
                then: then,
                withModifier: withModifier,
                perform: perform
            };
        }

        function withModifier(key) {
            newDecreeStateKeySequence.splice(0, 0, keyCodeMap[key]);

            return {
                then: then,
                withModifier: withModifier,
                perform: perform
            };
        }

        function perform(callback) {
            if (decreeTree.getStateAtIndexPath(newDecreeIndexPath).hasMatchingChildWithKeySequence(newDecreeStateKeySequence)) {
                decreeTree.getStateAtIndexPath(newDecreeIndexPath).getMatchingChildWithKeySequence(newDecreeStateKeySequence).setCallback(callback);
            } else {
                var newState = new State(newDecreeStateKeySequence);
                newState.setCallback(callback);

                decreeTree.getStateAtIndexPath(newDecreeIndexPath).addChild(newState);
            }
        }
    }

    function config(options) {
        if (options.hasOwnProperty('timeThreshold')) {
            timeThreshold = options.timeThreshold;
        }
    }

    window.decree = {
        when: when,
        config: config
    };


})(window);
