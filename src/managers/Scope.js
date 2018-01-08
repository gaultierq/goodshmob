'use strict';
import {currentUserId} from "./CurrentUser";

let React = require('react');
import hoistNonReactStatic from 'hoist-non-react-statics';


function Scope(DecoratedComponent) {
    class Scoped extends React.Component {
        static displayName = `ScopeSafe(${getDisplayName(DecoratedComponent)})`;
        static DecoratedComponent = DecoratedComponent;

        render() {
            //FIXME: not working yet. The wrapped component render is still triggered
            if (!currentUserId()) {
                console.warn("This component cannot be displayed for a unlogged user");
                return null;
            }
            return (
                <DecoratedComponent
                    {...this.props}
                    ref={component => { DecoratedComponent.ref }}
                />
            );
        }
    }
    return hoistNonReactStatic(Scoped, DecoratedComponent)
}

function getDisplayName(Component) {
    return Component.displayName || Component.name || 'Component';
}

module.exports = Scope;