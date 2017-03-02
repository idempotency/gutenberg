/**
 * External dependencies
 */
import { createElement, Component } from 'wp-elements';

import { EditableComponent, EnhancedInputComponent } from 'wp-blocks';
import { serialize } from 'serializers/block';
import EditableFormatToolbar from 'controls/editable-format-toolbar';

export default class QuoteBlockForm extends Component {
	bindContent = ( ref ) => {
		this.content = ref;
	};

	bindCite = ( ref ) => {
		this.cite = ref;
	};

	focus( position ) {
		this.content.focus( position );
	}

	merge = ( block, index ) => {
		const acceptedBlockTypes = [ 'quote', 'paragraph', 'heading' ];
		if ( acceptedBlockTypes.indexOf( block.blockType ) === -1 ) {
			return;
		}

		const getLeaves = children => {
			if ( children.length === 1 && children[ 0 ].name === 'p' ) {
				return getLeaves( children[ 0 ].children );
			}

			return children;
		};

		const { block: { children }, remove, setChildren } = this.props;
		remove( index );
		setTimeout( () => setChildren( getLeaves( children ).concat( getLeaves( block.children ) ) ) );
		setTimeout( () => this.editable.updateContent() );
	}

	moveToCite = () => {
		this.cite.focus( 0 );
	};

	moveToContent = () => {
		this.content.focus();
	};

	bindFormatToolbar = ( ref ) => {
		this.toolbar = ref;
	};

	setToolbarState = ( ...args ) => {
		this.toolbar && this.toolbar.setToolbarState( ...args );
	};

	render() {
		const { block, setChildren, setAttributes, moveUp,
			moveDown, remove, mergeWithPrevious, appendBlock, isFocused } = this.props;
		const { children } = block;
		const cite = block.attrs.cite || '';
		const splitValue = ( left, right ) => {
			setAttributes( { cite: left } );
			appendBlock( {
				type: 'WP_Block',
				blockType: 'paragraph',
				attrs: {},
				startText: '<!-- wp:paragraph -->',
				endText: '<!-- /wp -->',
				rawContent: '<!-- wp:paragraph -->' + right + '<!-- /wp -->',
				children: [ {
					type: 'Text',
					value: right
				} ]
			} );
		};

		return (
			<div>
				{ isFocused &&
					<div className="block-list__block-controls">
						<div className="block-list__block-controls-group">
							<EditableFormatToolbar editable={ this.content } ref={ this.bindFormatToolbar } />
						</div>
					</div>
				}

				<div className="quote-block__form">
					<div className="quote-block__content">
						<EditableComponent
							ref={ this.bindContent }
							content={ serialize( children ) }
							moveUp={ moveUp }
							moveDown={ this.moveToCite }
							mergeWithPrevious={ mergeWithPrevious }
							remove={ remove }
							onChange={ ( value ) => setChildren( value ) }
							setToolbarState={ this.setToolbarState }
							inline
						/>
					</div>
					<div className="quote-block__cite">
						<EnhancedInputComponent
							ref={ this.bindCite }
							moveUp={ this.moveToContent }
							removePrevious={ this.moveToContent }
							moveDown={ moveDown }
							value={ cite }
							splitValue={ splitValue }
							onChange={ ( value ) => setAttributes( { cite: value } ) }
							placeholder="Enter a cite"
						/>
					</div>
				</div>
			</div>
		);
	}
}