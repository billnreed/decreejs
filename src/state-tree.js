function StateTree() {
    this._rootNode = new StateTreeNode();
}

StateTree.prototype.getStateTreeNodeAtIndexPath = function(indexPath) {
    if (indexPath.length === 0) {
        return this._rootNode;
    } else {
        var stateTreeNode = this._rootNode.getChildren()[indexPath[0]];
        for (var i = 1; i < indexPath.length; i++) {
            stateTreeNode = stateTreeNode.getChildren()[indexPath[i]];
        }

        return stateTreeNode;
    }
};

StateTree.prototype.getStateTreeNodeAtStateIdPath = function(idPath) {
    if (idPath.length === 0) {
        return this._rootNode;
    } else {
        var stateTreeNode = this._rootNode.getChildMatchingStateId(idPath[0]);
        for (var i = 1; i < idPath.length; i++) {
            stateTreeNode = stateTreeNode.getChildMatchingStateId(idPath[i]);
        }

        return stateTreeNode;
    }
};

StateTree.prototype.pruneBranch = function(stateIdPath) {
    for (var i = stateIdPath.length; i > 0; i--) {
        var stateIdPathToCheck = stateIdPath.slice(0, i);

        var stateTreeNode = this.getStateTreeNodeAtStateIdPath(stateIdPathToCheck);
        if (stateTreeNode.getChildren().length === 0 && !stateTreeNode.getState().hasCallback()) {
            this.removeNodeAtStateIdPath(stateIdPathToCheck);
        } else {
            return;
        }
    }
};

StateTree.prototype.removeNodeAtStateIdPath = function(stateIdPath) {
    var parentStateTreeNode = this.getStateTreeNodeAtStateIdPath(stateIdPath.slice(0, stateIdPath.length - 1));
    var stateIdToRemove = stateIdPath[stateIdPath.length - 1];

    parentStateTreeNode.removeChildAtIndex(parentStateTreeNode.getChildIndexMatchingStateId(stateIdToRemove));
};

StateTree.prototype.clear = function() {
    this._rootNode = new StateTreeNode();
};