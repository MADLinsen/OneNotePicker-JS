import * as React from 'react';

import {SectionRenderStrategy} from './sectionRenderStrategy';
import {ExpandableNodeRenderStrategy} from './treeView/expandableNodeRenderStrategy';
import {ExpandableNode} from './treeView/expandableNode';
import {Constants} from '../constants';
import {SectionGroup} from '../oneNoteDataStructures/sectionGroup';
import {InnerGlobals} from '../props/globalProps';

export class SectionGroupRenderStrategy implements ExpandableNodeRenderStrategy {
	constructor(private sectionGroup: SectionGroup, private globals: InnerGlobals) { }
	
	element(): JSX.Element {
		return (
			<div>
				<div className='picker-icon-left'>
					<img src={require('../images/sectiongroup_icon.png')}/>
				</div>
				<div>
					<label className='ms-fontSize-sPlus'>{this.sectionGroup.name}</label>
				</div>
			</div>);
	}

	onClick() {
		// No additional functionality
	}

	getId(): string {
		return this.sectionGroup.id;
	}

	getChildren(): JSX.Element[] {
		let sectionGroupNodes: ExpandableNodeRenderStrategy[] =
			this.sectionGroup.sectionGroups.map(sectionGroup => new SectionGroupRenderStrategy(sectionGroup, this.globals));
		let sectionGroups = sectionGroupNodes.map(sectionGroup =>
			<ExpandableNode
				expanded={sectionGroup.isExpanded()} node={sectionGroup}
				treeViewId={Constants.TreeView.id} key={sectionGroup.getId()}
				id={sectionGroup.getId()}></ExpandableNode>);

		let sectionNodes: ExpandableNodeRenderStrategy[] =
			this.sectionGroup.sections.map(section => new SectionRenderStrategy(section, this.globals));
		let sections = sectionNodes.map(section =>
			<ExpandableNode
				expanded={section.isExpanded()} node={section}
				treeViewId={Constants.TreeView.id} key={section.getId()}
				id={section.getId()}></ExpandableNode>);

		return sectionGroups.concat(sections);
	}

	isExpanded(): boolean {
		return this.sectionGroup.expanded;
	}
}